# MealWise — Hệ Thống Ngôn Ngữ Thiết Kế (Design Language Specification)

> **Tài Liệu Chuẩn Hóa Ngôn Ngữ Thiết Kế Giao Diện & Trải Nghiệm Người Dùng (UI/UX Design Language)**  
> **Sản phẩm**: MealWise — Ứng Dụng Quản Lý Bữa Cơm Gia Đình & Đi Chợ Thông Minh  
> **Phiên bản**: 3.2.0 • **Nền tảng mục tiêu**: Thiết bị Di động (iOS & Android)  
> **Kiến trúc thị giác**: **60-30-10 Flat Matte (Lấy cảm hứng từ bảng màu chuẩn Gundam Exia Repair III — GN-001REIII)**

---

## 1. Triết Lý Cốt Lõi (Core Design Principles)

Ngôn ngữ thiết kế của **MealWise** được xây dựng trên 4 trụ cột bất biến nhằm giải quyết bài toán sử dụng thực tế trong môi trường nhà bếp (tay ướt, ánh sáng phức tạp, cần thao tác nhanh bằng 1 ngón cái) và siêu thị/chợ truyền thống:

1. **Kiến Trúc Thị Giác 60-30-10 Phẳng Lì (60-30-10 Flat Matte)**:
   - **60% Bề mặt nền (Dominant Canvas & Surfaces)**: Trắng mát (`#F8FAFC` / `#FFFFFF`) ở chế độ sáng và Xám than buồng lái (`#12161F` / `#1A202C`) ở chế độ tối. Tuyệt đối không dùng dải màu kim loại (`linear-gradient` ánh kim) để nhường trọn vẹn sân khấu thị giác cho màu sắc tự nhiên của món ăn.
   - **30% Bản sắc thương hiệu (Brand Cobalt Identity)**: Xanh Cobalt nguyên bản (`#1D4ED8` / `#2563EB`) định vị các hành động chính (CTA), nút trung tâm `Tủ Lạnh` trên thanh điều hướng đáy, và trạng thái tab đang chọn.
   - **10% Điểm nhấn ngữ nghĩa (Semantic Accents)**: Xanh Lục Ngọc (`#10B981` — Tươi mới / Hoàn thành), Vàng Hổ Phách (`#EAB308` — Món Bếp Nhà / Lời dặn người nấu / Sắp hết hạn), Đỏ Monza (`#DC2626` — Cảnh báo hết hạn / Độ cay / Xóa).
2. **Sự Thuần Khiết Ngôn Ngữ Tiếng Việt (Bilingual Cleanliness)**:
   - Giao diện sử dụng 100% tiếng Việt tự nhiên, gần gũi với văn hóa bếp Việt.
   - **Quy tắc bất khả xâm phạm**: Tuyệt đối không đặt từ giải thích tiếng Anh trong ngoặc đơn cạnh nhãn tiếng Việt (Ví dụ: viết chuẩn `Sảnh Đi Chợ Chung`, `Phòng Mua Chung`, `Mở Hòm Bữa Cơm`, `Vòng Quay Bàn Nhậu`; nghiêm cấm viết `Sảnh Đi Chợ Chung (Lobby)` hay `Phòng Mua Chung (Live Sync)`).
3. **Sự Thuần Khiết Nhiếp Ảnh Ẩm Thực (Food Photography Purity)**:
   - 100% hình ảnh trên ứng dụng phải là ảnh chụp món ăn, nguyên liệu tươi sống hoặc thức uống hấp dẫn.
   - Nghiêm cấm sử dụng ảnh có khuôn mặt người, ảnh selfie, hoặc ảnh đồ vật phi ẩm thực.
4. **Ưu Tiên Tuyệt Đối Thiết Bị Di Động (Mobile-First Ergonomics)**:
   - Mọi luồng tương tác được thiết kế cho màn hình dọc điện thoại thông minh (`360px – 430px`), tối ưu hóa vùng chạm ngón cái (40% đáy màn hình), vùng đệm tai thỏ/thanh gạt (`safe-area-inset`), và không bao giờ để lại khoảng trống thừa (negative space) khi đóng các thanh thu gọn.

