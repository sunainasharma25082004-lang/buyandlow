param(
  [string]$WifiIp
)

if (-not $WifiIp) {
  $WifiIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      ($_.InterfaceAlias -match "Wi-?Fi|Wireless")
    } |
    Select-Object -First 1 -ExpandProperty IPAddress

  if (-not $WifiIp) {
    $WifiIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -match "^192\.168\." } |
      Select-Object -First 1 -ExpandProperty IPAddress
  }
}

if (-not $WifiIp) {
  Write-Host "WiFi IP not found - set .env manually" -ForegroundColor Yellow
  exit 1
}

$envPath = Join-Path $PSScriptRoot "..\.env"
$apiLine = "EXPO_PUBLIC_API_URL=http://${WifiIp}:5000/api"
$comment = "# Auto-set by start script - PC WiFi IP for backend API"

$lines = @()
if (Test-Path $envPath) {
  $lines = Get-Content $envPath | Where-Object {
    $_ -notmatch '^\s*EXPO_PUBLIC_API_URL\s*='
  }
}

$header = $lines | Where-Object { $_ -match '^\s*#' -or $_ -eq '' } | Select-Object -First 3
$rest = $lines | Where-Object { $_ -notmatch '^\s*#' -and $_ -ne '' }

$newContent = @(
  $comment
  $apiLine
  ''
) + $rest

[System.IO.File]::WriteAllLines($envPath, $newContent)
Write-Host "API URL set: http://${WifiIp}:5000/api" -ForegroundColor Green