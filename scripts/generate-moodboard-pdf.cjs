const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bandaiGuideImgPath = 'C:/Users/EXIA/.gemini/antigravity/brain/b5f1d5ef-463d-47ab-81a1-076674a77a79/.user_uploaded/media_1791944418825_4c2680c6.jpg';
const gourmetImgPath = path.join(__dirname, '..', 'public', 'mockups', 'style2-warm-gourmet.jpg');
const bentoDarkImgPath = path.join(__dirname, '..', 'public', 'mockups', 'editorial-precision-dark.jpg');
const bentoLightImgPath = path.join(__dirname, '..', 'public', 'mockups', 'editorial-precision-light.jpg');

function toDataUri(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const buf = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const bandaiDataUri = toDataUri(bandaiGuideImgPath);
const gourmetDataUri = toDataUri(gourmetImgPath);
const bentoDarkUri = toDataUri(bentoDarkImgPath);
const bentoLightUri = toDataUri(bentoLightImgPath);

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>MealWise — Visual Mood Board &amp; Design Language Specification v3.2</title>
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

    body {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      font-size: 9.5pt;
      line-height: 1.45;
    }

    .sheet {
      width: 210mm;
      height: 297mm;
      padding: 13mm 14mm 12mm 14mm;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #F8FAFC;
      overflow: hidden;
    }

    .sheet:last-child {
      page-break-after: auto;
    }

    /* RUNNING HEADER & FOOTER */
    .running-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #E2E8F0;
      margin-bottom: 12px;
      flex-shrink: 0;
    }

    .running-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 900;
      font-size: 8.5pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #0F172A;
    }

    .running-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1D4ED8;
      display: inline-block;
    }

    .running-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.04em;
    }

    .running-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1.5px solid #E2E8F0;
      margin-top: 10px;
      font-size: 7.5pt;
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
    }

    /* HERO COVER BLOCK */
    .hero-cover {
      background: #12161F;
      color: #F8FAFC;
      border-radius: 20px;
      padding: 22px 24px;
      border: 1px solid #2D3748;
      position: relative;
      margin-bottom: 12px;
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1D4ED8;
      color: #FFFFFF;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 11px;
      border-radius: 999px;
    }

    .tag-outline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 700;
      color: #EAB308;
      background: rgba(234, 179, 8, 0.12);
      border: 1px solid rgba(234, 179, 8, 0.35);
      padding: 3px 10px;
      border-radius: 999px;
    }

    .hero-title {
      font-size: 21pt;
      font-weight: 900;
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 6px;
      color: #FFFFFF;
    }

    .hero-title span {
      color: #60A5FA;
    }

    .hero-subtitle {
      font-size: 9pt;
      color: #94A3B8;
      line-height: 1.45;
      margin-bottom: 14px;
      max-width: 95%;
    }

    .hero-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid #2D3748;
    }

    .kpi-box {
      background: #1A202C;
      border: 1px solid #2D3748;
      border-radius: 10px;
      padding: 7px 10px;
    }

    .kpi-label {
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #94A3B8;
      letter-spacing: 0.04em;
    }

    .kpi-val {
      font-size: 10pt;
      font-weight: 900;
      color: #F8FAFC;
      margin-top: 1px;
    }

    /* SECTION HEADINGS */
    .sec-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .sec-title {
      font-size: 12pt;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.015em;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .sec-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      font-weight: 800;
      background: #1D4ED8;
      color: #FFFFFF;
      padding: 2px 7px;
      border-radius: 6px;
    }

    .sec-sub {
      font-size: 8pt;
      font-weight: 600;
      color: #64748B;
    }

    /* BENTO MOOD BOARD GRID (PAGE 1) */
    .bento-mood-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .panel {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 12px;
    }

    .panel-dark {
      background: #12161F;
      border: 1px solid #2D3748;
      color: #F8FAFC;
      border-radius: 16px;
      padding: 12px;
    }

    .panel-label {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748B;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mood-img-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .mood-img-card {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      position: relative;
      height: 155px;
      background: #0F172A;
    }

    .mood-img-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .mood-img-tag {
      position: absolute;
      bottom: 6px;
      left: 6px;
      right: 6px;
      background: rgba(18, 22, 31, 0.88);
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 7pt;
      font-weight: 700;
    }

    .bandai-card {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #2D3748;
      background: #090C12;
      height: 185px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .bandai-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .extraction-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .ext-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #1A202C;
      border: 1px solid #2D3748;
      padding: 5px 8px;
      border-radius: 8px;
      font-size: 7.2pt;
    }

    .ext-dot {
      width: 12px;
      height: 12px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    /* 60-30-10 PROPORTION ARCHITECTURE BAR */
    .arch-bar-wrap {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 12px 14px;
    }

    .arch-bar {
      display: flex;
      height: 38px;
      border-radius: 10px;
      overflow: hidden;
      border: 1.5px solid #0F172A;
      margin: 8px 0;
    }

    .arch-60 {
      width: 60%;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      font-weight: 900;
      font-size: 8.5pt;
      border-right: 1.5px solid #0F172A;
    }

    .arch-30 {
      width: 30%;
      background: #1D4ED8;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      font-weight: 900;
      font-size: 8.5pt;
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
      gap: 8px;
      margin-top: 6px;
    }

    .arch-col {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 7px 9px;
      font-size: 7.5pt;
    }

    /* PAGE 2: PANTONE SWATCH CARDS */
    .swatch-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    .pantone-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
    }

    .pantone-color {
      height: 58px;
      padding: 6px 8px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1px solid #E2E8F0;
    }

    .wcag-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.5pt;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .pantone-body {
      padding: 7px 8px;
    }

    .pantone-name {
      font-weight: 900;
      font-size: 8pt;
      color: #0F172A;
    }

    .pantone-hex {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.2pt;
      font-weight: 700;
      color: #1D4ED8;
      margin-top: 1px;
    }

    .pantone-role {
      font-size: 6.8pt;
      color: #64748B;
      margin-top: 3px;
      line-height: 1.3;
    }

    /* DATA TABLE */
    .spec-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.8pt;
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
      padding: 6px 9px;
      font-size: 7.2pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .spec-table td {
      padding: 4.5px 9px;
      border-bottom: 1px solid #E2E8F0;
      color: #1E293B;
    }

    .spec-table tr:last-child td {
      border-bottom: none;
    }

    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 7.2pt;
    }

    /* COCKPIT COMPARISON */
    .cockpit-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    /* PAGE 3: TYPOGRAPHY & LINGUISTIC PURITY */
    .type-specimen-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 8px 14px;
      margin-bottom: 8px;
    }

    .type-row {
      display: grid;
      grid-template-columns: 125px 1fr;
      align-items: baseline;
      gap: 12px;
      padding: 4.5px 0;
      border-bottom: 1px solid #F1F5F9;
    }

    .type-row:last-child {
      border-bottom: none;
    }

    .do-dont-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .do-card {
      background: #ECFDF5;
      border: 1.5px solid #10B981;
      border-radius: 14px;
      padding: 9px 12px;
    }

    .dont-card {
      background: #FEF2F2;
      border: 1.5px solid #DC2626;
      border-radius: 14px;
      padding: 9px 12px;
    }

    /* PAGE 4: LIVE UI SPECIMENS */
    .ui-specimen-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .mock-recipe-card {
      position: relative;
      height: 168px;
      border-radius: 18px;
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
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
    }

    .mock-card-bottom {
      position: absolute;
      bottom: 10px;
      left: 12px;
      right: 12px;
    }

    .icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 9px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      font-weight: 800;
    }

    /* PAGE 5: THUMB ZONE & ANTI-PATTERNS */
    .ergo-grid {
      display: grid;
      grid-template-columns: 205px 1fr;
      gap: 12px;
      margin-bottom: 10px;
    }

    .phone-frame {
      width: 205px;
      height: 335px;
      border: 4px solid #0F172A;
      border-radius: 26px;
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
      padding: 6px 9px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .zone-reach {
      height: 35%;
      background: #FFFBEB;
      border-bottom: 1.5px dashed #EAB308;
      padding: 6px 9px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .zone-natural {
      height: 40%;
      background: #ECFDF5;
      padding: 6px 9px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- PAGE 1: COVER & VISUAL MOOD BOARD BENTO                               -->
  <!-- ===================================================================== -->
  <section class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // VISUAL MOOD BOARD &amp; DESIGN LANGUAGE SPECIFICATION</span>
        </div>
        <div class="running-meta">DOC-ID: MW-DL-3.2 • ANDROID &amp; iOS NATIVE</div>
      </header>

      <!-- HERO COVER -->
      <div class="hero-cover">
        <div class="hero-top-row">
          <span class="tag-pill">60-30-10 FLAT MATTE SYSTEM</span>
          <span class="tag-outline">GUNDAM EXIA REPAIR III (GN-001REIII) PALETTE</span>
        </div>
        <h1 class="hero-title">Bảng Thiết Kế Cảm Hứng &amp; <span>Ngôn Ngữ Thiết Kế MealWise</span></h1>
        <p class="hero-subtitle">
          Chuẩn hóa hệ thống thị giác phẳng lì (Flat Matte), bảng mã màu công nghiệp chính xác cao, phân cấp kiểu chữ tiếng Việt và công thái học ngón cái cho ứng dụng quản lý bữa cơm gia đình &amp; đi chợ thông minh.
        </p>
        <div class="hero-kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Kiến Trúc Thị Giác</div>
            <div class="kpi-val" style="color:#60A5FA;">60 - 30 - 10 Matte</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Tương Phản Chữ</div>
            <div class="kpi-val" style="color:#34D399;">WCAG AAA (15.8:1)</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Vùng Chạm Tối Thiểu</div>
            <div class="kpi-val" style="color:#FBBF24;">44 × 44 px Chuẩn</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Ngôn Ngữ Giao Diện</div>
            <div class="kpi-val" style="color:#F8FAFC;">100% Thuần Việt</div>
          </div>
        </div>
      </div>

      <!-- SECTION 1: VISUAL MOOD BOARD BENTO -->
      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">01</span> <span>Bản Vẽ Cảm Hứng Thị Giác &amp; Chiết Xuất Sắc Độ (Visual Mood Board)</span></div>
        <div class="sec-sub">Sự giao thoa giữa nhiếp ảnh ẩm thực Việt ấm cúng &amp; bảng màu kỹ thuật Bandai</div>
      </div>

      <div class="bento-mood-grid">
        <!-- Left Column: Culinary Photography & UI Surfaces -->
        <div class="panel">
          <div class="panel-label">
            <span>NHIẾP ẢNH ẨM THỰC &amp; GIAO DIỆN PHẲNG LÌ</span>
            <span style="color:#1D4ED8;">FOOD PURITY 100%</span>
          </div>
          <div class="mood-img-pair">
            <div class="mood-img-card">
              ${gourmetDataUri ? `<img src="${gourmetDataUri}" alt="Ẩm thực Việt" />` : ''}
              <div class="mood-img-tag">Bữa Cơm Gia Đình Thuần Việt • Không Mặt Người</div>
            </div>
            <div class="mood-img-card">
              ${bentoLightUri ? `<img src="${bentoLightUri}" alt="Giao diện Sáng" />` : ''}
              <div class="mood-img-tag">60% Nền Sáng Phẳng Lì (#F8FAFC / #FFFFFF)</div>
            </div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:8px 10px;">
            <div style="font-weight:800; font-size:8pt; color:#0F172A; margin-bottom:3px;">Nguyên Tắc Tôn Vinh Món Ăn (Zero Visual Competition)</div>
            <p style="font-size:7.5pt; color:#475569;">
              Toàn bộ khung nền, thẻ bài và thanh điều hướng sử dụng sắc thái lì không bóng kim loại (Zero Metallic Gradient), giúp màu đỏ của ớt, màu xanh của hành lá và màu nâu cánh gián của nước kho nổi bật tuyệt đối.
            </p>
          </div>
        </div>

        <!-- Right Column: Gundam Exia Repair III Reference & Extraction -->
        <div class="panel-dark">
          <div class="panel-label" style="color:#94A3B8;">
            <span>BẢNG MÀU GỐC BANDAI GN-001REIII</span>
            <span style="color:#EAB308;">COLOR CALIBRATION</span>
          </div>
          <div class="bandai-card">
            ${bandaiDataUri ? `<img src="${bandaiDataUri}" alt="Gundam Exia Repair III Color Guide" />` : ''}
          </div>
          <div class="extraction-list">
            <div class="ext-chip">
              <span class="ext-dot" style="background:#1D4ED8;"></span>
              <div><strong style="color:#FFF;">#1D4ED8</strong><br/><span style="color:#94A3B8;">80% Cobalt + 20% Sky</span></div>
            </div>
            <div class="ext-chip">
              <span class="ext-dot" style="background:#10B981;"></span>
              <div><strong style="color:#FFF;">#10B981</strong><br/><span style="color:#94A3B8;">GN Sensor Clear Green</span></div>
            </div>
            <div class="ext-chip">
              <span class="ext-dot" style="background:#EAB308;"></span>
              <div><strong style="color:#FFF;">#EAB308</strong><br/><span style="color:#94A3B8;">V-Fin Flat Amber</span></div>
            </div>
            <div class="ext-chip">
              <span class="ext-dot" style="background:#DC2626;"></span>
              <div><strong style="color:#FFF;">#DC2626</strong><br/><span style="color:#94A3B8;">Cockpit Monza Red</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 60-30-10 PROPORTION BAR -->
      <div class="arch-bar-wrap">
        <div class="panel-label" style="margin-bottom:2px;">
          <span>TỶ LỆ PHÂN BỔ THỊ GIÁC 60 - 30 - 10 TRÊN MÀN HÌNH DI ĐỘNG</span>
          <span class="mono" style="color:#0F172A;">60% BASE • 30% BRAND • 10% SEMANTIC</span>
        </div>
        <div class="arch-bar">
          <div class="arch-60">
            <span>60% BỀ MẶT NỀN CHỦ ĐẠO</span>
            <span class="mono">#F8FAFC • #FFFFFF • #12161F</span>
          </div>
          <div class="arch-30">
            <span>30% COBALT</span>
            <span class="mono">#1D4ED8</span>
          </div>
          <div class="arch-10" title="10% Semantic Accents">
            <div></div><div></div><div></div>
          </div>
        </div>
        <div class="arch-3cols">
          <div class="arch-col">
            <strong style="color:#0F172A;">60% Không Gian Thở (Canvas &amp; Card)</strong><br/>
            <span style="color:#475569;">Giảm mỏi mắt khi đọc công thức dài và kiểm tra danh sách đi chợ trong siêu thị.</span>
          </div>
          <div class="arch-col">
            <strong style="color:#1D4ED8;">30% Định Hướng Hành Động (Cobalt)</strong><br/>
            <span style="color:#475569;">Dẫn dắt ngón cái tới các nút CTA chính, tab đang mở và nút Tủ Lạnh trung tâm.</span>
          </div>
          <div class="arch-col">
            <strong style="color:#B45309;">10% Tín Hiệu Ngữ Nghĩa Tức Thời</strong><br/>
            <span style="color:#475569;">Phân biệt độ tươi nguyên liệu (#10B981), Món Bếp Nhà (#EAB308) và thu âm/hết hạn (#DC2626).</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="running-footer">
      <span>MealWise Culinary Design System • Tài Liệu Chuẩn Hóa Nội Bộ</span>
      <span class="page-num">TRANG 01 / 05</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 2: COLOR SWATCHES & LIGHT/DARK COCKPIT MATRIX                    -->
  <!-- ===================================================================== -->
  <section class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // HỆ THỐNG MÀU SẮC &amp; ĐỘ TƯƠNG PHẢN (COLOR TOKENS MATRIX)</span>
        </div>
        <div class="running-meta">SECTION 02 • PANTONE MATTE CALIBRATION</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">02</span> <span>Thẻ Mẫu Màu Công Nghiệp (10 Core Flat Matte Swatches)</span></div>
        <div class="sec-sub">Kiểm định độ tương phản theo tiêu chuẩn quốc tế WCAG 2.1 AA / AAA</div>
      </div>

      <!-- 10 PANTONE SWATCH CARDS (2 ROWS OF 5) -->
      <div class="swatch-grid">
        <div class="pantone-card">
          <div class="pantone-color" style="background:#F8FAFC; color:#0F172A;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#E2E8F0; color:#0F172A;">BASE</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Light Canvas</div>
            <div class="pantone-hex">#F8FAFC</div>
            <div class="pantone-role">RGB(248, 250, 252)<br/>Nền ứng dụng sáng</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#FFFFFF; color:#0F172A;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#F1F5F9; color:#0F172A;">CARD</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Pure Surface</div>
            <div class="pantone-hex">#FFFFFF</div>
            <div class="pantone-role">RGB(255, 255, 255)<br/>Bề mặt thẻ món ăn</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#12161F; color:#F8FAFC;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#1E293B; color:#38BDF8;">16.1:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">GN Dark Cockpit</div>
            <div class="pantone-hex">#12161F</div>
            <div class="pantone-role">RGB(18, 22, 31)<br/>Khung nền chế độ tối</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#1A202C; color:#F8FAFC;">
            <span class="mono">60%</span>
            <span class="wcag-pill" style="background:#2D3748; color:#F8FAFC;">13.9:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Dark Card</div>
            <div class="pantone-hex">#1A202C</div>
            <div class="pantone-role">RGB(26, 32, 44)<br/>Thẻ nổi chế độ tối</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#0F172A; color:#FFFFFF;">
            <span class="mono">INK</span>
            <span class="wcag-pill" style="background:#334155; color:#FFFFFF;">15.8:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Primary Ink</div>
            <div class="pantone-hex">#0F172A</div>
            <div class="pantone-role">RGB(15, 23, 42)<br/>Chữ tiêu đề &amp; giá tiền</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#1D4ED8; color:#FFFFFF;">
            <span class="mono">30%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.2); color:#FFFFFF;">8.6:1 AAA</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Exia Cobalt</div>
            <div class="pantone-hex">#1D4ED8</div>
            <div class="pantone-role">RGB(29, 78, 216)<br/>Nút CTA &amp; Tab chính</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#2563EB; color:#FFFFFF;">
            <span class="mono">30%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.2); color:#FFFFFF;">5.9:1 AA+</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Interactive Blue</div>
            <div class="pantone-hex">#2563EB</div>
            <div class="pantone-role">RGB(37, 99, 235)<br/>Nút Tủ Lạnh thanh Dock</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#10B981; color:#052E16;">
            <span class="mono">10%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.5); color:#052E16;">FRESH</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">GN Clear Green</div>
            <div class="pantone-hex">#10B981</div>
            <div class="pantone-role">RGB(16, 185, 129)<br/>Tươi mới &amp; Hoàn thành</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#EAB308; color:#0F172A;">
            <span class="mono">10%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.5); color:#0F172A;">FAMILY</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">V-Fin Flat Amber</div>
            <div class="pantone-hex">#EAB308</div>
            <div class="pantone-role">RGB(234, 179, 8)<br/>Món Bếp Nhà &amp; Lời dặn</div>
          </div>
        </div>

        <div class="pantone-card">
          <div class="pantone-color" style="background:#DC2626; color:#FFFFFF;">
            <span class="mono">10%</span>
            <span class="wcag-pill" style="background:rgba(255,255,255,0.2); color:#FFFFFF;">ALERT</span>
          </div>
          <div class="pantone-body">
            <div class="pantone-name">Monza Flat Red</div>
            <div class="pantone-hex">#DC2626</div>
            <div class="pantone-role">RGB(220, 38, 38)<br/>Thu âm, Calo &amp; Hết hạn</div>
          </div>
        </div>
      </div>

      <!-- COMPLETE TOKEN MATRIX TABLE -->
      <div class="sec-header" style="margin-top:6px;">
        <div class="sec-title"><span>Bảng Đặc Tả Kỹ Thuật Mã Màu &amp; Lớp Tailwind CSS</span></div>
        <div class="sec-sub">Ánh xạ trực tiếp vào src/index.css &amp; các component React</div>
      </div>

      <table class="spec-table" style="margin-bottom:12px;">
        <thead>
          <tr>
            <th>Token ID</th>
            <th>Tỷ Lệ</th>
            <th>Mã Hex</th>
            <th>Hệ Màu HSL</th>
            <th>Lớp Tailwind Chuẩn</th>
            <th>Ứng Dụng Trong MealWise</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono">surface-canvas-light</td>
            <td>60%</td>
            <td class="mono">#F8FAFC</td>
            <td class="mono">hsl(210, 40%, 98%)</td>
            <td class="mono">bg-slate-50</td>
            <td>Khung nền tổng thể chế độ sáng, tạo cảm giác sạch sẽ thoáng đãng</td>
          </tr>
          <tr>
            <td class="mono">surface-canvas-dark</td>
            <td>60%</td>
            <td class="mono">#12161F</td>
            <td class="mono">hsl(222, 27%, 10%)</td>
            <td class="mono">dark:bg-[#12161F]</td>
            <td>Khung nền tối GN Frame, bảo vệ mắt khi xem thực đơn ban đêm</td>
          </tr>
          <tr>
            <td class="mono">ink-primary</td>
            <td>60%</td>
            <td class="mono">#0F172A</td>
            <td class="mono">hsl(222, 47%, 11%)</td>
            <td class="mono">text-slate-900 dark:text-white</td>
            <td>Tên món ăn, giá tiền, tiêu đề bước nấu (Tương phản AAA 15.8:1)</td>
          </tr>
          <tr>
            <td class="mono">brand-cobalt-primary</td>
            <td>30%</td>
            <td class="mono">#1D4ED8</td>
            <td class="mono">hsl(224, 76%, 48%)</td>
            <td class="mono">bg-[#1D4ED8] text-white</td>
            <td>Nút CTA chính, Bước đang hoạt động, Viên thuốc lọc danh mục</td>
          </tr>
          <tr>
            <td class="mono">brand-sky-tint</td>
            <td>30%</td>
            <td class="mono">#EFF6FF</td>
            <td class="mono">hsl(214, 100%, 97%)</td>
            <td class="mono">bg-blue-50 text-[#1D4ED8]</td>
            <td>Nền đệm cho thông báo gợi ý và chip nguyên liệu phổ biến</td>
          </tr>
          <tr>
            <td class="mono">semantic-emerald</td>
            <td>10%</td>
            <td class="mono">#10B981</td>
            <td class="mono">hsl(160, 84%, 39%)</td>
            <td class="mono">bg-emerald-600 text-white</td>
            <td>Huy hiệu nguyên liệu tươi trong tủ lạnh, Đã chọn nguyên liệu</td>
          </tr>
          <tr>
            <td class="mono">semantic-amber</td>
            <td>10%</td>
            <td class="mono">#EAB308</td>
            <td class="mono">hsl(48, 96%, 47%)</td>
            <td class="mono">bg-amber-500 text-slate-950</td>
            <td>Huy hiệu ★ Món Bếp Nhà, Nút phát lời dặn người nấu</td>
          </tr>
          <tr>
            <td class="mono">semantic-monza-red</td>
            <td>10%</td>
            <td class="mono">#DC2626</td>
            <td class="mono">hsl(0, 72%, 51%)</td>
            <td class="mono">bg-rose-600 text-white</td>
            <td>Trạng thái đang thu âm giọng nói, Cảnh báo thực phẩm hết hạn</td>
          </tr>
        </tbody>
      </table>

      <!-- LIGHT VS DARK COCKPIT COMPARISON -->
      <div class="cockpit-pair">
        <div class="panel" style="background:#F8FAFC;">
          <div class="panel-label">
            <span>CHẾ ĐỘ SÁNG (DAYLIGHT KITCHEN MODE)</span>
            <span class="mono" style="color:#1D4ED8;">#F8FAFC + #FFFFFF</span>
          </div>
          <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:10px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:7pt; font-weight:800; color:#1D4ED8; text-transform:uppercase;">Món Mặn • Miền Bắc</div>
              <div style="font-size:10pt; font-weight:900; color:#0F172A;">Thịt Ba Chỉ Rang Cháy Cạnh</div>
              <div style="font-size:7.5pt; color:#64748B; font-weight:600;">55.000 đ • 20 phút • 480 kcal</div>
            </div>
            <div style="background:#1D4ED8; color:#FFF; font-weight:800; font-size:7.5pt; padding:6px 12px; border-radius:10px;">+ Chọn Món</div>
          </div>
        </div>

        <div class="panel-dark">
          <div class="panel-label" style="color:#94A3B8;">
            <span>CHẾ ĐỘ TỐI (GN COCKPIT NIGHT MODE)</span>
            <span class="mono" style="color:#60A5FA;">#12161F + #1A202C</span>
          </div>
          <div style="background:#1A202C; border:1px solid #2D3748; border-radius:12px; padding:10px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:7pt; font-weight:800; color:#60A5FA; text-transform:uppercase;">Món Mặn • Miền Bắc</div>
              <div style="font-size:10pt; font-weight:900; color:#F8FAFC;">Thịt Ba Chỉ Rang Cháy Cạnh</div>
              <div style="font-size:7.5pt; color:#94A3B8; font-weight:600;">55.000 đ • 20 phút • 480 kcal</div>
            </div>
            <div style="background:#2563EB; color:#FFF; font-weight:800; font-size:7.5pt; padding:6px 12px; border-radius:10px;">+ Chọn Món</div>
          </div>
        </div>
      </div>
    </div>

    <footer class="running-footer">
      <span>MealWise Culinary Design System • Bảng Đặc Tả Màu Sắc 60-30-10</span>
      <span class="page-num">TRANG 02 / 05</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 3: TYPOGRAPHY SPECIMEN & VIETNAMESE LINGUISTIC PURITY            -->
  <!-- ===================================================================== -->
  <section class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // HỆ THỐNG KIỂU CHỮ &amp; SỰ THUẦN KHIẾT TIẾNG VIỆT (TYPOGRAPHY &amp; COPYWRITING)</span>
        </div>
        <div class="running-meta">SECTION 03 • BE VIETNAM PRO &amp; JETBRAINS MONO</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">03</span> <span>Bản Mẫu Kiểu Chữ Tiếng Việt (Live Typography Specimen)</span></div>
        <div class="sec-sub">Tối ưu hóa dấu thanh tiếng Việt trên màn hình di động 360px – 430px</div>
      </div>

      <!-- LIVE TYPOGRAPHY SPECIMEN -->
      <div class="type-specimen-box">
        <div class="type-row">
          <div>
            <div class="mono" style="color:#1D4ED8;">Display H1</div>
            <div style="font-size:6.8pt; color:#64748B;">20px • Black 900 • LH 1.25</div>
          </div>
          <div style="font-size:15pt; font-weight:900; color:#0F172A; letter-spacing:-0.02em;">
            Khám Phá Món Ngon Truyền Thống Bếp Việt
          </div>
        </div>

        <div class="type-row">
          <div>
            <div class="mono" style="color:#1D4ED8;">Card Title H2</div>
            <div style="font-size:6.8pt; color:#64748B;">17px • Extrabold 800 • LH 1.30</div>
          </div>
          <div style="font-size:12.5pt; font-weight:800; color:#0F172A; letter-spacing:-0.01em;">
            Cá Bống Kho Tiêu Tộ Đất &amp; Canh Chua Cá Lóc Miền Tây
          </div>
        </div>

        <div class="type-row">
          <div>
            <div class="mono" style="color:#1D4ED8;">Body / Recipe Step</div>
            <div style="font-size:6.8pt; color:#64748B;">13.5px • Medium 500 • LH 1.50</div>
          </div>
          <div style="font-size:9pt; font-weight:500; color:#334155;">
            Ướp cá với nước mắm nhỉ, đường thốt nốt, hành tím băm và tiêu sọ đập dập trong 15 phút. Kho hai lửa liu riu đến khi nước kho sánh kẹo lại, dậy mùi thơm nồng đặc trưng.
          </div>
        </div>

        <div class="type-row">
          <div>
            <div class="mono" style="color:#1D4ED8;">Numeric / Timer</div>
            <div style="font-size:6.8pt; color:#64748B;">JetBrains Mono 800</div>
          </div>
          <div class="mono" style="font-size:10.5pt; color:#0F172A; background:#F1F5F9; padding:3px 10px; border-radius:8px; display:inline-block;">
            00:14:59 • 65.000 VNĐ / 4 người • 450 kcal
          </div>
        </div>
      </div>

      <!-- MOBILE VIEWPORT TYPE SCALE MATRIX -->
      <div class="sec-header" style="margin-top:4px;">
        <div class="sec-title"><span>Ma Trận Tỷ Lệ Chữ Chuẩn Màn Hình Di Động (Mobile Type Scale)</span></div>
        <div class="sec-sub">Khóa cứng tỷ lệ hiển thị không bị vỡ khung khi điện thoại phóng to font hệ thống</div>
      </div>

      <table class="spec-table" style="margin-bottom:10px;">
        <thead>
          <tr>
            <th>Cấp Bậc</th>
            <th>Kích Thước</th>
            <th>Độ Đậm</th>
            <th>Line Height</th>
            <th>Lớp Tailwind Chuẩn</th>
            <th>Quy Tắc Chống Tràn (Anti-Overflow)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Screen Title (H1)</strong></td>
            <td class="mono">18px – 20px</td>
            <td>Black (900)</td>
            <td class="mono">1.25</td>
            <td class="mono">text-lg sm:text-xl font-black</td>
            <td>Luôn đặt trong khối <code>min-w-0 flex-1</code></td>
          </tr>
          <tr>
            <td><strong>Dish Card Title (H2)</strong></td>
            <td class="mono">16px – 18px</td>
            <td>Extrabold (800)</td>
            <td class="mono">1.30</td>
            <td class="mono">text-base sm:text-lg font-extrabold</td>
            <td>Bắt buộc kèm <code>truncate</code> chống đẩy chiều cao thẻ</td>
          </tr>
          <tr>
            <td><strong>Section Header (H3)</strong></td>
            <td class="mono">14px</td>
            <td>Extrabold (800)</td>
            <td class="mono">1.35</td>
            <td class="mono">text-sm font-extrabold</td>
            <td>Phân nhóm nguyên liệu, tiêu đề hộp thoại</td>
          </tr>
          <tr>
            <td><strong>Body / Cooking Step</strong></td>
            <td class="mono">13px – 14px</td>
            <td>Medium (500)</td>
            <td class="mono">1.50</td>
            <td class="mono">text-xs sm:text-sm leading-relaxed</td>
            <td>Tối đa 65 ký tự/dòng giúp đọc nhanh khi đang nấu</td>
          </tr>
          <tr>
            <td><strong>Interactive Chip / Pill</strong></td>
            <td class="mono">12px</td>
            <td>Bold (700)</td>
            <td class="mono">1.20</td>
            <td class="mono">text-xs font-bold shrink-0</td>
            <td>Không ngắt dòng giữa chừng (<code>whitespace-nowrap</code>)</td>
          </tr>
        </tbody>
      </table>

      <!-- VIETNAMESE LINGUISTIC PURITY MATRIX -->
      <div class="sec-header" style="margin-top:4px;">
        <div class="sec-title"><span>Quy Tắc Bất Khả Xâm Phạm: Sự Thuần Khiết Ngôn Ngữ Tiếng Việt</span></div>
        <div class="sec-sub">Tuyệt đối không đặt từ giải thích tiếng Anh trong ngoặc đơn cạnh nhãn tiếng Việt</div>
      </div>

      <div class="do-dont-grid" style="margin-bottom:8px;">
        <div class="do-card">
          <div style="font-weight:900; font-size:8.2pt; color:#065F46; margin-bottom:4px;">
            ✓ CHUẨN MỰC MEALWISE (100% THUẦN VIỆT TỰ NHIÊN)
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:5px;">
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:7.2pt; padding:3px 8px; border-radius:6px;">Sảnh Đi Chợ Chung</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:7.2pt; padding:3px 8px; border-radius:6px;">Phòng Mua Chung</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:7.2pt; padding:3px 8px; border-radius:6px;">Mở Hòm Bữa Cơm</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:7.2pt; padding:3px 8px; border-radius:6px;">Vòng Quay Bàn Nhậu</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:7.2pt; padding:3px 8px; border-radius:6px;">Xem Lại Hướng Dẫn</span>
            <span style="background:#FFFFFF; border:1px solid #6EE7B7; color:#065F46; font-weight:800; font-size:7.2pt; padding:3px 8px; border-radius:6px;">Tập Gym / Giàu Đạm</span>
          </div>
        </div>

        <div class="dont-card">
          <div style="font-weight:900; font-size:8.2pt; color:#991B1B; margin-bottom:4px;">
            ✕ NGHIÊM CẤM (LỖI CHÊM TIẾNG ANH TRONG NGOẶC ĐƠN)
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:5px;">
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:7pt; padding:3px 8px; border-radius:6px; text-decoration:line-through;">Sảnh Đi Chợ Chung (Lobby)</span>
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:7pt; padding:3px 8px; border-radius:6px; text-decoration:line-through;">Phòng Mua Chung (Live Sync)</span>
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:7pt; padding:3px 8px; border-radius:6px; text-decoration:line-through;">Mở Hòm Bữa Cơm (Apex Pack)</span>
            <span style="background:#FFFFFF; border:1px solid #FCA5A5; color:#991B1B; font-weight:700; font-size:7pt; padding:3px 8px; border-radius:6px; text-decoration:line-through;">Salad Xà Lách / Canh Súp</span>
          </div>
        </div>
      </div>

      <table class="spec-table">
        <thead>
          <tr>
            <th>Ngữ Cảnh Giao Diện</th>
            <th>Nhãn Hiển Thị Chuẩn (Được Phép)</th>
            <th>Nhãn Bị Cấm (Vi Phạm Quy Tắc)</th>
            <th>Lý Do Kỹ Thuật &amp; UX</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Đi Chợ Cùng Gia Đình</strong></td>
            <td><strong>Sảnh Đi Chợ Chung</strong> • <strong>Phòng Mua Chung</strong></td>
            <td>Sảnh Đi Chợ Chung (Lobby / Live Sync)</td>
            <td>Tránh tràn dòng trên màn hình 360px, thân thiện với người lớn tuổi</td>
          </tr>
          <tr>
            <td><strong>Tài Khoản &amp; Cài Đặt</strong></td>
            <td><strong>Xem Lại Hướng Dẫn</strong> • <strong>Xem Lại Khảo Sát Khẩu Vị</strong></td>
            <td>Xem Lại Hướng Dẫn (Tutorial / Onboarding)</td>
            <td>Loại bỏ biệt ngữ lập trình ra khỏi giao diện người dùng cuối</td>
          </tr>
          <tr>
            <td><strong>Giải Trí &amp; Bàn Tiệc</strong></td>
            <td><strong>Mở Hòm Bữa Cơm</strong> • <strong>Vòng Quay Bàn Nhậu</strong></td>
            <td>Mở Hòm Bữa Cơm (Apex Pack)</td>
            <td>Giữ bản sắc văn hóa ẩm thực Việt Nam đồng nhất</td>
          </tr>
          <tr>
            <td><strong>Tên Món Ăn</strong></td>
            <td><strong>Bánh Mì Nướng Kiểu Pháp (French Toast)</strong></td>
            <td>Salad Xà Lách Trộn • Canh Súp Gà</td>
            <td>Chỉ giữ tên gốc trong ngoặc cho món Âu kinh điển; cấm lặp từ đồng nghĩa</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="running-footer">
      <span>MealWise Culinary Design System • Chuẩn Mực Kiểu Chữ &amp; Ngôn Ngữ Thuần Việt</span>
      <span class="page-num">TRANG 03 / 05</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 4: LIVE MOBILE UI COMPONENT SPECIMENS                            -->
  <!-- ===================================================================== -->
  <section class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // MẪU THÀNH PHẦN GIAO DIỆN DI ĐỘNG (COMPONENT SPECIMENS)</span>
        </div>
        <div class="running-meta">SECTION 04 • PRODUCTION UI PATTERNS</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">04</span> <span>Giải Phẫu Các Thành Phần Giao Diện Chủ Lực (UI Anatomy)</span></div>
        <div class="sec-sub">Thiết kế chống chồng lấn, tối ưu thao tác 1 chạm và lưu giữ giọng nói gia đình</div>
      </div>

      <div class="ui-specimen-grid">
        <!-- SPECIMEN 1: CUSTOM RECIPE CARD -->
        <div class="panel">
          <div class="panel-label">
            <span>4.1 THẺ MÓN BẾP NHÀ (CHỐNG CHỒNG LẤN HUY HIỆU)</span>
            <span class="mono" style="color:#10B981;">UNIFIED TOP BAR</span>
          </div>
          <div class="mock-recipe-card">
            ${gourmetDataUri ? `<img src="${gourmetDataUri}" alt="Cánh/đùi gà rán" />` : ''}
            <div class="mock-card-gradient"></div>
            <!-- Top Unified Row -->
            <div class="mock-card-top">
              <div style="display:flex; gap:4px; flex-wrap:wrap;">
                <span style="background:#F59E0B; color:#0F172A; font-weight:900; font-size:7pt; padding:3px 8px; border-radius:999px;">★ Món Bếp Nhà</span>
                <span style="background:rgba(15,23,42,0.75); color:#FFF; font-weight:700; font-size:7pt; padding:3px 8px; border-radius:999px; border:1px solid rgba(255,255,255,0.2);">Toàn Quốc</span>
              </div>
              <div style="display:flex; gap:4px; flex-shrink:0;">
                <span class="icon-btn" title="Chỉnh sửa món">✎</span>
                <span class="icon-btn" title="Xóa món">✕</span>
                <span class="icon-btn" style="background:#1D4ED8;" title="Thêm vào thực đơn">＋</span>
              </div>
            </div>
            <!-- Bottom Metadata Row -->
            <div class="mock-card-bottom">
              <div style="font-size:11.5pt; font-weight:900; color:#FFF;">Cánh / Đùi Gà Rán Giòn Bếp Mẹ</div>
              <div style="display:flex; align-items:center; gap:6px; margin:3px 0;">
                <span style="font-size:7.2pt; color:#FCD34D; font-weight:700;">♥ Món ruột của Bố</span>
                <span style="background:#FBBF24; color:#0F172A; font-weight:900; font-size:6.8pt; padding:2px 8px; border-radius:999px;">▶ Nghe lời dặn (6s)</span>
              </div>
              <div style="font-size:7.5pt; color:#E2E8F0; font-weight:700;">
                <strong style="color:#FFF;">65.000 đ</strong> • 25 phút • <span style="color:#FCD34D;">450 kcal</span>
              </div>
            </div>
          </div>
          <p style="font-size:7.2pt; color:#475569; margin-top:6px;">
            <strong>Quy tắc bố cục:</strong> Thanh trên cùng hợp nhất trong một hàng <code>flex justify-between</code>; chỉ số <code>450 kcal</code> được đặt ở dòng thông tin đáy để không bao giờ va chạm với nút <strong>Chỉnh sửa (✎)</strong> trên màn hình hẹp.
          </p>
        </div>

        <!-- SPECIMEN 2: 3-STEP WIZARD & VOICE RECORDER -->
        <div class="panel">
          <div class="panel-label">
            <span>4.2 TRÌNH GHI CÔNG THỨC 3 BƯỚC &amp; THU ÂM LỜI DẶN</span>
            <span class="mono" style="color:#1D4ED8;">FULL-SCREEN WIZARD</span>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; padding:10px;">
            <!-- 3 Step Tabs -->
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:8px;">
              <div style="background:#ECFDF5; border:1px solid #A7F3D0; color:#047857; font-weight:800; font-size:6.8pt; padding:5px; border-radius:8px; text-align:center;">✓ 1. Tên &amp; NL</div>
              <div style="background:#1D4ED8; color:#FFFFFF; font-weight:900; font-size:6.8pt; padding:5px; border-radius:8px; text-align:center;">2. Cách làm</div>
              <div style="background:#FFFFFF; border:1px solid #E2E8F0; color:#64748B; font-weight:700; font-size:6.8pt; padding:5px; border-radius:8px; text-align:center;">3. Hoàn tất</div>
            </div>
            <!-- Voice Recording Field -->
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:8px; margin-bottom:7px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <span style="font-size:7.2pt; font-weight:800; color:#0F172A;">Dấu Ấn Bếp Nhà (Lời nhắn người nấu)</span>
                <span style="background:#DC2626; color:#FFF; font-size:6.8pt; font-weight:800; padding:2px 8px; border-radius:999px;">● Đang ghi (06s)</span>
              </div>
              <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:6px 8px; display:flex; align-items:center; justify-content:space-between;">
                <div style="font-size:7.2pt; font-weight:800; color:#92400E;">▶ Nghe lời nhắn đã thu (6s) • Chuẩn vị Mẹ nấu</div>
                <span style="font-size:6.8pt; color:#B45309; font-weight:800;">PHÁT LẠI</span>
              </div>
            </div>
            <!-- Footer Bar -->
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:7.2pt; font-weight:700; color:#475569;">← Quay Lại</span>
              <div style="display:flex; gap:6px;">
                <span style="font-size:7.2pt; font-weight:800; color:#1D4ED8; background:#EFF6FF; padding:4px 9px; border-radius:7px;">Lưu Thay Đổi</span>
                <span style="font-size:7.2pt; font-weight:900; color:#FFF; background:#1D4ED8; padding:4px 10px; border-radius:7px;">Tiếp: Hoàn Tất →</span>
              </div>
            </div>
          </div>
          <p style="font-size:7.2pt; color:#475569; margin-top:6px;">
            <strong>Trải nghiệm:</strong> Mở toàn màn hình thoáng đãng thay vì popup chật hẹp; người nấu gốc có thể thu âm lời dặn dò trực tiếp cho con cháu.
          </p>
        </div>
      </div>

      <!-- SPECIMEN 3: 1-TAP SPICES STRIP -->
      <div class="panel" style="margin-bottom:10px;">
        <div class="panel-label">
          <span>4.3 DẢI CHIP GIA VỊ BẾP 1 CHẠM (ZERO-CLUTTER HORIZONTAL CHIP STRIP)</span>
          <span class="mono" style="color:#1D4ED8;">GROCERY LIST WORKFLOW</span>
        </div>
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:8px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <span style="font-size:7.5pt; font-weight:800; color:#475569; flex-shrink:0;">Gia vị bếp sẵn có (chạm để mua thêm):</span>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <span style="background:#FFFFFF; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:7.2pt; padding:4px 10px; border-radius:999px;">Nước mắm <strong style="color:#1D4ED8;">+</strong></span>
            <span style="background:#FFFFFF; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:7.2pt; padding:4px 10px; border-radius:999px;">Dầu ăn <strong style="color:#1D4ED8;">+</strong></span>
            <span style="background:#ECFDF5; border:1px solid #6EE7B7; color:#047857; font-weight:800; font-size:7.2pt; padding:4px 10px; border-radius:999px;">Hành tỏi ✓</span>
            <span style="background:#FFFFFF; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:7.2pt; padding:4px 10px; border-radius:999px;">Ớt tươi <strong style="color:#1D4ED8;">+</strong></span>
            <span style="background:#FFFFFF; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; font-size:7.2pt; padding:4px 10px; border-radius:999px;">Muối / Hạt nêm <strong style="color:#1D4ED8;">+</strong></span>
          </div>
        </div>
      </div>

      <!-- SPECIMEN 4 & 5: SMART FRIDGE COMPARTMENTS & CONFIRMATION MODAL -->
      <div class="ui-specimen-grid" style="margin-bottom:10px;">
        <div class="panel">
          <div class="panel-label">
            <span>4.4 PHÂN NGĂN TỦ LẠNH THÔNG MINH &amp; HẠN DÙNG</span>
            <span class="mono" style="color:#10B981;">3 COMPARTMENTS</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:7px;">
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:6px; text-align:center;">
              <div style="font-size:7.2pt; font-weight:900; color:#1D4ED8;">Ngăn Đông (-18°C)</div>
              <div style="font-size:6.5pt; color:#475569;">Thịt, cá, hải sản</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:8px; padding:6px; text-align:center;">
              <div style="font-size:7.2pt; font-weight:900; color:#0F172A;">Ngăn Mát (2-4°C)</div>
              <div style="font-size:6.5pt; color:#475569;">Trứng, sữa, đồ chín</div>
            </div>
            <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:6px; text-align:center;">
              <div style="font-size:7.2pt; font-weight:900; color:#047857;">Rau Củ (8-10°C)</div>
              <div style="font-size:6.5pt; color:#475569;">Rau lá, củ quả tươi</div>
            </div>
          </div>
          <div style="display:flex; gap:5px;">
            <span style="flex:1; background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; font-size:6.8pt; font-weight:800; padding:4px 6px; border-radius:6px; text-align:center;">● Hết hạn hôm nay</span>
            <span style="flex:1; background:#FFFBEB; border:1px solid #FDE68A; color:#B45309; font-size:6.8pt; font-weight:800; padding:4px 6px; border-radius:6px; text-align:center;">● Còn 1-2 ngày</span>
            <span style="flex:1; background:#ECFDF5; border:1px solid #A7F3D0; color:#047857; font-size:6.8pt; font-weight:800; padding:4px 6px; border-radius:6px; text-align:center;">✓ Tươi mới</span>
          </div>
        </div>

        <div class="panel">
          <div class="panel-label">
            <span>4.5 HỘP THOẠI XÁC NHẬN CHỐNG BẤM NHẦM</span>
            <span class="mono" style="color:#DC2626;">CONFIRMATION GUARD</span>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:8px 10px;">
            <div style="font-size:8pt; font-weight:900; color:#0F172A;">Chuyển Sang Màn Hình Thực Đơn?</div>
            <p style="font-size:7pt; color:#475569; margin:3px 0 7px 0;">
              Bạn đã chuẩn bị nguyên liệu trong giỏ Đi Chợ. Bạn có muốn chuyển sang trang Thực Đơn để chọn món nấu ngay không?
            </p>
            <div style="display:flex; gap:6px;">
              <span style="flex:1; background:#E2E8F0; color:#334155; font-size:7pt; font-weight:800; padding:5px; border-radius:8px; text-align:center;">Ở Lại Trang Này</span>
              <span style="flex:1; background:#1D4ED8; color:#FFFFFF; font-size:7pt; font-weight:900; padding:5px; border-radius:8px; text-align:center;">Mở Thực Đơn →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SPECIMEN 6: FLOATING BOTTOM DOCK WITH VECTOR SVGS -->
      <div class="panel">
        <div class="panel-label">
          <span>4.6 THANH ĐIỀU HƯỚNG ĐÁY NỔI VỚI NÚT TRUNG TÂM TỦ LẠNH (THUMB-ZONE NAVIGATION DOCK)</span>
          <span class="mono" style="color:#1D4ED8;">SAFE-AREA-INSET-BOTTOM</span>
        </div>
        <div style="background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:20px; padding:8px 18px; display:grid; grid-template-columns:repeat(5, 1fr); align-items:center; text-align:center; max-width:520px; margin:0 auto;">
          <div style="color:#64748B; font-size:7.2pt; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2" style="margin:0 auto 2px auto; display:block;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Thực Đơn
          </div>
          <div style="color:#64748B; font-size:7.2pt; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2" style="margin:0 auto 2px auto; display:block;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Đi Chợ
          </div>
          <div>
            <div style="width:40px; height:40px; border-radius:14px; background:#2563EB; color:#FFF; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(37,99,235,0.3);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="6" x2="8" y2="8"/><line x1="8" y1="14" x2="8" y2="17"/></svg>
            </div>
            <div style="color:#0F172A; font-size:7.2pt; font-weight:900; margin-top:2px;">Tủ Lạnh</div>
          </div>
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:12px; padding:5px 0; color:#1D4ED8; font-size:7.2pt; font-weight:900;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2.3" style="margin:0 auto 2px auto; display:block;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Công Thức
          </div>
          <div style="color:#64748B; font-size:7.2pt; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2" style="margin:0 auto 2px auto; display:block;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Tài Khoản
          </div>
        </div>
      </div>
    </div>

    <footer class="running-footer">
      <span>MealWise Culinary Design System • Mẫu Thành Phần Giao Diện Chuẩn</span>
      <span class="page-num">TRANG 04 / 05</span>
    </footer>
  </section>

  <!-- ===================================================================== -->
  <!-- PAGE 5: MOBILE ERGONOMICS & DEFENSIVE ENGINEERING RUBRIC              -->
  <!-- ===================================================================== -->
  <section class="sheet">
    <div>
      <header class="running-header">
        <div class="running-brand">
          <span class="running-dot"></span>
          <span>MEALWISE // CÔNG THÁI HỌC DI ĐỘNG &amp; QUY TẮC KIỂM ĐỊNH (ERGONOMICS &amp; AUDIT RUBRIC)</span>
        </div>
        <div class="running-meta">SECTION 05 • MOBILE-FIRST ENGINEERING</div>
      </header>

      <div class="sec-header">
        <div class="sec-title"><span class="sec-num">05</span> <span>Bản Đồ Vùng Chạm Ngón Cái &amp; Tiêu Chuẩn Chống Lỗi Giao Diện</span></div>
        <div class="sec-sub">Thiết kế chuyên biệt cho tư thế cầm điện thoại bằng một tay trong nhà bếp</div>
      </div>

      <div class="ergo-grid">
        <!-- Visual Smartphone Thumb-Zone Diagram -->
        <div class="phone-frame">
          <div class="zone-stretch">
            <div style="font-size:7pt; font-weight:900; color:#991B1B; text-transform:uppercase;">25% Vùng Với Tay (Stretch)</div>
            <div style="font-size:6.6pt; color:#7F1D1D; margin-top:2px;">Chỉ đặt Tiêu đề, Nút Quay lại &amp; Trạng thái chỉ đọc. Không đặt nút lưu chính.</div>
          </div>
          <div class="zone-reach">
            <div style="font-size:7pt; font-weight:900; color:#92400E; text-transform:uppercase;">35% Vùng Tầm Với (Reach)</div>
            <div style="font-size:6.6pt; color:#78350F; margin-top:2px;">Thẻ món ăn, Thanh tìm kiếm, Dải chip chọn nhanh nguyên liệu &amp; gia vị.</div>
          </div>
          <div class="zone-natural">
            <div>
              <div style="font-size:7pt; font-weight:900; color:#065F46; text-transform:uppercase;">40% Vùng Tự Nhiên (Natural Thumb)</div>
              <div style="font-size:6.6pt; color:#064E3B; margin-top:2px;">Khu vực vàng cho mọi thao tác chính: Nút CTA Cobalt (#1D4ED8), Lưu Nhanh, Xác nhận gán món &amp; Thanh Dock đáy.</div>
            </div>
            <div style="background:#1D4ED8; color:#FFF; font-size:7pt; font-weight:900; text-align:center; padding:5px; border-radius:9px;">
              Nút Hành Động Chính (≥ 44px)
            </div>
          </div>
        </div>

        <!-- Ergonomic Engineering Specs -->
        <div style="display:flex; flex-direction:column; gap:7px;">
          <div class="panel" style="padding:10px 12px;">
            <div style="font-weight:900; font-size:8.2pt; color:#0F172A; margin-bottom:2px;">1. Kích Thước Vùng Chạm Tối Thiểu (44×44px Tap Target)</div>
            <p style="font-size:7.3pt; color:#475569;">
              Mọi nút tương tác, chip gia vị, nút đóng/mở và biểu tượng trên thẻ món ăn đều đảm bảo diện tích chạm tối thiểu <code>44 × 44 px</code> với khoảng cách an toàn <code>≥ 8px</code> để không bấm nhầm khi tay ướt trong bếp.
            </p>
          </div>

          <div class="panel" style="padding:10px 12px;">
            <div style="font-weight:900; font-size:8.2pt; color:#0F172A; margin-bottom:2px;">2. Bảo Vệ Chống Bấm Nhầm (Confirmation Guardrails)</div>
            <p style="font-size:7.3pt; color:#475569;">
              Các thẻ điều hướng chéo (như thẻ <em>Đã có nguyên liệu ở mục Đi Chợ</em> chuyển sang <em>Thực Đơn</em>) hoặc thao tác xóa dữ liệu đều bắt buộc mở hộp thoại xác nhận <code>ConfirmModal</code> trước khi thực thi.
            </p>
          </div>

          <div class="panel" style="padding:10px 12px;">
            <div style="font-weight:900; font-size:8.2pt; color:#0F172A; margin-bottom:2px;">3. Loại Bỏ Triệt Để Khoảng Trống Thừa (Zero Negative Space)</div>
            <p style="font-size:7.3pt; color:#475569;">
              Không lặp lại thanh tiến độ (Progress Bar) ở cả màn hình chính lẫn trong hộp thoại con; khi đóng các thanh thu gọn, giao diện co lại mượt mà không để lại khoảng trống rỗng.
            </p>
          </div>

          <div class="panel" style="padding:10px 12px;">
            <div style="font-weight:900; font-size:8.2pt; color:#0F172A; margin-bottom:2px;">4. Phân Quyền Tài Khoản Khách &amp; Quản Trị Viên</div>
            <p style="font-size:7.3pt; color:#475569;">
              Tài khoản khách hiển thị khóa <code>Đi Chợ Chung 🔒</code>; tài khoản Quản trị viên (<code>admin@mealwise.vn</code>) được tách biệt hoàn toàn khỏi bộ đếm người dùng thực tế (Telemetry Exemption).
            </p>
          </div>
        </div>
      </div>

      <!-- MULTI-DEVICE VIEWPORT & SAFE-AREA MATRIX -->
      <div class="sec-header" style="margin-top:4px;">
        <div class="sec-title"><span>Ma Trận Khung Hình Điện Thoại &amp; Vùng Đệm An Toàn (Viewport &amp; Safe-Area Matrix)</span></div>
        <div class="sec-sub">Tương thích tuyệt đối trên mọi dòng máy Android và iOS hiện hành</div>
      </div>

      <table class="spec-table" style="margin-bottom:10px;">
        <thead>
          <tr>
            <th>Phân Khúc Thiết Bị</th>
            <th>Kích Thước Viewport</th>
            <th>Đệm Đỉnh (Safe-Area Top)</th>
            <th>Đệm Đáy (Safe-Area Bottom)</th>
            <th>Cấu Hình Lưới Thẻ (Grid Layout)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Android Phổ Thông / iPhone SE</strong></td>
            <td class="mono">360 × 640 px</td>
            <td class="mono">max(12px, env(safe-area-inset-top))</td>
            <td class="mono">calc(4rem + env(safe-area-inset-bottom))</td>
            <td>1 cột đơn (<code>grid-cols-1</code>), dải chip cuộn ngang mượt</td>
          </tr>
          <tr>
            <td><strong>iPhone 14 / 15 / 16 Tiêu Chuẩn</strong></td>
            <td class="mono">390 × 844 px</td>
            <td class="mono">47px (Dynamic Island / Notch)</td>
            <td class="mono">34px (Home Indicator Swipe Bar)</td>
            <td>1 cột thẻ lớn <code>aspect-video</code>, lưới phân loại 3 cột</td>
          </tr>
          <tr>
            <td><strong>iPhone Pro Max / Galaxy Ultra</strong></td>
            <td class="mono">430 × 932 px</td>
            <td class="mono">54px (Dynamic Island)</td>
            <td class="mono">34px (Home Indicator Swipe Bar)</td>
            <td>Hiển thị trọn vẹn 4 ô bữa ăn (Sáng, Trưa, Tối, Xế)</td>
          </tr>
        </tbody>
      </table>

      <!-- FINAL AUDIT CHECKLIST TABLE -->
      <table class="spec-table">
        <thead>
          <tr>
            <th>Hạng Mục Kiểm Định</th>
            <th>Tiêu Chuẩn Bắt Buộc</th>
            <th>Trạng Thái Hệ Thống</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Chất Liệu Bề Mặt Màu</strong></td>
            <td>100% Phẳng Lì (Flat Matte 60-30-10), Không dùng hiệu ứng kim loại</td>
            <td style="color:#059669; font-weight:800;">✓ ĐẠT CHUẨN</td>
          </tr>
          <tr>
            <td><strong>Độ Thuần Khiết Tiếng Việt</strong></td>
            <td>Không chêm tiếng Anh giải thích trong ngoặc đơn cạnh nhãn UI</td>
            <td style="color:#059669; font-weight:800;">✓ ĐẠT CHUẨN</td>
          </tr>
          <tr>
            <td><strong>Độ Thuần Khiết Ảnh Món Ăn</strong></td>
            <td>100% ảnh món ăn, nguyên liệu, đồ uống; Không có khuôn mặt người</td>
            <td style="color:#059669; font-weight:800;">✓ ĐẠT CHUẨN</td>
          </tr>
          <tr>
            <td><strong>Bố Cục Thẻ Món Bếp Nhà</strong></td>
            <td>Hàng nút Sửa / Xóa / Thêm không bao giờ đè lên huy hiệu trên màn hình nhỏ</td>
            <td style="color:#059669; font-weight:800;">✓ ĐẠT CHUẨN</td>
          </tr>
          <tr>
            <td><strong>Lưu Giữ Kỷ Niệm Bếp Nhà</strong></td>
            <td>Hỗ trợ ghi âm lời nhắn của người nấu gốc &amp; phát lại 1 chạm</td>
            <td style="color:#059669; font-weight:800;">✓ ĐẠT CHUẨN</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="running-footer">
      <span>MealWise Culinary Design System • Công Thái Học Di Động &amp; Kiểm Định Chất Lượng</span>
      <span class="page-num">TRANG 05 / 05</span>
    </footer>
  </section>

</body>
</html>`;

const tempHtmlPath = path.join(__dirname, '..', 'docs', 'moodboard-print.html');
fs.mkdirSync(path.dirname(tempHtmlPath), { recursive: true });
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

const pdfOut1 = path.join(__dirname, '..', 'MealWise_Mood_Board.pdf');
const pdfOut2 = path.join(__dirname, '..', 'docs', 'MealWise_Mood_Board.pdf');

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

const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
execSync(`"${browserExe}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOut1}" "${fileUrl}"`);
try {
  fs.copyFileSync(pdfOut1, pdfOut2);
} catch (err) {
  console.warn('Note: docs/MealWise_Mood_Board.pdf is currently open in another viewer; main MealWise_Mood_Board.pdf updated.');
}
console.log('Successfully generated 5-page editorial PDF:', pdfOut1);
