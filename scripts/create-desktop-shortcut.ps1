param(
    [string]$ShortcutName = 'WapaPizzaParty'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "$ShortcutName.lnk"
$targetPath = Join-Path $projectRoot 'scripts\start-local-app.cmd'
$iconPath = Join-Path $projectRoot 'frontend\public\favicon.ico'

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $projectRoot
$shortcut.WindowStyle = 1
$shortcut.Description = 'Abrir WapaPizzaParty en esta PC'

if (Test-Path $iconPath) {
    $shortcut.IconLocation = $iconPath
}

$shortcut.Save()

Write-Host "Acceso directo creado en $shortcutPath" -ForegroundColor Green
