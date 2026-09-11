"""
SnapSafe AI - Image Redaction Engine
Performs real, on-device image transformations (Gaussian Blur, Pixelation, Blackout)
on detected sensitive bounding boxes.
"""

import io
import base64
from typing import List, Dict, Any, Union
import numpy as np
from PIL import Image
import cv2

from app.ocr.base import BoundingBox
from app.detection.engine import DetectedEntity


class RedactionEngine:
    """
    Applies privacy masks to specific bounding boxes on an image.
    100% local processing; no image data ever leaves the device memory.
    """

    @staticmethod
    def apply_redaction(
        image_input: Union[bytes, Image.Image, np.ndarray],
        entities_to_mask: List[DetectedEntity],
        redaction_style: str = "blur"  # "blur", "pixelate", "blackout"
    ) -> Dict[str, Any]:
        """
        Apply redactions to the image.
        :param image_input: Source image as bytes, PIL Image, or numpy array.
        :param entities_to_mask: Entities marked for masking.
        :param redaction_style: Masking style to apply.
        :return: Dict containing base64 data URI, raw bytes, and stats.
        """
        # Load into OpenCV BGR numpy array
        if isinstance(image_input, bytes):
            pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        elif isinstance(image_input, Image.Image):
            img = cv2.cvtColor(np.array(image_input.convert("RGB")), cv2.COLOR_RGB2BGR)
        elif isinstance(image_input, np.ndarray):
            img = image_input.copy()
            if len(img.shape) == 2:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
            elif img.shape[2] == 4:
                img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
        else:
            raise ValueError(f"Unsupported image type: {type(image_input)}")

        img_h, img_w = img.shape[:2]
        style = redaction_style.lower().strip()
        padding = 4  # slight padding around box for thorough coverage

        masked_count = 0
        for entity in entities_to_mask:
            if not entity.is_masked:
                continue

            bbox = entity.bounding_box
            x1 = max(0, bbox.x - padding)
            y1 = max(0, bbox.y - padding)
            x2 = min(img_w, bbox.x + bbox.width + padding)
            y2 = min(img_h, bbox.y + bbox.height + padding)

            if x2 <= x1 or y2 <= y1:
                continue

            roi = img[y1:y2, x1:x2]
            if roi.size == 0:
                continue

            roi_h, roi_w = roi.shape[:2]

            if style == "blackout":
                # Solid sleek matte dark box
                cv2.rectangle(img, (x1, y1), (x2, y2), (18, 24, 38), -1)
                # Subtle border
                cv2.rectangle(img, (x1, y1), (x2, y2), (45, 55, 72), 1)

            elif style == "pixelate":
                # Downsample by 8-12x, then upscale with nearest neighbor
                scale_w = max(2, roi_w // 10)
                scale_h = max(2, roi_h // 10)
                small = cv2.resize(roi, (scale_w, scale_h), interpolation=cv2.INTER_LINEAR)
                pixelated = cv2.resize(small, (roi_w, roi_h), interpolation=cv2.INTER_NEAREST)
                img[y1:y2, x1:x2] = pixelated

            else:  # "blur" default
                # Strong Gaussian Blur so text is permanently unreadable
                kernel_w = max(15, (roi_w // 2) * 2 + 1)
                kernel_h = max(15, (roi_h // 2) * 2 + 1)
                blurred = cv2.GaussianBlur(roi, (kernel_w, kernel_h), 25)
                img[y1:y2, x1:x2] = blurred

            masked_count += 1

        # Encode back to PNG bytes and Base64 Data URI
        _, buffer = cv2.imencode(".png", img)
        png_bytes = buffer.tobytes()
        b64_str = base64.b64encode(png_bytes).decode("utf-8")
        data_uri = f"data:image/png;base64,{b64_str}"

        return {
            "dataUri": data_uri,
            "bytes": png_bytes,
            "maskedCount": masked_count,
            "style": style,
            "width": img_w,
            "height": img_h
        }
