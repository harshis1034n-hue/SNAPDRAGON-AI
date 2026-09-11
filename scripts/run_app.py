import os
import sys
from pathlib import Path

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

def main():
    print("=" * 65)
    print("           CAMPUS ORBIT - AI MULTI-AGENT PLATFORM")
    print("  'Plan smarter. Coordinate automatically. Adapt instantly.'")
    print("=" * 65)
    
    try:
        import uvicorn
    except ImportError:
        print("[ERROR] uvicorn is not installed. Please run: pip install -r requirements.txt")
        sys.exit(1)
        
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    
    print(f"\n[*] Starting FastAPI server on http://127.0.0.1:{port}")
    print(f"[*] Swagger OpenAPI Docs:   http://127.0.0.1:{port}/docs")
    print(f"[*] Demo Mode:              ACTIVE (Zero external API key required)")
    print(f"[*] Public Tunnel Command:  npm run tunnel  (or: node scripts/start_tunnel.js)")
    print("=" * 65 + "\n")
    
    uvicorn.run("backend.app:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    main()
