param(
    [switch]$SameWindow
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
$backendCommand = "..\venv\Scripts\uvicorn app.main:app --reload"
$frontendCommand = "npm run dev"

if ($SameWindow) {
    Write-Host "Inicia el backend en una terminal y el frontend en otra para mantener ambos procesos activos." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Backend:" -ForegroundColor Cyan
    Write-Host "cd `"$backendPath`""
    Write-Host $backendCommand
    Write-Host ""
    Write-Host "Frontend:" -ForegroundColor Cyan
    Write-Host "cd `"$frontendPath`""
    Write-Host $frontendCommand
    exit 0
}

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$backendPath'; $backendCommand"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$frontendPath'; $frontendCommand"
)

Write-Host "Backend y frontend lanzados en ventanas separadas." -ForegroundColor Green
