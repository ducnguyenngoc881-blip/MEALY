import { spawn, execSync } from 'node:child_process';
import readline from 'node:readline';

const port = process.env.PORT || 5173;
const userToken = process.argv[2] || process.env.NGROK_AUTHTOKEN;

console.log('======================================================================');
console.log('                 MEALWISE NGROK & REMOTE TUNNEL LAUNCHER              ');
console.log('======================================================================');
console.log(`[*] Target Local App Port: ${port}`);

if (userToken) {
  console.log(`[*] Configuring ngrok authtoken...`);
  try {
    execSync(`npx ngrok config add-authtoken ${userToken}`, { stdio: 'inherit' });
    console.log(`✓ Authtoken configured successfully!`);
  } catch (err) {
    console.error(`⚠️ Failed to configure authtoken:`, err.message);
  }
}

console.log(`[*] Launching ngrok tunnel for port ${port}...`);
const ngrokProcess = spawn('npx.cmd', ['ngrok', 'http', String(port)], {
  stdio: 'inherit',
  shell: true
});

ngrokProcess.on('error', (err) => {
  console.error('Error starting ngrok:', err);
});

ngrokProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log('\n----------------------------------------------------------------------');
    console.log('💡 HƯỚNG DẪN NGROK CHO TEAM:');
    console.log('1. Đăng ký tài khoản ngrok miễn phí tại: https://dashboard.ngrok.com/signup');
    console.log('2. Lấy Authtoken tại: https://dashboard.ngrok.com/get-started/your-authtoken');
    console.log('3. Chạy lệnh: node scripts/start-ngrok.js <YOUR_AUTHTOKEN>');
    console.log('----------------------------------------------------------------------\n');
  }
});
