[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "           MEALWISE - TRÌNH CÀI ĐẶT 1-CHẠM PLUG & PLAY CHO ĐIỆN THOẠI          " -ForegroundColor Yellow
Write-Host "                (CẮM CÁP USB -> TỰ ĐỘNG CÀI ĐẶT VÀ MỞ ỨNG DỤNG)                " -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$AdbPath = Join-Path $ProjectRoot "tools\adb\adb.exe"
$ApkPath = Join-Path $ProjectRoot "MealWise.apk"

if (-not (Test-Path $ApkPath)) {
    $ApkPath = Join-Path $ProjectRoot "dist\MealWise.apk"
}

if (-not (Test-Path $ApkPath)) {
    Write-Host "[LỖI] Không tìm thấy file MealWise.apk!" -ForegroundColor Red
    exit 1
}

$apkSizeMB = [math]::Round(((Get-Item $ApkPath).Length / 1MB), 2)
Write-Host "[*] File cài đặt: MealWise.apk ($apkSizeMB MB)" -ForegroundColor Gray
Write-Host "[*] Đang khởi động kết nối..." -ForegroundColor Gray
& $AdbPath start-server | Out-Null

$maxAttempts = 60
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $devicesRaw = & $AdbPath devices
    $lines = $devicesRaw -split "`r?`n" | Where-Object { $_ -and $_ -notmatch "List of devices attached" }
    
    $authorizedDevice = $null
    $unauthorizedDevice = $null
    
    foreach ($line in $lines) {
        $parts = $line -split "\s+"
        if ($parts.Count -ge 2) {
            $id = $parts[0]
            $status = $parts[1]
            if ($status -eq "device") {
                $authorizedDevice = $id
                break
            } elseif ($status -eq "unauthorized") {
                $unauthorizedDevice = $id
            }
        }
    }
    
    if ($authorizedDevice) {
        Write-Host ""
        Write-Host "===============================================================================" -ForegroundColor Green
        Write-Host "  [ĐÃ KẾT NỐI] Phát hiện điện thoại Android: $authorizedDevice" -ForegroundColor Green
        Write-Host "===============================================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "[..] Đang cài đặt MealWise.apk trực tiếp vào điện thoại của bạn..." -ForegroundColor Yellow
        
        $installResult = & $AdbPath -s $authorizedDevice install -r -d -g $ApkPath
        Write-Host $installResult
        
        if ($installResult -match "Success") {
            Write-Host ""
            Write-Host "===============================================================================" -ForegroundColor Green
            Write-Host "  🎉 [THÀNH CÔNG RỰC RỠ] ĐÃ CÀI ĐẶT MEALWISE THÀNH CÔNG 100%!" -ForegroundColor Green
            Write-Host "  Không cần bất kỳ app thứ 3 nào, không cần Zalo, Google Drive hay trình duyệt!" -ForegroundColor Green
            Write-Host "===============================================================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "[..] Đang tự động mở ứng dụng trên màn hình điện thoại..." -ForegroundColor Cyan
            & $AdbPath -s $authorizedDevice shell am start -n com.mealwise.app/com.mealwise.app.MainActivity | Out-Null
            Write-Host "[OK] Ứng dụng MealWise đã hiển thị trên màn hình điện thoại!" -ForegroundColor Green
            Write-Host ""
            break
        } else {
            Write-Host "[CẢNH BÁO] Quá trình cài đặt chưa thành công: $installResult" -ForegroundColor Yellow
            break
        }
    } elseif ($unauthorizedDevice) {
        Clear-Host
        Write-Host "===============================================================================" -ForegroundColor Yellow
        Write-Host "  ĐÃ PHÁT HIỆN ĐIỆN THOẠI ($unauthorizedDevice) NHƯNG CẦN XÁC NHẬN TRÊN MÀN HÌNH!" -ForegroundColor Yellow
        Write-Host "===============================================================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  👉 Mở khóa màn hình điện thoại của bạn ngay bây giờ." -ForegroundColor White
        Write-Host "  👉 Bạn sẽ thấy thông báo: 'Cho phép gỡ lỗi USB?' (Allow USB debugging?)." -ForegroundColor White
        Write-Host "  👉 Tích vào ô: 'Luôn cho phép từ máy tính này' (Always allow)." -ForegroundColor White
        Write-Host "  👉 Bấm [CHO PHÉP] / [OK]." -ForegroundColor Green
        Write-Host ""
        Write-Host "  (Script đang tự động đợi bạn bấm Cho phép...)" -ForegroundColor Gray
    } else {
        if ($attempt -eq 0) {
            Write-Host ""
            Write-Host "===============================================================================" -ForegroundColor Cyan
            Write-Host "  CHƯA CẮM CÁP USB HOẶC CHƯA BẬT GỠ LỖI USB TRÊN ĐIỆN THOẠI" -ForegroundColor Cyan
            Write-Host "===============================================================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  👉 BƯỚC 1: Cắm cáp sạc USB nối điện thoại vào máy tính." -ForegroundColor White
            Write-Host "  👉 BƯỚC 2: Bật Gỡ lỗi USB (Chỉ cần làm 1 lần duy nhất trong 15 giây):" -ForegroundColor White
            Write-Host "     1. Mở Cài đặt (Settings) trên điện thoại -> Thông tin điện thoại (About phone)" -ForegroundColor Gray
            Write-Host "     2. Chạm 7 lần liên tục vào 'Số hiệu bản dựng' (Build number)" -ForegroundColor Gray
            Write-Host "     3. Quay lại Cài đặt -> Tùy chọn nhà phát triển -> Bật 'Gỡ lỗi USB' (USB Debugging)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  Đang quét tìm thiết bị tự động mỗi giây (Cắm cáp vào là tự chạy)..." -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 2
    $attempt++
}
