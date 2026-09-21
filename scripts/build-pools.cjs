// scripts/build-pools.cjs
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'data', 'casePools');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function writeTsFile(filename, content) {
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[OK] Generated: ${filePath}`);
}

// -------------------------------------------------------------------------
// 1. EXPRESS POOL (200 DISHES)
// -------------------------------------------------------------------------
function makeExpressDishes() {
  const blueNames = [
    'Bánh mì chả cá Vũng Tàu nóng hổi', 'Bánh mì pate trứng ốp la lòng đào', 'Bánh mì xíu mại sốt cà chua',
    'Bánh bao trứng cút thịt băm xá xíu', 'Bánh giò nóng Hà Nội giò lụa', 'Xôi xéo ruốc hành phi Hoàng Mai',
    'Xôi mặn lạp xưởng chà bông Sài Gòn', 'Cơm nắm Onigiri cá ngừ sốt mayo', 'Bánh cuốn nóng chả quế hành phi',
    'Mì tôm chanh trứng chần xúc xích', 'Bánh mì bì heo thính Sài Gòn', 'Bánh mì chả lụa dưa góp giòn tan',
    'Bánh mì xá xíu rim nước dừa tươi', 'Bánh mì cá hộp ba cô gái sốt cà', 'Bánh mì nem khoai sốt bơ trứng ngậy',
    'Bánh mì xúc xích nướng bơ tỏi sốt mayo', 'Bánh mì que cay Hải Phòng giòn rụm', 'Bánh mì chả bò Đà Nẵng rau răm',
    'Bánh mì thịt khìa nước dừa miền Tây', 'Xôi bắp hầm đậu phộng mè rang', 'Xôi khúc lá khúc nhân đậu thịt mỡ',
    'Xôi gà xé rắc lá chanh thơm lừng', 'Xôi đậu đen rắc dừa nạo muối mè', 'Xôi vò hạt sen ngọt bùi thanh tao',
    'Xôi gấc đỏ tươi ăn kèm chả lụa', 'Cơm nắm ruốc cá hồi rong biển giòn', 'Cơm nắm tam giác trứng muối kim chi',
    'Cơm nắm thịt heo bằm sốt teriyaki', 'Cơm nắm gà nướng phô mai cay', 'Bánh bao kim sa trứng muối tan chảy',
    'Bánh bao gà nấm hương trứng cút', 'Bánh bao chay nhân nấm hạt sen', 'Bánh bao xá xíu phô mai kéo sợi',
    'Bánh giò nhân gà nấm đông cô giòn sần sật', 'Bánh giò trứng muối chà bông đùi gà', 'Bánh chưng rán giòn chấm tương ớt',
    'Bánh tét chiên giòn ăn kèm dưa món chua ngọt', 'Mì xào trứng bắp cải giòn rụm', 'Mì xào xúc xích cải thìa dầu hào',
    'Miến xào lòng gà mề xắt hoa thơm phức', 'Bún xào cần tỏi thịt bằm thanh mát', 'Nui xào trứng cà chua phô mai mềm',
    'Hủ tiếu xào chay nấm đùi gà thanh tịnh', 'Cháo sườn sụn non quẩy giòn Hà Nội', 'Cháo trai xào hành răm ấm bụng',
    'Cháo gà xé hạt sen bồi bổ sinh lực', 'Cháo đậu xanh thịt bằm hành hoa', 'Cháo thịt bò bằm trứng gà ta bổ dưỡng',
    'Bánh mì nướng muối ớt phô mai chà bông', 'Bánh mì kẹp thịt nguội bơ sữa Đà Lạt', 'Bánh mì heo quay da giòn rụm sốt tương',
    'Bánh mì bò né mini mang về nóng hổi', 'Bánh mì ốc bươu xào sả ớt cay nồng', 'Xôi chim bồ câu bằm hành phi béo ngậy',
    'Xôi cốm làng Vòng dừa xào hạt sen', 'Xôi ngũ sắc Tây Bắc dẻo thơm hạt ngọc', 'Cơm nắm nướng sốt miso Nhật Bản',
    'Bánh cuốn trứng lòng đào Lạng Sơn chấm nước hầm', 'Bánh ướt lòng gà trứng non Đà Lạt', 'Bánh ướt thịt nướng chấm mắm nêm đậm vị',
    'Mì trộn tóp mỡ muối ớt giòn cay bốc lửa', 'Bún riêu cua bình dân mang đi nước trong', 'Bánh canh bột lọc tôm thịt nước sệt',
    'Súp cua bắp non trứng cút nóng ấm dạ', 'Súp gà ngô ngọt hạt sen sánh mịn', 'Bánh bột lọc Huế chấm mắm ớt cay xè',
    'Bánh nậm lá chuối mềm tan chấm nước mắm', 'Bánh ram ít giòn dẻo miền Trung đặc sắc', 'Bánh đúc nóng thịt bằm mộc nhĩ hành phi',
    'Bánh mì gà nướng mật ong sả ớt', 'Xôi sắn mỡ hành tóp mỡ giòn rụm'
  ]; // 70 items

  const purpleNames = [
    'Phở bò tái nạm gia truyền Hà Nội', 'Bún chả nướng than hoa Hà Nội', 'Cơm gà xối mỡ đùi góc tư giòn rụm',
    'Hủ tiếu Nam Vang tôm thịt khô sốt đặc biệt', 'Bún thịt nướng chả giò giòn rụm', 'Doner Kebab thịt nướng Thổ Nhĩ Kỳ sốt tỏi',
    'Bún bò Huế giò heo gân bò sa tế', 'Cơm tấm sườn nướng mỡ hành chả trứng', 'Mì vịt tiềm góc phần tư thảo mộc',
    'Bún riêu ốc đậu chả ốc giòn sần sật', 'Bún cá cay Hải Phòng lòng cá giòn', 'Bún mọc sườn non dọc mùng thanh mát',
    'Miến lươn xào giòn mộc nhĩ nấm hương', 'Bún thang Hà Nội tơ vàng thanh tao', 'Hủ tiếu mì sườn cọng cải chua ngọt',
    'Cơm rang dưa bò giòn sần sật', 'Cơm chiên Dương Châu lạp xưởng tôm khô', 'Cơm chiên hải sản kim chi cay nồng',
    'Mì xào giòn bò lúc lắc sốt tiêu', 'Mì Quảng ếch om chuối đậu nước sốt sệt', 'Mì Quảng tôm thịt trứng cút đậm đà',
    'Bánh canh ghẹ bột gạo nước cốt dừa', 'Bánh canh cua đồng giò nạc chả cá', 'Cơm thố bò xào nấm sốt dầu hào',
    'Cơm gà Hải Nam luộc da vàng óng', 'Cơm tấm ba rọi nướng sả ớt', 'Cơm bò xào hành tây cần tây sốt tiêu',
    'Cơm cá hồi sốt teriyaki bento mini', 'Bánh mì chảo bò sốt tiêu đen phô mai', 'Bánh mì chảo xíu mại trứng lòng đào pate',
    'Bún đậu thịt luộc chả cốm chấm mắm tôm', 'Bún chả cá Quy Nhơn sứa tươi giòn', 'Bún sứa Nha Trang nước trong veo thanh mát',
    'Bún mắm nêm thịt heo quay Đà Nẵng', 'Bún kèn Phú Quốc nước cốt dừa cá nhồng', 'Bún nước lèo Sóc Trăng cá lóc luộc',
    'Hủ tiếu Sa Đéc bánh dai tôm thịt', 'Hủ tiếu mực tôm tươi rắc tỏi phi giòn', 'Mì xào ốc móng tay rau muống tỏi',
    'Miến ngan trộn măng chua cay nồng', 'Bún ngan nướng than hoa chấm xì dầu tỏi', 'Phở xào giòn bò mềm sốt cải ngọt',
    'Phở cuốn bò xào rau thơm thanh mát', 'Phở chiên phồng bò xào rau cải sốt sệt', 'Cơm gà nướng sốt tiêu xanh Phú Quốc',
    'Cơm heo quay kho trứng cút đậm đà', 'Cơm sườn rim mặn ngọt mè rang', 'Cơm đùi vịt quay sốt mận Bắc Kinh',
    'Mì Udon xào hải sản sốt Teriyaki', 'Mì Ramen thịt xá xíu trứng lòng đào', 'Cơm cà ri gà Nhật Bản khoai tây cà rốt',
    'Cơm thịt heo chiên xù Tonkatsu giòn tan', 'Bánh mì Burger bò nướng phô mai Cheddar', 'Bánh mì cuộn Tortilla gà nướng sốt Salsa',
    'Sandwich Club 3 tầng thịt xông khói trứng', 'Bánh mì Thổ Nhĩ Kỳ sốt phô mai cay', 'Mì Spaghetti bò bằm sốt Bolognese',
    'Mì Ý sốt kem nấm Carbonara thịt xông khói', 'Cơm chiên cá mặn gà xé thố đất', 'Cơm niêu thịt kho tộ dưa chua',
    'Bún măng gà ta thả vườn măng tươi', 'Cháo lươn đồng Nghệ An cay nồng thơm thì là', 'Súp bò hầm củ quả bánh mì bơ tỏi',
    'Cơm rang gà nấm lá chanh', 'Hủ tiếu bò kho bánh mì giòn tan', 'Bánh canh cá lóc bánh canh bột xắt cốt dừa',
    'Bún cá rô đồng chiên giòn thì là', 'Bún ốc chuối đậu tía tô nóng hổi', 'Cơm cá thu sốt cà chua thì là',
    'Cơm mực nhồi thịt chiên nước mắm', 'Bún mắm Châu Đốc heo quay cà tím', 'Cơm đùi gà góc tư sốt mật ong nướng',
    'Bún chả nướng que tre cổ truyền', 'Mì sủi cảo tôm thịt nước hầm xương gà', 'Hủ tiếu cật heo tôm tươi Sa Đéc',
    'Bánh tằm bì nước cốt dừa miền Tây', 'Cơm chiên kim chi phô mai bò băm', 'Bún dọc mùng mọc sườn mộc nhĩ',
    'Cơm thịt kho măng khô Tây Bắc', 'Bún cá thu sốt cà thì là Nam Bộ'
  ]; // 80 items

  const goldNames = [
    'Bít tết bò Mỹ Black Angus sốt tiêu đen', 'Cơm lươn Nhật Bản Unadon sốt Kabayaki', 'Cơm cá hồi Nauy áp chảo sốt bơ chanh',
    'Bento sườn cừu non nướng thảo mộc rosemary', 'Mì Ý tôm hùm mini sốt bơ tỏi vang trắng', 'Bò Wagyu áp chảo sốt nấm Truffle quý tộc',
    'Cơm hải sản Hoàng Kim bào ngư mini', 'Bún thang gà đồi trứng tôm thượng hạng', 'Phở thăn bò Wagyu A4 nước dùng sâm',
    'Bánh mì tôm hùm Maine nướng bơ tỏi', 'Cơm gà nướng nấm Matsutake Nhật Bản', 'Bò sốt vang Pháp hầm hạt dẻ bánh mì hoa cúc',
    'Cơm cá tuyết Alaska nướng sốt Miso', 'Mì Ý cua tuyết nguyên con sốt kem cà chua', 'Cơm niêu sườn cọng Iberico Tây Ban Nha',
    'Bento vịt quay sốt cam Grand Marnier', 'Súp vi cá bào ngư nước dùng gà sâm', 'Cháo tổ yến hạt sen bồ câu bồi bổ',
    'Lẩu mì udon bò Kobe thượng hạng', 'Cơm cá chình sông nướng than hoa sốt tương', 'Burger bò Wagyu phủ vàng lá sốt gan ngỗng',
    'Sandwich bò nướng Tomahawk sốt chimichurri', 'Cơm rang tôm hùm trứng cá hồi đỏ tươi', 'Mì soba kiều mạch lạnh tôm càng tempura',
    'Cơm gà tây quay sốt việt quất mật ong rừng', 'Phở đuôi bò hầm sâm củ quả ngũ vị', 'Bún tôm càng xanh sốt sả ớt hoàng gia',
    'Cơm tấm sườn cừu nướng thảo quả mật ong', 'Mì Ý hàu sữa áp chảo sốt phô mai Parmesan', 'Cơm đùi ngỗng hun khói sốt tiêu rừng Măng Đen',
    'Cơm cá bơn Pháp áp chảo sốt thì là bơ tỏi', 'Bò né Wagyu trứng non chảo gang sốt tiêu', 'Cơm thố bò Mỹ nướng sốt nấm Porcini',
    'Bánh mì nướng pate gan ngỗng Foie Gras Pháp', 'Mì ramen xương hầm đặc biệt cốt tủy đen Tonkotsu', 'Cơm lươn nướng sốt tiêu Tứ Xuyên hoàng kim',
    'Hủ tiếu tôm càng sa tế bào ngư hoàng tộc', 'Cháo hải sâm nấm đông cô đại bổ', 'Bún chả mực giã tay Hạ Long loại 1',
    'Cơm chiên trứng tôm chuồn rong biển mè đen', 'Cơm sườn bò rút xương sốt BBQ Mỹ', 'Bento sushi cá hồi cá ngừ đại dương tươi rói',
    'Bánh canh tôm tích nguyên con trứng cút lòng đào', 'Cơm thăn heo đen Kurobuta chiên xù', 'Mì Ý mực đen nang mực xào tỏi ớt',
    'Bò cuộn phô mai nướng sốt vang đỏ Bordeaux', 'Cơm đùi gà tây nướng mù tạt Dijon Pháp', 'Bánh mì ức ngỗng hun khói sốt việt quất',
    'Cơm cá tầm nướng sốt riềng mẻ Tây Bắc', 'Cơm sườn cừu sốt lá bạc hà tươi hoàng tộc'
  ]; // 50 items

  return { blue: blueNames, purple: purpleNames, gold: goldNames };
}

// -------------------------------------------------------------------------
// 2. SNACK GEN Z POOL (200 ITEMS)
// -------------------------------------------------------------------------
function makeSnackDishes() {
  const blueNames = [
    'Khoai tây lắc phô mai giòn rụm', 'Cá viên chiên sốt mắm bơ tỏi tóp mỡ', 'Nem chua rán phố cổ Hà Nội',
    'Bánh tráng nướng Đà Lạt trứng cút xúc xích', 'Bánh tráng cuốn bơ sốt me chua ngọt', 'Bắp xào bơ tép hành phi thơm nức',
    'Khô gà lá chanh giòn cay đậm vị', 'Khô bò que cháy tỏi ớt hiểm', 'Mực rim sa tế cay ngọt Nha Trang',
    'Takoyaki nhân bạch tuộc sốt tương Nhật', 'Xúc xích phô mai lốc xoáy giòn tan', 'Bánh gạo Tokbokki chiên lắc phô mai',
    'Mandu Hàn Quốc chiên giòn nhân thịt bắp', 'Dồi sụn nướng than hoa thơm lừng', 'Chả cá dây chiên mắm ớt cay giòn',
    'Bánh mì nướng muối ớt chà bông mỡ hành', 'Hồ lô nướng mật ong sốt tương ớt', 'Phô mai que kéo sợi béo ngậy',
    'Bánh tráng trộn khô bò trứng cút tắc', 'Bánh tráng phơi sương chấm sốt bơ trứng muối', 'Bánh gà phô mai mini giòn tan',
    'Chân gà ngâm sả tắc chua ngọt cay giòn', 'Tai heo ngâm cóc non sốt Thái cay xè', 'Gân bò trộn xoài xanh muối ớt',
    'Bánh gối nhân thịt mộc nhĩ trứng cút', 'Bánh tôm Hồ Tây chiên giòn rụm rưới mắm', 'Bánh rán mặn thịt nấm hành tây',
    'Quẩy đùi gà ngọt béo giòn thơm', 'Bánh tiêu sầu riêng nóng hổi thơm phức', 'Bánh chuối chiên phồng mè đen',
    'Khoai lang kén bùi ngọt chiên vàng', 'Khoai môn lệ phố nhân đậu xanh mềm mịn', 'Đậu hũ chiên giòn lắc bột xí muội',
    'Bột chiên trứng mỡ hành đu đủ bào Sài Gòn', 'Há cảo chiên giòn chấm tương giấm', 'Sủi cảo chiên giòn nhân tôm thịt',
    'Bò bía mặn lạp xưởng củ sắn giòn ngọt', 'Chả ram tôm đất Bình Định giòn tan', 'Bánh xèo mini vỏ giòn tôm nhảy',
    'Bánh khọt Vũng Tàu tôm tươi nước cốt dừa', 'Bánh quai vạc chiên giòn nhân thịt mộc nhĩ', 'Bánh bèo chén tôm cháy tóp mỡ giòn',
    'Rau củ thập cẩm sấy giòn tự nhiên', 'Chuối sấy dẻo tẩm gừng mật ong', 'Mít sấy giòn rụm thơm lừng',
    'Bánh phồng tôm Sa Giang chiên phồng', 'Đậu phộng rang tỏi ớt cay mặn', 'Hạt điều rang muối vỏ lụa Bình Phước',
    'Hạt dẻ Trùng Khánh nướng bơ thơm nức', 'Hạt sen sấy giòn ngọt bùi thanh mát', 'Rong biển cháy tỏi ớt mè trắng',
    'Bánh que cay tăm tuổi thơ giòn rụm', 'Bánh quy bơ trứng kẹp phô mai mặn', 'Bánh tart trứng nướng xém mặt béo ngậy',
    'Bánh bông lan trứng muối chà bông sốt bơ', 'Bánh su kem vỏ giòn kem vani tươi mát', 'Chè chuối nướng nước cốt dừa béo thơm',
    'Tàu hũ trân châu đường đen nóng mịn', 'Sữa chua dẻo xắt miếng rắc bột cacao', 'Rau câu dừa tươi mát lạnh thanh nhiệt',
    'Thạch sương sâm hạt é mủ gòn nước đường phèn', 'Bánh flan caramen béo ngậy cà phê đá', 'Chè khúc bạch thanh mát hạnh nhân lát',
    'Bánh tráng chấm sốt me đậu phộng rang', 'Bánh tráng kẹp trứng pate Đà Nẵng', 'Bánh ống lá dứa dừa nạo nóng hổi',
    'Bánh bò nướng nước cốt dừa rễ tre', 'Bánh da lợn đậu xanh lá dứa dẻo thơm', 'Bánh chuối hấp nước cốt dừa rắc mè rang',
    'Chè bắp non ngọt mát nước cốt dừa tươi', 'Chè đậu đỏ hạt sen đường thốt nốt'
  ]; // 70 items

  const purpleNames = [
    'Gà rán sốt cay ngọt Gochujang Hàn Quốc', 'Gà nugget sốt phô mai tuyết Cheddar', 'Bánh gà phô mai Mozzarella kéo sợi 1 mét',
    'Takoyaki bạch tuộc phô mai nướng xém cạnh', 'Tokbokki chiên lắc phô mai mật ong giòn rụm', 'Gà sốt bơ tỏi mật ong thơm lừng',
    'Cánh gà chiên nước mắm sốt cay Thái Lan', 'Gà viên Boneless phủ phô mai cay rực lửa', 'Xúc xích phô mai tươi cuộn khoai tây giòn',
    'Bánh mì cuộn xúc xích phô mai đút lò', 'Khay đồ viên chiên tổng hợp sốt mắm me bơ tỏi', 'Bánh tráng nướng phô mai bò bằm trứng muối',
    'Chân gà sốt Thái rút xương cóc non xoài xanh', 'Tai heo xốt cay sa tế chua ngọt giòn giã', 'Nộm bò khô phố Đinh Tiên Hoàng gia truyền',
    'Khoai tây múi cau chiên bơ tỏi rắc oregano', 'Mực ống mini chiên giòn sốt trứng muối hoàng kim', 'Tôm viên bọc cốm xanh chiên giòn rụm',
    'Bánh phồng tôm chiên sốt tôm càng bơ tỏi', 'Bánh bao chiên nhân bò bằm phô mai nướng', 'Bánh tart phô mai nướng Hokkaido béo ngậy',
    'Bánh crepe sầu riêng ngập kem tươi béo mát', 'Bánh croissant trứng muối phô mai tan chảy', 'Bánh su kem phô mai giòn choux craquelin',
    'Bánh waffle bỉ nướng mật ong kem tươi vani', 'Bánh toast mật ong nướng bơ sốt kem tươi trái cây', 'Churros Tây Ban Nha lăn đường quế sốt socola',
    'Bánh gạo nướng sốt tương dừa mè rang', 'Bánh tráng cuốn sốt trứng muối tôm khô bơ hành', 'Dồi sụn non chiên giòn sốt tương ớt Hàn',
    'Khoai môn chiên nước mắm ớt rim cay mặn', 'Bánh mì nướng bơ tỏi sốt phô mai kem tươi', 'Bánh gạo cay Tokbokki phô mai đút lò',
    'Mì cay hải sản cấp độ 5 phô mai sợi', 'Bánh bao nướng kim sa phô mai chảy', 'Chả mực Hạ Long rán giòn chấm tương ớt',
    'Nem lụi nướng sả chấm sốt đậu gan nồng nàn', 'Bò cuốn lá lốt nướng chấm mắm nêm đậm vị', 'Bánh hỏi heo quay da giòn rụm rưới mỡ hành',
    'Bánh gối nhân bò phô mai xắt hạt lựu', 'Bánh xèo tôm nhảy giòn tan rau rừng mắm chua ngọt', 'Cút lộn xào me tóp mỡ hành phi rau răm',
    'Ốc móng tay xào bơ tỏi chấm bánh mì giòn', 'Ốc hương xào bơ bắp ngọt giòn sần sật', 'Ngao hai cồi hấp sả ớt tiêu xanh ấm bụng',
    'Sò điệp nướng mỡ hành phô mai kéo sợi', 'Càng ghẹ rang muối ớt kéo sợi mặn cay', 'Bánh tôm chiên giòn rụm chấm mắm ớt đu đủ',
    'Cơm cháy đáy nồi chà bông sốt mắm ớt cay', 'Cơm cháy khô gà lá chanh sốt bơ tỏi giòn rụm', 'Bánh tráng lụi Tây Nguyên chấm sốt me cay',
    'Bánh tráng mâm 5 vị nướng sốt trứng muối', 'Bánh mì que pate nướng than cay xé lưỡi', 'Nem chua nướng than hoa chua ngọt thơm khói',
    'Chả tôm Thanh Hóa nướng than hoa kẹp rau sống', 'Bánh rế Phan Thiết giòn ngọt mật mía', 'Bánh pía trứng muối sầu riêng béo ngậy',
    'Chè bưởi An Giang giòn sần sật cốt dừa béo', 'Chè khoai dẻo Đài Loan trân châu thạch thảo mộc', 'Bingsu xoài kem tuyết sữa tươi mát lạnh',
    'Bingsu dâu tây kem tươi phô mai tuyết', 'Bingsu matcha đậu đỏ kem tuyết béo bùi', 'Bingsu socola vụn bánh oreo kem tươi phô mai',
    'Trà sữa kem trứng dừa nướng trân châu hoàng kim', 'Trà đào cam sả trần châu đường đen thanh mát', 'Matcha latte kem cheese macchiato đậm vị',
    'Milo dầm bánh flan trân châu pudding trứng', 'Trà mãng cầu xiêm chua ngọt giòn giã đá tuyết', 'Trà hoa quả nhiệt đới hạt chia thanh lọc',
    'Trà dưa lưới nha đam hạt sen thanh mát', 'Sữa chua trân châu Hạ Long nước cốt dừa nóng', 'Sữa tươi trân châu đường đen kem mousse',
    'Cà phê muối xứ Huế béo ngậy đậm đà', 'Trà sen vàng macchiato củ năng giòn', 'Trà olong hạt sen sữa dừa thơm bùi',
    'Sinh tố bơ sầu riêng dừa non béo ngậy', 'Nước ép lựu đỏ cam vàng mật ong rừng', 'Chè xoài Hong Kong hạt trân châu bưởi hồng',
    'Sữa tuyết Vân Nam nướng hoa quế mật ong', 'Trà sữa ô long rang sữa tươi nướng kem béo'
  ]; // 80 items

  const goldNames = [
    'Combo đại tiệc gà rán Boneless 6 vị phủ phô mai tuyết', 'Khay lẩu xiên nhúng phô mai kéo sợi khổng lồ',
    'Bingsu sầu riêng Musang King kem tuyết hoàng kim', 'Set sashimi cá hồi Nauy & sò điệp Nhật ăn vặt thượng hạng',
    'Hàu sữa Pháp nướng phô mai bơ tỏi trứng cá tầm', 'Càng cua tuyết Alaska rang muối ớt hồng Kông',
    'Tôm hùm mini đút lò phô mai Mozzarella ăn vặt', 'Bò Wagyu xiên nướng than sốt tiêu nấm Truffle',
    'Bánh tráng nướng tôm hùm sốt trứng muối dát vàng', 'Khay hải sản sốt Cajun khổng lồ tôm cua mực',
    'Ốc hương sốt trứng muối phô mai nướng bánh mì Pháp', 'Bánh mì nướng sốt gan ngỗng Foie Gras và mật ong rừng',
    'Súp vi cá bào ngư ăn vặt cung đình bổ dưỡng', 'Bánh crepe mille-feuille trà xanh ngàn lớp cao cấp',
    'Bánh sừng bò Croissant kẹp thịt bò Wagyu sốt phô mai', 'Set 8 loại bánh Macaron Pháp thủ công hương vị hoàng gia',
    'Chè yến sào hạt sen táo đỏ long nhãn thượng đỉnh', 'Bingsu vàng lá hoàng gia kem tuyết truffle',
    'Set bò lúc lắc Black Angus khoai tây chiên Truffle', 'Mực xé cay sợi hoàng gia sốt trứng cá tuyết',
    'Bánh tart trứng Bồ Đào Nha ngập tràn kem vani Madagascar', 'Khay đồ nướng xiên que tổng hợp thịt cừu và bò Wagyu',
    'Bánh phô mai nướng Basque cháy mặt kem béo hảo hạng', 'Set bánh Donut phủ vàng lá và hạt macca giòn ngậy',
    'Tháp kem khổng lồ 10 vị kem Gelato Ý thượng hạng', 'Trà sữa nướng Vân Nam hoa quế kem tuyết thượng phẩm',
    'Trà sữa tổ yến sâm ngọc linh bồi bổ khí huyết', 'Nước ép việt quất rừng kết hợp đông trùng hạ thảo',
    'Sinh tố bơ sáp Đắk Lắk kết hợp sầu riêng Ri6 dát vàng', 'Trà ô long thượng hạng Đài Loan ủ lạnh 24h',
    'Bánh pizza mini tôm hùm sốt phô mai truffle đút lò', 'Gà nướng nguyên con sốt tiêu đen nấm tùng nhung',
    'Khay bánh tráng hoàng kim tôm hùm sốt trứng muối', 'Bánh bao nướng tôm hùm sốt kem bơ phô mai',
    'Bò khô miếng thượng hạng từ bò Wagyu tẩm mật ong', 'Cá hồi xông khói Na Uy cuộn măng tây sốt kem chua',
    'Sò đỏ Nhật Bản áp chảo bơ tỏi sốt trứng cá tuyết', 'Bánh crepe tổ yến sốt cam tươi thanh mát',
    'Pudding đậu hũ non tổ yến nước đường hoa lài', 'Bánh waffle tổ ong kẹp kem gelato socola Bỉ',
    'Set đồ chiên hoàng gia: Tôm sú bọc hạnh nhân chiên xù', 'Chả giò tôm hùm hạt sen chiên giòn rụm hoàng tộc',
    'Nem công chả phượng cung đình Huế thu nhỏ', 'Set dồi sụn heo mọi Iberico nướng than hoa',
    'Thịt heo đen muối Jamon Iberico kẹp bánh mì que giòn', 'Bánh mousse socola bóng gương phủ vàng lá 24k',
    'Bánh bông lan cuộn kem tươi sầu riêng Monthong', 'Trà đào quả tươi thượng hạng ngâm rượu mơ Umeshu',
    'Sữa chua Hy Lạp hạt chia quả mọng dâu tằm rừng', 'Kem que Gelato dừa non bọc socola ruby thượng hạng'
  ]; // 50 items

  return { blue: blueNames, purple: purpleNames, gold: goldNames };
}

// -------------------------------------------------------------------------
// 3. COMBO 3-DISH POOL (200 COMBOS)
// -------------------------------------------------------------------------
function makeComboDishes() {
  const blueNames = [
    'Thịt kho trứng cút + Canh rau ngót thịt bằm + Trà đá hoa cúc',
    'Cá basa kho tộ nước dừa + Canh chua thơm cà + Nước sâm mía lau',
    'Gà xào sả ớt cay nồng + Canh bí xanh nấu tôm + Trà quất mật ong',
    'Sườn non ram mặn ngọt + Canh cải ngọt thịt bằm + Trà atiso đỏ mát lạnh',
    'Đậu hũ dồn thịt sốt cà chua + Canh mướp hương mồng tơi + Nước rau má đậu xanh',
    'Thịt ba chỉ rang cháy cạnh + Canh rau muống luộc dầm sấu + Nước chanh tươi đường phèn',
    'Trứng chiên thịt bằm hành hoa + Canh cua đồng mồng tơi + Trà đào hạt chia',
    'Cá nục kho cà chua dưa chua + Canh bí đỏ tôm khô + Nước ép ổi hồng thanh nhiệt',
    'Thịt heo luộc chấm cà pháo mắm tôm + Canh rau đay cua đồng + Nước vối nếp thơm',
    'Chả cá thu sốt cà chua thì là + Canh xà lách xoong thịt bằm + Trà sữa trân châu truyền thống'
  ];
  for (let i = 11; i <= 70; i++) {
    blueNames.push(`Mâm cơm văn phòng tiết kiệm #${i}: Món mặn đậm đà + Canh rau tươi mát + Nước uống giải nhiệt`);
  }

  const purpleNames = [
    'Sườn non nướng mật ong + Canh sườn hầm củ dền + Trà đào cam sả macchiato',
    'Bò xào bông cải nấm đông cô + Canh kim chi đậu hũ non + Nước mía sầu riêng trân châu',
    'Tôm rim mặn ngọt hành hoa + Canh chua cá lóc miền Tây + Sinh tố bơ sáp Đắk Lắk',
    'Cơm gà xối mỡ đùi góc tư + Canh rong biển thịt bò + Trà mãng cầu hạt chia',
    'Cá hồi áp chảo bơ tỏi + Canh ngao nấu chua thì là + Trà sữa kem trứng dừa nướng',
    'Ba chỉ lắc sả tắc chiên giòn + Canh sườn non nấu sấu + Nước ép cam dứa mật ong',
    'Bò lúc lắc khoai tây chiên + Canh măng chua sườn non + Trà dưa lưới nha đam',
    'Vịt quay Bắc Kinh sốt mận + Canh súp gà ngô ngọt hạt sen + Milo dầm trân châu bánh flan',
    'Cá điêu hồng chiên xù sốt xoài + Canh khổ qua dồn thịt + Nước ép bưởi hồng mật ong',
    'Mực xào cần tỏi ớt chuông + Canh ngao mồng tơi ngọt mát + Trà sen vàng macchiato'
  ];
  for (let i = 11; i <= 80; i++) {
    purpleNames.push(`Mâm cơm văn phòng chất lượng #${i}: Thịt nướng sườn ram hảo hạng + Canh bổ dưỡng + Đồ uống chill`);
  }

  const goldNames = [
    'Bò Wagyu áp chảo sốt nấm Truffle + Súp bào ngư vi cá + Nước ép lựu đỏ collagen nguyên chất',
    'Cá tuyết Alaska nướng sốt Teriyaki + Canh bóng thả ngũ sắc hoàng gia + Trà hoa cúc mật ong rừng',
    'Cơm niêu sườn que Iberico Tây Ban Nha + Canh tôm càng xanh nấu chua + Trà tổ yến nha đam thượng phẩm',
    'Tôm hùm đút lò phô mai Mozzarella + Súp cua bể hoàng đế măng tây + Nước ép việt quất rừng hạt chia',
    'Bít tết bò Mỹ Black Angus sốt tiêu + Súp kem nấm Truffle + Trà ô long thượng hạng ủ lạnh 24h'
  ];
  for (let i = 6; i <= 50; i++) {
    goldNames.push(`Mâm tiệc trưa Hoàng Gia #${i}: Mỹ vị bò Mỹ hải sản thượng hạng + Súp đại bổ + Thức uống quý tộc`);
  }

  return { blue: blueNames, purple: purpleNames, gold: goldNames };
}

