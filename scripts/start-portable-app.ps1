param(
    [switch]$NoBrowser,
    [switch]$SameWindow,
    [switch]$Background
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$pythonHome = Join-Path $projectRoot 'runtime\python'
$pythonPath = Join-Path $pythonHome 'python.exe'
$appUrl = 'http://127.0.0.1:8000'

function Stop-ExistingBackendOnPort8000 {
    try {
        $listeners = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction Stop
    } catch {
        return
    }

    foreach ($listener in $listeners) {
        if (-not $listener.OwningProcess) {
            continue
        }

        try {
            Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop
            Start-Sleep -Milliseconds 300
        } catch {
        }
    }
}

if (-not (Test-Path $pythonPath)) {
    throw "No se encontro el runtime portable de Python en $pythonPath"
}

$backendCommand = "& '$pythonPath' -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

Stop-ExistingBackendOnPort8000

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
