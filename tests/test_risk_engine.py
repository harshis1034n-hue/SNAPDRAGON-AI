"""
Unit tests for SnapSafe AI Risk Assessment Engine & Privacy Scoring.
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ocr.base import BoundingBox
from app.detection.engine import DetectedEntity
from app.risk.engine import RiskEngine
from app.risk.coach import PrivacyCoach


def test_risk_assessment_calculation():
    entities = [
        DetectedEntity("1", "API_KEY", "API Key", "sk-12345", 0.99, "CRITICAL", "MASK", BoundingBox(0, 0, 10, 10), "credentials", is_masked=True),
        DetectedEntity("2", "PASSWORD", "Password", "secret", 0.98, "CRITICAL", "MASK", BoundingBox(0, 0, 10, 10), "credentials", is_masked=True),
        DetectedEntity("3", "STUDENT_ID", "Student ID", "STU-123", 0.95, "HIGH", "MASK", BoundingBox(0, 0, 10, 10), "pii", is_masked=True),
        DetectedEntity("4", "EMAIL", "Email", "test@campus.edu", 0.99, "MEDIUM", "MASK", BoundingBox(0, 0, 10, 10), "pii", is_masked=True)
    ]

    # When all are masked
    assessment = RiskEngine.calculate_assessment(entities, active_masking_ids=["1", "2", "3", "4"])
    assert assessment["totalDetected"] == 4
    assert assessment["totalMasked"] == 4
    assert assessment["criticalCount"] == 2
    assert assessment["highCount"] == 1
    assert assessment["mediumCount"] == 1
    assert assessment["privacyRiskRaw"] > 80
    assert assessment["privacyRiskAfter"] == 0
    assert assessment["privacyScoreAfter"] == 100
    assert assessment["isSafeToShare"] is True

    # When none are masked
    unmasked = RiskEngine.calculate_assessment(entities, active_masking_ids=[])
    assert unmasked["privacyRiskAfter"] > 80
    assert unmasked["privacyScoreAfter"] < 20
    assert unmasked["isSafeToShare"] is False


def test_privacy_coach_explanation():
    coach = PrivacyCoach()
    api_key_advice = coach.explain("API_KEY")
    assert "credential" in api_key_advice["title"].lower()
    assert "mask" in api_key_advice["recommendation"].lower()

    email_advice = coach.explain("EMAIL")
    assert "phishing" in email_advice["whyRisky"].lower() or "spam" in email_advice["whyRisky"].lower()