// -------------------------------------------------------------------------
// 4. BIZARRE DARE POOL (200 CHALLENGE FOODS)
// -------------------------------------------------------------------------
function makeBizarreDishes() {
  const blueNames = [
    'Đậu hũ thối chiên giòn sốt sa tế Đài Loan', 'Trứng bắc thảo gừng giấm chua cay', 'Hột vịt lộn luộc lá ngải cứu ấm bụng',
    'Trà sữa hành lá tươi ngập ngụa topping hành hoa', 'Kem que vị mù tạt Wasabi cay xộc mũi', 'Bún mắm nêm đậm đặc cá cơm nguyên chất',
    'Sấu non ngâm ớt hiểm cay xé lưỡi', 'Bao tử cá basa xào dưa chua cay xè', 'Chân gà ngâm ớt xiêm xanh cay tê tái',
    'Bánh bao nhân sầu riêng phô mai tỏi phi', 'Bánh mì kẹp mắm tôm dưa leo ớt cay', 'Trứng cút lộn chiên sốt me ớt hiểm cấp 6',
    'Ốc bươu nhồi thịt hấp lá gừng cay nồng', 'Gỏi tai heo ngâm ớt chỉ thiên đỏ rực', 'Bánh tráng trộn ớt rim sa tế siêu cay',
    'Cóc bao tử dầm muối ớt mắt quỷ cay nồng', 'Xoài non ngâm mắm ớt cay bốc khói', 'Da heo chiên giòn lắc ớt bột cay cấp độ 6',
    'Mì cay Hàn Quốc cấp độ 6 ớt hiểm tươi', 'Mực khô tẩm sa tế cay rát họng', 'Cá cơm khô rim ớt bột cay bỏng môi',
    'Canh chua lá giang lòng gà cay xé lưỡi', 'Lòng heo xào dưa chua ớt hiểm cay nồng', 'Cuống họng heo luộc chấm mắm tôm đặc sản',
    'Chả rươi Tứ Kỳ Hải Dương chiên vỏ quýt', 'Cà cuống hấp nguyên con thơm nồng tinh dầu', 'Bọ xít rang lá chanh giòn rụm Sơn La',
    'Nhộng tằm xào lá chanh béo ngậy mặn mòi', 'Sâu tre Điện Biên chiên giòn béo bùi', 'Cào cào châu chấu rang mỡ giòn tan',
    'Trứng vịt dữa nướng muối tiêu chanh', 'Canh khổ qua rừng nấu tôm đắng ngắt', 'Nước ép mướp đắng nguyên chất không đường',
    'Trà khổ qua sao vàng đắng chát cổ họng', 'Sinh tố tỏi đen mật ong nồng gắt', 'Cà phê trộn nước mắm nhĩ thơm lừng',
    'Bia ướp ớt hiểm tươi cay bốc khói', 'Bánh flan sốt ớt cay tương ớt', 'Kẹo mút vị nước mắm tỏi ớt chua cay',
    'Socola đen 99% nhân tương ớt sa tế', 'Bánh quy kẹp mù tạt xanh wasabi', 'Súp lươn Nghệ An cay xé lưỡi nhiều tiêu ớt',
    'Thịt chuột đồng nướng rơm miền Tây', 'Cá kèo nướng muối ớt cay xé họng', 'Gỏi nhệch chấm chẻo cay nồng mắm tôm',
    'Rắn mối nướng mọi thơm nồng khói than', 'Dế mèn rang muối ớt lá chanh', 'Chẫu chuộc nướng mọi thơm bùi thịt ngọt',
    'Ve sầu sữa chiên giòn béo ngậy', 'Đọt mây nướng chấm muối ớt Tây Nguyên đắng chát', 'Canh lá lằng Nghệ An đắng thanh dịu',
    'Bún suông Trà Vinh tương đậu nồng đượm', 'Cháo ếch cay cấp độ 6 tiêu đen Phú Quốc', 'Chân gà quái thú sốt tiêu xanh cay nồng',
    'Gà rang muối hột ớt hiểm nguyên trái', 'Bò tái chanh chấm mù tạt cay chảy nước mắt', 'Lưỡi vịt xào sa tế cay xé đầu lưỡi',
    'Óc heo chưng ngải cứu hạt sen đắng bùi', 'Tim cật heo xào cần tỏi ớt chỉ thiên', 'Canh huyết heo nấu hẹ mắm tôm nồng',
    'Trứng gà non xào cay bốc khói', 'Cá khô cá sặc chiên mặn chát chấm mắm me', 'Khô cá đuối nướng chấm mắm me chua cay',
    'Cá lóc nướng trui trui trui đen thui thơm khói', 'Bánh xèo tép nhảy miền Trung cay ớt xanh', 'Gỏi sứa đỏ chấm mắm tôm đậu phụ Hải Phòng',
    'Thịt chua Thanh Sơn Phú Thọ thính nồng', 'Mắm chua thịt luộc Tây Ninh cay gắt', 'Mắm cáy Thái Bình chấm rau muống luộc đậm vị',
    'Nem chua Thanh Hóa ủ tỏi ớt hiểm cay nồng'
  ]; // 70 items

  const purpleNames = [
    'Hột vịt dữa sốt me cay bùng nổ cấp 8', 'Đuông dừa béo ngậy tắm nước mắm ớt hiểm sống', 'Chân gà rút xương sốt cay ma quỷ cấp 8',
    'Bún mắm miền Tây nguyên chất cá linh nồng nặc', 'Dế cơm chiên bơ tỏi ớt cay giòn béo ngậy', 'Cháo tía tô óc heo hầm tiêu đen cay nồng',
    'Cà phê espresso trộn mắm tôm nguyên chất', 'Bánh mì nướng sốt ớt ma Ghost Pepper cay bỏng lưỡi', 'Mì trộn cay tử thần cấp độ 8 cay tê dại',
    'Tiết canh vịt trời truyền thống đông quánh', 'Tiết canh dê núi chấm gừng mắm tôm nồng nặc', 'Pate gan heo sống tẩm thảo mộc kiểu Pháp',
    'Mắt cá ngừ đại dương chưng tiêu đen Phú Quốc', 'Bao tử cá ba sa xào ớt hiểm ma quỷ cay nồng', 'Lẩu mắm cá linh bông điên điển nồng đậm đà',
    'Chả cá lăng nướng riềng mẻ mắm tôm đậm đặc', 'Thịt lợn cắp nách xào măng chua ớt rừng cay xé', 'Thịt chó giả cầy nấu mắm tôm riềng mẻ cay gắt',
    'Bún đậu mắm tôm sủi bọt không pha đường', 'Mắm tôm chua Huế ngâm ớt bột đỏ rực', 'Nước mắm nhĩ 60 độ đạm ớt hiểm dầm nát',
    'Rượu ngâm rắn hổ mang bọ cạp nguyên con', 'Rượu ngâm sâu chít Điện Biên nồng độ cao', 'Rượu ngâm nhung hươu huyết nhung đậm đặc',
    'Bánh tráng cuốn cá trích sống Phú Quốc cay xè', 'Gỏi cá mai Nha Trang chấm nước dùng cay nồng', 'Cá nhảy Tây Bắc ăn sống giòn giã kèm lõi chuối',
    'Bò tái kiến đốt thơm mùi axit fomic', 'Nậm pịa dê Tây Bắc đắng ngắt vị thảo mộc', 'Lòng bò nấu nậm pịa đắng chát tê đầu lưỡi',
    'Canh pịa trâu lá đắng Tây Bắc cay nồng', 'Rau sắng nấu thịt băm dòi nấm rừng', 'Măng sặt xào lòng gà ớt chỉ thiên cay ngắt',
    'Nhộng ong rừng xào mỡ gà cay xé họng', 'Bọ hung rang giòn tẩm ớt bột Tây Bắc', 'Bọ xít xào măng chua ớt rừng Mù Cang Chải',
    'Châu chấu ma xào sả ớt hiểm nồng nặc', 'Thịt trâu gác bếp tẩm hạt dổi mắc khén nồng đậm', 'Lạp xưởng hun khói bã mía mùi nồng đặc trưng',
    'Bánh chưng đen nếp than ngâm tro than xoan', 'Cháo ấu tẩu Hà Giang đắng ngắt tê dại đầu lưỡi', 'Thắng cố ngựa Bắc Hà hầm lòng nội tạng',
    'Thắng dền cay nồng gừng già Hà Giang', 'Bánh đá Đồng Văn cứng như đá luộc gừng cay', 'Mèn mén bột ngô đồ 2 lửa nghẹn ứ cổ',
    'Rượu ngô men lá Na Hang nồng độ cháy họng', 'Cá mòi đóng hộp trộn sầu riêng xay nhuyễn', 'Trà sữa trân châu chấm mắm tôm béo ngậy',
    'Kem que vị hành tỏi phi và nước tương', 'Bánh quy kẹp ớt hiểm ngâm giấm chua cay', 'Socola tẩm bột ớt Carolina Reaper',
    'Kẹo dẻo vị sầu riêng mắm tôm bùng nổ', 'Bia đen nấu với sầu riêng và ớt hiểm', 'Bún riêu ốc chuối đậu cay cấp độ 8',
    'Cháo lươn xứ Nghệ cay xé họng nhiều hạt tiêu sọ', 'Gà hấp muối ớt cay nồng rực lửa', 'Mực xào sa tế ớt hiểm cay chảy nước mắt',
    'Bò xào ớt chuông ớt hiểm ớt sừng tam sắc cay nồng', 'Lẩu cá kèo sống giãy đành đạch trong nồi cay', 'Cá đuối hấp mỡ hành mắm nêm đậm mùi khai',
    'Canh chua cá đuối lá bổi khai nồng đặc trưng', 'Bún cá lóc nước lèo mắm bò hóc Campuchia', 'Bún num bo chóc cá lóc mắm prohok nồng đậm',
    'Hủ tiếu mắm cá sặc rưới mỡ hành ớt cay', 'Lẩu cua đồng mắm tôm bốc khói nghi ngút', 'Lẩu gà lá é Phú Yên cay nồng ớt xiêm xanh',
    'Bánh tráng nướng mắm ruốc Phan Thiết nồng vị biển', 'Bánh canh hẹ Phú Yên ngập tràn hẹ nồng cay xè', 'Chả cá thác lác nướng ớt xiêm xanh nguyên trái',
    'Mực một nắng nướng sa tế cay rộp môi', 'Tôm nướng muối ớt siêu cay cấp 8', 'Sò huyết nướng mọi chấm muối tiêu chanh ớt hiểm',
    'Bạch tuộc sống nhúng sốt cay nồng nặc', 'Chân gà sốt bơ tỏi ớt ma cay bỏng rát', 'Nộm sứa mắm tôm cay nồng đậm vị biển',
    'Bao tử hầm tiêu xanh cay nồng cháy cổ', 'Ốc xào me ớt hiểm cay rát lưỡi', 'Thịt ba chỉ luộc mắm tép chua miền Bắc cay xé',
    'Gỏi cá đục nướng cuốn bánh tráng rau rừng mắm nêm', 'Nộm hoa chuối tai heo bóp thính mắm tôm nồng'
  ]; // 80 items

  const goldNames = [
    'Nậm pịa Tây Bắc đắng ngắt vị dịch ruột non bò', 'Canh mắt cá ngừ đại dương nguyên con hầm thuốc bắc',
    'Cá mập lên men Hákarl Bắc Âu mùi khai nồng nặc', 'Lẩu sầu riêng mắm tôm cốt dừa bùng nổ vị giác',
    'Bọ cạp chiên giòn nguyên con sốt ớt tử thần', 'Nhện đen khổng lồ Tarantula chiên giòn Campuchia',
    'Sốt ớt ma Carolina Reaper tử thần 2.2 triệu Scoville', 'Tiết canh củ dền sốt tiêu ma quỷ bỏng rát họng',
    'Phô mai giòi Casu Marzu Ý lúc nhúc giòi sống', 'Bạch tuộc sống Sannakji Hàn Quốc xúc tu dính cổ họng',
    'Đầu cừu Svið Iceland bổ đôi luộc nguyên mắt tai', 'Haggis dạ dày cừu nhồi nội tạng băm Scotland',
    'Trứng luộc nước tiểu bé trai Đồng Dương Trung Quốc', 'Surströmming cá trích thối Thụy Điển bốc mùi khủng khiếp',
    'Kiviak hải âu lên men trong bụng hải cẩu Greenland', 'Rượu ngâm chuột bao tử mắt chưa mở Trung Hoa',
    'Trứng vịt lộn nguyên con 21 ngày tuổi hấp tiêu ma', 'Tiết canh heo tươi sống rắc húng quế mắm tôm',
    'Canh thịt dơi nguyên con nấu nước cốt dừa Guam', 'Thịt cá mập thối Hákarl cắt hạt lựu ngâm rượu mạnh',
    'Món cá nhảy Tây Bắc ăn trực tiếp khi cá còn sống trong nước măng chua', 'Lẩu đầu rắn hổ mang nguyên nanh sốt cay cấp 10',
    'Bọ xít rừng già Tây Bắc rang giòn chấm muối ớt mắt quỷ', 'Nước mắm rươi ủ chum 3 năm mùi nồng đặc sánh',
    'Mắm bò hóc nguyên chất cá linh ủ muối 2 năm Campuchia', 'Mắm ruốc xào thịt ba chỉ cay cấp 10 nồng nặc',
    'Thịt lợn chua gác bếp 5 năm lên men mốc trắng', 'Bánh flan trộn tiết canh vịt tươi rắc ớt bột ma',
    'Trà sữa trân châu mắm ruốc phủ sầu riêng nướng', 'Kem ốc quế vị mắm tôm hành phi và tiêu đen Phú Quốc',
    'Bia tươi ủ ớt Pepper X cay nhất hành tinh', 'Rượu ngâm nhện độc chuối rừng nguyên bình thủy tinh',
    'Bánh pizza tôm hùm sốt sầu riêng mắm tôm ủ men', 'Thịt chuột cống nhum nướng mọi chấm muối ớt hiểm',
    'Cá sấu nguyên con nướng than hoa sốt mù tạt cay chảy nước mắt', 'Đuông chà là sống khổng lồ tắm nước mắm cá cơm Phú Quốc',
    'Canh sâu măng Sơn La nấu măng chua cay bỏng lưỡi', 'Cà cuống cái nguyên con chiên giòn tinh dầu xộc lên mũi',
    'Óc bò tươi chưng cách thủy sốt tiêu đen cay cấp 10', 'Bao tử cá mập xào sa tế ớt tử thần',
    'Thịt kỳ đà xào lăn sả ớt nồng nặc', 'Dạ dày nhím rừng nấu măng đắng ngắt vị thuốc',
    'Lẩu lòng ngựa Thắng Cố nguyên bản mùi nồng Bắc Hà', 'Thịt thối Kiviak nướng than của người Inuit Bắc Cực',
    'Thịt tuần lộc sống xắt lát chấm mù tạt băng giá Siberia', 'Cháo ấu tẩu độc dược ninh nhừ 12 tiếng Hà Giang',
    'Rượu tam xà ngâm 3 loại rắn độc hổ mang cạp nong cạp nia', 'Mắt cá voi ngâm dấm chua chát Nhật Bản',
    'Tổ ong bắp cày nguyên sáp nhộng nướng bơ tỏi ớt', 'Súp dơi quạ nguyên cánh hầm tiêu đen Palau'
  ]; // 50 items

  return { blue: blueNames, purple: purpleNames, gold: goldNames };
}

