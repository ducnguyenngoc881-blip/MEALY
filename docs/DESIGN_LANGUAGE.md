# MealWise — Hệ Thống Ngôn Ngữ Thiết Kế & Bảng Cảm Hứng Thị Giác — Phiên Bản 4.0

> **Tài Liệu Chuẩn Hóa Ngôn Ngữ Thiết Kế Giao Diện, Hệ Thống Biểu Tượng & Trải Nghiệm Người Dùng**  
> **Sản phẩm**: MealWise — Ứng Dụng Quản Lý Bữa Cơm Gia Đình & Đi Chợ Thông Minh  
> **Phiên bản**: 4.0.0 • **Nền tảng mục tiêu**: Thiết bị Di động Android & iOS `360px – 430px`  
> **Kiến trúc thị giác**: **Phẳng Lì 60-30-10 — Lấy cảm hứng từ bảng màu kỹ thuật Gundam Exia Repair III mã hiệu GN-001REIII kết hợp Văn Hóa Mâm Cơm Việt**

---

## 1. Triết Lý Cốt Lõi

Ngôn ngữ thiết kế của **MealWise** được xây dựng trên 5 trụ cột bất biến nhằm giải quyết bài toán sử dụng thực tế trong môi trường nhà bếp khi tay ướt, ánh sáng phức tạp, cần thao tác nhanh bằng một ngón cái và tại siêu thị hoặc chợ truyền thống:

1. **Kiến Trúc Thị Giác 60-30-10 Phẳng Lì**:
   - **60% Bề mặt nền chủ đạo**: Trắng mát `#F8FAFC` / `#FFFFFF` ở chế độ sáng và Xám than buồng lái `#12161F` / `#1A202C` ở chế độ tối. Tuyệt đối không dùng dải màu kim loại lấp lánh để nhường trọn vẹn sân khấu thị giác cho màu sắc tự nhiên của món ăn.
   - **30% Bản sắc thương hiệu Cobalt**: Xanh Cobalt nguyên bản `#1D4ED8` / `#2563EB` định vị các hành động chính, nút trung tâm `Tủ Lạnh` trên thanh điều hướng đáy, và trạng thái mục đang chọn.
   - **10% Điểm nhấn ngữ nghĩa & Ẩm thực**: Xanh Lục Ngọc `#10B981` báo hiệu thực phẩm tươi mới hoặc bước nấu hoàn thành, Vàng Hổ Phách `#EAB308` tôn vinh Món Bếp Nhà, lời dặn người nấu và cảnh báo sắp hết hạn, Đỏ Nhiệt Lượng `#DC2626` báo hiệu trạng thái thu âm, cảnh báo hết hạn và thao tác xóa.
2. **Hệ Thống Bo Góc Đồng Tâm & Hình Học Đường Cong Liên Tục**:
   - Mọi thành phần giao diện tuân thủ thang độ bo góc 6 cấp `8px`, `12px`, `16px`, `20px`, `24px`, `9999px` theo công thức đồng tâm `R_ngoài = R_trong + Khoảng_đệm` giúp giao diện mềm mại, thân thiện với ngón tay và đồng bộ với đường cong liên tục của biểu tượng ứng dụng trên iOS và Android.
3. **Sự Thuần Khiết Ngôn Ngữ Tiếng Việt**:
   - Giao diện sử dụng 100% tiếng Việt tự nhiên, gần gũi với văn hóa bếp Việt.
   - **Quy tắc bất khả xâm phạm**: Tuyệt đối không đặt từ giải thích tiếng Anh trong ngoặc đơn cạnh nhãn tiếng Việt. Ví dụ: viết chuẩn `Sảnh Đi Chợ Chung`, `Phòng Mua Chung`, `Mở Hòm Bữa Cơm`, `Vòng Quay Bàn Nhậu`, `Xem Lại Hướng Dẫn`, `Xem Lại Khảo Sát Khẩu Vị`, `Tập Gym / Giàu Đạm`; nghiêm cấm viết `Sảnh Đi Chợ Chung (Lobby)` hay `Phòng Mua Chung (Live Sync)`.
