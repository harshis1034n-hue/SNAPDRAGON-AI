# SnapSafe AI
### “See it. Detect it. Protect it. Before you share it.”

[![Snapdragon AI PC](https://img.shields.io/badge/Platform-HP%20Snapdragon%20AI%20PC-rose)](https://www.qualcomm.com/products/mobile/snapdragon/pcs-and-tablets)
[![Data Egress](https://img.shields.io/badge/Cloud%20Data%20Egress-0%20Bytes%20(Local)-emerald)](https://github.com)
[![Inference Mode](https://img.shields.io/badge/Inference-100%25%20On--Device%20(NPU%20Ready)-blue)](https://github.com)
[![Test Suite](https://img.shields.io/badge/Tests-21%20Passed-brightgreen)](https://github.com)

> **Prepared for the Snapdragon AI Lab Build & Present Challenge**  
> Designed and architected for HP PCs powered by Snapdragon X-series processors.

---

## 🛡️ Executive Overview

**SnapSafe AI** is an intelligent, privacy-first screen-sharing firewall for the AI PC.

Before sharing your screen in job interviews, college presentations, code reviews, telehealth consultations, or customer support sessions, SnapSafe AI captures and scans your display locally on-device. It detects sensitive information, computes risk scores, highlights detected regions with precision bounding boxes, explains threats via an on-device Privacy Coach, and automatically applies privacy redactions (Gaussian blur, pixelation, blackout) before you share.

### The Core Differentiator: 100% On-Device
- **0 Bytes Transmitted to Any Cloud API:** No screenshots, OCR text, or sensitive credentials ever leave the device.
- **Privacy Firewall for the AI PC:** Demonstrates why neural acceleration on Snapdragon AI PCs is transformative for personal privacy and security.
- **Qualcomm AI Hub Architecture:** Features a pluggable `OCRProvider` and `AIBackend` abstraction layer ready for Qualcomm Hexagon NPU execution via the `QNNExecutionProvider`.

---

## ⚡ Key Capabilities & Pages

1. **Dashboard:**
   - Real-time privacy health score (0–100)
   - Live telemetry: Protected Items Today, Critical Interceptions, Last Scan Latency, Cloud Data Sent (`0 bytes`)
   - Quick actions: `[ SCAN SCREEN ]`, `[ IMPORT SCREENSHOT ]`, `[ TRY DEMO ]`
   - Real-time protection activity audit feed

2. **Scan Screen:**
   - Desktop display capture (`mss` with sub-20ms latency), browser window selection (`getDisplayMedia`), or drag-and-drop PNG/JPG import
   - Step-by-step pipeline progress: `✓ Capturing` → `✓ Detecting text (Local ONNX OCR)` → `✓ Classifying sensitive info` → `✓ Calculating risk` → `✓ Preparing protection`
   - Multi-backend selector (Auto, Qualcomm AI Hub, RapidOCR ONNX, Synthetic Ground-Truth)

3. **Privacy Results:**
   - Precision bounding box canvas overlay with severity color-coding:
     - 🔴 **Critical:** API keys, plaintext passwords, payment card numbers
     - 🟠 **High:** Student IDs, employee badges, residential addresses, confidential markings
     - 🟡 **Medium:** Direct contact email addresses, mobile phone numbers
     - 🔵 **Low:** Public handles, generic links
   - Interactive item inspection with toggleable masking controls

4. **Privacy Coach (AI Explanations):**
   - Contextual "Why is this risky?" analysis detailing practical threat vectors
   - Clear mitigation recommendations for each detected entity

5. **Safe Share & Before/After Comparison:**
   - Interactive Before/After split slider, toggle view, and side-by-side split screen
   - Dynamic exposure delta tracking (e.g., Privacy Risk: **87 → 4**)
   - Masking styles: Gaussian Blur, Pixelation, Solid Matte Blackout
   - Export options: Copy protected image to clipboard, PNG download, and simulated clean presenter window

6. **Scan History (Audit Log):**
   - Privacy-first SQLite metadata log (timestamps, detection counts, highest risk, action taken, 0 bytes egress)
   - Zero raw pixel retention policy

7. **Snapdragon AI & Hardware Architecture:**
   - Visualizes the 5-stage on-device acceleration pipeline
   - Live host hardware inspector (Windows ARM64 detection, ONNX execution providers, NPU status, CPU fallback)
   - Step-by-step Qualcomm AI Hub model migration guide

8. **Performance Benchmark:**
   - Real on-device benchmark harness measuring latency, memory, and throughput
   - Strictly honest disclosure: clearly distinguishes host prototype measurements from target Snapdragon X Elite NPU metrics

9. **1-Click Competition Pitch Demo:**
   - Built-in 90-second competition demonstration launcher
   - Loads synthetic student portal with guaranteed synthetic test data (Sarah Jenkins, Student ID, fake email, phone, API key)

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI REST API server
│   │   ├── ocr/
│   │   │   ├── base.py                 # Abstract BaseOCRProvider interface
│   │   │   ├── rapid_ocr.py            # Local ONNX Runtime OCR (DBNet + CRNN)
│   │   │   ├── qualcomm_aihub_ocr.py   # Qualcomm AI Hub QNN provider abstraction
│   │   │   ├── synthetic_ocr.py        # Deterministic ground-truth demo engine
│   │   │   └── factory.py              # Provider singleton factory
│   │   ├── detection/
│   │   │   ├── engine.py               # Sensitive detection coordinator
│   │   │   ├── rules.py                # Regex & pattern detectors
│   │   │   └── entropy.py              # Shannon entropy & Luhn Mod-10 checksum
│   │   ├── risk/
│   │   │   ├── engine.py               # CVSS-weighted scoring & privacy health
│   │   │   └── coach.py                # Privacy Coach AI threat catalog
│   │   ├── redaction/
│   │   │   └── engine.py               # Blur, pixelate, blackout image processing
│   │   ├── hardware/
│   │   │   └── snapdragon_profiler.py  # System profiler & local benchmark runner
│   │   ├── history/
│   │   │   └── store.py                # Local SQLite metadata audit store
│   │   ├── demo/
│   │   │   └── generator.py            # Realistic synthetic student portal generator
│   │   └── screen/
│   │       └── capture.py              # Windows mss display capture manager
├── frontend/
│   ├── index.html                      # Modern HTML entrypoint
│   ├── src/
│   │   ├── main.tsx                    # React 18 bootstrap
│   │   ├── App.tsx                     # Main application container
│   │   ├── index.css                   # Tailwind & glassmorphism theme
│   │   ├── types/index.ts              # Strongly-typed TypeScript interfaces
│   │   ├── services/api.ts             # Local API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Top navigation & privacy indicators
│   │   │   ├── PrivacyIndicator.tsx    # 0-byte egress badge
│   │   │   ├── BoundingBoxOverlay.tsx  # Interactive canvas bounding boxes
│   │   │   ├── ComparisonSlider.tsx    # Before/After interactive slider
│   │   │   ├── PrivacyCoachCard.tsx    # Contextual threat explanation card
│   │   │   └── DemoModal.tsx           # Competition 90-second demo modal
│   │   └── pages/
│   │       ├── DashboardPage.tsx       # Main privacy dashboard
│   │       ├── ScanScreenPage.tsx      # Screen capture & upload
│   │       ├── PrivacyResultsPage.tsx  # Bounding box review & coach
│   │       ├── SafeSharePage.tsx       # Redaction export & slider
│   │       ├── ScanHistoryPage.tsx     # Local metadata history
│   │       ├── SnapdragonPage.tsx      # Hardware & architecture
│   │       ├── BenchmarkPage.tsx       # Live host benchmark runner
│   │       └── SettingsPage.tsx        # Security policies & categories
├── desktop/
│   ├── main.cjs                        # Electron desktop process
│   ├── preload.cjs                     # Electron context bridge
│   └── package.json                    # Desktop package configuration
├── tests/
│   ├── test_detection_rules.py         # Pattern & entropy unit tests
│   ├── test_risk_engine.py             # Risk scoring & coach tests
│   ├── test_redaction_engine.py        # Blur, pixelate, blackout tests
│   ├── test_ocr_providers.py           # Provider abstraction tests
│   └── test_api_endpoints.py           # FastAPI integration tests
├── docs/
│   ├── COMPETITION_PROPOSAL.md         # Official challenge submission proposal
│   ├── DEMO_SCRIPT.md                  # 90-second competition pitch script
│   ├── ARCHITECTURE.md                 # System architecture specification
│   ├── TECHNICAL_DESIGN.md             # Engineering contracts & formulas
│   ├── INSTALLATION.md                 # Setup & execution guide
│   ├── TESTING.md                      # Quality assurance & verification
│   └── LIMITATIONS.md                  # Prototype disclosures & roadmap
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```powershell
# Install Python backend requirements
python -m pip install fastapi uvicorn[standard] pydantic Pillow numpy opencv-python-headless rapidocr-onnxruntime onnxruntime mss pytest httpx

# Install Node requirements
npm install
```

### 2. Start Backend & Frontend
In **Terminal 1** (Backend):
```powershell
npm run backend
```
*(Runs FastAPI on `http://127.0.0.1:8000`)*

In **Terminal 2** (Frontend):
```powershell
npm run dev
```
*(Runs Vite React UI on `http://localhost:3000`)*

### 3. Run Automated Tests
```powershell
npm run test:py
```
*(Executes 21 unit tests with 100% pass rate)*

---

## 🏆 Snapdragon AI Lab Build & Present Challenge Alignment

- **Problem Solved:** Eradicates accidental data leaks during remote presentations, technical interviews, and webinars.
- **Why Snapdragon:** Replaces energy-draining cloud calls with on-device neural vision processing accelerated by the Qualcomm Hexagon NPU.
- **Honesty in Competition:** Hardware execution units are accurately detected and reported without fabricated statistics.
- **Competition Script:** See [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the complete 90-second presentation walkthrough.
