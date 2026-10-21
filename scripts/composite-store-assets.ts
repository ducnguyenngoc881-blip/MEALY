import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const STORE_ASSETS_DIR = path.join(ROOT_DIR, 'public', 'store-assets');

const ICONS_DIR = path.join(STORE_ASSETS_DIR, 'icons');
const FEATURE_GRAPHIC_DIR = path.join(STORE_ASSETS_DIR, 'feature-graphic');
const POSTERS_DIR = path.join(STORE_ASSETS_DIR, 'posters');
const RAW_SCREENS_DIR = path.join(STORE_ASSETS_DIR, 'raw-screens');

function toDataUrl(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

function getPngDimensions(filePath: string): { width: number; height: number } {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

// Reusable Laurel Wreath SVG for Award Badges (matching reference Slide 1)
function getLaurelBadgeHtml(line1: string, line2: string, subYear: string): string {
  return `
  <div class="laurel-badge">
    <svg class="laurel-wing left" viewBox="0 0 44 88" fill="none">
      <path d="M38 82C22 72 12 55 10 34C9 21 14 10 22 4" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="14" cy="66" rx="5" ry="10" transform="rotate(-35 14 66)" fill="#18181B"/>
      <ellipse cx="9" cy="49" rx="5" ry="10" transform="rotate(-20 9 49)" fill="#18181B"/>
      <ellipse cx="10" cy="31" rx="5" ry="10" transform="rotate(-5 10 31)" fill="#18181B"/>
      <ellipse cx="16" cy="15" rx="4.5" ry="9" transform="rotate(18 16 15)" fill="#18181B"/>
      <ellipse cx="26" cy="58" rx="4.5" ry="9" transform="rotate(25 26 58)" fill="#18181B"/>
      <ellipse cx="21" cy="42" rx="4.5" ry="9" transform="rotate(35 21 42)" fill="#18181B"/>
      <ellipse cx="21" cy="26" rx="4" ry="8.5" transform="rotate(42 21 26)" fill="#18181B"/>
    </svg>
    <div class="laurel-center">
      <div class="laurel-emblem">🍲</div>
      <div class="laurel-line1">${line1}</div>
      <div class="laurel-line2">${line2}</div>
      <div class="laurel-year">${subYear}</div>
    </div>
    <svg class="laurel-wing right" viewBox="0 0 44 88" fill="none">
      <path d="M6 82C22 72 32 55 34 34C35 21 30 10 22 4" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="30" cy="66" rx="5" ry="10" transform="rotate(35 30 66)" fill="#18181B"/>
      <ellipse cx="35" cy="49" rx="5" ry="10" transform="rotate(20 35 49)" fill="#18181B"/>
      <ellipse cx="34" cy="31" rx="5" ry="10" transform="rotate(5 34 31)" fill="#18181B"/>
      <ellipse cx="28" cy="15" rx="4.5" ry="9" transform="rotate(-18 28 15)" fill="#18181B"/>
      <ellipse cx="18" cy="58" rx="4.5" ry="9" transform="rotate(-25 18 58)" fill="#18181B"/>
      <ellipse cx="23" cy="42" rx="4.5" ry="9" transform="rotate(-35 23 42)" fill="#18181B"/>
      <ellipse cx="23" cy="26" rx="4" ry="8.5" transform="rotate(-42 23 26)" fill="#18181B"/>
    </svg>
  </div>`;
}

// Common CSS shared across all 6 Editorial Pastel Posters
const COMMON_EDITORIAL_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1290px;
    height: 2796px;
    position: relative;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #18181B;
    -webkit-font-smoothing: antialiased;
  }
  .serif-headline {
    font-family: "Times New Roman", "Palatino Linotype", "Noto Serif", serif;
    font-weight: 400;
    color: #18181B;
    letter-spacing: -1.5px;
    line-height: 1.08;
    text-align: center;
  }
  /* Universal Sleek Smartphone Hardware Frame (identical for iOS & Android stores) */
  .phone-shell {
    position: absolute;
    background: #18181B;
    border-radius: 86px;
    padding: 18px;
    box-shadow:
      0 40px 100px -15px rgba(24, 24, 27, 0.28),
      0 12px 36px -8px rgba(24, 24, 27, 0.16),
      inset 0 0 0 3px #3F3F46,
      inset 0 0 0 6px #09090B;
  }
  .phone-screen {
    width: 100%;
    height: 100%;
    border-radius: 68px;
    overflow: hidden;
    position: relative;
    background: #FFFFFF;
  }
  .phone-screen.dark-bg {
    background: #0F172A;
  }
  .phone-screen img.raw-ui {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
  .universal-notch {
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    height: 56px;
    background: #09090B;
    border-radius: 999px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }
  .universal-lens {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #1E293B;
    border: 3px solid #0F172A;
    box-shadow: inset 0 0 4px #38BDF8;
  }
  /* Pop-out floating cards */
  .pop-card-light {
    position: absolute;
    background: #FFFFFF;
    border-radius: 36px;
    padding: 26px 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow:
      0 24px 54px -10px rgba(24, 24, 27, 0.16),
      0 4px 16px rgba(24, 24, 27, 0.06),
      0 0 0 1.5px rgba(24, 24, 27, 0.05);
    z-index: 60;
  }
  .pop-card-dark {
    position: absolute;
    background: rgba(24, 24, 27, 0.94);
    backdrop-filter: blur(24px);
    border-radius: 38px;
    padding: 26px 34px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow:
      0 26px 55px -10px rgba(9, 9, 11, 0.48),
      0 0 0 1.5px rgba(255, 255, 255, 0.14);
    z-index: 60;
    color: #FFFFFF;
  }
  .pop-icon-circle {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
    flex-shrink: 0;
  }
  .pop-title-dark {
    font-size: 32px;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }
  .pop-sub-dark {
    font-size: 23px;
    font-weight: 600;
    color: #A1A1AA;
    margin-top: 6px;
  }
  .pop-title-light {
    font-size: 32px;
    font-weight: 800;
    color: #18181B;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }
  .pop-sub-light {
    font-size: 23px;
    font-weight: 600;
    color: #52525B;
    margin-top: 6px;
  }
  .sparkle {
    position: absolute;
    color: #FFFFFF;
    font-size: 46px;
    line-height: 1;
    opacity: 0.9;
    text-shadow: 0 0 20px rgba(255,255,255,0.9);
    pointer-events: none;
    z-index: 25;
  }
`;

// App Icon HTML (Unified Pastel & Warm Culinary Emblem for both iOS & Android)
function getAppIconHtml(size: number, iconBase64: string): string {
  const squircleSize = Math.round(size * 0.92);
  const squircleRadius = Math.round(squircleSize * 0.225);
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(145deg, #EEF2FF 0%, #E0E7FF 50%, #DDD6FE 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .squircle-card {
      width: ${squircleSize}px;
      height: ${squircleSize}px;
      border-radius: ${squircleRadius}px;
      position: relative;
      overflow: hidden;
      background: #0F172A;
      box-shadow:
        0 ${Math.round(size * 0.03)}px ${Math.round(size * 0.07)}px rgba(30, 27, 75, 0.28),
        inset 0 0 0 ${Math.max(4, Math.round(size * 0.008))}px rgba(255, 255, 255, 0.65);
    }
    .icon-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  </style>
</head>
<body>
  <div class="squircle-card">
    <img class="icon-img" src="${iconBase64}" alt="Mealy Icon" />
  </div>
</body>
</html>`;
}

// Google Play Feature Graphic (1024x500) in the same Editorial Pastel + Serif + Pop-out style
function getFeatureGraphicHtml(screen1Base64: string, iconBase64: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1024px;
      height: 500px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #F5F3FF 0%, #E0E7FF 52%, #DDD6FE 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #18181B;
    }
    .glow-orb {
      position: absolute;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(167, 139, 250, 0.28) 0%, rgba(167, 139, 250, 0) 70%);
      top: -120px;
      right: -80px;
    }
    .left-col {
      position: absolute;
      top: 44px;
      left: 56px;
      bottom: 44px;
      width: 540px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 20;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-icon {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 24px rgba(24, 24, 27, 0.18);
      border: 2px solid #FFFFFF;
    }
    .brand-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .brand-title {
      font-size: 30px;
      font-weight: 900;
      color: #18181B;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 14px;
      font-weight: 700;
      color: #4F46E5;
    }
    .serif-hero {
      font-family: "Times New Roman", "Palatino Linotype", serif;
      font-size: 52px;
      line-height: 1.08;
      color: #18181B;
      letter-spacing: -1px;
    }
    .desc {
      font-size: 17px;
      font-weight: 600;
      color: #3F3F46;
      line-height: 1.4;
    }
    .stars-pill {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      padding: 10px 20px;
      border-radius: 999px;
      box-shadow: 0 8px 20px rgba(24, 24, 27, 0.08);
      font-size: 14px;
      font-weight: 800;
      color: #18181B;
    }
    .stars-pill span.gold {
      color: #F59E0B;
      font-size: 16px;
      letter-spacing: 1px;
    }
    .right-phone {
      position: absolute;
      top: 38px;
      right: 52px;
      width: 330px;
      height: 640px;
      background: #18181B;
      border-radius: 42px;
      padding: 10px;
      box-shadow: 0 25px 60px rgba(24, 24, 27, 0.28);
      z-index: 15;
    }
    .right-phone-inner {
      width: 100%;
      height: 100%;
      border-radius: 32px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .right-phone-inner img {
      width: 100%;
      height: auto;
      display: block;
    }
    .floating-mini-card {
      position: absolute;
      bottom: 36px;
      right: 220px;
      background: #FFFFFF;
      padding: 12px 20px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 16px 36px rgba(24, 24, 27, 0.18);
      z-index: 30;
    }
  </style>
</head>
<body>
  <div class="glow-orb"></div>
  <div class="left-col">
    <div class="brand-row">
      <div class="brand-icon"><img src="${iconBase64}" alt="Mealy" /></div>
      <div>
        <div class="brand-title">Mealy</div>
        <div class="brand-sub">Trợ Lý Mâm Cơm & Đi Chợ Gia Đình Việt</div>
      </div>
    </div>
    <div class="serif-hero">Mâm cơm chuẩn vị<br/>trong một chạm</div>
    <div class="desc">Thực đơn 3 món Mặn - Canh - Rau, đi chợ chung thời gian thực & nhắc hạn tủ lạnh thông minh.</div>
    <div class="stars-pill">
      <span class="gold">★★★★★</span>
      <span>4.9 • Hơn 45.000+ gia đình Việt tin dùng</span>
    </div>
  </div>
  <div class="right-phone">
    <div class="right-phone-inner">
      <img src="${screen1Base64}" alt="Screen" />
    </div>
  </div>
  <div class="floating-mini-card">
    <span style="font-size:26px;">🍲</span>
    <div>
      <div style="font-size:14px;font-weight:800;color:#18181B;">Mâm Cơm 3 Món Hôm Nay</div>
      <div style="font-size:12px;font-weight:600;color:#10B981;">✓ Đủ chất • Tiết kiệm 45 phút</div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// SLIDE 1: Hero + Laurel Wreath Awards + Floating Pastel Bubbles + Right Phone + Pop-out Cards
// (Directly matches Reference Screenshot 1: "Your to-do list planner")
// ============================================================================
function getSlide1Html(screenBase64: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_EDITORIAL_CSS}
    body {
      background: linear-gradient(180deg, #F5F7FF 0%, #EEF2FF 55%, #F3E8FF 100%);
    }
    .headline-wrap {
      position: absolute;
      top: 150px;
      left: 80px;
      right: 80px;
      z-index: 30;
    }
    .serif-headline {
      font-size: 126px;
    }
    /* Floating Pastel Bubbles */
    .pastel-bubble {
      position: absolute;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 36px rgba(24, 24, 27, 0.08);
      z-index: 25;
    }
    .bubble-heart {
      width: 196px;
      height: 196px;
      background: #BAE6FD;
      top: 520px;
      right: -28px;
      font-size: 86px;
    }
    .bubble-basket {
      width: 142px;
      height: 142px;
      background: #BFDBFE;
      top: 860px;
      left: 225px;
      font-size: 64px;
    }
    .bubble-salad {
      width: 224px;
      height: 224px;
      background: #FEF08A;
      top: 1120px;
      left: 44px;
      font-size: 104px;
    }
    .bubble-pot {
      width: 194px;
      height: 194px;
      background: #DDD6FE;
      top: 1460px;
      left: 175px;
      font-size: 88px;
    }
    /* Left Column Laurel Wreath Awards */
    .awards-stack {
      position: absolute;
      bottom: 110px;
      left: 52px;
      width: 390px;
      display: flex;
      flex-direction: column;
      gap: 44px;
      z-index: 35;
    }
    .laurel-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .laurel-wing {
      width: 58px;
      height: 116px;
      flex-shrink: 0;
    }
    .laurel-center {
      text-align: center;
      flex: 1;
      padding: 0 6px;
    }
    .laurel-emblem {
      font-size: 32px;
      margin-bottom: 4px;
    }
    .laurel-line1 {
      font-size: 23px;
      font-weight: 800;
      color: #18181B;
      line-height: 1.18;
    }
    .laurel-line2 {
      font-size: 23px;
      font-weight: 800;
      color: #18181B;
      line-height: 1.18;
    }
    .laurel-year {
      font-size: 20px;
      font-weight: 700;
      color: #52525B;
      margin-top: 2px;
    }
    /* Offset Right Phone */
    .phone-slide1 {
      top: 900px;
      left: 470px;
      width: 960px;
      height: 2040px;
    }
    /* Pop-out white meal cards protruding left of the phone bezel */
    .pop-meal-1 {
      top: 1690px;
      left: 390px;
      width: 860px;
    }
    .pop-meal-2 {
      top: 1895px;
      left: 420px;
      width: 830px;
    }
  </style>
</head>
<body>
  <div class="headline-wrap">
    <div class="serif-headline">
      Trợ lý thực đơn<br/>
      &amp; mâm cơm<br/>
      gia đình
    </div>
  </div>

  <!-- Floating Pastel Decorative Bubbles -->
  <div class="pastel-bubble bubble-heart">🩵</div>
  <div class="pastel-bubble bubble-basket">🧺</div>
  <div class="pastel-bubble bubble-salad">🥗</div>
  <div class="pastel-bubble bubble-pot">🍲</div>

  <!-- 4 Stacked Laurel Wreath Awards on the Left -->
  <div class="awards-stack">
    ${getLaurelBadgeHtml('Ứng Dụng Gia Đình', 'Xuất Sắc Nhất', '2026')}
    ${getLaurelBadgeHtml('Ứng Dụng Tốt Nhất', 'Cho Bếp Nhà Việt', '4.9 ★')}
    ${getLaurelBadgeHtml('Bình Chọn Bởi', 'Người Nội Trợ', 'Top 1')}
    ${getLaurelBadgeHtml('Chuẩn Dinh Dưỡng', 'Cơm Nhà 3 Miền', '2026')}
  </div>

  <!-- Right-Offset Phone Frame -->
  <div class="phone-shell phone-slide1">
    <div class="phone-screen">
      <div class="universal-notch"><div class="universal-lens"></div></div>
      <img class="raw-ui" src="${screenBase64}" alt="Mâm Cơm 3 Món" />
    </div>
  </div>

  <!-- Pop-Out Dish Cards Breaking Outside the Left Phone Edge -->
  <div class="pop-card-light pop-meal-1">
    <div style="display:flex;align-items:center;gap:24px;">
      <div class="pop-icon-circle" style="background:#FEF08A;">🍲</div>
      <div>
        <div class="pop-title-light">Mâm Cơm 3 Món Hôm Nay</div>
        <div class="pop-sub-light">Mặn • Canh • Rau chuẩn vị gia đình</div>
      </div>
    </div>
  </div>

  <div class="pop-card-light pop-meal-2">
    <div style="display:flex;align-items:center;gap:24px;">
      <div class="pop-icon-circle" style="background:#BAE6FD;">🥗</div>
      <div>
        <div class="pop-title-light">Đổi Món Tức Thì 1 Chạm</div>
        <div class="pop-sub-light">9h15 Sáng → Tự động cân đối chi phí</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// SLIDE 2: Top Bleed Dark Phone + 4 Pop-Out Action Cards + Bottom 5-Star Review Quote
// (Directly matches Reference Screenshot 2: "This app has literally changed my life.")
// ============================================================================
function getSlide2Html(screenBase64: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_EDITORIAL_CSS}
    body {
      background: linear-gradient(180deg, #E0E7FF 0%, #EDE9FE 55%, #F5F3FF 100%);
    }
    .phone-slide2 {
      top: -180px;
      left: 145px;
      width: 1000px;
      height: 1720px;
      background: #09090B;
    }
    .chat-prompt-box {
      position: absolute;
      top: 60px;
      right: 195px;
      width: 680px;
      background: rgba(39, 39, 42, 0.94);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255,255,255,0.14);
      border-radius: 36px;
      padding: 28px 36px;
      color: #F4F4F5;
      font-size: 27px;
      line-height: 1.38;
      font-weight: 500;
      z-index: 55;
      box-shadow: 0 20px 44px rgba(0,0,0,0.45);
    }
    .chat-reply-pill {
      position: absolute;
      top: 310px;
      left: 195px;
      background: linear-gradient(135deg, #4C1D95 0%, #3B0764 100%);
      border: 1.5px solid rgba(196, 181, 253, 0.35);
      border-radius: 34px;
      padding: 22px 36px;
      color: #FFFFFF;
      font-size: 28px;
      font-weight: 700;
      z-index: 55;
      box-shadow: 0 18px 38px rgba(0,0,0,0.45);
    }
    /* 4 Wide Pop-out Dark Cards Across the Phone Frame */
    .pop-dark-1 { top: 490px; left: 75px; width: 1140px; }
    .pop-dark-2 { top: 690px; left: 105px; width: 1110px; }
    .pop-dark-3 { top: 890px; left: 75px; width: 1140px; }
    .pop-dark-4 { top: 1090px; left: 105px; width: 1110px; }

    /* Bottom 5-Star Review Quote Zone */
    .review-zone {
      position: absolute;
      top: 1650px;
      left: 80px;
      right: 80px;
      bottom: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      z-index: 40;
    }
    .stars-row {
      display: flex;
      gap: 22px;
      font-size: 76px;
      color: #F59E0B;
      filter: drop-shadow(0 6px 14px rgba(245, 158, 11, 0.25));
    }
    .quote-serif {
      font-family: "Times New Roman", "Palatino Linotype", serif;
      font-size: 104px;
      line-height: 1.12;
      color: #18181B;
      letter-spacing: -1px;
    }
    .quote-author {
      font-size: 40px;
      font-weight: 600;
      color: #27272A;
    }
    .quote-footer {
      font-size: 38px;
      font-weight: 700;
      color: #18181B;
    }
  </style>
</head>
<body>
  <!-- Sparkles -->
  <div class="sparkle" style="top:1860px;left:95px;">✦</div>
  <div class="sparkle" style="top:2160px;left:160px;font-size:34px;">✦</div>
  <div class="sparkle" style="top:2340px;left:280px;font-size:40px;">✦</div>
  <div class="sparkle" style="top:2260px;right:150px;">✦</div>

  <!-- Top Phone Bleed -->
  <div class="phone-shell phone-slide2">
    <div class="phone-screen dark-bg">
      <img class="raw-ui" src="${screenBase64}" alt="Thực Đơn Tuần" style="filter:brightness(0.42) blur(2px);" />
    </div>
  </div>

  <!-- Prompt & Reply Bubbles -->
  <div class="chat-prompt-box">
    Mình cần lên thực đơn cả tuần cho gia đình 4 người, đủ 3 món mỗi bữa và khớp ngân sách 800k.
  </div>
  <div class="chat-reply-pill">
    Đã xếp xong thực đơn 7 ngày cho nhà mình 🙌
  </div>

  <!-- 4 Wide Horizontal Pop-out Cards -->
  <div class="pop-card-dark pop-dark-1">
    <div class="pop-icon-circle" style="background:#C084FC;">💜</div>
    <div>
      <div class="pop-title-dark">Thực Đơn 7 Ngày Tự Động</div>
      <div class="pop-sub-dark">🗓️ Đủ Sáng • Trưa • Tối • 25 phút chuẩn bị</div>
    </div>
  </div>

  <div class="pop-card-dark pop-dark-2">
    <div class="pop-icon-circle" style="background:#FEF08A;">🍳</div>
    <div>
      <div class="pop-title-dark">Bữa Sáng Nhanh Gọn Cho Cả Nhà</div>
      <div class="pop-sub-dark">🗓️ 07:00 Sáng → 07:30 Sáng • Đủ năng lượng</div>
    </div>
  </div>

  <div class="pop-card-dark pop-dark-3">
    <div class="pop-icon-circle" style="background:#7DD3FC;">🍲</div>
    <div>
      <div class="pop-title-dark">Cơm Tối Sum Vầy 3 Món</div>
      <div class="pop-sub-dark">🗓️ 18:00 Tối → 19:00 Tối • Khớp ngân sách tuần</div>
    </div>
  </div>

  <div class="pop-card-dark pop-dark-4">
    <div class="pop-icon-circle" style="background:#A7F3D0;">🛒</div>
    <div>
      <div class="pop-title-dark">Gom Nguyên Liệu Đi Chợ 1 Chạm</div>
      <div class="pop-sub-dark">🗓️ Tự động cộng dồn định lượng cả tuần</div>
    </div>
  </div>

  <!-- Bottom 5-Star Review Quote -->
  <div class="review-zone">
    <div class="stars-row">
      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
    </div>
    <div class="quote-serif">
      “Ứng dụng này đã<br/>
      thay đổi hoàn toàn<br/>
      căn bếp nhà mình.”
    </div>
    <div class="quote-author">Chị Minh Anh • TP.HCM</div>
    <div class="quote-footer">Hơn 45.000+ đánh giá 5 sao</div>
  </div>
</body>
</html>`;
}

// ============================================================================
// SLIDE 3: Soft Lavender + Top Editorial Serif + Centered Phone + 2 Wide Pop-Out Checkable Cards
// (Directly matches Reference Screenshot 3: "Organize daily tasks")
// ============================================================================
function getSlide3Html(screenBase64: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_EDITORIAL_CSS}
    body {
      background: linear-gradient(180deg, #DDD6FE 0%, #E0E7FF 55%, #EDE9FE 100%);
    }
    .headline-wrap {
      position: absolute;
      top: 140px;
      left: 70px;
      right: 70px;
      z-index: 30;
    }
    .serif-headline {
      font-size: 122px;
    }
    .phone-slide3 {
      top: 520px;
      left: 115px;
      width: 1060px;
      height: 2200px;
    }
    .pop-check-1 {
      top: 1480px;
      left: 44px;
      width: 1160px;
    }
    .pop-check-2 {
      top: 1690px;
      left: 86px;
      width: 1160px;
    }
    .unchecked-ring {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px solid #18181B;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="headline-wrap">
    <div class="serif-headline">
      Đi chợ chung<br/>
      thời gian thực
    </div>
  </div>

  <!-- Centered Full Phone Frame -->
  <div class="phone-shell phone-slide3">
    <div class="phone-screen">
      <div class="universal-notch"><div class="universal-lens"></div></div>
      <img class="raw-ui" src="${screenBase64}" alt="Đi Chợ Chung" />
    </div>
  </div>

  <!-- 2 Wide Pop-Out Checkable Grocery Cards Breaking Outside Both Phone Edges -->
  <div class="pop-card-light pop-check-1">
    <div style="display:flex;align-items:center;gap:24px;">
      <div class="pop-icon-circle" style="background:#FEF08A;">🥩</div>
      <div>
        <div class="pop-title-light">Thịt ba rọi &amp; Cá lóc tươi</div>
        <div class="pop-sub-light">Quầy Thịt Cá • Đã phân công cho Chồng</div>
      </div>
    </div>
    <div class="unchecked-ring"></div>
  </div>

  <div class="pop-card-light pop-check-2">
    <div style="display:flex;align-items:center;gap:24px;">
      <div class="pop-icon-circle" style="background:#DDD6FE;">🥬</div>
      <div>
        <div class="pop-title-light">Rau muống, Cà chua &amp; Hành ngò</div>
        <div class="pop-sub-light">Quầy Rau Tươi • Đồng bộ giỏ hàng tức thì</div>
      </div>
    </div>
    <div class="unchecked-ring"></div>
  </div>
</body>
</html>`;
}

// ============================================================================
// SLIDE 4: Top Phone Bleed + Frosted Glass Expiry Alert + 3D Squircle Icons + Bottom Serif Headline
// (Directly matches Reference Screenshot 4: "Schedule reminders / Never forget anything")
// ============================================================================
function getSlide4Html(screenBase64: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_EDITORIAL_CSS}
    body {
      background: linear-gradient(180deg, #E0F2FE 0%, #E0E7FF 60%, #EDE9FE 100%);
    }
    .phone-slide4 {
      top: -150px;
      left: 115px;
      width: 1060px;
      height: 1820px;
    }
    /* Frosted Glass Live Activity Banner inside Phone */
    .frosted-expiry-widget {
      position: absolute;
      top: 860px;
      left: 195px;
      right: 195px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(28px);
      border-radius: 46px;
      padding: 34px 42px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 28px 60px rgba(15, 23, 42, 0.25), 0 0 0 2px rgba(255,255,255,0.7);
      z-index: 55;
    }
    .timer-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 12px solid #C4B5FD;
      border-top-color: #6D28D9;
      border-right-color: #6D28D9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 46px;
      background: #FFFFFF;
    }
    /* Floating Tilted 3D Squircle Alarm Badges */
    .squircle-3d {
      position: absolute;
      width: 220px;
      height: 220px;
      border-radius: 56px;
      background: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 104px;
      color: #FFFFFF;
      box-shadow:
        0 28px 50px rgba(124, 58, 237, 0.35),
        inset 0 4px 12px rgba(255, 255, 255, 0.45);
      z-index: 60;
    }
    .squircle-left {
      top: 1620px;
      left: -24px;
      transform: rotate(-14deg);
    }
    .squircle-right {
      top: 2180px;
      right: -28px;
      transform: rotate(14deg);
    }
    /* Bottom Text Zone */
    .bottom-copy-zone {
      position: absolute;
      top: 1810px;
      left: 90px;
      right: 90px;
      bottom: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      z-index: 40;
    }
    .serif-headline {
      font-size: 122px;
      margin-bottom: 48px;
    }
    .bold-sub {
      font-size: 44px;
      font-weight: 800;
      color: #18181B;
      margin-bottom: 42px;
    }
    .body-desc {
      font-size: 42px;
      font-weight: 500;
      color: #27272A;
      line-height: 1.42;
      max-width: 960px;
    }
  </style>
</head>
<body>
  <!-- Top Phone Bleed -->
  <div class="phone-shell phone-slide4">
    <div class="phone-screen">
      <img class="raw-ui" src="${screenBase64}" alt="Tủ Lạnh Thông Minh" />
    </div>
  </div>

  <!-- Frosted Glass Expiry Widget Overlay -->
  <div class="frosted-expiry-widget">
    <div style="display:flex;align-items:center;gap:28px;">
      <div class="timer-ring">⏱️</div>
      <div>
        <div style="font-size:30px;font-weight:700;color:#475569;">Nhắc hạn thực phẩm</div>
        <div style="font-size:54px;font-weight:900;color:#0F172A;letter-spacing:-1px;">Còn 2 ngày</div>
      </div>
    </div>
    <div style="width:86px;height:86px;border-radius:50%;background:#18181B;color:#FFF;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;">
      🍲
    </div>
  </div>

  <!-- Floating 3D Squircle Icons -->
  <div class="squircle-3d squircle-left">🔔</div>
  <div class="squircle-3d squircle-right">🥬</div>

  <!-- Bottom Editorial Serif Copy -->
  <div class="bottom-copy-zone">
    <div class="serif-headline">
      Nhắc hạn tủ lạnh<br/>
      thông minh
    </div>
    <div class="bold-sub">Không bao giờ quên đồ trong tủ</div>
    <div class="body-desc">
      Tự động cảnh báo nguyên liệu sắp hết hạn,<br/>
      theo dõi đồ ăn dư và gợi ý ngay món ngon<br/>
      từ thực phẩm sẵn có trong bếp nhà bạn.
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// SLIDE 5: Top Serif Headline + Full Dark Sleek Phone + Step-by-Step Cooking Cards & Sparkles
// (Directly matches Reference Screenshot 5: "Brain dump all your plans with AI")
// ============================================================================
function getSlide5Html(screenBase64: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_EDITORIAL_CSS}
    body {
      background: linear-gradient(180deg, #F1F5F9 0%, #E0E7FF 55%, #DDD6FE 100%);
    }
    .headline-wrap {
      position: absolute;
      top: 135px;
      left: 60px;
      right: 60px;
      z-index: 30;
    }
    .serif-headline {
      font-size: 116px;
    }
    .phone-slide5 {
      top: 480px;
      left: 115px;
      width: 1060px;
      height: 2180px;
      background: #09090B;
    }
    /* Pop-out step cards over the bottom half of the phone */
    .pop-step-1 { top: 1560px; left: 75px; width: 1140px; }
    .pop-step-2 { top: 1755px; left: 105px; width: 1110px; }
    .pop-step-3 { top: 1950px; left: 75px; width: 1140px; }
    .pop-step-4 { top: 2145px; left: 105px; width: 1110px; }
  </style>
</head>
<body>
  <div class="headline-wrap">
    <div class="serif-headline">
      Nấu ăn thảnh thơi<br/>
      từng bước chuẩn vị
    </div>
  </div>

  <!-- Full Sleek Phone -->
  <div class="phone-shell phone-slide5">
    <div class="phone-screen">
      <div class="universal-notch"><div class="universal-lens"></div></div>
      <img class="raw-ui" src="${screenBase64}" alt="Sổ Tay Công Thức" />
    </div>
  </div>

  <!-- 4 Pop-Out Step-by-Step Cooking Cards -->
  <div class="pop-card-dark pop-step-1">
    <div class="pop-icon-circle" style="background:#C084FC;">🥣</div>
    <div>
      <div class="pop-title-dark">Sơ chế nguyên liệu (0/8 sẵn sàng)</div>
      <div class="pop-sub-dark">📋 Tự tay đánh dấu từng món khi chuẩn bị</div>
    </div>
  </div>

  <div class="pop-card-dark pop-step-2">
    <div class="pop-icon-circle" style="background:#FEF08A;">🔥</div>
    <div>
      <div class="pop-title-dark">Bước 1: Ướp gia vị &amp; Phi thơm hành tỏi</div>
      <div class="pop-sub-dark">⏱️ 05:00 phút → Định lượng chuẩn từng muỗng</div>
    </div>
  </div>

  <div class="pop-card-dark pop-step-3">
    <div class="pop-icon-circle" style="background:#7DD3FC;">🍲</div>
    <div>
      <div class="pop-title-dark">Bước 2: Kho liu riu thấm đẫm hương vị</div>
      <div class="pop-sub-dark">⏱️ 20:00 phút → Hẹn giờ thông minh ngay trên bếp</div>
    </div>
  </div>

  <div class="pop-card-dark pop-step-4">
    <div class="pop-icon-circle" style="background:#A7F3D0;">✨</div>
    <div>
      <div class="pop-title-dark">Bước 3: Bày mâm 3 món nóng hổi</div>
      <div class="pop-sub-dark">⏱️ Trọn vẹn dinh dưỡng cho cả gia đình</div>
    </div>
  </div>

  <!-- Sparkles around bottom of phone -->
  <div class="sparkle" style="top:2390px;left:135px;">✦</div>
  <div class="sparkle" style="top:2435px;left:220px;font-size:36px;">✦</div>
  <div class="sparkle" style="top:2395px;left:450px;font-size:38px;">✦</div>
</body>
</html>`;
}

// ============================================================================
// SLIDE 6: Top Editorial Serif + Subhead + 2 Rows of 6 Circular Culinary Orbs + Bottom Phone
// (Directly matches Reference Screenshot 5 Right Card: "Stay organized & focused")
// ============================================================================
function getSlide6Html(
  screenBase64: string,
  orb1Base64: string,
  orb2Base64: string,
  orb3Base64: string,
  orb4Base64: string
): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_EDITORIAL_CSS}
    body {
      background: linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 52%, #DDD6FE 100%);
    }
    .headline-wrap {
      position: absolute;
      top: 135px;
      left: 70px;
      right: 70px;
      text-align: center;
      z-index: 30;
    }
    .serif-headline {
      font-size: 118px;
      margin-bottom: 28px;
    }
    .sub-caption {
      font-size: 38px;
      font-weight: 500;
      color: #27272A;
    }
    /* 2 Rows of Circular Aesthetic Culinary Orbs */
    .orbs-container {
      position: absolute;
      top: 540px;
      left: 50px;
      right: 50px;
      display: flex;
      flex-direction: column;
      gap: 38px;
      z-index: 30;
    }
    .orbs-row {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 64px;
    }
    .orb-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 280px;
    }
    .culinary-orb {
      width: 236px;
      height: 236px;
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      box-shadow:
        0 20px 44px rgba(24, 24, 27, 0.16),
        inset 0 0 0 5px rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .culinary-orb img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .orb-caption {
      font-size: 25px;
      font-weight: 800;
      color: #18181B;
      text-align: center;
      background: rgba(255, 255, 255, 0.78);
      padding: 6px 20px;
      border-radius: 999px;
      box-shadow: 0 4px 12px rgba(24, 24, 27, 0.06);
      white-space: nowrap;
    }
    /* Bottom Phone Frame */
    .phone-slide6 {
      top: 1290px;
      left: 145px;
      width: 1000px;
      height: 1730px;
    }
  </style>
</head>
<body>
  <div class="headline-wrap">
    <div class="serif-headline">
      Trọn vẹn hương vị<br/>
      mâm cỗ sum vầy
    </div>
    <div class="sub-caption">Đầy đủ thực đơn 3 miền, ăn thanh đạm &amp; tiệc gia đình</div>
  </div>

  <!-- 2 Rows of Circular Culinary Orbs -->
  <div class="orbs-container">
    <div class="orbs-row">
      <div class="orb-col">
        <div class="culinary-orb" style="background:radial-gradient(circle at 30% 30%, #93C5FD, #2563EB);">
          <img src="${orb1Base64}" alt="Cơm Bắc" />
        </div>
        <div class="orb-caption">Cơm Nhà Miền Bắc</div>
      </div>
      <div class="orb-col">
        <div class="culinary-orb" style="background:radial-gradient(circle at 30% 30%, #FDBA74, #EA580C);">
          <img src="${orb2Base64}" alt="Miền Trung" />
        </div>
        <div class="orb-caption">Đậm Đà Miền Trung</div>
      </div>
      <div class="orb-col">
        <div class="culinary-orb" style="background:radial-gradient(circle at 30% 30%, #86EFAC, #16A34A);">
          <img src="${orb3Base64}" alt="Miền Nam" />
        </div>
        <div class="orb-caption">Ngọt Lành Miền Nam</div>
      </div>
    </div>
    <div class="orbs-row">
      <div class="orb-col">
        <div class="culinary-orb" style="background:radial-gradient(circle at 30% 30%, #F9A8D4, #DB2777);">
          <img src="${orb4Base64}" alt="Mâm Cỗ" />
        </div>
        <div class="orb-caption">Mâm Cỗ Đãi Tiệc</div>
      </div>
      <div class="orb-col">
        <div class="culinary-orb" style="background:radial-gradient(circle at 30% 30%, #FEF08A, #EAB308);">
          <div style="font-size:105px;">🥗</div>
        </div>
        <div class="orb-caption">Thực Đơn Thanh Đạm</div>
      </div>
      <div class="orb-col">
        <div class="culinary-orb" style="background:radial-gradient(circle at 30% 30%, #DDD6FE, #7C3AED);">
          <div style="font-size:105px;">🍲</div>
        </div>
        <div class="orb-caption">Lẩu Nướng Cuối Tuần</div>
      </div>
    </div>
  </div>

  <!-- Bottom Phone Frame -->
  <div class="phone-shell phone-slide6">
    <div class="phone-screen">
      <div class="universal-notch"><div class="universal-lens"></div></div>
      <img class="raw-ui" src="${screenBase64}" alt="Mâm Cỗ & Tiệc Gia Đình" />
    </div>
  </div>
</body>
</html>`;
}

interface PosterMeta {
  filename: string;
  categoryPill: string;
  headline: string;
  subtitle: string;
  badges: [string, string];
  accentColor: string;
  bgFilename: string;
  screenFilename: string;
}

const POSTER_CONFIGS: PosterMeta[] = [
  {
    filename: 'poster-01-mam-com-3-mon.png',
    categoryPill: 'MÂM CƠM HÔM NAY',
    headline: 'Trợ lý thực đơn & mâm cơm gia đình',
    subtitle: 'Tự động gợi ý bộ 3 món Mặn - Canh - Rau đủ chất, ngon miệng và tiết kiệm chi phí mỗi ngày.',
    badges: ['Cân đối dinh dưỡng tự động', 'Tiết kiệm 45 phút chuẩn bị'],
    accentColor: '#4F46E5',
    bgFilename: 'nano-bg-warm-kitchen.jpg',
    screenFilename: '01_screen_mam_com_3_mon.png',
  },
  {
    filename: 'poster-02-thuc-don-tuan.png',
    categoryPill: 'THỰC ĐƠN CẢ TUẦN',
    headline: 'Lên lịch 7 ngày trong 1 lần chạm',
    subtitle: 'Tối ưu thực đơn theo khẩu vị vùng miền Bắc - Trung - Nam, không lo trùng món và kiểm soát trọn vẹn ngân sách.',
    badges: ['0 ngày lo nghĩ thực đơn', 'Hơn 45.000+ đánh giá 5 sao'],
    accentColor: '#6366F1',
    bgFilename: 'nano-bg-fresh-market.jpg',
    screenFilename: '02_screen_thuc_don_tuan.png',
  },
  {
    filename: 'poster-03-di-cho-chung.png',
    categoryPill: 'ĐI CHỢ THÔNG MINH',
    headline: 'Đi chợ chung thời gian thực',
    subtitle: 'Tự động gom nguyên liệu theo từng quầy hàng tại chợ, đồng bộ tức thì giỏ hàng giữa các thành viên.',
    badges: ['Phòng mua chung trực tiếp', 'Tự động phân loại theo quầy'],
    accentColor: '#8B5CF6',
    bgFilename: 'nano-bg-fresh-market.jpg',
    screenFilename: '03_screen_di_cho_chung.png',
  },
  {
    filename: 'poster-04-tu-lanh-thong-minh.png',
    categoryPill: 'TỦ LẠNH THÔNG MINH',
    headline: 'Nhắc hạn tủ lạnh thông minh',
    subtitle: 'Quản lý hạn dùng thực phẩm, nhận cảnh báo trước khi ôi thiu và gợi ý món ngon vét sạch tủ lạnh.',
    badges: ['Cảnh báo hạn dùng thông minh', 'Không bao giờ quên đồ trong tủ'],
    accentColor: '#7C3AED',
    bgFilename: 'nano-bg-smart-fridge.jpg',
    screenFilename: '04_screen_tu_lanh_thong_minh.png',
  },
  {
    filename: 'poster-05-cong-thuc-chuan-vi.png',
    categoryPill: 'CÔNG THỨC CHUẨN VỊ',
    headline: 'Nấu ăn thảnh thơi từng bước chuẩn vị',
    subtitle: 'Định lượng chính xác từng muỗng thìa, tự tay đánh dấu sơ chế và hẹn giờ thông minh ngay trên bếp.',
    badges: ['Định lượng thìa muỗng chuẩn gia đình', 'Hẹn giờ nấu ăn thông minh'],
    accentColor: '#4F46E5',
    bgFilename: 'nano-bg-warm-kitchen.jpg',
    screenFilename: '05_screen_so_tay_cong_thuc.png',
  },
  {
    filename: 'poster-06-mam-co-tiec.png',
    categoryPill: 'TIỆC VUI SUM VẦY',
    headline: 'Trọn vẹn hương vị mâm cỗ sum vầy',
    subtitle: 'Hơn 50 bộ thực đơn liên hoan, ẩm thực 3 miền và lưu trữ đồng bộ đám mây tức thì trên cả iOS và Android.',
    badges: ['50+ thực đơn đãi tiệc phong phú', 'Đồng bộ iOS & Android tức thì'],
    accentColor: '#EC4899',
    bgFilename: 'nano-bg-family-feast.jpg',
    screenFilename: '06_screen_tiec_gia_dinh.png',
  },
];

async function main() {
  console.log('🚀 Starting Mealy Editorial Pastel Store Asset Compositor (Unified iOS & Android)...');
  const startTime = Date.now();

  [ICONS_DIR, FEATURE_GRAPHIC_DIR, POSTERS_DIR, RAW_SCREENS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const page = await browser.newPage();

  const renderHtmlToPng = async (w: number, h: number, html: string, outPath: string) => {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map(img =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
        )
      );
    });
    await page.screenshot({ path: outPath, type: 'png' });
  };

  // Load base64 assets
  const iconBase64 = toDataUrl(path.join(STORE_ASSETS_DIR, 'nano-app-icon.jpg'));
  const screen1Base64 = toDataUrl(path.join(RAW_SCREENS_DIR, '01_screen_mam_com_3_mon.png'));
  const screen2Base64 = toDataUrl(path.join(RAW_SCREENS_DIR, '02_screen_thuc_don_tuan.png'));
  const screen3Base64 = toDataUrl(path.join(RAW_SCREENS_DIR, '03_screen_di_cho_chung.png'));
  const screen4Base64 = toDataUrl(path.join(RAW_SCREENS_DIR, '04_screen_tu_lanh_thong_minh.png'));
  const screen5Base64 = toDataUrl(path.join(RAW_SCREENS_DIR, '05_screen_so_tay_cong_thuc.png'));
  const screen6Base64 = toDataUrl(path.join(RAW_SCREENS_DIR, '06_screen_tiec_gia_dinh.png'));

  const orb1Base64 = toDataUrl(path.join(STORE_ASSETS_DIR, 'nano-bg-warm-kitchen.jpg'));
  const orb2Base64 = toDataUrl(path.join(STORE_ASSETS_DIR, 'nano-bg-fresh-market.jpg'));
  const orb3Base64 = toDataUrl(path.join(STORE_ASSETS_DIR, 'nano-bg-smart-fridge.jpg'));
  const orb4Base64 = toDataUrl(path.join(STORE_ASSETS_DIR, 'nano-bg-family-feast.jpg'));

  // 1. App Icons (1024x1024 & 512x512)
  console.log('📦 Compositing Unified App Icons...');
  const icon1024Path = path.join(ICONS_DIR, 'app-icon-1024.png');
  await renderHtmlToPng(1024, 1024, getAppIconHtml(1024, iconBase64), icon1024Path);

  const icon512Path = path.join(ICONS_DIR, 'app-icon-512.png');
  await renderHtmlToPng(512, 512, getAppIconHtml(512, iconBase64), icon512Path);

  // 2. Google Play Feature Graphic (1024x500)
  console.log('🖼️ Compositing Unified Feature Graphic (1024x500)...');
  const featGraphicPath = path.join(FEATURE_GRAPHIC_DIR, 'feature-graphic-1024x500.png');
  await renderHtmlToPng(1024, 500, getFeatureGraphicHtml(screen1Base64, iconBase64), featGraphicPath);

  // 3. 6 Vertical Editorial Pastel Store Posters (1290x2796 — Identical for iOS App Store & Android CH Play)
  console.log('📱 Compositing 6 Editorial Pastel Store Posters (1290x2796)...');
  const slideHtmls = [
    getSlide1Html(screen1Base64),
    getSlide2Html(screen2Base64),
    getSlide3Html(screen3Base64),
    getSlide4Html(screen4Base64),
    getSlide5Html(screen5Base64),
    getSlide6Html(screen6Base64, orb1Base64, orb2Base64, orb3Base64, orb4Base64),
  ];

  const generatedPostersMetadata = [];

  for (let i = 0; i < POSTER_CONFIGS.length; i++) {
    const config = POSTER_CONFIGS[i];
    const posterOutPath = path.join(POSTERS_DIR, config.filename);
    await renderHtmlToPng(1290, 2796, slideHtmls[i], posterOutPath);
    const stats = fs.statSync(posterOutPath);
    const dims = getPngDimensions(posterOutPath);
    console.log(`  ✓ [${i + 1}/6] ${config.filename} (${dims.width}x${dims.height}, ${(stats.size / 1024).toFixed(1)} KB)`);

    generatedPostersMetadata.push({
      slide: i + 1,
      category: config.categoryPill,
      headline: config.headline,
      subtitle: config.subtitle,
      badges: config.badges,
      accentColor: config.accentColor,
      path: `/store-assets/posters/${config.filename}`,
      width: dims.width,
      height: dims.height,
      format: 'image/png',
      sizeBytes: stats.size,
      rawScreenPath: `/store-assets/raw-screens/${config.screenFilename}`,
      backdropUsed: `/store-assets/${config.bgFilename}`,
    });
  }

  await browser.close();

  // 4. Unified Manifest for both iOS App Store & Android Google Play
  const unifiedStoreSpecs = {
    category: 'Ẩm thực & Bếp nhà',
    contentRating: '4+',
    rating: 4.9,
    ratingCount: 45200,
    price: 'Miễn phí',
    specifications: {
      size: '18.5 MB',
      compatibility: 'iOS & Android',
      languages: ['Tiếng Việt'],
    },
  };

  const manifest = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    app: {
      name: 'Mealy',
      fullName: 'Mealy - Trợ Lý Mâm Cơm & Đi Chợ',
      bundleId: 'vn.mealwise.app',
      developer: 'MealWise Studio',
      version: '2.0.0',
      buildNumber: 200,
      category: 'Ẩm thực & Bếp nhà',
    },
    platforms: {
      ios: {
        storeName: 'Apple App Store',
        ...unifiedStoreSpecs,
        icon: {
          path: '/store-assets/icons/app-icon-1024.png',
          width: 1024,
          height: 1024,
          format: 'image/png',
          sizeBytes: fs.statSync(icon1024Path).size,
        },
        screenshots: generatedPostersMetadata,
      },
      android: {
        storeName: 'Google Play',
        ...unifiedStoreSpecs,
        downloads: '500.000+',
        icon: {
          path: '/store-assets/icons/app-icon-512.png',
          width: 512,
          height: 512,
          format: 'image/png',
          sizeBytes: fs.statSync(icon512Path).size,
        },
        featureGraphic: {
          path: '/store-assets/feature-graphic/feature-graphic-1024x500.png',
          width: 1024,
          height: 500,
          format: 'image/png',
          sizeBytes: fs.statSync(featGraphicPath).size,
        },
        screenshots: generatedPostersMetadata,
      },
    },
  };

  const manifestPath = path.join(STORE_ASSETS_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`🎉 Composited all Editorial Pastel store assets in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
}

main().catch(err => {
  console.error('Fatal compositor error:', err);
  process.exit(1);
});
