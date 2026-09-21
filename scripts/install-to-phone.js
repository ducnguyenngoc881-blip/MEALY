import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

const adbLocal = path.join(rootDir, 'tools', 'adb', 'adb.exe');
const adbSystem = 'C:\\Android\\platform-tools\\adb.exe';
const adbPath = fs.existsSync(adbLocal) ? adbLocal : adbSystem;

let apkPath = path.join(rootDir, 'MealWise.apk');
if (!fs.existsSync(apkPath)) {
  apkPath = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
}

console.clear();
console.log(`${colors.cyan}===============================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.green}           MEALWISE - TRÌNH CÀI ĐẶT 1-CHẠM PLUG & PLAY CHO ĐIỆN THOẠI          ${colors.reset}`);
console.log(`${colors.yellow}                (CẮM CÁP USB -> TỰ ĐỘNG CÀI ĐẶT VÀ MỞ ỨNG DỤNG)                ${colors.reset}`);
console.log(`${colors.cyan}===============================================================================${colors.reset}\n`);

if (!fs.existsSync(apkPath)) {
  console.log(`${colors.red}[LỖI] Không tìm thấy file MealWise.apk tại ${apkPath}!${colors.reset}`);
  process.exit(1);
}

const apkStats = fs.statSync(apkPath);
const apkSizeMB = (apkStats.size / (1024 * 1024)).toFixed(2);
console.log(`${colors.gray}[*] File cài đặt: MealWise.apk (${apkSizeMB} MB)${colors.reset}`);
console.log(`${colors.gray}[*] Trình kết nối ADB: ${adbPath}${colors.reset}\n`);

try {
  execSync(`"${adbPath}" start-server`, { stdio: 'ignore' });
} catch (e) {}

let lastState = '';
let attemptCount = 0;

function checkDevices() {
  try {
    const output = execSync(`"${adbPath}" devices`, { encoding: 'utf-8' });
    const lines = output.split('\n').filter(l => l.trim() && !l.includes('List of devices'));

    let authorizedDevice = null;
    let unauthorizedDevice = null;

    for (const line of lines) {
      const [id, state] = line.trim().split(/\s+/);
      if (state === 'device') {
        authorizedDevice = id;
        break;
      } else if (state === 'unauthorized') {
        unauthorizedDevice = id;
      }
    }

    if (authorizedDevice) {
      if (lastState !== 'installing') {
        lastState = 'installing';
        clearInterval(timer);
        installApp(authorizedDevice);
      }
    } else if (unauthorizedDevice) {
      if (lastState !== 'unauthorized') {
        lastState = 'unauthorized';
        console.log(`\n${colors.yellow}===============================================================================${colors.reset}`);
        console.log(`${colors.bold}${colors.yellow}  ĐÃ PHÁT HIỆN ĐIỆN THOẠI (${unauthorizedDevice}) - CẦN XÁC NHẬN QUYỀN TRÊN MÀN HÌNH!${colors.reset}`);
        console.log(`${colors.yellow}===============================================================================${colors.reset}`);
        console.log(`${colors.white}  1. Mở khóa màn hình điện thoại ngay bây giờ.${colors.reset}`);
        console.log(`${colors.white}  2. Bạn sẽ thấy thông báo pop-up: "Cho phép gỡ lỗi USB?" (Allow USB debugging?).${colors.reset}`);
        console.log(`${colors.white}  3. Tích vào ô: "Luôn cho phép từ máy tính này" (Always allow from this computer).${colors.reset}`);
        console.log(`${colors.bold}${colors.green}  4. Nhấn nút [CHO PHÉP] hoặc [OK].${colors.reset}`);
        console.log(`${colors.gray}  -> Đang tự động đợi bạn nhấn Cho phép trên màn hình điện thoại...${colors.reset}\n`);
      }
    } else {
      if (lastState !== 'waiting') {
        lastState = 'waiting';
        console.log(`${colors.cyan}===============================================================================${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  ĐANG CHỜ BẠN CẮM CÁP USB NỐI ĐIỆN THOẠI VÀO MÁY TÍNH...${colors.reset}`);
        console.log(`${colors.cyan}===============================================================================${colors.reset}`);
        console.log(`${colors.white}  👉 BƯỚC 1: Cắm cáp sạc USB từ điện thoại vào cổng USB máy tính.${colors.reset}`);
        console.log(`${colors.white}  👉 BƯỚC 2: Bật "Gỡ lỗi USB" (USB Debugging) trên điện thoại (chỉ cần làm 1 lần):${colors.reset}`);
        console.log(`${colors.gray}     - Vào Cài đặt (Settings) -> Thông tin điện thoại (About phone).${colors.reset}`);
        console.log(`${colors.gray}     - Bấm liên tục 7 lần vào "Số hiệu bản dựng" (Build number).${colors.reset}`);
        console.log(`${colors.gray}     - Quay lại Cài đặt -> Tùy chọn nhà phát triển -> Bật "Gỡ lỗi USB".${colors.reset}\n`);
        console.log(`${colors.yellow}  ⏳ Script đang quét cổng USB tự động... Cắm cáp vào là tự động cài đặt ngay!${colors.reset}\n`);
      }
    }
  } catch (err) {
    // Keep waiting
  }
}

