import { POOLS, pickImg } from './recipe-pools.mjs';

function createRecipe({
  id,
  title,
  description,
  category = 'mon-chay',
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
  const imageUrl = pickImg('chay', poolIndex);
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

export function generateAllMonChay() {
  const recipes = [];

  // Group A: Món chay đậu hũ & phù trúc (40 dishes)
  const tofuBases = [
    { name: 'Đậu hũ non mềm mướt', ing: 'Đậu hũ non cắt khối vuông', cM: 0.9, calM: 0.85 },
    { name: 'Đậu hũ chiên vàng ruộm', ing: 'Đậu hũ chiên vàng giòn cắt miếng', cM: 0.85, calM: 1.1 },
    { name: 'Tàu hũ ky lá tươi', ing: 'Tàu hũ ky lá tươi ngâm nở cắt khúc', cM: 1.1, calM: 1.05 },
    { name: 'Phù trúc cuộn nấm', ing: 'Phù trúc cuộn nấm mèo mộc nhĩ', cM: 1.15, calM: 0.95 },
    { name: 'Đậu hũ bao bố thanh tịnh', ing: 'Đậu hũ chiên bọc nhân nấm củ quả', cM: 1.2, calM: 0.9 },
    { name: 'Đậu hũ lướt ván giòn vỏ', ing: 'Đậu hũ Mơ cắt lát chiên lướt ván', cM: 0.85, calM: 1.0 },
    { name: 'Chả lụa chay ngũ vị', ing: 'Chả lụa chay cắt lát dày dặn', cM: 1.05, calM: 0.95 },
    { name: 'Đậu hũ Mơ cắt vuông', ing: 'Đậu hũ Mơ trắng mềm béo ngậy', cM: 0.9, calM: 0.9 },
    { name: 'Đậu hũ chiên xù giòn tan', ing: 'Đậu hũ lăn bột chiên xù giòn rụm', cM: 0.95, calM: 1.15 },
    { name: 'Tàu hũ ky cọng kho dẻo', ing: 'Tàu hũ ky cọng ngâm mềm cắt khúc', cM: 1.1, calM: 1.0 }
  ];

  const tofuStyles = [
    {
      suffix: 'Sốt Cà Chua Nấm Rơm Chua Ngọt',
      desc: 'Món chay quốc dân thanh khiết: Đậu hũ mềm béo ngập trong sốt cà chua đỏ au sánh kẹo và nấm rơm búp ngọt giòn.',
      method: 'Phi thơm boa-rô băm nhuyễn, cho cà chua vào xào nhuyễn tạo màu sốt đỏ óng. Thả nấm rơm và đậu hũ vào om nhỏ lửa trong 8 phút cho đậu ngấm đượm vị chua ngọt thanh mát. Nêm hạt nêm chay nấm và rắc ngò rí.',
      tip: 'Đảo thật nhẹ tay để miếng đậu hũ non giữ nguyên hình khối không bị nát vụn.',
      chef: 'Bí quyết đầu bếp: Xào cà chua với chút dầu màu điều tạo sắc đỏ cam óng ánh tuyệt đẹp, thêm 1 muỗng cà phê đường thốt nốt giúp sốt cà chua có vị chua ngọt thanh tao dịu nhẹ làm say đắm lòng người.',
      tags: ['Món Chay', 'Đậu Hũ', 'Sốt Cà Chua', 'Thanh Tịnh'],
      baseCost: 32000,
      baseCal: 220,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Chiên Sả Ớt Giòn Bùi The Cay',
      desc: 'Món chay kích thích vị giác: Lớp vỏ ngoài giòn rụm thơm lừng sả non chiên vàng, bên trong mềm béo bùi ngậy.',
      method: 'Khía nhẹ thân đậu hũ nhồi sả băm ớt hiểm đã nêm gia vị. Đun nóng dầu chiên đậu hũ vàng giòn hai mặt trong 8 phút. Trút phần sả ớt còn lại vào chảo phi vàng giòn rồi rắc đều lên mặt đĩa đậu hũ.',
      tip: 'Chiên lửa vừa để sả không bị cháy đắng trước khi vỏ đậu kịp giòn vàng.',
      chef: 'Bí quyết đầu bếp: Băm sả thật nhuyễn ướp cùng chút bột nghệ và hạt nêm chay, chiên đậu hũ ngập dầu lửa vừa cho vỏ ngoài giòn rụm màu vàng ruộm mà bên trong vẫn mềm mướt béo ngậy.',
      tags: ['Món Chay', 'Chiên Sả Ớt', 'Giòn Bùi', 'Cay Nồng'],
      baseCost: 30000,
      baseCal: 240,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Kho Nấm Đông Cô Nước Dừa Tươi',
      desc: 'Đậm đà hương vị chay Nam Bộ: Đậu hũ và nấm đông cô ninh nhừ trong nước dừa xiêm ngọt lịm, nước kho kẹo dẻo màu nâu óng.',
      method: 'Xếp đậu hũ và nấm đông cô vào tộ đất. Nêm nước tương ngon, dầu hào chay, tiêu sọ và nước dừa tươi Bến Tre. Đun sôi rồi hạ lửa liu riu kho trong 18 phút đến khi nước cạn keo sánh bám đều miếng đậu.',
      tip: 'Kho trong tộ đất nhỏ lửa giúp nước dừa ngấm sâu tạo vị béo ngọt thanh tao.',
      chef: 'Bí quyết đầu bếp: Dùng nước dừa tươi nguyên chất kho liu riu cùng nấm đông cô đã ngâm nở, vị ngọt thanh khiết từ nấm và nước dừa sẽ hòa quyện tạo nên nước sốt kho sánh đặc màu hổ phách tuyệt đỉnh.',
      tags: ['Món Chay', 'Kho Nước Dừa', 'Nấm Đông Cô', 'Đậm Đà'],
      baseCost: 35000,
      baseCal: 230,
      reg: 'nam'
    },
    {
      suffix: 'Hấp Xì Dầu Gừng Tươi Boa-rô',
      desc: 'Món chay thanh nhã cung đình: Đậu hũ mềm mọng nước hòa quyện xì dầu thượng hạng, gừng sợi the ấm và dầu mè thơm nức.',
      method: 'Xếp đậu hũ lên đĩa sâu lòng, rải gừng thái chỉ và boa-rô lên trên. Rưới hỗn hợp xì dầu, dầu hào chay và chút dầu mè thơm. Đặt vào xửng hấp cách thủy trên lửa lớn 10 phút. Rưới 1 muỗng dầu nóng lên mặt khi hoàn thành.',
      tip: 'Hấp cách thủy giữ trọn độ ẩm mọng nước và vị ngọt thanh nguyên bản.',
      chef: 'Bí quyết đầu bếp: Khi đĩa đậu hũ hấp vừa chín tới bốc khói, đun sôi 1 muỗng canh dầu mè thơm rồi rưới trực tiếp lên lớp gừng sợi trên mặt đĩa, hương thơm sẽ bùng nổ ngào ngạt thanh khiết.',
      tags: ['Món Chay', 'Hấp Xì Dầu', 'Thanh Nhã', 'Dưỡng Sinh'],
      baseCost: 34000,
      baseCal: 190,
      reg: 'bac'
    }
  ];

  for (let b = 0; b < tofuBases.length; b++) {
    for (let s = 0; s < tofuStyles.length; s++) {
      const base = tofuBases[b];
      const style = tofuStyles[s];
      recipes.push({
        title: `${base.name} ${style.suffix}`,
        desc: `${base.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (base.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.calM * (base.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Ăn Chay', 'Món Chay'],
        ingName: base.ing,
        ingAmount: 400,
        ingUnit: 'g'
      });
    }
  }

  // Group B: Món chay nấm & củ quả (40 dishes)
  const vegItems = [
    { name: 'Nấm đùi gà tươi khoanh tròn', ing: 'Nấm đùi gà tươi cắt khoanh tròn khía caro', cM: 1.15, calM: 0.9 },
    { name: 'Nấm bào ngư xám tươi non', ing: 'Nấm bào ngư xám xé miếng vừa ăn', cM: 1.0, calM: 0.85 },
    { name: 'Mít non luộc chín thái miếng', ing: 'Mít non luộc mềm thái lát dày', cM: 1.05, calM: 0.95 },
    { name: 'Cà tím non bổ múi cau', ing: 'Cà tím non bổ múi ngâm nước muối', cM: 0.9, calM: 0.8 },
    { name: 'Nấm rơm búp tươi non', ing: 'Nấm rơm búp gọt chân nấm rửa sạch', cM: 1.1, calM: 0.85 },
    { name: 'Nấm hương tươi mũ tròn', ing: 'Nấm hương tươi khía chữ thập', cM: 1.2, calM: 0.9 },
    { name: 'Sườn non chay ngâm mềm', ing: 'Sườn non chay ngâm nở vắt kiệt nước', cM: 1.05, calM: 1.05 },
    { name: 'Củ sen tươi giòn ngọt', ing: 'Củ sen tươi thái lát ngâm chanh', cM: 1.15, calM: 0.9 },
    { name: 'Khổ qua non cắt khoanh', ing: 'Khổ qua non móc ruột cắt khoanh tròn', cM: 0.95, calM: 0.8 },
    { name: 'Bí ngô non hấp mềm bùi', ing: 'Bí đỏ non gọt vỏ cắt quân cờ', cM: 0.85, calM: 0.9 }
  ];

  const vegStyles = [
    {
      suffix: 'Kho Tiêu Xanh Nước Dừa Tươi Bến Tre',
      desc: 'Món kho chay đậm đà hao cơm: Từng miếng củ nấm săn giòn thấm đẫm nước dừa ngọt lịm và tiêu xanh cay nồng ấm áp.',
      method: 'Xào săn nấm củ quả trên lửa lớn cho tươm nước. Cho vào tộ đất cùng nước tương tamari, tiêu xanh đập dập và nước dừa xiêm. Đun sôi rồi hạ lửa liu riu kho trong 15 phút đến khi nước sốt keo sánh óng ánh.',
      tip: 'Kho tộ đất lửa nhỏ giúp gia vị ngấm sâu vào lõi củ nấm.',
      chef: 'Bí quyết đầu bếp: Khía nhẹ hình mắt lưới trên mặt nấm đùi gà để nấm ngấm gia vị sâu, kho cùng tiêu xanh tươi nguyên chùm giúp món kho dậy mùi thơm the cay tự nhiên không thể chối từ.',
      tags: ['Món Chay', 'Kho Tiêu Xanh', 'Nước Dừa', 'Đậm Vị'],
      baseCost: 35000,
      baseCal: 190,
      reg: 'nam'
    },
    {
      suffix: 'Chiên Giòn Sốt Me Chua Ngọt Cay',
      desc: 'Lớp bột ngoài giòn rụm rụm bao bọc nấm ngọt mọng nước, quyện trong sốt me chua ngọt cay bùng nổ hương vị.',
      method: 'Lăn nguyên liệu qua bột chiên giòn mỏng, thả vào chảo dầu nóng chiên vàng giòn vớt ra ráo dầu. Nấu kẹo sốt me với đường thốt nốt và ớt băm, trút nguyên liệu vào đảo nhanh tay 1 phút cho sốt bọc đều lớp vỏ giòn.',
      tip: 'Đảo thật nhanh trên lửa lớn để lớp vỏ không bị ỉu mềm.',
      chef: 'Bí quyết đầu bếp: Pha bột chiên với nước thật lạnh có ga giúp lớp vỏ sau khi chiên giòn tan rụm rụm, đun sốt me thật kẹo sánh rồi đảo nhanh tay giúp món ăn giữ độ giòn suốt 2 tiếng.',
      tags: ['Món Chay', 'Chiên Giòn', 'Sốt Me', 'Ăn Vặt'],
      baseCost: 36000,
      baseCal: 260,
      reg: 'nam'
    },
    {
      suffix: 'Kho Nghệ Tươi Mật Mía Miền Trung',
      desc: 'Đặc sản chay xứ Nghệ: Màu vàng rực rỡ của nghệ tươi giã nát hòa quyện mật mía sánh kẹo và sả ớt the nồng ấm bụng.',
      method: 'Ướp nguyên liệu với nghệ tươi giã nát, mật mía và nước tương trong 10 phút. Phi thơm boa-rô và ớt hiểm, cho nguyên liệu vào xào săn. Châm chút nước ấm kho nhỏ lửa 15 phút cho nước cạn keo sánh bám đều.',
      tip: 'Nghệ tươi giã dập tạo màu vàng tự nhiên và mùi thơm thảo mộc ấm áp.',
      chef: 'Bí quyết đầu bếp: Dùng nghệ tươi bánh tẻ cạo sạch giã nhuyễn xào thơm với dầu lạc trước khi kho, mật mía nguyên chất sẽ bọc lấy từng miếng nấm tạo sắc vàng nâu óng ả tuyệt vời.',
      tags: ['Món Chay', 'Kho Nghệ Tươi', 'Mật Mía', 'Miền Trung'],
      baseCost: 34000,
      baseCal: 180,
      reg: 'trung'
    },
    {
      suffix: 'Xào Hạt Sen Củ Năng Giòn Ngọt',
      desc: 'Món xào chay thanh nhã thanh lọc cơ thể: Hạt sen tươi bùi béo kết hợp củ năng giòn ngọt mọng nước và nấm hương thơm lành.',
      method: 'Luộc chín tới hạt sen tươi. Phi thơm boa-rô, cho củ năng và nấm vào xào nhanh trên lửa lớn trong 3 phút. Đổ hạt sen vào đảo đều, nêm 1 muỗng dầu hào chay và hạt tiêu xay, đảo nhanh 30 giây rồi tắt bếp.',
      tip: 'Củ năng gọt vỏ ngâm nước đá lạnh để giữ độ giòn ngọt mọng nước.',
      chef: 'Bí quyết đầu bếp: Hấp chín hạt sen tươi trước khi xào để hạt sen bở tơi bùi ngậy, xào củ năng trên lửa lớn đảo thật nhanh tay giúp giữ nguyên độ mọng nước giòn sần sật thanh mát.',
      tags: ['Món Chay', 'Hạt Sen', 'Củ Năng', 'Thanh Nhẹ'],
      baseCost: 38000,
      baseCal: 200,
      reg: 'toan-quoc'
    }
  ];

  for (let v = 0; v < vegItems.length; v++) {
    for (let s = 0; s < vegStyles.length; s++) {
      const item = vegItems[v];
      const style = vegStyles[s];
      recipes.push({
        title: `${item.name} ${style.suffix}`,
        desc: `${item.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (item.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.calM * (item.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Ăn Chay', 'Món Nấm'],
        ingName: item.ing,
        ingAmount: 400,
        ingUnit: 'g'
      });
    }
  }

  // Group C: Canh & Lẩu chay thanh tịnh (40 dishes)
  const soupChayBases = [
    { name: 'Canh chua chay bông điên điển', ing: 'Bông điên điển, nấm rơm & đậu hũ non', cM: 1.0, calM: 0.85 },
    { name: 'Canh rong biển hạt sen đậu hũ', ing: 'Rong biển khô ngâm nở, hạt sen tươi & đậu hũ', cM: 1.2, calM: 0.9 },
    { name: 'Canh nấm ngũ sắc củ sen', ing: 'Nấm đùi gà, nấm hương, củ sen & cà rốt', cM: 1.15, calM: 0.85 },
    { name: 'Canh bí đỏ đậu phộng chay', ing: 'Bí đỏ cắt miếng & đậu phộng giã dập', cM: 0.9, calM: 1.15 },
    { name: 'Canh mướp non nấm rơm', ing: 'Mướp hương thái vát & nấm rơm búp', cM: 0.9, calM: 0.8 },
    { name: 'Canh khổ qua nhồi nấm đậu hũ', ing: 'Khổ qua nhồi nấm mèo & đậu hũ băm', cM: 1.05, calM: 0.85 },
    { name: 'Canh bắp ngọt củ quả thảo mộc', ing: 'Bắp ngọt, củ sen, củ năng & táo đỏ', cM: 1.1, calM: 0.9 },
    { name: 'Canh kiểm Nam Bộ nước cốt dừa', ing: 'Khoai lang, bí đỏ, đậu que & nước cốt dừa', cM: 1.0, calM: 1.2 },
    { name: 'Canh đu đủ xanh nấm bào ngư', ing: 'Đu đủ xanh thái mỏng & nấm bào ngư', cM: 0.85, calM: 0.8 },
    { name: 'Lẩu nấm thập cẩm chua cay chay', ing: 'Nấm đùi gà, nấm kim châm, nấm hương & đậu hũ', cM: 1.3, calM: 0.95 }
  ];

  const soupChayStyles = [
    {
      suffix: 'Nấu Nước Dùng Củ Quả Ngọt Thanh',
      desc: 'Nước dùng ninh từ mía lau củ cải ngọt mát tự nhiên: Thanh lọc cơ thể, bồi bổ nguyên khí nhẹ nhàng thanh tịnh.',
      method: 'Ninh nước dùng củ quả ngọt mát 15 phút. Thả nguyên liệu chính vào nấu nhỏ lửa trong 8 phút cho chín tới. Nêm muối hồng và hạt nêm chay nấm bào ngư, rắc ngò gai thái nhỏ tắt bếp.',
      tip: 'Ninh củ cải và mía lau từ đầu để nước dùng có vị ngọt thanh không cần đường.',
      chef: 'Bí quyết đầu bếp: Ninh nước dùng từ củ cải trắng, mướp hương và bắp ngọt trước 20 phút rồi lọc lấy nước trong veo, nước canh sẽ có vị ngọt hậu sâu lắng tự nhiên tinh khiết.',
      tags: ['Món Chay', 'Canh Chay', 'Nước Dùng Củ Quả', 'Thanh Mát'],
      baseCost: 35000,
      baseCal: 170,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Thì Là Hành Hoa Mùi Tàu Thơm Ngát',
      desc: 'Hương thơm thảo mộc phố cổ Hà Nội: Bát canh chay ngào ngạt mùi thơm thanh tao của thì là, mùi tàu và hành hoa tươi.',
      method: 'Xào thơm nấm và boa-rô với chút dầu mè. Châm 1.2 lít nước sôi, thả nguyên liệu vào nấu chín tới trong 5 phút. Nêm chút nước tương ngon, rắc lượng lớn thì là mùi tàu thái nhỏ đảo nhẹ rồi tắt bếp.',
      tip: 'Rắc thì là mùi tàu sau cùng khi tắt bếp để giữ nguyên hương thơm tinh dầu.',
      chef: 'Bí quyết đầu bếp: Dùng dầu mè nguyên chất xào nhẹ nấm trước khi nấu, rắc nhiều thì là và ngò gai thái nhỏ ngay khi vừa tắt bếp để hương thảo mộc bay bổng ngào ngạt cả gian phòng.',
      tags: ['Món Chay', 'Thảo Mộc', 'Thì Là', 'Bắc Bộ'],
      baseCost: 33000,
      baseCal: 160,
      reg: 'bac'
    },
    {
      suffix: 'Nước Cốt Dừa Béo Bùi Bến Tre',
      desc: 'Phong vị canh kiểm Nam Bộ ngọt bùi: Nước cốt dừa tươi thơm béo ngậy bao bọc củ quả dẻo bùi ngọt mát.',
      method: 'Nấu chín mềm củ quả trong nước dão dừa. Khi củ quả vừa chín bở, đổ nước cốt dừa nguyên chất vào khuấy nhẹ tay trên lửa nhỏ cho sôi lăn tăn, nêm chút muối đường thốt nốt rồi tắt bếp.',
      tip: 'Cho nước cốt dừa đậm đặc vào sau cùng và không đun sôi sùng sục để không bị tách dầu.',
      chef: 'Bí quyết đầu bếp: Vắt nước cốt dừa đậm đặc để riêng, dùng nước dão dừa nấu chín củ quả trước rồi mới hòa nước cốt dừa vào ở bước cuối cùng, canh sẽ thơm béo ngậy mà không hề ngấy.',
      tags: ['Món Chay', 'Nước Cốt Dừa', 'Canh Kiểm', 'Nam Bộ'],
      baseCost: 38000,
      baseCal: 240,
      reg: 'nam'
    },
    {
      suffix: 'Rau Răm Ngò Om The Cay Ấm Áp',
      desc: 'Vị chua cay ấm nồng quyến rũ: Me chua dịu nhẹ hòa cùng rau om ngò gai và ớt hiểm cay the nồng nàn.',
      method: 'Đun sôi nước me trong veo, thả nấm củ quả vào nấu chín trong 6 phút. Nêm hạt nêm chay và ớt băm cay nhẹ. Thả rau ngò om và rau răm thái nhỏ vào đảo đều tắt bếp ngay.',
      tip: 'Ngò om rau răm thả vào khi canh đang sôi bùng tắt bếp ngay để không bị nồng nát.',
      chef: 'Bí quyết đầu bếp: Rau ngò om và rau răm tươi rửa sạch thái nhỏ thả vào nồi canh chua ngay khi tắt bếp, tinh dầu ngò om sẽ đánh thức vị chua ngọt thanh mát cực kỳ quyến rũ.',
      tags: ['Món Chay', 'Canh Chua Chay', 'Ngò Om', 'Thanh Khiết'],
      baseCost: 34000,
      baseCal: 165,
      reg: 'nam'
    }
  ];

  for (let b = 0; b < soupChayBases.length; b++) {
    for (let s = 0; s < soupChayStyles.length; s++) {
      const base = soupChayBases[b];
      const style = soupChayStyles[s];
      recipes.push({
        title: `${base.name} ${style.suffix}`,
        desc: `${base.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (base.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.calM * (base.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Ăn Chay', 'Canh Chay'],
        ingName: base.ing,
        ingAmount: 450,
        ingUnit: 'g'
      });
    }
  }

  // Format into 120 recipes: 60 in Part 1, 60 in Part 2
  return recipes.map((r, idx) => {
    const isP1 = idx < 60;
    const num = isP1 ? idx + 1 : idx - 60 + 1;
    const id = isP1 ? `vn-p1-chay-${String(num).padStart(3, '0')}` : `vn-p2-chay-${String(num).padStart(3, '0')}`;
    return createRecipe({
      id,
      title: r.title,
      description: r.desc,
      category: 'mon-chay',
      region: r.reg,
      prepTimeMinutes: 12,
      cookTimeMinutes: 15,
      calories: r.cal,
      estimatedCostVnd: r.cost,
      poolIndex: idx,
      ingredients: [
        { name: r.ingName, amount: r.ingAmount, unit: r.ingUnit, category: 'rau-cu' },
        { name: 'Boa-rô (hành boa-rô) băm nhuyễn', amount: 2, unit: 'nhánh', category: 'rau-cu' },
        { name: 'Nước tương đậu nành thượng hạng', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Hạt nêm nấm chay tinh khiết', amount: 1.5, unit: 'muỗng cà phê', category: 'gia-vi' },
        { name: 'Dầu ăn thực vật', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Tiêu đen xay nhuyễn', amount: 0.5, unit: 'muỗng cà phê', category: 'gia-vi' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Làm sạch nguyên liệu chay',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Làm sạch nấm, đậu hũ và rau củ với nước muối loãng. Nấm cắt bỏ chân nấm, đậu hũ cắt miếng vừa ăn, thấm ráo nước hoàn toàn.',
          tip: 'Thấm ráo nước giúp nguyên liệu khi nấu ngấm trọn gia vị thơm ngon.'
        },
        {
          step: 2,
          title: 'Ướp gia vị chay thanh tịnh',
          durationMinutes: 8,
          heatLevel: 'không dùng nhiệt',
          content: 'Ướp nhẹ nguyên liệu với nước tương tamari, hạt nêm nấm và chút tiêu xay trong 8 phút cho thấm sâu gia vị tự nhiên.',
          tip: 'Dùng nước tương ủ tự nhiên để món chay có vị thơm ngọt thanh tao.'
        },
        {
          step: 3,
          title: 'Chế biến & Canh lửa chuẩn xác',
          durationMinutes: 10,
          heatLevel: 'lửa vừa',
          content: r.method,
          tip: r.tip
        },
        {
          step: 4,
          title: 'Hoàn thiện & Bày đĩa thưởng thức',
          durationMinutes: 2,
          heatLevel: 'không dùng nhiệt',
          content: 'Múc món chay ra đĩa sâu lòng hoặc tô sứ trắng, rắc thêm boa-rô phi hoặc tiêu xay lên mặt. Thưởng thức nóng cùng cơm trắng thanh tịnh.',
          tip: 'Bày món ăn ra tô sứ trắng tôn vinh nét đẹp thanh khiết của ẩm thực chay.'
        }
      ],
      tags: r.tags,
      chefTip: r.chef,
      difficulty: 'Dễ'
    });
  });
}

console.log('generateAllMonChay defined.');