4. **Sự Thuần Khiết Nhiếp Ảnh Ẩm Thực**:
   - 100% hình ảnh trên ứng dụng phải là ảnh chụp món ăn, nguyên liệu tươi sống hoặc thức uống hấp dẫn.
   - Nghiêm cấm sử dụng ảnh có khuôn mặt người, ảnh tự chụp cá nhân, hoặc ảnh đồ vật phi ẩm thực.
5. **Ưu Tiên Tuyệt Đối Thiết Bị Di Động**:
   - Mọi luồng tương tác được thiết kế cho màn hình dọc điện thoại thông minh `360px – 430px`, tối ưu hóa vùng chạm ngón cái ở 40% đáy màn hình, vùng đệm tai thỏ/thanh gạt `safe-area-inset`, và không bao giờ để lại khoảng trống thừa khi đóng các thanh thu gọn.

---

## 2. Hệ Thống Bảng Màu Toàn Diện

### 2.1. 60% Bề Mặt Nền & Văn Bản

| Mã Token | Mã Hex | Hệ Màu RGB | Hệ Màu HSL | Vai Trò Trong Giao Diện | Lớp Tailwind Chuẩn | Độ Tương Phản WCAG |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `surface-canvas-light` | `#F8FAFC` | `248, 250, 252` | `210, 40%, 98%` | Nền tổng thể ứng dụng ở chế độ sáng | `bg-[#F8FAFC]` / `bg-slate-50` | Nền gốc sáng |
| `surface-card-light` | `#FFFFFF` | `255, 255, 255` | `0, 0%, 100%` | Bề mặt thẻ món ăn, khung bước nấu | `bg-white` | Nền nổi sáng |
| `border-subtle-light` | `#E2E8F0` | `226, 232, 240` | `214, 32%, 91%` | Đường viền mảnh phân tách thẻ `1px` | `border-slate-200` | Cấu trúc sáng |
| `ink-primary-light` | `#0F172A` | `15, 23, 42` | `222, 47%, 11%` | Tiêu đề màn hình, tên món ăn, giá tiền | `text-slate-900` | **15.8:1 Chuẩn AAA** |
| `ink-body-light` | `#1E293B` | `30, 41, 59` | `217, 33%, 17%` | Văn bản nội dung chính, bước chế biến | `text-[#1E293B]` / `text-slate-800` | **12.6:1 Chuẩn AAA** |
| `ink-secondary-light` | `#475569` | `71, 85, 105` | `215, 19%, 35%` | Mô tả công thức, định lượng nguyên liệu | `text-slate-600` | **7.4:1 Chuẩn AAA** |
| `ink-muted-light` | `#64748B` | `100, 116, 139` | `215, 16%, 47%` | Nhãn phụ, thời gian nấu, chú thích | `text-slate-500` | **4.8:1 Chuẩn AA** |
| `surface-canvas-dark` | `#12161F` | `18, 22, 31` | `222, 27%, 10%` | Nền buồng lái chế độ tối | `dark:bg-[#12161F]` | Nền gốc tối |
| `surface-card-dark` | `#1A202C` | `26, 32, 44` | `218, 26%, 14%` | Bề mặt thẻ món ăn trong chế độ tối | `dark:bg-[#1A202C]` | Nền nổi tối |
| `surface-subcard-dark` | `#141824` | `20, 24, 36` | `225, 29%, 11%` | Ô dữ liệu phụ trong thẻ tối | `dark:bg-[#141824]` | Nền lồng tối |
| `border-subtle-dark` | `#2D3748` | `45, 55, 72` | `218, 23%, 23%` | Viền thẻ phẳng trong chế độ tối `1px` | `dark:border-[#2D3748]` | Cấu trúc tối |
| `ink-primary-dark` | `#F8FAFC` | `248, 250, 252` | `210, 40%, 98%` | Chữ tiêu đề chính trên nền tối | `dark:text-[#F8FAFC]` | **16.1:1 Chuẩn AAA** |
| `ink-secondary-dark` | `#94A3B8` | `148, 163, 184` | `215, 20%, 65%` | Chữ mô tả phụ trên nền tối | `dark:text-slate-400` | **7.2:1 Chuẩn AAA** |

