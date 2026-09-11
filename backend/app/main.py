"""
SnapSafe AI - FastAPI Local Backend Server
"See it. Detect it. Protect it. Before you share it."
100% On-Device Privacy Firewall for Snapdragon AI PCs.
"""

import io
import os
import base64
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from app.ocr.factory import get_ocr_provider
from app.detection.engine import DetectionEngine, DetectedEntity
from app.ocr.base import BoundingBox
from app.risk.engine import RiskEngine
from app.risk.coach import PrivacyCoach
from app.redaction.engine import RedactionEngine
from app.hardware.snapdragon_profiler import SnapdragonProfiler
from app.history.store import HistoryStore
from app.demo.generator import DemoGenerator
from app.screen.capture import ScreenCaptureManager

app = FastAPI(
    title="SnapSafe AI Local Engine",
    description="Privacy firewall and on-device sensitive data detector for Snapdragon AI PCs",
    version="1.0.0"
)

# Enable CORS for local desktop & Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

history_store = HistoryStore()
privacy_coach = PrivacyCoach()


class ScanRequest(BaseModel):
    imageBase64: str
    ocrProvider: Optional[str] = "auto"
    categoryFilter: Optional[List[str]] = None


class RedactRequest(BaseModel):
    imageBase64: str
    entities: List[Dict[str, Any]]
    redactionStyle: Optional[str] = "blur"  # "blur", "pixelate", "blackout"
    logToHistory: Optional[bool] = True


class BenchmarkRequest(BaseModel):
    iterations: Optional[int] = 3


@app.get("/")
def root():
    return {
        "app": "SnapSafe AI",
        "tagline": "See it. Detect it. Protect it. Before you share it.",
        "status": "Online",
        "mode": "Local On-Device Inference",
        "zeroCloudGuarantee": True,
        "docsUrl": "/docs"
    }


@app.get("/api/health")
def health_check():
    hw = SnapdragonProfiler.get_system_hardware_info()
    metrics = history_store.get_privacy_center_metrics()
    return {
        "status": "HEALTHY",
        "protectionActive": True,
        "timestamp": time.time(),
        "hardware": hw,
        "metrics": metrics,
        "cloudDataEgressBytes": 0
    }


@app.get("/api/hardware")
def get_hardware_status():
    return SnapdragonProfiler.get_system_hardware_info()


@app.post("/api/benchmark/run")
def run_benchmark(req: BenchmarkRequest = BenchmarkRequest()):
    return SnapdragonProfiler.run_local_benchmark(iterations=req.iterations or 3)


@app.get("/api/demo/generate")
def generate_demo():
    """Returns a synthetic student portal screen with guaranteed fake synthetic data."""
    demo_data = DemoGenerator.generate_demo_portal_image()
    return demo_data


@app.get("/api/screen/monitors")
def get_monitors():
    return ScreenCaptureManager.get_monitors_info()


@app.post("/api/screen/capture")
def capture_desktop_screen(monitorIndex: int = 1):
    res = ScreenCaptureManager.capture_screen(monitor_index=monitorIndex)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to capture display"))
    return res


@app.post("/api/scan")
def scan_screen(req: ScanRequest):
    """
    Core on-device detection pipeline:
    1. Decode image locally in memory
    2. Run local OCR (RapidOCR ONNX / Qualcomm AI Hub / Synthetic)
    3. Run sensitive data classification
    4. Calculate risk scores and privacy assessment
    5. Generate contextual Privacy Coach explanations
    """
    start_time = time.perf_counter()
    
    # 1. Decode base64
    raw_b64 = req.imageBase64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(raw_b64)
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

    # 2. Local OCR Text Extraction
    provider = get_ocr_provider(req.ocrProvider or "auto")
    ocr_result = provider.extract_text(pil_img)

    # 3. Sensitive Data Classification (Tokens, Regex, Luhn, Entropy & Local QR detection)
    import cv2
    import numpy as np
    img_np = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    detector = DetectionEngine(category_filter=req.categoryFilter)
    detected_entities = detector.detect_entities(ocr_result, img_np)

    # 4. Risk Engine Assessment
    risk_assessment = RiskEngine.calculate_assessment(detected_entities)

    # 5. Enrich with Privacy Coach Explanations
    enriched_entities = []
    for entity in detected_entities:
        ed = entity.to_dict()
        coach_advice = privacy_coach.explain(entity.type)
        ed["coachAdvice"] = coach_advice
        enriched_entities.append(ed)

    total_pipeline_time_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "success": True,
        "imageWidth": pil_img.width,
        "imageHeight": pil_img.height,
        "ocrEngine": ocr_result.engine_name,
        "deviceTarget": ocr_result.device_target,
        "ocrInferenceTimeMs": ocr_result.inference_time_ms,
        "totalPipelineTimeMs": round(total_pipeline_time_ms, 2),
        "totalEntitiesDetected": len(enriched_entities),
        "entities": enriched_entities,
        "riskAssessment": risk_assessment,
        "zeroCloudGuarantee": True,
        "cloudBytesTransmitted": 0
    }