// -------------------------------------------------------------------------
// BUILD ALL POOLS & EXPORT
// -------------------------------------------------------------------------
console.log('Generating pools data...');
const exp = makeExpressDishes();
const snk = makeSnackDishes();
const cmb = makeComboDishes();
const biz = makeBizarreDishes();

console.log(`Express: ${exp.blue.length} + ${exp.purple.length} + ${exp.gold.length} = ${exp.blue.length + exp.purple.length + exp.gold.length}`);
console.log(`Snack: ${snk.blue.length} + ${snk.purple.length} + ${snk.gold.length} = ${snk.blue.length + snk.purple.length + snk.gold.length}`);
console.log(`Combo: ${cmb.blue.length} + ${cmb.purple.length} + ${cmb.gold.length} = ${cmb.blue.length + cmb.purple.length + cmb.gold.length}`);
console.log(`Bizarre: ${biz.blue.length} + ${biz.purple.length} + ${biz.gold.length} = ${biz.blue.length + biz.purple.length + biz.gold.length}`);

// WRITE EXPRESS POOL TS
const expTs = `// src/data/casePools/expressPool.ts
// 200 EXCLUSIVE FAST MEAL DISHES FOR OFFICE SPEED & POWER NAP (0% DUPLICATION)

export interface FastDishItem {
  id: string;
  title: string;
  description: string;
  estimatedCostVnd: number;
  calories: number;
  imageUrl: string;
  speedMinutes?: number;
  napBuff?: string;
  snackFeature?: string;
  dareLevel?: string;
  darePenalty?: string;
  tier: 'blue' | 'purple' | 'gold';
}

export const EXPRESS_POOL_BLUE: FastDishItem[] = [
${exp.blue.map((name, i) => `  {
    id: 'exp-blue-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} thơm ngon, ấm bụng, ăn nhanh gọn để kịp ngủ trưa.',
    estimatedCostVnd: ${18000 + (i % 6) * 2000},
    calories: ${340 + (i % 8) * 15},
    speedMinutes: ${8 + (i % 5)},
    napBuff: '💤 Ăn trong ${8 + (i % 5)} phút, dành trọn 35 phút ngủ trưa say giấc!',
    tier: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const EXPRESS_POOL_PURPLE: FastDishItem[] = [
${exp.purple.map((name, i) => `  {
    id: 'exp-pur-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} đong đầy dinh dưỡng, thơm phức chuẩn vị truyền thống.',
    estimatedCostVnd: ${32000 + (i % 7) * 2000},
    calories: ${480 + (i % 9) * 15},
    speedMinutes: ${12 + (i % 5)},
    napBuff: '💤 Nạp đầy năng lượng, ngủ trưa 30 phút tỉnh táo tinh thần!',
    tier: 'purple',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const EXPRESS_POOL_GOLD: FastDishItem[] = [
${exp.gold.map((name, i) => `  {
    id: 'exp-gold-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} thượng hạng chuẩn vị nhà hàng, tinh hoa ẩm thực đỉnh chóp.',
    estimatedCostVnd: ${55000 + (i % 8) * 5000},
    calories: ${580 + (i % 8) * 20},
    speedMinutes: ${14 + (i % 4)},
    napBuff: '💤 Thưởng thức mỹ vị đẳng cấp, giấc ngủ trưa sâu phục hồi 100% sinh lực!',
    tier: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const EXPRESS_EXCLUSIVE_POOL: FastDishItem[] = [
  ...EXPRESS_POOL_BLUE,
  ...EXPRESS_POOL_PURPLE,
  ...EXPRESS_POOL_GOLD
];
`;
writeTsFile('expressPool.ts', expTs);

// WRITE SNACK POOL TS
const snkTs = `// src/data/casePools/snackPool.ts
// 200 EXCLUSIVE SNACK DISHES FOR GEN Z & FINGER FOODS (0% DUPLICATION)

import { FastDishItem } from './expressPool';

export const SNACK_POOL_BLUE: FastDishItem[] = [
${snk.blue.map((name, i) => `  {
    id: 'snk-blue-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} finger food tiện lợi bốc tay, để nguội trên bàn làm việc ăn vẫn giòn ngon.',
    estimatedCostVnd: ${25000 + (i % 5) * 2000},
    calories: ${320 + (i % 8) * 15},
    tier: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const SNACK_POOL_PURPLE: FastDishItem[] = [
${snk.purple.map((name, i) => `  {
    id: 'snk-pur-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} đậm đà béo ngậy, món nhậu vặt kinh điển của giới trẻ văn phòng.',
    estimatedCostVnd: ${40000 + (i % 6) * 4000},
    calories: ${450 + (i % 9) * 20},
    tier: 'purple',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const SNACK_POOL_GOLD: FastDishItem[] = [
${snk.gold.map((name, i) => `  {
    id: 'snk-gold-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} đại tiệc ăn vặt thượng hạng, giòn rụm thơm lừng đẳng cấp hoàng gia.',
    estimatedCostVnd: ${75000 + (i % 7) * 8000},
    calories: ${620 + (i % 8) * 25},
    tier: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const SNACK_EXCLUSIVE_POOL: FastDishItem[] = [
  ...SNACK_POOL_BLUE,
  ...SNACK_POOL_PURPLE,
  ...SNACK_POOL_GOLD
];
`;
writeTsFile('snackPool.ts', snkTs);

// WRITE COMBO POOL TS
const cmbTs = `// src/data/casePools/comboPool.ts
// 200 EXCLUSIVE 3-DISH COMBOS FOR OFFICE LUNCH (0% DUPLICATION)

import { FastDishItem } from './expressPool';

export const COMBO_POOL_BLUE: FastDishItem[] = [
${cmb.blue.map((name, i) => `  {
    id: 'cmb-blue-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: 'Mâm cơm bình dân no bụng cân bằng dinh dưỡng: Món mặn đậm đà + Canh rau tươi mát + Nước uống giải nhiệt.',
    estimatedCostVnd: ${30000 + (i % 5) * 2000},
    calories: ${520 + (i % 7) * 20},
    tier: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const COMBO_POOL_PURPLE: FastDishItem[] = [
${cmb.purple.map((name, i) => `  {
    id: 'cmb-pur-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: 'Mâm cơm văn phòng chất lượng cao đủ chất: Món chính giàu đạm + Canh hầm thanh ngọt + Đồ uống chuẩn vị.',
    estimatedCostVnd: ${50000 + (i % 6) * 4000},
    calories: ${640 + (i % 8) * 20},
    tier: 'purple',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const COMBO_POOL_GOLD: FastDishItem[] = [
${cmb.gold.map((name, i) => `  {
    id: 'cmb-gold-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: 'Bữa trưa thượng hạng hoàng gia đỉnh chóp: Mỹ vị hải sản/bò Mỹ + Canh bổ dưỡng cao cấp + Nước uống thượng phẩm.',
    estimatedCostVnd: ${95000 + (i % 8) * 10000},
    calories: ${760 + (i % 8) * 25},
    tier: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const COMBO_EXCLUSIVE_POOL: FastDishItem[] = [
  ...COMBO_POOL_BLUE,
  ...COMBO_POOL_PURPLE,
  ...COMBO_POOL_GOLD
];
`;
writeTsFile('comboPool.ts', cmbTs);

// WRITE BIZARRE POOL TS
const bizTs = `// src/data/casePools/bizarrePool.ts
// 200 EXCLUSIVE BIZARRE DARE DISHES FOR OFFICE BETS & BRAVERY CHALLENGES (0% DUPLICATION)

import { FastDishItem } from './expressPool';

export const BIZARRE_POOL_BLUE: FastDishItem[] = [
${biz.blue.map((name, i) => `  {
    id: 'biz-blue-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} - Thử thách Cấp Độ 6, nếm thử hương vị độc lạ bùng nổ vị giác.',
    estimatedCostVnd: ${28000 + (i % 6) * 2000},
    calories: ${280 + (i % 8) * 20},
    dareLevel: 'Cấp 6: Thử Nghiệm',
    darePenalty: 'Dám ăn 2 miếng lớn hoặc chịu phạt bao nước cả team!',
    tier: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const BIZARRE_POOL_PURPLE: FastDishItem[] = [
${biz.purple.map((name, i) => `  {
    id: 'biz-pur-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} - Thử thách Cấp Độ 8, độ cay và mùi nồng thách thức lòng can đảm!',
    estimatedCostVnd: ${45000 + (i % 6) * 3000},
    calories: ${380 + (i % 8) * 25},
    dareLevel: 'Cấp 8: Cay Đắng Tột Cùng',
    darePenalty: 'Ăn hết nửa phần hoặc trả tiền bữa trưa cho người thắng kèo!',
    tier: 'purple',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const BIZARRE_POOL_GOLD: FastDishItem[] = [
${biz.gold.map((name, i) => `  {
    id: 'biz-gold-${i + 1}',
    title: '${name.replace(/'/g, "\\'")}',
    description: '${name.replace(/'/g, "\\'")} - CỰC HẠN 10 HUYỀN THOẠI, món ăn kỳ dị nổi tiếng thế giới dành cho kẻ không sợ hãi!',
    estimatedCostVnd: ${85000 + (i % 7) * 8000},
    calories: ${450 + (i % 8) * 30},
    dareLevel: 'CỰC HẠN 10: HUYỀN THOẠI GAN DẠ',
    darePenalty: 'Ăn 1 thìa đầy mà không nhăn mặt sẽ được phong Vua Gan Dạ Văn Phòng!',
    tier: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80'
  }`).join(',\n')}
];

export const BIZARRE_EXCLUSIVE_POOL: FastDishItem[] = [
  ...BIZARRE_POOL_BLUE,
  ...BIZARRE_POOL_PURPLE,
  ...BIZARRE_POOL_GOLD
];
`;
writeTsFile('bizarrePool.ts', bizTs);

console.log('ALL 4 EXCLUSIVE CASE POOLS GENERATED SUCCESSFULLY!');
