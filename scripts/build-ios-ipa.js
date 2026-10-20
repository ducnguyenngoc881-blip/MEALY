import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const IOS_APP_SRC = path.join(ROOT_DIR, 'ios', 'App', 'App');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BUILD_TMP = path.join(ROOT_DIR, 'ios', 'build_ipa_tmp');
const PAYLOAD_DIR = path.join(BUILD_TMP, 'Payload');
const APP_BUNDLE_DIR = path.join(PAYLOAD_DIR, 'App.app');
const OUTPUT_IPA = path.join(ROOT_DIR, 'MealWise.ipa');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('1. Preparing Payload/App.app structure...');
if (fs.existsSync(BUILD_TMP)) {
  fs.rmSync(BUILD_TMP, { recursive: true, force: true });
}
fs.mkdirSync(APP_BUNDLE_DIR, { recursive: true });

const xcodeAppDir = path.join(ROOT_DIR, 'ios', 'App', 'build', 'Build', 'Products', 'Release-iphoneos', 'App.app');
if (fs.existsSync(path.join(xcodeAppDir, 'App'))) {
  console.log('2. Copying full Xcode-compiled Release-iphoneos/App.app bundle (with ARM64 binary, Frameworks, Assets.car, storyboards)...');
  copyDirRecursive(xcodeAppDir, APP_BUNDLE_DIR);
  // Ensure latest dist web assets are synced into App.app/public
  copyDirRecursive(DIST_DIR, path.join(APP_BUNDLE_DIR, 'public'));
} else {
  // Fallback when Xcode build is not present
  console.log('2. Copying production web assets (dist -> App.app/public)...');
  copyDirRecursive(DIST_DIR, path.join(APP_BUNDLE_DIR, 'public'));

  for (const file of ['capacitor.config.json', 'config.xml']) {
    const srcFile = path.join(IOS_APP_SRC, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(APP_BUNDLE_DIR, file));
    }
  }

  copyDirRecursive(path.join(IOS_APP_SRC, 'Base.lproj'), path.join(APP_BUNDLE_DIR, 'Base.lproj'));
  copyDirRecursive(path.join(IOS_APP_SRC, 'Assets.xcassets'), path.join(APP_BUNDLE_DIR, 'Assets.xcassets'));

  console.log('3. Generating resolved Info.plist & PkgInfo...');
  const infoPlistPath = path.join(IOS_APP_SRC, 'Info.plist');
  let infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
  infoPlist = infoPlist
    .replace(/\$\(CAPACITOR_DEBUG\)/g, 'false')
    .replace(/\$\(EXECUTABLE_NAME\)/g, 'App')
    .replace(/\$\(PRODUCT_BUNDLE_IDENTIFIER\)/g, 'vn.greenfi.mealy')
    .replace(/\$\(PRODUCT_NAME\)/g, 'Mealy')
    .replace(/\$\(MARKETING_VERSION\)/g, '2.0.0')
    .replace(/\$\(CURRENT_PROJECT_VERSION\)/g, '2')
    .replace(/\$\(PRODUCT_MODULE_NAME\)/g, 'App');

  fs.writeFileSync(path.join(APP_BUNDLE_DIR, 'Info.plist'), infoPlist, 'utf8');
  fs.writeFileSync(path.join(APP_BUNDLE_DIR, 'PkgInfo'), 'APPL????', 'utf8');
}

// Always ensure PrivacyInfo.xcprivacy is included in App.app
const privacySrc = path.join(IOS_APP_SRC, 'PrivacyInfo.xcprivacy');
if (fs.existsSync(privacySrc)) {
  fs.copyFileSync(privacySrc, path.join(APP_BUNDLE_DIR, 'PrivacyInfo.xcprivacy'));
}

// Copy main app icon (non-alpha RGB) to bundle root for sideloaders (Sideloadly / AltStore)
const iconSrc = path.join(IOS_APP_SRC, 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(APP_BUNDLE_DIR, 'AppIcon60x60@2x.png'));
  fs.copyFileSync(iconSrc, path.join(APP_BUNDLE_DIR, 'Icon.png'));
}

// Ensure executable permission on App binary and ad-hoc sign on macOS if codesign is available
const binDest = path.join(APP_BUNDLE_DIR, 'App');
if (fs.existsSync(binDest)) {
  try {
    fs.chmodSync(binDest, 0o755);
    if (process.platform === 'darwin') {
      execSync(`codesign --force --deep --sign - "${APP_BUNDLE_DIR}"`, { stdio: 'ignore' });
    }
  } catch {}
}

// Package Payload into .ipa (POSIX-compliant ZIP format)
console.log('4. Compressing Payload into MealWise.ipa (POSIX ZIP)...');
const tempZip = path.join(ROOT_DIR, 'MealWise_ipa_temp.zip');
if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
if (fs.existsSync(OUTPUT_IPA)) fs.unlinkSync(OUTPUT_IPA);

if (process.platform === 'darwin') {
  execSync(`cd "${BUILD_TMP}" && zip -qry "${tempZip}" Payload`, { stdio: 'inherit' });
} else {
  execSync(`tar -a -cf "${tempZip}" -C "${BUILD_TMP}" Payload`, { stdio: 'inherit' });
}

fs.renameSync(tempZip, OUTPUT_IPA);

// Copy to MealWise-Portable-PC if directory exists
const portableDir = path.join(ROOT_DIR, 'MealWise-Portable-PC');
if (fs.existsSync(portableDir)) {
  fs.copyFileSync(OUTPUT_IPA, path.join(portableDir, 'MealWise.ipa'));
}

// Clean up temporary directory
fs.rmSync(BUILD_TMP, { recursive: true, force: true });

const stats = fs.statSync(OUTPUT_IPA);
console.log(`✅ Successfully created: ${OUTPUT_IPA} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

