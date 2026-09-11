"""
SnapSafe AI - OCR Provider Factory
Provides unified access to local on-device OCR providers.
"""

from typing import Optional
from app.ocr.base import BaseOCRProvider
from app.ocr.rapid_ocr import RapidOCRProvider
from app.ocr.qualcomm_aihub_ocr import QualcommAIHubOCRProvider
from app.ocr.synthetic_ocr import SyntheticOCRProvider

# Global singleton cache for OCR providers to prevent redundant initialization
_PROVIDERS = {}


def get_ocr_provider(provider_type: str = "auto") -> BaseOCRProvider:
    """
    Factory function to retrieve the configured on-device OCR provider.
    :param provider_type: 'auto', 'rapidocr', 'qualcomm_aihub', or 'synthetic'
    :return: Instance of BaseOCRProvider
    """
    provider_type = provider_type.lower().strip()
    
    if provider_type in _PROVIDERS:
        return _PROVIDERS[provider_type]

    if provider_type == "synthetic":
        provider = SyntheticOCRProvider()
    elif provider_type in ["qualcomm", "qualcomm_aihub", "snapdragon"]:
        provider = QualcommAIHubOCRProvider()
    elif provider_type in ["rapidocr", "onnx"]:
        provider = RapidOCRProvider()
    else:  # 'auto'
        # Default to RapidOCR with Qualcomm AI Hub fallback/inspection
        provider = QualcommAIHubOCRProvider()

    _PROVIDERS[provider_type] = provider
    return provider
