$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Get-WifiIPv4 {
  $ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      ($_.InterfaceAlias -match "Wi-?Fi|Wireless")
    } |
    Select-Object -First 1 -ExpandProperty IPAddress

  if ($ip) { return $ip }

  return (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -match "^192\.168\." } |
    Select-Object -First 1 -ExpandProperty IPAddress)
}

function Stop-PortListener {
  param([int]$Port)
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $connections) {
    $procId = $conn.OwningProcess
    if ($procId -and $procId -ne 0) {
      Write-Host "Stopping old process on port ${Port} (PID $procId)..."
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Seconds 1
}

function Wait-ForApiTunnel {
  param([int]$Seconds = 30)
  $envPath = Join-Path $PSScriptRoot "..\.env"
  $deadline = (Get-Date).AddSeconds($Seconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-Path $envPath) {
      $content = Get-Content $envPath -Raw
      if ($content -match 'EXPO_PUBLIC_API_URL=https?://[^\s]+loca\.lt/api') {
        return $true
      }
    }
    Start-Sleep -Seconds 1
  }
  return $false
}

$wifiIp = Get-WifiIPv4

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuyLow Phone Dev (API tunnel + LAN)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Stop-PortListener -Port 8081
if ($env:CI) { Remove-Item Env:CI }

Write-Host "[1/2] API tunnel start (products ke liye)..." -ForegroundColor Yellow
$apiTunnel = Start-Process -FilePath "node" `
  -ArgumentList (Join-Path $PSScriptRoot "api-tunnel.js") `
  -PassThru -WindowStyle Hidden

if (Wait-ForApiTunnel) {
  $apiLine = Get-Content (Join-Path $PSScriptRoot "..\.env") | Where-Object { $_ -match 'EXPO_PUBLIC_API_URL=' } | Select-Object -First 1
  Write-Host "      API ready: $apiLine" -ForegroundColor Green
} else {
  Write-Host "      API tunnel slow - WiFi IP fallback" -ForegroundColor Yellow
  if ($wifiIp) {
    & (Join-Path $PSScriptRoot "sync-api-env.ps1") -WifiIp $wifiIp | Out-Null
  }
}

Write-Host ""
Write-Host "[2/2] Expo LAN mode (ngrok nahi - timeout fix)..." -ForegroundColor Yellow

if ($wifiIp) {
  $env:REACT_NATIVE_PACKAGER_HOSTNAME = $wifiIp
  Write-Host ""
  Write-Host "Phone + PC SAME WiFi pe hon" -ForegroundColor White
  Write-Host "Expo Go -> Scan QR ya URL:" -ForegroundColor White
  Write-Host "   exp://${wifiIp}:8081" -ForegroundColor Green
  Write-Host ""
  Write-Host "Firewall (ek baar admin se):" -ForegroundColor Yellow
  Write-Host "   scripts\allow-expo-firewall.bat" -ForegroundColor Yellow
  Write-Host ""
} else {
  Write-Host "WiFi IP nahi mili - QR scan try karo" -ForegroundColor Yellow
}

try {
  npx expo start --clear --lan
} finally {
  if ($apiTunnel -and -not $apiTunnel.HasExited) {
    Stop-Process -Id $apiTunnel.Id -Force -ErrorAction SilentlyContinue
  }
}