### 2.2. 30% Bản Sắc Thương Hiệu Cobalt

| Mã Token | Mã Hex | Hệ Màu RGB | Hệ Màu HSL | Vai Trò Trong Giao Diện | Lớp Tailwind Chuẩn | Độ Tương Phản |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `brand-cobalt-primary` | `#1D4ED8` | `29, 78, 216` | `224, 76%, 48%` | Nút hành động chính, mục đang chọn, tiến trình bước | `bg-[#1D4ED8] text-white` | **8.6:1 Chuẩn AAA** |
| `brand-cobalt-active` | `#2563EB` | `37, 99, 235` | `217, 91%, 60%` | Nút trung tâm `Tủ Lạnh` trên thanh điều hướng đáy | `bg-[#2563EB] hover:bg-[#1D4ED8]` | **5.9:1 Chuẩn AA+** |
| `brand-sky-tint` | `#EFF6FF` | `239, 246, 255` | `214, 100%, 97%` | Nền viên thuốc lọc đang chọn, khung gợi ý thông minh | `bg-blue-50 text-[#1D4ED8] border-blue-200` | **8.1:1 Chuẩn AAA** |
| `brand-sky-dark-tint` | `rgba(30,58,138,0.3)` | `30, 58, 138` | `224, 64%, 33%` | Nền đệm xanh biển trong chế độ tối | `dark:bg-blue-950/40 dark:text-blue-400` | **6.4:1 Chuẩn AA+** |

### 2.3. 10% Điểm Nhấn Ngữ Nghĩa & Sắc Độ Ẩm Thực Việt

| Mã Token | Mã Hex | Hệ Màu RGB | Ý Nghĩa Ngữ Nghĩa & Ẩm Thực | Thành Phần Áp Dụng Điển Hình |
| :--- | :--- | :--- | :--- | :--- |
| `semantic-emerald` | `#10B981` | `16, 185, 129` | Tươi mới • Rau xanh • Hoàn tất | Huy hiệu `Tươi mới`, Bước đã hoàn thành `✓`, Đã chọn nguyên liệu |
| `semantic-emerald-dark` | `#059669` | `5, 150, 105` | Xanh lá hành • Đạt chuẩn dinh dưỡng | Nhãn trạng thái hoàn thành trên nền sáng `text-emerald-700` |
| `semantic-amber` | `#EAB308` | `234, 179, 8` | Gia truyền • Lời dặn • Sắp hết hạn | Huy hiệu `★ Món Bếp Nhà`, Nút `▶ Nghe lời dặn`, Cảnh báo hạn dùng 1–2 ngày |
| `semantic-amber-dark` | `#D97706` | `217, 119, 6` | Vàng nghệ kho • Nước mắm nhỉ | Nhãn chú thích lời dặn của Mẹ, chỉ số năng lượng vừa phải |
| `semantic-monza-red` | `#DC2626` | `220, 38, 38` | Nhiệt lượng • Thu âm • Nguy cấp | Nút `● Đang ghi âm`, Cảnh báo hết hạn hôm nay, Hộp thoại xác nhận xóa |
| `culinary-chili-rose` | `#E11D48` | `225, 29, 72` | Đỏ ớt hiểm • Gia vị cay nồng | Nhãn độ cay, điểm nhấn cảm xúc yêu thích `♥ Món ruột của Bố` |
| `culinary-clay-earth` | `#78350F` | `120, 53, 15` | Nâu nồi đất nung • Món kho tộ | Nhãn phân loại món kho truyền thống, viền thẻ kỷ niệm gia đình |

