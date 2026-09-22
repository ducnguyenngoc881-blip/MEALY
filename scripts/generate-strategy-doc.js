import fs from 'fs';
import path from 'path';
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
  ShadingType,
  Header,
  Footer,
  PageNumber
} from 'docx';

const BRAND_PRIMARY = '059669';   // Emerald 600
const BRAND_SECONDARY = '0284C7'; // Sky 600
const BRAND_ACCENT = 'D97706';    // Amber 600
const BRAND_DARK = '0F172A';      // Slate 900
const BRAND_MUTED = '475569';     // Slate 600
const BRAND_LIGHT_BG = 'F8FAFC';  // Slate 50
const TABLE_HEADER_BG = '0F766E'; // Teal 700

function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 44, // 22pt
        color: BRAND_PRIMARY,
        font: 'Segoe UI'
      })
    ]
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
    children: [
      new TextRun({
        text,
        italics: true,
        size: 24, // 12pt
        color: BRAND_MUTED,
        font: 'Segoe UI'
      })
    ]
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        color: BRAND_PRIMARY,
        font: 'Segoe UI'
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26, // 13pt
        color: BRAND_SECONDARY,
        font: 'Segoe UI'
      })
    ]
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22, // 11pt
        color: BRAND_DARK,
        font: 'Segoe UI'
      })
    ]
  });
}

function createBodyParagraph(text, bold = false) {
  return new Paragraph({
    spacing: { before: 60, after: 100, line: 300 },
    children: [
      new TextRun({
        text,
        bold,
        size: 21, // 10.5pt
        color: BRAND_DARK,
        font: 'Segoe UI'
      })
    ]
  });
}

function createBulletPoint(lead, body) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 80, line: 280 },
    children: [
      new TextRun({
        text: lead + ' ',
        bold: true,
        size: 21,
        color: BRAND_DARK,
        font: 'Segoe UI'
      }),
      new TextRun({
        text: body,
        size: 21,
        color: BRAND_MUTED,
        font: 'Segoe UI'
      })
    ]
  });
}

