# Ek hi Web Client — Android + iOS + Web + Phone
$ErrorActionPreference = "SilentlyContinue"
Set-Location $PSScriptRoot\..

$webClientId = (Get-Content .env -ErrorAction SilentlyContinue | Where-Object { $_ -match '^EXPO_PUBLIC_GOOGLE_CLIENT_ID=' }) -replace '^EXPO_PUBLIC_GOOGLE_CLIENT_ID=', ''
if (-not $webClientId) { $webClientId = '124278808285-9s2plnjkf2b5doljeaqll62k0it11hlc.apps.googleusercontent.com' }

Write-Host ""
Write-Host "=== EK HI WEB CLIENT — sab platforms ===" -ForegroundColor Cyan
Write-Host "Client ID: $webClientId" -ForegroundColor White
Write-Host ""
Write-Host "1) JavaScript origins:" -ForegroundColor Magenta
Write-Host "   https://buyandlow-frontend.onrender.com" -ForegroundColor Yellow
Write-Host "   http://localhost:5173  (optional local)" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "2) Redirect URIs (SIRF https/http — 2 URLs):" -ForegroundColor Magenta
@(
  "https://buyandlow-api.onrender.com/auth/google/callback",
  "http://localhost:5000/auth/google/callback"
) | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
Write-Host ""
Write-Host "   buylow:// YA com.googleusercontent... — MAT dalo (invalid on Web client)" -ForegroundColor Red
Write-Host ""
Write-Host "3) Render API par env vars (buyandlow-api service):" -ForegroundColor Magenta
Write-Host "   GOOGLE_CLIENT_ID=$webClientId" -ForegroundColor Yellow
Write-Host "   GOOGLE_CLIENT_SECRET=GOCSPX-..." -ForegroundColor Yellow
Write-Host ""
Write-Host "4) Test user: rajammy1234567@gmail.com (OAuth consent screen)" -ForegroundColor Magenta
Write-Host ""