@echo off
title MealWise Portable Desktop
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\portable-server.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [THONG BAO] Khong the chay bang PowerShell, dang thu bang trinh chay MealWise.exe...
    if exist "%~dp0MealWise.exe" (
        start "" "%~dp0MealWise.exe"
    ) else (
        pause
    )
)