function installApp(deviceId) {
  console.log(`\n${colors.green}===============================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  [KẾT NỐI THÀNH CÔNG] ĐÃ PHÁT HIỆN ĐIỆN THOẠI: ${deviceId}${colors.reset}`);
  console.log(`${colors.green}===============================================================================${colors.reset}\n`);
  console.log(`${colors.yellow}[..] Đang đẩy và cài đặt MealWise.apk vào điện thoại của bạn...${colors.reset}`);
  console.log(`${colors.gray}[*] Lệnh: adb install -r -d -g MealWise.apk (tự động cấp mọi quyền, không cần xác nhận thêm)${colors.reset}\n`);

  try {
    const installOut = execSync(`"${adbPath}" -s ${deviceId} install -r -d -g "${apkPath}"`, { encoding: 'utf-8' });
    console.log(`${colors.gray}${installOut.trim()}${colors.reset}\n`);

    if (installOut.includes('Success')) {
      console.log(`${colors.green}===============================================================================${colors.reset}`);
      console.log(`${colors.bold}${colors.green}  🎉 [HOÀN TẤT] CÀI ĐẶT MEALWISE THÀNH CÔNG 100%!${colors.reset}`);
      console.log(`${colors.green}  Đã cài đặt trực tiếp dạng native, hoàn toàn không cần app trung gian nào!${colors.reset}`);
      console.log(`${colors.green}===============================================================================${colors.reset}\n`);

      console.log(`${colors.cyan}[..] Đang tự động mở ứng dụng trên màn hình điện thoại...${colors.reset}`);
      try {
        execSync(`"${adbPath}" -s ${deviceId} shell am start -n com.mealwise.app/com.mealwise.app.MainActivity`, { stdio: 'ignore' });
        console.log(`${colors.bold}${colors.green}[OK] Ứng dụng MealWise đã hiển thị trên màn hình điện thoại của bạn!${colors.reset}\n`);
      } catch (e) {
        console.log(`${colors.yellow}[*] Bạn có thể bấm vào icon MealWise trên màn hình chính điện thoại để trải nghiệm.${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.yellow}[CẢNH BÁO] Kết quả cài đặt: ${installOut}${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}[LỖI] Không thể cài đặt: ${err.message}${colors.reset}`);
  }

  console.log(`${colors.gray}Bạn có thể rút cáp USB hoặc để nguyên sạc pin. Bấm Ctrl+C hoặc đóng cửa sổ khi xong.${colors.reset}`);
}

const timer = setInterval(checkDevices, 1500);
checkDevices();
