import { POOLS, pickImg } from './recipe-pools.mjs';

function createRecipe({
  id,
  title,
  description,
  category = 'trang-mieng',
  region,
  prepTimeMinutes,
  cookTimeMinutes,
  servings = 4,
  calories,
  estimatedCostVnd,
  poolIndex,
  ingredients,
  instructions,
  tags,
  chefTip,
  difficulty = 'Dễ'
}) {
  const imageUrl = pickImg('dessert', poolIndex);
  return {
    id,
    title,
    description,
    category,
    region,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    calories,
    estimatedCostVnd,
    imageUrl,
    ingredients,
    instructions,
    tags,
    chefTip,
    difficulty
  };
}

export function generateAllTrangMieng() {
  const recipes = [];

  // Group 1: Chè truyền thống (25 dishes)
  const cheDefs = [
    { title: 'Chè Đậu Đỏ Hạt Sen Nước Cốt Dừa Thơm Bùi', reg: 'bac', cost: 35000, cal: 260, main: 'Đậu đỏ hạt nhỏ ninh mềm', mAmt: 200, mUnit: 'g', sec: 'Hạt sen tươi Huế ninh bùi', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Bưởi An Giang Giòn Sần Sật Cốt Dừa Béo', reg: 'nam', cost: 38000, cal: 280, main: 'Cùi bưởi da xanh khử đắng giòn dai', mAmt: 250, mUnit: 'g', sec: 'Đậu xanh bóc vỏ đồ chín tơi', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Sương Sa Hạt Lựu Cốt Dừa Ba Màu Nam Bộ', reg: 'nam', cost: 36000, cal: 240, main: 'Hạt lựu củ năng bọc bột năng', mAmt: 200, mUnit: 'g', sec: 'Thạch sương sa lá dứa thơm mát', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Khoai Dẻo Đài Loan Nước Đường Gừng Nóng', reg: 'bac', cost: 35000, cal: 250, main: 'Viên khoai lang vàng và tím dẻo dai', mAmt: 250, mUnit: 'g', sec: 'Nước đường phèn gừng ấm nồng', sAmt: 200, sUnit: 'ml' },
    { title: 'Chè Thưng Miền Nam Thập Cẩm Béo Bùi Cốt Dừa', reg: 'nam', cost: 42000, cal: 310, main: 'Khoai môn, khoai lang cắt hạt lựu', mAmt: 250, mUnit: 'g', sec: 'Mộc nhĩ, nấm tuyết & Đậu xanh', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Trôi Nước Gừng Đường Thốt Nốt Vàng Óng', reg: 'nam', cost: 36000, cal: 290, main: 'Viên trôi nước nhân đậu xanh mềm mịn', mAmt: 8, mUnit: 'viên' },
    { title: 'Chè Khúc Bạch Hạnh Nhân Thanh Mát Trái Vải', reg: 'bac', cost: 45000, cal: 230, main: 'Khúc bạch phô mai sữa dẻo béo', mAmt: 250, mUnit: 'g', sec: 'Trái vải thiều ngâm nước đường', sAmt: 200, sUnit: 'g' },
    { title: 'Chè Long Nhãn Hạt Sen Phố Hiến Thanh Tao', reg: 'bac', cost: 48000, cal: 220, main: 'Long nhãn Hưng Yên lồng hạt sen', mAmt: 200, mUnit: 'g', sec: 'Nước đường phèn hoa bưởi thanh khiết', sAmt: 200, sUnit: 'ml' },
    { title: 'Chè Thái Sầu Riêng Thơm Béo Trái Cây Miệt Vườn', reg: 'nam', cost: 50000, cal: 340, main: 'Cơm sầu riêng Ri6 thơm béo', mAmt: 150, mUnit: 'g', sec: 'Mít thái, thạch dừa & Thốt nốt', sAmt: 250, sUnit: 'g' },
    { title: 'Chè Đậu Xanh Nha Đam Đường Phèn Thanh Nhiệt', reg: 'nam', cost: 30000, cal: 190, main: 'Nha đam tươi giòn cắt hạt lựu', mAmt: 250, mUnit: 'g', sec: 'Đậu xanh nguyên vỏ ninh nhừ', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Chuối Nướng Nước Cốt Dừa Mè Rang Bến Tre', reg: 'nam', cost: 38000, cal: 310, main: 'Chuối xiêm bọc nếp nướng vàng ruộm', mAmt: 4, mUnit: 'trái', sec: 'Nước cốt dừa sánh béo mè rang', sAmt: 200, sUnit: 'ml' },
    { title: 'Chè Bắp Hội An Dẻo Ngọt Thơm Hương Dứa', reg: 'trung', cost: 28000, cal: 210, main: 'Bắp nếp Cẩm Nam bào mỏng dẻo ngọt', mAmt: 300, mUnit: 'g', sec: 'Lá dứa tươi tạo hương thơm', sAmt: 4, sUnit: 'nhánh' },
    { title: 'Chè Sen Tuyết Nhĩ Táo Đỏ Dưỡng Nhan Thanh Khiết', reg: 'bac', cost: 45000, cal: 180, main: 'Nấm tuyết nhĩ ngâm nở giòn sần sật', mAmt: 150, mUnit: 'g', sec: 'Hạt sen & Táo đỏ khô Tân Cương', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Khoai Môn Cốt Dừa Dẻo Quánh Thơm Ngậy', reg: 'nam', cost: 36000, cal: 290, main: 'Khoai môn sáp dẻo bùi cắt vuông', mAmt: 300, mUnit: 'g', sec: 'Nếp hoa & Nước cốt dừa đậm đặc', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Ba Màu Cốt Dừa Đậu Đỏ Đậu Xanh Thạch Xanh', reg: 'nam', cost: 35000, cal: 270, main: 'Đậu đỏ bùi, đậu xanh tán nhuyễn', mAmt: 250, mUnit: 'g', sec: 'Rau câu chân vịt xanh dẻo', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Thạch Sen Dừa Tươi Mát Lạnh Mùa Hè', reg: 'bac', cost: 36000, cal: 200, main: 'Hạt sen tươi ninh bùi ngọt dịu', mAmt: 200, mUnit: 'g', sec: 'Cùi dừa non nạo sợi & Thạch giòn', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Đậu Trắng Nước Cốt Dừa Béo Bùi Cơm Nếp', reg: 'nam', cost: 32000, cal: 280, main: 'Đậu trắng mắt cua ninh mềm dẻo', mAmt: 250, mUnit: 'g', sec: 'Gạo nếp dẻo hòa quyện cốt dừa', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Đậu Ngự Huế Cung Đình Thanh Tao Tinh Túy', reg: 'trung', cost: 42000, cal: 230, main: 'Hạt đậu ngự Huế bóc vỏ bở tơi', mAmt: 300, mUnit: 'g', sec: 'Nước đường phèn hoa lài thanh khiết', sAmt: 200, sUnit: 'ml' },
    { title: 'Chè Bí Đỏ Đậu Phộng Cốt Dừa Dẻo Bùi Miền Quê', reg: 'nam', cost: 30000, cal: 250, main: 'Bí đỏ hồ lô cắt miếng vuông dẻo ngọt', mAmt: 350, mUnit: 'g', sec: 'Đậu phộng luộc mềm béo ngậy', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Sâm Bổ Lượng Thanh Mát Giải Nhiệt Mùa Hè', reg: 'nam', cost: 40000, cal: 210, main: 'Rong sụn, táo đỏ, bo bo, nhãn nhục', mAmt: 250, mUnit: 'g', sec: 'Nước đường phèn mát lạnh thảo mộc', sAmt: 250, sUnit: 'ml' },
    { title: 'Chè Kê Đậu Xanh Bánh Đa Giòn Rụm Xứ Huế', reg: 'trung', cost: 32000, cal: 240, main: 'Hạt kê vàng ninh mềm sánh dẻo', mAmt: 200, mUnit: 'g', sec: 'Đậu xanh cà vỏ & Bánh tráng nướng', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Lục Tàu Xá Thơm Mùi Trần Bì Vỏ Quýt Ấm', reg: 'nam', cost: 35000, cal: 250, main: 'Đậu xanh tán nhuyễn mịn màng', mAmt: 250, mUnit: 'g', sec: 'Trần bì (vỏ quýt khô) thơm nồng', sAmt: 20, sUnit: 'g' },
    { title: 'Chè Củ Năng Hạt Sen Giòn Sần Sật Ngọt Thanh', reg: 'bac', cost: 38000, cal: 190, main: 'Củ năng gọt vỏ cắt hạt lựu giòn', mAmt: 250, mUnit: 'g', sec: 'Hạt sen tươi & Đường phèn thanh', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Bột Lọc Heo Quay Xứ Huế Độc Đáo Khó Quên', reg: 'trung', cost: 48000, cal: 290, main: 'Thịt heo quay cắt hạt lựu ướp gừng', mAmt: 200, mUnit: 'g', sec: 'Viên bột lọc bọc thịt heo luộc trong', sAmt: 12, sUnit: 'viên' },
    { title: 'Chè Nếp Cẩm Nước Cốt Dừa Dẻo Thơm Đậm Đà', reg: 'bac', cost: 32000, cal: 270, main: 'Nếp cẩm Điện Biên ninh sánh dẻo', mAmt: 250, mUnit: 'g', sec: 'Nước cốt dừa đặc & Sữa chua mềm', sAmt: 150, sUnit: 'ml' }
  ];

  cheDefs.forEach((d) => {
    let mUnitClean = d.mUnit === 'viên' ? 'quả' : d.mUnit;
    let sUnitClean = (d.sUnit === 'viên' || !d.sUnit) ? 'g' : d.sUnit;
    let sAmtClean = (!d.sec || d.sUnit === 'viên') ? 150 : d.sAmt;
    let secNameClean = d.sec || 'Nước cốt dừa thơm béo Bến Tre';

    recipes.push({
      title: d.title,
      desc: `${d.title}: Món tráng miệng thanh mát ngọt lành, cân bằng vị giác sau bữa cơm gia đình đầm ấm.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: mUnitClean,
      secName: secNameClean,
      secAmt: sAmtClean,
      secUnit: sUnitClean,
      method: `Nấu mềm nguyên liệu trên lửa nhỏ liu riu với đường phèn thanh ngọt. Khi nước chè sánh mượt và nguyên liệu thấm đều vị ngọt dịu, rưới nước cốt dừa béo ngậy lên trên và tắt bếp.`,
      tip: `Dùng đường phèn thay đường cát trắng giúp món chè có vị ngọt thanh tao không bị gắt cổ.`,
      chef: `Bí quyết đầu bếp: Thêm một nhúm nhỏ muối hạt vào nước cốt dừa khi đun sẽ giúp dằn lại vị ngọt gắt, tôn bật vị béo ngậy thơm lừng tự nhiên của dừa tươi.`,
      tags: ['Tráng Miệng', 'Chè Truyền Thống', 'Thanh Mát', 'Ngọt Dịu', 'Giải Nhiệt']
    });
  });

  // Group 2: Bánh & Kem (15 dishes)
  const banhKemDefs = [
    { title: 'Bánh Flan Caramen Cà Phê Mềm Mịn Thơm Béo', reg: 'nam', cost: 36000, cal: 220, main: 'Trứng gà tươi & Sữa đặc có đường', mAmt: 4, mUnit: 'quả', sec: 'Cà phê đen nguyên chất nhỏ giọt', sAmt: 50, sUnit: 'ml' },
    { title: 'Bánh Da Lợn Lá Dứa Cốt Dừa Dẻo Bùi Ngũ Sắc', reg: 'nam', cost: 32000, cal: 260, main: 'Bột năng, bột gạo & Nước cốt lá dứa', mAmt: 300, mUnit: 'g', sec: 'Đậu xanh tán nhuyễn xen kẽ từng lớp', sAmt: 150, sUnit: 'g' },
    { title: 'Bánh Bò Thốt Nốt Rễ Tre Nướng Thơm Lừng', reg: 'nam', cost: 38000, cal: 270, main: 'Đường thốt nốt nguyên chất An Giang', mAmt: 200, mUnit: 'g', sec: 'Bột gạo ủ men nở bung rễ tre', sAmt: 300, sUnit: 'g' },
    { title: 'Bánh Chuối Hấp Nước Cốt Dừa Mè Rang Dẻo Thơm', reg: 'nam', cost: 30000, cal: 240, main: 'Chuối sứ chín muồi ép dẹt', mAmt: 5, mUnit: 'trái', sec: 'Bột năng dẻo trong & Cốt dừa béo', sAmt: 200, sUnit: 'g' },
    { title: 'Bánh Khoai Mì Nướng Thơm Lừng Béo Ngậy Bơ Sữa', reg: 'nam', cost: 35000, cal: 290, main: 'Củ khoai mì mài vắt ráo nước', mAmt: 400, mUnit: 'g', sec: 'Sữa đặc, bơ nhạt & Cốt dừa tươi', sAmt: 150, sUnit: 'ml' },
    { title: 'Rau Câu Dừa Xiêm 2 Tầng Thanh Mát Mùa Hè', reg: 'nam', cost: 32000, cal: 160, main: 'Nước dừa xiêm tươi ngọt lịm', mAmt: 500, mUnit: 'ml', sec: 'Nước cốt dừa lớp mặt béo ngậy', sAmt: 150, sUnit: 'ml' },
    { title: 'Rau Câu Trái Cây Ngũ Sắc Giòn Dai Ngọt Dịu', reg: 'bac', cost: 35000, cal: 170, main: 'Xoài cát, dâu tây & Thanh long đỏ', mAmt: 300, mUnit: 'g', sec: 'Bột rau câu dẻo jelly thanh mát', sAmt: 25, sUnit: 'g' },
    { title: 'Bánh Đậu Xanh Nướng Bùi Bùi Thơm Mùi Vani', reg: 'trung', cost: 30000, cal: 250, main: 'Đậu xanh bóc vỏ đồ chín xay mịn', mAmt: 300, mUnit: 'g', sec: 'Đường cát trắng & Dầu dừa tinh khiết', sAmt: 100, sUnit: 'g' },
    { title: 'Kem Dừa Tràng Tiền Dẻo Mịn Bùi Béo Lạc Rang', reg: 'bac', cost: 40000, cal: 230, main: 'Nước cốt dừa tươi & Kem sữa tươi', mAmt: 300, mUnit: 'ml', sec: 'Cùi dừa nạo non & Lạc rang giòn', sAmt: 100, sUnit: 'g' },
    { title: 'Kem Chuối Ép Lạc Rang Cốt Dừa Ký Ức Tuổi Thơ', reg: 'nam', cost: 28000, cal: 210, main: 'Chuối xiêm chín vàng ép dẹt', mAmt: 6, mUnit: 'trái', sec: 'Nước cốt dừa nấu sánh rắc đậu phộng', sAmt: 200, sUnit: 'ml' },
    { title: 'Bánh Tiêu Chiên Đường Mè Phồng Xốp Giòn Thơm', reg: 'nam', cost: 25000, cal: 280, main: 'Bột mì nhào ủ men nở phồng xốp', mAmt: 300, mUnit: 'g', sec: 'Mè trắng rang thơm áo đều vỏ bánh', sAmt: 50, sUnit: 'g' },
    { title: 'Bánh Cam Chiên Nhân Đậu Xanh Giòn Tan Vỏ Mè', reg: 'nam', cost: 28000, cal: 290, main: 'Bột nếp nhào khoai lang dẻo', mAmt: 250, mUnit: 'g', sec: 'Nhân đậu xanh sên đường dẻo bùi', sAmt: 150, sUnit: 'g' },
    { title: 'Bánh Bông Lan Trứng Muối Sốt Phô Mai Tan Chảy', reg: 'nam', cost: 48000, cal: 320, main: 'Lòng đỏ trứng muối nướng thơm bùi', mAmt: 4, mUnit: 'quả', sec: 'Cốt bánh bông lan mềm xốp ẩm', sAmt: 250, sUnit: 'g' },
    { title: 'Tàu Hũ Trân Châu Đường Đen Cốt Gừng Nóng Hổi', reg: 'bac', cost: 32000, cal: 190, main: 'Đậu hũ non mướt mịn tự làm', mAmt: 300, mUnit: 'g', sec: 'Trân châu dẻo dai sốt đường đen gừng', sAmt: 150, sUnit: 'g' },
    { title: 'Bánh Pía Sầu Riêng Trứng Muối Ngàn Lớp Sóc Trăng', reg: 'nam', cost: 50000, cal: 350, main: 'Cơm sầu riêng tươi hòa đậu xanh sên', mAmt: 200, mUnit: 'g', sec: 'Trứng muối bùi bùi & Vỏ bánh ngàn lớp', sAmt: 4, sUnit: 'quả' }
  ];

  banhKemDefs.forEach((d) => {
    recipes.push({
      title: d.title,
      desc: `${d.title}: Món bánh tráng miệng thơm ngon quyến rũ, ngọt ngào lan tỏa trọn vẹn niềm vui sau mỗi bữa ăn.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: d.mUnit,
      secName: d.sec,
      secAmt: d.sAmt,
      secUnit: d.sUnit,
      method: `Hấp chín hoặc nướng/ủ lạnh bánh theo quy trình chuẩn. Đảm bảo cấu trúc bánh hoặc kem đạt độ dẻo mềm, béo ngậy và độ bóng mịn hoàn hảo.`,
      tip: `Canh thời gian hấp hoặc nướng vừa tới để bánh giữ được độ ẩm mịn mọng không bị khô cứng.`,
      chef: `Bí quyết đầu bếp: Lọc hỗn hợp trứng sữa qua rây 2 lần trước khi đem hấp cách thủy trên lửa nhỏ nhất để bánh flan hoặc bánh hấp mướt mịn không bao giờ bị rỗ mặt.`,
      tags: ['Tráng Miệng', 'Bánh & Kem', 'Ngọt Ngào', 'Béo Ngậy', 'Gia Đình']
    });
  });

  // Group 3: Thức uống dưỡng nhan & Trái cây (10 dishes)
  const thucUongDefs = [
    { title: 'Trà Sen Vàng Hạt Sen Macchiato Thanh Nhã', reg: 'bac', cost: 38000, cal: 170, main: 'Trà ô long thượng hạng ủ lạnh', mAmt: 400, mUnit: 'ml', sec: 'Hạt sen Huế ninh đường phèn & Lớp kem', sAmt: 150, sUnit: 'g' },
    { title: 'Trà Đào Cam Sả Thanh Nhiệt Mát Lạnh Sảng Khoái', reg: 'nam', cost: 35000, cal: 150, main: 'Miếng đào ngâm giòn ngọt mọng nước', mAmt: 200, mUnit: 'g', sec: 'Nước cốt cam tươi & Tinh dầu sả thơm', sAmt: 200, sUnit: 'ml' },
    { title: 'Nước Sâm Bí Đao Hạt Chia La Hán Quả Mát Gan', reg: 'nam', cost: 28000, cal: 120, main: 'Bí đao già phơi khô & Quả la hán', mAmt: 200, mUnit: 'g', sec: 'Hạt chia hữu cơ nở mọng nước', sAmt: 30, sUnit: 'g' },
    { title: 'Trà Dưa Lưới Nha Đam Mát Lạnh Giải Nhiệt', reg: 'trung', cost: 32000, cal: 140, main: 'Thịt dưa lưới ép tươi ngọt lịm', mAmt: 300, mUnit: 'ml', sec: 'Thạch nha đam giòn sần sật', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Dưỡng Nhan Tuyết Yến Bồ Mễ Táo Đỏ', reg: 'bac', cost: 48000, cal: 160, main: 'Tuyết yến, bồ mễ ngâm nở trong veo', mAmt: 150, mUnit: 'g', sec: 'Kỷ tử đỏ & Táo đỏ khô Tân Cương', sAmt: 100, sUnit: 'g' },
    { title: 'Nước Ép Cóc Ổi Mật Ong Rừng Thanh Lọc Cơ Thể', reg: 'nam', cost: 30000, cal: 130, main: 'Quả cóc non & Ổi hồng ép lấy nước', mAmt: 400, mUnit: 'ml', sec: 'Mật ong hoa rừng nguyên chất', sAmt: 30, sUnit: 'ml' },
    { title: 'Sữa Hạt Sen Óc Chó Thơm Bùi Bổ Não Giàu Vitamin', reg: 'bac', cost: 42000, cal: 210, main: 'Hạt sen tươi Đồng Tháp bở bùi', mAmt: 200, mUnit: 'g', sec: 'Nhân hạt óc chó xay mịn sánh sữa', sAmt: 100, sUnit: 'g' },
    { title: 'Nước Mía Cốt Dừa Trân Châu Dừa Sợi Mỹ Tho', reg: 'nam', cost: 26000, cal: 180, main: 'Nước mía tươi ép cùng quả tắc', mAmt: 500, mUnit: 'ml', sec: 'Nước cốt dừa thơm béo & Trân châu dẻo', sAmt: 100, sUnit: 'ml' },
    { title: 'Sinh Tố Bơ Dừa Sáp Trà Vinh Béo Ngậy Mịn Màng', reg: 'nam', cost: 52000, cal: 320, main: 'Bơ sáp 034 chín dẻo ruột vàng', mAmt: 350, mUnit: 'g', sec: 'Cơm dừa sáp béo ngậy đặc sánh', sAmt: 150, sUnit: 'g' },
    { title: 'Chè Bưởi Hồng Táo Đỏ Kỷ Tử Dưỡng Nhan Sáng Da', reg: 'trung', cost: 40000, cal: 160, main: 'Tép bưởi hồng tươi mọng nước', mAmt: 250, mUnit: 'g', sec: 'Táo đỏ, kỷ tử ninh đường phèn thanh', sAmt: 100, sUnit: 'g' }
  ];

  thucUongDefs.forEach((d) => {
    recipes.push({
      title: d.title,
      desc: `${d.title}: Thức uống tráng miệng dưỡng nhan thanh mát, giàu vitamin và khoáng chất tự nhiên tốt cho sức khỏe.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: d.mUnit,
      secName: d.sec,
      secAmt: d.sAmt,
      secUnit: d.sUnit,
      method: `Ép hoặc nấu chiết xuất hương vị thanh khiết từ trái cây và thảo mộc tự nhiên. Hòa cùng đá lạnh hoặc ướp mát trước khi thưởng thức.`,
      tip: `Bảo quản mát trong ngăn mát tủ lạnh để thức uống giữ trọn vẹn hương vị tươi mới và vitamin.`,
      chef: `Bí quyết đầu bếp: Nấu các loại nước thảo mộc dưỡng nhan trên lửa thật nhỏ và tắt bếp đậy nắp ủ 15 phút để tinh chất thảo mộc thôi ra từ từ mà không bị bốc hơi bay mất mùi thơm tinh tế.`,
      tags: ['Tráng Miệng', 'Dưỡng Nhan', 'Thanh Mát', 'Thức Uống', 'Sức Khỏe']
    });
  });

  // Map into 50 recipes: all 50 in Part 2 (vn-p2-mieng-001..050)
  return recipes.map((r, idx) => {
    const num = idx + 1;
    const id = `vn-p2-mieng-${String(num).padStart(3, '0')}`;
    return createRecipe({
      id,
      title: r.title,
      description: r.desc,
      category: 'trang-mieng',
      region: r.reg,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      calories: r.cal,
      estimatedCostVnd: r.cost,
      poolIndex: idx,
      ingredients: [
        { name: r.ingName, amount: r.ingAmt, unit: r.ingUnit, category: 'rau-cu' },
        { name: r.secName, amount: r.secAmt, unit: r.secUnit, category: 'rau-cu' },
        { name: 'Đường phèn kết tinh Quảng Ngãi', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Nước cốt dừa tươi nguyên chất', amount: 100, unit: 'ml', category: 'gia-vi' },
        { name: 'Lá dứa (lá nếp) tươi thơm nức', amount: 3, unit: 'nhánh', category: 'rau-cu' },
        { name: 'Muối hạt tinh khiết', amount: 0.5, unit: 'muỗng cà phê', category: 'gia-vi' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Làm sạch nguyên liệu tráng miệng',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Làm sạch các loại hạt, trái cây hoặc củ với nước lạnh. Ngâm nở các loại thảo mộc hoặc gọt vỏ cắt miếng vừa ăn đẹp mắt.',
          tip: 'Sơ chế khéo léo giúp nguyên liệu giữ trọn hương vị tươi mát và màu sắc tự nhiên bắt mắt.'
        },
        {
          step: 2,
          title: 'Nấu nước đường & Hòa quyện hương vị',
          durationMinutes: 5,
          heatLevel: 'lửa vừa',
          content: 'Đun sôi nước với lá dứa và đường phèn cho tan chảy hoàn toàn, dậy mùi thơm thanh dịu khắp gian bếp gia đình.',
          tip: 'Hớt bọt nước đường thường xuyên để nước chè trong vắt óng ánh.'
        },
        {
          step: 3,
          title: 'Nấu chín nguyên liệu & Canh lửa',
          durationMinutes: 8,
          heatLevel: 'lửa nhỏ',
          content: r.method,
          tip: r.tip
        },
        {
          step: 4,
          title: 'Hoàn thiện & Thưởng thức thanh mát',
          durationMinutes: 2,
          heatLevel: 'không dùng nhiệt',
          content: 'Múc món tráng miệng ra chén sứ hoặc ly thủy tinh, có thể dùng nóng ấm hoặc thêm đá lạnh tùy sở thích gia đình.',
          tip: 'Dùng cùng vài viên đá bi mát lạnh sẽ mang lại cảm giác sảng khoái tuyệt vời sau bữa ăn.'
        }
      ],
      tags: r.tags,
      chefTip: r.chef,
      difficulty: 'Dễ'
    });
  });
}

console.log('generateAllTrangMieng defined.');