---

## 2. Hệ Thống Token Màu Sắc (Color Tokens Matrix)

### 2.1. 60% Bề Mặt Nền & Văn Bản (Surfaces, Borders & Ink)

| Token | Mã Hex | RGB | Vai Trò Trong Giao Diện | Lớp Tailwind Chuẩn | Độ Tương Phản WCAG |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `surface-canvas-light` | `#F8FAFC` | `248, 250, 252` | Nền tổng thể ứng dụng (Chế độ Sáng) | `bg-slate-50` | Nền gốc |
| `surface-card-light` | `#FFFFFF` | `255, 255, 255` | Bề mặt thẻ món ăn, khung bước nấu | `bg-white` | Nền nổi |
| `border-subtle-light` | `#E2E8F0` | `226, 232, 240` | Đường viền mảnh phân tách thẻ (1px) | `border-slate-200` | Cấu trúc |
| `ink-primary-light` | `#0F172A` | `15, 23, 42` | Tiêu đề màn hình, tên món ăn, giá tiền | `text-slate-900` | **15.8:1 (AAA)** |
| `ink-secondary-light` | `#475569` | `71, 85, 105` | Mô tả công thức, định lượng nguyên liệu | `text-slate-600` | **7.4:1 (AAA)** |
| `ink-muted-light` | `#64748B` | `100, 116, 139` | Nhãn phụ, thời gian nấu, chú thích | `text-slate-500` | **4.8:1 (AA)** |
| `surface-canvas-dark` | `#12161F` | `18, 22, 31` | Nền buồng lái tối (GN Frame Gray) | `dark:bg-[#12161F]` | Nền gốc tối |
| `surface-card-dark` | `#1A202C` | `26, 32, 44` | Bề mặt thẻ món ăn trong chế độ tối | `dark:bg-slate-900` | Nền nổi tối |
| `border-subtle-dark` | `#1E293B` | `30, 41, 59` | Viền thẻ phẳng trong chế độ tối | `dark:border-slate-800` | Cấu trúc tối |
| `ink-primary-dark` | `#F8FAFC` | `248, 250, 252` | Chữ tiêu đề chính trên nền tối | `dark:text-white` | **16.1:1 (AAA)** |

### 2.2. 30% Bản Sắc Thương Hiệu (Cobalt Brand Identity)

| Token | Mã Hex | RGB | Vai Trò Trong Giao Diện | Lớp Tailwind Chuẩn |
| :--- | :--- | :--- | :--- | :--- |
| `brand-cobalt-primary` | `#1D4ED8` | `29, 78, 216` | Nút CTA chính, Tab đang chọn, Tiến trình bước | `bg-[#1D4ED8] text-white` |
| `brand-cobalt-active` | `#2563EB` | `37, 99, 235` | Nút trung tâm `Tủ Lạnh` trên thanh Dock, trạng thái chạm | `bg-blue-600 hover:bg-blue-700` |
| `brand-sky-tint` | `#EFF6FF` | `239, 246, 255` | Nền viên thuốc lọc đang chọn, khung gợi ý thông minh | `bg-blue-50 text-[#1D4ED8] border-blue-200` |

### 2.3. 10% Điểm Nhấn Ngữ Nghĩa (Semantic Accents)

| Token | Mã Hex | Ý Nghĩa Ngữ Nghĩa | Thành Phần Áp Dụng Điển Hình |
| :--- | :--- | :--- | :--- |
| `semantic-emerald` | `#10B981` | Tươi mới • Hoàn tất • Hợp lệ | Huy hiệu `Tươi mới`, Bước đã hoàn thành (`Check`), Đã chọn nguyên liệu |
| `semantic-amber` | `#EAB308` | Gia truyền • Lời dặn • Sắp hết hạn | Huy hiệu `⭐️ Món Bếp Nhà`, Nút `🔊 Nghe lời dặn`, Cảnh báo hạn dùng 1–2 ngày |
| `semantic-monza-red` | `#DC2626` | Nhiệt lượng • Thu âm • Nguy cấp | Nút `🎙️ Đang thu âm`, Cảnh báo hết hạn hôm nay, Hộp thoại xác nhận xóa |

