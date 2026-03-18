param(
    [string]$OutputDir = (Join-Path (Split-Path -Parent $PSScriptRoot) 'portable-build'),
    [string]$EmbeddedPythonVersion = '3.12.8',
    [switch]$CreateZip
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$packageRoot = Join-Path $OutputDir 'WapaPizzaParty'

$sourceFrontendDist = Join-Path $projectRoot 'frontend\dist'
$sourceFavicon = Join-Path $projectRoot 'frontend\public\favicon.ico'
$sourceBackend = Join-Path $projectRoot 'backend'
$sourceVenv = Join-Path $projectRoot 'venv'
$sourceSitePackages = Join-Path $sourceVenv 'Lib\site-packages'
$sourceReadme = Join-Path $projectRoot 'README.md'
$sourcePlan = Join-Path $projectRoot 'PLAN_WAPAPIZZAPARTY_LOCAL.md'
$sourceEnv = Join-Path $sourceBackend '.env'
$sourceEnvExample = Join-Path $sourceBackend '.env.example'
$runtimeCacheDir = Join-Path $projectRoot 'runtime-cache'
$embeddedZipName = "python-$EmbeddedPythonVersion-embed-amd64.zip"
$embeddedZipPath = Join-Path $runtimeCacheDir $embeddedZipName
$embeddedZipUrl = "https://www.python.org/ftp/python/$EmbeddedPythonVersion/$embeddedZipName"

if (-not (Test-Path $sourceFrontendDist)) {
    throw 'No se encontro frontend/dist. Compila el frontend antes de armar el paquete portable.'
}

if (-not (Test-Path $sourceSitePackages)) {
    throw 'No se encontro la carpeta de dependencias de Python del proyecto.'
}

if (-not (Test-Path $embeddedZipPath)) {
    New-Item -ItemType Directory -Force $runtimeCacheDir | Out-Null
    Write-Host "Descargando Python embeddable $EmbeddedPythonVersion..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $embeddedZipUrl -OutFile $embeddedZipPath
}

if (Test-Path $OutputDir) {
    Remove-Item -Recurse -Force $OutputDir
}

New-Item -ItemType Directory -Force $packageRoot | Out-Null
New-Item -ItemType Directory -Force (Join-Path $packageRoot 'backend') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $packageRoot 'frontend\public') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $packageRoot 'runtime\python') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $packageRoot 'scripts') | Out-Null

Copy-Item (Join-Path $sourceBackend 'app') (Join-Path $packageRoot 'backend\app') -Recurse -Force
Copy-Item $sourceFrontendDist (Join-Path $packageRoot 'frontend\dist') -Recurse -Force
Expand-Archive -Path $embeddedZipPath -DestinationPath (Join-Path $packageRoot 'runtime\python') -Force
Copy-Item $sourceSitePackages (Join-Path $packageRoot 'runtime\python\site-packages') -Recurse -Force

if (Test-Path $sourceEnv) {
    Copy-Item $sourceEnv (Join-Path $packageRoot 'backend\.env') -Force
} elseif (Test-Path $sourceEnvExample) {
    Copy-Item $sourceEnvExample (Join-Path $packageRoot 'backend\.env') -Force
}

if (Test-Path $sourceFavicon) {
    Copy-Item $sourceFavicon (Join-Path $packageRoot 'frontend\public\favicon.ico') -Force
}

Copy-Item $sourceReadme (Join-Path $packageRoot 'README.md') -Force
Copy-Item $sourcePlan (Join-Path $packageRoot 'PLAN_WAPAPIZZAPARTY_LOCAL.md') -Force

Copy-Item (Join-Path $projectRoot 'scripts\start-portable-app.ps1') (Join-Path $packageRoot 'scripts\start-portable-app.ps1') -Force
Copy-Item (Join-Path $projectRoot 'scripts\launch-portable-app-hidden.vbs') (Join-Path $packageRoot 'scripts\launch-portable-app-hidden.vbs') -Force
Copy-Item (Join-Path $projectRoot 'scripts\create-portable-shortcut.ps1') (Join-Path $packageRoot 'scripts\create-portable-shortcut.ps1') -Force

@'
@echo off
powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0start-portable-app.ps1" -Background
'@ | Set-Content -Path (Join-Path $packageRoot 'scripts\start-portable-app.cmd') -Encoding ASCII

@'
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0create-portable-shortcut.ps1"
'@ | Set-Content -Path (Join-Path $packageRoot 'scripts\create-portable-shortcut.cmd') -Encoding ASCII

@'
WapaPizzaParty portable

1. Ejecutar scripts\create-portable-shortcut.cmd para crear el acceso directo.
2. Abrir la app desde el acceso directo o desde scripts\start-portable-app.cmd
3. La app corre en http://127.0.0.1:8000

Importante:
- Esta carpeta debe mantenerse completa.
- No mover archivos internos por separado.
- La carpeta backend\app contiene datos locales del negocio.
'@ | Set-Content -Path (Join-Path $packageRoot 'LEEME-PORTABLE.txt') -Encoding UTF8

Remove-Item -Recurse -Force (Join-Path $packageRoot 'backend\app\__pycache__') -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force (Join-Path $packageRoot 'backend\app\logs') -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force (Join-Path $packageRoot 'backend\app\logs') | Out-Null
Remove-Item -Recurse -Force (Join-Path $packageRoot 'runtime\python\site-packages\pip*') -ErrorAction SilentlyContinue

$pthFile = Get-ChildItem (Join-Path $packageRoot 'runtime\python') -Filter 'python*._pth' | Select-Object -First 1
if (-not $pthFile) {
    throw 'No se encontro el archivo ._pth del runtime embeddable.'
}

@'
python312.zip
.
site-packages
..\..\backend
import site
'@ | Set-Content -Path $pthFile.FullName -Encoding ASCII

if ($CreateZip) {
    $zipPath = Join-Path $OutputDir 'WapaPizzaParty-portable.zip'
    if (Test-Path $zipPath) {
        Remove-Item -Force $zipPath
    }

    Compress-Archive -Path (Join-Path $packageRoot '*') -DestinationPath $zipPath
    Write-Host "Paquete portable comprimido en $zipPath" -ForegroundColor Green
} else {
    Write-Host "Paquete portable creado en $packageRoot" -ForegroundColor Green
}