function createCallout(title, body) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 24, color: BRAND_PRIMARY }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' },
            margins: { top: 140, bottom: 140, left: 200, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 22,
                    color: BRAND_PRIMARY,
                    font: 'Segoe UI'
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: body,
                    italics: true,
                    size: 20,
                    color: BRAND_DARK,
                    font: 'Segoe UI'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createTable(headers, rowsData) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' }
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: TABLE_HEADER_BG },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  size: 20,
                  color: 'FFFFFF',
                  font: 'Segoe UI'
                })
              ]
            })
          ]
        }))
      }),
      ...rowsData.map((row, idx) => new TableRow({
        children: row.map((cellText, cellIdx) => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? 'FFFFFF' : BRAND_LIGHT_BG },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: cellIdx === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: cellText,
                  bold: cellIdx === 0,
                  size: 19,
                  color: cellIdx === 0 ? BRAND_DARK : BRAND_MUTED,
                  font: 'Segoe UI'
                })
              ]
            })
          ]
        }))
      }))
    ]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Segoe UI', size: 21, color: BRAND_DARK }
      }
    }
  },
  sections: [
    {
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'MEALWISE • CHIẾN LƯỢC KINH DOANH & LỘ TRÌNH PHÁT TRIỂN NỀN TẢNG',
                  size: 16,
                  color: BRAND_MUTED,
                  font: 'Segoe UI'
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'MEALWISE • TÀI LIỆU CHIẾN LƯỢC PHÁT TRIỂN & KINH DOANH MẬT', size: 16, color: BRAND_MUTED })
              ]
            })
          ]
        })
      },
      children: [
        createTitle('CHIẾN LƯỢC PHÁT TRIỂN & KINH DOANH MEALWISE'),
        createSubtitle('Chuyển Hóa Từ Công Cụ Gợi Ý Ẩm Thực Sang Nền Tảng Giao Dịch Thực Phẩm Đa Chiều'),

        createCallout(
          'Tuyên Bố Chiến Lược Cốt Lõi (Strategic Pivot)',
          'MealWise hiện tại đóng vai trò là một "Suggestion & Utility Tool" (Công cụ gợi ý & quản trị tủ lạnh). Chiến lược dài hạn là dùng tiện ích này làm "Móc câu giữ chân" (Retention Hook), tích lũy 10.000 người dùng trung thành có thói quen lên danh sách đi chợ hàng tuần, từ đó mở khóa cột mốc hợp tác chiến lược cùng các sàn Food Delivery & Quick-Commerce (GrabMart, ShopeeFood, WinMart, BachHoaXanh) để chuyển đổi từ người gợi ý thành trạm thu phí giao dịch ẩm thực (Food Gateway).'
        ),

        new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }),

        createHeading1('I. TỔNG QUAN CHIẾN LƯỢC KINH DOANH (BUSINESS STRATEGY)'),
        createBodyParagraph(
          'Để cạnh tranh và tăng trưởng bền vững, MealWise không định vị mình là một ứng dụng bán thực phẩm tự vận hành kho bãi (vốn đòi hỏi vốn khổng lồ và rủi ro hao hụt hàng tồn), mà định vị là Nền Tảng Trí Tuệ Quyết Định Ẩm Thực (Culinary Decision Intelligence Layer) nằm ngay phía trước hành vi mua sắm của người tiêu dùng.'
        ),

        createHeading2('1. Bánh Đà Tăng Trưởng Cốt Lõi (The Growth Flywheel)'),
        createBulletPoint('BƯỚC 1 - Thu Hút & Tạo Lập Thói Quen (Free Utility):', 'Người dùng mở app để giải quyết bài toán "Hôm nay ăn gì?" với thuật toán Knapsack 1-click, gợi ý mâm 3 món chuẩn vị Bắc-Trung-Nam và quản lý đồ thừa trong tủ lạnh.'),
        createBulletPoint('BƯỚC 2 - Tự Động Gom Nhu Cầu Đi Chợ (High-Intent Cart):', 'Thực đơn 7 ngày tự động phân rã thành danh sách nguyên liệu chi tiết (gam, kg, gia vị) với độ chính xác cao.'),
        createBulletPoint('BƯỚC 3 - Chuyển Hóa Giao Dịch (Delivery Affiliate & 1-Click Checkout):', 'Thay vì chép tay đi chợ, người dùng nhấn "1-Click Đặt Hàng Qua GrabMart / ShopeeFood". Giỏ hàng được đẩy thẳng sang đối tác giao hàng.'),
        createBulletPoint('BƯỚC 4 - Đồng Bộ Tủ Lạnh & Lặp Lại Vòng Đời (Pantry Restock Loop):', 'Đơn hàng giao tới tự động cập nhật lại vào Tủ Lạnh Thông Minh trong app, cảnh báo hạn dùng và tiếp tục gợi ý mâm cơm tiếp theo.'),

        createHeading2('2. Chiến Lược Đại Dương Xanh (Blue Ocean Strategy)'),
        createBodyParagraph(
          'Thị trường ẩm thực số hiện nay bị phân mảnh giữa 3 thái cực: (1) App công thức nấu ăn (Cookpad) chỉ có nội dung, không có công cụ tính toán ngân sách hay giao hàng; (2) App tính calo phương Tây (MyFitnessPal) không hiểu ẩm thực Việt; (3) App giao hàng (Grab, ShopeeFood) chỉ bán món đã nấu sẵn và gây mệt mỏi khi lướt tìm. MealWise tạo ra một không gian thị trường mới:'
        ),
        createTable(
          ['Tiêu Chí So Sánh', 'App Công Thức Nấu Ăn', 'App Giao Đồ Ăn (Food App)', 'MEALWISE'],
          [
            ['Mục tiêu chính', 'Tra cứu cách nấu', 'Đặt đồ ăn làm sẵn tức thì', 'Tự động lập kế hoạch dinh dưỡng & ngân sách'],
            ['Tính toán ngân sách', 'Không có', 'Thường xuyên vượt ngân sách', 'Chặn trần ngân sách 100% bằng thuật toán Knapsack'],
            ['Chuẩn vị mâm cơm Việt', 'Rời rạc từng món', 'Hầu hết là món nhanh/cơm phần', 'Cấu trúc mâm 3 món Mặn - Canh - Xào chuẩn vùng miền'],
            ['Tủ lạnh & Chống lãng phí', 'Không hỗ trợ', 'Không hỗ trợ', 'Tủ lạnh Zero-Waste, tự ghép món từ đồ có sẵn'],
            ['Hành vi thương mại', 'Xem quảng cáo banner', 'Mua ngẫu hứng (Impulse buy)', 'Đặt hàng định kỳ hàng tuần có kế hoạch (High-intent)']
          ]
        ),

        new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }),

        createHeading1('II. LỘ TRÌNH PHÁT TRIỂN THEO CỘT MỐC NGƯỜI DÙNG (USER MILESTONES ROADMAP)'),
        createBodyParagraph(
          'Chiến lược phát triển của MealWise được chia làm 4 giai đoạn gắn liền với số lượng người dùng tải và sử dụng ứng dụng (Downloads & MAU):'
        ),

        createHeading2('CỘT MỐC 0: TỪ 0 ĐẾN 10.000 USERS (GIAI ĐOẠN XÂY NỀN & TẠO THÓI QUEN)'),
        createBulletPoint('Trọng Tâm Chiến Lược:', 'Hoàn thiện "Công cụ gợi ý xuất sắc nhất thị trường". Tập trung tối đa vào độ gắn kết (Retention D30 > 25%), tính ổn định của thuật toán gợi ý thực đơn tuần và khả năng chia sẻ danh sách đi chợ.'),
        createBulletPoint('Tính Năng Hoàn Thiện:', 'Thực đơn Knapsack stochastic 1-click không trùng lặp, Tủ lạnh Zero-Waste, Đồng bộ đi chợ Real-time đa thiết bị, Gamification Mở hòm Apex & Minigame bàn nhậu.'),
        createBulletPoint('Cơ Chế Đi Chợ Tạm Thời:', 'Hỗ trợ xuất danh sách đi chợ sang Zalo/SMS và tích hợp nút "Sao chép danh sách" định dạng chuẩn để dán vào ghi chú của GrabMart/ShopeeFood.'),
        createBulletPoint('Mục Tiêu KPI:', '10.000 lượt tải; 3.000 Active Users tuần; trung bình mỗi user tạo ít nhất 2 thực đơn tuần và có 5 món lưu trong tủ lạnh.'),

        createHeading2('CỘT MỐC 1 (ĐIỂM UỐN CHIẾN LƯỢC): ĐẠT 10.000 USERS -> HỢP TÁC DELIVERY VÀ SIÊU THỊ'),
        createCallout(
          'Tại Sao 10k Users Là Điểm Vàng Để Đàm Phán Đối Tác?',
          'Với 10.000 users tích cực lên thực đơn tuần, MealWise tạo ra ít nhất 15.000 - 20.000 giỏ hàng đi chợ mỗi tháng với giá trị trung bình (AOV) từ 300.000đ - 700.000đ/giỏ. Đây là tập khách hàng có "Ý định mua sắm cực cao" (High-Intent Recurring Shoppers) mà bất kỳ sàn nào như GrabMart, ShopeeFood, WinMart, BachHoaXanh đều khao khát có được mà không tốn chi phí khuyến mãi món ăn.'
        ),
        createBulletPoint('Hành Động Đàm Phán Với Đối Tác Giao Hàng:', 'Tiếp cận đội ngũ Đối Tác B2B của GrabMart / ShopeeFood / WinMart Online để tích hợp tiếp thị liên kết (Affiliate API) và Deep-link SDK.'),
        createBulletPoint('Tính Năng "1-Click Đẩy Sang Giỏ Hàng" (Cart Injection):', 'Người dùng ấn "Đặt mua toàn bộ nguyên liệu tuần này", hệ thống tự động bóc tách và tạo sẵn giỏ hàng trên ứng dụng GrabMart / ShopeeFood với các mặt hàng tương ứng.'),
        createBulletPoint('Mô Hình Chia Sẻ Doanh Thu (Revenue Share):', 'Nhận hoa hồng từ 4% - 8% trên tổng giá trị giỏ hàng (GMV) từ đối tác sàn, kèm ưu đãi mã giảm giá độc quyền cho người dùng MealWise.'),

        createHeading2('CỘT MỐC 2: TỪ 10.000 ĐẾN 50.000 USERS (GIAI ĐOẠN THƯƠNG MẠI HÓA TOÀN PHẦN)'),
        createBulletPoint('Bán Combo Sơ Chế Sẵn (Ready-to-Cook Meal Kits):', 'Hợp tác với các chuỗi thực phẩm sạch (MeatDeli, CP, SanHa, Dalat Hasfarm) phân phối các combo nguyên liệu đã nhặt rửa, thái sẵn theo đúng công thức mâm cơm 3 món của MealWise.'),
        createBulletPoint('Mở Khóa Gói Thuê Bao Trả Phí (MealWise PRO):', 'Mức giá 49.000đ/tháng hoặc 399.000đ/năm với các đặc quyền: AI quét hóa đơn/hình ảnh tủ lạnh tự động nhận diện nguyên liệu, chế độ dinh dưỡng cá nhân hóa theo chỉ số xét nghiệm máu, sao lưu dữ liệu gia đình không giới hạn.'),
        createBulletPoint('Mục Tiêu Doanh Thu:', 'Đạt điểm hòa vốn (Break-even), dòng tiền dương từ hoa hồng giao hàng và phí thuê bao PRO.'),

        createHeading2('CỘT MỐC 3: TỪ 50.000 ĐẾN 200.000+ USERS (HỆ SINH THÁI DỮ LIỆU & B2B)'),
        createBulletPoint('Nền Tảng Quảng Cáo Bản Địa FMCG (Contextual Sponsored Recipes):', 'Hợp tác cùng các tập đoàn hàng tiêu dùng (Unilever - Knorr, Nestlé - Maggi, Masan - Chinsu). Gợi ý món ăn thông minh có tích hợp gia vị tài trợ tự nhiên, không gây phiền toái.'),
        createBulletPoint('Tích Hợp Tủ Lạnh Thông Minh (Smart IoT Fridge Integration):', 'Hợp tác cùng Samsung (Family Hub) và LG (ThinQ) đưa MealWise thành ứng dụng mặc định trên màn hình cảm ứng của tủ lạnh thông minh.'),
        createBulletPoint('Module Catering & Dịch Vụ Đặt Cỗ B2B:', 'Cung cấp khách hàng tiềm năng cho các đơn vị nấu cỗ, nhà hàng tiệc gia đình và nhận 5% - 10% hoa hồng trên mỗi hợp đồng tiệc.'),

        new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }),

        createHeading1('III. MÔ HÌNH TÀI CHÍNH & NGUỒN THU (MONETIZATION & UNIT ECONOMICS)'),
        createTable(
          ['Kênh Doanh Thu (Revenue Streams)', 'Cơ Chế Vận Hành', 'Biên Lợi Nhuận / Phí', 'Thời Điểm Triển Khai'],
          [
            ['1. Affiliate & Take-rate Đi Chợ', 'Ăn chia hoa hồng trên mỗi giỏ hàng nguyên liệu đặt qua GrabMart, ShopeeFood, WinMart', '4% - 8% giá trị đơn hàng', 'Từ cột mốc 10.000 Users'],
            ['2. Gói Thuê Bao MealWise PRO', 'Người dùng trả phí tháng/năm để dùng tính năng AI Scan, chuyên gia dinh dưỡng', '90% (Doanh thu phần mềm SaaS)', 'Từ cột mốc 20.000 Users'],
            ['3. Tài Trợ Gia Vị FMCG Bản Địa', 'Các hãng Knorr, Maggi, Ajinomoto tài trợ công thức và vị trí sản phẩm ưu tiên', 'Cố định theo chiến dịch (50 - 200 triệu/tháng)', 'Từ cột mốc 30.000 Users'],
            ['4. Combo Nguyên Liệu Sơ Chế', 'Chia sẻ doanh thu với chuỗi thực phẩm sạch bán combo nguyên liệu chuẩn mâm', '12% - 18% trên mỗi hộp combo', 'Từ cột mốc 50.000 Users'],
            ['5. Phí Môi Giới Đặt Cỗ & Catering', 'Thu phí hoa hồng giới thiệu từ các đơn vị cung cấp tiệc tại gia khi khách chốt cỗ', '5% - 10% giá trị hợp đồng tiệc', 'Từ cột mốc 10.000 Users']
          ]
        ),

        createHeading2('Dự Toán Tài Chính Đơn Vị (Target Unit Economics):'),
        createBulletPoint('Chi phí thu hút 1 người dùng cài đặt (Blended CAC):', '< 15.000 VNĐ (nhờ chiến dịch lan tỏa tự nhiên trên TikTok/Reels và truyền miệng nội trợ).'),
        createBulletPoint('Giá trị vòng đời trung bình của 1 người dùng hoạt động (LTV):', '180.000 - 320.000 VNĐ trong 12 tháng (tính từ hoa hồng đi chợ lặp lại hàng tuần và nâng cấp Pro).'),
        createBulletPoint('Tỷ lệ LTV / CAC mục tiêu:', '> 12:1 (Biên độ an toàn rất cao cho doanh nghiệp khởi nghiệp công nghệ).'),

        new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }),

        createHeading1('IV. CHIẾN LƯỢC GO-TO-MARKET ĐỂ CHẠM MỐC 10.000 USERS NHANH NHẤT'),
        createBulletPoint('Chiến Dịch Video Ngắn Đánh Trúng Tâm Lý:', 'Sản xuất chuỗi video "Thử thách 7 ngày ăn ngon cả nhà chỉ 50k/người cùng MealWise", "Review tủ lạnh sinh viên từ bãi rác thành mâm cơm chuẩn vị". Tập trung vào các visual hấp dẫn: mở hòm Apex món ăn, mâm cơm 3 món bốc khói.'),
        createBulletPoint('Cộng Đồng Hóa Thói Quen (Community Flywheel):', 'Xây dựng group "Hội Nấu Ăn Không Lãng Phí - Mâm Cơm Việt MealWise". Tổ chức minigame khoe mâm cơm gia đình, người thắng cuộc được tặng điểm mở hòm Apex nhận voucher thực phẩm.'),
        createBulletPoint('Kênh Giới Thiệu Gia Đình & Đồng Nghiệp (Referral Mechanic):', 'Người dùng mời người thân trong nhà cùng dùng chung danh sách đi chợ sẽ được mở khóa thêm các tính năng độc quyền trong Minigame và Tủ Lạnh.'),
        createBulletPoint('Quan Hệ Công Chúng & Báo Chí (PR Narrative):', 'Định vị câu chuyện thương hiệu: "Giải pháp công nghệ Việt giải cứu người nội trợ khỏi bão giá và bài toán lãng phí thực phẩm hàng triệu tấn mỗi năm".')
      ]
    }
  ]
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  
  const workspacePath = path.resolve('MealWise_Chien_Luoc_Kinh_Doanh_Va_Phat_Trien.docx');
  const downloadsPath = 'C:\\Users\\EXIA\\Downloads\\MealWise_Chien_Luoc_Kinh_Doanh_Va_Phat_Trien.docx';

  fs.writeFileSync(workspacePath, buffer);
  fs.writeFileSync(downloadsPath, buffer);

  console.log(`✓ Đã tạo file Chiến Lược Kinh Doanh tại Workspace: ${workspacePath}`);
  console.log(`✓ Đã tạo file Chiến Lược Kinh Doanh tại Downloads: ${downloadsPath}`);
}

main().catch(err => {
  console.error('Lỗi khi tạo file Word:', err);
  process.exit(1);
});
