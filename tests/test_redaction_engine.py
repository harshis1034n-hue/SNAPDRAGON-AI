"""
Unit tests for SnapSafe AI Image Redaction Engine (Blur, Pixelate, Blackout).
"""

import pytest
import sys
import os
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ocr.base import BoundingBox
from app.detection.engine import DetectedEntity
from app.redaction.engine import RedactionEngine


def test_redaction_styles():
    # Create synthetic test image 200x200
    img = np.full((200, 200, 3), 200, dtype=np.uint8)
    
    entity = DetectedEntity(
        id="det-1",
        type="API_KEY",
        display_name="API Key",
        value="sk-demo_key",
        confidence=0.99,
        risk="CRITICAL",
        action="MASK",
        bounding_box=BoundingBox(20, 20, 100, 30),
        category="credentials",
        is_masked=True
    )

    for style in ["blur", "pixelate", "blackout"]:
        res = RedactionEngine.apply_redaction(img, [entity], redaction_style=style)
        assert res["maskedCount"] == 1
        assert res["style"] == style
        assert res["dataUri"].startswith("data:image/png;base64,")
        assert len(res["bytes"]) > 0
