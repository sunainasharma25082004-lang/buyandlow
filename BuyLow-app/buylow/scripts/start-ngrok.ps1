$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not $env:NGROK_AUTHTOKEN -and (Test-Path (Join-Path $PSScriptRoot "..\.env"))) {
  Get-Content (Join-Path $PSScriptRoot "..\.env") | ForEach-Object {
    if ($_ -match '^\s*NGROK_AUTHTOKEN\s*=\s*(.+)\s*$') {
      $env:NGROK_AUTHTOKEN = $matches[1].Trim()
    }
  }
}

if (-not $env:NGROK_AUTHTOKEN) {
  Write-Host ""
  Write-Host "NGROK_AUTHTOKEN missing!" -ForegroundColor Red
  Write-Host "Free token: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Yellow
  Write-Host ".env mein add karo: NGROK_AUTHTOKEN=your_token" -ForegroundColor Yellow
  Write-Host "Ya npm run start:tunnel use karo (recommended, ngrok nahi chahiye)" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

function Stop-PortListener {
  param([int]$Port)
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.OwningProcess) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
  }
  Start-Sleep -Seconds 1
}

Write-Host "API tunnel + ngrok Expo tunnel..." -ForegroundColor Cyan
Stop-PortListener -Port 8081
if ($env:CI) { Remove-Item Env:CI }

$apiTunnel = Start-Process -FilePath "node" `
  -ArgumentList (Join-Path $PSScriptRoot "api-tunnel.js") `
  -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 8

try {
  npx expo start --clear --tunnel
} finally {
  if ($apiTunnel -and -not $apiTunnel.HasExited) {
    Stop-Process -Id $apiTunnel.Id -Force -ErrorAction SilentlyContinue
  }
}