@app.post("/api/redact")
def redact_image(req: RedactRequest):
    """
    Applies real blur, pixelation, or blackout on specified bounding boxes.
    Outputs protected PNG image for safe sharing.
    """
    raw_b64 = req.imageBase64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

    # Reconstruct DetectedEntity instances
    entities_to_mask = []
    categories_set = set()
    highest_risk = "LOW"
    risk_hierarchy = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

    for item in req.entities:
        bbox_dict = item.get("boundingBox", {})
        bbox = BoundingBox(
            x=bbox_dict.get("x", 0),
            y=bbox_dict.get("y", 0),
            width=bbox_dict.get("width", 100),
            height=bbox_dict.get("height", 30)
        )
        risk = item.get("risk", "MEDIUM")
        if risk_hierarchy.get(risk, 1) > risk_hierarchy.get(highest_risk, 1):
            highest_risk = risk

        cat = item.get("category", "pii")
        categories_set.add(cat)

        entity = DetectedEntity(
            id=item.get("id", "0"),
            type=item.get("type", "UNKNOWN"),
            display_name=item.get("displayName", "Item"),
            value=item.get("value", ""),
            confidence=item.get("confidence", 0.95),
            risk=risk,
            action=item.get("action", "MASK"),
            bounding_box=bbox,
            category=cat,
            is_masked=item.get("isMasked", True)
        )
        entities_to_mask.append(entity)

    # Apply redaction
    redaction_result = RedactionEngine.apply_redaction(
        image_input=img_bytes,
        entities_to_mask=entities_to_mask,
        redaction_style=req.redactionStyle or "blur"
    )

    # Calculate post-redaction risk assessment
    masked_ids = [e.id for e in entities_to_mask if e.is_masked]
    assessment = RiskEngine.calculate_assessment(entities_to_mask, active_masking_ids=masked_ids)

    # Log metadata to local history if requested
    if req.logToHistory and len(entities_to_mask) > 0:
        history_store.log_scan(
            detection_count=len(entities_to_mask),
            highest_risk=highest_risk,
            action_taken=f"{redaction_result['maskedCount']} items {req.redactionStyle.lower()}ed",
            items_masked=redaction_result['maskedCount'],
            categories=list(categories_set),
            risk_before=assessment["privacyRiskRaw"],
            risk_after=assessment["privacyRiskAfter"]
        )

    return {
        "success": True,
        "protectedImageUri": redaction_result["dataUri"],
        "maskedCount": redaction_result["maskedCount"],
        "redactionStyle": redaction_result["style"],
        "assessment": assessment,
        "cloudBytesTransmitted": 0
    }


@app.get("/api/history")
def get_history():
    history_items = history_store.get_history()
    metrics = history_store.get_privacy_center_metrics()
    return {
        "history": history_items,
        "metrics": metrics
    }


@app.post("/api/history/clear")
def clear_history():
    history_store.clear_history()
    return {"success": True, "message": "History cleared"}


@app.get("/api/coach/explain/{entity_type}")
def get_coach_explanation(entity_type: str):
    return privacy_coach.explain(entity_type)
