Set shell = CreateObject("WScript.Shell")
scriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\start-local-app.ps1"
command = "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """ -Background"
shell.Run command, 0, False
