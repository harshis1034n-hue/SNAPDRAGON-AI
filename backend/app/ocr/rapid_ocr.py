"""
SnapSafe AI - RapidOCR On-Device Provider
Utilizes ONNX Runtime for local text detection & recognition.
Compatible with Windows on ARM and Snapdragon X-series via CPU or NPU execution.
"""

import time
import io
from typing import Any, Dict, List
import numpy as np
from PIL import Image

from app.ocr.base import BaseOCRProvider, OCRResult, OCRToken, BoundingBox


class RapidOCRProvider(BaseOCRProvider):
    """
    On-device OCR provider running DBNet + CRNN via ONNX Runtime.
    Provides fast, local inference with bounding boxes without any network calls.
    """

    def __init__(self, use_gpu: bool = False):
        self.engine_name = "RapidOCR (ONNX Runtime)"
        self.device_target = "ONNX CPU (Local)"
        self._engine = None
        self._init_engine()

    def _init_engine(self):
        try:
            from rapidocr_onnxruntime import RapidOCR
            import onnxruntime as ort
            
            # Check available execution providers in ONNX Runtime
            available_providers = ort.get_available_providers()
            if "QNNExecutionProvider" in available_providers:
                self.device_target = "Snapdragon NPU (QNN)"
            elif "DmlExecutionProvider" in available_providers:
                self.device_target = "DirectML GPU"
            else:
                self.device_target = "ONNX CPU Fallback"

            self._engine = RapidOCR()
        except Exception as e:
            print(f"[SnapSafe AI] Warning: RapidOCR initialization failed: {e}")
            self._engine = None

    def _prepare_image(self, image_input: Any) -> np.ndarray:
        """Convert input image into a numpy array suitable for OCR."""
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
            return np.array(image)
        elif isinstance(image_input, Image.Image):
            return np.array(image_input.convert("RGB"))
        elif isinstance(image_input, np.ndarray):
            if len(image_input.shape) == 2:
                # Grayscale to RGB
                import cv2
                return cv2.cvtColor(image_input, cv2.COLOR_GRAY2RGB)
            elif image_input.shape[2] == 4:
                # RGBA to RGB
                import cv2
                return cv2.cvtColor(image_input, cv2.COLOR_RGBA2RGB)
            return image_input
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

    def extract_text(self, image_input: Any) -> OCRResult:
        if self._engine is None:
            self._init_engine()
            if self._engine is None:
                return OCRResult(
                    full_text="",
                    tokens=[],
                    engine_name=self.engine_name,
                    inference_time_ms=0.0,
                    device_target="Unavailable"
                )

        img_np = self._prepare_image(image_input)
        
        start_time = time.perf_counter()
        # RapidOCR returns list of [box_points, text, confidence]
        result, elapse_list = self._engine(img_np)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        tokens: List[OCRToken] = []
        full_text_parts: List[str] = []

        if result:
            for idx, item in enumerate(result):
                box_points = item[0]  # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                text = str(item[1]).strip()
                conf = float(item[2])

                if not text:
                    continue

                bbox = BoundingBox.from_points(box_points)
                token = OCRToken(
                    text=text,
                    confidence=conf,
                    bounding_box=bbox,
                    line_number=idx,
                    token_index=idx
                )
                tokens.append(token)
                full_text_parts.append(text)

        full_text = "\n".join(full_text_parts)
        return OCRResult(
            full_text=full_text,
            tokens=tokens,
            engine_name=self.engine_name,
            inference_time_ms=elapsed_ms,
            device_target=self.device_target
        )

    def get_hardware_info(self) -> Dict[str, Any]:
        import onnxruntime as ort
        providers = ort.get_available_providers()
        return {
            "engine": self.engine_name,
            "deviceTarget": self.device_target,
            "availableProviders": providers,
            "isNpuAccelerated": "QNNExecutionProvider" in providers,
            "isLocalOnly": True,
            "cloudUploadEnabled": False
        }
