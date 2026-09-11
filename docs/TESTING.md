# SnapSafe AI — Testing & Quality Assurance
### Comprehensive Test Suite for On-Device Privacy Architecture

---

## 1. Testing Philosophy
Because SnapSafe AI is a privacy and security firewall, zero-false-negatives on high-risk credentials and guaranteed non-leakage of screen data are mandatory requirements.

The test suite validates:
1. **Detection Accuracy:** High precision extraction of emails, phone numbers, student IDs, employee IDs, and API keys.
2. **Entropy Discrimination:** Statistical differentiation of random cryptographic keys from standard English phrases using Shannon entropy.
3. **Card Checksum Integrity:** Luhn Mod-10 checksum validation to eliminate false positives on arbitrary 16-digit blocks.
4. **Visual Bounding Box Mapping:** Geometric point-to-box translation and coordinate integrity.
5. **Redaction Efficacy:** Verification that Gaussian blur, pixelation, and solid blackout mutate target pixels permanently.
6. **API Reliability:** End-to-end testing of FastAPI routes without any network egress.

---

## 2. Test Suite Breakdown

### 2.1 Detection Rules (`tests/test_detection_rules.py`)
- `test_shannon_entropy`: Verifies natural language (< 3.0) vs high-entropy cryptographic strings (> 3.2).
- `test_luhn_checksum_valid`: Verifies valid card numbers pass while corrupted sequences fail.
- `test_email_detection`: Verifies standard personal and university email extraction.
- `test_phone_detection`: Tests Indian (+91) and international mobile formatting.
- `test_api_key_detection`: Tests OpenAI `sk-`, GitHub `ghp_`, and AWS `AKIA` patterns.
- `test_password_detection`: Tests plaintext password key-value identification.
- `test_student_and_employee_id`: Validates academic roll numbers (`STU-...`) and corporate badges (`EMP-...`).
- `test_confidential_document_marker`: Validates detection of "CONFIDENTIAL" and "INTERNAL ONLY".

### 2.2 Risk Engine & Privacy Scoring (`tests/test_risk_engine.py`)
- `test_risk_assessment_calculation`: Verifies that masking all entities reduces Privacy Risk to 0 and lifts Privacy Score to 100.
- `test_privacy_coach_explanation`: Validates contextual threat advice catalog lookups.

### 2.3 Image Redaction Engine (`tests/test_redaction_engine.py`)
- `test_redaction_styles`: Validates Gaussian Blur, Pixelation, and Blackout masking on image buffers.

### 2.4 OCR Providers & Qualcomm Abstraction (`tests/test_ocr_providers.py`)
- `test_bounding_box_from_points`: Validates 4-point polygon to axis-aligned rectangle transformation.
- `test_synthetic_ocr_provider`: Tests synthetic ground-truth engine for instant testing.
- `test_qualcomm_aihub_provider_abstraction`: Validates fallback execution and hardware disclosure.
- `test_ocr_factory`: Verifies provider singleton instantiation.

### 2.5 API Endpoints (`tests/test_api_endpoints.py`)
- `test_root_endpoint`: Tests `/` metadata and zero-cloud indicator.
- `test_health_endpoint`: Tests `/api/health` system telemetry.
- `test_hardware_status_endpoint`: Tests `/api/hardware` profiler.
- `test_demo_generation_endpoint`: Tests `/api/demo/generate` synthetic portal creator.
- `test_scan_and_redact_flow`: End-to-end pipeline test (Scan -> Detect -> Assess -> Redact -> Compare).
- `test_history_endpoints`: Tests SQLite audit logging.

---

## 3. Running Automated Tests

Execute in terminal:
```powershell
python -m pytest tests/ -v
```

Expected output:
```
tests/test_api_endpoints.py::test_root_endpoint PASSED                   [  4%]
tests/test_api_endpoints.py::test_health_endpoint PASSED                 [  9%]
tests/test_api_endpoints.py::test_hardware_status_endpoint PASSED        [ 14%]
tests/test_api_endpoints.py::test_demo_generation_endpoint PASSED        [ 19%]
tests/test_api_endpoints.py::test_scan_and_redact_flow PASSED            [ 23%]
tests/test_api_endpoints.py::test_history_endpoints PASSED               [ 28%]
tests/test_detection_rules.py::test_shannon_entropy PASSED               [ 33%]
tests/test_detection_rules.py::test_luhn_checksum_valid PASSED           [ 38%]
tests/test_detection_rules.py::test_email_detection PASSED               [ 42%]
tests/test_detection_rules.py::test_phone_detection PASSED               [ 47%]
tests/test_detection_rules.py::test_api_key_detection PASSED             [ 52%]
tests/test_detection_rules.py::test_password_detection PASSED            [ 57%]
tests/test_detection_rules.py::test_student_and_employee_id PASSED       [ 61%]
tests/test_detection_rules.py::test_confidential_document_marker PASSED  [ 66%]
tests/test_ocr_providers.py::test_bounding_box_from_points PASSED        [ 71%]
tests/test_ocr_providers.py::test_synthetic_ocr_provider PASSED          [ 76%]
tests/test_ocr_providers.py::test_qualcomm_aihub_provider_abstraction PASSED [ 80%]
tests/test_ocr_providers.py::test_ocr_factory PASSED                     [ 85%]
tests/test_redaction_engine.py::test_redaction_styles PASSED             [ 90%]
tests/test_risk_engine.py::test_risk_assessment_calculation PASSED       [ 95%]
tests/test_risk_engine.py::test_privacy_coach_explanation PASSED         [100%]
======================== 21 passed in 5.09s ========================
```
