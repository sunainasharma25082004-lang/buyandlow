# Copies .env.example → .env for each app (skips if .env already exists).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$pairs = @(
  @{ Example = "server\.env.example"; Env = "server\.env" },
  @{ Example = "admin\.env.example"; Env = "admin\.env" },
  @{ Example = "client\.env.example"; Env = "client\.env" },
  @{ Example = "BuyLow-app\buylow\.env.example"; Env = "BuyLow-app\buylow\.env" }
)

foreach ($pair in $pairs) {
  $examplePath = Join-Path $root $pair.Example
  $envPath = Join-Path $root $pair.Env

  if (-not (Test-Path $examplePath)) {
    Write-Warning "Missing: $($pair.Example)"
    continue
  }

  if (Test-Path $envPath) {
    Write-Host "Skip (exists): $($pair.Env)"
    continue
  }

  Copy-Item $examplePath $envPath
  Write-Host "Created: $($pair.Env) from $($pair.Example)"
}

Write-Host ""
Write-Host "Edit server\.env with your MongoDB URI and JWT_SECRET before running the API."