---

## 3. Hệ Thống Kiểu Chữ, Cách Dùng Font & Phân Cấp Nội Dung

### 3.1. Quy Tắc Sử Dụng Bộ Đôi Font Chữ

1. **`Be Vietnam Pro` — Font Giao Diện & Biên Tập Chính**:
   - **Chuỗi khai báo**: `'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
   - **Lý do kỹ thuật**: Được thiết kế chuyên biệt cho cấu trúc dấu thanh tiếng Việt kép như `ắ`, `ẵ`, `ể`, `ợ`, `ữ`. Khoảng sáng trên và dưới rộng rãi giúp chữ in đậm `800–900` không bao giờ bị cắt mất dấu hỏi hoặc dấu ngã trên màn hình điện thoại.
   - **Phân bổ 6 mức độ đậm**:
     - Mức `400` Thường & Mức `500` Vừa: Nội dung bước chế biến, mô tả nguyên liệu, ghi chú phụ.
     - Mức `600` Bán Đậm & Mức `700` Đậm: Nhãn nút bấm phụ, viên thuốc lọc danh mục, tên nguyên liệu trong giỏ đi chợ.
     - Mức `800` Rất Đậm: Tên món ăn trên thẻ bài, tiêu đề khu vực, nhãn phân loại bữa ăn.
     - Mức `900` Đậm Đặc: Tiêu đề chính đầu màn hình, con số tổng kết ngân sách, huy hiệu nổi bật.

2. **`JetBrains Mono` — Font Số Liệu, Giá Tiền & Đồng Hồ Đếm Ngược**:
   - **Chuỗi khai báo**: `'JetBrains Mono', monospace` kèm thuộc tính `font-variant-numeric: tabular-nums`
   - **Lý do kỹ thuật**: Mọi chữ số từ `0` đến `9` có độ rộng bằng nhau tuyệt đối. Khi đồng hồ đếm ngược chạy từ `00:14:59` sang `00:14:58` hoặc khi cộng dồn tiền đi chợ từ `65.000 đ` lên `125.000 đ`, khung giao diện đứng yên hoàn toàn, không bị rung giật ngang.
   - **Ngữ cảnh bắt buộc**: Đồng hồ hẹn giờ nấu, đơn giá VNĐ, định lượng gram/ml, chỉ số năng lượng `kcal` và các viên thuốc dinh dưỡng Đạm, Tinh bột, Chất béo.

### 3.2. Ma Trận Phân Cấp Chữ 7 Cấp Chuẩn Di Động

| Cấp Bậc Phân Cấp | Cỡ Chữ | Độ Đậm | Giãn Dòng | Khoảng Cách Chữ | Lớp Tailwind Chuẩn | Ngữ Cảnh Áp Dụng & Quy Tắc Chống Tràn |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cấp 01: Tiêu Đề Lớn** | `24px` / `1.50rem` | `900` Đậm Đặc | `1.20` | `-0.025em` | `text-2xl font-black tracking-tight` | Màn hình chào mừng, tổng kết thực đơn tuần |
| **Cấp 02: Đầu Màn Hình** | `18px–20px` / `1.25rem` | `900` Đậm Đặc | `1.25` | `-0.020em` | `text-lg sm:text-xl font-black tracking-tight` | Tiêu đề đầu mỗi màn hình chính `min-w-0 flex-1` |
| **Cấp 03: Tên Món Ăn** | `16px–18px` / `1.06rem` | `800` Rất Đậm | `1.30` | `-0.015em` | `text-base sm:text-lg font-extrabold truncate` | Tên món ăn trên thẻ ảnh và danh sách `truncate` |
| **Cấp 04: Tiêu Đề Khối** | `14px` / `0.875rem` | `800` Rất Đậm | `1.35` | `-0.010em` | `text-sm font-extrabold` | Tiêu đề khối chức năng, tên ngăn tủ lạnh |
| **Cấp 05: Nội Dung Bước** | `13.5px` / `0.84rem` | `500` Vừa | `1.50` | `0.000em` | `text-xs sm:text-sm font-medium leading-relaxed` | Nội dung bước chế biến, lời dặn bếp nhà tối đa 65 ký tự/dòng |
| **Cấp 06: Nhãn Viên Thuốc** | `12px` / `0.75rem` | `700` Đậm | `1.20` | `0.010em` | `text-xs font-bold whitespace-nowrap shrink-0` | Viên thuốc chọn gia vị, lọc danh mục, nút thao tác nhanh |
| **Cấp 07: Huy Hiệu Nhỏ** | `10.5px` / `0.65rem` | `800` Rất Đậm | `1.10` | `0.040em` | `text-[10px] sm:text-[11px] font-black uppercase` | Huy hiệu vùng miền, trạng thái hạn dùng, nhãn năng lượng |

---

## 4. Hệ Thống Bo Góc Đồng Tâm, Khoảng Cách, Đường Viền & Độ Nổi

### 4.1. Thang Độ Bo Góc 6 Cấp

| Mã Token | Cấp Độ Bo Góc | Bán Kính (px / rem) | Lớp Tailwind Chuẩn | Bán Kính Lồng Trong (R_trong) | Thành Phần Giao Diện Áp Dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `radius-xs` | **Cấp 01: Bo Góc Vi Mức** | `8px` / `0.50rem` | `rounded-lg` | `R_trong = 4px` • Đệm `4px` | Huy hiệu trạng thái nhỏ, ô chỉ số dinh dưỡng, nút hành động vuông `28×28px` trên thẻ món |
| `radius-sm` | **Cấp 02: Bo Góc Cơ Bản** | `12px` / `0.75rem` | `rounded-xl` | `R_trong = 4px` • Đệm `8px` | Ô nhập liệu, thanh tìm kiếm, nút bấm thứ cấp, thẻ bước nấu ăn con lồng trong thẻ `20px` |
| `radius-md` | **Cấp 03: Bo Góc Tiêu Chuẩn** | `16px` / `1.00rem` | `rounded-2xl` | `R_trong = 8px` • Đệm `8px` | Thẻ nguyên liệu tủ lạnh, ô phân ngăn nhiệt độ, nút hành động chính toàn chiều ngang |
| `radius-lg` | **Cấp 04: Thẻ Món Chủ Lực** | `20px` / `1.25rem` | `rounded-[20px]` | `R_trong = 12px` • Đệm `8px` | Thẻ ảnh món ăn lớn `aspect-video`, thanh điều hướng đáy nổi 5 nút, khối tiêu đề trang |
| `radius-xl` | **Cấp 05: Khung Trượt Đáy** | `24px` / `1.50rem` | `rounded-3xl` | `R_trong = 16px` • Đệm `8px` | Khung hộp thoại trượt từ đáy màn hình, hộp thoại xác nhận, thẻ khảo sát khẩu vị |
| `radius-pill` | **Cấp 06: Viên Thuốc Tròn** | `9999px` | `rounded-full` | `R_trong = 9999px` • Đồng dạng | Dải chip gia vị 1 chạm `Nước mắm +`, bộ lọc vùng miền, nút phát lời dặn `▶ Nghe lời dặn` |

### 4.2. Công Thức Bo Góc Đồng Tâm
Khi một thẻ con nằm bên trong một thẻ cha có khoảng đệm, bán kính bo góc phải tuân thủ phương trình hình học:
> **`R_ngoài = R_trong + Khoảng_đệm`**  
> *Ví dụ thực tế*: Thẻ món ăn có `R_ngoài = 20px` và khoảng đệm `8px` → Khung thông tin hoặc nút bấm nằm sát góc bên trong bắt buộc dùng `R_trong = 20px - 8px = 12px` tương ứng `rounded-xl`. Quy tắc này loại bỏ hoàn toàn hiện tượng phình góc thiếu chuyên nghiệp.

### 4.3. So Sánh Đường Cong Siêu Elip Squircle & Cung Tròn Chuẩn
- **Đường Cong Siêu Elip Squircle — Liên Tục Độ Cong Bậc G2**: Tuân thủ phương trình siêu elip `|x/a|^4 + |y/b|^4 = 1`. Độ cong tăng dần mượt mà từ cạnh thẳng vào đỉnh góc mà không tạo điểm gãy đột ngột tại tiếp điểm. Áp dụng cho vỏ biểu tượng ứng dụng `22.5%`, thẻ món ăn chủ lực `20px` và khung trượt đáy `24px` để đồng điệu tuyệt đối với đường bo phần cứng màn hình điện thoại.
- **Cung Tròn Chuẩn — Tiếp Tuyến Bậc G1**: Chuyển trực tiếp từ đoạn thẳng sang cung tròn bán kính cố định `R`. Áp dụng cho nút hành động nhỏ `8px`, ô nhập liệu `12px` và viên thuốc tròn đầy `9999px` nơi cần biên dạng hình học gọn sắc.

### 4.4. Hệ Thống Lưới Khoảng Cách `4px` & Độ Nổi Phẳng Lì
- **Đơn vị lưới gốc**: `4px` với dải chuẩn `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.
- **Đường viền cấu trúc**: Dùng viền mảnh `1px solid #E2E8F0` ở chế độ sáng và `1px solid #2D3748` ở chế độ tối thay cho bóng đổ dày nặng. Trạng thái đang chọn dùng viền `1.5px solid #1D4ED8`.
- **3 Cấp Độ Nổi**:
  - **Cấp 0 — Nền & Thẻ Tối**: `box-shadow: none` — Phân tách 100% bằng độ tương phản sắc độ nền `#12161F` so với `#1A202C` và viền `1px`.
  - **Cấp 1 — Thẻ Món Ăn Sáng**: `0 4px 14px -2px rgba(15, 23, 42, 0.04)` — Bóng khuếch tán cực nhẹ.
  - **Cấp 2 — Thanh Điều Hướng Đáy & Hộp Thoại**: `0 12px 28px -6px rgba(15, 23, 42, 0.12)` kết hợp kính mờ `backdrop-filter: blur(12px)`.

