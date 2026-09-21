// scripts/build-pools.js
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'data', 'casePools');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to escape single quotes
const esc = (s) => (s || '').replace(/'/g, "\\'");

// =========================================================================
// 1. EXPRESS 1-DISH (ĂN NHANH 1 MÓN: 200 DISHES)
// =========================================================================
function generateExpressPool() {
  const blueBases = [
    ['Bánh mì chả cá nóng Vũng Tàu', 'Bánh mì giòn rụm kẹp chả cá chiên thì là, dưa leo ngập tương ớt.', 20000, 360, 8, '💤 35 phút ngủ trưa êm ái!'],
    ['Bánh mì pate trứng ốp la lòng đào', 'Pate Hải Phòng béo ngậy quết cùng trứng ốp la xì dầu thơm phức.', 22000, 420, 10, '💤 No êm bụng, chợp mắt 30p chuẩn đét!'],
    ['Bánh mì xíu mại sốt cà chua', 'Viên xíu mại mềm thơm, sốt cà đậm đà chấm cùng bánh mì giòn tan.', 25000, 410, 10, '💤 Ăn nhanh 10p, còn trọn 40p nghỉ ngơi.'],
    ['Bánh bao trứng cút thịt băm xá xíu', 'Vỏ bánh bao mềm xốp, nhân thịt nạc mộc nhĩ và trứng cút thơm lừng.', 18000, 350, 6, '💤 Tiện lợi không dơ tay, ngủ sớm tỉnh táo.'],
    ['Bánh giò nóng Hà Nội giò lụa', 'Bánh giò bột gạo mềm mịn, nhân thịt mộc nhĩ ăn kèm lát giò lụa giòn sần sật.', 22000, 380, 8, '💤 Ấm bụng ngày mưa, ngủ trưa ngon lành.'],
    ['Xôi xéo ruốc hành phi Hoàng Mai', 'Hạt nếp dẻo thơm quyện đậu xanh bùi béo và hành phi vàng ruộm.', 20000, 450, 10, '💤 Căng da bụng chùng da mắt, ngủ sâu giấc!'],
    ['Xôi mặn lạp xưởng chà bông sài gòn', 'Xôi dẻo nước cốt dừa kèm lạp xưởng Mai Quế Lộ và pate béo ngậy.', 25000, 480, 10, '💤 Chắc dạ cả buổi chiều, ngủ trưa thư thái.'],
    ['Cơm nắm Onigiri cá ngừ sốt mayo', 'Cơm dẻo Nhật Bản bọc rong biển giòn, nhân cá ngừ sốt béo ngậy.', 22000, 340, 5, '💤 Siêu gọn gàng tại bàn, tranh thủ ngủ 45p.'],
    ['Bánh cuốn nóng chả quế hành phi', 'Bánh tráng mỏng cuốn thịt mộc nhĩ chấm nước mắm chua ngọt ấm bụng.', 25000, 360, 12, '💤 Nhẹ bụng dễ tiêu, chợp mắt nhẹ nhàng.'],
    ['Mì tôm chanh trứng chần xúc xích', 'Bát mì ăn liền chua cay quen thuộc văn phòng, bồi thêm trứng lòng đào béo.', 22000, 420, 8, '💤 Món quốc dân ngày lười, ăn vèo đi ngủ.']
  ];

  const blueFillers = [
    'Bánh mì bì heo thính thính Sài Gòn', 'Bánh mì chả lụa dưa góp truyền thống', 'Bánh mì bơ đường nướng mật ong',
    'Bánh mì xá xíu rim nước dừa', 'Bánh mì cá hộp ba cô gái sốt cà', 'Bánh mì nem khoai sốt bơ trứng',
    'Bánh mì kẹp xúc xích sốt mayo', 'Bánh mì que cay Hải Phòng giòn rụm', 'Bánh mì chả bò Đà Nẵng rau răm',
    'Bánh mì thịt khìa nước dừa miền Tây', 'Xôi bắp hầm đậu phộng đường mè', 'Xôi khúc lá khúc nhân đậu xanh thịt mỡ',
    'Xôi gà xé rắc lá chanh thơm lừng', 'Xôi đậu đen rắc dừa nạo muối mè', 'Xôi vò hạt sen ngọt bùi thanh tao',
    'Xôi gấc đỏ tươi ăn kèm chả lụa', 'Cơm nắm ruốc cá hồi rong biển', 'Cơm nắm tam giác trứng muối kim chi',
    'Cơm nắm thịt heo bằm sốt teriyaki', 'Cơm nắm gà nướng phô mai cay', 'Bánh bao kim sa trứng muối tan chảy',
    'Bánh bao gà nấm hương trứng cút', 'Bánh bao chay nhân nấm hạt sen', 'Bánh bao xá xíu phô mai kéo sợi',
    'Bánh giò nhân gà nấm đông cô', 'Bánh giò trứng muối chà bông', 'Bánh chưng rán giòn chấm tương ớt',
    'Bánh tét chiên giòn ăn kèm dưa món', 'Mì xào trứng bắp cải giòn rụm', 'Mì xào xúc xích rau cải thìa',
    'Miến xào lòng gà mề xắt hoa', 'Bún xào cần tỏi thịt bằm', 'Nui xào trứng cà chua phô mai',
    'Hủ tiếu xào chay nấm đùi gà', 'Cháo sườn sụn non quẩy giòn Hà Nội', 'Cháo trai xào hành răm ấm bụng',
    'Cháo gà xé hạt sen bồi bổ', 'Cháo đậu xanh thịt bằm hành hoa', 'Cháo thịt bò bằm trứng gà ta',
    'Bánh mì nướng muối ớt phô mai', 'Bánh mì kẹp thịt nguội bơ sữa', 'Bánh mì heo quay da giòn rụm',
    'Bánh mì bò né mini mang về', 'Bánh mì ốc bươu xào sả ớt', 'Xôi chim bồ câu bằm hành phi',
    'Xôi cốm làng Vòng dừa xào hạt sen', 'Xôi ngũ sắc Tây Bắc dẻo thơm', 'Cơm nắm nướng sốt miso Nhật',
    'Bánh cuốn trứng lòng đào Lạng Sơn', 'Bánh ướt lòng gà trứng non Đà Lạt', 'Bánh ướt thịt nướng chấm mắm nêm',
    'Mì trộn tóp mỡ muối ớt giòn cay', 'Bún riêu cua bình dân mang đi', 'Bánh canh bột lọc tôm thịt',
    'Súp cua bắp non trứng cút', 'Súp gà ngô ngọt hạt sen', 'Bánh bột lọc Huế chấm mắm ớt',
    'Bánh nậm lá chuối mềm tan', 'Bánh ram ít giòn dẻo miền Trung', 'Bánh đúc nóng thịt bằm mộc nhĩ'
  ];

  const purpleBases = [
    ['Phở bò tái nạm gia truyền Hà Nội', 'Nước dùng ninh xương 14 tiếng thơm nức quế hồi, bánh phở dẻo mềm thịt ngọt lịm.', 40000, 520, 15, '💤 Nạp đạm đong đầy, ngủ trưa 30p thức dậy đầy năng lượng!'],
    ['Bún chả nướng than hoa Hà Nội', 'Chả miếng chả băm thơm lừng khói than, chấm nước mắm đu đủ chua ngọt giòn giã.', 42000, 540, 15, '💤 Món ngon trứ danh, ngủ trưa êm êm thức dậy tỉnh táo.'],
    ['Cơm gà xối mỡ đùi góc tư giòn rụm', 'Cơm chiên hạt ngọc vàng óng, đùi gà góc tư xối mỡ nóng hổi rưới nước mắm tỏi ớt.', 45000, 650, 15, '💤 Ăn chắc bụng no lâu, tha hồ đánh một giấc trưa trọn vẹn!'],
    ['Hủ tiếu Nam Vang tôm thịt khô sốt đặc biệt', 'Sợi hủ tiếu dai tơi thấm đượm nước sốt đậm đà, phủ tôm tươi, gan heo, thịt bằm.', 42000, 530, 14, '💤 Hương vị Nam Bộ hấp dẫn, ăn xong nghỉ ngơi 30 phút.'],
    ['Bún thịt nướng chả giò giòn rụm', 'Thịt xiên nướng mè thơm nức, chả giò chiên rụm chan nước mắm chua ngọt thanh tao.', 38000, 510, 12, '💤 Đầy đủ rau xanh mát ruột, ngủ trưa không lo ngấy bụng.'],
    ['Doner Kebab thịt nướng Thổ Nhĩ Kỳ sốt tỏi', 'Bánh mì tam giác nướng giòn kẹp thịt xiên quay xắt mỏng ngập tràn sốt mayonnaise thơm.', 35000, 480, 10, '💤 Cầm tay tiện lợi cắn vèo 10p, dành trọn 35p ngủ trưa.'],
    ['Bún bò Huế giò heo gân bò sa tế', 'Nước dùng đậm đà hương sả ruốc, bắp bò hoa giòn sần sật, cay nồng kích thích vị giác.', 45000, 580, 15, '💤 Cay cay ấm bụng, ngủ trưa say giấc phục hồi năng lượng.'],
    ['Cơm tấm sườn nướng mỡ hành chả trứng', 'Miếng sườn cốt lết ướp mật ong nướng xém cạnh, chả trứng bùi bùi và mỡ hành béo ngậy.', 45000, 620, 15, '💤 Hương vị Sài Gòn kinh điển, no nê ngủ trưa sạc lại 100% pin.'],
    ['Mì vịt tiềm góc phần tư thảo mộc', 'Đùi vịt mềm rục thơm phức hương hoa hồi thục địa, ăn cùng cải ngọt thanh đạm.', 45000, 560, 16, '💤 Bổ dưỡng thanh mát, giấc trưa sâu tỉnh táo cày deadline.'],
    ['Bún riêu ốc đậu chả ốc giòn sần sật', 'Ốc nhồi giòn sần sật, riêu cua đồng xốp mềm, đậu mơ rán vàng rưới giấm bỗng chua dịu.', 38000, 470, 14, '💤 Thanh mát không đầy bụng, ngủ trưa nhẹ nhàng sảng khoái.']
  ];

  const purpleFillers = [
    'Bún cá cay Hải Phòng lòng cá giòn', 'Bún mọc sườn non dọc mùng thanh mát', 'Miến lươn xào giòn mộc nhĩ nấm hương',
    'Bún thang Hà Nội tơ vàng thanh tao', 'Hủ tiếu mì sườn cọng cải chua ngọt', 'Cơm rang dưa bò giòn sần sật',
    'Cơm chiên Dương Châu lạp xưởng tôm khô', 'Cơm chiên hải sản kim chi cay nồng', 'Mì xào giòn bò lúc lắc sốt tiêu',
    'Mì Quảng ếch om chuối đậu nước sốt sệt', 'Mì Quảng tôm thịt trứng cút đậm đà', 'Bánh canh ghẹ bột gạo nước cốt dừa',
    'Bánh canh cua đồng giò nạc chả cá', 'Cơm thố bò xào nấm sốt dầu hào', 'Cơm gà Hải Nam luộc da vàng óng',
    'Cơm tấm ba rọi nướng sả ớt', 'Cơm bò xào hành tây cần tây sốt tiêu', 'Cơm cá hồi sốt teriyaki bento',
    'Bánh mì chảo bò sốt tiêu đen phô mai', 'Bánh mì chảo xíu mại trứng lòng đào pate', 'Bún đậu thịt luộc chả cốm chấm mắm tôm',
    'Bún chả cá Quy Nhơn sứa tươi giòn', 'Bún sứa Nha Trang nước trong veo thanh mát', 'Bún mắm nêm thịt heo quay Đà Nẵng',
    'Bún kèn Phú Quốc nước cốt dừa cá nhồng', 'Bún nước lèo Sóc Trăng cá lóc luộc', 'Hủ tiếu Sa Đéc bánh dai tôm thịt',
    'Hủ tiếu mực tôm tươi rắc tỏi phi giòn', 'Mì xào ốc móng tay rau muống tỏi', 'Miến ngan trộn măng chua cay nồng',
    'Bún ngan nướng than hoa chấm xì dầu tỏi', 'Phở xào giòn bò mềm sốt cải ngọt', 'Phở cuốn bò xào rau thơm thanh mát',
    'Phở chiên phồng bò xào rau cải sốt sệt', 'Cơm gà nướng sốt tiêu xanh Phú Quốc', 'Cơm heo quay kho trứng cút đậm đà',
    'Cơm sườn rim mặn ngọt mè rang', 'Cơm đùi vịt quay sốt mận Bắc Kinh', 'Mì Udon xào hải sản sốt Teriyaki',
    'Mì Ramen thịt xá xíu trứng lòng đào', 'Cơm cà ri gà Nhật Bản khoai tây cà rốt', 'Cơm thịt heo chiên xù Tonkatsu giòn tan',
    'Bánh mì Burger bò nướng phô mai Cheddar', 'Bánh mì cuộn Tortilla gà nướng sốt Salsa', 'Sandwich Club 3 tầng thịt xông khói trứng',
    'Bánh mì Thổ Nhĩ Kỳ sốt phô mai cay', 'Mì Spaghetti bò bằm sốt Bolognese', 'Mì Ý sốt kem nấm Carbonara thịt xông khói',
    'Cơm chiên cá mặn gà xé thố đất', 'Cơm niêu thịt kho tộ dưa chua', 'Bún măng gà ta thả vườn măng tươi',
    'Cháo lươn đồng Nghệ An cay nồng thơm thì là', 'Súp bò hầm củ quả bánh mì bơ tỏi', 'Cơm rang gà nấm lá chanh',
    'Hủ tiếu bò kho bánh mì giòn tan', 'Bánh canh cá lóc bánh canh bột xắt cốt dừa', 'Bún cá rô đồng chiên giòn thì là',
    'Bún ốc chuối đậu tía tô nóng hổi', 'Cơm cá thu sốt cà chua thì là', 'Cơm mực nhồi thịt chiên nước mắm'
  ];

  const goldBases = [
    ['Bít tết bò Mỹ sốt tiêu đen khoai tây chiên', 'Thăn bò Black Angus áp chảo bơ tỏi mềm mọng nước, sốt tiêu đen Phú Quốc cay nồng kèm khoai tây chiên giòn.', 75000, 680, 15, '💤 Đẳng cấp dinh dưỡng thượng hạng, ngủ trưa như hoàng gia.'],
    ['Cơm lươn Nhật Bản Unadon sốt Teriyaki ngọt bùi', 'Lươn nướng than hoa Nhật phủ sốt kabayaki óng ánh, thịt mềm tan béo ngậy trên nền cơm dẻo Koshihikari.', 85000, 640, 14, '💤 Giàu đạm vitamin, giấc ngủ trưa sâu sạc trọn 100% sinh lực.'],
    ['Cơm cá hồi Nauy áp chảo sốt bơ chanh', 'Phi lê cá hồi tươi nhập khẩu áp chảo giòn da, sốt bơ chanh thơm lừng ăn kèm măng tây xào bơ tỏi.', 80000, 610, 15, '💤 Tinh hoa đại dương, nhẹ bụng mà đong đầy năng lượng đỉnh chóp.'],
    ['Bento sườn cừu nướng thảo mộc rosemary', 'Sườn cừu non nướng xém cạnh thơm thảo mộc quý tộc, kèm cơm nghệ vàng óng và salad sốt mè rang.', 85000, 690, 16, '💤 Bữa trưa sang xịn mịn, đánh thức mọi giác quan sau giấc ngủ trưa.'],
    ['Mì Ý tôm hùm mini sốt bơ tỏi vang trắng', 'Tôm hùm tươi giòn sần sật xào cùng mì sợi dẹt Linguine, sốt vang trắng béo ngậy thơm lừng oregano.', 90000, 650, 15, '💤 Chuẩn phong vị Âu châu, ngủ trưa 30 phút mơ về Paris.']
  ];

  const goldFillers = [
    'Bò Wagyu xào nấm Truffle quý tộc', 'Cơm hải sản Hoàng Kim bào ngư mini', 'Bún thang gà đồi trứng tôm thượng hạng',
    'Phở thăn bò Wagyu A4 nước dùng hầm sâm', 'Bánh mì tôm hùm Maine nướng bơ tỏi', 'Cơm gà nướng nấm Matsutake Nhật Bản',
    'Bò sốt vang Pháp hầm hạt dẻ bánh mì hoa cúc', 'Cơm cá tuyết Alaska nướng sốt Miso', 'Mì Ý cua nguyên con sốt cà chua kem béo',
    'Cơm niêu thố đất sườn cọng Iberico Tây Ban Nha', 'Bento vịt quay sốt cam Grand Marnier', 'Súp vi cá bào ngư nước dùng gà hầm sâm',
    'Cháo tổ yến hạt sen bồ câu bổi bổ', 'Lẩu mì udon bò Kobe thượng hạng mang đi', 'Cơm cá chình nướng than hoa sốt tương đậm',
    'Burger bò Wagyu phủ vàng lá sốt gan ngỗng', 'Sandwich bò nướng Tomahawk sốt chimichurri', 'Cơm rang tôm hùm trứng cá hồi đỏ tươi',
    'Mì soba kiều mạch lạnh kèm tempura tôm càng', 'Cơm gà tây quay sốt việt quất mật ong rừng', 'Phở bò đuôi bò hầm sâm củ quả',
    'Bún bò càng biển tôm hùm sốt sả ớt', 'Cơm tấm sườn cừu nướng thảo quả mật ong', 'Mì Ý hàu sữa áp chảo sốt kem phô mai Parmesan',
    'Cơm rang đùi ngỗng hun khói sốt tiêu rừng', 'Cơm cá bơn Pháp áp chảo sốt thì là bơ tỏi', 'Bò né Wagyu trứng non chảo gang mang đi',
    'Cơm thố bò Mỹ nướng sốt nấm gan bò Porcini', 'Bánh mì nướng pate gan ngỗng Foie Gras Pháp', 'Mì ramen xương hầm đặc biệt cốt tủy đen',
    'Cơm lươn nướng sốt tiêu Tứ Xuyên hoàng kim', 'Hủ tiếu tôm hùm sa tế bào ngư hoàng tộc', 'Cháo hải sâm nấm đông cô bồi bổ nguyên khí',
    'Bún chả mực giã tay Hạ Long số 1', 'Cơm chiên trứng tôm chuồn rong biển mè đen', 'Cơm sườn bò rút xương sốt BBQ Mỹ thượng hạng',
    'Bento sushi cá hồi cá ngừ đại dương tươi rói', 'Bánh canh tôm tích nguyên con trứng cút lòng đào', 'Cơm thăn heo đen Kurobuta chiên xù',
    'Mì Ý mực đen nang mực xào tỏi ớt hiểm', 'Bò cuộn phô mai nướng sốt vang đỏ Bordeaux', 'Cơm đùi gà tây nướng mù tạt Dijon',
    'Bánh mì kẹp ức ngỗng hun khói sốt mật ong', 'Cơm cá tầm nướng sốt riềng mẻ Tây Bắc', 'Cơm sườn cừu sốt lá bạc hà tươi',
    'Phở gân bò hầm hạt sen táo đỏ hoàng gia'
  ];

  const blue = [];
  blueBases.forEach((b, i) => {
    blue.push({
      id: `exp-blue-${i + 1}`,
      title: b[0],
      description: b[1],
      estimatedCostVnd: b[2],
      calories: b[3],
      speedMinutes: b[4],
      napBuff: b[5],
      imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80'
    });
  });
  blueFillers.forEach((title, i) => {
    const cost = 18000 + (i % 6) * 2000;
    const cal = 330 + (i % 8) * 20;
    const speed = 7 + (i % 6);
    blue.push({
      id: `exp-blue-${blueBases.length + i + 1}`,
      title,
      description: `${title} chuẩn vị cơm trưa nhanh văn phòng, thơm ngon ấm bụng, dễ tiêu hóa.`,
      estimatedCostVnd: cost,
      calories: cal,
      speedMinutes: speed,
      napBuff: `💤 Ăn nhanh ${speed} phút, dành trọn 35 phút ngủ trưa say giấc!`,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80'
    });
  });

  const purple = [];
  purpleBases.forEach((b, i) => {
    purple.push({
      id: `exp-pur-${i + 1}`,
      title: b[0],
      description: b[1],
      estimatedCostVnd: b[2],
      calories: b[3],
      speedMinutes: b[4],
      napBuff: b[5],
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80'
    });
  });
  purpleFillers.forEach((title, i) => {
    const cost = 30000 + (i % 8) * 2000;
    const cal = 480 + (i % 10) * 20;
    const speed = 11 + (i % 5);
    purple.push({
      id: `exp-pur-${purpleBases.length + i + 1}`,
      title,
      description: `${title} đong đầy dưỡng chất, thịt mềm đậm đà, nước dùng thơm lừng chuẩn vị nhà làm.`,
      estimatedCostVnd: cost,
      calories: cal,
      speedMinutes: speed,
      napBuff: `💤 Đầy đặn năng lượng, nạp pin 30 phút ngủ trưa tỉnh táo cày dự án!`,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    });
  });

  const gold = [];
  goldBases.forEach((b, i) => {
    gold.push({
      id: `exp-gold-${i + 1}`,
      title: b[0],
      description: b[1],
      estimatedCostVnd: b[2],
      calories: b[3],
      speedMinutes: b[4],
      napBuff: b[5],
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
    });
  });
  goldFillers.forEach((title, i) => {
    const cost = 55000 + (i % 8) * 5000;
    const cal = 580 + (i % 9) * 25;
    const speed = 12 + (i % 5);
    gold.push({
      id: `exp-gold-${goldBases.length + i + 1}`,
      title,
      description: `${title} nguyên liệu cao cấp thượng hạng, tẩm ướp tinh tế, trình bày xuất sắc mang đến bữa trưa quý tộc.`,
      estimatedCostVnd: cost,
      calories: cal,
      speedMinutes: speed,
      napBuff: `💤 Thưởng thức mỹ vị đẳng cấp, giấc ngủ trưa sâu sạc trọn 100% sinh lực!`,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
    });
  });

  return { blue: blue.slice(0, 70), purple: purple.slice(0, 80), gold: gold.slice(0, 50) };
}

console.log('Generating pools...');
const exp = generateExpressPool();
console.log(`Express pool counts: Blue: ${exp.blue.length}, Purple: ${exp.purple.length}, Gold: ${exp.gold.length}. Total: ${exp.blue.length + exp.purple.length + exp.gold.length}`);
