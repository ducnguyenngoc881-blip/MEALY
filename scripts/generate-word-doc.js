import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  ShadingType 
} from 'docx';
import fs from 'fs';
import path from 'path';

async function createMealWiseDocx() {
  const primaryColor = '059669'; // Emerald
  const darkColor = '064e3b';
  const slateDark = '1e293b';
  const slateMuted = '475569';
  const bgLight = 'F1F5F9';
  const bgEmeraldLight = 'ECFDF5';

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 24, // 12pt
            color: slateDark,
          },
          paragraph: {
            spacing: {
              line: 320, // 1.33 line spacing
              after: 140,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // TITLE / HEADER
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'BÁO CÁO PHÂN TÍCH GIẢI PHÁP & CHIẾN LƯỢC SẢN PHẨM',
                bold: true,
                size: 32, // 16pt
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'MealWise • Nền Tảng Quản Lý Dinh Dưỡng, Thực Đơn & Chi Tiêu Bữa Cơm Gia Đình Việt',
                bold: true,
                size: 26, // 13pt
                color: slateDark,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'Phiên bản: 2.0.0 | Ngày xuất bản: Tháng 09/2026 | Ngôn ngữ: Tiếng Việt (Chuyên nghiệp)',
                italics: true,
                size: 20, // 10pt
                color: slateMuted,
              }),
            ],
          }),

          // ==========================================
          // MỤC 1: TỔNG QUAN VỀ ỨNG DỤNG
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: '1. TỔNG QUAN VỀ ỨNG DỤNG (APP OVERVIEW)',
                bold: true,
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'MealWise (Mâm Cơm Việt)',
                bold: true,
              }),
              new TextRun(
                ' là một nền tảng công nghệ toàn diện (Progressive Web App, Mobile App & Portable Desktop) được thiết kế đặc thù cho văn hóa ẩm thực và lối sống gia đình Việt Nam. Ứng dụng kết hợp giữa khoa học dinh dưỡng thực chứng, thuật toán tối ưu hóa tài chính chi tiêu (Knapsack Optimization) và các cơ chế tương tác thời gian thực, nhằm mang đến giải pháp trọn vẹn từ khâu lên ý tưởng thực đơn, đi chợ, nấu nướng cho đến quản lý tủ lạnh chống lãng phí.'
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sứ mệnh cốt lõi:',
                bold: true,
              }),
              new TextRun(
                ' Hiện đại hóa mâm cơm truyền thống, giải phóng gánh nặng tinh thần cho người nội trợ, tối ưu hóa ngân sách sinh hoạt gia đình và gìn giữ văn hóa ẩm thực 3 miền chuẩn vị Việt Nam.'
              ),
            ],
          }),

          // ==========================================
          // MỤC 2: BÀI TOÁN THỰC TIỄN & GIẢI PHÁP
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: '2. BÀI TOÁN ỨNG DỤNG GIẢI QUYẾT (PROBLEM & SOLUTION)',
                bold: true,
                size: 28,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun(
                'Trong nhịp sống hiện đại tại các đô thị Việt Nam, các gia đình và cá nhân đang đối mặt với 4 "nỗi đau" (pain points) lớn thường nhật:'
              ),
            ],
          }),

          // Bảng Problem & Solution
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Nỗi Đau Thực Tiễn (Problem)', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Giải Pháp Đột Phá Của MealWise (Solution)', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '1. Áp lực "Hôm nay ăn gì?"', bold: true })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Mất từ 20-40 phút mỗi ngày để suy nghĩ thực đơn, dễ dẫn đến bữa ăn trùng lặp, nhàm chán hoặc mất cân đối dinh dưỡng.', size: 22 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '• Gợi ý 1-Click Cả Tuần (Stochastic Knapsack):', bold: true, color: darkColor })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Tự động tạo thực đơn 7 ngày với 21 bữa ăn cân đối dinh dưỡng, chuẩn vị 3 miền (Bắc - Trung - Nam), mỗi lần bấm ra một thực đơn ngẫu nhiên hoàn toàn mới.', size: 22 })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: bgLight, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '2. Lạm phát & Thủng ngân sách', bold: true })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Chi tiêu tự do tại siêu thị hoặc chợ không kiểm soát được giá thành khẩu phần, cuối tháng chi phí ăn uống đội lên cao.', size: 22 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: bgLight, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '• Trần Ngân Sách Nghiêm Ngặt (Budget Ceiling Guard):', bold: true, color: darkColor })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Cố định ngân sách theo 3 phân tầng (Tiết kiệm 60k, Vừa phải 95k, Thoải mái 140k/người/ngày) với thuật toán đảm bảo 0 ngày bị lố ngân sách.', size: 22 })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '3. Đi chợ phân mảnh & Mua thừa', bold: true })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Gia đình phân công người mua thịt, người mua rau nhưng không đồng bộ; dẫn đến mua trùng hoặc quên gia vị.', size: 22 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '• Đi Chợ Real-Time Đa Người Dùng (Live Collab):', bold: true, color: darkColor })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Tạo phòng đi chợ theo mã phòng/QR code ngắn gọn, phân biệt người nhặt qua màu sắc độc quyền (Host, Vợ, Chồng...), cập nhật tích chọn ngay lập tức qua WebSocket/Long-polling.', size: 22 })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: bgLight, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '4. Lãng phí thực phẩm & Tủ lạnh quá tải', bold: true })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Thức ăn thừa bữa trước để quên trong tủ lạnh dẫn đến ôi thiu, vứt bỏ lãng phí từ 15-20% tiền chợ mỗi tuần.', size: 22 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: bgLight, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '• Tủ Lạnh Thông Minh & Trừ Tiền Đi Chợ:', bold: true, color: darkColor })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Theo dõi hạn sử dụng nguyên liệu, gợi ý công thức tái chế thức ăn thừa (cơm nguội, thịt luộc thừa) và tự động trừ nguyên liệu sẵn có khỏi danh sách mua sắm, tiết kiệm tiền thực tế.', size: 22 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // ==========================================
          // MỤC 3: HỆ THỐNG TÍNH NĂNG CỐT LÕI
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: '3. HỆ THỐNG TÍNH NĂNG CỐT LÕI (CORE FEATURE ECOSYSTEM)',
                bold: true,
                size: 28,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.1. Khám Phá Mâm Cơm 3 Món (MealSet Explorer): ', bold: true, color: darkColor }),
              new TextRun('Kho lưu trữ hàng trăm mâm cơm chuẩn văn hóa gia đình Việt (Món Mặn - Món Canh - Món Rau/Xào). Hỗ trợ lọc theo vùng miền (Bắc, Trung, Nam, Toàn quốc), mục tiêu dinh dưỡng (Eat Clean, Gym Protein, Ăn Chay) và phân tầng ngân sách. Kéo vuốt trực quan để gán vào bất kỳ bữa trưa/tối trong tuần.'),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.2. Lập Thực Đơn Tuần Thông Minh (Weekly Board Planner): ', bold: true, color: darkColor }),
              new TextRun('Quản lý bảng ma trận 7 ngày trong tuần với bộ đếm calo, protein và chi phí khẩu phần. Tích hợp nút "Gợi Ý 1-Click Cả Tuần" ứng dụng thuật toán Knapsack ngẫu nhiên hóa; bộ điều chỉnh khẩu phần tự động co giãn từ 1 đến 20 người ăn mà không bị méo tỷ lệ công thức.'),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.3. Tủ Lạnh & Tái Chế Đồ Ăn Thừa (Smart Fridge & Leftover Hub): ', bold: true, color: darkColor }),
              new TextRun('Theo dõi ngày lưu trữ của thực phẩm, phân loại cấp thiết (Ăn gấp ≤ 2 ngày). Hệ thống thuật toán đối chiếu toàn tủ lạnh với hơn 700 công thức để đề xuất món có thể nấu ngay mà không cần đi chợ. Tính toán trực quan số tiền tiết kiệm được nhờ tận dụng đồ ăn thừa.'),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.4. Danh Sách Đi Chợ Tự Động & Hợp Tác Trực Tuyến (Live Collab Grocery): ', bold: true, color: darkColor }),
              new TextRun('Tổng hợp nguyên liệu từ thực đơn tuần, phân nhóm thông minh theo quầy hàng (Rau củ, Thịt cá, Gia vị). Mô phỏng giá tiền theo 4 kênh mua hàng (Chợ Dân Sinh, Siêu Thị Lớn, Cửa Hàng Tiện Lợi, Mua Online). Tính năng đi chợ cùng nhau thời gian thực với đường link siêu ngắn, mã QR và bảng màu nhận diện người nhặt hàng.'),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.5. Kế Hoạch Tiệc & Đặt Bàn (Catering & Banquet Planner): ', bold: true, color: darkColor }),
              new TextRun('Dành cho các buổi giỗ, liên hoan, tiệc công ty từ 5 đến 150+ khách. Tự động chia mâm theo bàn (6, 8, 10 người), dự toán chi phí thực phẩm, tính toán tỷ lệ lợi nhuận (Profit Margin), phân bổ thời gian chế biến bếp song song và xuất báo giá định dạng tin nhắn Zalo chuyên nghiệp.'),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.6. Gamification Giới Trẻ & Dân Văn Phòng (Apex Case Opening & Arcade Hub): ', bold: true, color: darkColor }),
              new TextRun('Mô phỏng mở hòm Apex Legends độc đáo giúp giải quyết tình trạng đắn đo "Trưa nay ăn gì ở văn phòng?". Phân bổ độ hiếm (Xanh Tiết kiệm, Tím Vừa phải, Vàng Ăn sang) kèm hiệu ứng âm thanh Web Audio sống động. Tích hợp Minigame "Vòng Quay Bàn Nhậu" (Drinking Roulette) hỗ trợ luật "Cả Bàn!" và "Uống Hộ" cho các buổi liên hoan.'),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.7. Sổ Tay Công Thức Nấu Ăn (Interactive Recipe Catalog): ', bold: true, color: darkColor }),
              new TextRun('Thư viện hơn 700 món ăn Việt Nam với định dạng chuẩn bị nguyên liệu, các bước nấu có bộ đếm giờ và thanh tiến độ hoàn thành, cho phép người dùng tự tin vào bếp.'),
            ],
          }),

          // ==========================================
          // MỤC 4: PHÂN TÍCH SWOT TOÀN DIỆN
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: '4. MÔ HÌNH PHÂN TÍCH SWOT TOÀN DIỆN (SWOT ANALYSIS)',
                bold: true,
                size: 28,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun(
                'Dưới đây là ma trận phân tích chiến lược SWOT toàn diện đánh giá năng lực nội tại và bối cảnh thị trường của MealWise:'
              ),
            ],
          }),

          // BẢNG SWOT
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Row Header
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: '047857', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐIỂM MẠNH (STRENGTHS - S)', bold: true, color: 'FFFFFF', size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B91C1C', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐIỂM YẾU (WEAKNESSES - W)', bold: true, color: 'FFFFFF', size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 1 Content: S vs W
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '1. Bản Địa Hóa 100% Sâu Sắc:', bold: true }), new TextRun(' Dữ liệu hơn 700 công thức và mâm cơm được chuẩn hóa theo đúng cấu trúc bữa ăn Việt (mặn - canh - xào), tôn trọng khẩu vị 3 miền (Bắc, Trung, Nam) mà các app quốc tế không có.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '2. Thuật Toán Ngân Sách Cố Định (Knapsack):', bold: true }), new TextRun(' Đảm bảo 100% không bị lố ngân sách gia đình, điều chỉnh linh hoạt từ 1 người độc thân đến gia đình 20 người.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '3. Công Nghệ Đa Nền Tảng Siêu Nhẹ:', bold: true }), new TextRun(' Hoạt động mượt mà trên Web, PWA, Android APK lẫn bản Desktop Portable (chạy ngay không cần cài đặt). Tương thích từ màn hình 320px đến 4K.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '4. Tính Năng Đi Chợ Real-Time Độc Đáo:', bold: true }), new TextRun(' Cho phép nhiều thành viên trong nhà cùng đi siêu thị và nhặt hàng theo thời gian thực với định danh màu sắc sinh động.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '5. Tính Năng Chống Lãng Phí (Tủ Lạnh):', bold: true }), new TextRun(' Tận dụng triệt để thức ăn thừa, giải quyết bài toán kinh tế thực tế cho các hộ gia đình.')],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '1. Biến Động Giá Thị Trường Cục Bộ:', bold: true }), new TextRun(' Giá thực phẩm ở chợ truyền thống Việt Nam phụ thuộc theo mùa vụ, thời tiết và từng khu vực, hiện ứng dụng đang sử dụng mô hình giá ước tính chuẩn hóa.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '2. Yêu Cầu Ý Thức Người Dùng Nhập Tủ Lạnh:', bold: true }), new TextRun(' Tính năng tủ lạnh thông minh đòi hỏi người dùng chủ động ghi nhận thực phẩm thừa; cần phát triển thêm quét camera AI nhận diện đồ ăn trong tương lai.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '3. Thiếu Tích Hợp Đặt Hàng Trực Tiếp (E-Grocery):', bold: true }), new TextRun(' Hiện tại mới dừng lại ở danh sách đi chợ và xuất Zalo, chưa kết nối trực tiếp API giỏ hàng với các sàn Co.opmart, WinMart hay GrabMart.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '4. Nhận Diện Thương Hiệu Ban Đầu:', bold: true }), new TextRun(' Là sản phẩm mới phát triển, cần chiến dịch tiếp thị và truyền thông cộng đồng để xây dựng thói quen sử dụng hàng ngày cho người nội trợ.')],
                      }),
                    ],
                  }),
                ],
              }),

              // Row Header 2: O vs T
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: '1D4ED8', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'CƠ HỘI (OPPORTUNITIES - O)', bold: true, color: 'FFFFFF', size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'C2410C', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'THÁCH THỨC (THREATS - T)', bold: true, color: 'FFFFFF', size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 2 Content: O vs T
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '1. Xu Hướng Nấu Ăn Tại Nhà (Home Cooking):', bold: true }), new TextRun(' Sau thời kỳ bão giá và lo ngại an toàn thực phẩm bên ngoài, người tiêu dùng Việt Nam có xu hướng quay lại ăn cơm nhà để bảo vệ sức khỏe và tiết kiệm.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '2. Thị Trường B2B & Chuỗi Siêu Thị:', bold: true }), new TextRun(' Cơ hội hợp tác tiếp thị liên kết (Affiliate / API) với các chuỗi bán lẻ lớn (WinMart, Bách Hóa Xanh, Mega Market) để chuyển đổi danh sách đi chợ thành đơn giao tận cửa.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '3. Xu Hướng Dinh Dưỡng Cá Nhân Hóa:', bold: true }), new TextRun(' Nhu cầu thực đơn chuyên biệt cho người tập Gym, người ăn kiêng Eat Clean, người tiểu đường, cao huyết áp ngày càng bùng nổ tại Việt Nam.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '4. Kết Nối Mạng Xã Hội Ẩm Thực:', bold: true }), new TextRun(' Khả năng mở rộng thành cộng đồng chia sẻ mâm cơm đẹp mắt trên TikTok, Facebook, Zalo, tạo hiệu ứng lan truyền (viral marketing) tự nhiên.')],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: '1. Thói Quen Tiện Lợi Của Ứng Dụng Giao Đồ Ăn:', bold: true }), new TextRun(' Sự cạnh tranh về độ tiện lợi tức thì từ GrabFood, ShopeeFood khiến giới trẻ đôi khi lười vào bếp.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '2. Rào Cản Thói Quen Của Người Lớn Tuổi:', bold: true }), new TextRun(' Người nội trợ truyền thống thường đi chợ theo cảm tính và thói quen tích lũy qua nhiều năm, cần giao diện cực kỳ thân thiện để không gây ngần ngại công nghệ.')],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '3. Sự Thay Đổi Nhanh Chóng Của Công Nghệ AI:', bold: true }), new TextRun(' Các mô hình AI đa năng (ChatGPT, Gemini) có thể đưa ra công thức nấu ăn, đòi hỏi MealWise phải liên tục tối ưu trải nghiệm tương tác chuyên sâu mà chatbot đơn thuần không thể đáp ứng.')],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // ==========================================
          // MỤC 5: ĐỐI TƯỢNG NGƯỜI DÙNG MỤC TIÊU
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: '5. ĐỐI TƯỢNG NGƯỜI DÙNG MỤC TIÊU (TARGET AUDIENCE)',
                bold: true,
                size: 28,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '1. Gia đình trẻ hiện đại (25 - 40 tuổi): ', bold: true }),
              new TextRun('Bận rộn với công việc, có con nhỏ, cần lên thực đơn nhanh, đảm bảo con cái đủ chất và kiểm soát chi tiêu sinh hoạt hàng tháng không bị lạm phát.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Người sống độc thân & Sinh viên xa nhà: ', bold: true }),
              new TextRun('Khó nấu ăn vì định lượng nguyên liệu nhỏ, hay mua thừa đồ ăn. MealWise giúp họ nấu mâm 1 người hoặc các món ăn một đĩa (cơm rang, bún, mì) với chi phí chỉ từ 30.000đ - 45.000đ/bữa.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Dân văn phòng công sở: ', bold: true }),
              new TextRun('Thường xuyên tranh cãi "Trưa nay ăn gì?", hưởng ứng tính năng Gamification mở hòm bữa cơm Apex Legends và minigame bàn nhậu sau giờ làm.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '4. Người tập luyện thể thao & Ăn theo chế độ: ', bold: true }),
              new TextRun('Gymer cần nạp đủ 100g - 150g protein/ngày, người theo đuổi Eat Clean hoặc ăn chay cần theo dõi chính xác hàm lượng dưỡng chất và loại trừ thực phẩm nhiều dầu mỡ.'),
            ],
          }),

          // ==========================================
          // MỤC 6: ĐỊNH HƯỚNG PHÁT TRIỂN & KẾT LUẬN
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: '6. CHIẾN LƯỢC PHÁT TRIỂN & KẾT LUẬN',
                bold: true,
                size: 28,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '• Giai đoạn 1 (Hiện tại): ', bold: true, color: darkColor }),
              new TextRun('Hoàn thiện hệ sinh thái đa nền tảng (Web, APK, Portable PC), thuật toán Knapsack chống lạm phát ngân sách, tính năng cộng tác đi chợ thời gian thực và quản lý tủ lạnh thông minh.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Giai đoạn 2 (Tương lai gần): ', bold: true, color: darkColor }),
              new TextRun('Tích hợp trí tuệ nhân tạo thị giác (Computer Vision AI) chụp ảnh tủ lạnh tự động nhận diện nguyên liệu; liên kết đối tác chuỗi siêu thị bán lẻ để hỗ trợ đặt nguyên liệu 1 chạm.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Kết luận: ', bold: true }),
              new TextRun('MealWise không chỉ đơn thuần là một cuốn sổ tay nấu ăn kỹ thuật số, mà là một trợ lý tài chính - dinh dưỡng đắc lực cho mọi mái ấm gia đình Việt. Bằng cách kết hợp giữa bản sắc văn hóa dân tộc và công nghệ thông minh, MealWise sở hữu tiềm năng mạnh mẽ để trở thành ứng dụng thiết yếu hàng ngày trong hành trình chăm sóc sức khỏe và gắn kết yêu thương qua từng bữa cơm.'),
            ],
          }),

          // KÝ TÊN / BAN DỰ ÁN
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: 'BAN PHÁT TRIỂN SẢN PHẨM MEALWISE',
                bold: true,
                size: 22,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: 'Đội Ngũ Kiến Trúc Sư & Nghiên Cứu Sản Phẩm',
                italics: true,
                size: 20,
                color: slateMuted,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  // 1. Save in Remotion workspace
  const workspacePath = path.resolve(process.cwd(), 'MealWise_Bao_Cao_Giai_Phap_Toan_Dien.docx');
  fs.writeFileSync(workspacePath, buffer);
  console.log('✓ Đã tạo file Word tại Workspace:', workspacePath);

  // 2. Save in User's Downloads folder
  const downloadsPath = 'C:\\Users\\EXIA\\Downloads\\MealWise_Bao_Cao_Giai_Phap_Toan_Dien.docx';
  try {
    fs.writeFileSync(downloadsPath, buffer);
    console.log('✓ Đã tạo file Word tại Downloads:', downloadsPath);
  } catch (err) {
    console.warn('Không thể ghi vào Downloads:', err.message);
  }
}

createMealWiseDocx().catch(console.error);
