"""
SnapSafe AI - Local QR Code Detector
Uses OpenCV on-device QRCodeDetector to identify 2D barcodes and matrices
that may contain authentication tokens, WiFi credentials, 2FA seeds, or payment URIs.
"""

from typing import List, Dict, Any
import numpy as np
import cv2
from app.ocr.base import BoundingBox


class LocalQRCodeDetector:
    """
    Scans image frames locally for QR codes and returns bounding boxes and decoded payload summaries.
    """

    def __init__(self):
        self._detector = cv2.QRCodeDetector()

    def detect_qr_codes(self, img_bgr: np.ndarray) -> List[Dict[str, Any]]:
        detections = []
        try:
            # OpenCV multi-QR detection
            retval, decoded_info, points, _ = self._detector.detectAndDecodeMulti(img_bgr)
            if retval and points is not None:
                for idx, (text, pts) in enumerate(zip(decoded_info, points)):
                    if pts is not None and len(pts) >= 4:
                        xs = [p[0] for p in pts]
                        ys = [p[1] for p in pts]
                        min_x = max(0, int(min(xs)))
                        min_y = max(0, int(min(ys)))
                        max_x = int(max(xs))
                        max_y = int(max(ys))
                        bbox = BoundingBox(
                            x=min_x,
                            y=min_y,
                            width=max(10, max_x - min_x),
                            height=max(10, max_y - min_y)
                        )

                        # Classify risk based on payload
                        payload = text.strip() if text else "Scannable 2D Barcode / Matrix"
                        is_auth_or_secret = any(k in payload.lower() for k in ["otpauth", "token", "key", "pass", "wifi", "upi", "pay"])
                        risk = "CRITICAL" if is_auth_or_secret else "HIGH"

                        detections.append({
                            "type": "QR_CODE",
                            "displayName": "QR Code (Authentication / URL)",
                            "value": payload,
                            "confidence": 0.98,
                            "risk": risk,
                            "action": "MASK",
                            "category": "credentials" if is_auth_or_secret else "pii",
                            "boundingBox": bbox
                        })
        except Exception as e:
            # Graceful non-fatal fallback
            pass

        return detections