---

## 5. Hệ Thống Biểu Tượng Ứng Dụng & Lưới Kỹ Thuật 24×24

### 5.1. 4 Định Hướng Biểu Tượng Thương Hiệu
1. **Định Hướng 01 — Biểu Tượng Chính Thức: Mâm Cơm Đoàn Viên & Mầm Xanh Tươi Mới**:
   - Sự kết hợp giữa vòng tròn **Mâm Cơm Gia Đình Việt**, hình tượng **Bát Cơm Đầy Đặn** ở trung tâm và **Mầm Lá Xanh Ngọc `#10B981`** vươn lên từ đôi đũa vàng ấm áp `#EAB308` trên nền Xanh Cobalt `#1D4ED8`.
2. **Định Hướng 02 — Chữ Ký Hình Học 'M' Đũa Vàng & Bát Cơm**:
   - Đôi đũa gác chéo tạo thành chữ **M** đại diện cho MealWise và Mâm Cơm kết hợp đường cong đáy bát tối giản, nhận diện cực nhạy ở kích thước nhỏ `16px – 24px`.
3. **Định Hướng 03 — Khay Thực Đơn Thông Minh 60-30-10**:
   - Chia bố cục đường cong liên tục thành 3 ngăn tỷ lệ vàng 60-30-10 đại diện cho Quản lý Tủ Lạnh, Lên Thực Đơn và Đi Chợ Chung.
