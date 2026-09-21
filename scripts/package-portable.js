import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageDir = path.join(rootDir, 'MealWise-Portable-PC');
const zipFile = path.join(rootDir, 'MealWise-Portable-PC.zip');
const downloadsDir = 'C:\\Users\\EXIA\\Downloads';
const targetZipInDownloads = path.join(downloadsDir, 'MealWise-Portable-PC.zip');

console.log('======================================================================');
console.log('       MEALWISE - ĐÓNG GÓI BẢN PORTABLE CHO MÁY TÍNH KHÁC             ');
console.log('======================================================================\n');

// 1. Check dist
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  const buildCmd = process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build';
  execSync(buildCmd, { cwd: rootDir, stdio: 'inherit' });
}

// 2. Clean package dir
if (fs.existsSync(packageDir)) {
  console.log(`[*] Xóa thư mục đóng gói cũ: ${packageDir}`);
  fs.rmSync(packageDir, { recursive: true, force: true });
}
fs.mkdirSync(packageDir, { recursive: true });
fs.mkdirSync(path.join(packageDir, 'scripts'), { recursive: true });
fs.mkdirSync(path.join(packageDir, 'assets'), { recursive: true });

// 3. Compile MealWise.exe
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const launcherCs = path.join(rootDir, 'scripts', 'MealWiseLauncher.cs');
const targetExe = path.join(packageDir, 'MealWise.exe');

if (fs.existsSync(cscPath) && fs.existsSync(launcherCs)) {
  console.log('[*] Đang biên dịch MealWise.exe (Native Windows Executable)...');
  execSync(`"${cscPath}" /nologo /optimize /target:exe /out:"${targetExe}" "${launcherCs}"`, { stdio: 'inherit' });
  console.log('    ✓ Đã tạo MealWise.exe thành công!');
}

// 4. Copy web bundle assets
console.log('[*] Sao chép giao diện ứng dụng...');
const distAssetsDir = path.join(distDir, 'assets');
const pkgAssetsDir = path.join(packageDir, 'assets');
for (const file of fs.readdirSync(distAssetsDir)) {
  fs.copyFileSync(path.join(distAssetsDir, file), path.join(pkgAssetsDir, file));
}

// Copy root files
const rootFilesToCopy = ['index.html', 'icon.svg', 'manifest.webmanifest', 'sw.js'];
for (const file of rootFilesToCopy) {
  const src = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(packageDir, file));
  }
}

// 5. Copy launchers
console.log('[*] Sao chép các công cụ khởi chạy...');
fs.copyFileSync(path.join(rootDir, 'Chay-MealWise.bat'), path.join(packageDir, 'Chay-MealWise.bat'));
fs.copyFileSync(path.join(rootDir, 'scripts', 'portable-server.ps1'), path.join(packageDir, 'scripts', 'portable-server.ps1'));

// Copy APK if present
const apkPath = path.join(rootDir, 'MealWise.apk');
if (fs.existsSync(apkPath)) {
  fs.copyFileSync(apkPath, path.join(packageDir, 'MealWise.apk'));
  console.log('    ✓ Đã kèm file MealWise.apk (dành cho điện thoại Android)');
}

// Copy phone installer
if (fs.existsSync(path.join(rootDir, 'Install-To-Phone.bat'))) {
  fs.copyFileSync(path.join(rootDir, 'Install-To-Phone.bat'), path.join(packageDir, 'Install-To-Phone.bat'));
}
if (fs.existsSync(path.join(rootDir, 'tools', 'adb'))) {
  const targetAdb = path.join(packageDir, 'tools', 'adb');
  fs.mkdirSync(targetAdb, { recursive: true });
  for (const f of fs.readdirSync(path.join(rootDir, 'tools', 'adb'))) {
    fs.copyFileSync(path.join(rootDir, 'tools', 'adb', f), path.join(targetAdb, f));
  }
}
if (fs.existsSync(path.join(rootDir, 'scripts', 'install-to-phone.js'))) {
  fs.copyFileSync(path.join(rootDir, 'scripts', 'install-to-phone.js'), path.join(packageDir, 'scripts', 'install-to-phone.js'));
}

// 6. Create User Guide
const readmeContent = `================================================================================
          MEALWISE - HÔM NAY ĂN GÌ? • BẢN PORTABLE DÀNH CHO MỌI MÁY TÍNH
================================================================================

Phiên bản này được đóng gói độc lập (Portable), bạn có thể chép thư mục này
vào USB, gửi qua Google Drive, Zalo, hoặc đem sang BẤT KỲ MÁY TÍNH NÀO
đều có thể mở lên sử dụng ngay mà KHÔNG CẦN CÀI ĐẶT BẤT KỲ PHẦN MỀM NÀO
(Không cần cài Node.js, không cần npm, không cần cài server)!

--------------------------------------------------------------------------------
1. CÁCH MỞ TRÊN MÁY TÍNH (WINDOWS 10, 11, 8, 7)
--------------------------------------------------------------------------------
Bạn có thể chọn 1 trong 2 cách sau:

👉 CÁCH 1 (Khuyên dùng - Nhanh nhất):
   Click đúp chuột vào file:
   [ MealWise.exe ]
   -> Ứng dụng sẽ tự động bật máy chủ nội bộ và mở trình duyệt web lên ngay!

👉 CÁCH 2:
   Click đúp chuột vào file:
   [ Chay-MealWise.bat ]
   -> Chạy trực tiếp bằng PowerShell có sẵn của Windows (hoàn toàn không cần .exe).

* LƯU Ý: Giữ nguyên cửa sổ màu đen trong lúc sử dụng. Khi dùng xong chỉ cần tắt cửa sổ đi.

--------------------------------------------------------------------------------
2. CÁCH MỞ TRÊN ĐIỆN THOẠI (NẾU MUỐN DÙNG TRÊN ĐIỆN THOẠI)
--------------------------------------------------------------------------------
Trong thư mục này đã có sẵn file:
   - [ MealWise.apk ]: File cài đặt ứng dụng cho điện thoại Android.
   - [ Install-To-Phone.bat ]: Cắm cáp USB điện thoại vào máy tính và click đúp
     vào file này để tự động cài đặt ứng dụng vào điện thoại trong 2 giây!

================================================================================
Chúc bạn có những bữa cơm gia đình thật ngon miệng cùng MealWise!
`;

fs.writeFileSync(path.join(packageDir, 'HUONG-DAN-SU-DUNG.txt'), readmeContent, 'utf-8');

// 7. Zip package
console.log('\n[*] Đang nén thành file Zip duy nhất để dễ dàng chép sang USB hoặc gửi file...');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

const zipCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${zipFile}' -Force"`;
execSync(zipCommand, { stdio: 'inherit' });

const zipStats = fs.statSync(zipFile);
const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
console.log(`    ✓ File Zip tạo thành công: ${zipFile} (${zipSizeMB} MB)`);

// Copy zip to Downloads
if (fs.existsSync(downloadsDir)) {
  fs.copyFileSync(zipFile, targetZipInDownloads);
  console.log(`    ✓ Đã sao chép vào Downloads: ${targetZipInDownloads}`);
}

console.log('\n======================================================================');
console.log('🎉 [HOÀN THÀNH] ĐÓNG GÓI THÀNH CÔNG GÓI PORTABLE ĐA MÁY TÍNH!');
console.log('======================================================================');
console.log(`📁 Thư mục Portable: ${packageDir}`);
console.log(`📦 File Zip sẵn sàng copy: ${zipFile}`);
console.log('======================================================================\n');
