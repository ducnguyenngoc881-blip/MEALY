@echo off
title Push MealWise to GitHub (Exia9526/Daily-meal)
cd /d %~dp0
echo ===============================================================
echo        MEALWISE - DAY MA NGUON LEN GITHUB REPOSITORY
echo ===============================================================
echo Repository: https://github.com/Exia9526/Daily-meal.git
echo.
echo Dang thuc hien lenh: git push -u origin main
echo (Neu co cua so GitHub hien len, vui long chon Sign in with your browser)
echo ===============================================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ===============================================================
    echo [THANH CONG] Toan bo ma nguon da duoc day len GitHub thanh cong!
    echo Link: https://github.com/Exia9526/Daily-meal
    echo ===============================================================
) else (
    echo ===============================================================
    echo [CHUA HOAN TAT] Vui long kiem tra xac thuc tai khoan GitHub.
    echo ===============================================================
)
echo.
pause