---

## 3. Hệ Thống Kiểu Chữ & Phân Cấp Nội Dung (Typography System)

- **Bộ Font Chính (Primary UI & Editorial)**: `'Be Vietnam Pro', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` — Tối ưu hóa hoàn hảo cho hệ thống dấu thanh tiếng Việt (không bị cắt dấu ở dòng tiêu đề đậm).
- **Bộ Font Số Liệu & Đồng Hồ Đếm Ngược**: `'JetBrains Mono', monospace` — Dùng cho bộ đếm giờ nấu ăn (`05:00`), định lượng và thống kê.

### Bảng Tỷ Lệ Chữ Chuẩn Màn Hình Di Động (Mobile Type Scale)

| Cấp Bậc (Level) | Kích Thước | Độ Đậm (Weight) | Line Height | Lớp Tailwind Chuẩn | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Screen Title** | `18px – 20px` | `900 (Black)` | `1.25` | `text-lg sm:text-xl font-black tracking-tight` | Tiêu đề đầu mỗi màn hình chính |
| **Card Title (Dish Name)** | `16px – 18px` | `800 (Extrabold)` | `1.30` | `text-base sm:text-lg font-extrabold truncate` | Tên món ăn trên thẻ ảnh và danh sách |
| **Section Header** | `14px` | `800 (Extrabold)` | `1.35` | `text-sm font-extrabold` | Tiêu đề khối chức năng, tên bữa ăn |
| **Body / Step Content** | `13px – 14px` | `500 / 600` | `1.50` | `text-xs sm:text-sm font-medium leading-relaxed` | Nội dung bước chế biến, lời dặn bếp nhà |
| **Interactive Chip / Pill** | `12px` | `700 (Bold)` | `1.20` | `text-xs font-bold` | Viên thuốc chọn gia vị, lọc danh mục, nút phụ |
| **Micro Badge / Metadata** | `10px – 11px` | `800 (Extrabold)` | `1.00` | `text-[10px] sm:text-[11px] font-black` | Huy hiệu vùng miền, calo, thời gian nấu |

---

## 4. Công Thái Học Di Động & Quy Tắc Bố Cục (Mobile Layout & Ergonomics)

### 4.1. Bản Đồ Vùng Chạm Ngón Cái (Thumb-Zone Architecture)
- **Vùng Với Tay (Top 25% Viewport)**: Chỉ đặt tiêu đề màn hình, nút `← Quay lại`, thanh tiến trình bước (`Bước 1 / 3`), và huy hiệu trạng thái chỉ đọc.
- **Vùng Tầm Với Tự Nhiên (Middle 35% Viewport)**: Danh sách thẻ món ăn, thanh tìm kiếm, dải chip chọn nhanh nguyên liệu/gia vị.
- **Vùng Thao Tác Ngón Cái Chính (Bottom 40% Viewport)**: Thanh điều hướng đáy 5 nút (`Navbar`), nút xác nhận gán thực đơn, thanh điều khiển bước (`Lưu Nhanh` / `Tiếp: Cách Làm`), và hộp thoại trượt từ đáy (`Bottom Sheet`).

### 4.2. Các Quy Tắc Bố Cục Chống Lỗi (Defensive Layout Invariants)
1. **Không Bao Giờ Chồng Lấn Huy Hiệu & Nút Thao Tác (Zero Header Collision)**:
   - Trên mọi thẻ món ăn có lớp phủ (`aspect-video`), thanh trên cùng bắt buộc dùng cấu trúc `flex items-start justify-between gap-2` (bên trái `min-w-0 flex-1` chứa huy hiệu `⭐️ Món Bếp Nhà` + Vùng miền; bên phải `shrink-0` chứa các nút `Chỉnh sửa`, `Xóa`, `Thêm vào thực đơn`). Tuyệt đối không tách thành 2 khối `absolute` độc lập gây đè lên nhau trên màn hình hẹp.
