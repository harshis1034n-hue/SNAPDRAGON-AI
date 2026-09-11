# SnapSafe AI — Architecture Document
### High-Performance On-Device Privacy Architecture for Snapdragon AI PCs

---

## 1. System Architecture Overview

SnapSafe AI is structured as a decoupled, local-first desktop application composed of a high-performance Python FastAPI engine and a reactive React/TypeScript frontend.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SnapSafe AI Desktop App                          │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │    React + TypeScript + Vite    │   │      Electron Native Shell      │  │
│  │   • Dashboard & Privacy Health  │   │   • Native Windows Frameless    │  │
│  │   • Bounding Box Canvas Overlay │   │   • DesktopCapturer IPC Hook    │  │
│  │   • Interactive Split Slider    │   │   • System Tray & Clipboard     │  │
│  │   • Privacy Coach Intelligence  │   └────────────────┬────────────────┘  │
│  └────────────────┬────────────────┘                    │                   │
└───────────────────┼─────────────────────────────────────┼───────────────────┘
                    │ REST APIs (127.0.0.1:8000)          │
                    ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Local Python On-Device AI Engine                        │
│                                                                             │
│   ┌────────────────────────┐             ┌───────────────────────────────┐  │
│   │   Screen Capture       │             │   OCR Provider Abstraction    │  │
│   │   (mss / Memory RAM)   │             │   • RapidOCR (ONNX Local)     │  │
│   └───────────┬────────────┘             │   • Qualcomm AI Hub (QNN NPU) │  │
│               │                          │   • Synthetic Ground-Truth    │  │
│               ▼                          └──────────────┬────────────────┘  │
│   ┌────────────────────────┐                            │                   │
│   │   Sensitive Detection  │ ◄──────────────────────────┘                   │
│   │   • Shannon Entropy    │                                                │
│   │   • Luhn Card Mod-10   │             ┌───────────────────────────────┐  │
│   │   • PII & Token Regex  │             │     Image Redaction Engine    │  │
│   └───────────┬────────────┘             │     • Gaussian Blur           │  │
│               │                          │     • Block Pixelation        │  │
│               ▼                          │     • Solid Matte Blackout    │  │
│   ┌────────────────────────┐             └──────────────▲────────────────┘  │
│   │     Risk Engine        │                            │                   │
│   │   • CVSS Severity      │ ───────────────────────────┘                   │
│   │   • Privacy Score 0-100│                                                │
│   │   • Privacy Coach AI   │             ┌───────────────────────────────┐  │
│   └───────────┬────────────┘             │   Local SQLite Audit Store    │  │
│               │                          │   • Metadata-only logs        │  │
│               ▼                          │   • Zero raw pixel storage    │  │
│   ┌────────────────────────┐             └───────────────────────────────┘  │
│   │  Safe Share Protected  │                                                │
│   │  PNG Buffer & Stream   │                                                │
│   └────────────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Screen Acquisition Layer (`app.screen.capture`)
- Uses `mss` for instantaneous monitor buffer acquisition directly into memory.
- Typical capture latency: **< 18 milliseconds** on 1080p / 1440p displays.
- Captured frame is retained strictly as volatile bytes; never written to disk or network sockets.

### 2.2 OCR Provider Abstraction (`app.ocr`)
SnapSafe AI defines a strictly typed abstract base class `BaseOCRProvider`:
```python
class BaseOCRProvider(ABC):
    @abstractmethod
    def extract_text(self, image_input: Any) -> OCRResult:
        pass

    @abstractmethod
    def get_hardware_info(self) -> Dict[str, Any]:
        pass
```

Implementations:
1. **`RapidOCRProvider`**: Executes DBNet (text localization) and CRNN (text recognition) via ONNX Runtime. Default on CPU/DirectML.
2. **`QualcommAIHubOCRProvider`**: Ready to bind directly with compiled QNN context binaries targeting the Hexagon NPU using `QNNExecutionProvider`.
3. **`SyntheticOCRProvider`**: Deterministic ground-truth generator for automated testing and instantaneous competition pitch demos.

### 2.3 Sensitive Detection Engine (`app.detection`)
The detection engine employs multi-tiered classification:
- **Heuristic Pattern Matching:** Precision regular expressions targeting API keys (`sk-`, `ghp-`, `AKIA`), session tokens, credentials, and passwords.
- **Shannon Entropy Analysis:**
  $$\text{Entropy} = -\sum_{i=1}^{n} p(x_i) \log_2 p(x_i)$$
  Strings exceeding 3.2 bits/symbol over 16+ characters are flagged as cryptographic keys.
- **Luhn Algorithm Checksum (Mod-10):** Prevents false positives on random 16-digit sequences by verifying payment card check digits.
- **Contextual Document Classifiers:** Identifies document markers such as "CONFIDENTIAL", "STRICTLY PRIVATE", "INTERNAL ONLY", and "SALARY".

### 2.4 Risk & Privacy Assessment Engine (`app.risk`)
- Assigns severity tiers:
  - **CRITICAL (Weight 35):** API keys, passwords, bearer tokens, financial payment cards.
  - **HIGH (Weight 20):** Student IDs, Employee IDs, residential addresses, confidential markings.
  - **MEDIUM (Weight 10):** Email addresses, mobile phone numbers.
  - **LOW (Weight 5):** Generic URLs, non-sensitive identifiers.
- Calculates **Privacy Risk Score** ($0 - 100$) and **Privacy Score** ($100 - \text{Residual Risk}$).

### 2.5 Image Redaction Engine (`app.redaction`)
Processes bounding boxes with real image transformations:
- **Gaussian Blur:** $\text{Kernel} \ge 15 \times 15$, $\sigma = 25$ for permanent unreadability.
- **Pixelation:** Downsampling by factor of 10 followed by nearest-neighbor upscaling.
- **Solid Blackout:** Sleek dark matte box (`#121826`) with border highlighting.

---

## 3. Snapdragon & Qualcomm AI Hub Optimization Pathway
On HP Snapdragon AI PCs (Snapdragon X Elite / Snapdragon X Plus):
1. **Model Compilation:** Export vision model from Qualcomm AI Hub:
   ```bash
   qai-hub compile \
     --model-file ./models/dbnet.onnx \
     --target-runtime qnn_lib_aarch64_windows \
     --device "Snapdragon X Elite CRD"
   ```
2. **Execution Provider Hook:** In `onnxruntime-qnn`, instantiate session with `QNNExecutionProvider` configured with backend path `QnnHtp.dll`.
3. **Power Efficiency:** Offloading continuous scanning from CPU to Hexagon NPU reduces power draw from ~35W to < 5W.
