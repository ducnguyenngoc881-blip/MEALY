[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "MealWise Portable - Máy Chủ Nội Bộ"

$baseDir = $PSScriptRoot
if (-not (Test-Path (Join-Path $baseDir "index.html"))) {
    $parent = Split-Path -Parent $baseDir
    if (Test-Path (Join-Path $parent "index.html")) {
        $baseDir = $parent
    }
}

Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "                    MEALWISE - PHIÊN BẢN MÁY TÍNH PORTABLE                     " -ForegroundColor Yellow
Write-Host "            (Chạy ngay trên mọi máy tính - Không cần cài đặt Node.js)           " -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

$port = 5173
$listener = $null

while ($port -le 5250) {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
        $listener.Start()
        break
    } catch {
        if ($listener) { $listener.Close() }
        $port++
    }
}

if (-not $listener -or -not $listener.IsListening) {
    Write-Host "[LỖI] Không thể mở cổng mạng nội bộ." -ForegroundColor Red
    Read-Host "Bấm Enter để thoát..."
    exit 1
}

$url = "http://localhost:$port/"
Write-Host "[*] Thư mục ứng dụng: $baseDir" -ForegroundColor Gray
Write-Host "[*] Máy chủ nội bộ đang hoạt động tại: $url" -ForegroundColor Green
Write-Host "[*] Đang tự động mở trình duyệt web..." -ForegroundColor Cyan

Start-Process $url

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host "  LƯU Ý: Giữ nguyên cửa sổ này trong suốt quá trình sử dụng MealWise." -ForegroundColor White
Write-Host "  Khi muốn tắt ứng dụng, bạn chỉ việc ĐÓNG CỬA SỔ NÀY là xong!" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host ""

$mimeTypes = @{
    ".html"        = "text/html; charset=utf-8"
    ".js"          = "application/javascript; charset=utf-8"
    ".mjs"         = "application/javascript; charset=utf-8"
    ".css"         = "text/css; charset=utf-8"
    ".json"        = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json; charset=utf-8"
    ".svg"         = "image/svg+xml"
    ".png"         = "image/png"
    ".jpg"         = "image/jpeg"
    ".jpeg"        = "image/jpeg"
    ".ico"         = "image/x-icon"
    ".woff"        = "font/woff"
    ".woff2"       = "font/woff2"
    ".apk"         = "application/vnd.android.package-archive"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.AbsolutePath
        if ($path -eq "/" -or [string]::IsNullOrEmpty($path)) {
            $path = "/index.html"
        }

        $relPath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $targetFile = Join-Path $baseDir $relPath

        if (-not (Test-Path $targetFile -PathType Leaf)) {
            $targetFile = Join-Path $baseDir "index.html"
        }

        if (Test-Path $targetFile -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLowerInvariant()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.OutputStream.Close()
    }
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
}