4. **Định Hướng 04 — Nồi Đất Nung & Ngọn Lửa Bếp Nhà**:
   - Hình tượng chiếc nồi đất kho tộ truyền thống với làn khói ấm áp, tôn vinh kho tàng công thức gia truyền của Mẹ và Bà.

### 5.2. Tiêu Chuẩn Lưới Biểu Tượng `24×24px` & Kiểm Định Đa Kích Thước
- **Lưới chuẩn hệ thống**: Khung vẽ `24 × 24 px`, vùng an toàn trực quan `20 × 20 px` với `2px` đệm mỗi cạnh, độ dày nét vẽ đồng nhất `2.0px` và `2.25px` cho trạng thái đang chọn, đầu nét bo tròn `stroke-linecap: round`, `stroke-linejoin: round`.
- **Kiểm định thu phóng & 3 nền tương phản**: Biểu tượng giữ nguyên độ sắc nét từ `1024×1024px` trên kho ứng dụng → `180×180px` trên màn hình chính iOS/Android → `60×60px` trên thông báo đẩy → `24×24px` trên thanh điều hướng → `16×16px` trên trình duyệt, đồng thời vượt qua bài kiểm tra trên cả 3 biến thể nền: **Nền Cobalt `#1D4ED8`**, **Nền Tối `#12161F`** và **Nền Sáng `#FFFFFF`**.

