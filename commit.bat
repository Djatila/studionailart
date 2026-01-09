@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Atualizado CSP para permitir webhook do easypanel"
"C:\Program Files\Git\cmd\git.exe" push
pause
