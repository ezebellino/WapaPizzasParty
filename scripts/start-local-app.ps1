param(
    [switch]$BuildFrontend,
    [switch]$NoBrowser,
    [switch]$SameWindow,
    [switch]$Background
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
$frontendDist = Join-Path $frontendPath 'dist'
$appUrl = 'http://127.0.0.1:8000'
$backendCommand = "..\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000"

if ($BuildFrontend -or -not (Test-Path $frontendDist)) {
    Write-Host "Compilando frontend para modo local..." -ForegroundColor Cyan
    Push-Location $frontendPath
    try {
        npm.cmd run build
    } finally {
        Pop-Location
    }
}

if ($SameWindow) {
    if (-not $NoBrowser) {
        Start-Job -ScriptBlock {
            Start-Sleep -Seconds 2
            Start-Process 'http://127.0.0.1:8000'
        } | Out-Null
    }

    Set-Location $backendPath
    Invoke-Expression $backendCommand
    exit 0
}

$backendArgumentList = @(
    '-Command',
    "Set-Location '$backendPath'; $backendCommand"
)

if ($Background) {
    Start-Process powershell -WindowStyle Hidden -ArgumentList $backendArgumentList
} else {
    Start-Process powershell -ArgumentList @(
        '-NoExit',
        '-Command',
        "Set-Location '$backendPath'; $backendCommand"
    )
}

if (-not $NoBrowser) {
    Start-Sleep -Seconds 2
    Start-Process $appUrl
}

if (-not $Background) {
    Write-Host "WapaPizzaParty local iniciada en $appUrl" -ForegroundColor Green
}
