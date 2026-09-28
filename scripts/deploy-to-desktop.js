import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const desktopDir = 'C:\\Users\\EXIA\\Desktop';
const appFolder = path.join(desktopDir, 'MealWise-App');
const pcFolder = path.join(desktopDir, 'MealWise-PC-Build');

console.log('======================================================================');
console.log('       MEALWISE - DEPLOY BUILD ARTIFACTS TO DESKTOP FOLDERS           ');
console.log('======================================================================\n');

// 1. Setup Folder 1: MealWise-App (.apk & mobile opening tools)
console.log(`[*] Preparing Mobile App Folder: ${appFolder}`);
if (fs.existsSync(appFolder)) {
  fs.rmSync(appFolder, { recursive: true, force: true });
}
fs.mkdirSync(appFolder, { recursive: true });

// Copy MealWise.apk
const rootApk = path.join(rootDir, 'MealWise.apk');
if (fs.existsSync(rootApk)) {
  fs.copyFileSync(rootApk, path.join(appFolder, 'MealWise.apk'));
  const apkSizeMB = (fs.statSync(rootApk).size / (1024 * 1024)).toFixed(2);
  console.log(`    ✓ Copied MealWise.apk (${apkSizeMB} MB)`);
}

// Copy phone installer & adb tools
const installBat = path.join(rootDir, 'Install-To-Phone.bat');
if (fs.existsSync(installBat)) {
  fs.copyFileSync(installBat, path.join(appFolder, 'Install-To-Phone.bat'));
  console.log('    ✓ Copied Install-To-Phone.bat');
}

const adbSource = path.join(rootDir, 'tools', 'adb');
if (fs.existsSync(adbSource)) {
  const adbTarget = path.join(appFolder, 'tools', 'adb');
  fs.mkdirSync(adbTarget, { recursive: true });
  for (const file of fs.readdirSync(adbSource)) {
    fs.copyFileSync(path.join(adbSource, file), path.join(adbTarget, file));
  }
  console.log('    ✓ Copied standalone ADB tools for phone installation');
}

const installScript = path.join(rootDir, 'scripts', 'install-to-phone.js');
if (fs.existsSync(installScript)) {
  const targetScripts = path.join(appFolder, 'scripts');
  fs.mkdirSync(targetScripts, { recursive: true });
  fs.copyFileSync(installScript, path.join(targetScripts, 'install-to-phone.js'));
}

// App README
const appReadme = `================================================================================
                  MEALWISE - MOBILE APP INSTALLATION (.APK)
================================================================================

This folder contains everything needed to install and open MealWise on Android phones or emulators.

--------------------------------------------------------------------------------
OPTION 1: DIRECT COPY TO PHONE (Recommended & Simplest)
--------------------------------------------------------------------------------
1. Send or copy the file "MealWise.apk" to your phone:
   - Via USB cable, Google Drive, Zalo, Telegram, or Gmail.
2. On your phone, tap "MealWise.apk" to install.
   (If prompted, allow "Install from Unknown Sources" for your file manager/browser).
3. Open MealWise from your phone's home screen!

--------------------------------------------------------------------------------
OPTION 2: 1-CLICK USB AUTO-INSTALL FROM PC
--------------------------------------------------------------------------------
1. On your Android phone, enable "USB Debugging" in Settings -> Developer Options.
2. Plug your phone into this PC using a USB cable.
3. Double-click the file:
   [ Install-To-Phone.bat ]
4. MealWise will automatically install onto your connected phone in seconds!

--------------------------------------------------------------------------------
OPTION 3: ANDROID EMULATOR ON PC
--------------------------------------------------------------------------------
- Drag and drop "MealWise.apk" onto BlueStacks, LDPlayer, Nox, or Android Studio Emulator.

================================================================================
`;
fs.writeFileSync(path.join(appFolder, 'INSTRUCTIONS.txt'), appReadme, 'utf8');
console.log('    ✓ Created INSTRUCTIONS.txt in MealWise-App');


// 2. Setup Folder 2: MealWise-PC-Build (Everything needed for other PCs)
console.log(`\n[*] Preparing PC Build Folder: ${pcFolder}`);
if (fs.existsSync(pcFolder)) {
  fs.rmSync(pcFolder, { recursive: true, force: true });
}
fs.mkdirSync(pcFolder, { recursive: true });

const portableSource = path.join(rootDir, 'MealWise-Portable-PC');
if (fs.existsSync(portableSource)) {
  // Recursively copy MealWise-Portable-PC contents
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  copyDir(portableSource, pcFolder);
  console.log('    ✓ Copied full portable web runtime (MealWise.exe, Chay-MealWise.bat, assets, index.html)');
}

// Copy the pre-packaged zip as well so it's readily available to copy to USB
const rootZip = path.join(rootDir, 'MealWise-Portable-PC.zip');
if (fs.existsSync(rootZip)) {
  fs.copyFileSync(rootZip, path.join(pcFolder, 'MealWise-Portable-PC.zip'));
  const zipSizeMB = (fs.statSync(rootZip).size / (1024 * 1024)).toFixed(2);
  console.log(`    ✓ Copied MealWise-Portable-PC.zip (${zipSizeMB} MB) for easy USB / Drive sharing`);
}

// PC Build README
const pcReadme = `================================================================================
          MEALWISE - STANDALONE PC BUILD (FOR ANY WINDOWS COMPUTER)
================================================================================

This folder contains the complete standalone build of MealWise for PC.
It can run on ANY computer running Windows 11, 10, 8, or 7 WITHOUT installing
Node.js, npm, or any external dependencies!

--------------------------------------------------------------------------------
HOW TO RUN ON THIS PC OR ANY OTHER PC:
--------------------------------------------------------------------------------

👉 METHOD 1 (Recommended - 1-Click Launch):
   Double-click the file:
   [ MealWise.exe ]
   -> Automatically launches the local background web server and opens your
      default web browser directly to MealWise!

👉 METHOD 2 (PowerShell Batch Launcher):
   Double-click the file:
   [ Chay-MealWise.bat ]
   -> Runs using native Windows PowerShell (no .exe required).

* NOTE: Keep the launcher terminal window open while using the app.
        When finished, simply close the terminal window.

--------------------------------------------------------------------------------
SHARING TO OTHER COMPUTERS (USB / CLOUD DRIVE):
--------------------------------------------------------------------------------
- Copy the archive [ MealWise-Portable-PC.zip ] to your USB flash drive or upload
  to Google Drive / Zalo.
- On any other PC, right-click the zip, select "Extract All...", then double-click
  "MealWise.exe" to run instantly!

================================================================================
`;
fs.writeFileSync(path.join(pcFolder, 'INSTRUCTIONS.txt'), pcReadme, 'utf8');
console.log('    ✓ Created INSTRUCTIONS.txt in MealWise-PC-Build');

console.log('\n======================================================================');
console.log('🎉 [SUCCESS] BOTH DESKTOP FOLDERS CREATED & POPULATED!');
console.log('======================================================================');
console.log(`📱 Mobile App Folder:   ${appFolder}`);
console.log(`💻 PC Build Folder:     ${pcFolder}`);
console.log('======================================================================\n');
