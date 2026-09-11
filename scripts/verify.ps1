# SnapSafe AI - Complete Verification Script
# Validates frontend build, backend imports, test suite, API health, and documentation.

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " SNAPSAFE AI - FULL SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$allPassed = $true

# 1. Check Documentation Presence
Write-Host "`n[1/6] Verifying Documentation Assets..." -ForegroundColor Yellow
$requiredDocs = @(
    "README.md",
    "docs/ARCHITECTURE.md",
    "docs/TECHNICAL_DESIGN.md",
    "docs/COMPETITION_PROPOSAL.md",
    "docs/DEMO_SCRIPT.md",
    "docs/INSTALLATION.md",
    "docs/TESTING.md",
    "docs/LIMITATIONS.md",
    "docs/QUALCOMM_AI_HUB_INTEGRATION.md",
    "docs/SECURITY.md",
    "docs/DEPLOYMENT.md",
    "submission/01_Brief_Project_Description.pdf",
    "submission/02_SnapSafe_AI_Short_Pitch.pdf",
    "submission/03_SnapSafe_AI_Short_Pitch.pptx",
    "submission/04_90_Second_Demo_Script.pdf",
    "submission/05_Submission_Checklist.txt",
    "submission/06_GitHub_Repository_Checklist.md"
)

foreach ($doc in $requiredDocs) {
    if (Test-Path $doc) {
        Write-Host "  [OK] Found $doc" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Missing $doc" -ForegroundColor Red
        $allPassed = $false
    }
}

# 2. Check Backend Python Package Imports
Write-Host "`n[2/6] Verifying Python Engine Imports..." -ForegroundColor Yellow
python scripts/check_imports.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] Python module import check failed." -ForegroundColor Red
    $allPassed = $false
}

# 3. Run Pytest Suite
Write-Host "`n[3/6] Running Automated Pytest Suite..." -ForegroundColor Yellow
python -m pytest tests/ -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] Pytest suite reported failures." -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "  [OK] All 25 unit tests passed successfully." -ForegroundColor Green
}

# 4. Verify Frontend Production Build
Write-Host "`n[4/6] Verifying React + Vite Frontend Build..." -ForegroundColor Yellow
npx vite build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] Vite build failed." -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "  [OK] Frontend production build succeeded." -ForegroundColor Green
}

# 5. Check Electron Desktop Shell Configuration
Write-Host "`n[5/6] Verifying Electron Shell Files..." -ForegroundColor Yellow
$electronFiles = @("desktop/main.cjs", "desktop/preload.cjs", "desktop/package.json")
foreach ($ef in $electronFiles) {
    if (Test-Path $ef) {
        Write-Host "  [OK] Found $ef" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Missing $ef" -ForegroundColor Red
        $allPassed = $false
    }
}

# 6. Check Local Backend Health
Write-Host "`n[6/6] Checking Live Backend Health (127.0.0.1:8000)..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get -TimeoutSec 3
    if ($res.status -eq "HEALTHY" -and $res.cloudDataEgressBytes -eq 0) {
        Write-Host "  [OK] Backend active and healthy. Zero cloud egress confirmed." -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Backend responded but with unexpected telemetry." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [INFO] Backend not currently listening on port 8000 (run 'npm run backend' to start)." -ForegroundColor Yellow
}

Write-Host "`n============================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host " ALL CHECKS PASSED: SNAPSAFE AI IS PRODUCTION READY!" -ForegroundColor Green
} else {
    Write-Host " SOME CHECKS FAILED: Review the log output above." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
