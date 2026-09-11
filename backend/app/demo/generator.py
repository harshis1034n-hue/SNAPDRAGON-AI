"""
SnapSafe AI - Synthetic Demo Generator
Produces a high-fidelity, synthetic Student Portal interface image
with guaranteed non-real, synthetic personal data for competition demonstrations.
"""

import io
import base64
from typing import Dict, Any
from PIL import Image, ImageDraw, ImageFont
import numpy as np


class DemoGenerator:
    """
    Generates synthetic realistic portal documents with synthetic sensitive markers.
    """

    @staticmethod
    def generate_demo_portal_image() -> Dict[str, Any]:
        """
        Creates a clean 960x600 image representing a realistic university portal screen.
        """
        width, height = 960, 600
        # Create image with clean dark/slate aesthetic
        img = Image.new("RGB", (width, height), color=(15, 23, 42))  # slate-900
        draw = ImageDraw.Draw(img)

        # Header bar (university portal header)
        draw.rectangle([0, 0, width, 60], fill=(30, 41, 59))  # slate-800
        draw.line([0, 60, width, 60], fill=(51, 65, 85), width=1)

        # Brand / Title in header
        draw.text((24, 18), "CAMPUS ACADEMIC CLOUD - STUDENT PROFILE", fill=(241, 245, 249))
        draw.text((width - 240, 20), "DEMO DATA - SYNTHETIC", fill=(244, 63, 94))  # Rose warning

        # Top banner notification
        draw.rectangle([24, 76, width - 24, 116], fill=(23, 37, 84), outline=(30, 58, 138), width=1)
        draw.text((40, 88), "INTERNAL SYSTEM: Verification in progress. Please review contact details and API credentials below.", fill=(147, 197, 253))

        # Main Card Left: Student Information
        draw.rectangle([24, 132, 460, 560], fill=(30, 41, 59), outline=(51, 65, 85), width=1)
        draw.text((44, 150), "STUDENT IDENTIFICATION RECORD", fill=(148, 163, 184))
        
        # Profile fields
        fields_left = [
            ("Student Full Name:", "Sarah Jenkins (Undergrad - CS)"),
            ("Student ID Number:", "STU-2026-98144"),
            ("University Email:", "sarah.jenkins@campus-edu.org"),
            ("Emergency Mobile:", "+91 98450 23145"),
            ("Campus Address:", "42 Elm Street, Apt 3B, New York, NY"),
            ("Enrollment Status:", "Active - Dean's Honors List"),
            ("Academic Advisor:", "Dr. Arvind Patel (arvind.p@campus.edu)")
        ]

        y_pos = 190
        for label, val in fields_left:
            draw.text((44, y_pos), label, fill=(148, 163, 184))
            draw.text((44, y_pos + 18), val, fill=(248, 250, 252))
            y_pos += 50

        # Main Card Right: Developer Credentials & Financials
        draw.rectangle([484, 132, width - 24, 560], fill=(30, 41, 59), outline=(51, 65, 85), width=1)
        draw.text((504, 150), "CONNECTED DEVELOPER SERVICES & PAYMENT", fill=(148, 163, 184))

        fields_right = [
            ("Lab Access Key (Private API):", "sk-live_994a8f102c9de08bfa17c5e2"),
            ("Portal Temporary Password:", "TempPwd#2026!Secure"),
            ("Tuition Card on File:", "4532 0192 8374 2103"),
            ("Confidential Audit Remark:", "CONFIDENTIAL: Internal evaluation candidate"),
            ("Repository Token:", "ghp_kL92jF0192AaBBccDDeeFFggHHiiJJkkLLmm"),
            ("Private Instructor Note:", "Private Message: Please verify thesis funding approval.")
        ]

        y_pos = 190
        for label, val in fields_right:
            draw.text((504, y_pos), label, fill=(148, 163, 184))
            # Highlight sensitive fields with subtle container
            if "sk-" in val or "TempPwd" in val or "4532" in val or "ghp_" in val:
                draw.rectangle([500, y_pos + 16, width - 40, y_pos + 40], fill=(15, 23, 42), outline=(71, 85, 105), width=1)
                draw.text((508, y_pos + 20), val, fill=(244, 63, 94))
            else:
                draw.text((504, y_pos + 18), val, fill=(248, 250, 252))
            y_pos += 58

        # Footer watermark
        draw.text((width - 320, height - 26), "SnapSafe AI Synthetic Ground Truth Demo Document", fill=(100, 116, 139))

        # Convert to PNG buffer and Base64 Data URI
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()
        b64_str = base64.b64encode(png_bytes).decode("utf-8")
        data_uri = f"data:image/png;base64,{b64_str}"

        return {
            "dataUri": data_uri,
            "width": width,
            "height": height,
            "isSyntheticDemo": True
        }
