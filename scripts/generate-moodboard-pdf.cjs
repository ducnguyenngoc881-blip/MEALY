const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const moodboardImgPath = 'C:/Users/EXIA/.gemini/antigravity/brain/b5f1d5ef-463d-47ab-81a1-076674a77a79/mealwise_exia_moodboard_1791944946938.jpg';
const bandaiGuideImgPath = 'C:/Users/EXIA/.gemini/antigravity/brain/b5f1d5ef-463d-47ab-81a1-076674a77a79/.user_uploaded/media_1791944418825_4c2680c6.jpg';

function toDataUri(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const buf = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const moodboardDataUri = toDataUri(moodboardImgPath);
const bandaiDataUri = toDataUri(bandaiGuideImgPath);

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>MealWise — Bảng Thiết Kế Cảm Hứng & Ngôn Ngữ Thiết Kế (60-30-10 Flat Matte Mood Board)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
    @page {
      size: A4;
      margin: 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: #F8FAFC;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      font-size: 10.5pt;
    }
    .page-header {
      background: #12161F;
      color: #F8FAFC;
      padding: 24px 28px;
      border-radius: 20px;
      margin-bottom: 20px;
      border-left: 8px solid #1D4ED8;
    }
    .badge {
      display: inline-block;
      background: #1D4ED8;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 8.5pt;
      padding: 4px 12px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0 0 6px 0;
      font-size: 20pt;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .subtitle {
      margin: 0;
      color: #94A3B8;
      font-size: 9.5pt;
      font-weight: 500;
    }
    h2 {
      font-size: 13.5pt;
      font-weight: 900;
      color: #0F172A;
      margin: 22px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 2px solid #E2E8F0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      break-inside: avoid;
    }
    .img-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .img-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 12px;
      break-inside: avoid;
    }
    .img-box img {
      width: 100%;
      height: auto;
      border-radius: 12px;
      display: block;
    }
    .img-caption {
      font-size: 9pt;
      font-weight: 700;
      color: #475569;
      margin-top: 8px;
      text-align: center;
    }
    .ratio-bar {
      display: flex;
      border-radius: 14px;
      overflow: hidden;
      height: 46px;
      font-weight: 800;
      font-size: 9.5pt;
      margin: 12px 0;
      border: 1px solid #CBD5E1;
    }
    .ratio-60 {
      width: 60%;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #E2E8F0;
    }
    .ratio-30 {
      width: 30%;
      background: #1D4ED8;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ratio-10 {
      width: 10%;
      background: #EAB308;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 8px;
    }
    th, td {
      border: 1px solid #E2E8F0;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #F1F5F9;
      font-weight: 800;
      color: #0F172A;
    }
    .swatch {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 5px;
      vertical-align: middle;
      margin-right: 6px;
      border: 1px solid rgba(15, 23, 42, 0.15);
    }
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .pill {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 8.5pt;
      font-weight: 800;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="page-header">
    <div class="badge">MealWise Design System v3.2 • 60-30-10 Flat Matte</div>
    <h1>Bảng Thiết Kế Cảm Hứng &amp; Ngôn Ngữ Thiết Kế MealWise</h1>
    <p class="subtitle">Hệ Thống Giao Diện Ẩm Thực Thuần Việt Di Động (iOS &amp; Android) — Tích Hợp Bảng Màu Chuẩn Gundam Exia Repair III (GN-001REIII)</p>
  </div>

  <h2>1. Bản Vẽ Trực Quan Mood Board &amp; Bảng Màu Tham Chiếu</h2>
  <div class="img-grid">
    ${moodboardDataUri ? `
    <div class="img-box">
      <img src="${moodboardDataUri}" alt="MealWise 60-30-10 Flat Matte Mood Board" />
      <div class="img-caption">Hình 1.1: Mood Board Đồ Họa Ứng Dụng MealWise (Kiến Trúc Phẳng Lì 60-30-10 Flat Matte)</div>
    </div>` : ''}
    ${bandaiDataUri ? `
    <div class="img-box">
      <img src="${bandaiDataUri}" alt="Bandai Gundam Exia Repair III Color Guide" style="max-height: 290px; object-fit: contain; margin: 0 auto;" />
      <div class="img-caption">Hình 1.2: Tài Liệu Bảng Màu Gốc Bandai MG 1/100 Gundam Exia Repair III (GN-001REIII)</div>
    </div>` : ''}
  </div>

  <div class="page-break"></div>

  <h2>2. Triết Lý Thị Giác 60-30-10 Flat Matte</h2>
  <div class="card">
    <p style="margin-top:0;">Quy tắc phân bổ thị giác <strong>60-30-10</strong> đảm bảo ứng dụng đạt sự cân bằng thị giác tối ưu trong môi trường nhà bếp và siêu thị, tôn vinh trọn vẹn màu sắc tự nhiên của món ăn Việt:</p>
    <div class="ratio-bar">
      <div class="ratio-60">60% Nền Phẳng Lì (#F8FAFC / #12161F)</div>
      <div class="ratio-30">30% Thương Hiệu Cobalt (#1D4ED8)</div>
      <div class="ratio-10">10% Nhấn</div>
    </div>
    <ul style="margin: 8px 0 0 0; padding-left: 18px;">
      <li><strong>Không dùng hiệu ứng kim loại (Zero Metallic Gradients)</strong>: Loại bỏ hoàn toàn dải màu kim loại bóng để không tranh chấp thị giác với ảnh món ăn.</li>
      <li><strong>100% Thuần Việt &amp; Nhiếp Ảnh Ẩm Thực Thuần Khiết</strong>: Không dùng chú thích tiếng Anh trong ngoặc đơn; 100% hình ảnh là món ăn và nguyên liệu thật.</li>
    </ul>
  </div>

  <h2>3. Ma Trận Token Màu Sắc Chuẩn (Color Tokens Matrix)</h2>
  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Nhóm</th>
          <th>Tên Token</th>
          <th>Mã Màu (Hex)</th>
          <th>Vai Trò Giao Diện</th>
          <th>Tương Phản</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>60% Nền</strong></td>
          <td>Light Canvas / Card</td>
          <td><span class="swatch" style="background:#F8FAFC"></span><code>#F8FAFC</code> / <code>#FFFFFF</code></td>
          <td>Khung nền sáng &amp; Bề mặt thẻ món ăn</td>
          <td>Chuẩn gốc</td>
        </tr>
        <tr>
          <td><strong>60% Nền Tối</strong></td>
          <td>Dark GN Gray Cockpit</td>
          <td><span class="swatch" style="background:#12161F"></span><code>#12161F</code> / <code>#1A202C</code></td>
          <td>Khung nền buồng lái tối &amp; Bề mặt thẻ tối</td>
          <td>16.1:1 (AAA)</td>
        </tr>
        <tr>
          <td><strong>60% Văn Bản</strong></td>
          <td>Primary Ink / Muted</td>
          <td><span class="swatch" style="background:#0F172A"></span><code>#0F172A</code> / <code>#64748B</code></td>
          <td>Tiêu đề món ăn, giá tiền &amp; Nhãn thời gian nấu</td>
          <td>15.8:1 (AAA)</td>
        </tr>
        <tr>
          <td><strong>30% Thương Hiệu</strong></td>
          <td>Cobalt Primary</td>
          <td><span class="swatch" style="background:#1D4ED8"></span><code>#1D4ED8</code></td>
          <td>Nút CTA chính, Bước đang chọn, Thẻ điều hướng</td>
          <td>8.6:1 (AAA)</td>
        </tr>
        <tr>
          <td><strong>30% Tương Tác</strong></td>
          <td>Cobalt Interactive</td>
          <td><span class="swatch" style="background:#2563EB"></span><code>#2563EB</code> / <code>#EFF6FF</code></td>
          <td>Nút trung tâm Tủ Lạnh thanh Dock, Viên thuốc lọc</td>
          <td>Đạt AA+</td>
        </tr>
        <tr>
          <td><strong>10% Ngữ Nghĩa</strong></td>
          <td>Clear Emerald Green</td>
          <td><span class="swatch" style="background:#10B981"></span><code>#10B981</code></td>
          <td>Thực phẩm tươi mới, Đã chọn nguyên liệu, Hoàn tất bước</td>
          <td>Ngữ nghĩa</td>
        </tr>
        <tr>
          <td><strong>10% Ngữ Nghĩa</strong></td>
          <td>Flat Amber Yellow</td>
          <td><span class="swatch" style="background:#EAB308"></span><code>#EAB308</code></td>
          <td>Huy hiệu ⭐️ Món Bếp Nhà, Nút 🔊 Nghe lời dặn, Sắp hết hạn</td>
          <td>Ngữ nghĩa</td>
        </tr>
        <tr>
          <td><strong>10% Ngữ Nghĩa</strong></td>
          <td>Flat Monza Red</td>
          <td><span class="swatch" style="background:#DC2626"></span><code>#DC2626</code></td>
          <td>Nút 🎙️ Ghi âm lời nhắn, Cảnh báo hết hạn, Xóa món</td>
          <td>Ngữ nghĩa</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>4. Hệ Thống Kiểu Chữ &amp; Phân Cấp Nội Dung Di Động (360px – 430px)</h2>
  <div class="card">
    <p style="margin-top:0;"><strong>Bộ Font Chủ Đạo</strong>: <code>Be Vietnam Pro</code> kết hợp <code>Plus Jakarta Sans</code> và <code>JetBrains Mono</code> (cho đồng hồ hẹn giờ nấu &amp; định lượng).</p>
    <table>
      <thead>
        <tr>
          <th>Cấp Bậc</th>
          <th>Kích Thước</th>
          <th>Độ Đậm</th>
          <th>Line Height</th>
          <th>Ứng Dụng Thực Tế</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiêu Đề Màn Hình (H1)</strong></td>
          <td>18px – 20px</td>
          <td>Black (900)</td>
          <td>1.25</td>
          <td>Tiêu đề đầu trang (Sổ Tay Công Thức, Ghi Lại Món Bếp Nhà)</td>
        </tr>
        <tr>
          <td><strong>Tên Món Ăn (H2)</strong></td>
          <td>16px – 18px</td>
          <td>Extrabold (800)</td>
          <td>1.30</td>
          <td>Tên món trên thẻ ảnh, tên mâm cơm gia đình</td>
        </tr>
        <tr>
          <td><strong>Nội Dung &amp; Bước Nấu</strong></td>
          <td>13px – 14px</td>
          <td>Medium/Bold (500–700)</td>
          <td>1.50</td>
          <td>Hướng dẫn chế biến, nguyên liệu, lời nhắn người nấu</td>
        </tr>
        <tr>
          <td><strong>Huy Hiệu &amp; Chip</strong></td>
          <td>10px – 12px</td>
          <td>Black/Bold (800)</td>
          <td>1.10</td>
          <td>Huy hiệu vùng miền, calo, dải chip gia vị 1 chạm</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>5. Chuẩn Hóa Các Tổ Hợp Tương Tác Đặc Trưng (Signature Mobile Flows)</h2>
  <div class="card">
    <ul style="margin: 0; padding-left: 18px;">
      <li><strong>Trình Tạo &amp; Chỉnh Sửa Món Bếp Nhà Toàn Màn Hình 3 Bước</strong>: Tách biệt rõ ràng <em>Bước 1 (Tên &amp; Nguyên liệu)</em> → <em>Bước 2 (Cách làm &amp; Ghi âm lời dặn)</em> → <em>Bước 3 (Hoàn tất &amp; Ảnh món)</em> kèm nút <strong>Lưu Nhanh</strong> ngay từ Bước 1.</li>
      <li><strong>Ghi Âm Lời Dặn Của Người Nấu (🎙️ Ghi âm lời nhắn &amp; 🔊 Nghe lời dặn)</strong>: Cho phép người nấu gốc thu âm trực tiếp lời nhắn gửi lại cho gia đình và phát lại ngay trên thẻ món ăn hoặc trong trang chi tiết.</li>
      <li><strong>Dải Chip Gia Vị 1 Chạm (1-Tap Spices Strip)</strong>: Thay thế hoàn toàn danh sách xổ xuống rườm rà bằng thanh cuộn ngang 1 chạm tại màn hình Đi Chợ.</li>
      <li><strong>Bố Cục Thẻ Món Ăn Chống Chồng Lấn</strong>: Hợp nhất thanh huy hiệu trái và cụm nút <em>Chỉnh sửa / Xóa / Thêm</em> bên phải trong cùng một hàng <code>flex justify-between</code>, chuyển thông số <code>kcal</code> xuống thanh thông tin đáy để không bao giờ đè lên nhau trên màn hình điện thoại nhỏ.</li>
    </ul>
  </div>
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
fs.copyFileSync(pdfOut1, pdfOut2);
console.log('Successfully generated PDF:', pdfOut1);