2. **Không Để Lại Khoảng Trống Âm Khi Đóng Thanh Thu Gọn (Zero Negative Space Collapse)**:
   - Mọi phần tử ẩn/hiện theo điều kiện phải được bọc ngoài `space-y-*` hoặc un-mount hoàn toàn (`{isOpen && (...)}`) để không sinh ra khoảng đệm rỗng.
3. **Thao Tác 1 Chạm Thay Thế Accordion Rườm Rà (1-Tap Chip Strip Over Clunky Accordions)**:
   - Đối với các danh sách kiểm tra nhanh như **Gia vị bếp sẵn có** (`Nước mắm`, `Dầu ăn`, `Muối`, `Tiêu`, `Hành tỏi`...), sử dụng **Dải Chip Cuộn Ngang 1 Chạm (`flex overflow-x-auto`)** giúp người dùng chạm `+` thêm ngay vào giỏ chỉ trong 1 giây mà không phải mở/đóng danh sách dọc.

---

## 5. Chuẩn Hóa Các Tổ Hợp Giao Diện Đặc Trưng (Signature UI Patterns)

### 5.1. Trình Tạo & Chỉnh Sửa Món Bếp Nhà Toàn Màn Hình 3 Bước (`Ghi Lại Món Bếp Nhà`)
Thay vì nhồi nhét toàn bộ biểu mẫu vào một hộp thoại popup chật chội, quy trình ghi lại công thức gia đình được chuẩn hóa thành **Màn Hình Chuyên Biệt 3 Bước (Dedicated Full-Screen 3-Step Wizard)**:
- **Bước 1 — Tên & Nguyên liệu**: Nhập tên món, chọn phân loại bằng lưới 6 ô chạm, và chọn nguyên liệu qua dải chip gợi ý nhanh kết hợp ô tìm kiếm thông minh. Ngay khi nhập tên món, nút **`Lưu Nhanh`** lập tức xuất hiện để người bận rộn có thể lưu ngay chỉ sau 1 bước.
- **Bước 2 — Cách làm & Ghi âm lời dặn (`🎙️ Ghi âm lời nhắn`)**:
  - Cho phép chèn nhanh các thao tác nấu phổ biến bằng 1 chạm.
  - Tích hợp **Nút Ghi Âm Lời Nhắn (`🎙️ Ghi âm lời nhắn`)** ngay tại mục *Dấu Ấn Bếp Nhà*: Người nấu gốc (Mẹ, Bà, Bố...) có thể thu âm trực tiếp lời dặn dò bằng giọng nói thật (kèm nhận diện giọng nói tiếng Việt tự động điền vào ô chữ) để con cháu hoặc người nấu sau bấm **`🔊 Nghe lời dặn`** ngay trên thẻ món ăn.
- **Bước 3 — Hoàn tất & Ảnh món**: Chọn nhanh chi phí (`40k`, `65k`, `90k`, `120k`), thời gian nấu (`15p`, `25p`, `40p`, `60p`) và ảnh đại diện món ăn.

### 5.2. Hệ Thống Hộp Thoại Xác Nhận Chống Bấm Nhầm (`ConfirmModal`)
- Mọi thao tác chuyển trang tự động từ thẻ nhắc nhở (như thẻ *Đã có nguyên liệu ở mục Đi Chợ*) hoặc thao tác xóa dữ liệu (`Xóa món khỏi sổ bếp`, `Làm mới tủ lạnh`) đều bắt buộc hiển thị hộp thoại xác nhận rõ ràng với 2 nút phân cấp thị giác (`Hủy` nền xám nhạt và `Xác Nhận` nền Cobalt `#1D4ED8` hoặc Đỏ Monza `#DC2626`).
