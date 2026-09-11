"""
Unit tests for SnapSafe AI Sensitive Data Detection Rules & Validators.
"""

import pytest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.detection.rules import scan_text_patterns
from app.detection.entropy import calculate_shannon_entropy, luhn_checksum_valid


def test_shannon_entropy():
    # Low entropy natural words
    low_ent = calculate_shannon_entropy("hello world")
    assert low_ent < 3.0

    # High entropy random cryptographic key
    high_ent = calculate_shannon_entropy("sk-live_994a8f102c9de08bfa17c5e2")
    assert high_ent > 3.2


def test_luhn_checksum_valid():
    # Valid Visa card sample (test number)
    assert luhn_checksum_valid("4532019283742103") is True
    # Invalid card number
    assert luhn_checksum_valid("4532019283742100") is False
    # Short length
    assert luhn_checksum_valid("12345") is False


def test_email_detection():
    sample = "Please send records to sarah.jenkins@campus-edu.org for review."
    detections = scan_text_patterns(sample)
    emails = [d for d in detections if d["type"] == "EMAIL"]
    assert len(emails) == 1
    assert emails[0]["value"] == "sarah.jenkins@campus-edu.org"
    assert emails[0]["risk"] == "MEDIUM"
    assert emails[0]["action"] == "MASK"


def test_phone_detection():
    sample = "Emergency contact number: +91 98450 23145 or 9845023145."
    detections = scan_text_patterns(sample)
    phones = [d for d in detections if d["type"] == "PHONE"]
    assert len(phones) >= 1
    assert phones[0]["risk"] == "HIGH"


def test_api_key_detection():
    sample = "Use OPENAI_API_KEY=sk-live_994a8f102c9de08bfa17c5e2 for local inference."
    detections = scan_text_patterns(sample)
    keys = [d for d in detections if d["type"] == "API_KEY"]
    assert len(keys) >= 1
    assert "sk-live" in keys[0]["value"]
    assert keys[0]["risk"] == "CRITICAL"


def test_password_detection():
    sample = "Account password: TempPwd#2026!Secure in database."
    detections = scan_text_patterns(sample)
    passwords = [d for d in detections if d["type"] == "PASSWORD"]
    assert len(passwords) >= 1
    assert passwords[0]["value"] == "TempPwd#2026!Secure"
    assert passwords[0]["risk"] == "CRITICAL"


def test_student_and_employee_id():
    sample = "Student record: STU-2026-98144 and staff member EMP-88219."
    detections = scan_text_patterns(sample)
    types = [d["type"] for d in detections]
    assert "STUDENT_ID" in types
    assert "EMPLOYEE_ID" in types


def test_confidential_document_marker():
    sample = "CONFIDENTIAL: Internal committee evaluation candidate."
    detections = scan_text_patterns(sample)
    conf = [d for d in detections if d["type"] == "CONFIDENTIAL_DOC"]
    assert len(conf) >= 1
    assert conf[0]["risk"] == "HIGH"
