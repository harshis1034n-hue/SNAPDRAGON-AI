"""
SnapSafe AI - False Positive & Negative Rigor Tests
Verifies that:
1. Normal text does NOT become CRITICAL.
2. Random 16-digit non-card numbers are NOT classified as payment cards.
3. Generic public URLs are NOT classified as high risk.
"""

import pytest
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.detection.rules import scan_text_patterns
from app.detection.entropy import luhn_checksum_valid


def test_normal_text_does_not_trigger_critical():
    benign_text = "Welcome to the general university symposium held in Hall B on Friday."
    detections = scan_text_patterns(benign_text)
    assert len(detections) == 0


def test_generic_url_not_high_risk():
    text_with_url = "Visit https://qualcomm.com or https://hp.com for product news."
    detections = scan_text_patterns(text_with_url)
    # Generic URLs without credentials must not be flagged as CRITICAL credentials
    critical_items = [d for d in detections if d["risk"] == "CRITICAL"]
    assert len(critical_items) == 0


def test_random_16_digit_numbers_fail_luhn():
    # Load fixtures
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "synthetic_samples.json")
    with open(fixture_path, "r") as f:
        data = json.load(f)

    for invalid_card in data["malformedCards"]:
        # Must fail Luhn
        assert luhn_checksum_valid(invalid_card) is False
        # Must not be flagged as CREDIT_CARD
        detections = scan_text_patterns(f"ID reference: {invalid_card}")
        cards = [d for d in detections if d["type"] == "CREDIT_CARD"]
        assert len(cards) == 0


def test_private_message_context():
    sample = "Professor remark: Private Message: Please verify thesis funding approval."
    detections = scan_text_patterns(sample)
    msgs = [d for d in detections if d["type"] == "PRIVATE_MESSAGE"]
    assert len(msgs) == 1
    assert msgs[0]["risk"] == "HIGH"
