"""
SnapSafe AI - Synthetic OCR Provider
Used for instant, deterministic testing and demo scenarios.
Provides ground-truth bounding boxes for synthetic test documents.
"""

from typing import Any, Dict, List
from app.ocr.base import BaseOCRProvider, OCRResult, OCRToken, BoundingBox


class SyntheticOCRProvider(BaseOCRProvider):
    """
    Simulated on-device OCR provider for demo calibration and unit tests.
    """

    def __init__(self):
        self.engine_name = "Synthetic Ground-Truth OCR"
        self.device_target = "Local In-Memory"

    def extract_text(self, image_input: Any) -> OCRResult:
        # Standard synthetic tokens for the competition demo scenario
        demo_tokens = [
            OCRToken("STUDENT PRIVACY PORTAL - UNIVERSITY ADMISSIONS", 0.99, BoundingBox(40, 30, 480, 24), 0, 0),
            OCRToken("Student Name: Sarah Jenkins", 0.98, BoundingBox(40, 80, 220, 20), 1, 1),
            OCRToken("Email: sarah.jenkins@campus-edu.org", 0.99, BoundingBox(40, 115, 290, 20), 2, 2),
            OCRToken("Contact Phone: +91 98450 23145", 0.97, BoundingBox(40, 150, 260, 20), 3, 3),
            OCRToken("Student ID: STU-2026-98144", 0.98, BoundingBox(40, 185, 230, 20), 4, 4),
            OCRToken("Residential Address: 42 Elm Street, Apt 3B, New York, NY", 0.94, BoundingBox(40, 220, 420, 20), 5, 5),
            OCRToken("Internal Access Key: sk-live_994a8f102c9de08bfa17c5e2", 0.99, BoundingBox(40, 270, 440, 22), 6, 6),
            OCRToken("CONFIDENTIAL: Candidate under evaluation for Dean's scholarship", 0.96, BoundingBox(40, 310, 520, 20), 7, 7),
            OCRToken("Payment Card on File: 4532 0192 8374 2109", 0.99, BoundingBox(40, 350, 350, 20), 8, 8),
            OCRToken("Portal Password: TempPwd#2026!Secure", 0.97, BoundingBox(40, 390, 290, 20), 9, 9),
        ]

        full_text = "\n".join([t.text for t in demo_tokens])
        return OCRResult(
            full_text=full_text,
            tokens=demo_tokens,
            engine_name=self.engine_name,
            inference_time_ms=1.4,
            device_target=self.device_target
        )

    def get_hardware_info(self) -> Dict[str, Any]:
        return {
            "engine": self.engine_name,
            "deviceTarget": self.device_target,
            "isLocalOnly": True,
            "cloudUploadEnabled": False
        }
