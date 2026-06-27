# Prints Google Cloud Console URLs to fix origin_mismatch for BuyLow.
$ErrorActionPreference = "SilentlyContinue"
Set-Location $PSScriptRoot\..

$clientId = (Get-Content .env -ErrorAction SilentlyContinue | Where-Object { $_ -match '^EXPO_PUBLIC_GOOGLE_CLIENT_ID=' }) -replace '^EXPO_PUBLIC_GOOGLE_CLIENT_ID=', ''
if (-not $clientId) { $clientId = 'YOUR_WEB_CLIENT_ID' }

$wifiIp = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -match '^192\.168\.' } |
  Select-Object -First 1 -ExpandProperty IPAddress
)
if (-not $wifiIp) { $wifiIp = '192.168.1.7' }

$clientPrefix = $clientId -replace '\.apps\.googleusercontent\.com$', ''
$reverseRedirect = "com.googleusercontent.apps.${clientPrefix}:/oauthredirect"

Write-Host ""
Write-Host "=== Google Cloud Console fix (origin_mismatch) ===" -ForegroundColor Cyan
Write-Host "Open: https://console.cloud.google.com/apis/credentials" -ForegroundColor Yellow
Write-Host "Edit Web Client: $clientId" -ForegroundColor White
Write-Host ""
Write-Host "Authorized JavaScript origins (ADD ALL):" -ForegroundColor Green
@(
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://$wifiIp`:8081"
) | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "Authorized redirect URIs (ADD ALL):" -ForegroundColor Green
@(
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  "buylow://oauthredirect",
  $reverseRedirect
) | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "OAuth consent screen -> Test users -> add your Gmail:" -ForegroundColor Green
Write-Host "  rajammy1234567@gmail.com" -ForegroundColor White
Write-Host "  (and sunaina email)" -ForegroundColor White
Write-Host ""
Write-Host "Expo Go Android (optional separate Android OAuth client):" -ForegroundColor Green
Write-Host "  Package: host.exp.exponent" -ForegroundColor White
Write-Host "  SHA-1:   58:FB:04:42:84:66:F3:DC:9F:26:36:86:B3:66:0F:86:7F:EE:FC:BA" -ForegroundColor White
Write-Host ""