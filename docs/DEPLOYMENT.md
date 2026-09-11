# SnapSafe AI — Deployment & Packaging Guide
### Windows 11 Desktop Packaging for HP Snapdragon AI PCs

---

## 1. Target Hardware & Platform
- **Target Systems:** HP OmniBook X, HP EliteBook Ultra, and HP Snapdragon AI PCs powered by Qualcomm Snapdragon X Elite and Snapdragon X Plus processors.
- **Operating System:** Windows 11 on ARM (ARM64) and Windows 11 x64.
- **Form Factor:** Native Windows Desktop Application with frameless titlebar and system tray presence.

---

## 2. Desktop Packaging Architecture

SnapSafe AI combines:
1. **Frontend UI Shell:** Electron running Chromium with hardware acceleration.
2. **Backend Engine:** Standalone local Python process serving `127.0.0.1:8000`.

```
                    ┌───────────────────────────────┐
                    │      SnapSafe AI Installer    │
                    │   (SnapSafe-AI-Setup.exe)     │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       ┌─────────────────────────┐    ┌─────────────────────────┐
       │   Electron Shell        │    │   Python AI Engine      │
       │   • React UI Bundle     │    │   • FastAPI Binary      │
       │   • desktop/main.cjs    │    │   • ONNX Runtime QNN    │
       │   • desktop/preload.cjs │    │   • OpenCV Headless     │
       └─────────────────────────┘    └─────────────────────────┘
```

---

## 3. Step-by-Step Packaging Instructions

### Step 1: Compile the Production Frontend
```powershell
npm run build
```
This produces optimized production static assets in `/dist`.

### Step 2: Build the Standalone Backend Executable (PyInstaller)
To package the Python backend into a single executable that requires no external Python installation on the user's laptop:

```powershell
pip install pyinstaller

pyinstaller `
  --name "snapsafe-engine" `
  --onedir `
  --noconsole `
  --add-data "backend/app;app" `
  --hidden-import "uvicorn" `
  --hidden-import "fastapi" `
  --hidden-import "rapidocr_onnxruntime" `
  --hidden-import "onnxruntime" `
  --hidden-import "cv2" `
  --hidden-import "mss" `
  backend/app/main.py
```
This produces `dist/snapsafe-engine/snapsafe-engine.exe`.

### Step 3: Package Electron Desktop Application
In `desktop/`:
```powershell
cd desktop
npm install electron-builder --save-dev
npx electron-builder --win --arm64 --x64
```
This outputs `dist/SnapSafe-AI-Setup-1.0.0.exe` ready for one-click installation on Windows 11.

---

## 4. Native Windows Startup Flow

When the user launches `SnapSafe AI.exe`:
1. Electron `main.cjs` checks if `http://127.0.0.1:8000/api/health` is responsive.
2. If offline, Electron spawns the bundled background process `snapsafe-engine.exe`.
3. Electron loads `../dist/index.html`.
4. The user sees the main Privacy Dashboard with `● Protection Active`.
5. Upon closing the application window, Electron cleanly issues a termination signal to `snapsafe-engine.exe`.