---

## 6. Công Thái Học Di Động & Quy Tắc Bố Cục Chống Lỗi

### 6.1. Bản Đồ Vùng Chạm Ngón Cái `360px – 430px`
- **Vùng Với Tay — 25% Trên Cùng**: Chỉ đặt tiêu đề màn hình, nút `← Quay lại`, thanh tiến trình bước `Bước 1 / 3`, và huy hiệu trạng thái chỉ đọc.
- **Vùng Tầm Với Tự Nhiên — 35% Giữa**: Danh sách thẻ món ăn, thanh tìm kiếm, dải chip chọn nhanh nguyên liệu và gia vị.
- **Vùng Thao Tác Ngón Cái Chính — 40% Đáy**: Thanh điều hướng đáy 5 nút, nút xác nhận gán thực đơn, thanh điều khiển bước `Lưu Nhanh` / `Tiếp: Cách Làm`, và hộp thoại trượt từ đáy. Mọi điểm chạm có kích thước tối thiểu `44 × 44 px`.

### 6.2. Các Tổ Hợp Giao Diện Đặc Trưng & 5 Trạng Thái Tương Tác
1. **Hệ Thống Nút Bấm & Viên Thuốc Dinh Dưỡng**: Phân cấp rõ ràng giữa Nút Hành Động Chính `#1D4ED8`, Nút Thứ Cấp Viền Mảnh `#E2E8F0`, Nút Nguy Cấp / Thu Âm `#DC2626`, cùng bộ viên thuốc dinh dưỡng `kcal`, `Đạm`, `Tinh bột`, `Chất béo` cố định độ rộng chữ số.
2. **Thẻ Món Bếp Nhà Chống Chồng Lấn**: Thanh trên cùng hợp nhất trong một hàng `flex items-start justify-between gap-2` với bên trái `min-w-0 flex-1` chứa huy hiệu `★ Món Bếp Nhà` và bên phải `shrink-0` chứa các nút `✎`, `✕`, `＋`. Chỉ số `kcal` luôn đặt ở dòng thông tin đáy.
3. **Trình Ghi Công Thức 3 Bước Toàn Màn Hình & Thu Âm Lời Dặn**: Hỗ trợ lưu nhanh ngay từ Bước 1 và tích hợp thu âm giọng nói thật của người nấu gốc ở Bước 2.
4. **5 Trạng Thái Giao Diện Bắt Buộc**: Mọi màn hình đều định nghĩa rõ 5 trạng thái: **Mặc định**, **Đang tải khung xương**, **Trống dữ liệu**, **Cảnh báo lỗi**, và **Hoàn tất thành công**.
