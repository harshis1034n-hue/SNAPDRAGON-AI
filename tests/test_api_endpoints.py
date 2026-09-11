"""
Unit tests for SnapSafe AI FastAPI REST Endpoints.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SnapSafe AI"
    assert data["zeroCloudGuarantee"] is True


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["protectionActive"] is True
    assert "hardware" in data
    assert "metrics" in data


def test_hardware_status_endpoint():
    response = client.get("/api/hardware")
    assert response.status_code == 200
    data = response.json()
    assert "architecture" in data
    assert "aiBackend" in data
    assert "onnxProviders" in data


def test_demo_generation_endpoint():
    response = client.get("/api/demo/generate")
    assert response.status_code == 200
    data = response.json()
    assert "dataUri" in data
    assert data["dataUri"].startswith("data:image/png;base64,")
    assert data["width"] > 0
    assert data["isSyntheticDemo"] is True


def test_scan_and_redact_flow():
    # 1. Generate demo image
    demo_res = client.get("/api/demo/generate")
    demo_data = demo_res.json()
    image_b64 = demo_data["dataUri"]

    # 2. Scan with synthetic provider for fast deterministic test
    scan_res = client.post("/api/scan", json={
        "imageBase64": image_b64,
        "ocrProvider": "synthetic"
    })
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert scan_data["success"] is True
    assert scan_data["totalEntitiesDetected"] >= 4
    assert scan_data["riskAssessment"]["privacyRiskRaw"] > 50

    entities = scan_data["entities"]

    # 3. Redact detected entities
    redact_res = client.post("/api/redact", json={
        "imageBase64": image_b64,
        "entities": entities,
        "redactionStyle": "blur"
    })
    assert redact_res.status_code == 200
    redact_data = redact_res.json()
    assert redact_data["success"] is True
    assert redact_data["protectedImageUri"].startswith("data:image/png;base64,")
    assert redact_data["maskedCount"] >= 4
    assert redact_data["assessment"]["privacyRiskAfter"] == 0


def test_history_endpoints():
    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
    assert "metrics" in data
