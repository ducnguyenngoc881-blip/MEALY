@echo off
chcp 65001 >nul
title MealWise - PUSH TO NGROK FOR TEAM TESTING
echo ======================================================================
echo           MEALWISE - KẾT NỐI NGROK ĐỂ TEAM TEST TỪ XA                 
echo ======================================================================
echo.
echo [*] Kiểm tra Authtoken Ngrok...
if "%1"=="" (
    echo [!] Nếu bạn có Authtoken Ngrok, hãy nhập bên dưới.
    echo     (Đăng ký và lấy token miễn phí tại: https://dashboard.ngrok.com/signup)
    echo.
    set /p USER_TOKEN="Nhập Ngrok Authtoken của bạn (hoặc nhấn ENTER để bỏ qua): "
) else (
    set USER_TOKEN=%1
)

if not "%USER_TOKEN%"=="" (
    echo [*] Đang thiết lập authtoken...
    call npx ngrok config add-authtoken %USER_TOKEN%
)

echo.
echo [*] Đang mở đường truyền Ngrok kết nối cổng 5173...
call npx ngrok http 5173
pause
