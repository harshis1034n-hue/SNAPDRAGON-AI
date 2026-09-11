"""
SnapSafe AI - Sensitive Detection Engine
Coordinates OCR output with pattern recognition, entropy analysis,
QR code detection, and precise bounding box spatial mapping.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import uuid
import numpy as np

from app.ocr.base import OCRResult, OCRToken, BoundingBox
from app.detection.rules import scan_text_patterns
from app.detection.qr_detector import LocalQRCodeDetector


@dataclass
class DetectedEntity:
    """A classified sensitive item with coordinates, risk level, and metadata."""
    id: str
    type: str
    display_name: str
    value: str
    confidence: float
    risk: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    action: str  # "MASK", "WARN", "REVIEW"
    bounding_box: BoundingBox
    category: str
    token_index: int = 0
    masked_value: str = ""
    is_masked: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "displayName": self.display_name,
            "value": self.value,
            "maskedValue": self.masked_value or self._generate_masked_preview(),
            "confidence": round(float(self.confidence), 4),
            "risk": self.risk,
            "action": self.action,
            "boundingBox": self.bounding_box.to_dict(),
            "category": self.category,
            "isMasked": self.is_masked
        }

    def _generate_masked_preview(self) -> str:
        """Generate a user-friendly asterisk mask."""
        val = self.value
        if len(val) <= 4:
            return "*" * len(val)
        if self.type == "EMAIL":
            parts = val.split("@")
            if len(parts) == 2:
                name, dom = parts
                masked_name = name[0] + "*" * (len(name) - 1) if len(name) > 1 else "*"
                return f"{masked_name}@{dom}"
        elif self.type in ["API_KEY", "ACCESS_TOKEN", "PASSWORD"]:
            return "*" * min(24, len(val))
        elif self.type == "CREDIT_CARD":
            clean = val.replace(" ", "").replace("-", "")
            return f"****-****-****-{clean[-4:]}" if len(clean) >= 4 else "****************"
        elif self.type in ["PHONE", "STUDENT_ID", "EMPLOYEE_ID"]:
            return val[:3] + "*" * (len(val) - 5) + val[-2:] if len(val) >= 5 else "*" * len(val)
        elif self.type == "QR_CODE":
            return "[REDACTED QR MATRIX]"

        return "*" * len(val)


class DetectionEngine:
    """
    Analyzes OCR results to locate sensitive entities and their bounding boxes.
    """

    def __init__(self, category_filter: Optional[List[str]] = None):
        self.category_filter = category_filter
        self._qr_detector = LocalQRCodeDetector()

    def detect_entities(self, ocr_result: OCRResult, image_np: Optional[np.ndarray] = None) -> List[DetectedEntity]:
        detected_entities: List[DetectedEntity] = []
        
        # 1. Scan individual tokens for localized bounding boxes
        for token_idx, token in enumerate(ocr_result.tokens):
            token_text = token.text.strip()
            if not token_text:
                continue

            matches = scan_text_patterns(token_text)
            for m in matches:
                if self.category_filter and m["category"] not in self.category_filter:
                    continue

                entity_id = f"det-{uuid.uuid4().hex[:8]}"
                entity = DetectedEntity(
                    id=entity_id,
                    type=m["type"],
                    display_name=m["displayName"],
                    value=m["value"],
                    confidence=m["confidence"],
                    risk=m["risk"],
                    action=m["action"],
                    bounding_box=token.bounding_box,
                    category=m["category"],
                    token_index=token_idx,
                    is_masked=True
                )
                entity.masked_value = entity._generate_masked_preview()
                detected_entities.append(entity)

        # 2. Also scan full text for multi-token spans (e.g., card numbers or addresses split across tokens)
        full_matches = scan_text_patterns(ocr_result.full_text)
        for fm in full_matches:
            val = fm["value"]
            already_caught = any(d.value == val or val in d.value for d in detected_entities)
            if not already_caught:
                matched_bbox = BoundingBox(0, 0, 100, 30)
                for t in ocr_result.tokens:
                    if any(part in t.text for part in val.split() if len(part) > 3):
                        matched_bbox = t.bounding_box
                        break

                entity_id = f"det-{uuid.uuid4().hex[:8]}"
                entity = DetectedEntity(
                    id=entity_id,
                    type=fm["type"],
                    display_name=fm["displayName"],
                    value=val,
                    confidence=fm["confidence"],
                    risk=fm["risk"],
                    action=fm["action"],
                    bounding_box=matched_bbox,
                    category=fm["category"],
                    is_masked=True
                )
                entity.masked_value = entity._generate_masked_preview()
                detected_entities.append(entity)

        # 3. If image buffer is provided, detect any on-screen QR codes
        if image_np is not None:
            qr_items = self._qr_detector.detect_qr_codes(image_np)
            for q in qr_items:
                if self.category_filter and q["category"] not in self.category_filter:
                    continue
                entity_id = f"det-{uuid.uuid4().hex[:8]}"
                entity = DetectedEntity(
                    id=entity_id,
                    type=q["type"],
                    display_name=q["displayName"],
                    value=q["value"],
                    confidence=q["confidence"],
                    risk=q["risk"],
                    action=q["action"],
                    bounding_box=q["boundingBox"],
                    category=q["category"],
                    is_masked=True
                )
                entity.masked_value = entity._generate_masked_preview()
                detected_entities.append(entity)

        return detected_entities
