# SnapSafe AI - Push to GitHub Repository
param (
    [Parameter(Mandatory=$false)]
    [string]$Token
)

$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH
$repoOwner = "harshis1034n-hue"
$repoName = "SNAPDRAGON-AI"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Pushing SnapSafe AI to GitHub: $repoOwner/$repoName" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not $Token) {
    Write-Host "`nTo push to GitHub, a Personal Access Token (classic with 'repo' scope) is required." -ForegroundColor Yellow
    $Token = Read-Host -Prompt "Enter your GitHub Personal Access Token"
}

if (-not $Token) {
    Write-Host "No token provided. Aborting push." -ForegroundColor Red
    exit 1
}

$authenticatedUrl = "https://${Token}@github.com/${repoOwner}/${repoName}.git"
Write-Host "`nPushing main branch to GitHub..." -ForegroundColor Yellow

& "C:\Program Files\Git\cmd\git.exe" push -u $authenticatedUrl main:main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Successfully pushed SnapSafe AI to:" -ForegroundColor Green
    Write-Host "  Repository: https://github.com/$repoOwner/$repoName" -ForegroundColor Green
    Write-Host "  GitHub Pages: https://$repoOwner.github.io/$repoName/" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Push failed. Please verify your Personal Access Token and repository permissions." -ForegroundColor Red
}
