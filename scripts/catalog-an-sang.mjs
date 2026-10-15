import { POOLS, pickImg } from './recipe-pools.mjs';

function createRecipe({
  id,
  title,
  description,
  category = 'an-sang',
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
  const imageUrl = pickImg('breakfast', poolIndex);
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

export function generateAllAnSang() {
  const recipes = [];

  // Group 1: Phở & Bún (30 dishes)
  const phoBunDefs = [
    { title: 'Phở Bò Tái Lăn Hà Nội Thơm Nức', reg: 'bac', cost: 72000, cal: 480, main: 'Thịt thăn bò tươi thái mỏng', mAmt: 350, mUnit: 'g', sec: 'Bánh phở tươi Hà Nội sợi mềm', sAmt: 600, sUnit: 'g' },
    { title: 'Phở Gà Ta Lá Chanh Nước Dùng Thanh', reg: 'bac', cost: 68000, cal: 420, main: 'Thịt gà ta thả vườn nửa con', mAmt: 600, mUnit: 'g', sec: 'Bánh phở tươi sợi nhỏ', sAmt: 600, sUnit: 'g' },
    { title: 'Phở Bò Sốt Vang Rượu Vang Đỏ', reg: 'bac', cost: 75000, cal: 520, main: 'Dẻ sườn bò ướp sốt vang gấc', mAmt: 400, mUnit: 'g', sec: 'Bánh phở tươi dẻo dai', sAmt: 600, sUnit: 'g' },
    { title: 'Phở Cuốn Bò Xào Rau Thơm Phố Trúc Bạch', reg: 'bac', cost: 65000, cal: 390, main: 'Thịt bò phi lê xào tỏi thơm', mAmt: 300, mUnit: 'g', sec: 'Bánh phở cuốn bản vuông tươi', sAmt: 500, sUnit: 'g' },
    { title: 'Bún Bò Huế Chả Cua Giò Heo Đậm Đà', reg: 'trung', cost: 75000, cal: 530, main: 'Bắp bò hoa & Giò heo khoanh', mAmt: 450, mUnit: 'g', sec: 'Bún sợi to xứ Huế', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Riêu Cua Đồng Đậu Mơ Giòn Rụm', reg: 'bac', cost: 58000, cal: 410, main: 'Cua đồng xay giã lọc lấy rêu', mAmt: 350, mUnit: 'g', sec: 'Bún rối tươi sợi nhỏ', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Mọc Sườn Non Dọc Mùng Thanh Mát', reg: 'bac', cost: 62000, cal: 440, main: 'Sườn non heo & Giò sống viên mọc', mAmt: 400, mUnit: 'g', sec: 'Bún tươi dẻo dai', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Thang Phố Cổ Hà Nội Tinh Hoa', reg: 'bac', cost: 72000, cal: 430, main: 'Thịt gà xé & Giò lụa thái chỉ', mAmt: 350, mUnit: 'g', sec: 'Bún rối sợi nhỏ', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Chả Cá Quy Nhơn Nước Dùng Ngọt Thanh', reg: 'trung', cost: 56000, cal: 400, main: 'Chả cá thu quết chiên vàng', mAmt: 350, mUnit: 'g', sec: 'Bún tươi sợi mảnh', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Cá Rô Đồng Rau Cải Xanh Thái Bình', reg: 'bac', cost: 58000, cal: 390, main: 'Cá rô đồng luộc gỡ thịt chiên giòn', mAmt: 350, mUnit: 'g', sec: 'Bún tươi sợi vừa', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Thịt Nướng Sả Ớt Miền Nam Đậm Vị', reg: 'nam', cost: 65000, cal: 490, main: 'Thịt nạc dăm ướp sả nướng than', mAmt: 400, mUnit: 'g', sec: 'Bún tươi cọng trắng', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Sứa Nha Trang Giòn Sần Sật Mát Lành', reg: 'trung', cost: 62000, cal: 360, main: 'Sứa biển tươi ngâm giòn mát', mAmt: 350, mUnit: 'g', sec: 'Bún tươi miền Trung', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Ốc Nguội Giấm Bỗng Thanh Tao Phố Cổ', reg: 'bac', cost: 58000, cal: 370, main: 'Ốc nhồi đồng luộc giòn sần sật', mAmt: 400, mUnit: 'g', sec: 'Bún lá sợi nhỏ nắm tròn', sAmt: 500, sUnit: 'g' },
    { title: 'Bún Mắm Miền Tây Đậm Vị Sông Nước', reg: 'nam', cost: 74000, cal: 540, main: 'Tôm sú tươi & Thịt heo quay giòn', mAmt: 400, mUnit: 'g', sec: 'Bún tươi miền Tây', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Sườn Chua Dọc Mùng Hà Nội Bữa Sáng', reg: 'bac', cost: 60000, cal: 430, main: 'Sườn non heo luộc chặt miếng', mAmt: 400, mUnit: 'g', sec: 'Bún tươi trắng muốt', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Chả Giò Giòn Rụm Rau Sống Nước Mắm Tỏi', reg: 'nam', cost: 58000, cal: 470, main: 'Chả giò tôm thịt chiên giòn rụm', mAmt: 12, mUnit: 'cái', sec: 'Bún tươi sợi tơi', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Riêu Ốc Đậu Phụ Cà Chua Thơm Lừng', reg: 'bac', cost: 62000, cal: 420, main: 'Ốc bươu đồng xào tía tô & Rêu cua', mAmt: 350, mUnit: 'g', sec: 'Bún rối tươi trắng', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Mắm Nêm Thịt Luộc Đà Nẵng Thơm Cay', reg: 'trung', cost: 60000, cal: 450, main: 'Thịt ba chỉ heo luộc thái mỏng', mAmt: 350, mUnit: 'g', sec: 'Bún tươi miền Trung', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Lòng Heo Nghệ Tươi Nồng Nàn Xứ Huế', reg: 'trung', cost: 58000, cal: 430, main: 'Lòng non và dồi heo làm sạch', mAmt: 350, mUnit: 'g', sec: 'Bún tươi dẻo ngọt', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Chả Hà Nội Than Hoa Nước Chấm Đu Đủ', reg: 'bac', cost: 68000, cal: 490, main: 'Chả viên & Thịt ba chỉ nướng than hoa', mAmt: 450, mUnit: 'g', sec: 'Bún lá hoặc bún rối Hà Nội', sAmt: 600, sUnit: 'g' },
    { title: 'Phở Bò Tái Nạm Nước Trong Thơm Quế Hồi', reg: 'bac', cost: 72000, cal: 470, main: 'Nạm bò mềm & Bắp bò thái lát mỏng', mAmt: 400, mUnit: 'g', sec: 'Bánh phở tươi sợi mỏng mềm', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Đậu Hũ Chiên Giòn Mắm Tôm Chanh Ớt', reg: 'bac', cost: 42000, cal: 380, main: 'Đậu phụ Mơ chiên vàng giòn rụm', mAmt: 4, mUnit: 'bìa', sec: 'Bún lá cắt miếng vừa ăn', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Kèn Nước Cốt Dừa Phú Quốc Thơm Béo', reg: 'nam', cost: 65000, cal: 460, main: 'Cá ngân xay nhuyễn nấu nước cốt dừa', mAmt: 350, mUnit: 'g', sec: 'Bún tươi Phú Quốc', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Nước Lèo Sóc Trăng Ngọt Cá Đồng', reg: 'nam', cost: 66000, cal: 420, main: 'Cá lóc đồng luộc rỉa thịt & Tôm sú', mAmt: 380, mUnit: 'g', sec: 'Bún tươi miền Tây sợi dai', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Gà Nấu Măng Tươi Nước Dùng Trong Veo', reg: 'bac', cost: 64000, cal: 430, main: 'Thịt đùi gà ta chặt miếng vừa ăn', mAmt: 450, mUnit: 'g', sec: 'Bún tươi sợi nhỏ thanh mát', sAmt: 600, sUnit: 'g' },
    { title: 'Phở Bò Gầu Giòn Béo Ngậy Đậm Đà Xương Ống', reg: 'bac', cost: 74000, cal: 510, main: 'Gầu bò giòn thái lát mỏng ngậy', mAmt: 380, mUnit: 'g', sec: 'Bánh phở tươi Nam Định', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Cá Ngừ Um Khóm Chuẩn Vị Miền Trung', reg: 'trung', cost: 58000, cal: 390, main: 'Cá ngừ tươi cắt khoanh um khóm chua', mAmt: 400, mUnit: 'g', sec: 'Bún tươi miền Trung sợi dài', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Bò Giò Heo Đà Nẵng Nước Dùng Ngọt Thanh', reg: 'trung', cost: 70000, cal: 500, main: 'Bắp bò hoa & Móng giò heo ninh mềm', mAmt: 450, mUnit: 'g', sec: 'Bún tươi dẻo thơm', sAmt: 600, sUnit: 'g' },
    { title: 'Bún Suông Trà Vinh Tôm Quết Nước Cốt Dừa', reg: 'nam', cost: 68000, cal: 440, main: 'Chả tôm sú quết dài chiên vàng', mAmt: 350, mUnit: 'g', sec: 'Bún tươi sợi mướt', sAmt: 600, sUnit: 'g' },
    { title: 'Phở Trộn Thịt Gà Ta Xé Nước Sốt Chua Ngọt', reg: 'bac', cost: 65000, cal: 430, main: 'Thịt ức gà xé phay & Lạc rang giòn', mAmt: 380, mUnit: 'g', sec: 'Bánh phở tươi trần ráo nước', sAmt: 600, sUnit: 'g' }
  ];

  phoBunDefs.forEach((d) => {
    recipes.push({
      title: d.title,
      desc: `${d.title}: Bữa sáng thơm ngon, cung cấp năng lượng tràn đầy cho cả gia đình ngày mới hứng khởi.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: d.mUnit,
      secName: d.sec,
      secAmt: d.sAmt,
      secUnit: d.sUnit,
      method: `Trần bánh phở hoặc bún qua nước sôi, xếp vào tô. Xếp các loại thịt thơm ngon lên trên. Chan nước dùng sôi sùng sục ngập mặt bún, rắc hành ngò thái nhỏ và thưởng thức nóng hổi.`,
      tip: `Trần thật kỹ sợi bún phở qua nước sôi để tô bún giữ trọn độ nóng bỏng thơm nức từ đầu đến cuối bữa.`,
      chef: `Bí quyết đầu bếp: Nước dùng phải sôi sùng sục trên bếp khi chan vào tô, kết hợp với hành hoa chần tái để giữ trọn vẹn hương vị tinh túy của bát phở bún truyền thống Việt Nam.`,
      tags: ['Ăn Sáng', 'Phở & Bún', 'Nóng Hổi', 'Năng Lượng', 'Gia Đình']
    });
  });

  // Group 2: Hủ tiếu, Mì & Miến (25 dishes)
  const miHuTieuDefs = [
    { title: 'Hủ Tiếu Nam Vang Nước Dùng Tôm Thịt Đậm Vị', reg: 'nam', cost: 68000, cal: 470, main: 'Thịt nạc băm & Tim cật heo tươi', mAmt: 350, mUnit: 'g', sec: 'Hủ tiếu dai Nam Vang', sAmt: 500, sUnit: 'g' },
    { title: 'Hủ Tiếu Mỹ Tho Sườn Non Mực Khô Ngọt Nước', reg: 'nam', cost: 70000, cal: 480, main: 'Sườn non heo & Mực khô nướng', mAmt: 400, mUnit: 'g', sec: 'Hủ tiếu Mỹ Tho sợi dai trong', sAmt: 500, sUnit: 'g' },
    { title: 'Hủ Tiếu Sa Tế Bò Đậm Vị Cay Nồng Nam Bộ', reg: 'nam', cost: 72000, cal: 520, main: 'Bắp bò hoa thái mỏng sốt sa tế', mAmt: 380, mUnit: 'g', sec: 'Hủ tiếu mềm sợi dẻo', sAmt: 500, sUnit: 'g' },
    { title: 'Hủ Tiếu Mực Tươi Giòn Ngọt Cần Tây Bữa Sáng', reg: 'nam', cost: 68000, cal: 410, main: 'Mực tươi cắt khoanh tròn giòn ngọt', mAmt: 380, mUnit: 'g', sec: 'Hủ tiếu dai trụng ráo nước', sAmt: 500, sUnit: 'g' },
    { title: 'Miến Lươn Giòn Nghệ An Nước Dùng Xương Ống', reg: 'trung', cost: 75000, cal: 430, main: 'Thịt lươn đồng tẩm bột chiên giòn tan', mAmt: 350, mUnit: 'g', sec: 'Miến dong riềng dẻo dai', sAmt: 400, sUnit: 'g' },
    { title: 'Miến Gà Ta Măng Khô Nước Dùng Vàng Óng', reg: 'bac', cost: 66000, cal: 420, main: 'Thịt gà ta luộc xé & Măng khô ngâm', mAmt: 400, mUnit: 'g', sec: 'Miến dong Bắc sợi trong', sAmt: 400, sUnit: 'g' },
    { title: 'Mì Quảng Gà Ta Đậm Đà Xứ Quảng Hương Củ Nén', reg: 'trung', cost: 68000, cal: 490, main: 'Thịt đùi gà ta xào săn củ nén', mAmt: 450, mUnit: 'g', sec: 'Mì Quảng sợi vàng dẻo dai', sAmt: 500, sUnit: 'g' },
    { title: 'Mì Quảng Tôm Thịt Bánh Tráng Mè Đậu Phộng', reg: 'trung', cost: 68000, cal: 510, main: 'Tôm đất & Thịt ba rọi rim đậm đà', mAmt: 400, mUnit: 'g', sec: 'Bánh tráng nướng & Mì Quảng', sAmt: 500, sUnit: 'g' },
    { title: 'Hủ Tiếu Bò Kho Sả Ớt Bánh Mì Nóng Giòn', reg: 'nam', cost: 74000, cal: 540, main: 'Nạm bò ninh mềm hạt điều sả ớt', mAmt: 450, mUnit: 'g', sec: 'Hủ tiếu dai sợi nhỏ', sAmt: 500, sUnit: 'g' },
    { title: 'Mì Hoành Thánh Xá Xíu Nước Lèo Xương Hầm', reg: 'nam', cost: 65000, cal: 460, main: 'Thịt xá xíu đỏ mềm & Hoành thánh thịt', mAmt: 380, mUnit: 'g', sec: 'Mì trứng tươi sợi vàng óng', sAmt: 450, sUnit: 'g' },
    { title: 'Hủ Tiếu Gõ Giò Heo Nước Trong Bình Dân Đậm Vị', reg: 'nam', cost: 55000, cal: 480, main: 'Móng giò heo chặt khoanh ninh mềm', mAmt: 450, mUnit: 'g', sec: 'Hủ tiếu khô trụng mềm dai', sAmt: 500, sUnit: 'g' },
    { title: 'Miến Ngan Măng Tươi Tiêu Đen Phố Cổ Hà Nội', reg: 'bac', cost: 72000, cal: 450, main: 'Thịt ngan luộc thái dày & Măng le tươi', mAmt: 450, mUnit: 'g', sec: 'Miến dong sợi dai giòn', sAmt: 400, sUnit: 'g' },
    { title: 'Mì Xào Giòn Hải Sản Rau Củ Sốt Dầu Hào', reg: 'nam', cost: 72000, cal: 520, main: 'Mực, tôm sú & Cải thìa non xanh', mAmt: 400, mUnit: 'g', sec: 'Vắt mì trứng chiên giòn rụm', sAmt: 4, sUnit: 'vắt' },
    { title: 'Miến Xào Cua Bể Rau Củ Nước Dùng Thanh', reg: 'bac', cost: 75000, cal: 440, main: 'Thịt cua bể gỡ tươi xào thơm', mAmt: 300, mUnit: 'g', sec: 'Miến dong sợi tơi không dính', sAmt: 350, sUnit: 'g' },
    { title: 'Mì Trộn Muối Ớt Trứng Lòng Đào Tôm Khô', reg: 'nam', cost: 52000, cal: 460, main: 'Trứng gà lòng đào & Tôm khô rim béo', mAmt: 4, mUnit: 'quả', sec: 'Mì gói trụng vừa chín tới', sAmt: 4, sUnit: 'gói' },
    { title: 'Hủ Tiếu Khô Sa Đéc Nước Sốt Cay Ngọt Đậm Đà', reg: 'nam', cost: 65000, cal: 480, main: 'Thịt nạc xá xíu & Tôm sú luộc', mAmt: 350, mUnit: 'g', sec: 'Bánh hủ tiếu bột lọc Sa Đéc', sAmt: 500, sUnit: 'g' },
    { title: 'Miến Nấu Tim Cật Tiêu Đen Rau Ngót Thanh Mát', reg: 'bac', cost: 60000, cal: 400, main: 'Tim heo & Cật heo tươi khía hoa', mAmt: 350, mUnit: 'g', sec: 'Miến dong sợi dai', sAmt: 400, sUnit: 'g' },
    { title: 'Mì Vịt Tiềm Thuốc Bắc Nấm Đông Cô Bổ Dưỡng', reg: 'nam', cost: 75000, cal: 550, main: 'Đùi vịt chiên sơ tiềm thảo mộc', mAmt: 500, mUnit: 'g', sec: 'Mì trứng tươi sợi vàng', sAmt: 450, sUnit: 'g' },
    { title: 'Hủ Tiếu Sườn Non Nấu Củ Cải Trắng Ngọt Lịm', reg: 'nam', cost: 62000, cal: 450, main: 'Sườn heo non chặt khúc vừa ăn', mAmt: 400, mUnit: 'g', sec: 'Hủ tiếu dai Nam Bộ', sAmt: 500, sUnit: 'g' },
    { title: 'Miến Xào Lòng Gà Mề Cháy Tỏi Hành Hoa', reg: 'bac', cost: 52000, cal: 430, main: 'Lòng gà tươi làm sạch xào cháy cạnh', mAmt: 350, mUnit: 'g', sec: 'Miến dong ngâm mềm để ráo', sAmt: 350, sUnit: 'g' },
    { title: 'Mì Xào Bò Cải Ngọt Sốt Dầu Hào Thơm Nức', reg: 'bac', cost: 65000, cal: 490, main: 'Thịt bò xào tái mềm ngọt mọng', mAmt: 350, mUnit: 'g', sec: 'Mì trứng vàng óng sợi dai', sAmt: 400, sUnit: 'g' },
    { title: 'Hủ Tiếu Hồ Lòng Heo Cải Chua Đậm Đà Triều Châu', reg: 'nam', cost: 64000, cal: 480, main: 'Lòng heo khìa cải chua giòn sần sật', mAmt: 400, mUnit: 'g', sec: 'Bánh hủ tiếu hồ bản to mỏng', sAmt: 500, sUnit: 'g' },
    { title: 'Miến Hải Sản Nước Dùng Tôm Nấu Chua Cay', reg: 'trung', cost: 72000, cal: 420, main: 'Tôm mực nghêu tươi giòn ngọt', mAmt: 400, mUnit: 'g', sec: 'Miến dong sợi tơi mướt', sAmt: 400, sUnit: 'g' },
    { title: 'Mì Sườn Kho Tiêu Đen Nước Lèo Nóng Bỏng', reg: 'nam', cost: 65000, cal: 480, main: 'Sườn heo ướp tiêu đen kho đậm đà', mAmt: 400, mUnit: 'g', sec: 'Mì tươi sợi nhỏ', sAmt: 450, sUnit: 'g' },
    { title: 'Hủ Tiếu Cá Lóc Phi Lê Nước Dùng Ngọt Thanh', reg: 'nam', cost: 60000, cal: 390, main: 'Cá lóc phi lê thái lát mỏng', mAmt: 400, mUnit: 'g', sec: 'Hủ tiếu dai Nam Bộ', sAmt: 500, sUnit: 'g' }
  ];

  miHuTieuDefs.forEach((d) => {
    // Ensure standard units (no 'vắt' or 'gói' which might be seen as packaging units)
    let sUnitClean = d.sUnit;
    let sAmtClean = d.sAmt;
    if (sUnitClean === 'vắt' || sUnitClean === 'gói') {
      sUnitClean = 'g';
      sAmtClean = 350;
    }
    recipes.push({
      title: d.title,
      desc: `${d.title}: Bữa sáng thơm lành đậm đà hương vị truyền thống, giàu đạm và tinh bột sạch cho cả gia đình.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: d.mUnit,
      secName: d.sec,
      secAmt: sAmtClean,
      secUnit: sUnitClean,
      method: `Trần mì hoặc miến qua nước sôi vừa chín tới, xả nước lạnh để sợi không bị dính. Nấu nước lèo đậm đà sôi bùng. Múc mì ra tô, bày đồ ăn kèm lên rồi chan ngập nước dùng thơm nức.`,
      tip: `Sợi mì trứng hay miến dong trụng vừa chín tới giữ được độ dai sần sật không bị bở nát.`,
      chef: `Bí quyết đầu bếp: Nước lèo hầm xương cần vớt bọt liên tục trên lửa nhỏ liu riu, nêm chút hành khô phi vàng để tạo độ bóng và mùi thơm đặc trưng của các món sợi Việt.`,
      tags: ['Ăn Sáng', 'Hủ Tiếu & Mì', 'Nóng Hổi', 'Đậm Đà', 'Dinh Dưỡng']
    });
  });

  // Group 3: Bánh mì & Xôi (25 dishes)
  const banhMiXoiDefs = [
    { title: 'Bánh Mì Thịt Nướng Sả Ớt Giòn Rụm Sài Gòn', reg: 'nam', cost: 48000, cal: 460, main: 'Thịt nạc dăm ướp sả nướng vàng', mAmt: 350, mUnit: 'g', sec: 'Bánh mì baguette vỏ giòn ruột xốp', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Chảo Trứng Ốp La Xúc Xích Pate Cột Đèn', reg: 'bac', cost: 58000, cal: 520, main: 'Pate gan heo thơm béo & Trứng gà ta', mAmt: 250, mUnit: 'g', sec: 'Bánh mì nướng nóng giòn tan', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Xíu Mại Sốt Cà Chua Phố Núi Đà Lạt', reg: 'trung', cost: 50000, cal: 450, main: 'Viên xíu mại thịt heo mềm ngập sốt', mAmt: 350, mUnit: 'g', sec: 'Bánh mì đặc ruột giòn thơm', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Pate Chả Lụa Nước Sốt Bơ Trứng Thơm Ngậy', reg: 'nam', cost: 46000, cal: 440, main: 'Chả lụa heo thượng hạng & Bơ tươi', mAmt: 300, mUnit: 'g', sec: 'Bánh mì giòn rụm nóng hổi', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Cá Mòi Sốt Cà Hành Tây Chua Ngọt', reg: 'nam', cost: 45000, cal: 410, main: 'Cá mòi rim sốt cà chua đậm đà', mAmt: 300, mUnit: 'g', sec: 'Bánh mì nướng vàng thơm', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Chả Cá Nha Trang Nóng Giòn Rau Răm', reg: 'trung', cost: 48000, cal: 420, main: 'Chả cá nhồng chiên nóng thái sợi', mAmt: 350, mUnit: 'g', sec: 'Bánh mì vỏ giòn thơm phức', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Heo Quay Da Giòn Nước Tương Đậm Đà', reg: 'nam', cost: 55000, cal: 510, main: 'Thịt heo quay nổ bì giòn rụm', mAmt: 350, mUnit: 'g', sec: 'Bánh mì baguette truyền thống', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Gà Xé Nấm Hương Sốt Bơ Dầu Trứng', reg: 'bac', cost: 48000, cal: 430, main: 'Thịt ức gà ta xé sợi ướp đậm đà', mAmt: 350, mUnit: 'g', sec: 'Bánh mì nóng thơm lừng', sAmt: 4, sUnit: 'ổ' },
    { title: 'Bánh Mì Bì Thịt Nạc Thính Nước Mắm Tỏi Ớt', reg: 'nam', cost: 45000, cal: 390, main: 'Bì heo sợi trộn thính gạo rang', mAmt: 300, mUnit: 'g', sec: 'Bánh mì giòn rụm Sài Gòn', sAmt: 4, sUnit: 'ổ' },
    { title: 'Xôi Xéo Hà Nội Mỡ Hành Ruốc Đậu Xanh Vàng Óng', reg: 'bac', cost: 40000, cal: 480, main: 'Đậu xanh đồ nhuyễn viên tròn cắt lát', mAmt: 250, mUnit: 'g', sec: 'Gạo nếp cái hoa vàng đồ dẻo thơm', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Khúc Lá Khúc Đỗ Xanh Thịt Ba Chỉ Tiêu Đen', reg: 'bac', cost: 45000, cal: 470, main: 'Rau khúc tươi & Thịt ba chỉ ướp tiêu', mAmt: 300, mUnit: 'g', sec: 'Gạo nếp dẻo thơm hạt bóng', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Gà Xé Nấm Hương Nước Dừa Dẻo Bùi', reg: 'nam', cost: 55000, cal: 490, main: 'Gà ta xé sợi rim mỡ hành nấm hương', mAmt: 350, mUnit: 'g', sec: 'Nếp dẻo đồ cốt dừa thơm béo', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Gấc Hạt Sen Đỏ Thắm Dẻo Bùi Ngọt Lành', reg: 'bac', cost: 45000, cal: 440, main: 'Thịt quả gấc đỏ & Hạt sen tươi ninh bùi', mAmt: 250, mUnit: 'g', sec: 'Gạo nếp cái hoa vàng hạt mọng', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Lạc Vừng Dừa Nạo Thơm Ngậy Mộc Mạc', reg: 'bac', cost: 35000, cal: 430, main: 'Lạc nhân đỏ bùi bùi & Dừa nạo sợi', mAmt: 200, mUnit: 'g', sec: 'Gạo nếp nương đồ dẻo', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Bắp Nhão Nước Cốt Dừa Mè Rang Tuổi Thơ', reg: 'nam', cost: 38000, cal: 410, main: 'Bắp nếp bào mỏng & Nước cốt dừa béo', mAmt: 300, mUnit: 'g', sec: 'Nếp hạt dẻo đồ bắp ngọt thanh', sAmt: 350, sUnit: 'g' },
    { title: 'Xôi Mặn Thập Cẩm Lạp Xưởng Chà Bông Tép Rim', reg: 'nam', cost: 55000, cal: 520, main: 'Lạp xưởng Mai Quế Lộ & Chà bông heo', mAmt: 300, mUnit: 'g', sec: 'Xôi nếp trắng dẻo thơm rưới mỡ hành', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Chim Bồ Câu Băm Nếp Nương Thơm Lừng', reg: 'bac', cost: 72000, cal: 510, main: 'Thịt chim bồ câu băm nhuyễn xào hành', mAmt: 350, mUnit: 'g', sec: 'Gạo nếp nương Điện Biên dẻo ngọt', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Vò Đậu Xanh Tơi Xốp Hạt Nếp Dẻo Vàng', reg: 'bac', cost: 38000, cal: 420, main: 'Đậu xanh bóc vỏ đồ chín đánh tơi', mAmt: 250, mUnit: 'g', sec: 'Gạo nếp đồ hai lửa tơi từng hạt', sAmt: 400, sUnit: 'g' },
    { title: 'Xôi Sắn Hành Mỡ Heo Béo Bùi Đồng Quê Bắc Bộ', reg: 'bac', cost: 35000, cal: 400, main: 'Củ sắn bở bùi cắt quân cờ', mAmt: 300, mUnit: 'g', sec: 'Nếp hương đồ cùng sắn dẻo quánh', sAmt: 350, sUnit: 'g' },
    { title: 'Bánh Mì Bò Kho Sả Ớt Nóng Hổi Chấm Bánh Mì', reg: 'nam', cost: 72000, cal: 530, main: 'Nạm bò hầm sốt vang quế hồi', mAmt: 450, mUnit: 'g', sec: 'Bánh mì nướng giòn rụm', sAmt: 4, sUnit: 'ổ' },
    { title: 'Xôi Cốm Hạt Sen Dừa Nạo Mùa Thu Hà Nội', reg: 'bac', cost: 50000, cal: 390, main: 'Hạt sen Huế ninh bùi & Dừa tươi xào đường', mAmt: 200, mUnit: 'g', sec: 'Cốm non mùa thu đồ dẻo thơm', sAmt: 350, sUnit: 'g' },
    { title: 'Bánh Mì Trứng Đúc Thịt Băm Hành Lá Giòn Thơm', reg: 'nam', cost: 42000, cal: 420, main: 'Trứng gà ta đúc thịt heo băm', mAmt: 300, mUnit: 'g', sec: 'Bánh mì nướng giòn vỏ ruột mềm', sAmt: 4, sUnit: 'ổ' },
    { title: 'Xôi Lá Cẩm Nước Cốt Dừa Màu Tím Biếc Thơm Lành', reg: 'nam', cost: 42000, cal: 440, main: 'Nước cốt lá cẩm tím tự nhiên', mAmt: 150, mUnit: 'ml', sec: 'Gạo nếp cái ngâm lá cẩm đồ mềm', sAmt: 400, sUnit: 'g' },
    { title: 'Bánh Mì Thịt Nguội Jambon Bơ Tươi Pate Béo', reg: 'nam', cost: 52000, cal: 460, main: 'Thịt jambon da bao & Chả quế', mAmt: 300, mUnit: 'g', sec: 'Bánh mì vỏ giòn tan đặc ruột', sAmt: 4, sUnit: 'ổ' },
    { title: 'Xôi Đậu Đen Đường Phèn Nước Cốt Dừa Dẻo Thơm', reg: 'bac', cost: 36000, cal: 410, main: 'Đậu đen xanh lòng ninh bở tơi', mAmt: 200, mUnit: 'g', sec: 'Gạo nếp đồ cùng đậu đen óng mượt', sAmt: 400, sUnit: 'g' }
  ];

  banhMiXoiDefs.forEach((d) => {
    // Avoid non-standard units if any (like 'ổ' -> let's make sure 'ổ' is considered valid or replace with 'cái')
    // Valid units: 'g', 'ml', 'muỗng canh', 'muỗng cà phê', 'quả', 'củ', 'nhánh', 'bó', 'tép', 'lát', 'trái', 'bìa', 'nắm', 'cái'
    let sUnitClean = d.sUnit === 'ổ' ? 'cái' : d.sUnit;
    recipes.push({
      title: d.title,
      desc: `${d.title}: Món điểm tâm quen thuộc gắn liền với nhịp sống người Việt, giòn ngon đậm vị và tiện lợi.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: d.mUnit,
      secName: d.sec,
      secAmt: d.sAmt,
      secUnit: sUnitClean,
      method: `Chuẩn bị phần nhân xào thơm chín tới hoặc đồ xôi chín dẻo bóng hạt. Làm nóng bánh mì hoặc xới xôi ra đĩa, xếp đầy đặn phần nhân thơm nức lên trên cùng dưa chua và rau thơm.`,
      tip: `Bánh mì nướng qua nhiệt độ cao cho vỏ giòn rụm trước khi kẹp nhân giữ trọn độ thơm ngon.`,
      chef: `Bí quyết đầu bếp: Xôi đồ hai lửa với chút dầu mỡ phi hành sẽ giữ được độ dẻo mềm mọng suốt cả buổi sáng mà hạt nếp không bao giờ bị lại gạo hay khô cứng.`,
      tags: ['Ăn Sáng', 'Bánh Mì & Xôi', 'Dẻo Thơm', 'Giòn Rụm', 'Dinh Dưỡng']
    });
  });

  // Group 4: Cháo & Bánh truyền thống (20 dishes)
  const chaoBanhDefs = [
    { title: 'Cháo Sườn Sụn Phố Cổ Hà Nội Quẩy Giòn Ruốc', reg: 'bac', cost: 52000, cal: 390, main: 'Sườn sụn heo ninh mềm nhừ', mAmt: 350, mUnit: 'g', sec: 'Bột gạo tẻ xay mịn nấu cháo hoa', sAmt: 300, sUnit: 'g' },
    { title: 'Cháo Lòng Nóng Hổi Hành Hoa Tiêu Đen Đậm Vị', reg: 'bac', cost: 56000, cal: 440, main: 'Lòng dồi heo tươi luộc chín tới', mAmt: 400, mUnit: 'g', sec: 'Gạo tẻ thơm rang vàng nấu sánh', sAmt: 250, sUnit: 'g' },
    { title: 'Cháo Lươn Đồng Nghệ An Nghệ Tươi Nồng Nàn', reg: 'trung', cost: 65000, cal: 410, main: 'Lươn đồng tươi xào nghệ ớt thơm cay', mAmt: 350, mUnit: 'g', sec: 'Cháo gạo ninh nhừ ngọt thanh', sAmt: 300, sUnit: 'g' },
    { title: 'Cháo Cá Lóc Rau Đắng Miền Tây Ngọt Bùi', reg: 'nam', cost: 58000, cal: 370, main: 'Cá lóc đồng phi lê luộc rỉa thịt', mAmt: 400, mUnit: 'g', sec: 'Gạo rang nấu cháo hoa bung nở', sAmt: 250, sUnit: 'g' },
    { title: 'Cháo Gà Ta Hạt Sen Ninh Bổ Dưỡng Ấm Bụng', reg: 'bac', cost: 65000, cal: 430, main: 'Thịt gà ta thả vườn & Hạt sen tươi', mAmt: 450, mUnit: 'g', sec: 'Gạo nếp và gạo tẻ nấu sánh', sAmt: 300, sUnit: 'g' },
    { title: 'Cháo Chim Cút Đậu Xanh Bùi Béo Bổ Não', reg: 'nam', cost: 62000, cal: 450, main: 'Thịt chim cút làm sạch ninh nhừ', mAmt: 400, mUnit: 'g', sec: 'Đậu xanh cà vỏ nấu gạo dẻo', sAmt: 300, sUnit: 'g' },
    { title: 'Cháo Hàu Sữa Biển Nấu Nấm Rơm Thơm Béo', reg: 'trung', cost: 68000, cal: 380, main: 'Ruột hàu sữa tươi béo múp míp', mAmt: 350, mUnit: 'g', sec: 'Cháo gạo ninh nhuyễn sánh mịn', sAmt: 250, sUnit: 'g' },
    { title: 'Bánh Cuốn Thanh Trì Chả Quế Nước Mắm Cà Cuống', reg: 'bac', cost: 50000, cal: 380, main: 'Chả quế nướng vàng & Hành phi thơm', mAmt: 300, mUnit: 'g', sec: 'Bánh cuốn tráng mỏng mềm mướt', sAmt: 500, sUnit: 'g' },
    { title: 'Bánh Ướt Lòng Gà Trứng Non Đà Lạt Đậm Vị', reg: 'trung', cost: 62000, cal: 460, main: 'Lòng gà xào & Trứng non béo bùi', mAmt: 350, mUnit: 'g', sec: 'Bánh ướt mềm mượt tráng mỏng', sAmt: 500, sUnit: 'g' },
    { title: 'Bánh Giò Nóng Thịt Nạc Mộc Nhĩ Trứng Cút', reg: 'bac', cost: 42000, cal: 410, main: 'Nhân thịt băm mộc nhĩ trứng cút', mAmt: 300, mUnit: 'g', sec: 'Bột gạo tẻ pha bột năng gói lá chuối', sAmt: 4, sUnit: 'cái' },
    { title: 'Bánh Bèo Chén Tôm Cháy Mỡ Hành Miền Trung', reg: 'trung', cost: 48000, cal: 370, main: 'Chà bông tôm đồng & Da heo chiên giòn', mAmt: 250, mUnit: 'g', sec: 'Bột gạo hấp chín xoáy tròn từng chén', sAmt: 16, sUnit: 'chén' },
    { title: 'Bánh Nậm Tôm Thịt Gói Lá Dong Xứ Huế', reg: 'trung', cost: 50000, cal: 360, main: 'Tôm băm thịt ba chỉ xào màu điều', mAmt: 300, mUnit: 'g', sec: 'Bột gạo dẻo mịn phết lá dong', sAmt: 12, sUnit: 'cái' },
    { title: 'Bánh Bột Lọc Trần Nhân Tôm Thịt Giòn Dai', reg: 'trung', cost: 52000, cal: 390, main: 'Tôm đất rim & Thịt mỡ xắt hạt lựu', mAmt: 300, mUnit: 'g', sec: 'Bột năng nhào nước sôi trong veo', sAmt: 350, sUnit: 'g' },
    { title: 'Bánh Xèo Miền Tây Giòn Rụm Tôm Nhảy Giá Đỗ', reg: 'nam', cost: 65000, cal: 520, main: 'Tôm đất, thịt ba rọi xào thơm', mAmt: 400, mUnit: 'g', sec: 'Bột bánh xèo nghệ cốt dừa đổ chảo', sAmt: 400, sUnit: 'g' },
    { title: 'Bánh Khọt Vũng Tàu Tôm Tươi Mỡ Hành Giòn Tan', reg: 'nam', cost: 62000, cal: 480, main: 'Tôm sú tươi bóc nõn đặt lên mặt bánh', mAmt: 350, mUnit: 'g', sec: 'Bột gạo chiên giòn khuôn đất', sAmt: 400, sUnit: 'g' },
    { title: 'Bánh Hỏi Heo Quay Lá Hẹ Mắm Nêm Bình Định', reg: 'trung', cost: 68000, cal: 490, main: 'Thịt heo quay da giòn rụm thái mỏng', mAmt: 400, mUnit: 'g', sec: 'Bánh hỏi đan lưới sợi mảnh phết lá hẹ', sAmt: 500, sUnit: 'g' },
    { title: 'Bánh Canh Cua Đồng Chả Cá Nước Dùng Sệt', reg: 'nam', cost: 68000, cal: 460, main: 'Thịt cua đồng & Chả cá quết dai', mAmt: 380, mUnit: 'g', sec: 'Sợi bánh canh bột lọc dai dẻo', sAmt: 500, sUnit: 'g' },
    { title: 'Bánh Canh Trảng Bàng Giò Heo Nước Trong Veo', reg: 'nam', cost: 65000, cal: 470, main: 'Khoanh giò heo luộc chấm mắm ớt', mAmt: 450, mUnit: 'g', sec: 'Sợi bánh canh bột gạo Tây Ninh', sAmt: 500, sUnit: 'g' },
    { title: 'Bánh Canh Chả Cá Nước Dùng Nấm Rơm Thanh Ngọt', reg: 'trung', cost: 55000, cal: 410, main: 'Chả cá thu chiên vàng & Nấm rơm tươi', mAmt: 350, mUnit: 'g', sec: 'Sợi bánh canh bột gạo mềm mướt', sAmt: 500, sUnit: 'g' },
    { title: 'Bánh Đúc Nóng Thịt Băm Mộc Nhĩ Nước Mắm Chan', reg: 'bac', cost: 42000, cal: 360, main: 'Thịt heo nạc băm xào mộc nhĩ hành hoa', mAmt: 300, mUnit: 'g', sec: 'Bột gạo quấy dẻo quánh mềm mượt', sAmt: 400, sUnit: 'g' }
  ];

  chaoBanhDefs.forEach((d) => {
    let sUnitClean = d.sUnit;
    let sAmtClean = d.sAmt;
    if (sUnitClean === 'chén') {
      sUnitClean = 'cái';
    }
    recipes.push({
      title: d.title,
      desc: `${d.title}: Món ăn truyền thống dân dã, ấm bụng và bổ dưỡng cho khởi đầu ngày mới tràn đầy sức sống.`,
      reg: d.reg,
      cost: d.cost,
      cal: d.cal,
      ingName: d.main,
      ingAmt: d.mAmt,
      ingUnit: d.mUnit,
      secName: d.sec,
      secAmt: sAmtClean,
      secUnit: sUnitClean,
      method: `Nấu cháo hoặc hấp chín phần bánh truyền thống. Bày ra tô hoặc đĩa nóng, múc nhân xào thơm lừng lên trên và chan nước dùng/nước mắm chua ngọt ấm nồng.`,
      tip: `Nấu cháo hoặc quấy bánh trên lửa nhỏ khuấy đều tay để bột không bị bén đáy nồi.`,
      chef: `Bí quyết đầu bếp: Trộn chút bột nếp vào bột gạo tẻ khi khuấy bánh đúc hoặc nấu cháo để món ăn có độ sánh mượt, dẻo thơm óng ả tự nhiên mà không bị vữa.`,
      tags: ['Ăn Sáng', 'Cháo & Bánh', 'Ấm Bụng', 'Truyền Thống', 'Dân Dã']
    });
  });

  // Map into 100 recipes: 50 in Part 1 (vn-p1-sang-001..050), 50 in Part 2 (vn-p2-sang-001..050)
  return recipes.map((r, idx) => {
    const isP1 = idx < 50;
    const num = isP1 ? idx + 1 : idx - 50 + 1;
    const id = isP1 ? `vn-p1-sang-${String(num).padStart(3, '0')}` : `vn-p2-sang-${String(num).padStart(3, '0')}`;
    return createRecipe({
      id,
      title: r.title,
      description: r.desc,
      category: 'an-sang',
      region: r.reg,
      prepTimeMinutes: 12,
      cookTimeMinutes: 20,
      calories: r.cal,
      estimatedCostVnd: r.cost,
      poolIndex: idx,
      ingredients: [
        { name: r.ingName, amount: r.ingAmt, unit: r.ingUnit, category: 'thit-ca' },
        { name: r.secName, amount: r.secAmt, unit: r.secUnit, category: 'rau-cu' },
        { name: 'Hành hoa & Ngò rí thái nhỏ', amount: 3, unit: 'nhánh', category: 'rau-cu' },
        { name: 'Nước mắm truyền thống cốt nhĩ', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Hạt tiêu đen xay nhuyễn', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
        { name: 'Ớt tươi thái lát vát', amount: 2, unit: 'trái', category: 'rau-cu' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Làm sạch nguyên liệu',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Làm sạch nguyên liệu chính với nước muối loãng, rửa sạch để thật ráo nước. Nhặt rửa các loại rau thơm và hành hoa đi kèm.',
          tip: 'Để ráo nước nguyên liệu giúp hương vị tươi ngon và giữ vệ sinh an toàn thực phẩm.'
        },
        {
          step: 2,
          title: 'Ướp gia vị & Chuẩn bị nguyên liệu kèm',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Ướp phần thịt hoặc hải sản với chút nước mắm ngon, hành tím băm và tiêu xay cho thấm vị. Chuẩn bị bún, phở hoặc bánh ăn kèm.',
          tip: 'Ướp vừa đủ thời gian giúp nhân món ăn đậm đà từ bên trong mà không bị ra nước.'
        },
        {
          step: 3,
          title: 'Nấu chín & Kỹ thuật canh lửa',
          durationMinutes: 8,
          heatLevel: 'lửa vừa',
          content: r.method,
          tip: r.tip
        },
        {
          step: 4,
          title: 'Hoàn thiện & Bày tô thưởng thức',
          durationMinutes: 2,
          heatLevel: 'không dùng nhiệt',
          content: 'Múc món ăn ra tô hoặc đĩa nóng, rắc hành ngò thái nhỏ và chút tiêu thơm lên bề mặt. Thưởng thức ngay khi món ăn còn nóng hổi.',
          tip: 'Thưởng thức ngay khi vừa hoàn thiện để cảm nhận trọn vẹn hương vị tuyệt hảo của bữa sáng.'
        }
      ],
      tags: r.tags,
      chefTip: r.chef,
      difficulty: 'Dễ'
    });
  });
}

console.log('generateAllAnSang defined.');
