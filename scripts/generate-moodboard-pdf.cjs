const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const gourmetImgPath = path.join(rootDir, 'public', 'mockups', 'style2-warm-gourmet.jpg');
const bentoDarkImgPath = path.join(rootDir, 'public', 'mockups', 'editorial-precision-dark.jpg');
const bentoLightImgPath = path.join(rootDir, 'public', 'mockups', 'editorial-precision-light.jpg');

const ref01Path = path.join(rootDir, 'docs', 'logo-moodboard-refs', '01_logo_moodboard_structure.png');
const ref02Path = path.join(rootDir, 'docs', 'logo-moodboard-refs', '02_food_app_icon_trends.png');
const ref03Path = path.join(rootDir, 'docs', 'logo-moodboard-refs', '03_bento_brand_identity_grid.png');
const ref04Path = path.join(rootDir, 'docs', 'logo-moodboard-refs', '04_vietnamese_culinary_brand_motifs.png');

function toDataUri(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

const gourmetDataUri = toDataUri(gourmetImgPath);
const bentoDarkUri = toDataUri(bentoDarkImgPath);
const bentoLightUri = toDataUri(bentoLightImgPath);
const ref01Uri = toDataUri(ref01Path);
const ref02Uri = toDataUri(ref02Path);
const ref03Uri = toDataUri(ref03Path);
const ref04Uri = toDataUri(ref04Path);

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MealWise — Bảng Cảm Hứng Thị Giác &amp; Hệ Thống Ngôn Ngữ Thiết Kế v4.0</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@500;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #E2E8F0;
      color: #0F172A;
      font-size: 9pt;
      line-height: 1.4;
      overflow-x: hidden;
    }

    /* INTERACTIVE STUDIO TOOLBAR (SCREEN ONLY) */
    .studio-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: rgba(18, 22, 31, 0.96);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid #2D3748;
      color: #F8FAFC;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.35);
    }

    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 900;
      font-size: 10pt;
      letter-spacing: -0.01em;
    }

    .toolbar-nav {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .toolbar-link {
      color: #CBD5E1;
      text-decoration: none;
      font-size: 8pt;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 999px;
      background: #1A202C;
      border: 1px solid #2D3748;
      transition: all 0.15s ease;
    }

    .toolbar-link:hover {
      background: #1D4ED8;
      color: #FFFFFF;
      border-color: #3B82F6;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-studio {
      cursor: pointer;
      border: none;
      font-family: inherit;
      font-size: 8pt;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 10px;
      background: #1D4ED8;
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
    }

    .btn-studio:hover {
      background: #2563EB;
    }

    /* INTERACTIVE PLAYGROUND PANEL (SCREEN ONLY) */
    .interactive-dock {
      max-width: 210mm;
      margin: 16px auto 0 auto;
      background: #12161F;
      color: #F8FAFC;
      border: 1px solid #2D3748;
      border-radius: 20px;
      padding: 14px 18px;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 16px;
      align-items: center;
      box-shadow: 0 12px 28px -8px rgba(15, 23, 42, 0.25);
    }

    .radius-btn-group {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .radius-chip {
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 8px;
      background: #1A202C;
      color: #94A3B8;
      border: 1px solid #2D3748;
      transition: all 0.15s ease;
    }

    .radius-chip.active, .radius-chip:hover {
      background: #1D4ED8;
      color: #FFFFFF;
      border-color: #60A5FA;
    }

    .copy-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0F172A;
      color: #34D399;
      border: 1.5px solid #10B981;
      padding: 8px 16px;
      border-radius: 999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      font-weight: 800;
      z-index: 9999;
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
      transition: all 0.2s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .copy-toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* A4 SHEET CONTAINER */
    .sheet {
      width: 210mm;
      height: 297mm;
      margin: 16px auto;
      padding: 10.5mm 13mm 10mm 13mm;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #F8FAFC;
      overflow: hidden;
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.18);
    }

    .sheet:last-of-type {
      page-break-after: auto;
    }

    @media print {
      body {
        background: #F8FAFC;
      }
      .studio-toolbar,
      .interactive-dock,
      .copy-toast {
        display: none !important;
      }
      .sheet {
        margin: 0;
        box-shadow: none;
      }
    }

    /* RUNNING HEADER & FOOTER */
    .running-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 5px;
      border-bottom: 1.5px solid #E2E8F0;
      margin-bottom: 8px;
      flex-shrink: 0;
    }

    .running-brand {
      display: flex;
      align-items: center;
      gap: 7px;
      font-weight: 900;
      font-size: 7.8pt;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #0F172A;
    }

    .running-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1D4ED8;
      display: inline-block;
      flex-shrink: 0;
    }

    .running-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7pt;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.02em;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .running-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 5px;
      border-top: 1.5px solid #E2E8F0;
      margin-top: 6px;
      font-size: 7pt;
      font-weight: 700;
      color: #64748B;
      flex-shrink: 0;
    }

    .page-num {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      color: #1D4ED8;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* HERO COVER BLOCK */
    .hero-cover {
      background: #12161F;
      color: #F8FAFC;
      border-radius: 20px;
      padding: 13px 18px;
      border: 1px solid #2D3748;
      position: relative;
      margin-bottom: 8px;
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1D4ED8;
      color: #FFFFFF;
      font-size: 6.8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 10px;
      border-radius: 999px;
      white-space: nowrap;
    }

    .tag-outline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.8pt;
      font-weight: 700;
      color: #EAB308;
      background: rgba(234, 179, 8, 0.12);
      border: 1px solid rgba(234, 179, 8, 0.35);
      padding: 3px 9px;
      border-radius: 999px;
      white-space: nowrap;
    }

    .hero-title {
      font-size: 17.5pt;
      font-weight: 900;
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 4px;
      color: #FFFFFF;
    }

    .hero-title span {
      color: #60A5FA;
    }

    .hero-subtitle {
      font-size: 8pt;
      color: #94A3B8;
      line-height: 1.38;
      margin-bottom: 8px;
    }

    .hero-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      padding-top: 8px;
      border-top: 1px solid #2D3748;
    }

    .kpi-box {
      background: #1A202C;
      border: 1px solid #2D3748;
      border-radius: 10px;
      padding: 5px 8px;
    }

    .kpi-label {
      font-size: 6.3pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #94A3B8;
      letter-spacing: 0.03em;
    }

    .kpi-val {
      font-size: 8.6pt;
      font-weight: 900;
      color: #F8FAFC;
      margin-top: 1px;
    }

    /* SECTION HEADINGS */
    .sec-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    }

    .sec-title {
      font-size: 10.4pt;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.015em;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sec-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.2pt;
      font-weight: 800;
      background: #1D4ED8;
      color: #FFFFFF;
      padding: 1.5px 6px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .sec-sub {
      font-size: 7.2pt;
      font-weight: 600;
      color: #64748B;
      text-align: right;
    }

    /* PANELS */
    .panel {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 9px 11px;
    }

    .panel-dark {
      background: #12161F;
      border: 1px solid #2D3748;
      color: #F8FAFC;
      border-radius: 16px;
      padding: 9px 11px;
    }

    .panel-label {
      font-size: 6.8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748B;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .panel-label > span:first-child {
      min-width: 0;
      flex: 1;
    }

    .panel-label > span:last-child {
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* PAGE 1: 6-TILE BENTO MOOD BOARD */
    .bento-6tile-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
      margin-bottom: 8px;
    }

    .bento-tile {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 8px 9px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .bento-tile-dark {
      background: #12161F;
      border: 1px solid #2D3748;
      color: #F8FAFC;
      border-radius: 14px;
      padding: 8px 9px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .tile-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      margin-bottom: 5px;
    }

    .tile-badge-row > span:last-child {
      white-space: nowrap;
      flex-shrink: 0;
    }

    .tile-idx {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.4pt;
      font-weight: 800;
      padding: 1.5px 6px;
      border-radius: 5px;
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
      white-space: nowrap;
    }

    .tile-idx-dark {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.4pt;
      font-weight: 800;
      padding: 1.5px 6px;
      border-radius: 5px;
      background: #1A202C;
      color: #60A5FA;
      border: 1px solid #2D3748;
      white-space: nowrap;
    }

    .mood-img-card {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      position: relative;
      height: 96px;
      background: #0F172A;
      margin-bottom: 5px;
    }

    .mood-img-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .mood-img-tag {
      position: absolute;
      bottom: 4px;
      left: 4px;
      right: 4px;
      background: rgba(18, 22, 31, 0.88);
      color: #FFFFFF;
      padding: 2.5px 6px;
      border-radius: 5px;
      font-size: 6.2pt;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ref-pair-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      margin-bottom: 5px;
    }

    .ref-card {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #2D3748;
      position: relative;
      height: 96px;
      background: #090C12;
    }

    .ref-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .ref-caption {
      position: absolute;
      bottom: 3px;
      left: 3px;
      right: 3px;
      background: rgba(15, 23, 42, 0.92);
      color: #F8FAFC;
      font-size: 5.8pt;
      font-weight: 700;
      padding: 2px 4px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 60-30-10 PROPORTION BAR */
    .arch-bar-wrap {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 9px 11px;
    }

    .arch-bar {
      display: flex;
      height: 30px;
      border-radius: 10px;
      overflow: hidden;
      border: 1.5px solid #0F172A;
      margin: 5px 0;
    }

    .arch-60 {
      width: 60%;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      font-weight: 900;
      font-size: 7.8pt;
      border-right: 1.5px solid #0F172A;
    }

    .arch-30 {
      width: 30%;
      background: #1D4ED8;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      font-weight: 900;
      font-size: 7.8pt;
      border-right: 1.5px solid #0F172A;
    }

    .arch-10 {
      width: 10%;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }

    .arch-10 div:nth-child(1) { background: #10B981; }
    .arch-10 div:nth-child(2) { background: #EAB308; }
    .arch-10 div:nth-child(3) { background: #DC2626; }

    .arch-3cols {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
      margin-top: 5px;
    }

    .arch-col {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 5px 8px;
      font-size: 6.8pt;
    }

    /* PAGE 2: PANTONE SWATCH CARDS */
    .swatch-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 7px;
      margin-bottom: 8px;
    }

    .pantone-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.12s ease;
    }

    .pantone-card:hover {
      transform: translateY(-2px);
      border-color: #94A3B8;
    }

    .pantone-color {
      height: 44px;
      padding: 5px 7px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1px solid #E2E8F0;
    }

    .wcag-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 5.9pt;
      font-weight: 800;
      padding: 1.5px 5px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .pantone-body {
      padding: 5px 7px;
    }

    .pantone-name {
      font-weight: 900;
      font-size: 7.4pt;
      color: #0F172A;
    }

    .pantone-hex {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.8pt;
      font-weight: 700;
      color: #1D4ED8;
    }

    .pantone-role {
      font-size: 6.3pt;
      color: #64748B;
      margin-top: 2px;
      line-height: 1.25;
    }

    /* TABLES */
    .spec-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7pt;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }

    .spec-table th {
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 800;
      text-align: left;
      padding: 4.5px 7px;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .spec-table td {
      padding: 3.8px 7px;
      border-bottom: 1px solid #E2E8F0;
      color: #1E293B;
    }

    .spec-table tr:last-child td {
      border-bottom: none;
    }

    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 6.6pt;
    }

    /* PAGE 3: TYPOGRAPHY & FONT USES */
    .font-pair-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 8px;
      margin-bottom: 7px;
    }

    .weight-strip {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      margin-top: 5px;
    }

    .weight-chip {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 3.5px;
      text-align: center;
    }

    .type-specimen-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 5px 11px;
      margin-bottom: 7px;
    }

    .type-row {
      display: grid;
      grid-template-columns: 126px 1fr;
      align-items: center;
      gap: 10px;
      padding: 3px 0;
      border-bottom: 1px solid #F1F5F9;
      cursor: pointer;
    }

    .type-row:last-child {
      border-bottom: none;
    }

    .do-dont-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .do-card {
      background: #ECFDF5;
      border: 1.5px solid #10B981;
      border-radius: 12px;
      padding: 6px 9px;
    }

    .dont-card {
      background: #FEF2F2;
      border: 1.5px solid #DC2626;
      border-radius: 12px;
      padding: 6px 9px;
    }

    /* PAGE 4: BORDER RADIUS (ROUND) & GEOMETRY */
    .radius-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }

    .radius-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
    }

    .radius-card:hover {
      border-color: #1D4ED8;
    }

    .radius-visual-box {
      height: 50px;
      background: #EFF6FF;
      border: 2px solid #1D4ED8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      margin-bottom: 6px;
      position: relative;
    }

    .corner-indicator {
      width: 18px;
      height: 18px;
      border-top: 2.5px solid #DC2626;
      border-right: 2.5px solid #DC2626;
      position: absolute;
      top: -2px;
      right: -2px;
    }

    /* PAGE 5: LOGO & APP ICON SYSTEM */
    .logo-4grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }

    .logo-concept-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 8px;
      text-align: center;
    }

    .squircle-preview {
      width: 72px;
      height: 72px;
      margin: 0 auto 5px auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* PAGE 6: UI ANATOMY & ERGONOMICS */
    .ui-specimen-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 7px;
    }

    .mock-recipe-card {
      position: relative;
      height: 128px;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      background: #0F172A;
      color: #FFFFFF;
    }

    .mock-recipe-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.85;
    }

    .mock-card-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.35) 55%, rgba(15,23,42,0.15) 100%);
    }

    .mock-card-top {
      position: absolute;
      top: 7px;
      left: 8px;
      right: 8px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
    }

    .mock-card-bottom {
      position: absolute;
      bottom: 7px;
      left: 10px;
      right: 10px;
    }

    .icon-btn {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5pt;
      font-weight: 800;
    }

    .ergo-grid {
      display: grid;
      grid-template-columns: 170px 1fr;
      gap: 9px;
      margin-bottom: 7px;
    }

    .phone-frame {
      width: 170px;
      height: 226px;
      border: 3.5px solid #0F172A;
      border-radius: 24px;
      background: #FFFFFF;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .zone-stretch {
      height: 25%;
      background: #FEF2F2;
      border-bottom: 1.5px dashed #DC2626;
      padding: 3px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .zone-reach {
      height: 35%;
      background: #FFFBEB;
      border-bottom: 1.5px dashed #EAB308;
      padding: 3px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .zone-natural {
      height: 40%;
      background: #ECFDF5;
      padding: 3px 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .p1-radius-strip-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 5px;
      margin-bottom: 5px;
    }

    .p1-pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .culinary-5grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
    }

    .two-col-responsive {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .p4-geometry-grid {
      display: grid;
      grid-template-columns: 1.05fr 1.05fr 0.90fr;
      gap: 7px;
      margin-bottom: 7px;
    }

    .icon-scale-6grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      align-items: end;
      text-align: center;
    }

    .icon-stroke-8grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
      text-align: center;
    }

    .states-5grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
    }

    /* RESPONSIVE MOBILE VIEWPORT SUPPORT (360PX - 840PX SCREEN ONLY) */
    @media screen and (max-width: 840px) {
      .studio-toolbar {
        padding: 10px 12px;
      }
      .interactive-dock {
        max-width: 100%;
        margin: 10px 10px 0 10px;
        grid-template-columns: 1fr;
        padding: 12px;
      }
      .sheet {
        width: calc(100% - 20px);
        max-width: 100%;
        height: auto;
        margin: 12px 10px;
        padding: 14px 12px;
        border-radius: 16px;
        overflow: visible;
      }
      .running-header,
      .running-footer,
      .sec-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      .sec-sub {
        text-align: left;
      }
      .hero-kpi-grid,
      .bento-6tile-grid,
      .arch-3cols,
      .font-pair-grid,
      .do-dont-grid,
      .radius-gallery,
      .ui-specimen-grid,
      .ergo-grid,
      .p1-pillars-grid,
      .two-col-responsive,
      .p4-geometry-grid {
        grid-template-columns: 1fr !important;
      }
      .swatch-grid,
      .logo-4grid,
      .p1-radius-strip-grid,
      .culinary-5grid,
      .icon-scale-6grid,
      .states-5grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .icon-stroke-8grid {
        grid-template-columns: repeat(4, 1fr) !important;
      }
      .type-row {
        grid-template-columns: 1fr;
        gap: 3px;
      }
      .phone-frame {
        width: 100%;
        max-width: 240px;
        margin: 0 auto;
      }
      .spec-table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
      }
      .tag-outline,
      .tag-pill,
      .running-meta {
        white-space: normal;
      }
      .panel-label {
        flex-wrap: wrap;
      }
      .arch-60,
      .arch-30 {
        padding: 0 6px;
        font-size: 6.8pt;
      }
      .arch-60 .mono,
      .arch-30 .mono {
        display: none;
      }
    }
  </style>
