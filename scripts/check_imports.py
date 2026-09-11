import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

try:
    from app.ocr.factory import get_ocr_provider
    from app.detection.engine import DetectionEngine
    from app.risk.engine import RiskEngine
    from app.redaction.engine import RedactionEngine
    from app.hardware.snapdragon_profiler import SnapdragonProfiler
    print("  [OK] All Python modules imported successfully.")
    sys.exit(0)
except Exception as e:
    print(f"  [FAIL] Python module import check failed: {e}")
    sys.exit(1)
