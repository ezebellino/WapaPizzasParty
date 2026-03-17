@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0create-desktop-shortcut.ps1" %*
