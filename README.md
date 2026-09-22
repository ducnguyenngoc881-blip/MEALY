# MealWise • Mâm Cơm Việt (Smart Meal & Nutrition Platform)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Exia9526/Daily-meal)
[![Tests](https://img.shields.io/badge/tests-294%2F294%20passed%20(100%25)-emerald)](https://github.com/Exia9526/Daily-meal)
[![TypeScript](https://img.shields.io/badge/typescript-strict%200%20errors-blue)](https://github.com/Exia9526/Daily-meal)
[![Vite](https://img.shields.io/badge/vite-v5.4-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-v3.4-38bdf8)](https://tailwindcss.com/)

> **MealWise – Mâm Cơm Việt** là nền tảng ứng dụng công nghệ thông minh hỗ trợ toàn diện chu trình ẩm thực gia đình: Tự động hóa gợi ý thực đơn tuần chuẩn vị 3 miền (Bắc - Trung - Nam), giải bài toán trần ngân sách Knapsack 1-click, quản trị tủ lạnh thông minh chống lãng phí (Zero-Waste Fridge), đồng bộ danh sách đi chợ thời gian thực (Collaborative Grocery), hoạch định cỗ tiệc gia đình (Catering Planner) và trải nghiệm minigame tương tác bàn ăn (Gamification).

---

## 🚀 Live Demo & Bản Build Trực Tuyến

* **Repository:** [https://github.com/Exia9526/Daily-meal](https://github.com/Exia9526/Daily-meal)
* **Production Web Build:** Thư mục [`docs/`](./docs) chứa toàn bộ bản build sản phẩm mới nhất, sẵn sàng chạy ngay trên trình duyệt hoặc kích hoạt qua GitHub Pages.
* **Tài liệu Báo cáo & Chiến lược đính kèm:**
  * [`MealWise_Bao_Cao_Giai_Phap_Toan_Dien.docx`](./MealWise_Bao_Cao_Giai_Phap_Toan_Dien.docx) (Báo cáo giải pháp toàn diện & SWOT Analysis)
  * [`MealWise_Chien_Luoc_Kinh_Doanh_Va_Phat_Trien.docx`](./MealWise_Chien_Luoc_Kinh_Doanh_Va_Phat_Trien.docx) (Chiến lược kinh doanh & Lộ trình hợp tác Delivery cột mốc 10.000 users)

---

## 🌟 Tính Năng Cốt Lõi (Key Features)

1. **Khám Phá Mâm Cơm 3 Món Chuẩn Vị Việt:**
   * Cấu trúc 3 trụ cột ẩm thực truyền thống: **Món Mặn + Món Canh + Rau Xào/Luộc** kèm nước chấm đặc trưng.
   * Lọc chuẩn vị vùng miền: Miền Bắc, Miền Trung, Miền Nam, Toàn Quốc và Mâm Chay Thanh Tịnh.
   * Chế độ đơn/gia đình (1 người, 2 người, 4 người, 6+ người), Gym giàu Protein, Eat Clean thanh nhẹ.

2. **Lập Thực Đơn Cả Tuần 1-Click (Thuật toán Knapsack Stochastic):**
   * Tối ưu hóa toán học cân bằng 3 biến số: Trần ngân sách nghiêm ngặt (Tiết kiệm 60k, Vừa phải 95k, Thoải mái 140k/người), dinh dưỡng cân bằng và khẩu vị không trùng lặp.
   * Đổi mới tuần hoàn ngẫu nhiên trên mỗi lần bấm (*dynamic rotation*).

3. **Khóa Chuẩn Danh Mục Món & Gợi Ý Vừa Vặn Ví:**
   * **Bữa Sáng:** Khóa 100% món ăn sáng (`an-sang`: Phở, Bún bò, Bánh mì, Xôi...).
   * **Bữa Trưa & Tối:** Hiển thị mâm cơm 3 món hoặc món chính trưa/tối.
   * **Xế / Tráng Miệng:** Khóa món tráng miệng (`trang-mieng`: Chè bưởi, Sâm bổ lượng, Sữa chua, Trái cây dĩa...).
   * **Gợi ý khi còn dư ngân sách:** Tự động đề xuất các món xế vừa vặn với số tiền còn dư trong ngày kèm thẻ chọn nhanh 1 chạm. Không bao giờ hiển thị màn hình trống.

4. **Tủ Lạnh Thông Minh & Giải Cứu Đồ Thừa (Zero Waste Fridge):**
   * Quản lý hạn sử dụng trực quan với 3 cấp cảnh báo (Tươi mới / Sắp hết hạn trong 48h / Cần dùng ngay).
   * Tự động quét thực phẩm có sẵn trong tủ để gợi ý các món ăn chế biến ngay, giảm 0% lãng phí.

5. **Danh Sách Đi Chợ Tự Động & Hợp Tác Thời Gian Thực (Collaborative Grocery):**
   * Tự động gom toàn bộ nguyên liệu của tuần, quy đổi đơn vị (kg, gam, bó, quả).
   * Phân loại theo 4 kênh mua sắm: Chợ dân sinh, WinMart, Bách Hóa Xanh, Sạp đối tác.
   * Đồng bộ thời gian thực đa thiết bị qua mã phòng đi chợ chung (Real-time Peer Sync).

6. **Lập Kế Hoạch Tiệc & Catering (Party Planner):**
   * Tự động tính toán định lượng cho từ 5 đến 100+ khách, cơ cấu bàn 6/8/10 người.
   * Báo giá tức thời, trích xuất báo giá qua Zalo và đẩy nguyên liệu tiệc sang danh sách đi chợ.

7. **Trải Nghiệm Tương Tác Bàn Ăn (Gamification):**
   * Mở hòm Apex Món Ngon (Apex-style Case Opening) với hiệu ứng quay ngẫu nhiên theo cấp hiếm (Common, Rare, Epic, Legendary).
   * Vòng quay Bàn Nhậu (Drinking Roulette) với luật "Cả Bàn!" và "Uống Hộ".

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### Yêu Cầu Môi Trường
* Node.js v18+ hoặc v20+ (Khuyên dùng v20 hoặc v24)
* Trình duyệt hiện đại (Chrome, Edge, Safari, Firefox)

### Cài Đặt & Chạy Dev Server
```bash
# 1. Clone repository
git clone https://github.com/Exia9526/Daily-meal.git
cd Daily-meal

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi động môi trường phát triển
npm run dev
```
Ứng dụng sẽ khả dụng tại `http://localhost:5173`.

### Biên Dịch Bản Production
```bash
npm run build
```
Thư mục `dist/` và `docs/` sẽ chứa gói mã nguồn đã được tối ưu hóa và minified hoàn chỉnh.

### Chạy Bộ Kiểm Thử Tự Động (294 Tests)
```bash
npm test
```

---

## 📂 Cấu Trúc Dự Án (Project Structure)

```
Daily-meal/
├── docs/                        # Bản build production mới nhất sẵn sàng chạy
│   ├── index.html
│   └── assets/                  # CSS & JS minified bundles
├── src/
│   ├── components/              # Các giao diện cốt lõi (WeeklyBoard, MealSetExplorer, FridgeView, v.v.)
│   ├── context/                 # State management toàn cục (MealWiseContext)
│   ├── data/                    # Cơ sở dữ liệu công thức, mâm cơm, pantry & minigames
│   ├── services/                # Dịch vụ đồng bộ realtime đi chợ & storage
│   ├── types/                   # TypeScript interfaces & types
│   └── utils/                   # Thuật toán Knapsack, chuẩn hóa tiếng Việt, tiền tệ
├── tests/                       # 294 bài test tự động (Unit, Boundary, E2E, Responsive)
├── scripts/                     # Tooling đóng gói APK, sync showcase, tạo file Word
├── MealWise_Bao_Cao_Giai_Phap_Toan_Dien.docx
├── MealWise_Chien_Luoc_Kinh_Doanh_Va_Phat_Trien.docx
└── README.md
```

---

## 📄 Bản Quyền & Giấy Phép

Phát triển bởi đội ngũ **MealWise / Exia9526** © 2026. Mọi quyền được bảo lưu.
