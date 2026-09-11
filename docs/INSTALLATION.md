# SnapSafe AI — Installation & Setup Guide
### On-Device Screen Privacy Firewall for Snapdragon AI PCs

---

## 1. System Prerequisites

### Required Software
- **Operating System:** Windows 10 or Windows 11 (Supports both ARM64 and x64)
- **Python:** 3.10 to 3.12 (64-bit)
- **Node.js:** v18.0.0 or higher
- **Package Manager:** npm v9+

---

## 2. Fast-Start Installation

### Step 1: Clone or Navigate to Project
```powershell
cd "c:\Users\PC\Documents\problem\problem 2"
```

### Step 2: Set Up Python Backend Dependencies
Install the required local image processing and ONNX runtime packages:
```powershell
python -m pip install fastapi uvicorn[standard] pydantic Pillow numpy opencv-python-headless rapidocr-onnxruntime onnxruntime mss pytest httpx
```

### Step 3: Set Up Frontend Dependencies
```powershell
npm install
```

---

## 3. Running the Prototype

### Option A: Simultaneous Start (Dual Terminal)

#### Terminal 1 — Start Local FastAPI Backend
```powershell
npm run backend
# or: python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
The local API will start on: **`http://127.0.0.1:8000`**  
Interactive API Docs (Swagger): **`http://127.0.0.1:8000/docs`**

#### Terminal 2 — Start Vite React Frontend
```powershell
npm run dev
```
The user interface will launch on: **`http://localhost:3000`**

---

### Option B: Build Production Frontend
To compile the high-performance static React assets:
```powershell
npm run build
```
Built assets are placed into `/dist`.

---

## 4. Running Automated Tests

Run the full pytest suite covering OCR providers, regex detectors, Shannon entropy, Luhn checksums, risk scoring, image redactions, and REST endpoints:
```powershell
npm run test:py
# or: python -m pytest tests/ -v
```

All 21 unit tests should pass with 100% success.

---

## 5. Electron Desktop Packaging (Optional)
To run within the native Electron window wrapper:
```powershell
npm install -g electron
cd desktop
npm start
```
