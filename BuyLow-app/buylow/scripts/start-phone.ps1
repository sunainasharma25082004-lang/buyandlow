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

function Ensure-FirewallRule {
  param([int]$Port)
  $ruleName = "BuyLow Expo Metro $Port"
  $null = netsh advfirewall firewall show rule name="$ruleName" 2>$null
  if ($LASTEXITCODE -eq 0) { return $true }

  Write-Host "Adding Windows Firewall rule for TCP port $Port..."
  $null = netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=$Port 2>&1
  return ($LASTEXITCODE -eq 0)
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

$wifiIp = Get-WifiIPv4
& (Join-Path $PSScriptRoot "sync-api-env.ps1") -WifiIp $wifiIp | Out-Null

if (-not $wifiIp) {
  Write-Host ""
  Write-Host "WiFi IP nahi mili. Tunnel mode try karo: npm run start:tunnel" -ForegroundColor Yellow
  Write-Host ""
} else {
  $env:REACT_NATIVE_PACKAGER_HOSTNAME = $wifiIp
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "  BuyLow - Phone pe chalane ke liye" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "1. Phone aur PC SAME WiFi pe hon" -ForegroundColor White
  Write-Host "2. Play Store se 'Expo Go' install karo (latest version)" -ForegroundColor White
  Write-Host "3. Expo Go kholo -> Scan QR code" -ForegroundColor White
  Write-Host ""
  Write-Host "Manual URL (Expo Go mein):" -ForegroundColor Green
  Write-Host "   exp://${wifiIp}:8081" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Backend API: http://${wifiIp}:5000/api" -ForegroundColor Green
  Write-Host "Phone + PC same WiFi hon. Firewall: scripts\allow-expo-firewall.bat (admin)" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Web URL mat dalo! Sirf exp:// wala URL Expo Go mein." -ForegroundColor Red
  Write-Host ""
}

$fw1 = Ensure-FirewallRule -Port 8081
$fw2 = Ensure-FirewallRule -Port 8082
if (-not $fw1 -or -not $fw2) {
  Write-Host ""
  Write-Host "Firewall rule add nahi hui (Admin chahiye)." -ForegroundColor Yellow
  Write-Host "Right-click -> Run as Administrator:" -ForegroundColor Yellow
  Write-Host "   scripts\allow-expo-firewall.bat" -ForegroundColor Yellow
  Write-Host "Ya tunnel use karo: npm run start:tunnel" -ForegroundColor Yellow
  Write-Host ""
}
Stop-PortListener -Port 8081

if ($env:CI) { Remove-Item Env:CI }

npx expo start --clear --lan