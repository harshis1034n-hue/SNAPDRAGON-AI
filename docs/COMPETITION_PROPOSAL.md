# SnapSafe AI — Competition Proposal
### Snapdragon AI Lab Build & Present Challenge
**Target Platform:** HP Snapdragon AI PCs (Snapdragon X Elite / Snapdragon X Plus)  
**Track:** On-Device AI, Privacy & Security, Real-Time Utility  

---

## Executive Summary
Screen sharing has become a fundamental daily interaction for students, software engineers, job interview candidates, healthcare workers, and corporate teams. However, screen sharing is also one of the leading vectors for accidental data exposure—revealing private API keys in terminals, student registration IDs, incoming chat messages, payment details, and confidential document headers.

**SnapSafe AI** is an on-device privacy firewall for the AI PC. Designed to harness the neural processing power of Snapdragon X-series processors, SnapSafe AI intercepts screen frames before they are shared, runs local optical character recognition and sensitive data detection, assesses exposure severity, and applies cryptographic-grade redactions (blur, pixelation, blackout). 

Unlike cloud-based AI tools that violate privacy by transmitting sensitive screenshots across the internet, SnapSafe AI operates with a **strict 0-byte cloud egress guarantee**. All visual inference, pattern matching, risk calculation, and redactions stay 100% within the device's local memory.

---

## 1. Problem Statement
1. **Unintentional Leakage in High-Stakes Environments:**
   - **Technical Interviews & Hackathons:** Developers accidentally stream IDE tabs containing `.env` files, production API tokens, or AWS credentials.
   - **Academic & College Presentations:** Students reveal personal student IDs, grade reports, and contact info while presenting projects over Zoom or Microsoft Teams.
   - **Remote Customer Support & Webinars:** Support staff expose internal customer PII and database connection strings during live demonstrations.
2. **The Cloud AI Dilemma:**
   - Contemporary "AI assistants" require uploading screenshots to remote cloud APIs (e.g., GPT-4o, Claude, or cloud vision endpoints). Transmitting confidential screen buffers to a cloud server defeats the fundamental purpose of privacy protection.
3. **CPU Power Drain & Thermal Throttling on Legacy PCs:**
   - Running continuous computer vision models on legacy x86 CPUs consumes 25W–45W, triggering loud fan noise, thermal throttling, and battery exhaustion during critical video meetings.

---

## 2. The Solution: SnapSafe AI
SnapSafe AI turns the Snapdragon AI PC into a personal privacy firewall through a 5-stage pipeline:
1. **Local Screen Acquisition:** Acquires uncompressed display frames using low-latency memory buffers (via `mss` or desktop display capture APIs).
2. **On-Device Neural OCR:** Extracts text tokens and bounding box coordinates locally using quantized ONNX / QNN vision models.
3. **Multi-Vector Sensitive Detection:**
   - **Credentials & Keys:** OpenAI (`sk-...`), GitHub tokens (`ghp_...`), AWS access IDs (`AKIA...`), and generic bearer tokens identified via regex and Shannon entropy analysis (> 3.2 bits/symbol).
   - **Personal Identifiable Information (PII):** Student IDs (`STU-...`), Employee IDs, emails, and international/Indian mobile phone numbers.
   - **Financial Data:** Credit and debit card numbers verified with the Luhn Mod-10 algorithm.
   - **Confidential Markers:** "CONFIDENTIAL", "STRICTLY PRIVATE", "INTERNAL ONLY", and "SALARY" document tags.
4. **CVSS-Weighted Risk Assessment & Privacy Coach:**
   - Assigns severity tiers: `CRITICAL` (API keys, passwords, payment cards), `HIGH` (IDs, addresses), `MEDIUM` (emails), and `LOW` (generic handles).
   - Computes a composite Privacy Score (0–100) and Privacy Risk exposure metric.
   - Provides on-device "Privacy Coach" AI explanations detailing the specific attack vector and recommended mitigation.
5. **Interactive Redaction & Safe Share:**
   - Applies Gaussian blur, pixelation, or solid blackout directly to sensitive bounding boxes.
   - Provides an interactive Before/After comparison slider demonstrating exposure reduction (e.g., Risk 87 → 4).
   - Exports safe PNG files or direct clipboard copies for zero-risk broadcasting.

---

## 3. Why Snapdragon?
The HP Snapdragon AI PC ecosystem powered by Snapdragon X Elite and Snapdragon X Plus is uniquely tailored for this workload:
- **Dedicated Hexagon NPU (45 TOPS):** Continuous OCR and computer vision inference is offloaded to the Qualcomm Hexagon NPU, freeing the Oryon CPU for video calls (Teams, Zoom) and preserving all-day battery life at sub-5W efficiency.
- **Qualcomm AI Hub Model Architecture:** SnapSafe AI is architected with a decoupled `OCRProvider` interface adhering to Qualcomm AI Hub conventions. Models exported from Qualcomm AI Hub run natively under ONNX Runtime with the `QNNExecutionProvider`.
- **Zero-Latency Response:** Local on-device execution delivers sub-second privacy verification without network latency, bandwidth consumption, or cloud outages.

---

## 4. Competitive Differentiation

| Capability | Generic Cloud AI | Legacy Desktop Tools | SnapSafe AI (Snapdragon) |
| :--- | :--- | :--- | :--- |
| **Data Residency** | Cloud uploaded | Local | **100% On-Device (0 bytes egress)** |
| **NPU Acceleration** | None (Cloud servers) | CPU bound (high thermal load) | **Snapdragon Hexagon NPU Offload** |
| **Real-Time Bounding Boxes** | Markdown text only | Manual drawing | **Automated spatial bounding boxes** |
| **Key Entropy Validation** | Superficial matching | None | **Shannon Entropy + Luhn Validation** |
| **Privacy Risk Scoring** | Generic chat advice | None | **0–100 Composite Privacy Health** |
| **Before / After Slider** | None | None | **Interactive Split-Screen Comparison** |
| **Synthetic Demo Mode** | None | None | **Integrated 1-click competition demo** |

---

## 5. Target Audience & Market Impact
- **Students & Universities:** Protects academic portals, student roll numbers, and grades during classroom shares.
- **Software Engineers & Hackathons:** Eliminates the #1 cause of leaked API credentials during live code demonstrations.
- **Technical Interviewees:** Ensures code challenge interviews don't leak current employer proprietary documents or personal contact details.
- **Enterprises & Telehealth:** Provides a verifiable compliance guardrail for employees presenting customer data.

---

## 6. Implementation Status & Truthful Disclosure
In compliance with competition integrity rules:
- **Functional MVP:** Local OCR, multi-category sensitive data detection, risk scoring, visual bounding boxes, real image redactions, before/after slider, and scan history are fully implemented, verified, and tested.
- **Hardware Status:** The prototype environment executes local ONNX models via CPU fallback with a clean abstraction layer for Qualcomm AI Hub `QNNExecutionProvider`. NPU metrics are truthfully designated as target specifications until benchmarked on physical Snapdragon hardware.
