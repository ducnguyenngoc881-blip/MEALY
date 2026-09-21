@echo off
title MealWise 1-Click Plug and Play Installer
node "%~dp0scripts\install-to-phone.js"
if %ERRORLEVEL% neq 0 (
    echo.
    echo Da xay ra loi trong qua trinh khoi chay.
    pause
)
