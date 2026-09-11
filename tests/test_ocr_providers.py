"""
Unit tests for SnapSafe AI On-Device OCR Providers (Base, RapidOCR, Qualcomm AI Hub, Synthetic).
"""

import pytest
import sys
import os
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ocr.base import BoundingBox
from app.ocr.synthetic_ocr import SyntheticOCRProvider
from app.ocr.qualcomm_aihub_ocr import QualcommAIHubOCRProvider
from app.ocr.factory import get_ocr_provider


def test_bounding_box_from_points():
    points = [[10.0, 20.0], [50.0, 20.0], [50.0, 60.0], [10.0, 60.0]]
    bbox = BoundingBox.from_points(points)
    assert bbox.x == 10
    assert bbox.y == 20
    assert bbox.width == 40
    assert bbox.height == 40


def test_synthetic_ocr_provider():
    synth = SyntheticOCRProvider()
    res = synth.extract_text(None)
    assert len(res.tokens) > 5
    assert "SARAH JENKINS" in res.full_text.upper()
    assert res.engine_name == "Synthetic Ground-Truth OCR"


def test_qualcomm_aihub_provider_abstraction():
    q_provider = QualcommAIHubOCRProvider()
    info = q_provider.get_hardware_info()
    assert "engine" in info
    assert "architecture" in info
    assert "Qualcomm AI Hub" in info["architecture"]
    # Verify fallback is functional
    test_img = np.full((100, 200, 3), 255, dtype=np.uint8)
    res = q_provider.extract_text(test_img)
    assert res is not None


def test_ocr_factory():
    provider_synth = get_ocr_provider("synthetic")
    assert isinstance(provider_synth, SyntheticOCRProvider)

    provider_q = get_ocr_provider("qualcomm_aihub")
    assert isinstance(provider_q, QualcommAIHubOCRProvider)
