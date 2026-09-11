"""
SnapSafe AI - Privacy Coach
Provides context-aware AI explanations for detected risks.
Supports deterministic fast explanations and extensible local SLM integration.
"""

from typing import Dict, Any, Optional


class PrivacyCoach:
    """
    On-device Privacy Coach that explains the threat vector and practical
    consequences of exposing sensitive tokens during presentations or screen shares.
    """

    EXPLANATION_CATALOG = {
        "API_KEY": {
            "title": "Unrestricted API Credential",
            "whyRisky": "An API key provides direct programmable access to external cloud services or internal infrastructure. Anyone viewing the recording or stream can copy it, incurring heavy billing or compromising private databases.",
            "impact": "Account compromise, unauthorized data exfiltration, quota depletion.",
            "recommendation": "Mask this credential immediately and rotate if exposed."
        },
        "ACCESS_TOKEN": {
            "title": "Active Session / Bearer Token",
            "whyRisky": "Bearer tokens authenticate active user sessions without requiring passwords. An attacker can hijack your active session until expiration.",
            "impact": "Session hijacking and unauthorized privileged actions.",
            "recommendation": "Redact before broadcasting screen."
        },
        "PASSWORD": {
            "title": "Plaintext Credential",
            "whyRisky": "Exposing plaintext passwords allows unauthorized system access and credential stuffing attacks against other accounts using the same password.",
            "impact": "Immediate account takeover.",
            "recommendation": "Mask completely before proceeding."
        },
        "CREDIT_CARD": {
            "title": "Financial Payment Card Data",
            "whyRisky": "Full card number sequences violate PCI-DSS compliance and make you vulnerable to fraudulent transactions.",
            "impact": "Financial fraud and compliance breach.",
            "recommendation": "Mask all digits except the last four."
        },
        "STUDENT_ID": {
            "title": "Academic Identity Number",
            "whyRisky": "Student IDs combined with a name can be used to social engineer university registrars, impersonate campus portal accounts, or look up academic transcripts.",
            "impact": "Academic identity theft, unauthorized grading access.",
            "recommendation": "Mask identifier in public or peer calls."
        },
        "EMPLOYEE_ID": {
            "title": "Corporate Employee Identifier",
            "whyRisky": "Internal employee badges or IDs facilitate corporate spear-phishing and internal helpdesk social engineering.",
            "impact": "Internal corporate security compromise.",
            "recommendation": "Mask before sharing outside trusted team."
        },
        "PHONE": {
            "title": "Personal Contact Number",
            "whyRisky": "Personal phone numbers can lead to spam calls, SMS phishing (smishing), and SIM-swapping attempts.",
            "impact": "Privacy invasion, spam, two-factor authentication bypass.",
            "recommendation": "Mask number before webinars or recorded meetings."
        },
        "EMAIL": {
            "title": "Direct Contact Email",
            "whyRisky": "Publicly displaying emails makes personal and corporate inboxes targets for spam harvesters and targeted spear-phishing campaigns.",
            "impact": "Unsolicited spam, targeted phishing.",
            "recommendation": "Mask username prefix."
        },
        "ADDRESS": {
            "title": "Physical Residential Address",
            "whyRisky": "Revealing home or dormitory locations compromises personal physical privacy and safety.",
            "impact": "Physical security risk, stalking, location tracking.",
            "recommendation": "Redact address completely."
        },
        "CONFIDENTIAL_DOC": {
            "title": "Confidential / Internal Document Header",
            "whyRisky": "Documents marked 'Confidential', 'Proprietary', or 'Internal Only' contain sensitive operational or trade secrets that may breach NDAs if shared.",
            "impact": "Non-Disclosure Agreement violation, intellectual property leak.",
            "recommendation": "Verify audience clearance or blur document section."
        },
        "URL_CREDENTIAL": {
            "title": "URL with Embedded Basic Authentication",
            "whyRisky": "Credentials formatted as http://user:pass@host reveal usernames and passwords directly inside web browser address bars.",
            "impact": "Direct server compromise.",
            "recommendation": "Mask URL query and auth strings."
        }
    }

    def __init__(self, use_local_slm: bool = False):
        self.use_local_slm = use_local_slm
        self.slm_model_name = "Snapdragon On-Device SLM (Optional)"

    def explain(self, entity_type: str, context_text: Optional[str] = None) -> Dict[str, str]:
        """
        Generate a concise, high-value explanation for a detected item.
        """
        catalog_entry = self.EXPLANATION_CATALOG.get(entity_type.upper())
        if catalog_entry:
            return catalog_entry

        return {
            "title": f"Sensitive Item ({entity_type})",
            "whyRisky": "This information appears to contain personal or privileged data that should not be visible to third parties during a screen share.",
            "impact": "Potential privacy leakage or unintended audience exposure.",
            "recommendation": "Review and mask before sharing your screen."
        }
