"""
SnapSafe AI - Sensitive Data Detection Rules & Patterns
Identifies emails, phone numbers, API keys, credentials, student IDs, credit cards,
private messages, and confidential document headers with high precision and confidence estimation.
"""

import re
from typing import List, Dict, Any, Optional
from app.detection.entropy import calculate_shannon_entropy, luhn_checksum_valid


class DetectionRule:
    """Represents a specific detection pattern with type and risk mapping."""
    def __init__(
        self,
        category: str,
        display_name: str,
        default_risk: str,
        recommended_action: str = "MASK"
    ):
        self.category = category
        self.display_name = display_name
        self.default_risk = default_risk
        self.recommended_action = recommended_action


# Common RegEx Patterns
RE_EMAIL = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')

# International & Indian Phone numbers
RE_PHONE_IN = re.compile(r'(?:(?:\+|0{0,2})91[\s.-]?)?[6789]\d{9}\b')
RE_PHONE_INTL = re.compile(r'(?:\+?(\d{1,3}))?[-.\s]?(?:\(?(\d{2,4})\)?[-.\s]?)?(\d{3,4})[-.\s]?(\d{3,4})\b')

# API Keys & Secrets
RE_OPENAI_KEY = re.compile(r'\bsk-[a-zA-Z0-9_\-]{20,}\b')
RE_GITHUB_TOKEN = re.compile(r'\bgh[pousr]-[a-zA-Z0-9]{36}\b')
RE_GENERIC_API_KEY = re.compile(r'(?:api[_-]?key|apikey|secret|token|access[_-]?token|auth[_-]?token|private[_-]?key)[\s:="\']{1,4}([a-zA-Z0-9_\-]{16,64})', re.IGNORECASE)
RE_AWS_KEY = re.compile(r'\bAKIA[0-9A-Z]{16}\b')
RE_BEARER_TOKEN = re.compile(r'Bearer\s+([a-zA-Z0-9\-._~+/]+=*)', re.IGNORECASE)

# Passwords
RE_PASSWORD_LABEL = re.compile(r'(?:password|passwd|pwd|passcode|secret)[\s:="\']{1,4}([^\s"\';]{4,32})', re.IGNORECASE)

# Student & Employee IDs
RE_STUDENT_ID = re.compile(r'\b(?:STU|STUDENT|ROLL|REG|ENROLL|URN)[-_:\s#]*([A-Z0-9\-]{5,16})\b', re.IGNORECASE)
RE_EMPLOYEE_ID = re.compile(r'\b(?:EMP|EMPLOYEE|STAFF)[-_:\s#]*([A-Z0-9\-]{5,16})\b', re.IGNORECASE)

# Credit / Debit Cards (13-19 digits, with spaces or hyphens)
RE_CARD_NUMBER = re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{15,16}\b')

# URLs with embedded credentials
RE_URL_CREDENTIALS = re.compile(r'https?://([^:\s]+):([^@\s]+)@')

# Confidential / Private document keywords
RE_CONFIDENTIAL_DOC = re.compile(
    r'\b(CONFIDENTIAL|STRICTLY PRIVATE|INTERNAL ONLY|PROPRIETARY|SALARY SLIP|OFFER LETTER|DO NOT DISTRIBUTE|TOP SECRET|TRADE SECRET)\b',
    re.IGNORECASE
)

# Private message context
RE_PRIVATE_MESSAGE = re.compile(
    r'\b(Private Message|Internal Discussion|Confidential Note|Off the Record|Do Not Share|Do Not Forward)[:\s]+([^.\n\r]{5,100})',
    re.IGNORECASE
)

# Address indicators
RE_ADDRESS = re.compile(
    r'\b(?:\d{1,5}\s+[A-Za-z0-9\s.,]{3,30}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Apt|Suite|Floor|FL)\b[A-Za-z0-9\s.,]{0,30})',
    re.IGNORECASE
)


