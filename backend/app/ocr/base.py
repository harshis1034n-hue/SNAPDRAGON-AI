"""
SnapSafe AI - OCR Provider Interface
Designed for local, on-device text detection & recognition.
Compatible with Qualcomm AI Hub export architecture.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict, Any


@dataclass
class BoundingBox:
    """
    Standard bounding box represented as:
    x: left coordinate in pixels
    y: top coordinate in pixels
    width: width in pixels
    height: height in pixels
    """
    x: int
    y: int
    width: int
    height: int

    def to_dict(self) -> Dict[str, int]:
        return {
            "x": int(self.x),
            "y": int(self.y),
            "width": int(self.width),
            "height": int(self.height)
        }

    @classmethod
    def from_points(cls, points: List[List[float]]) -> "BoundingBox":
        """
        Convert polygon/4-point box [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] to axis-aligned box.
        """
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        min_x = max(0, int(min(xs)))
        min_y = max(0, int(min(ys)))
        max_x = int(max(xs))
        max_y = int(max(ys))
        return cls(
            x=min_x,
            y=min_y,
            width=max(1, max_x - min_x),
            height=max(1, max_y - min_y)
        )


@dataclass
class OCRToken:
    """Represents a detected text element with confidence and bounding box."""
    text: str
    confidence: float
    bounding_box: BoundingBox
    line_number: int = 0
    token_index: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "confidence": round(float(self.confidence), 4),
            "boundingBox": self.bounding_box.to_dict(),
            "lineNumber": self.line_number,
            "tokenIndex": self.token_index
        }


@dataclass
class OCRResult:
    """Full result of an on-device OCR scan."""
    full_text: str
    tokens: List[OCRToken] = field(default_factory=list)
    engine_name: str = "Unknown"
    inference_time_ms: float = 0.0
    device_target: str = "CPU"  # e.g., "Snapdragon NPU (QNN)", "ONNX CPU", "DirectML GPU"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fullText": self.full_text,
            "tokenCount": len(self.tokens),
            "engineName": self.engine_name,
            "inferenceTimeMs": round(self.inference_time_ms, 2),
            "deviceTarget": self.device_target,
            "tokens": [t.to_dict() for t in self.tokens]
        }


class BaseOCRProvider(ABC):
    """
    Abstract interface for all on-device OCR providers.
    Allows transparent swapping between RapidOCR (ONNX), Qualcomm AI Hub (QNN),
    EasyOCR, and Synthetic test providers without changing downstream logic.
    """

    @abstractmethod
    def extract_text(self, image_input: Any) -> OCRResult:
        """
        Extract text and bounding boxes from an image.
        :param image_input: PIL Image, numpy array (BGR/RGB), or file bytes.
        :return: OCRResult containing tokens with coordinates and confidence.
        """
        pass

    @abstractmethod
    def get_hardware_info(self) -> Dict[str, Any]:
        """Returns runtime hardware, backend execution provider, and acceleration status."""
        pass