</head>
<body>

  <!-- INTERACTIVE STUDIO TOOLBAR (HIDDEN IN PDF PRINT) -->
  <nav class="studio-toolbar">
    <div class="toolbar-brand">
      <span class="running-dot"></span>
      <span>MEALWISE // BẢNG CẢM HỨNG &amp; NGÔN NGỮ THIẾT KẾ v4.0</span>
    </div>
    <div class="toolbar-nav">
      <a href="#page-1" class="toolbar-link">01. Cảm Hứng &amp; 60-30-10</a>
      <a href="#page-2" class="toolbar-link">02. Bảng Màu</a>
      <a href="#page-3" class="toolbar-link">03. Kiểu Chữ &amp; Font</a>
      <a href="#page-4" class="toolbar-link">04. Bo Góc &amp; Lưới</a>
      <a href="#page-5" class="toolbar-link">05. Biểu Tượng &amp; Logo</a>
      <a href="#page-6" class="toolbar-link">06. Thành Phần &amp; Ngón Cái</a>
    </div>
    <div class="toolbar-actions">
      <button class="btn-studio" onclick="window.print()">🖨️ Xuất / In PDF Chuẩn A4</button>
      <a href="http://localhost:5173/" target="_blank" class="btn-studio" style="background:#10B981; color:#052E16;">🚀 Mở Ứng Dụng</a>
    </div>
  </nav>

  <!-- INTERACTIVE CORNER RADIUS & TOKEN INSPECTOR (SCREEN ONLY) -->
  <section class="interactive-dock">
    <div>
      <div style="font-size:7.5pt; font-weight:800; color:#60A5FA; text-transform:uppercase; letter-spacing:0.06em;">
        Trình Thử Nghiệm Tương Tác Trực Tiếp • Chạm Vào Bất Kỳ Ô Màu Hoặc Cấp Chữ Để Sao Chép Mã
      </div>
      <div style="font-size:11pt; font-weight:900; color:#FFFFFF; margin-top:2px;">
        Kiểm Tra Độ Bo Góc Đồng Tâm: <span id="live-radius-label" style="color:#EAB308;">20px • rounded-[20px]</span>
      </div>
      <div class="radius-btn-group">
        <button class="radius-chip" data-radius="8" onclick="setPreviewRadius(8, 'rounded-lg', 'Thẻ con / Huy hiệu nhỏ')">8px • Vi Mức</button>
        <button class="radius-chip" data-radius="12" onclick="setPreviewRadius(12, 'rounded-xl', 'Ô nhập liệu / Nút phụ')">12px • Cơ Bản</button>
        <button class="radius-chip" data-radius="16" onclick="setPreviewRadius(16, 'rounded-2xl', 'Thẻ nguyên liệu / Tủ lạnh')">16px • Tiêu Chuẩn</button>
        <button class="radius-chip active" data-radius="20" onclick="setPreviewRadius(20, 'rounded-[20px]', 'Thẻ món ăn / Thanh điều hướng')">20px • Thẻ Lớn</button>
        <button class="radius-chip" data-radius="24" onclick="setPreviewRadius(24, 'rounded-3xl', 'Khung trượt đáy / Hộp thoại')">24px • Khung Trượt</button>
        <button class="radius-chip" data-radius="9999" onclick="setPreviewRadius(9999, 'rounded-full', 'Viên thuốc gia vị / Bộ lọc')">9999px • Viên Thuốc</button>
      </div>
    </div>
    <div id="live-radius-outer" style="background:#1A202C; border:2px solid #3B82F6; border-radius:20px; padding:8px; transition:all 0.2s ease;">
      <div id="live-radius-inner" style="background:#12161F; border:1px dashed #10B981; border-radius:12px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; transition:all 0.2s ease;">
        <div>
          <div id="live-radius-role" style="font-size:7.5pt; font-weight:800; color:#34D399;">Thẻ món ăn / Thanh điều hướng</div>
          <div id="live-radius-formula" class="mono" style="color:#CBD5E1; font-size:7pt; margin-top:2px;">R_ngoài: 20px | Đệm: 8px → R_trong: 12px</div>
        </div>
        <span style="background:#1D4ED8; color:#FFF; font-weight:900; font-size:7pt; padding:4px 9px; border-radius:8px; white-space:nowrap;">Chuẩn Đồng Tâm</span>
      </div>
    </div>
  </section>

  <div id="copy-toast" class="copy-toast">✓ Đã sao chép mã token!</div>

  <!-- ===================================================================== -->
  <!-- PAGE 1: COVER & 6-TILE VISUAL MOOD BOARD BENTO                        -->
  <!-- ===================================================================== -->
  <section id="page-1" class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // BẢNG CẢM HỨNG THỊ GIÁC &amp; ĐẶC TẢ NGÔN NGỮ THIẾT KẾ</span>
        </div>
        <div class="running-meta">MÃ TÀI LIỆU: MW-DL-4.0 • DI ĐỘNG ANDROID &amp; iOS</div>
      </header>

      <!-- HERO COVER -->
      <div class="hero-cover">
        <div class="hero-top-row">
          <span class="tag-pill">KIẾN TRÚC PHẲNG LÌ 60-30-10</span>
          <span class="tag-outline">CẢM HỨNG BẢNG MÀU GUNDAM EXIA REPAIR III • MÃ GN-001REIII</span>
        </div>
        <h1 class="hero-title">Bảng Thiết Kế Cảm Hứng &amp; <span>Ngôn Ngữ Thiết Kế MealWise</span></h1>
        <p class="hero-subtitle">
          Chuẩn hóa toàn diện hệ thống bảng màu công nghiệp phẳng lì, phân cấp kiểu chữ tiếng Việt, thang độ bo góc đồng tâm, hệ thống biểu tượng đa kích thước và công thái học ngón cái cho ứng dụng quản lý mâm cơm gia đình Việt.
        </p>
        <div class="hero-kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Tỷ Lệ Thị Giác</div>
            <div class="kpi-val" style="color:#60A5FA;">60 - 30 - 10 Phẳng</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Độ Tương Phản Chữ</div>
            <div class="kpi-val" style="color:#34D399;">Chuẩn AAA 16.1:1</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Thang Bo Góc Chuẩn</div>
            <div class="kpi-val" style="color:#FBBF24;">8px → 24px &amp; Viên Thuốc</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Vùng Chạm &amp; Ngôn Ngữ</div>
            <div class="kpi-val" style="color:#F8FAFC;">≥ 44px • 100% Thuần Việt</div>
          </div>
        </div>
      </div>

      <!-- SECTION 1: TRUE 6-TILE BENTO MOOD BOARD -->
      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">01</span> <span>Bảng Cảm Hứng Thị Giác Tổ Hợp 6 Ô Bento &amp; Chiết Xuất Sắc Độ</span></div>
        <div class="sec-sub">Giao thoa giữa văn hóa mâm cơm gia đình Việt, cấu trúc Bento hiện đại &amp; bảng màu kỹ thuật</div>
      </div>

      <div class="bento-6tile-grid">
        <!-- TILE 01: PURE FOOD PHOTOGRAPHY -->
        <div class="bento-tile">
          <div>
            <div class="tile-badge-row">
              <span class="tile-idx">Ô 01 • NHIẾP ẢNH</span>
              <span class="mono" style="color:#059669; font-size:6pt;">100% MÓN ĂN</span>
            </div>
            <div class="mood-img-card">
              ${gourmetDataUri ? `<img src="${gourmetDataUri}" alt="Mâm cơm gia đình Việt" />` : ''}
              <div class="mood-img-tag">Mâm Cơm Gia Đình • Không Mặt Người</div>
            </div>
          </div>
          <div style="font-size:6.6pt; color:#475569; line-height:1.3;">
            <strong style="color:#0F172A;">Thuần Khiết Ẩm Thực:</strong> Chỉ dùng ảnh món ăn, nguyên liệu tươi ngon; tuyệt đối không dùng ảnh có khuôn mặt người.
          </div>
        </div>

        <!-- TILE 02: 60% FLAT MATTE SURFACES -->
        <div class="bento-tile">
          <div>
            <div class="tile-badge-row">
              <span class="tile-idx">Ô 02 • BỀ MẶT 60%</span>
              <span class="mono" style="color:#1D4ED8; font-size:6pt;">SÁNG &amp; TỐI</span>
            </div>
            <div class="ref-pair-grid">
              <div class="mood-img-card" style="margin-bottom:0;">
                ${bentoLightUri ? `<img src="${bentoLightUri}" alt="Giao diện nền sáng" />` : ''}
                <div class="mood-img-tag">#F8FAFC Sáng</div>
              </div>
              <div class="mood-img-card" style="margin-bottom:0;">
                ${bentoDarkUri ? `<img src="${bentoDarkUri}" alt="Giao diện nền tối" />` : ''}
                <div class="mood-img-tag">#12161F Tối</div>
              </div>
            </div>
          </div>
          <div style="font-size:6.6pt; color:#475569; line-height:1.3; margin-top:5px;">
            <strong style="color:#0F172A;">Không Ánh Kim Loại:</strong> Nền phẳng lì chống chói dưới đèn bếp ban ngày và dịu mắt ban đêm.
          </div>
        </div>

        <!-- TILE 03: BRAND IDENTITY & BENTO GRID REFS -->
        <div class="bento-tile-dark">
          <div>
            <div class="tile-badge-row">
              <span class="tile-idx-dark">Ô 03 • CẤU TRÚC BENTO</span>
              <span class="mono" style="color:#EAB308; font-size:6pt;">THAM CHIẾU 01–02</span>
            </div>
            <div class="ref-pair-grid">
              <div class="ref-card">
                ${ref01Uri ? `<img src="${ref01Uri}" alt="Cấu trúc Moodboard" />` : ''}
                <div class="ref-caption">01. Hệ Thống Nhận Diện</div>
              </div>
              <div class="ref-card">
                ${ref03Uri ? `<img src="${ref03Uri}" alt="Lưới Bento thương hiệu" />` : ''}
                <div class="ref-caption">02. Lưới Bento Phân Cấp</div>
              </div>
            </div>
          </div>
          <div style="font-size:6.6pt; color:#CBD5E1; line-height:1.3;">
            <strong style="color:#FFFFFF;">Trật Tự Mô-đun:</strong> Phân chia thẻ thực đơn, tủ lạnh và giỏ đi chợ theo lưới Bento rõ ràng.
          </div>
        </div>

        <!-- TILE 04: SQUIRCLE ICON & VIETNAMESE CULINARY MOTIFS -->
        <div class="bento-tile-dark">
          <div>
            <div class="tile-badge-row">
              <span class="tile-idx-dark">Ô 04 • BIỂU TƯỢNG VIỆT</span>
              <span class="mono" style="color:#34D399; font-size:6pt;">THAM CHIẾU 03–04</span>
            </div>
            <div class="ref-pair-grid">
              <div class="ref-card">
                ${ref02Uri ? `<img src="${ref02Uri}" alt="Xu hướng biểu tượng ẩm thực" />` : ''}
                <div class="ref-caption">03. Đường Cong Squircle</div>
              </div>
              <div class="ref-card">
                ${ref04Uri ? `<img src="${ref04Uri}" alt="Họa tiết ẩm thực Việt" />` : ''}
                <div class="ref-caption">04. Bát Cơm &amp; Đôi Đũa</div>
              </div>
            </div>
          </div>
          <div style="font-size:6.6pt; color:#CBD5E1; line-height:1.3;">
            <strong style="color:#FFFFFF;">Bản Sắc Dân Tộc:</strong> Cách điệu hình học mâm cơm đoàn viên, đôi đũa vàng, mầm xanh và nồi đất.
          </div>
        </div>

        <!-- TILE 05: EXIA REPAIR III COLOR EXTRACTION -->
        <div class="bento-tile-dark">
          <div>
            <div class="tile-badge-row">
              <span class="tile-idx-dark">Ô 05 • MÀU KỸ THUẬT</span>
              <span class="mono" style="color:#60A5FA; font-size:6pt;">GN-001REIII</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4.5px; margin-bottom:5px;">
              <div style="background:#1A202C; border:1px solid #2D3748; border-radius:8px; padding:4.5px 6px; display:flex; align-items:center; gap:5px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#1D4ED8; flex-shrink:0;"></span>
                <div style="font-size:6.3pt;"><strong style="color:#FFF;">#1D4ED8</strong><br/><span style="color:#94A3B8;">Cobalt 30%</span></div>
              </div>
              <div style="background:#1A202C; border:1px solid #2D3748; border-radius:8px; padding:4.5px 6px; display:flex; align-items:center; gap:5px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#10B981; flex-shrink:0;"></span>
                <div style="font-size:6.3pt;"><strong style="color:#FFF;">#10B981</strong><br/><span style="color:#94A3B8;">Ngọc Bảo 10%</span></div>
              </div>
              <div style="background:#1A202C; border:1px solid #2D3748; border-radius:8px; padding:4.5px 6px; display:flex; align-items:center; gap:5px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#EAB308; flex-shrink:0;"></span>
                <div style="font-size:6.3pt;"><strong style="color:#FFF;">#EAB308</strong><br/><span style="color:#94A3B8;">Hổ Phách 10%</span></div>
              </div>
              <div style="background:#1A202C; border:1px solid #2D3748; border-radius:8px; padding:4.5px 6px; display:flex; align-items:center; gap:5px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#DC2626; flex-shrink:0;"></span>
                <div style="font-size:6.3pt;"><strong style="color:#FFF;">#DC2626</strong><br/><span style="color:#94A3B8;">Đỏ Monza 10%</span></div>
              </div>
            </div>
          </div>
          <div style="font-size:6.6pt; color:#CBD5E1; line-height:1.3;">
            <strong style="color:#FFFFFF;">Tương Phản Tuyệt Đối:</strong> Phân tách rõ nút bấm chính, tín hiệu rau tươi, bếp nhà và cảnh báo.
          </div>
        </div>

        <!-- TILE 06: 6-TIER CORNER ROUNDING & CONCENTRIC SQUIRCLE SYSTEM -->
        <div class="bento-tile">
          <div>
            <div class="tile-badge-row">
              <span class="tile-idx">Ô 06 • BO GÓC ĐỒNG TÂM</span>
              <span class="mono" style="color:#1D4ED8; font-size:6pt;">8PX → 9999PX</span>
            </div>
            <div style="height:96px; background:#0F172A; border:1px solid #CBD5E1; border-radius:10px; padding:4px 6px; margin-bottom:5px; display:flex; align-items:center;">
              <svg width="100%" height="86" viewBox="0 0 208 86" style="display:block;">
                <!-- Left: Concentric Corner Anatomy (True R_ngoài = 20px, R_trong = 12px, Đệm = 8px) -->
                <rect x="2" y="3" width="90" height="80" rx="20" fill="#1E293B" stroke="#3B82F6" stroke-width="2"/>
                <rect x="10" y="11" width="74" height="64" rx="12" fill="#090C12" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3 2"/>
                <circle cx="22" cy="23" r="20" fill="rgba(239,68,68,0.10)" stroke="#EF4444" stroke-width="1.2" stroke-dasharray="2.5 1.8"/>
                <circle cx="22" cy="23" r="12" fill="none" stroke="#FBBF24" stroke-width="1.1" stroke-dasharray="2 1.5"/>
                <circle cx="22" cy="23" r="2" fill="#FBBF24"/>
                <line x1="22" y1="23" x2="8" y2="9" stroke="#EF4444" stroke-width="1.3"/>
                <text x="47" y="48" text-anchor="middle" fill="#F8FAFC" font-family="JetBrains Mono, monospace" font-size="7.2" font-weight="800">R_ngoài 20px</text>
                <text x="47" y="59" text-anchor="middle" fill="#34D399" font-family="JetBrains Mono, monospace" font-size="6.8" font-weight="700">R_trong 12px</text>
                <text x="47" y="70" text-anchor="middle" fill="#FBBF24" font-family="JetBrains Mono, monospace" font-size="6.4" font-weight="700">Đệm = 8px</text>
                <!-- Right: 6 Corner Rounding Tier Chips (Single-line crisp SVG badges) -->
                <rect x="98" y="3" width="52" height="23" rx="4" fill="#1E293B" stroke="#60A5FA" stroke-width="1.2"/>
                <text x="124" y="17" text-anchor="middle" fill="#93C5FD" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800">R = 8px</text>
                <rect x="154" y="3" width="52" height="23" rx="6" fill="#1E293B" stroke="#60A5FA" stroke-width="1.2"/>
                <text x="180" y="17" text-anchor="middle" fill="#93C5FD" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800">R = 12px</text>
                <rect x="98" y="31" width="52" height="23" rx="8" fill="#1E293B" stroke="#60A5FA" stroke-width="1.2"/>
                <text x="124" y="45" text-anchor="middle" fill="#93C5FD" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800">R = 16px</text>
                <rect x="154" y="31" width="52" height="23" rx="10" fill="#1D4ED8" stroke="#93C5FD" stroke-width="1.4"/>
                <text x="180" y="45" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800">R = 20px</text>
                <rect x="98" y="59" width="52" height="23" rx="11.5" fill="#1E293B" stroke="#34D399" stroke-width="1.2"/>
                <text x="124" y="73" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800">R = 24px</text>
                <rect x="154" y="59" width="52" height="23" rx="11.5" fill="#10B981" stroke="#A7F3D0" stroke-width="1.2"/>
                <text x="180" y="73" text-anchor="middle" fill="#052E16" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800">9999px</text>
              </svg>
            </div>
          </div>
          <div style="font-size:6.6pt; color:#475569; line-height:1.3;">
            <strong style="color:#0F172A;">Bo Góc Đồng Tâm 6 Cấp:</strong> Mọi thẻ món, nút bấm và viên thuốc tuân thủ <code>R_ngoài = R_trong + Đệm</code>.
          </div>
        </div>
      </div>

      <!-- 60-30-10 PROPORTION BAR -->
      <div class="arch-bar-wrap" style="margin-bottom:7px; padding:7.5px 10px;">
        <div class="panel-label" style="margin-bottom:2px;">
          <span>TỶ LỆ PHÂN BỔ THỊ GIÁC 60 - 30 - 10 TRÊN MÀN HÌNH ĐIỆN THOẠI</span>
          <span class="mono" style="color:#0F172A;">60% NỀN PHẲNG • 30% THƯƠNG HIỆU • 10% NGỮ NGHĨA</span>
        </div>
        <div class="arch-bar" style="height:26px; margin:4px 0;">
          <div class="arch-60">
            <span>60% BỀ MẶT NỀN CHỦ ĐẠO</span>
            <span class="mono">#F8FAFC • #FFFFFF • #12161F</span>
          </div>
          <div class="arch-30">
            <span>30% XANH COBALT</span>
            <span class="mono">#1D4ED8</span>
          </div>
          <div class="arch-10" title="10% Điểm nhấn ngữ nghĩa">
            <div></div><div></div><div></div>
          </div>
        </div>
        <div class="arch-3cols" style="margin-top:4px;">
          <div class="arch-col" style="padding:4px 7px;">
            <strong style="color:#0F172A;">60% Không Gian Thở Phẳng Lì</strong><br/>
            <span style="color:#475569;">Giảm mỏi mắt khi đọc công thức nấu ăn dài và kiểm tra danh sách đi chợ dưới ánh đèn siêu thị.</span>
          </div>
          <div class="arch-col" style="padding:4px 7px;">
            <strong style="color:#1D4ED8;">30% Định Hướng Hành Động Chính</strong><br/>
            <span style="color:#475569;">Dẫn dắt ngón cái tới các nút xác nhận chính, mục đang mở và nút Tủ Lạnh trung tâm.</span>
          </div>
          <div class="arch-col" style="padding:4px 7px;">
            <strong style="color:#B45309;">10% Tín Hiệu Ngữ Nghĩa Tức Thời</strong><br/>
            <span style="color:#475569;">Phân biệt độ tươi nguyên liệu #10B981, Món Bếp Nhà #EAB308 và thu âm/hết hạn #DC2626.</span>
          </div>
        </div>
      </div>

      <!-- PAGE 1 CORNER ROUNDING SPECIMEN STRIP & 3 EMOTIONAL PILLARS -->
      <div class="panel" style="padding:7px 10px;">
        <div class="panel-label" style="margin-bottom:4px;">
          <span>THANG ĐỘ BO GÓC ĐỒNG TÂM 6 CẤP &amp; 3 TRỤ CỘT CẢM XÚC BẾP NHÀ</span>
          <span class="mono" style="color:#1D4ED8;">R_NGOÀI = R_TRONG + ĐỆM • 100% THUẦN VIỆT</span>
        </div>
        <div class="p1-radius-strip-grid">
          <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:8px; padding:4px 5px; display:flex; align-items:center; gap:5px;">
            <svg width="26" height="26" viewBox="0 0 32 32" style="flex-shrink:0;">
              <path d="M29 4 L9 4 A5 5 0 0 0 4 9 L4 29" fill="none" stroke="#1D4ED8" stroke-width="2.4" stroke-linecap="round"/>
              <circle cx="9" cy="9" r="5" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="2 1.5"/>
              <circle cx="9" cy="9" r="1.4" fill="#DC2626"/>
            </svg>
            <div>
              <div class="mono" style="font-size:6.5pt; color:#0F172A;">R = 8px</div>
              <div style="font-size:5.7pt; color:#64748B;">rounded-lg</div>
            </div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:12px; padding:4px 5px; display:flex; align-items:center; gap:5px;">
            <svg width="26" height="26" viewBox="0 0 32 32" style="flex-shrink:0;">
              <path d="M29 4 L11 4 A7 7 0 0 0 4 11 L4 29" fill="none" stroke="#1D4ED8" stroke-width="2.4" stroke-linecap="round"/>
              <circle cx="11" cy="11" r="7" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="2 1.5"/>
              <circle cx="11" cy="11" r="1.4" fill="#DC2626"/>
            </svg>
            <div>
              <div class="mono" style="font-size:6.5pt; color:#0F172A;">R = 12px</div>
              <div style="font-size:5.7pt; color:#64748B;">rounded-xl</div>
            </div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:16px; padding:4px 5px; display:flex; align-items:center; gap:5px;">
            <svg width="26" height="26" viewBox="0 0 32 32" style="flex-shrink:0;">
              <path d="M29 4 L13 4 A9 9 0 0 0 4 13 L4 29" fill="none" stroke="#1D4ED8" stroke-width="2.4" stroke-linecap="round"/>
              <circle cx="13" cy="13" r="9" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="2 1.5"/>
              <circle cx="13" cy="13" r="1.4" fill="#DC2626"/>
            </svg>
            <div>
              <div class="mono" style="font-size:6.5pt; color:#0F172A;">R = 16px</div>
              <div style="font-size:5.7pt; color:#64748B;">rounded-2xl</div>
            </div>
          </div>
          <div style="background:#EFF6FF; border:1.5px solid #1D4ED8; border-radius:20px; padding:4px 5px; display:flex; align-items:center; gap:5px;">
            <svg width="26" height="26" viewBox="0 0 32 32" style="flex-shrink:0;">
              <path d="M29 4 L15 4 A11 11 0 0 0 4 15 L4 29" fill="none" stroke="#1D4ED8" stroke-width="2.4" stroke-linecap="round"/>
              <circle cx="15" cy="15" r="11" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="2 1.5"/>
              <circle cx="15" cy="15" r="1.4" fill="#DC2626"/>
            </svg>
            <div>
              <div class="mono" style="font-size:6.5pt; color:#1D4ED8;">R = 20px</div>
              <div style="font-size:5.7pt; color:#1E40AF;">Thẻ món chính</div>
            </div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:24px; padding:4px 5px; display:flex; align-items:center; gap:5px;">
            <svg width="26" height="26" viewBox="0 0 32 32" style="flex-shrink:0;">
              <path d="M29 4 L17 4 A13 13 0 0 0 4 17 L4 29" fill="none" stroke="#1D4ED8" stroke-width="2.4" stroke-linecap="round"/>
              <circle cx="17" cy="17" r="13" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="2 1.5"/>
              <circle cx="17" cy="17" r="1.4" fill="#DC2626"/>
            </svg>
            <div>
              <div class="mono" style="font-size:6.5pt; color:#0F172A;">R = 24px</div>
              <div style="font-size:5.7pt; color:#64748B;">rounded-3xl</div>
            </div>
          </div>
          <div style="background:#ECFDF5; border:1px solid #6EE7B7; border-radius:9999px; padding:4px 7px; display:flex; align-items:center; gap:5px;">
            <svg width="26" height="26" viewBox="0 0 32 32" style="flex-shrink:0;">
              <rect x="3" y="7" width="26" height="18" rx="9" fill="none" stroke="#059669" stroke-width="2.2"/>
              <circle cx="12" cy="16" r="9" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="2 1.5"/>
              <circle cx="12" cy="16" r="1.4" fill="#DC2626"/>
            </svg>
            <div>
              <div class="mono" style="font-size:6.5pt; color:#065F46;">9999px</div>
              <div style="font-size:5.7pt; color:#047857;">Viên thuốc</div>
            </div>
          </div>
        </div>
        <div class="p1-pillars-grid">
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:7px; padding:3px 7px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:6.3pt; font-weight:800; color:#1D4ED8;">Sáng Rõ Nhà Bếp</span>
            <span class="mono" style="font-size:5.8pt; color:#475569;">Chữ đậm không cắt dấu</span>
          </div>
          <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:7px; padding:3px 7px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:6.3pt; font-weight:800; color:#047857;">Tươi Ngon Hữu Cơ</span>
            <span class="mono" style="font-size:5.8pt; color:#475569;">3 ngăn nhiệt độ tủ lạnh</span>
          </div>
          <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:7px; padding:3px 7px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:6.3pt; font-weight:800; color:#B45309;">Ấm Áp Gia Truyền</span>
            <span class="mono" style="font-size:5.8pt; color:#475569;">Lưu giọng nói của Mẹ</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="running-footer">
      <span>Hệ Thống Thiết Kế MealWise • Bảng Cảm Hứng Thị Giác 6 Ô Bento &amp; Kiến Trúc 60-30-10</span>
      <span class="page-num">TRANG 01 / 06</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 2: COMPLETE COLOR PALETTE & CULINARY TOKENS                      -->
  <!-- ===================================================================== -->
  <section id="page-2" class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // HỆ THỐNG BẢNG MÀU TOÀN DIỆN &amp; ĐỘ TƯƠNG PHẢN</span>
        </div>
        <div class="running-meta">PHẦN 02 • CHUẨN HÓA MÀU PHẲNG LÌ &amp; SẮC ĐỘ ẨM THỰC</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">02</span> <span>10 Mã Màu Nền Tảng 60-30-10 &amp; 5 Sắc Độ Ẩm Thực Truyền Thống</span></div>
        <div class="sec-sub">Kiểm định độ tương phản đạt chuẩn quốc tế WCAG 2.1 AA / AAA</div>
      </div>

      <!-- 10 CORE PANTONE SWATCH CARDS -->
      <div class="swatch-grid">
        <div class="pantone-card" onclick="copyToken('#F8FAFC — bg-[#F8FAFC]')">
          <div class="pantone-color" style="background:#F8FAFC; color:#0F172A;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#E2E8F0; color:#0F172A;">NỀN SÁNG</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Trắng Mát Nền</div>
            <div class="pantone-hex">#F8FAFC</div>
            <div class="pantone-role">RGB 248, 250, 252<br/>Khung nền sáng tổng thể</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#FFFFFF — bg-white')">
          <div class="pantone-color" style="background:#FFFFFF; color:#0F172A;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#F1F5F9; color:#0F172A;">THẺ NỔI</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Trắng Tinh Khiết</div>
            <div class="pantone-hex">#FFFFFF</div>
            <div class="pantone-role">RGB 255, 255, 255<br/>Bề mặt thẻ món ăn sáng</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#12161F — dark:bg-[#12161F]')">
          <div class="pantone-color" style="background:#12161F; color:#F8FAFC;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#1E293B; color:#38BDF8;">16.1:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Xám Buồng Lái</div>
            <div class="pantone-hex">#12161F</div>
            <div class="pantone-role">RGB 18, 22, 31<br/>Khung nền chế độ tối</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#1A202C — dark:bg-[#1A202C]')">
          <div class="pantone-color" style="background:#1A202C; color:#F8FAFC;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#2D3748; color:#F8FAFC;">13.9:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Xám Đá Thẻ Tối</div>
            <div class="pantone-hex">#1A202C</div>
            <div class="pantone-role">RGB 26, 32, 44<br/>Thẻ nổi trong chế độ tối</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#0F172A — text-slate-900')">
          <div class="pantone-color" style="background:#0F172A; color:#FFFFFF;">
            <span class="mono">MỰC</span>
            <span class="wcag-pill" style="background:#334155; color:#FFFFFF;">15.8:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Mực Đen Than</div>
            <div class="pantone-hex">#0F172A</div>
            <div class="pantone-role">RGB 15, 23, 42<br/>Chữ tiêu đề &amp; giá tiền</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#1D4ED8 — bg-[#1D4ED8]')">
          <div class="pantone-color" style="background:#1D4ED8; color:#FFFFFF;">
            <span class="mono">30%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.2); color:#FFFFFF;">8.6:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Xanh Cobalt Chính</div>
            <div class="pantone-hex">#1D4ED8</div>
            <div class="pantone-role">RGB 29, 78, 216<br/>Nút hành động &amp; Mục chọn</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#2563EB — bg-[#2563EB]')">
          <div class="pantone-color" style="background:#2563EB; color:#FFFFFF;">
            <span class="mono">30%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.2); color:#FFFFFF;">5.9:1 AA+</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Xanh Tương Tác</div>
            <div class="pantone-hex">#2563EB</div>
            <div class="pantone-role">RGB 37, 99, 235<br/>Nút Tủ Lạnh trung tâm</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#10B981 — bg-emerald-500')">
          <div class="pantone-color" style="background:#10B981; color:#052E16;">
            <span class="mono">10%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.55); color:#052E16;">TƯƠI MỚI</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Xanh Ngọc Bảo</div>
            <div class="pantone-hex">#10B981</div>
            <div class="pantone-role">RGB 16, 185, 129<br/>Rau tươi &amp; Hoàn thành</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#EAB308 — bg-amber-500')">
          <div class="pantone-color" style="background:#EAB308; color:#0F172A;">
            <span class="mono">10%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.55); color:#0F172A;">BẾP NHÀ</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Vàng Hổ Phách</div>
            <div class="pantone-hex">#EAB308</div>
            <div class="pantone-role">RGB 234, 179, 8<br/>Món Bếp Nhà &amp; Lời dặn</div>
          </div>
        </div>

        <div class="pantone-card" onclick="copyToken('#DC2626 — bg-red-600')">
          <div class="pantone-color" style="background:#DC2626; color:#FFFFFF;">
            <span class="mono">10%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.2); color:#FFFFFF;">CẢNH BÁO</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Đỏ Nhiệt Lượng</div>
            <div class="pantone-hex">#DC2626</div>
            <div class="pantone-role">RGB 220, 38, 38<br/>Thu âm, Calo &amp; Hết hạn</div>
          </div>
        </div>
      </div>

      <!-- 5 VIETNAMESE CULINARY ACCENT SWATCHES -->
      <div class="panel" style="margin-bottom:8px; padding:8px 10px;">
        <div class="panel-label" style="margin-bottom:4px;">
          <span>DẢI SẮC ĐỘ ẨM THỰC TRUYỀN THỐNG VIỆT NAM CHO NHÃN VÙNG MIỀN, ĐỘ CAY &amp; DINH DƯỠNG</span>
          <span class="mono" style="color:#B45309;">5 MÀU BỔ TRỢ VĂN HÓA</span>
        </div>
        <div class="culinary-5grid">
          <div onclick="copyToken('#E11D48')" style="cursor:pointer; background:#FFF1F2; border:1px solid #FECDD3; border-radius:10px; padding:5px 7px; display:flex; align-items:center; gap:6px;">
            <span style="width:18px; height:18px; border-radius:6px; background:#E11D48; flex-shrink:0;"></span>
            <div><div style="font-size:7pt; font-weight:900; color:#881337;">Đỏ Ớt Hiểm</div><div class="mono" style="font-size:6.2pt; color:#E11D48;">#E11D48 • Vị cay</div></div>
          </div>
          <div onclick="copyToken('#D97706')" style="cursor:pointer; background:#FFFBEB; border:1px solid #FDE68A; border-radius:10px; padding:5px 7px; display:flex; align-items:center; gap:6px;">
            <span style="width:18px; height:18px; border-radius:6px; background:#D97706; flex-shrink:0;"></span>
            <div><div style="font-size:7pt; font-weight:900; color:#78350F;">Vàng Nghệ Kho</div><div class="mono" style="font-size:6.2pt; color:#D97706;">#D97706 • Nước mắm</div></div>
          </div>
          <div onclick="copyToken('#059669')" style="cursor:pointer; background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:5px 7px; display:flex; align-items:center; gap:6px;">
            <span style="width:18px; height:18px; border-radius:6px; background:#059669; flex-shrink:0;"></span>
            <div><div style="font-size:7pt; font-weight:900; color:#064E3B;">Xanh Hành Lá</div><div class="mono" style="font-size:6.2pt; color:#059669;">#059669 • Rau thơm</div></div>
          </div>
          <div onclick="copyToken('#78350F')" style="cursor:pointer; background:#FEF3C7; border:1px solid #FCD34D; border-radius:10px; padding:5px 7px; display:flex; align-items:center; gap:6px;">
            <span style="width:18px; height:18px; border-radius:6px; background:#78350F; flex-shrink:0;"></span>
            <div><div style="font-size:7pt; font-weight:900; color:#451A03;">Nâu Đất Nung</div><div class="mono" style="font-size:6.2pt; color:#78350F;">#78350F • Nồi kho tộ</div></div>
          </div>
          <div onclick="copyToken('#EFF6FF')" style="cursor:pointer; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:5px 7px; display:flex; align-items:center; gap:6px;">
            <span style="width:18px; height:18px; border-radius:6px; background:#3B82F6; flex-shrink:0;"></span>
            <div><div style="font-size:7pt; font-weight:900; color:#1E3A8A;">Xanh Đá Lạnh</div><div class="mono" style="font-size:6.2pt; color:#1D4ED8;">#EFF6FF • Ngăn đông</div></div>
          </div>
        </div>
      </div>

      <!-- COMPLETE TOKEN MATRIX TABLE -->
      <table class="spec-table" style="margin-bottom:8px;">
        <thead>
          <tr>
            <th>Mã Token Hệ Thống</th>
            <th>Tỷ Lệ</th>
            <th>Mã Hex</th>
            <th>Hệ Màu HSL</th>
            <th>Lớp Tailwind Chuẩn</th>
            <th>Ứng Dụng Thực Tế Trong Giao Diện MealWise</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono">surface-canvas-light</td>
            <td>60%</td>
            <td class="mono">#F8FAFC</td>
            <td class="mono">hsl(210, 40%, 98%)</td>
            <td class="mono">bg-[#F8FAFC]</td>
            <td>Khung nền tổng thể chế độ sáng, sạch sẽ và thoáng đãng</td>
          </tr>
          <tr>
            <td class="mono">surface-canvas-dark</td>
            <td>60%</td>
            <td class="mono">#12161F</td>
            <td class="mono">hsl(222, 27%, 10%)</td>
            <td class="mono">dark:bg-[#12161F]</td>
            <td>Khung nền tối bảo vệ mắt khi lên thực đơn ban đêm</td>
          </tr>
          <tr>
            <td class="mono">border-subtle</td>
            <td>60%</td>
            <td class="mono">#E2E8F0</td>
            <td class="mono">hsl(214, 32%, 91%)</td>
            <td class="mono">border-slate-200 dark:border-[#2D3748]</td>
            <td>Viền mảnh 1px phân tách thẻ phẳng không cần bóng đổ dày</td>
          </tr>
          <tr>
            <td class="mono">ink-primary</td>
            <td>60%</td>
            <td class="mono">#0F172A</td>
            <td class="mono">hsl(222, 47%, 11%)</td>
            <td class="mono">text-slate-900 dark:text-[#F8FAFC]</td>
            <td>Tên món ăn, giá tiền, tiêu đề bước nấu đạt tương phản AAA 15.8:1</td>
          </tr>
          <tr>
            <td class="mono">brand-cobalt-primary</td>
            <td>30%</td>
            <td class="mono">#1D4ED8</td>
            <td class="mono">hsl(224, 76%, 48%)</td>
            <td class="mono">bg-[#1D4ED8] text-white</td>
            <td>Nút xác nhận chính, bước đang mở, viên thuốc lọc danh mục</td>
          </tr>
          <tr>
            <td class="mono">brand-sky-tint</td>
            <td>30%</td>
            <td class="mono">#EFF6FF</td>
            <td class="mono">hsl(214, 100%, 97%)</td>
            <td class="mono">bg-blue-50 text-[#1D4ED8]</td>
            <td>Nền đệm cho khung gợi ý thông minh và chip nguyên liệu phổ biến</td>
          </tr>
          <tr>
            <td class="mono">semantic-emerald</td>
            <td>10%</td>
            <td class="mono">#10B981</td>
            <td class="mono">hsl(160, 84%, 39%)</td>
            <td class="mono">bg-emerald-600 text-white</td>
            <td>Huy hiệu nguyên liệu tươi trong tủ lạnh, bước nấu đã hoàn tất</td>
          </tr>
          <tr>
            <td class="mono">semantic-amber</td>
            <td>10%</td>
            <td class="mono">#EAB308</td>
            <td class="mono">hsl(48, 96%, 47%)</td>
            <td class="mono">bg-amber-500 text-slate-950</td>
            <td>Huy hiệu ★ Món Bếp Nhà, nút phát lời dặn giọng nói của Mẹ</td>
          </tr>
          <tr>
            <td class="mono">semantic-monza-red</td>
            <td>10%</td>
            <td class="mono">#DC2626</td>
            <td class="mono">hsl(0, 72%, 51%)</td>
            <td class="mono">bg-red-600 text-white</td>
            <td>Trạng thái đang thu âm giọng nói, cảnh báo thực phẩm hết hạn hôm nay</td>
          </tr>
        </tbody>
      </table>

      <!-- LIGHT VS DARK COCKPIT COMPARISON -->
      <div class="two-col-responsive">
        <div class="panel" style="background:#F8FAFC; padding:8px 10px;">
          <div class="panel-label" style="margin-bottom:4px;">
            <span>CHẾ ĐỘ BAN NGÀY TRONG BẾP SÁNG</span>
            <span class="mono" style="color:#1D4ED8;">#F8FAFC + #FFFFFF</span>
          </div>
          <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:8px 10px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:6.8pt; font-weight:800; color:#1D4ED8; text-transform:uppercase;">Món Mặn • Miền Bắc</div>
              <div style="font-size:9.5pt; font-weight:900; color:#0F172A;">Thịt Ba Chỉ Rang Cháy Cạnh</div>
              <div class="mono" style="font-size:7pt; color:#64748B;">55.000 đ • 20 phút • 480 kcal</div>
            </div>
            <div style="background:#1D4ED8; color:#FFF; font-weight:800; font-size:7.2pt; padding:6px 11px; border-radius:10px; white-space:nowrap;">+ Chọn Món</div>
          </div>
        </div>

        <div class="panel-dark" style="padding:8px 10px;">
          <div class="panel-label" style="color:#94A3B8; margin-bottom:4px;">
            <span>CHẾ ĐỘ BAN ĐÊM DỊU MẮT</span>
            <span class="mono" style="color:#60A5FA;">#12161F + #1A202C</span>
          </div>
          <div style="background:#1A202C; border:1px solid #2D3748; border-radius:14px; padding:8px 10px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:6.8pt; font-weight:800; color:#60A5FA; text-transform:uppercase;">Món Mặn • Miền Bắc</div>
              <div style="font-size:9.5pt; font-weight:900; color:#F8FAFC;">Thịt Ba Chỉ Rang Cháy Cạnh</div>
              <div class="mono" style="font-size:7pt; color:#94A3B8;">55.000 đ • 20 phút • 480 kcal</div>
            </div>
            <div style="background:#2563EB; color:#FFF; font-weight:800; font-size:7.2pt; padding:6px 11px; border-radius:10px; white-space:nowrap;">+ Chọn Món</div>
          </div>
        </div>
      </div>
    </div>

    <footer class="running-footer">
      <span>Hệ Thống Thiết Kế MealWise • Bảng Màu Phẳng Lì 60-30-10 &amp; Sắc Độ Ẩm Thực</span>
      <span class="page-num">TRANG 02 / 06</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 3: TEXT HIERARCHY, FONT USES & BILINGUAL CLEANLINESS             -->
  <!-- ===================================================================== -->
  <section id="page-3" class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // PHÂN CẤP KIỂU CHỮ, QUY TẮC DÙNG FONT &amp; NGÔN NGỮ THUẦN VIỆT</span>
        </div>
        <div class="running-meta">PHẦN 03 • BE VIETNAM PRO &amp; JETBRAINS MONO</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">03</span> <span>Kiến Trúc Bộ Đôi Font Chữ &amp; Ma Trận Phân Cấp Chữ 7 Cấp</span></div>
        <div class="sec-sub">Hiển thị sắc nét các dấu thanh chồng tầng tiếng Việt và cố định độ rộng con số</div>
      </div>

      <!-- DUAL FONT ARCHITECTURE -->
      <div class="font-pair-grid">
        <div class="panel">
          <div class="panel-label">
            <span>FONT GIAO DIỆN CHÍNH: BE VIETNAM PRO</span>
            <span class="mono" style="color:#1D4ED8;">HỖ TRỢ DẤU KÉP TIẾNG VIỆT</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="font-size:21pt; font-weight:900; color:#0F172A; line-height:1.1; letter-spacing:-0.02em; white-space:nowrap;">
              Ắ Ẵ Ể Ợ Ữ
            </div>
            <div style="font-size:6.8pt; color:#475569; flex:1;">
              Thiết kế khoảng sáng trên và dưới rộng rãi giúp các chữ cái mang 2 dấu như <strong>Mắm Nhỉ, Ngũ Quả, Bữa Xế, Sữa Chua</strong> không bao giờ bị cắt mất dấu ở độ đậm 800–900.
            </div>
          </div>
          <div class="weight-strip">
            <div class="weight-chip"><div style="font-weight:400; font-size:8.5pt;">Aa</div><div class="mono" style="font-size:5.6pt; color:#64748B;">400 Thường</div></div>
            <div class="weight-chip"><div style="font-weight:500; font-size:8.5pt;">Aa</div><div class="mono" style="font-size:5.6pt; color:#64748B;">500 Vừa</div></div>
            <div class="weight-chip"><div style="font-weight:600; font-size:8.5pt;">Aa</div><div class="mono" style="font-size:5.6pt; color:#64748B;">600 Bán Đậm</div></div>
            <div class="weight-chip"><div style="font-weight:700; font-size:8.5pt;">Aa</div><div class="mono" style="font-size:5.6pt; color:#1D4ED8;">700 Đậm</div></div>
            <div class="weight-chip"><div style="font-weight:800; font-size:8.5pt;">Aa</div><div class="mono" style="font-size:5.6pt; color:#1D4ED8;">800 Rất Đậm</div></div>
            <div class="weight-chip"><div style="font-weight:900; font-size:8.5pt;">Aa</div><div class="mono" style="font-size:5.6pt; color:#0F172A;">900 Đậm Đặc</div></div>
          </div>
        </div>

        <div class="panel-dark">
          <div class="panel-label" style="color:#94A3B8;">
            <span>FONT SỐ LIỆU: JETBRAINS MONO</span>
            <span class="mono" style="color:#34D399;">TABULAR-NUMS</span>
          </div>
          <div class="mono" style="font-size:13.5pt; font-weight:800; color:#34D399; background:#1A202C; border:1px solid #2D3748; border-radius:10px; padding:5px 10px; text-align:center; margin-bottom:4px;">
            00:14:59 • 125.000đ
          </div>
          <p style="font-size:6.7pt; color:#CBD5E1; line-height:1.35;">
            <strong>Ứng dụng chuyên biệt:</strong> Dùng cho đồng hồ đếm ngược khi nấu ăn, đơn giá đi chợ VNĐ, định lượng nguyên liệu <code>350g</code> và năng lượng <code>450 kcal</code>. Chống nhảy khung tuyệt đối khi số đếm thay đổi.
          </p>
        </div>
      </div>

      <!-- 7-LEVEL LIVE TYPOGRAPHY SPECIMEN -->
      <div class="type-specimen-box">
        <div class="type-row" onclick="copyToken('text-2xl font-black tracking-tight')">
          <div>
            <div class="mono" style="color:#1D4ED8;">01. Tiêu Đề Lớn</div>
            <div style="font-size:6.1pt; color:#64748B;">24px / 1.50rem • Đậm 900</div>
          </div>
          <div style="font-size:14.2pt; font-weight:900; color:#0F172A; letter-spacing:-0.025em;">
            Mâm Cơm Gia Đình Việt Nam Ấm Cúng
          </div>
        </div>

        <div class="type-row" onclick="copyToken('text-lg sm:text-xl font-black tracking-tight')">
          <div>
            <div class="mono" style="color:#1D4ED8;">02. Đầu Màn Hình</div>
            <div style="font-size:6.1pt; color:#64748B;">20px / 1.25rem • Đậm 900</div>
          </div>
          <div style="font-size:12.2pt; font-weight:900; color:#0F172A; letter-spacing:-0.02em;">
            Khám Phá Công Thức &amp; Quản Lý Tủ Lạnh Thông Minh
          </div>
        </div>

        <div class="type-row" onclick="copyToken('text-base sm:text-lg font-extrabold truncate')">
          <div>
            <div class="mono" style="color:#1D4ED8;">03. Tên Món Ăn</div>
            <div style="font-size:6.1pt; color:#64748B;">17px / 1.06rem • Đậm 800</div>
          </div>
          <div style="font-size:10.6pt; font-weight:800; color:#0F172A; letter-spacing:-0.015em;">
            Cá Bống Kho Tiêu Tộ Đất &amp; Canh Chua Cá Lóc Miền Tây
          </div>
        </div>

        <div class="type-row" onclick="copyToken('text-sm font-extrabold')">
          <div>
            <div class="mono" style="color:#1D4ED8;">04. Tiêu Đề Khối</div>
            <div style="font-size:6.1pt; color:#64748B;">14px / 0.875rem • Đậm 800</div>
          </div>
          <div style="font-size:9.3pt; font-weight:800; color:#1E293B; letter-spacing:-0.01em;">
            Danh Sách Nguyên Liệu Cần Mua Cho Bữa Tối Gia Đình 4 Người
          </div>
        </div>

        <div class="type-row" onclick="copyToken('text-xs sm:text-sm font-medium leading-relaxed')">
          <div>
            <div class="mono" style="color:#1D4ED8;">05. Nội Dung Bước</div>
            <div style="font-size:6.1pt; color:#64748B;">13.5px / 0.84rem • Vừa 500</div>
          </div>
          <div style="font-size:8.2pt; font-weight:500; color:#334155;">
            Ướp cá với nước mắm nhỉ, đường thốt nốt, hành tím băm và tiêu sọ đập dập trong 15 phút. Kho hai lửa liu riu đến khi nước kho sánh kẹo lại.
          </div>
        </div>

        <div class="type-row" onclick="copyToken('text-xs font-bold whitespace-nowrap shrink-0')">
          <div>
            <div class="mono" style="color:#1D4ED8;">06. Nhãn Viên Thuốc</div>
            <div style="font-size:6.1pt; color:#64748B;">12px / 0.75rem • Đậm 700</div>
          </div>
          <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
            <span style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; padding:2px 8px; border-radius:999px; font-size:7.4pt; font-weight:700;">Nước mắm Phú Quốc +</span>
            <span style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; padding:2px 8px; border-radius:999px; font-size:7.4pt; font-weight:700;">Hành tím Lý Sơn ✓</span>
            <span style="background:#FFFBEB; color:#B45309; border:1px solid #FDE68A; padding:2px 8px; border-radius:999px; font-size:7.4pt; font-weight:700;">▶ Nghe lời dặn Mẹ</span>
          </div>
        </div>

        <div class="type-row" onclick="copyToken('text-[10px] sm:text-[11px] font-black uppercase')">
          <div>
            <div class="mono" style="color:#1D4ED8;">07. Huy Hiệu Nhỏ</div>
            <div style="font-size:6.1pt; color:#64748B;">10.5px / 0.65rem • Đậm 800</div>
          </div>
          <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
            <span style="background:#EAB308; color:#0F172A; padding:2px 7px; border-radius:6px; font-size:6.6pt; font-weight:900; text-transform:uppercase; letter-spacing:0.04em;">★ MÓN BẾP NHÀ</span>
            <span style="background:#10B981; color:#052E16; padding:2px 7px; border-radius:6px; font-size:6.6pt; font-weight:900; text-transform:uppercase; letter-spacing:0.04em;">TƯƠI MỚI • CÒN 5 NGÀY</span>
            <span class="mono" style="background:#0F172A; color:#F8FAFC; padding:2px 7px; border-radius:6px; font-size:6.6pt; letter-spacing:0.04em;">450 KCAL • ĐẠM 32G</span>
          </div>
        </div>
      </div>

      <!-- COMPLETE 7-LEVEL MOBILE VIEWPORT TYPE SCALE MATRIX -->
      <table class="spec-table" style="margin-bottom:7px;">
        <thead>
          <tr>
            <th>Cấp Bậc Phân Cấp</th>
            <th>Cỡ Chữ</th>
            <th>Độ Đậm</th>
            <th>Giãn Dòng</th>
            <th>Giãn Chữ</th>
            <th>Lớp Tailwind Chuẩn</th>
            <th>Quy Tắc Chống Tràn Trên Màn Hình 360px</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>01. Tiêu Đề Lớn</strong></td>
            <td class="mono">24px / 1.50rem</td>
            <td>900 Đậm Đặc</td>
            <td class="mono">1.20</td>
            <td class="mono">-0.025em</td>
            <td class="mono">text-2xl font-black tracking-tight</td>
            <td>Dùng cho màn hình chào mừng &amp; tổng kết tuần</td>
          </tr>
          <tr>
            <td><strong>02. Đầu Màn Hình</strong></td>
            <td class="mono">20px / 1.25rem</td>
            <td>900 Đậm Đặc</td>
            <td class="mono">1.25</td>
            <td class="mono">-0.020em</td>
            <td class="mono">text-lg sm:text-xl font-black</td>
            <td>Luôn đặt trong khối co giãn <code>min-w-0 flex-1</code></td>
          </tr>
          <tr>
            <td><strong>03. Tên Món Ăn</strong></td>
            <td class="mono">17px / 1.06rem</td>
            <td>800 Rất Đậm</td>
            <td class="mono">1.30</td>
            <td class="mono">-0.015em</td>
            <td class="mono">text-base sm:text-lg font-extrabold</td>
            <td>Bắt buộc kèm <code>truncate</code> chống đẩy chiều cao thẻ</td>
          </tr>
          <tr>
            <td><strong>04. Tiêu Đề Khối</strong></td>
            <td class="mono">14px / 0.875rem</td>
            <td>800 Rất Đậm</td>
            <td class="mono">1.35</td>
            <td class="mono">-0.010em</td>
            <td class="mono">text-sm font-extrabold</td>
            <td>Phân nhóm danh mục tủ lạnh &amp; quầy siêu thị</td>
          </tr>
          <tr>
            <td><strong>05. Nội Dung Bước</strong></td>
            <td class="mono">13.5px / 0.84rem</td>
            <td>500 Vừa</td>
            <td class="mono">1.50</td>
            <td class="mono">0.000em</td>
            <td class="mono">text-xs sm:text-sm leading-relaxed</td>
            <td>Tối đa 65 ký tự/dòng giúp đọc lướt nhanh khi nấu</td>
          </tr>
          <tr>
            <td><strong>06. Nhãn Viên Thuốc</strong></td>
            <td class="mono">12px / 0.75rem</td>
            <td>700 Đậm</td>
            <td class="mono">1.20</td>
            <td class="mono">+0.010em</td>
            <td class="mono">text-xs font-bold whitespace-nowrap</td>
            <td>Không ngắt dòng giữa chừng kèm <code>shrink-0</code></td>
          </tr>
          <tr>
            <td><strong>07. Huy Hiệu Nhỏ</strong></td>
            <td class="mono">10.5px / 0.65rem</td>
            <td>800 Rất Đậm</td>
            <td class="mono">1.10</td>
            <td class="mono">+0.040em</td>
            <td class="mono">text-[10px] font-black uppercase</td>
            <td>In hoa toàn bộ, dùng cho nhãn vùng miền &amp; hạn dùng</td>
          </tr>
        </tbody>
      </table>

      <!-- VIETNAMESE LINGUISTIC PURITY MATRIX -->
      <div class="do-dont-grid">
        <div class="do-card">
          <div style="font-weight:900; font-size:7.6pt; color:#065F46; margin-bottom:4px;">
            ✓ CHUẨN MỰC MEALWISE: 100% THUẦN VIỆT TỰ NHIÊN
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:6.6pt; padding:2px 6px; border-radius:6px;">Sảnh Đi Chợ Chung</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:6.6pt; padding:2px 6px; border-radius:6px;">Phòng Mua Chung</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:6.6pt; padding:2px 6px; border-radius:6px;">Mở Hòm Bữa Cơm</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:6.6pt; padding:2px 6px; border-radius:6px;">Vòng Quay Bàn Nhậu</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:6.6pt; padding:2px 6px; border-radius:6px;">Xem Lại Hướng Dẫn</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:6.6pt; padding:2px 6px; border-radius:6px;">Tập Gym / Giàu Đạm</span>
          </div>
        </div>

        <div class="dont-card">
          <div style="font-weight:900; font-size:7.6pt; color:#991B1B; margin-bottom:4px;">
            ✕ NGHIÊM CẤM: CHÊM TIẾNG ANH GIẢI THÍCH TRONG NGOẶC
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:6.5pt; padding:2px 6px; border-radius:6px; text-decoration:line-through;">Sảnh Đi Chợ Chung (Lobby)</span>
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:6.5pt; padding:2px 6px; border-radius:6px; text-decoration:line-through;">Phòng Mua Chung (Live Sync)</span>
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:6.5pt; padding:2px 6px; border-radius:6px; text-decoration:line-through;">Mở Hòm Bữa Cơm (Apex Pack)</span>
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:6.5pt; padding:2px 6px; border-radius:6px; text-decoration:line-through;">Salad Xà Lách / Canh Súp</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="running-footer">
      <span>Hệ Thống Thiết Kế MealWise • Phân Cấp Kiểu Chữ 7 Cấp, Bộ Đôi Font &amp; Chuẩn Mực Thuần Việt</span>
      <span class="page-num">TRANG 03 / 06</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 4: BORDER RADIUS (ROUND), CONCENTRIC GEOMETRY, SPACING & SHADOWS -->
  <!-- ===================================================================== -->
  <section id="page-4" class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // HỆ THỐNG BO GÓC ĐỒNG TÂM, KHOẢNG CÁCH &amp; ĐỘ NỔI PHẲNG LÌ</span>
        </div>
        <div class="running-meta">PHẦN 04 • THANG BO GÓC 6 CẤP &amp; CÔNG THỨC ĐỒNG TÂM</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">04</span> <span>Thang Độ Bo Góc 6 Cấp &amp; Hình Học Bo Góc Đồng Tâm</span></div>
        <div class="sec-sub">Định hình cảm giác chạm thân thiện, hiện đại và đồng nhất từ huy hiệu nhỏ đến khung trượt đáy</div>
      </div>

      <!-- 6-TIER CORNER RADIUS ANATOMICAL BLUEPRINT GALLERY -->
      <div class="radius-gallery" style="gap:7px; margin-bottom:7px;">
        <!-- TIER 01: 8PX -->
        <div class="radius-card" style="padding:7px 9px;" onclick="copyToken('rounded-lg /* 8px */')">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
              <div style="min-width:0;">
                <div style="font-weight:900; font-size:7.6pt; color:#0F172A;">Cấp 01: Bo Góc Vi Mức</div>
                <div class="mono" style="color:#1D4ED8; font-size:6.1pt;">rounded-lg • 0.50rem</div>
              </div>
              <span class="mono" style="background:#EFF6FF; color:#1D4ED8; padding:2px 6px; border-radius:5px; border:1px solid #BFDBFE; font-size:6.5pt; white-space:nowrap; flex-shrink:0;">R = 8px</span>
            </div>
            <svg width="100%" height="58" viewBox="0 0 216 58" style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:8px; display:block; margin-bottom:4px;">
              <line x1="0" y1="20" x2="104" y2="20" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="0" y1="40" x2="104" y2="40" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="25" y1="0" x2="25" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="50" y1="0" x2="50" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="104" y1="0" x2="104" y2="58" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2"/>
              <path d="M98 6 L16 6 A8 8 0 0 0 8 14 L8 53" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="16" cy="14" r="8" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="2.5 1.8"/>
              <circle cx="16" cy="14" r="1.8" fill="#DC2626"/>
              <line x1="16" y1="14" x2="16" y2="6" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="16" y1="14" x2="8" y2="14" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="16" y1="14" x2="10.3" y2="8.3" stroke="#DC2626" stroke-width="1.4"/>
              <text x="29" y="21" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="7.4" font-weight="800">R = 8px</text>
              <text x="29" y="33" fill="#475569" font-family="JetBrains Mono, monospace" font-size="6.1" font-weight="700">Góc gọn sắc</text>
              <!-- Right: True-Scale UI Specimen (rx="8") -->
              <rect x="112" y="6" width="28" height="28" rx="8" fill="#0F172A"/>
              <text x="126" y="23" text-anchor="middle" fill="#FFFFFF" font-size="9" font-weight="800">✎</text>
              <rect x="144" y="6" width="28" height="28" rx="8" fill="#1D4ED8"/>
              <text x="158" y="23" text-anchor="middle" fill="#FFFFFF" font-size="10" font-weight="900">＋</text>
              <rect x="176" y="6" width="34" height="28" rx="8" fill="#FEF2F2" stroke="#FECACA" stroke-width="1"/>
              <text x="193" y="19" text-anchor="middle" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="800">450</text>
              <text x="193" y="28" text-anchor="middle" fill="#991B1B" font-size="5.5" font-weight="700">kcal</text>
              <rect x="112" y="39" width="98" height="13" rx="4" fill="#10B981"/>
              <text x="161" y="48" text-anchor="middle" fill="#052E16" font-size="6.2" font-weight="900">TƯƠI MỚI • 5 NGÀY</text>
            </svg>
          </div>
          <p style="font-size:6.4pt; color:#475569; line-height:1.28;">
            Nút vuông <code>28×28px</code> Sửa/Xóa trên thẻ món, ô dinh dưỡng và huy hiệu nhỏ.
          </p>
        </div>

        <!-- TIER 02: 12PX -->
        <div class="radius-card" style="padding:7px 9px;" onclick="copyToken('rounded-xl /* 12px */')">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
              <div style="min-width:0;">
                <div style="font-weight:900; font-size:7.6pt; color:#0F172A;">Cấp 02: Bo Góc Cơ Bản</div>
                <div class="mono" style="color:#1D4ED8; font-size:6.1pt;">rounded-xl • 0.75rem</div>
              </div>
              <span class="mono" style="background:#EFF6FF; color:#1D4ED8; padding:2px 6px; border-radius:6px; border:1px solid #BFDBFE; font-size:6.5pt; white-space:nowrap; flex-shrink:0;">R = 12px</span>
            </div>
            <svg width="100%" height="58" viewBox="0 0 216 58" style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; display:block; margin-bottom:4px;">
              <line x1="0" y1="20" x2="104" y2="20" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="0" y1="40" x2="104" y2="40" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="25" y1="0" x2="25" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="50" y1="0" x2="50" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="104" y1="0" x2="104" y2="58" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2"/>
              <path d="M98 6 L20 6 A12 12 0 0 0 8 18 L8 53" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="20" cy="18" r="12" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="2.5 1.8"/>
              <circle cx="20" cy="18" r="1.8" fill="#DC2626"/>
              <line x1="20" y1="18" x2="20" y2="6" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="20" y1="18" x2="8" y2="18" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="20" y1="18" x2="11.5" y2="9.5" stroke="#DC2626" stroke-width="1.4"/>
              <text x="36" y="22" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="7.4" font-weight="800">R = 12px</text>
              <text x="36" y="34" fill="#047857" font-family="JetBrains Mono, monospace" font-size="6.1" font-weight="700">R_trong chuẩn</text>
              <!-- Right: Search Input & Inner Card Specimen (rx="12") -->
              <rect x="112" y="6" width="98" height="22" rx="12" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.2"/>
              <text x="122" y="19.5" fill="#64748B" font-size="6.5" font-weight="700">🔍 Tìm món canh...</text>
              <rect x="112" y="31" width="98" height="21" rx="12" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="1.2" stroke-dasharray="2.5 1.5"/>
              <text x="161" y="44" text-anchor="middle" fill="#1D4ED8" font-family="JetBrains Mono, monospace" font-size="6.3" font-weight="800">Thẻ con 20 - 8 = 12px</text>
            </svg>
          </div>
          <p style="font-size:6.4pt; color:#475569; line-height:1.28;">
            Ô tìm kiếm, nút bấm thứ cấp, thẻ bước nấu và thẻ con lồng trong thẻ <code>20px</code>.
          </p>
        </div>

        <!-- TIER 03: 16PX -->
        <div class="radius-card" style="padding:7px 9px;" onclick="copyToken('rounded-2xl /* 16px */')">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
              <div style="min-width:0;">
                <div style="font-weight:900; font-size:7.6pt; color:#0F172A;">Cấp 03: Bo Góc Tiêu Chuẩn</div>
                <div class="mono" style="color:#1D4ED8; font-size:6.1pt;">rounded-2xl • 1.00rem</div>
              </div>
              <span class="mono" style="background:#EFF6FF; color:#1D4ED8; padding:2px 6px; border-radius:7px; border:1px solid #BFDBFE; font-size:6.5pt; white-space:nowrap; flex-shrink:0;">R = 16px</span>
            </div>
            <svg width="100%" height="58" viewBox="0 0 216 58" style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:12px; display:block; margin-bottom:4px;">
              <line x1="0" y1="20" x2="104" y2="20" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="0" y1="40" x2="104" y2="40" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="25" y1="0" x2="25" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="50" y1="0" x2="50" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="104" y1="0" x2="104" y2="58" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2"/>
              <path d="M98 5 L24 5 A16 16 0 0 0 8 21 L8 53" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="24" cy="21" r="16" fill="rgba(220,38,38,0.10)" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="2.5 1.8"/>
              <circle cx="24" cy="21" r="1.8" fill="#DC2626"/>
              <line x1="24" y1="21" x2="24" y2="5" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="24" y1="21" x2="8" y2="21" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="24" y1="21" x2="12.7" y2="9.7" stroke="#DC2626" stroke-width="1.4"/>
              <text x="43" y="23" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="7.4" font-weight="800">R = 16px</text>
              <text x="43" y="35" fill="#475569" font-family="JetBrains Mono, monospace" font-size="6.1" font-weight="700">Chạm êm tay</text>
              <!-- Right: Fridge Tile (rx="16") & Inner 8px Badge -->
              <rect x="112" y="5" width="98" height="32" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
              <rect x="118" y="10" width="86" height="22" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="0.9" stroke-dasharray="2 1.5"/>
              <text x="123" y="23.5" fill="#0F172A" font-size="6.4" font-weight="800">🧊 Ngăn Mát</text>
              <text x="200" y="23.5" text-anchor="end" fill="#059669" font-family="JetBrains Mono, monospace" font-size="6.1" font-weight="800">4°C•12</text>
              <rect x="112" y="40" width="98" height="13" rx="6.5" fill="#1D4ED8"/>
              <text x="161" y="49" text-anchor="middle" fill="#FFFFFF" font-size="6.3" font-weight="800">+ Xác Nhận Thực Đơn</text>
            </svg>
          </div>
          <p style="font-size:6.4pt; color:#475569; line-height:1.28;">
            Thẻ nguyên liệu tủ lạnh, 3 ô ngăn nhiệt độ, nút xác nhận chính toàn chiều ngang.
          </p>
        </div>

        <!-- TIER 04: 20PX -->
        <div class="radius-card" style="padding:7px 9px; border:1.5px solid #1D4ED8; background:#F8FAFC;" onclick="copyToken('rounded-[20px] /* 20px */')">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
              <div style="min-width:0;">
                <div style="font-weight:900; font-size:7.6pt; color:#1D4ED8;">Cấp 04: Thẻ Món Chủ Lực</div>
                <div class="mono" style="color:#1D4ED8; font-size:6.1pt;">rounded-[20px] • 1.25rem</div>
              </div>
              <span class="mono" style="background:#1D4ED8; color:#FFFFFF; padding:2px 6px; border-radius:8px; font-size:6.5pt; white-space:nowrap; flex-shrink:0;">R = 20px</span>
            </div>
            <svg width="100%" height="58" viewBox="0 0 216 58" style="background:#FFFFFF; border:1px solid #BFDBFE; border-radius:14px; display:block; margin-bottom:4px;">
              <line x1="0" y1="20" x2="104" y2="20" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="0" y1="40" x2="104" y2="40" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="25" y1="0" x2="25" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="50" y1="0" x2="50" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="104" y1="0" x2="104" y2="58" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2"/>
              <path d="M98 5 L28 5 A20 20 0 0 0 8 25 L8 54" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M98 13 L28 13 A12 12 0 0 0 16 25 L16 54" fill="none" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3 2"/>
              <circle cx="28" cy="25" r="20" fill="rgba(220,38,38,0.09)" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="2.5 1.8"/>
              <circle cx="28" cy="25" r="1.8" fill="#DC2626"/>
              <line x1="28" y1="25" x2="28" y2="5" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="28" y1="25" x2="8" y2="25" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="28" y1="25" x2="13.9" y2="10.9" stroke="#DC2626" stroke-width="1.4"/>
              <text x="51" y="25" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="7.4" font-weight="800">R = 20px</text>
              <text x="51" y="37" fill="#059669" font-family="JetBrains Mono, monospace" font-size="6.1" font-weight="700">Lồng 12px</text>
              <!-- Right: Recipe Card (rx="20") + Nested 12px Inner Frame (rx="12") -->
              <rect x="112" y="5" width="98" height="48" rx="20" fill="#0F172A" stroke="#1D4ED8" stroke-width="1.5"/>
              <rect x="120" y="13" width="82" height="32" rx="12" fill="#1E293B" stroke="#10B981" stroke-width="1.2" stroke-dasharray="2.5 1.5"/>
              <text x="161" y="27" text-anchor="middle" fill="#F8FAFC" font-size="6.5" font-weight="900">Thẻ Món Ăn 20px</text>
              <text x="161" y="38" text-anchor="middle" fill="#34D399" font-family="JetBrains Mono, monospace" font-size="6" font-weight="700">Khung trong 12px</text>
            </svg>
          </div>
          <p style="font-size:6.4pt; color:#1E293B; line-height:1.28;">
            Thẻ ảnh món ăn lớn, thanh điều hướng đáy nổi 5 nút và khối tiêu đề trang chủ.
          </p>
        </div>

        <!-- TIER 05: 24PX -->
        <div class="radius-card" style="padding:7px 9px;" onclick="copyToken('rounded-3xl /* 24px */')">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
              <div style="min-width:0;">
                <div style="font-weight:900; font-size:7.6pt; color:#0F172A;">Cấp 05: Khung Trượt Đáy</div>
                <div class="mono" style="color:#1D4ED8; font-size:6.1pt;">rounded-3xl • 1.50rem</div>
              </div>
              <span class="mono" style="background:#EFF6FF; color:#1D4ED8; padding:2px 6px; border-radius:9px; border:1px solid #BFDBFE; font-size:6.5pt; white-space:nowrap; flex-shrink:0;">R = 24px</span>
            </div>
            <svg width="100%" height="58" viewBox="0 0 216 58" style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:14px; display:block; margin-bottom:4px;">
              <line x1="0" y1="20" x2="104" y2="20" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="0" y1="40" x2="104" y2="40" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="25" y1="0" x2="25" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="50" y1="0" x2="50" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="104" y1="0" x2="104" y2="58" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2"/>
              <path d="M98 4 L32 4 A24 24 0 0 0 8 28 L8 54" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="32" cy="28" r="24" fill="rgba(220,38,38,0.09)" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="2.5 1.8"/>
              <circle cx="32" cy="28" r="1.8" fill="#DC2626"/>
              <line x1="32" y1="28" x2="32" y2="4" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="32" y1="28" x2="8" y2="28" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="32" y1="28" x2="15" y2="11" stroke="#DC2626" stroke-width="1.4"/>
              <text x="58" y="25" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="7.2" font-weight="800">R = 24px</text>
              <text x="58" y="37" fill="#475569" font-family="JetBrains Mono, monospace" font-size="6.0" font-weight="700">Bo hộp thoại</text>
              <!-- Right: Bottom Sheet Drawer Specimen (rx="24" outer, rx="16" inner) -->
              <rect x="112" y="5" width="98" height="48" rx="24" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
              <rect x="148" y="10" width="26" height="3" rx="1.5" fill="#CBD5E1"/>
              <rect x="120" y="17" width="82" height="28" rx="16" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.1"/>
              <text x="161" y="29" text-anchor="middle" fill="#0F172A" font-size="6.4" font-weight="900">Khung Trượt 24px</text>
              <text x="161" y="39" text-anchor="middle" fill="#1D4ED8" font-family="JetBrains Mono, monospace" font-size="5.9" font-weight="800">R_trong = 16px</text>
            </svg>
          </div>
          <p style="font-size:6.4pt; color:#475569; line-height:1.28;">
            Khung trượt từ đáy màn hình, hộp thoại xác nhận và bảng khảo sát khẩu vị.
          </p>
        </div>

        <!-- TIER 06: 9999PX PILL -->
        <div class="radius-card" style="padding:7px 9px;" onclick="copyToken('rounded-full /* 9999px */')">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
              <div style="min-width:0;">
                <div style="font-weight:900; font-size:7.6pt; color:#0F172A;">Cấp 06: Viên Thuốc Tròn</div>
                <div class="mono" style="color:#059669; font-size:6.1pt;">rounded-full • Tròn Đầy</div>
              </div>
              <span class="mono" style="background:#10B981; color:#FFFFFF; padding:2px 7px; border-radius:9999px; font-size:6.5pt; white-space:nowrap; flex-shrink:0;">9999px</span>
            </div>
            <svg width="100%" height="58" viewBox="0 0 216 58" style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:14px; display:block; margin-bottom:4px;">
              <line x1="0" y1="29" x2="104" y2="29" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="28" y1="0" x2="28" y2="58" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="104" y1="0" x2="104" y2="58" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2"/>
              <path d="M98 11 L28 11 A18 18 0 0 0 28 47 L98 47" fill="#ECFDF5" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="28" cy="29" r="18" fill="rgba(220,38,38,0.09)" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="2.5 1.8"/>
              <circle cx="28" cy="29" r="1.8" fill="#DC2626"/>
              <line x1="28" y1="11" x2="28" y2="47" stroke="#DC2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
              <line x1="28" y1="29" x2="10" y2="29" stroke="#DC2626" stroke-width="1.4"/>
              <text x="50" y="26" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="7.2" font-weight="800">9999px</text>
              <text x="50" y="37" fill="#047857" font-family="JetBrains Mono, monospace" font-size="6.1" font-weight="700">Cung tròn 180°</text>
              <!-- Right: True-Scale Capsule Pills -->
              <rect x="112" y="9" width="98" height="18" rx="9" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="1.2"/>
              <text x="161" y="20.5" text-anchor="middle" fill="#1D4ED8" font-size="6.6" font-weight="800">Nước mắm Phú Quốc +</text>
              <rect x="112" y="31" width="98" height="18" rx="9" fill="#EAB308"/>
              <text x="161" y="42.5" text-anchor="middle" fill="#0F172A" font-size="6.5" font-weight="900">★ Món Bếp Nhà</text>
            </svg>
          </div>
          <p style="font-size:6.4pt; color:#475569; line-height:1.28;">
            Dải chip gia vị 1 chạm <code>Nước mắm +</code>, bộ lọc vùng miền, huy hiệu <code>★ Món Bếp Nhà</code>.
          </p>
        </div>
      </div>

      <!-- CONCENTRIC RADIUS FORMULA + SQUIRCLE VS CIRCLE ARC + 4PX SPACING SYSTEM -->
      <div class="p4-geometry-grid">
        <!-- 1. Concentric Nesting Formula -->
        <div class="panel-dark" style="padding:7px 9px;">
          <div class="panel-label" style="color:#94A3B8; margin-bottom:4px;">
            <span>BO GÓC ĐỒNG TÂM</span>
            <span class="mono" style="color:#EAB308;">R_NGOÀI = R_TRONG + ĐỆM</span>
          </div>
          <div style="display:grid; grid-template-columns:88px 1fr; gap:7px; align-items:center;">
            <div style="background:#1E293B; border:2px solid #3B82F6; border-radius:20px; padding:8px; position:relative;">
              <div style="background:#0F172A; border:1.5px dashed #10B981; border-radius:12px; height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <span class="mono" style="color:#34D399; font-size:6pt;">R_trong 12px</span>
                <span class="mono" style="color:#94A3B8; font-size:5.4pt;">Đệm = 8px</span>
              </div>
              <div class="mono" style="text-align:center; color:#60A5FA; font-size:5.8pt; margin-top:2px;">R_ngoài 20px</div>
            </div>
            <div style="font-size:6.3pt; color:#CBD5E1; line-height:1.3;">
              <strong style="color:#FFFFFF;">Chống Lệch Tâm Góc Bo:</strong><br/>
              Bán kính thẻ con bằng bán kính ngoài trừ khoảng đệm:<br/>
              <span class="mono" style="color:#FBBF24;">20px - 8px = 12px</span>.<br/>
              <span style="color:#34D399;">✓ Đúng:</span> 2 góc chung tâm, đệm đều <code>8px</code>.<br/>
              <span style="color:#F87171;">✕ Sai:</span> Giữ <code>20px</code> làm góc phình nhọn.
            </div>
          </div>
        </div>

        <!-- 2. Squircle G2 vs. Standard Circle Arc G1 Comparison -->
        <div class="panel" style="padding:7px 9px;">
          <div class="panel-label" style="margin-bottom:4px;">
            <span>SQUIRCLE &amp; CUNG TRÒN</span>
            <span class="mono" style="color:#1D4ED8;">SIÊU ELIP G2 • G1</span>
          </div>
          <div style="display:grid; grid-template-columns:88px 1fr; gap:7px; align-items:center;">
            <svg width="88" height="72" viewBox="0 0 88 72" style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; display:block;">
              <!-- Technical grid -->
              <line x1="0" y1="24" x2="88" y2="24" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="0" y1="48" x2="88" y2="48" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="28" y1="0" x2="28" y2="72" stroke="#E2E8F0" stroke-width="0.8"/>
              <line x1="56" y1="0" x2="56" y2="72" stroke="#E2E8F0" stroke-width="0.8"/>
              <!-- Standard Circle Arc G1 (Dashed Monza Red) -->
              <path d="M82 10 L36 10 A26 26 0 0 0 10 36 L10 66" fill="none" stroke="#DC2626" stroke-width="1.8" stroke-dasharray="3 2"/>
              <circle cx="36" cy="10" r="2.2" fill="#DC2626"/>
              <circle cx="10" cy="36" r="2.2" fill="#DC2626"/>
              <!-- Continuous Squircle G2 Curve (Solid Cobalt) -->
              <path d="M82 10 L46 10 C18 10 10 18 10 46 L10 66" fill="rgba(29,78,216,0.08)" stroke="#1D4ED8" stroke-width="2.6" stroke-linecap="round"/>
              <text x="48" y="34" text-anchor="middle" fill="#1D4ED8" font-family="JetBrains Mono, monospace" font-size="6.6" font-weight="800">Squircle G2</text>
              <text x="48" y="45" text-anchor="middle" fill="#DC2626" font-family="JetBrains Mono, monospace" font-size="6.0" font-weight="700">Cung tròn G1</text>
              <text x="48" y="57" text-anchor="middle" fill="#047857" font-family="JetBrains Mono, monospace" font-size="5.6" font-weight="700">|x/a|⁴+|y/b|⁴=1</text>
            </svg>
            <div style="font-size:6.3pt; color:#475569; line-height:1.3;">
              <strong style="color:#1D4ED8;">• Squircle Liên Tục Bậc G2:</strong> Độ cong tăng dần từ cạnh thẳng vào góc, xóa bỏ điểm gãy tiếp tuyến. Áp dụng cho biểu tượng <code>22.5%</code> &amp; thẻ <code>20px–24px</code>.<br/>
              <strong style="color:#DC2626;">• Cung Tròn Chuẩn Bậc G1:</strong> Chuyển thẳng sang cung tròn tại 2 điểm đỏ; dùng cho nút nhỏ <code>8px</code> &amp; viên thuốc <code>9999px</code>.
            </div>
          </div>
        </div>

        <!-- 3. 4px Spacing System -->
        <div class="panel" style="padding:7px 9px;">
          <div class="panel-label" style="margin-bottom:4px;">
            <span>LƯỚI KHOẢNG CÁCH 4PX</span>
            <span class="mono" style="color:#1D4ED8;">NHỊP ĐIỆU</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:3.5px;">
            <div style="display:flex; align-items:center; gap:5px; font-size:6.3pt;">
              <span class="mono" style="width:28px; color:#1D4ED8;">4px</span>
              <div style="height:6.5px; width:12px; background:#1D4ED8; border-radius:2px; flex-shrink:0;"></div>
              <span style="color:#475569;">Biểu tượng &amp; nhãn <code>gap-1</code></span>
            </div>
            <div style="display:flex; align-items:center; gap:5px; font-size:6.3pt;">
              <span class="mono" style="width:28px; color:#1D4ED8;">8px</span>
              <div style="height:6.5px; width:24px; background:#1D4ED8; border-radius:2px; flex-shrink:0;"></div>
              <span style="color:#475569;">Giữa 2 vùng chạm <code>gap-2</code></span>
            </div>
            <div style="display:flex; align-items:center; gap:5px; font-size:6.3pt;">
              <span class="mono" style="width:28px; color:#1D4ED8;">12px</span>
              <div style="height:6.5px; width:36px; background:#1D4ED8; border-radius:2px; flex-shrink:0;"></div>
              <span style="color:#475569;">Đệm thẻ nguyên liệu <code>p-3</code></span>
            </div>
            <div style="display:flex; align-items:center; gap:5px; font-size:6.3pt;">
              <span class="mono" style="width:28px; color:#1D4ED8;">16px</span>
              <div style="height:6.5px; width:48px; background:#1D4ED8; border-radius:2px; flex-shrink:0;"></div>
              <span style="color:#475569;">Đệm lề màn hình <code>px-4</code></span>
            </div>
            <div style="display:flex; align-items:center; gap:5px; font-size:6.3pt;">
              <span class="mono" style="width:28px; color:#1D4ED8;">24px</span>
              <div style="height:6.5px; width:68px; background:#1D4ED8; border-radius:2px; flex-shrink:0;"></div>
              <span style="color:#475569;">Đệm hộp thoại <code>p-6</code></span>
            </div>
          </div>
        </div>
      </div>

      <!-- DEDICATED 6-TIER CORNER ROUNDING SPECIFICATION TABLE -->
      <table class="spec-table" style="margin-bottom:7px;">
        <thead>
          <tr>
            <th>Mã Token</th>
            <th>Cấp Độ Bo Góc</th>
            <th>Bán Kính (px / rem)</th>
            <th>Lớp Tailwind Chuẩn</th>
            <th>Bán Kính Lồng Trong (R_trong)</th>
            <th>Thành Phần Giao Diện Áp Dụng</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono">radius-xs</td>
            <td><strong>01. Bo Góc Vi Mức</strong></td>
            <td class="mono">8px / 0.50rem</td>
            <td class="mono">rounded-lg</td>
            <td class="mono">R_trong = 4px • Đệm 4px</td>
            <td>Nút vuông 28×28px Sửa/Xóa trên thẻ món, ô dinh dưỡng kcal, huy hiệu nhỏ</td>
          </tr>
          <tr>
            <td class="mono">radius-sm</td>
            <td><strong>02. Bo Góc Cơ Bản</strong></td>
            <td class="mono">12px / 0.75rem</td>
            <td class="mono">rounded-xl</td>
            <td class="mono">R_trong = 4px • Đệm 8px</td>
            <td>Ô nhập liệu tìm kiếm, nút bấm thứ cấp, thẻ bước nấu, thẻ con lồng trong thẻ 20px</td>
          </tr>
          <tr>
            <td class="mono">radius-md</td>
            <td><strong>03. Bo Góc Tiêu Chuẩn</strong></td>
            <td class="mono">16px / 1.00rem</td>
            <td class="mono">rounded-2xl</td>
            <td class="mono">R_trong = 8px • Đệm 8px</td>
            <td>Thẻ nguyên liệu tủ lạnh, 3 ngăn nhiệt độ, nút hành động chính toàn chiều ngang</td>
          </tr>
          <tr>
            <td class="mono">radius-lg</td>
            <td><strong>04. Thẻ Món Chủ Lực</strong></td>
            <td class="mono">20px / 1.25rem</td>
            <td class="mono">rounded-[20px]</td>
            <td class="mono">R_trong = 12px • Đệm 8px</td>
            <td>Thẻ ảnh món ăn lớn, thanh điều hướng đáy nổi 5 nút, khối tiêu đề trang chủ</td>
          </tr>
          <tr>
            <td class="mono">radius-xl</td>
            <td><strong>05. Khung Trượt Đáy</strong></td>
            <td class="mono">24px / 1.50rem</td>
            <td class="mono">rounded-3xl</td>
            <td class="mono">R_trong = 16px • Đệm 8px</td>
            <td>Khung trượt từ đáy màn hình, hộp thoại xác nhận xóa, bảng khảo sát khẩu vị</td>
          </tr>
          <tr>
            <td class="mono">radius-pill</td>
            <td><strong>06. Viên Thuốc Tròn</strong></td>
            <td class="mono">9999px / Tròn Đầy</td>
            <td class="mono">rounded-full</td>
            <td class="mono">R_trong = 9999px • Đồng dạng</td>
            <td>Dải viên thuốc gia vị 1 chạm Nước mắm +, bộ lọc vùng miền, nút phát lời dặn</td>
          </tr>
        </tbody>
      </table>

      <!-- ELEVATION, BORDERS & STROKES TABLE -->
      <table class="spec-table">
        <thead>
          <tr>
            <th>Thành Phần Cấu Trúc</th>
            <th>Thông Số Kỹ Thuật</th>
            <th>Chế Độ Sáng</th>
            <th>Chế Độ Tối</th>
            <th>Nguyên Tắc Áp Dụng Thực Tế</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Viền Thẻ Tiêu Chuẩn</strong></td>
            <td class="mono">1px solid</td>
            <td class="mono">#E2E8F0 • border-slate-200</td>
            <td class="mono">#2D3748 • border-slate-800</td>
            <td>Định hình ranh giới thẻ sắc nét mà không cần bóng đổ đậm</td>
          </tr>
          <tr>
            <td><strong>Viền Đang Chọn / Chạm</strong></td>
            <td class="mono">1.5px – 2px solid</td>
            <td class="mono">#1D4ED8 • Xanh Cobalt</td>
            <td class="mono">#3B82F6 • Xanh Tương Tác</td>
            <td>Phản hồi thị giác tức thì khi chọn bữa ăn hoặc ngăn tủ lạnh</td>
          </tr>
          <tr>
            <td><strong>Độ Nổi Cấp 1 — Thẻ Bài</strong></td>
            <td class="mono">Bóng khuếch tán nhẹ</td>
            <td class="mono">0 4px 14px -2px rgba(15,23,42,0.04)</td>
            <td class="mono">none • Tắt bóng hoàn toàn</td>
            <td>Chế độ tối phân tách tầng bằng độ sáng nền #12161F và #1A202C</td>
          </tr>
          <tr>
            <td><strong>Độ Nổi Cấp 2 — Thanh Đáy</strong></td>
            <td class="mono">Kính mờ + Bóng nổi</td>
            <td class="mono">blur(12px) + rgba(255,255,255,0.96)</td>
            <td class="mono">blur(12px) + rgba(26,32,44,0.94)</td>
            <td>Giữ thanh điều hướng đáy nổi mượt phía trên danh sách cuộn</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="running-footer">
      <span>Hệ Thống Thiết Kế MealWise • Thang Bo Góc Đồng Tâm, Lưới Khoảng Cách 4px &amp; Độ Nổi Phẳng</span>
      <span class="page-num">TRANG 04 / 06</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 5: LOGO & APP ICON SYSTEM, 24x24 GRID & SCALABILITY              -->
  <!-- ===================================================================== -->
  <section id="page-5" class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // HỆ THỐNG BIỂU TƯỢNG ỨNG DỤNG, LOGO &amp; LƯỚI CHUẨN 24×24</span>
        </div>
        <div class="running-meta">PHẦN 05 • ĐƯỜNG CONG SQUIRCLE LIÊN TỤC &amp; ĐA KÍCH THƯỚC</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">05</span> <span>4 Định Hướng Biểu Tượng Thương Hiệu &amp; Bản Vẽ Lưới Chuẩn 24×24</span></div>
        <div class="sec-sub">Đường nét vector sắc nét, nhận diện tức thì từ biểu tượng kho ứng dụng 1024px xuống 16px</div>
      </div>

      <!-- 4 CRISP VECTOR SVG LOGO CONCEPTS -->
      <div class="logo-4grid">
        <!-- Concept 1 -->
        <div class="logo-concept-card" style="border:1.5px solid #1D4ED8; background:#EFF6FF;">
          <div class="squircle-preview">
            <svg width="68" height="68" viewBox="0 0 120 120">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#1D4ED8"/>
              <circle cx="60" cy="60" r="42" fill="none" stroke="#60A5FA" stroke-width="2" stroke-dasharray="4 4"/>
              <path d="M30 62 C32 90, 88 90, 90 62 Z" fill="#FFFFFF"/>
              <ellipse cx="60" cy="62" rx="30" ry="7" fill="#EAB308"/>
              <path d="M60 56 C60 40, 76 34, 78 24 C66 24, 58 34, 60 56 Z" fill="#10B981"/>
              <path d="M60 56 C60 42, 46 36, 44 28 C54 28, 60 38, 60 56 Z" fill="#34D399"/>
              <rect x="48" y="85" width="24" height="5" rx="2.5" fill="#BFDBFE"/>
            </svg>
          </div>
          <div style="font-size:6.3pt; font-weight:900; color:#1D4ED8; text-transform:uppercase;">Định Hướng 01 • Chính Thức</div>
          <div style="font-weight:900; font-size:7.8pt; color:#0F172A; margin:1px 0;">Mâm Cơm &amp; Mầm Xanh</div>
          <p style="font-size:6.3pt; color:#475569;">Bát cơm đầy đặn, mầm lá tươi #10B981 và vành mâm cơm gia đình trên nền Cobalt.</p>
        </div>

        <!-- Concept 2 -->
        <div class="logo-concept-card">
          <div class="squircle-preview">
            <svg width="68" height="68" viewBox="0 0 120 120">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#12161F"/>
              <path d="M28 84 L48 32 L60 58 L72 32 L92 84" fill="none" stroke="#EAB308" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M32 70 C40 94, 80 94, 88 70" fill="none" stroke="#3B82F6" stroke-width="7" stroke-linecap="round"/>
              <circle cx="60" cy="30" r="6" fill="#10B981"/>
            </svg>
          </div>
          <div style="font-size:6.3pt; font-weight:800; color:#64748B; text-transform:uppercase;">Định Hướng 02 • Chữ Ký</div>
          <div style="font-weight:900; font-size:7.8pt; color:#0F172A; margin:1px 0;">Chữ M Đũa Vàng &amp; Bát</div>
          <p style="font-size:6.3pt; color:#475569;">Đôi đũa vàng tạo hình chữ M kết hợp đường cong đáy bát tối giản, cực rõ ở cỡ 16px.</p>
        </div>

        <!-- Concept 3 -->
        <div class="logo-concept-card">
          <div class="squircle-preview">
            <svg width="68" height="68" viewBox="0 0 120 120">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3"/>
              <rect x="16" y="16" width="52" height="88" rx="14" fill="#F8FAFC" stroke="#0F172A" stroke-width="3"/>
              <rect x="74" y="16" width="30" height="54" rx="12" fill="#1D4ED8"/>
              <rect x="74" y="76" width="30" height="28" rx="10" fill="#10B981"/>
              <circle cx="42" cy="60" r="14" fill="#EAB308"/>
              <path d="M36 60 L41 65 L50 55" fill="none" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div style="font-size:6.3pt; font-weight:800; color:#64748B; text-transform:uppercase;">Định Hướng 03 • Cấu Trúc</div>
          <div style="font-weight:900; font-size:7.8pt; color:#0F172A; margin:1px 0;">Khay Thực Đơn 60-30-10</div>
          <p style="font-size:6.3pt; color:#475569;">Chia 3 ngăn tỷ lệ vàng đại diện cho Thực Đơn, Tủ Lạnh và Đi Chợ Thông Minh.</p>
        </div>

        <!-- Concept 4 -->
        <div class="logo-concept-card">
          <div class="squircle-preview">
            <svg width="68" height="68" viewBox="0 0 120 120">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#10B981"/>
              <path d="M26 58 L94 58 C92 90, 60 94, 60 94 C60 94, 28 90, 26 58 Z" fill="#FFFFFF"/>
              <path d="M20 58 L100 58" stroke="#EAB308" stroke-width="7" stroke-linecap="round"/>
              <path d="M48 42 Q54 30 48 22" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M60 40 Q66 26 60 18" fill="none" stroke="#FEF08A" stroke-width="5" stroke-linecap="round"/>
              <path d="M72 42 Q78 30 72 22" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div style="font-size:6.3pt; font-weight:800; color:#64748B; text-transform:uppercase;">Định Hướng 04 • Di Sản</div>
          <div style="font-weight:900; font-size:7.8pt; color:#0F172A; margin:1px 0;">Nồi Đất &amp; Khói Bếp Nhà</div>
          <p style="font-size:6.3pt; color:#475569;">Tôn vinh kho tàng công thức gia truyền và hương vị cơm nhà ấm áp của Mẹ.</p>
        </div>
      </div>

      <!-- 24x24 CONSTRUCTION GRID BLUEPRINT & BRAND LOCKUPS -->
      <div class="two-col-responsive" style="gap:9px; margin-bottom:8px;">
        <div class="panel-dark">
          <div class="panel-label" style="color:#94A3B8;">
            <span>BẢN VẼ LƯỚI BIỂU TƯỢNG 24×24 &amp; SQUIRCLE</span>
            <span class="mono" style="color:#60A5FA;">NÉT 2.0PX BO TRÒN</span>
          </div>
          <div style="display:grid; grid-template-columns:100px 1fr; gap:10px; align-items:center;">
            <svg width="98" height="98" viewBox="0 0 120 120" style="background:#090C12; border-radius:14px; border:1px solid #2D3748;">
              <line x1="0" y1="20" x2="120" y2="20" stroke="#1E293B" stroke-width="1"/>
              <line x1="0" y1="40" x2="120" y2="40" stroke="#1E293B" stroke-width="1"/>
              <line x1="0" y1="60" x2="120" y2="60" stroke="#334155" stroke-width="1"/>
              <line x1="0" y1="80" x2="120" y2="80" stroke="#1E293B" stroke-width="1"/>
              <line x1="0" y1="100" x2="120" y2="100" stroke="#1E293B" stroke-width="1"/>
              <line x1="20" y1="0" x2="20" y2="120" stroke="#1E293B" stroke-width="1"/>
              <line x1="40" y1="0" x2="40" y2="120" stroke="#1E293B" stroke-width="1"/>
              <line x1="60" y1="0" x2="60" y2="120" stroke="#334155" stroke-width="1"/>
              <line x1="80" y1="0" x2="80" y2="120" stroke="#1E293B" stroke-width="1"/>
              <line x1="100" y1="0" x2="100" y2="120" stroke="#1E293B" stroke-width="1"/>
              <line x1="0" y1="0" x2="120" y2="120" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
              <line x1="120" y1="0" x2="0" y2="120" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
              <rect x="12" y="12" width="96" height="96" rx="22" fill="none" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="4 3"/>
              <circle cx="60" cy="60" r="42" fill="none" stroke="#10B981" stroke-width="1.5"/>
              <path d="M34 64 C36 86, 84 86, 86 64 Z" fill="none" stroke="#F8FAFC" stroke-width="3.5" stroke-linejoin="round"/>
              <line x1="30" y1="64" x2="90" y2="64" stroke="#EAB308" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M60 56 C60 40, 74 34, 76 26 C64 26, 58 36, 60 56 Z" fill="none" stroke="#34D399" stroke-width="3" stroke-linejoin="round"/>
            </svg>
            <div style="font-size:6.8pt; color:#CBD5E1; line-height:1.38;">
              <div><strong style="color:#FFF;">• Khung chuẩn:</strong> <code>24 × 24 px</code>, vùng đệm an toàn <code>2px</code> mỗi cạnh.</div>
              <div><strong style="color:#FFF;">• Độ dày nét:</strong> <code>2.0px</code> đồng nhất, <code>2.25px</code> khi mục đang chọn.</div>
              <div><strong style="color:#FFF;">• Đầu &amp; Khớp nét:</strong> <code>stroke-linecap: round</code>, <code>stroke-linejoin: round</code>.</div>
              <div><strong style="color:#FFF;">• Vỏ Squircle:</strong> Bán kính bo góc liên tục <code>22.5%</code> cạnh vuông.</div>
            </div>
          </div>
        </div>

        <!-- 4 LOCKUP VARIATIONS -->
        <div class="panel">
          <div class="panel-label">
            <span>4 BIẾN THỂ TỔ HỢP LOGO &amp; VÙNG CÁCH LY</span>
            <span class="mono" style="color:#1D4ED8;">ĐA NGỮ CẢNH</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:5px;">
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 8px; display:flex; align-items:center; gap:7px;">
              <div style="width:24px; height:24px; border-radius:6px; background:#1D4ED8; color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:8.5pt;">M</div>
              <div>
                <div style="font-weight:900; font-size:8pt; color:#0F172A; line-height:1;">Meal<span style="color:#1D4ED8;">Wise</span></div>
                <div style="font-size:5.8pt; font-weight:700; color:#64748B;">Mâm Cơm Việt Thông Minh</div>
              </div>
            </div>
            <div style="background:#12161F; border:1px solid #2D3748; border-radius:10px; padding:5px 8px; display:flex; align-items:center; gap:7px;">
              <div style="width:24px; height:24px; border-radius:6px; background:#2563EB; color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:8.5pt;">M</div>
              <div>
                <div style="font-weight:900; font-size:8pt; color:#FFFFFF; line-height:1;">Meal<span style="color:#60A5FA;">Wise</span></div>
                <div style="font-size:5.8pt; font-weight:700; color:#94A3B8;">Bản Nền Tối Buồng Lái</div>
              </div>
            </div>
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:4.5px 8px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-weight:900; font-size:7.3pt; color:#1D4ED8;">Huy Hiệu Thu Gọn</span>
              <span class="mono" style="background:#1D4ED8; color:#FFF; padding:2px 6px; border-radius:5px;">MW • VN</span>
            </div>
            <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; padding:4.5px 8px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-weight:900; font-size:7.3pt; color:#0F172A;">Bản Đơn Sắc In Ấn</span>
              <span class="mono" style="background:#0F172A; color:#FFF; padding:2px 6px; border-radius:5px;">100% ĐEN</span>
            </div>
          </div>
          <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:4px 8px; font-size:6.4pt; color:#991B1B; font-weight:700;">
            ✕ Cấm kéo giãn tỷ lệ biểu tượng, cấm đổi màu lá xanh sang màu neon chói, giữ vùng đệm tối thiểu 0.25× chiều cao logo.
          </div>
        </div>
      </div>

      <!-- MULTI-SIZE SCALABILITY MATRIX + LIGHT/DARK/COBALT SQUIRCLE VARIANTS -->
      <div class="panel" style="margin-bottom:8px;">
        <div class="panel-label">
          <span>KIỂM ĐỊNH ĐỘ RÕ NÉT QUA 5 CẤP KÍCH THƯỚC &amp; 3 BIẾN THỂ NỀN COBALT / TỐI / SÁNG</span>
          <span class="mono" style="color:#10B981;">1024PX → 16PX • 3 NỀN</span>
        </div>
        <div class="icon-scale-6grid">
          <!-- 1024px Cobalt Variant -->
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:12px; padding:6px;">
            <svg width="44" height="44" viewBox="0 0 120 120" style="margin:0 auto 3px auto; display:block;">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#1D4ED8"/>
              <path d="M30 62 C32 90, 88 90, 90 62 Z" fill="#FFFFFF"/>
              <ellipse cx="60" cy="62" rx="30" ry="7" fill="#EAB308"/>
              <path d="M60 56 C60 40, 76 34, 78 24 C66 24, 58 34, 60 56 Z" fill="#10B981"/>
            </svg>
            <div class="mono" style="color:#1D4ED8;">1024×1024px</div>
            <div style="font-size:6pt; font-weight:700; color:#1E3A8A;">Bản Nền Cobalt</div>
          </div>
          <!-- 180px Dark Variant -->
          <div style="background:#12161F; border:1px solid #2D3748; border-radius:12px; padding:6px;">
            <svg width="38" height="38" viewBox="0 0 120 120" style="margin:0 auto 3px auto; display:block;">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#1A202C" stroke="#3B82F6" stroke-width="3"/>
              <path d="M30 62 C32 90, 88 90, 90 62 Z" fill="#F8FAFC"/>
              <ellipse cx="60" cy="62" rx="30" ry="7" fill="#EAB308"/>
              <path d="M60 56 C60 40, 76 34, 78 24 C66 24, 58 34, 60 56 Z" fill="#10B981"/>
            </svg>
            <div class="mono" style="color:#60A5FA;">180×180px</div>
            <div style="font-size:6pt; font-weight:700; color:#CBD5E1;">Bản Nền Tối</div>
          </div>
          <!-- 180px Light Variant -->
          <div style="background:#FFFFFF; border:1px solid #CBD5E1; border-radius:12px; padding:6px;">
            <svg width="38" height="38" viewBox="0 0 120 120" style="margin:0 auto 3px auto; display:block;">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#F8FAFC" stroke="#1D4ED8" stroke-width="4"/>
              <path d="M30 62 C32 90, 88 90, 90 62 Z" fill="#1D4ED8"/>
              <ellipse cx="60" cy="62" rx="30" ry="7" fill="#EAB308"/>
              <path d="M60 56 C60 40, 76 34, 78 24 C66 24, 58 34, 60 56 Z" fill="#10B981"/>
            </svg>
            <div class="mono" style="color:#0F172A;">180×180px</div>
            <div style="font-size:6pt; font-weight:700; color:#475569;">Bản Nền Sáng</div>
          </div>
          <!-- 60px Notification -->
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:6px;">
            <svg width="28" height="28" viewBox="0 0 120 120" style="margin:0 auto 3px auto; display:block;">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#2563EB"/>
              <path d="M30 62 C32 90, 88 90, 90 62 Z" fill="#FFFFFF"/>
              <ellipse cx="60" cy="62" rx="30" ry="7" fill="#EAB308"/>
            </svg>
            <div class="mono" style="color:#0F172A;">60×60px</div>
            <div style="font-size:6pt; color:#64748B;">Thông Báo Đẩy</div>
          </div>
          <!-- 24px Navigation -->
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:6px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 3px auto; display:block;">
              <path d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8H4z"/><path d="M12 4c0 3 3 5 3 5s-3-1-3-5z"/>
            </svg>
            <div class="mono" style="color:#0F172A;">24×24px</div>
            <div style="font-size:6pt; color:#64748B;">Điều Hướng Đáy</div>
          </div>
          <!-- 16px Favicon -->
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:6px;">
            <svg width="16" height="16" viewBox="0 0 120 120" style="margin:0 auto 3px auto; display:block;">
              <rect x="4" y="4" width="112" height="112" rx="28" fill="#1D4ED8"/>
              <path d="M28 84 L48 32 L60 58 L72 32 L92 84" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="mono" style="color:#0F172A;">16×16px</div>
            <div style="font-size:6pt; color:#64748B;">Thẻ Trình Duyệt</div>
          </div>
        </div>
      </div>

      <!-- 8 CORE SYSTEM STROKE ICONS (24x24, 2.0PX ROUND STROKE) -->
      <div class="panel">
        <div class="panel-label">
          <span>BỘ 8 BIỂU TƯỢNG ĐIỀU HƯỚNG &amp; CHỨC NĂNG ĐỒNG BỘ NÉT VẼ 2.0PX</span>
          <span class="mono" style="color:#1D4ED8;">STROKE-WIDTH: 2.0PX • ROUND JOIN</span>
        </div>
        <div class="icon-stroke-8grid">
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Thực Đơn</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Đi Chợ</div>
          </div>
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="6" x2="8" y2="8"/><line x1="8" y1="14" x2="8" y2="17"/></svg>
            <div style="font-size:6pt; font-weight:900; color:#1D4ED8;">Tủ Lạnh</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Công Thức</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Thu Âm</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Bếp Nhà</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Mua Chung</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:5px 4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 2px auto; display:block;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div style="font-size:6pt; font-weight:800; color:#0F172A;">Hẹn Giờ</div>
          </div>
        </div>
      </div>

      <!-- CROSS-PLATFORM APP ICON & MANIFEST EXPORT TABLE -->
      <table class="spec-table" style="margin-top:8px;">
        <thead>
          <tr>
            <th>Nền Tảng Đích</th>
            <th>Kích Thước Chuẩn</th>
            <th>Bán Kính / Mặt Nạ Cắt</th>
            <th>Đường Dẫn Tệp Trong Dự Án</th>
            <th>Tiêu Chuẩn Kỹ Thuật Khi Xuất Bản</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>iOS App Store &amp; Màn Hình Chính</strong></td>
            <td class="mono">1024×1024 • 180×180 px</td>
            <td class="mono">Squircle 22.5% tự động</td>
            <td class="mono">public/icons/apple-touch-icon.png</td>
            <td>Xuất ảnh vuông kín nền #1D4ED8, không để viền trong suốt</td>
          </tr>
          <tr>
            <td><strong>Android Adaptive &amp; PWA</strong></td>
            <td class="mono">512×512 • 192×192 px</td>
            <td class="mono">Vùng an toàn 66% trung tâm</td>
            <td class="mono">public/manifest.webmanifest</td>
            <td>Hỗ trợ cả chế độ <code>any</code> và <code>maskable</code> trên mọi dòng máy Android</td>
          </tr>
          <tr>
            <td><strong>Vector Gốc &amp; Trình Duyệt</strong></td>
            <td class="mono">SVG Vô Cực • 32×32 • 16×16 px</td>
            <td class="mono">rx="112" trên khung 512×512</td>
            <td class="mono">public/icon.svg</td>
            <td>Đường nét vector tối giản, giữ độ sắc nét tuyệt đối trên màn hình Retina</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="running-footer">
      <span>Hệ Thống Thiết Kế MealWise • Biểu Tượng Thương Hiệu, Lưới Kỹ Thuật 24×24 &amp; Đa Kích Thước</span>
      <span class="page-num">TRANG 05 / 06</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 6: UI COMPONENT ANATOMY, 5 STATES & MOBILE ERGONOMICS            -->
  <!-- ===================================================================== -->
  <section id="page-6" class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // GIẢI PHẪU THÀNH PHẦN GIAO DIỆN, 5 TRẠNG THÁI &amp; CÔNG THÁI HỌC</span>
        </div>
        <div class="running-meta">PHẦN 06 • MẪU THÀNH PHẦN CHUẨN &amp; BẢN ĐỒ NGÓN CÁI</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">06</span> <span>Giải Phẫu Thành Phần Giao Diện Chủ Lực &amp; Bản Đồ Vùng Chạm Ngón Cái</span></div>
        <div class="sec-sub">Thiết kế chống chồng lấn, đầy đủ 5 trạng thái phản hồi và tối ưu thao tác một tay trong bếp</div>
      </div>

      <div class="ui-specimen-grid">
        <!-- SPECIMEN 1: CUSTOM RECIPE CARD -->
        <div class="panel">
          <div class="panel-label">
            <span>6.1 THẺ MÓN BẾP NHÀ • BO GÓC 20PX</span>
            <span class="mono" style="color:#10B981;">THANH ĐẦU HỢP NHẤT</span>
          </div>
          <div class="mock-recipe-card">
            ${gourmetDataUri ? `<img src="${gourmetDataUri}" alt="Cánh gà rán" />` : ''}
            <div class="mock-card-gradient"></div>
            <div class="mock-card-top">
              <div style="display:flex; gap:4px; flex-wrap:wrap;">
                <span style="background:#F59E0B; color:#0F172A; font-weight:900; font-size:6.3pt; padding:2px 7px; border-radius:999px;">★ Món Bếp Nhà</span>
                <span style="background:rgba(15,23,42,0.75); color:#FFF; font-weight:700; font-size:6.3pt; padding:2px 7px; border-radius:999px; border:1px solid rgba(255,255,255,0.2);">Toàn Quốc</span>
              </div>
              <div style="display:flex; gap:4px; flex-shrink:0;">
                <span class="icon-btn">✎</span>
                <span class="icon-btn">✕</span>
                <span class="icon-btn" style="background:#1D4ED8;">＋</span>
              </div>
            </div>
            <div class="mock-card-bottom">
              <div style="font-size:10pt; font-weight:900; color:#FFF;">Cánh / Đùi Gà Rán Giòn Bếp Mẹ</div>
              <div style="display:flex; align-items:center; gap:5px; margin:2px 0;">
                <span style="font-size:6.6pt; color:#FCD34D; font-weight:700;">♥ Món ruột của Bố</span>
                <span style="background:#FBBF24; color:#0F172A; font-weight:900; font-size:6.2pt; padding:1.5px 7px; border-radius:999px;">▶ Nghe lời dặn • 06s</span>
              </div>
              <div class="mono" style="font-size:6.8pt; color:#E2E8F0;">
                <strong style="color:#FFF;">65.000 đ</strong> • 25 phút • <span style="color:#FCD34D;">450 kcal</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SPECIMEN 2: 3-STEP WIZARD & FLOATING BOTTOM DOCK -->
        <div class="panel" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="panel-label">
              <span>6.2 TRÌNH GHI CÔNG THỨC 3 BƯỚC &amp; THANH ĐÁY</span>
              <span class="mono" style="color:#1D4ED8;">BO GÓC ĐỒNG TÂM</span>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:6px; margin-bottom:5px;">
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:4px;">
                <div style="background:#ECFDF5; border:1px solid #A7F3D0; color:#047857; font-weight:800; font-size:6.2pt; padding:3px; border-radius:8px; text-align:center;">✓ 1. Tên &amp; NL</div>
                <div style="background:#1D4ED8; color:#FFFFFF; font-weight:900; font-size:6.2pt; padding:3px; border-radius:8px; text-align:center;">2. Cách làm</div>
                <div style="background:#FFFFFF; border:1px solid #E2E8F0; color:#64748B; font-weight:700; font-size:6.2pt; padding:3px; border-radius:8px; text-align:center;">3. Hoàn tất</div>
              </div>
              <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:3.5px 7px; display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:6.6pt; font-weight:800; color:#92400E;">● Đang thu âm lời dặn của Mẹ: 00:06</span>
                <span style="background:#DC2626; color:#FFF; font-size:5.8pt; font-weight:800; padding:1.5px 6px; border-radius:999px;">THU ÂM</span>
              </div>
            </div>
          </div>

          <!-- 5-Tab Bottom Dock -->
          <div style="background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:16px; padding:4px 8px; display:grid; grid-template-columns:repeat(5, 1fr); align-items:center; text-align:center;">
            <div style="color:#64748B; font-size:6.2pt; font-weight:700;">Thực Đơn</div>
            <div style="color:#64748B; font-size:6.2pt; font-weight:700;">Đi Chợ</div>
            <div>
              <div style="width:26px; height:26px; border-radius:9px; background:#2563EB; color:#FFF; display:inline-flex; align-items:center; justify-content:center; font-weight:900; font-size:7.8pt;">❄</div>
              <div style="color:#0F172A; font-size:6.2pt; font-weight:900;">Tủ Lạnh</div>
            </div>
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:2.5px 0; color:#1D4ED8; font-size:6.2pt; font-weight:900;">Công Thức</div>
            <div style="color:#64748B; font-size:6.2pt; font-weight:700;">Tài Khoản</div>
          </div>
        </div>
      </div>

      <!-- SPECIMEN 3 & 4: BUTTON HIERARCHY + NUTRITION MACRO PILLS & FRIDGE -->
      <div class="ui-specimen-grid" style="margin-bottom:7px;">
        <div class="panel" style="padding:7px 10px;">
          <div class="panel-label" style="margin-bottom:4px;">
            <span>6.3 PHÂN CẤP NÚT BẤM ≥ 44PX &amp; VIÊN THUỐC GIA VỊ</span>
            <span class="mono" style="color:#1D4ED8;">CHẠM NHANH 1 TAY</span>
          </div>
          <!-- Button Hierarchy Row -->
          <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:5px;">
            <span style="background:#1D4ED8; color:#FFFFFF; font-weight:800; font-size:6.5pt; padding:4px 9px; border-radius:10px;">+ Gán Thực Đơn</span>
            <span style="background:#FFFFFF; border:1px solid #CBD5E1; color:#0F172A; font-weight:800; font-size:6.5pt; padding:4px 8px; border-radius:10px;">Lưu Nhanh</span>
            <span style="background:#DC2626; color:#FFFFFF; font-weight:800; font-size:6.5pt; padding:4px 8px; border-radius:10px;">● Ghi Âm</span>
            <span style="background:#F1F5F9; border:1px solid #CBD5E1; color:#64748B; font-weight:800; font-size:6.5pt; padding:4px 8px; border-radius:10px;">Đi Chợ Chung 🔒</span>
          </div>
          <!-- 1-Tap Spice Pills -->
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            <span style="background:#F8FAFC; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:6.4pt; padding:2px 7px; border-radius:999px;">Nước mắm <strong style="color:#1D4ED8;">+</strong></span>
            <span style="background:#ECFDF5; border:1px solid #6EE7B7; color:#047857; font-weight:800; font-size:6.4pt; padding:2px 7px; border-radius:999px;">Hành tỏi ✓</span>
            <span style="background:#F8FAFC; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:6.4pt; padding:2px 7px; border-radius:999px;">Ớt tươi <strong style="color:#1D4ED8;">+</strong></span>
            <span style="background:#F8FAFC; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:6.4pt; padding:2px 7px; border-radius:999px;">Hạt nêm <strong style="color:#1D4ED8;">+</strong></span>
          </div>
        </div>

        <div class="panel" style="padding:7px 10px;">
          <div class="panel-label" style="margin-bottom:4px;">
            <span>6.4 VIÊN THUỐC DINH DƯỠNG &amp; 3 NGĂN TỦ LẠNH</span>
            <span class="mono" style="color:#10B981;">TABULAR-NUMS</span>
          </div>
          <!-- Nutrition Macro Pills -->
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px; margin-bottom:5px;">
            <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div class="mono" style="color:#DC2626; font-size:6.6pt;">450 kcal</div>
              <div style="font-size:5.6pt; font-weight:700; color:#991B1B;">Năng lượng</div>
            </div>
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div class="mono" style="color:#1D4ED8; font-size:6.6pt;">32g Đạm</div>
              <div style="font-size:5.6pt; font-weight:700; color:#1E40AF;">Giàu đạm</div>
            </div>
            <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div class="mono" style="color:#B45309; font-size:6.6pt;">45g Bột</div>
              <div style="font-size:5.6pt; font-weight:700; color:#92400E;">Tinh bột</div>
            </div>
            <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div class="mono" style="color:#047857; font-size:6.6pt;">14g Béo</div>
              <div style="font-size:5.6pt; font-weight:700; color:#065F46;">Chất béo</div>
            </div>
          </div>
          <!-- 3 Fridge Compartments -->
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;">
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div style="font-size:6.3pt; font-weight:900; color:#1D4ED8;">Ngăn Đông -18°C</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div style="font-size:6.3pt; font-weight:900; color:#0F172A;">Ngăn Mát 4°C</div>
            </div>
            <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:2.5px 4px; text-align:center;">
              <div style="font-size:6.3pt; font-weight:900; color:#047857;">Rau Củ 8°C</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5 CORE INTERACTIVE STATES STRIP -->
      <div class="panel" style="margin-bottom:7px; padding:6px 10px;">
        <div class="panel-label" style="margin-bottom:4px;">
          <span>5 TRẠNG THÁI GIAO DIỆN BẮT BUỘC TRÊN MỌI LUỒNG TƯƠNG TÁC DI ĐỘNG</span>
          <span class="mono" style="color:#1D4ED8;">5 TRẠNG THÁI CHUẨN</span>
        </div>
        <div class="states-5grid">
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:4px; text-align:center;">
            <div style="font-size:6.6pt; font-weight:900; color:#0F172A;">1. Mặc Định</div>
            <div style="font-size:5.8pt; color:#64748B;">Nền phẳng, viền 1px rõ</div>
          </div>
          <div style="background:#F1F5F9; border:1px dashed #94A3B8; border-radius:8px; padding:4px; text-align:center;">
            <div style="font-size:6.6pt; font-weight:900; color:#475569;">2. Đang Tải</div>
            <div style="font-size:5.8pt; color:#64748B;">Khung xương cùng kích cỡ</div>
          </div>
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:4px; text-align:center;">
            <div style="font-size:6.6pt; font-weight:900; color:#1D4ED8;">3. Trống Dữ Liệu</div>
            <div style="font-size:5.8pt; color:#1E40AF;">Gợi ý nút hành động ngay</div>
          </div>
          <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:4px; text-align:center;">
            <div style="font-size:6.6pt; font-weight:900; color:#DC2626;">4. Cảnh Báo Lỗi</div>
            <div style="font-size:5.8pt; color:#991B1B;">Báo rõ nguyên nhân &amp; sửa</div>
          </div>
          <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:4px; text-align:center;">
            <div style="font-size:6.6pt; font-weight:900; color:#047857;">5. Hoàn Tất</div>
            <div style="font-size:5.8pt; color:#065F46;">Huy hiệu xanh &amp; xác nhận</div>
          </div>
        </div>
      </div>

      <!-- THUMB-ZONE MAP & FINAL AUDIT RUBRIC -->
      <div class="ergo-grid" style="margin-bottom:7px;">
        <div class="phone-frame">
          <div class="zone-stretch">
            <div style="font-size:6.3pt; font-weight:900; color:#991B1B; text-transform:uppercase;">25% Vùng Với Tay</div>
            <div style="font-size:5.8pt; color:#7F1D1D;">Chỉ đặt Tiêu đề, Nút Quay lại &amp; Trạng thái chỉ đọc.</div>
          </div>
          <div class="zone-reach">
            <div style="font-size:6.3pt; font-weight:900; color:#92400E; text-transform:uppercase;">35% Vùng Tầm Với</div>
            <div style="font-size:5.8pt; color:#78350F;">Thẻ món ăn, Thanh tìm kiếm, Dải chip chọn nhanh gia vị.</div>
          </div>
          <div class="zone-natural">
            <div>
              <div style="font-size:6.3pt; font-weight:900; color:#065F46; text-transform:uppercase;">40% Vùng Ngón Cái</div>
              <div style="font-size:5.8pt; color:#064E3B;">Nút xác nhận chính Cobalt #1D4ED8, Lưu Nhanh &amp; Thanh điều hướng đáy.</div>
            </div>
            <div style="background:#1D4ED8; color:#FFF; font-size:6.3pt; font-weight:900; text-align:center; padding:3.5px; border-radius:8px;">
              Vùng Chạm Chính ≥ 44×44px
            </div>
          </div>
        </div>

        <table class="spec-table">
          <thead>
            <tr>
              <th>Hạng Mục Kiểm Định Thiết Kế</th>
              <th>Tiêu Chuẩn Kỹ Thuật Bắt Buộc</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Bảng Màu 60-30-10 Phẳng Lì</strong></td>
              <td>Không dùng dải màu kim loại; tương phản chữ đạt chuẩn AAA 15.8:1</td>
              <td style="color:#059669; font-weight:800; white-space:nowrap;">✓ ĐẠT CHUẨN</td>
            </tr>
            <tr>
              <td><strong>2. Bộ Đôi Font &amp; Phân Cấp Chữ</strong></td>
              <td>Be Vietnam Pro 400–900 không cắt dấu + JetBrains Mono cố định số</td>
              <td style="color:#059669; font-weight:800; white-space:nowrap;">✓ ĐẠT CHUẨN</td>
            </tr>
            <tr>
              <td><strong>3. Hệ Thống Bo Góc Đồng Tâm</strong></td>
              <td>6 cấp bo góc <code>8px</code> → <code>9999px</code> tuân thủ <code>R_ngoài = R_trong + Đệm</code></td>
              <td style="color:#059669; font-weight:800; white-space:nowrap;">✓ ĐẠT CHUẨN</td>
            </tr>
            <tr>
              <td><strong>4. Sự Thuần Khiết Tiếng Việt</strong></td>
              <td>100% nhãn tự nhiên; tuyệt đối không chêm tiếng Anh trong ngoặc đơn</td>
              <td style="color:#059669; font-weight:800; white-space:nowrap;">✓ ĐẠT CHUẨN</td>
            </tr>
            <tr>
              <td><strong>5. Sự Thuần Khiết Ảnh Món Ăn</strong></td>
              <td>100% ảnh món ăn, nguyên liệu tươi ngon; không có khuôn mặt người</td>
              <td style="color:#059669; font-weight:800; white-space:nowrap;">✓ ĐẠT CHUẨN</td>
            </tr>
            <tr>
              <td><strong>6. Công Thái Học Điện Thoại</strong></td>
              <td>Vùng chạm <code>≥ 44×44px</code>, đệm tai thỏ/thanh gạt, khóa tính năng khách</td>
              <td style="color:#059669; font-weight:800; white-space:nowrap;">✓ ĐẠT CHUẨN</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VIEWPORT SAFE-AREA BAR -->
      <div style="background:#12161F; color:#F8FAFC; border-radius:12px; padding:5.5px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:6.6pt;">
        <span><strong>Chuẩn Khung Hình Điện Thoại:</strong> <code>360×800px</code> Android Phổ Thông • <code>390×844px</code> iPhone Tiêu Chuẩn • <code>430×932px</code> Màn Hình Lớn</span>
        <span class="mono" style="color:#34D399; white-space:nowrap;">SAFE-AREA-INSET</span>
      </div>
    </div>

    <footer class="running-footer">
      <span>Hệ Thống Thiết Kế MealWise • Giải Phẫu Thành Phần Giao Diện &amp; Công Thái Học Di Động</span>
      <span class="page-num">TRANG 06 / 06</span>
    </footer>
  </section>

  <script>
    function fallbackCopyText(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
    }

    function copyToken(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function() {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
      var toast = document.getElementById('copy-toast');
      if (toast) {
        toast.textContent = '✓ Đã sao chép: ' + text;
        toast.classList.add('show');
        clearTimeout(window.__toastTimer);
        window.__toastTimer = setTimeout(function() {
          toast.classList.remove('show');
        }, 1800);
      }
    }

    function setPreviewRadius(px, twClass, roleText) {
      var outer = document.getElementById('live-radius-outer');
      var inner = document.getElementById('live-radius-inner');
      var label = document.getElementById('live-radius-label');
      var role = document.getElementById('live-radius-role');
      var formula = document.getElementById('live-radius-formula');
      var chips = document.querySelectorAll('.radius-chip');
      chips.forEach(function(c) {
        if (c.getAttribute('data-radius') === String(px)) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
      var innerPx = px === 9999 ? 9999 : Math.max(4, px - 8);
      if (outer) outer.style.borderRadius = (px === 9999 ? 9999 : px) + 'px';
      if (inner) inner.style.borderRadius = innerPx + 'px';
      if (label) label.textContent = px + 'px • ' + twClass;
      if (role) role.textContent = roleText;
      if (formula) {
        formula.textContent = px === 9999
          ? 'R_ngoài: 9999px • Viên thuốc → R_trong: 9999px'
          : 'R_ngoài: ' + px + 'px | Đệm: 8px → R_trong: ' + innerPx + 'px';
      }
    }
  </script>
</body>
</html>`;

const docsHtmlPath = path.join(rootDir, 'docs', 'moodboard-print.html');
const publicHtmlPath = path.join(rootDir, 'public', 'moodboard.html');
const distHtmlPath = path.join(rootDir, 'dist', 'moodboard.html');

fs.mkdirSync(path.dirname(docsHtmlPath), { recursive: true });
fs.writeFileSync(docsHtmlPath, htmlContent, 'utf8');
fs.writeFileSync(publicHtmlPath, htmlContent, 'utf8');
if (fs.existsSync(path.dirname(distHtmlPath))) {
  fs.writeFileSync(distHtmlPath, htmlContent, 'utf8');
}

const pdfOut1 = path.join(rootDir, 'MealWise_Mood_Board.pdf');
const pdfOut2 = path.join(rootDir, 'docs', 'MealWise_Mood_Board.pdf');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];

const browserExe = edgePaths.find(p => fs.existsSync(p));
if (!browserExe) {
  console.error('No headless Chromium browser found');
  process.exit(1);
}

const fileUrl = 'file:///' + docsHtmlPath.replace(/\\/g, '/');
execSync(`"${browserExe}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOut1}" "${fileUrl}"`);
try {
  fs.copyFileSync(pdfOut1, pdfOut2);
} catch (err) {
  console.warn('Note: docs/MealWise_Mood_Board.pdf is currently open in another viewer; main MealWise_Mood_Board.pdf updated.');
}
console.log('Successfully generated 6-page studio moodboard HTML & PDF:', pdfOut1);