def scan_text_patterns(text: str) -> List[Dict[str, Any]]:
    """
    Run all deterministic patterns on a string and return matching spans
    along with confidence, severity risk, and recommended action.
    """
    detections: List[Dict[str, Any]] = []

    # 1. API Keys (Critical)
    for m in RE_OPENAI_KEY.finditer(text):
        entropy = calculate_shannon_entropy(m.group(0))
        conf = 0.98 if entropy > 3.0 else 0.85
        detections.append({
            "type": "API_KEY",
            "displayName": "API Key (OpenAI / Service)",
            "value": m.group(0),
            "start": m.start(),
            "end": m.end(),
            "confidence": conf,
            "risk": "CRITICAL",
            "action": "MASK",
            "category": "credentials"
        })

    for m in RE_GITHUB_TOKEN.finditer(text):
        detections.append({
            "type": "API_KEY",
            "displayName": "GitHub Access Token",
            "value": m.group(0),
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.99,
            "risk": "CRITICAL",
            "action": "MASK",
            "category": "credentials"
        })

    for m in RE_AWS_KEY.finditer(text):
        detections.append({
            "type": "API_KEY",
            "displayName": "AWS Access Key ID",
            "value": m.group(0),
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.99,
            "risk": "CRITICAL",
            "action": "MASK",
            "category": "credentials"
        })

    for m in RE_GENERIC_API_KEY.finditer(text):
        val = m.group(1)
        entropy = calculate_shannon_entropy(val)
        if entropy > 2.8 or len(val) >= 20:
            detections.append({
                "type": "API_KEY",
                "displayName": "API Key / Access Token",
                "value": val,
                "start": m.start(1),
                "end": m.end(1),
                "confidence": min(0.99, 0.75 + (entropy / 10.0)),
                "risk": "CRITICAL",
                "action": "MASK",
                "category": "credentials"
            })

    for m in RE_BEARER_TOKEN.finditer(text):
        token_val = m.group(1)
        if len(token_val) >= 16:
            detections.append({
                "type": "ACCESS_TOKEN",
                "displayName": "Bearer Auth Token",
                "value": token_val,
                "start": m.start(1),
                "end": m.end(1),
                "confidence": 0.96,
                "risk": "CRITICAL",
                "action": "MASK",
                "category": "credentials"
            })

    # 2. Passwords (Critical)
    for m in RE_PASSWORD_LABEL.finditer(text):
        pwd_val = m.group(1)
        if pwd_val.lower() not in ["null", "none", "true", "false", "undefined"]:
            detections.append({
                "type": "PASSWORD",
                "displayName": "Plaintext Password",
                "value": pwd_val,
                "start": m.start(1),
                "end": m.end(1),
                "confidence": 0.97,
                "risk": "CRITICAL",
                "action": "MASK",
                "category": "credentials"
            })

    # 3. Credit / Debit Cards (Critical / High)
    for m in RE_CARD_NUMBER.finditer(text):
        clean_num = re.sub(r'\D', '', m.group(0))
        if 13 <= len(clean_num) <= 19 and luhn_checksum_valid(clean_num):
            detections.append({
                "type": "CREDIT_CARD",
                "displayName": "Payment Card Number",
                "value": m.group(0),
                "start": m.start(),
                "end": m.end(),
                "confidence": 0.99,
                "risk": "CRITICAL",
                "action": "MASK",
                "category": "financial"
            })

    # 4. URL Credentials (Critical)
    for m in RE_URL_CREDENTIALS.finditer(text):
        detections.append({
            "type": "URL_CREDENTIAL",
            "displayName": "Embedded URL Credentials",
            "value": m.group(0),
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.98,
            "risk": "CRITICAL",
            "action": "MASK",
            "category": "credentials"
        })

    # 5. Emails (Medium)
    for m in RE_EMAIL.finditer(text):
        detections.append({
            "type": "EMAIL",
            "displayName": "Email Address",
            "value": m.group(0),
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.99,
            "risk": "MEDIUM",
            "action": "MASK",
            "category": "pii"
        })

    # 6. Phone Numbers (High / Medium)
    for m in RE_PHONE_IN.finditer(text):
        raw_val = m.group(0)
        digits = re.sub(r'\D', '', raw_val)
        if len(digits) >= 10:
            detections.append({
                "type": "PHONE",
                "displayName": "Phone Number (Mobile)",
                "value": raw_val,
                "start": m.start(),
                "end": m.end(),
                "confidence": 0.96,
                "risk": "HIGH",
                "action": "MASK",
                "category": "pii"
            })

    # 7. Student & Employee IDs (High)
    for m in RE_STUDENT_ID.finditer(text):
        id_val = m.group(0)
        detections.append({
            "type": "STUDENT_ID",
            "displayName": "Student ID / Roll Number",
            "value": id_val,
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.96,
            "risk": "HIGH",
            "action": "MASK",
            "category": "pii"
        })

    for m in RE_EMPLOYEE_ID.finditer(text):
        id_val = m.group(0)
        detections.append({
            "type": "EMPLOYEE_ID",
            "displayName": "Employee ID",
            "value": id_val,
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.95,
            "risk": "HIGH",
            "action": "MASK",
            "category": "pii"
        })

    # 8. Addresses (High)
    for m in RE_ADDRESS.finditer(text):
        addr_val = m.group(0)
        detections.append({
            "type": "ADDRESS",
            "displayName": "Physical Residential Address",
            "value": addr_val,
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.88,
            "risk": "HIGH",
            "action": "MASK",
            "category": "pii"
        })

    # 9. Confidential Document Markers (High / Critical)
    for m in RE_CONFIDENTIAL_DOC.finditer(text):
        doc_tag = m.group(0)
        detections.append({
            "type": "CONFIDENTIAL_DOC",
            "displayName": "Confidential / Internal Marker",
            "value": doc_tag,
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.95,
            "risk": "HIGH",
            "action": "MASK",
            "category": "confidential"
        })

    # 10. Private Message Context (High)
    for m in RE_PRIVATE_MESSAGE.finditer(text):
        msg_val = m.group(0)
        detections.append({
            "type": "PRIVATE_MESSAGE",
            "displayName": "Private Message / Discussion",
            "value": msg_val,
            "start": m.start(),
            "end": m.end(),
            "confidence": 0.93,
            "risk": "HIGH",
            "action": "MASK",
            "category": "confidential"
        })

    return detections
