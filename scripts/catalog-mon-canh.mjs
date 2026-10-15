import { POOLS, pickImg } from './recipe-pools.mjs';

function createRecipe({
  id,
  title,
  description,
  category = 'mon-canh',
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
  const imageUrl = pickImg('soup', poolIndex);
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

export function generateAllMonCanh() {
  const recipes = [];

  // Group A: Canh chua (50)
  const chuaProteins = [
    { name: 'Cá lóc đồng', ing: 'Cá lóc đồng cắt khoanh tròn', costM: 1.1, calM: 0.95 },
    { name: 'Tôm sú tươi', ing: 'Tôm sú tươi bóc vỏ chừa đuôi', costM: 1.25, calM: 0.9 },
    { name: 'Ngao hoa biển', ing: 'Ngao hoa tươi ngâm sạch cát', costM: 0.85, calM: 0.8 },
    { name: 'Cá diêu hồng', ing: 'Cá diêu hồng phi lê cắt khúc', costM: 0.95, calM: 0.95 },
    { name: 'Cá bớp biển', ing: 'Cá bớp cắt lát dày', costM: 1.35, calM: 1.1 },
    { name: 'Lươn đồng tươi', ing: 'Thịt lươn đồng làm sạch cắt khúc', costM: 1.2, calM: 0.9 },
    { name: 'Cá hồi tươi', ing: 'Cá hồi Na Uy phi lê cắt vuông', costM: 1.4, calM: 1.2 },
    { name: 'Cá basa phi lê', ing: 'Cá basa phi lê cắt khoanh', costM: 0.9, cM: 1.05 },
    { name: 'Hến sông tươi', ing: 'Thịt hến tươi & nước luộc hến', costM: 0.8, calM: 0.75 },
    { name: 'Thịt bắp bò mềm', ing: 'Bắp bò thái lát mỏng', costM: 1.15, calM: 0.95 }
  ];

  const chuaStyles = [
    {
      suffix: 'Nấu Bông Điên Điển Me Chua Miền Tây',
      desc: 'Đặc sản mùa nước nổi miền Tây: Nước canh me chua ngọt thanh khiết kết hợp bông điên điển vàng tươi giòn ngọt và ngò om thơm ngát.',
      method: 'Đun sôi nước me lọc trong, thả nguyên liệu chính vào đun chín tới trong 5 phút. Thả cà chua, giá đỗ và bông điên điển vào đun sôi bùng 30 giây rồi tắt bếp ngay, rắc ngò om và tỏi phi.',
      tip: 'Bông điên điển chỉ thả vào sau cùng khi nước sôi bùng để hoa giữ màu vàng tươi và độ giòn ngọt.',
      chef: 'Bí quyết đầu bếp: Dầm me chín với nước canh ấm rồi lọc lấy nước cốt chua thanh dịu, bông điên điển thả vào nồi canh tắt bếp ngay để hoa giữ nguyên sắc vàng rực rỡ và vị ngọt giòn thanh khiết.',
      tags: ['Món Canh', 'Canh Chua', 'Bông Điên Điển', 'Miền Tây'],
      baseCost: 38000,
      baseCal: 190,
      reg: 'nam'
    },
    {
      suffix: 'Nấu Khóm Cà Chua & Bạc Hà Chua Ngọt',
      desc: 'Món canh chua thanh mát Nam Bộ: Khóm chua ngọt dịu, bạc hà xốp mềm ngấm đượm nước canh me chua thanh mát lành giải nhiệt.',
      method: 'Xào thơm tỏi băm và khóm cà chua cho lên màu đỏ vàng óng ả. Châm 1.2 lít nước đun sôi cùng nước cốt me. Thả nguyên liệu chính vào nấu chín tới, cho bạc hà giá đỗ vào đun sôi 1 phút rồi rắc ngò gai.',
      tip: 'Bóp bạc hà với muối hạt rồi rửa sạch vắt ráo để khi ăn không bị ngứa họng.',
      chef: 'Bí quyết đầu bếp: Xào khóm và cà chua với chút dầu ăn trước khi châm nước dùng giúp nước canh có màu vàng đỏ tự nhiên óng ánh, vị chua ngọt thanh mát hòa quyện đậm sâu.',
      tags: ['Món Canh', 'Canh Chua', 'Khóm Cà Chua', 'Nam Bộ'],
      baseCost: 35000,
      baseCal: 180,
      reg: 'nam'
    },
    {
      suffix: 'Nấu Măng Chua Thì Là Thanh Dịu Xứ Bắc',
      desc: 'Hương vị canh chua đất Bắc: Măng tre muối chua giòn ngọt nấu cùng cà chua mọng nước và thì là hành hoa thơm nức mũi.',
      method: 'Xào săn nguyên liệu với hành khô và nước mắm cốt. Cho măng chua tước sợi vào xào cùng 3 phút. Châm nước sôi hầm nhỏ lửa 10 phút cho măng ngấm vị ngọt, thả cà chua và rắc nhiều thì là hành hoa.',
      tip: 'Nước canh phải thật sôi mới thả thì là hành hoa vào để rau giữ màu xanh tươi.',
      chef: 'Bí quyết đầu bếp: Xào kỹ măng chua với chút nước mắm cá cơm trước khi châm nước sôi giúp vị chua của măng dịu nhẹ thanh tao, thả thì là hành hoa thái nhỏ ở bước cuối để dậy mùi thơm nức.',
      tags: ['Món Canh', 'Măng Chua', 'Thì Là', 'Bắc Bộ'],
      baseCost: 36000,
      baseCal: 175,
      reg: 'bac'
    },
    {
      suffix: 'Nấu Dứa Dọc Mùng Me Chua Xứ Quảng',
      desc: 'Bát canh chua dải đất miền Trung: Nước canh chua thanh của me chín hòa quyện dứa thơm lừng và dọc mùng giòn xốp the nồng ớt xiêm.',
      method: 'Đun sôi nước me dầm trong, thả nguyên liệu chính vào nấu chín. Cho dứa cắt lát và cà chua vào đun sôi lăn tăn 4 phút. Thả dọc mùng tước vỏ bóp muối vào sôi bùng 1 phút, nêm ớt xiêm đập dập.',
      tip: 'Dọc mùng tước vỏ bóp kỹ với muối hạt để giữ độ giòn sần sật và không gây ngứa.',
      chef: 'Bí quyết đầu bếp: Thả ớt xiêm xanh đập dập vào nồi canh chua ngay trước khi tắt bếp, vị cay the the nhè nhẹ đánh thức toàn bộ vị giác và xua tan hoàn toàn cảm giác tanh lạnh.',
      tags: ['Món Canh', 'Dọc Mùng', 'Dứa', 'Miền Trung'],
      baseCost: 34000,
      baseCal: 170,
      reg: 'trung'
    },
    {
      suffix: 'Nấu Lá Giang Chua Thanh Đồng Nội',
      desc: 'Vị chua thanh mát độc đáo của lá giang rừng vò nát: Nước dùng trong ngọt đậm đà xua tan oi ả mùa hè.',
      method: 'Nấu sôi nước dùng hầm ngọt từ nguyên liệu chính trong 10 phút. Lá giang nhặt sạch lá úa, vò nát nhẹ bằng tay cho tiết vị chua rồi thả vào nồi canh sôi. Đun sôi bùng 1 phút rồi tắt bếp, nêm nước mắm ngon.',
      tip: 'Vò nát nhẹ lá giang trước khi thả vào nồi để giải phóng vị chua thanh tao.',
      chef: 'Bí quyết đầu bếp: Lá giang phải dùng tay vò nát trước khi thả vào nồi nước đang sôi bùng, vị chua thanh khiết đặc trưng sẽ tiết trọn vẹn vào nước canh mà không bị đắng chát.',
      tags: ['Món Canh', 'Lá Giang', 'Chua Thanh', 'Đồng Quê'],
      baseCost: 37000,
      baseCal: 185,
      reg: 'nam'
    }
  ];

  for (let p = 0; p < chuaProteins.length; p++) {
    for (let s = 0; s < chuaStyles.length; s++) {
      const prot = chuaProteins[p];
      const style = chuaStyles[s];
      recipes.push({
        title: `Canh Chua ${prot.name} ${style.suffix}`,
        desc: `${prot.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (prot.costM || 1)) / 1000) * 1000,
        cal: Math.round(style.baseCal * (prot.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Canh Chua', 'Thanh Mát'],
        ingName: prot.ing,
        secName: 'Me chín vắt & Dứa chín',
        secUnit: 'muỗng canh',
        secAmount: 2
      });
    }
  }

  // Group B: Canh sườn, giò & củ quả (50)
  const boneBases = [
    { name: 'Sườn non heo chặt khúc', ing: 'Sườn non heo tươi chặt khúc vừa ăn', cM: 1.15, calM: 1.1 },
    { name: 'Giò heo ninh mềm', ing: 'Thịt giò heo cạo sạch chặt khoanh', cM: 1.1, calM: 1.25 },
    { name: 'Xương đuôi heo ngọt nước', ing: 'Xương đuôi heo chặt khúc ninh ngọt', cM: 0.95, calM: 1.05 },
    { name: 'Sườn sụn heo giòn sần sật', ing: 'Sườn sụn non heo thái lát mỏng', cM: 1.2, calM: 1.0 },
    { name: 'Nạc vai heo băm viên', ing: 'Thịt nạc vai heo vo viên tròn', cM: 0.9, calM: 0.9 },
    { name: 'Đuôi bò hầm bổ dưỡng', ing: 'Đuôi bò cạo sạch chặt khúc hầm nhừ', cM: 1.35, calM: 1.2 },
    { name: 'Gà ta chặt miếng ninh', ing: 'Gà ta thả vườn chặt miếng vừa ăn', cM: 1.1, calM: 1.0 },
    { name: 'Thịt chân giò rút xương', ing: 'Thịt chân giò cuộn chỉ ninh nhừ', cM: 1.05, calM: 1.15 },
    { name: 'Thịt vịt cỏ ngọt nước', ing: 'Vịt cỏ chặt miếng rửa rượu gừng', cM: 1.15, calM: 1.15 },
    { name: 'Móng giò heo béo ngậy', ing: 'Móng giò heo chặt khoanh tròn', cM: 0.9, calM: 1.2 }
  ];

  const boneStyles = [
    {
      suffix: 'Nấu Quả Sấu Chua Hành Hoa Mùi Tàu',
      desc: 'Món canh thanh nhiệt kinh điển phố cổ Hà Nội: Nước xương ninh trong ngọt lịm kết hợp vị chua thanh khiết của quả sấu tươi mùa hè.',
      method: 'Ninh xương trên lửa vừa trong 20 phút hớt sạch bọt. Thả sấu đã cạo vỏ vào ninh cùng 10 phút cho sấu mềm. Vớt sấu ra dầm nát lọc lấy nước chua thanh trút lại nồi, nêm mắm ngon và rắc hành mùi.',
      tip: 'Ninh mở hé vung và hớt bọt thường xuyên để nước canh trong veo.',
      chef: 'Bí quyết đầu bếp: Chần sườn qua nước sôi có đập dập 1 củ hành tím trước khi ninh, nước canh sẽ trong vắt không một gợn đục, vị chua thanh của sấu Hà Nội hòa quyện ngọt sâu.',
      tags: ['Món Canh', 'Sườn Nấu Sấu', 'Hà Nội', 'Mùa Hè'],
      baseCost: 42000,
      baseCal: 260,
      reg: 'bac'
    },
    {
      suffix: 'Hầm Củ Sen & Hạt Sen Bùi Ngọt Bổ Dưỡng',
      desc: 'Món canh bổ dưỡng thanh tâm an thần: Củ sen giòn xốp ngọt mát hòa quyện hạt sen tươi bùi béo và nước hầm xương đậm đà.',
      method: 'Cho xương vào nồi cùng 1.5 lít nước đun sôi hớt bọt. Cho củ sen cắt lát và hạt sen tươi vào hầm nhỏ lửa trong 25 phút đến khi hạt sen bở tơi mềm mịn, nêm hạt nêm và rắc tiêu ngò rí.',
      tip: 'Ngâm củ sen vào nước chanh loãng ngay sau khi thái để củ sen giữ màu trắng muốt.',
      chef: 'Bí quyết đầu bếp: Bỏ tâm sen trước khi hầm để canh không bị đắng, ngâm củ sen đã thái vào nước pha chút nước cốt chanh để giữ màu trắng ngà đẹp mắt và độ giòn bùi tự nhiên.',
      tags: ['Món Canh', 'Củ Sen', 'Hạt Sen', 'Bổ Dưỡng'],
      baseCost: 45000,
      baseCal: 280,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Hầm Bí Đỏ Đậu Phộng Bùi Béo',
      desc: 'Canh bí đỏ ngọt ngào sánh mịn: Bí đỏ chín dẻo bở tơi kết hợp đậu phộng giã dập bùi ngậy và nước sườn ngọt lịm.',
      method: 'Ninh xương 15 phút cho tiết nước ngọt. Cho đậu phộng ngâm mềm giã dập vào đun sôi 10 phút. Thả bí đỏ cắt miếng vuông vào hầm thêm 8 phút cho bí chín mềm bở, rắc ngò gai thái nhỏ rồi tắt bếp.',
      tip: 'Không nấu bí đỏ quá lâu tránh bị nát nhừ làm đục nước canh.',
      chef: 'Bí quyết đầu bếp: Đậu phộng ngâm nước ấm 20 phút rồi giã dập nấu cùng nước xương trước 10 phút cho tiết chất béo bùi, sau đó mới thả bí đỏ vào nấu chín tới để miếng bí giữ nguyên hình khối.',
      tags: ['Món Canh', 'Bí Đỏ', 'Đậu Phộng', 'Bổ Máu'],
      baseCost: 36000,
      baseCal: 250,
      reg: 'nam'
    },
    {
      suffix: 'Hầm Khoai Môn Bở Tơi Thơm Ngò Gai',
      desc: 'Vị bùi dẻo bở tơi của khoai môn sáp hòa quyện nước hầm xương béo ngậy thơm lừng mùi ngò gai rau ngổ Nam Bộ.',
      method: 'Ninh xương trong nước sôi 20 phút hớt bọt sạch. Thả khoai môn cắt miếng vừa ăn vào hầm lửa nhỏ trong 12 phút đến khi khoai bở tơi. Nêm nước mắm cá cơm, rắc ngò gai rau ngổ thái nhỏ tắt bếp.',
      tip: 'Đeo găng tay khi gọt khoai môn để không bị ngứa tay.',
      chef: 'Bí quyết đầu bếp: Khoai môn sau khi gọt vỏ cắt miếng phải để thật khô ráo mới thả vào nồi nước đang sôi bùng, khoai sẽ chín dẻo bùi bở mà không bị sượng hay nát nước.',
      tags: ['Món Canh', 'Khoai Môn', 'Bở Tơi', 'Cơm Nhà'],
      baseCost: 38000,
      baseCal: 270,
      reg: 'nam'
    },
    {
      suffix: 'Hầm Bắp Ngọt & Cà Rốt Thanh Mát',
      desc: 'Nước canh ngọt lịm tự nhiên từ bắp ngọt Mỹ và cà rốt tươi: Bổ sung chất xơ, vitamin và khoáng chất cho cả gia đình.',
      method: 'Cho xương và bắp ngọt cắt khúc vào nồi nước đun sôi hớt bọt, ninh lửa vừa 15 phút. Thả cà rốt tỉa hoa vào ninh thêm 10 phút đến khi củ quả chín mềm ngọt nước, nêm hạt nêm và rắc hành hoa.',
      tip: 'Ninh bắp ngọt từ đầu để nước canh có vị ngọt thanh tự nhiên không cần mì chính.',
      chef: 'Bí quyết đầu bếp: Cắt bắp ngọt thành từng khoanh tròn ninh cùng xương ngay từ lúc nước còn lạnh, vị ngọt thanh tự nhiên từ cùi bắp sẽ tiết trọn vẹn vào nước dùng ngọt lịm.',
      tags: ['Món Canh', 'Bắp Ngọt', 'Cà Rốt', 'Thanh Nhẹ'],
      baseCost: 35000,
      baseCal: 230,
      reg: 'toan-quoc'
    }
  ];

  for (let b = 0; b < boneBases.length; b++) {
    for (let s = 0; s < boneStyles.length; s++) {
      const base = boneBases[b];
      const style = boneStyles[s];
      recipes.push({
        title: `Canh ${base.name} ${style.suffix}`,
        desc: `${base.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (base.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.baseCal * (base.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Hầm Xương', 'Đậm Đà'],
        ingName: base.ing,
        secName: 'Củ quả tươi cắt khúc',
        secUnit: 'g',
        secAmount: 300
      });
    }
  }

  // Group C: Canh cua, hến & hải sản đồng quê (50)
  const fieldProteins = [
    { name: 'Cua đồng giã tay', ing: 'Cua đồng tươi giã tay lọc lấy nước cốt', cM: 1.15, calM: 0.9 },
    { name: 'Hến sông tươi', ing: 'Thịt hến tươi & nước luộc lắng trong', cM: 0.9, calM: 0.8 },
    { name: 'Ngao hoa ngọt lịm', ing: 'Ngao hoa biển tươi ngâm sạch', cM: 0.95, calM: 0.75 },
    { name: 'Trai đồng ngọt mát', ing: 'Thịt trai đồng bóp muối làm sạch', cM: 0.85, calM: 0.8 },
    { name: 'Trùng trục tươi sông', ing: 'Trùng trục sông luộc lấy thịt & nước', cM: 0.85, calM: 0.8 },
    { name: 'Tép đồng tươi giã dập', ing: 'Tép riu đồng tươi giã dập', cM: 0.9, calM: 0.85 },
    { name: 'Ốc nhồi đồng giòn sần sật', ing: 'Thịt ốc nhồi bóp giấm sạch nhớt', cM: 1.25, calM: 0.95 },
    { name: 'Cá rô đồng nướng gỡ thịt', ing: 'Thịt cá rô đồng nướng thơm gỡ xương', cM: 1.2, calM: 1.0 },
    { name: 'Tôm đồng bóc nõn giã', ing: 'Tôm đồng tươi bóc nõn giã dập', cM: 1.15, calM: 0.85 },
    { name: 'Cua biển xé sợi tươi', ing: 'Thịt cua biển tươi hấp xé sợi', cM: 1.4, calM: 0.9 }
  ];

  const fieldStyles = [
    {
      suffix: 'Nấu Rau Đay Mồng Tơi & Mướp Hương',
      desc: 'Bát canh mùa hè Bắc Bộ chuẩn vị: Gạch cua đóng bánh vàng óng béo ngậy, rau đay mồng tơi trơn mát mướp hương thơm lừng.',
      method: 'Khuấy đều nước cua với chút muối, đun lửa vừa cho thịt cua nổi bánh dày. Gạt nhẹ bánh cua sang một bên, thả mướp hương và rau đay mồng tơi vào nấu sôi bùng 2 phút rồi tắt bếp.',
      tip: 'Đun lửa vừa và không khuấy mạnh tay khi nước cua bắt đầu sôi để gạch cua kết mảng dày.',
      chef: 'Bí quyết đầu bếp: Thêm 1 nhúm muối hạt nhỏ vào nước lọc cua trước khi bắc lên bếp, đun lửa vừa để thịt cua kết lại thành từng tảng riêu vàng ươm béo ngậy không bị vỡ nát.',
      tags: ['Món Canh', 'Canh Cua', 'Mồng Tơi', 'Đồng Quê'],
      baseCost: 36000,
      baseCal: 170,
      reg: 'bac'
    },
    {
      suffix: 'Nấu Bầu Non Gừng Tươi Thanh Khiết',
      desc: 'Vị ngọt thanh dịu mát lành: Ruột bầu non ngọt mát hòa cùng vị thơm bùi đậm đà của hải sản đồng quê ấm nồng gừng tươi.',
      method: 'Xào thơm hành khô với nguyên liệu chính. Đổ nước luộc đã lắng trong vào đun sôi bùng. Thả bầu băm sợi hoặc thái lát mỏng vào đun sôi 2 phút cho bầu chín tới trong veo, rắc hành hoa gừng sợi.',
      tip: 'Không nấu bầu quá chín nhừ để giữ độ giòn ngọt mọng nước tự nhiên.',
      chef: 'Bí quyết đầu bếp: Bầu non để cả vỏ băm sợi mỏng nấu vừa chín tới trong veo, thêm vài lát gừng già đập dập giúp cân bằng tính hàn của thủy sản đồng quê thơm nức mũi.',
      tags: ['Món Canh', 'Canh Bầu', 'Thanh Mát', 'Dễ Nấu'],
      baseCost: 32000,
      baseCal: 150,
      reg: 'trung'
    },
    {
      suffix: 'Nấu Riêu Cà Chua Dấm Bỗng Chua Dịu',
      desc: 'Bát canh riêu cua đồng phố cổ: Màu đỏ au của cà chua, gạch cua vàng béo ngậy, vị chua thanh dịu ngọt êm của dấm bỗng nếp.',
      method: 'Nấu nước cua đóng bánh vớt riêu ra bát. Phi hành khô xào cà chua cho ra màu đỏ óng, trút vào nồi canh cùng 2 muỗng dấm bỗng nếp. Nêm vừa ăn, thả lại bánh cua lên mặt, rắc hành hoa mùi tàu.',
      tip: 'Dùng dấm bỗng nếp lên men tự nhiên để có vị chua thanh dịu ngọt hậu.',
      chef: 'Bí quyết đầu bếp: Dùng dấm bỗng nếp thơm chua dịu thay cho me hay sấu, chưng gạch cua với chút mỡ gà tạo màu vàng óng ả rưới lên mặt bát canh riêu thơm nồng nàn.',
      tags: ['Món Canh', 'Canh Riêu', 'Dấm Bỗng', 'Hà Nội'],
      baseCost: 38000,
      baseCal: 190,
      reg: 'bac'
    },
    {
      suffix: 'Nấu Rau Ngót Bồ Ngót Ngọt Đậm Sâu',
      desc: 'Nước canh ngọt lịm từ tinh hoa đồng nội: Rau ngót vò dập nấu cùng thịt thủy sản ngọt đậm đà bổ dưỡng mát gan.',
      method: 'Xào thơm nguyên liệu với hành tím. Đổ 1.2 lít nước vào đun sôi bùng. Thả rau ngót đã vò mềm vào nấu sôi trong 3 phút cho rau chín mềm xanh mướt, nêm chút nước mắm cốt trước khi tắt bếp.',
      tip: 'Vò kỹ lá rau ngót trước khi nấu để rau mềm ngọt và ngấm trọn nước dùng.',
      chef: 'Bí quyết đầu bếp: Rau ngót tuốt lá bánh tẻ dùng hai tay vò dập nhẹ rồi rửa sạch, xào sơ nguyên liệu trước khi châm nước nấu giúp bát canh ngọt sâu lắng đọng vị quê nhà.',
      tags: ['Món Canh', 'Rau Ngót', 'Ngọt Đậm', 'Bổ Dưỡng'],
      baseCost: 34000,
      baseCal: 160,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nấu Chua Khế Ngọt Thì Là Hành Hoa',
      desc: 'Món canh chua mộc mạc làng quê: Quả khế chua ngọt thái hình ngôi sao thanh mát nấu cùng thủy sản đồng quê thì là thơm ngát.',
      method: 'Xào chín tới nguyên liệu với chút dầu và cà chua. Đổ nước sôi vào, cho khế thái lát hình sao vào đun sôi 3 phút cho tiết vị chua ngọt thanh. Nêm nước mắm cốt, rắc nhiều thì là hành hoa rồi tắt bếp.',
      tip: 'Khế chọn quả chín tới rìa vàng để có vị chua ngọt thanh tao nhất.',
      chef: 'Bí quyết đầu bếp: Cắt bỏ diềm cạnh của quả khế trước khi thái lát hình ngôi sao để canh không bị chát, nấu cùng thì là và ớt hiểm tạo nên hương vị chua cay ấm nồng đậm chất đồng quê.',
      tags: ['Món Canh', 'Khế Chua', 'Thì Là', 'Dân Dã'],
      baseCost: 33000,
      baseCal: 155,
      reg: 'bac'
    }
  ];

  for (let f = 0; f < fieldProteins.length; f++) {
    for (let s = 0; s < fieldStyles.length; s++) {
      const prot = fieldProteins[f];
      const style = fieldStyles[s];
      recipes.push({
        title: `Canh ${prot.name} ${style.suffix}`,
        desc: `${prot.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (prot.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.baseCal * (prot.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Đồng Quê', 'Thanh Mát'],
        ingName: prot.ing,
        secName: 'Rau xanh đồng nội (mồng tơi, bầu hoặc rau ngót)',
        secUnit: 'g',
        secAmount: 300
      });
    }
  }

  // Group D: Canh thanh mát thịt băm & tôm tươi (50)
  const vegBases = [
    { name: 'Rau ngót ta non', ing: 'Rau ngót ta non tuốt lá vò mềm', cM: 0.9, calM: 0.85 },
    { name: 'Cải cúc xanh non', ing: 'Rau cải cúc non ngắt khúc rửa sạch', cM: 0.95, calM: 0.8 },
    { name: 'Bí xanh tươi ngọt', ing: 'Bí xanh non gọt vỏ thái lát mỏng', cM: 0.85, calM: 0.75 },
    { name: 'Mướp hương non', ing: 'Mướp hương tươi gọt vỏ thái vát', cM: 0.9, calM: 0.8 },
    { name: 'Cải ngọt giòn ngọt', ing: 'Cải ngọt tươi cắt khúc 3cm', cM: 0.85, calM: 0.85 },
    { name: 'Khổ qua bào mỏng', ing: 'Mướp đắng non móc ruột bào mỏng', cM: 0.95, calM: 0.8 },
    { name: 'Rau dền đỏ mát gan', ing: 'Rau dền đỏ nhặt ngọn non rửa sạch', cM: 0.85, calM: 0.8 },
    { name: 'Khoai mỡ tím sánh mịn', ing: 'Khoai mỡ tím nạo nhuyễn bằng muỗng', cM: 1.05, calM: 1.1 },
    { name: 'Rong biển đậu hũ non', ing: 'Rong biển khô ngâm nở & đậu hũ non', cM: 1.15, calM: 0.9 },
    { name: 'Xà lách xoong Đà Lạt', ing: 'Xà lách xoong nhặt cọng non rửa sạch', cM: 1.0, calM: 0.85 }
  ];

  const meatStyles = [
    {
      suffix: 'Nấu Thịt Nạc Thăn Băm Nhuyễn',
      desc: 'Món canh mộc mạc thơm lành: Thịt nạc thăn băm nhuyễn xào thơm ngọt nước, hòa cùng rau củ thanh mát.',
      method: 'Phi thơm đầu hành, cho thịt nạc thăn băm vào xào săn thơm. Châm 1.2 lít nước sôi, thả rau củ vào đun sôi trong 3 phút đến khi rau chín tới xanh mướt, nêm chút hạt nêm và rắc tiêu xay.',
      tip: 'Xào săn thịt băm trước khi đổ nước giúp nước canh thơm ngọt và không bị đục.',
      chef: 'Bí quyết đầu bếp: Ướp thịt băm với chút đầu hành trắng và nước mắm cốt 5 phút trước khi xào, nước canh sẽ có vị ngọt đậm đà lan tỏa khắp gian bếp.',
      tags: ['Món Canh', 'Thịt Băm', 'Thanh Mát', 'Gia Đình'],
      baseCost: 32000,
      baseCal: 160,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nấu Tôm Tươi Giã Dập Ngọt Lịm',
      desc: 'Vị ngọt thanh khiết tự nhiên của tôm tươi biển giã dập kết hợp rau củ xanh non mát lành giải nhiệt.',
      method: 'Tôm bóc nõn giã dập cùng đầu hành trắng, xào sơ với chút dầu ăn cho tôm chuyển màu đỏ au. Đổ nước sôi vào đun bùng, thả rau củ vào đun 2 phút cho chín tới, nêm vừa ăn rồi tắt bếp.',
      tip: 'Giã dập tôm thay vì băm nhuyễn để tôm tiết trọn vẹn nước ngọt tự nhiên.',
      chef: 'Bí quyết đầu bếp: Giã tôm tươi cùng 1 nhánh đầu hành trắng và hạt tiêu sọ trước khi xào, vị ngọt tự nhiên của tôm sẽ hòa quyện vào nước canh ngọt đậm đà không cần dùng mì chính.',
      tags: ['Món Canh', 'Tôm Tươi', 'Ngọt Thanh', 'Bổ Dưỡng'],
      baseCost: 38000,
      baseCal: 150,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nấu Thịt Nạc Dăm Vo Viên Tiêu Đen',
      desc: 'Từng viên thịt tròn xinh đậm đà tiêu sọ thơm nức, nấu cùng rau củ tươi non thanh nhẹ đưa cơm.',
      method: 'Đun sôi 1.2 lít nước dùng. Dùng muỗng vo tròn từng viên thịt nạc dăm thả vào nồi nước đang sôi. Khi thịt viên nổi lên mặt nước chín tới, thả rau củ vào đun sôi 3 phút rồi tắt bếp rắc hành mùi.',
      tip: 'Thả viên thịt khi nước đang sôi sùng sục để viên thịt kết dính không bị vỡ.',
      chef: 'Bí quyết đầu bếp: Quết thịt băm với chút lòng trắng trứng gà và tiêu xay cho dẻo quánh trước khi vo viên, viên thịt khi nấu sẽ dai giòn ngọt bùi không bao giờ bị bở nát.',
      tags: ['Món Canh', 'Mọc Thịt', 'Tiêu Đen', 'Thanh Khiết'],
      baseCost: 35000,
      baseCal: 180,
      reg: 'bac'
    },
    {
      suffix: 'Nấu Thịt Gà Ta Xé Sợi Nấm Hương',
      desc: 'Nước canh ngọt thanh tao từ ức gà ta xé sợi và nấm hương thơm lừng, bổ dưỡng thanh nhẹ cho cơ thể.',
      method: 'Xào thơm thịt gà xé và nấm hương với chút dầu hào. Châm nước dùng gà đun sôi bùng, thả rau củ vào đun sôi trong 2.5 phút cho chín giòn, nêm gia vị vừa miệng và rắc hành hoa tiêu xay.',
      tip: 'Dùng nước luộc gà nấu canh giúp nước canh có màu vàng óng và vị ngọt sâu.',
      chef: 'Bí quyết đầu bếp: Luộc ức gà chín tới rồi xé sợi theo thớ thịt, phi thơm hành khô xào gà với chút nấm hương trước khi nấu tạo nên vị ngọt thanh tao quý phái.',
      tags: ['Món Canh', 'Gà Xé', 'Nấm Hương', 'Bổ Dưỡng'],
      baseCost: 39000,
      baseCal: 175,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nấu Tôm Khô Ngâm Mềm Giã Bùi',
      desc: 'Món canh dân dã đậm vị Nam Bộ: Tôm khô Cà Mau ngâm mềm giã dập nấu nước ngọt lịm thơm bùi khó quên.',
      method: 'Tôm khô ngâm nước ấm 15 phút, giã dập nhẹ rồi xào thơm với hành tím. Đổ 1.2 lít nước vào đun sôi nhỏ lửa 8 phút cho tôm tiết trọn vị ngọt. Thả rau củ vào nấu chín tới trong 2 phút rồi tắt bếp.',
      tip: 'Ngâm tôm khô trong nước ấm và tận dụng cả nước ngâm tôm để nấu canh.',
      chef: 'Bí quyết đầu bếp: Giã tôm khô trong cối đá cùng vài lát hành tím rồi xào thơm với chút mỡ heo, nước canh nấu ra sẽ ngọt lịm tự nhiên thơm nức mùi biển Cà Mau.',
      tags: ['Món Canh', 'Tôm Khô', 'Nam Bộ', 'Đậm Đà'],
      baseCost: 36000,
      baseCal: 165,
      reg: 'nam'
    }
  ];

  for (let v = 0; v < vegBases.length; v++) {
    for (let m = 0; m < meatStyles.length; m++) {
      const veg = vegBases[v];
      const meat = meatStyles[m];
      recipes.push({
        title: `Canh ${veg.name} ${meat.suffix}`,
        desc: `${veg.name}: ${meat.desc}`,
        cost: Math.round((meat.baseCost * (veg.cM || 1)) / 1000) * 1000,
        cal: Math.round(meat.baseCal * (veg.calM || 1)),
        reg: meat.reg,
        method: meat.method,
        tip: meat.tip,
        chef: meat.chef,
        tags: [...meat.tags, 'Thanh Mát', 'Gia Đình'],
        ingName: veg.ing,
        secName: 'Thịt đạm hoặc tôm băm ướp gia vị',
        secUnit: 'g',
        secAmount: 180
      });
    }
  }

  // Format into 200 recipes: 100 in Part 1, 100 in Part 2
  return recipes.map((r, idx) => {
    const isP1 = idx < 100;
    const num = isP1 ? idx + 1 : idx - 100 + 1;
    const id = isP1 ? `vn-p1-canh-${String(num).padStart(3, '0')}` : `vn-p2-canh-${String(num).padStart(3, '0')}`;
    return createRecipe({
      id,
      title: r.title,
      description: r.desc,
      category: 'mon-canh',
      region: r.reg,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      calories: r.cal,
      estimatedCostVnd: r.cost,
      poolIndex: idx,
      ingredients: [
        { name: r.ingName, amount: 350, unit: 'g', category: 'rau-cu' },
        { name: r.secName, amount: r.secAmount, unit: r.secUnit, category: 'thit-ca' },
        { name: 'Hành hoa & Ngò rí thái nhỏ', amount: 3, unit: 'nhánh', category: 'rau-cu' },
        { name: 'Nước mắm cá cơm truyền thống', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Muối hạt tinh khiết', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
        { name: 'Hạt tiêu xay nhuyễn', amount: 0.5, unit: 'muỗng cà phê', category: 'gia-vi' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Làm sạch nguyên liệu',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Rửa sạch rau củ và nguyên liệu đạm dưới vòi nước chảy. Nhặt bỏ lá úa, gọt vỏ củ quả và cắt khúc vừa ăn. Ướp nhẹ nguyên liệu đạm với chút mắm tiêu.',
          tip: 'Để ráo nước rau củ trước khi nấu giúp canh không bị nồng mùi nước lã.'
        },
        {
          step: 2,
          title: 'Nấu nước dùng ngọt thanh',
          durationMinutes: 8,
          heatLevel: 'lửa lớn',
          content: 'Đun sôi 1.2 đến 1.5 lít nước dùng trên lửa lớn. Thả nguyên liệu đạm vào nấu chín tới, vớt sạch bọt nổi trên bề mặt để nước canh trong veo.',
          tip: 'Hớt bọt thường xuyên là bí quyết giữ nước canh trong vắt.'
        },
        {
          step: 3,
          title: 'Chế biến & Canh lửa chuẩn',
          durationMinutes: 6,
          heatLevel: 'lửa vừa',
          content: r.method,
          tip: r.tip
        },
        {
          step: 4,
          title: 'Hoàn thiện & Thưởng thức',
          durationMinutes: 2,
          heatLevel: 'không dùng nhiệt',
          content: 'Nêm nếm lại với chút nước mắm ngon cho vừa khẩu vị gia đình. Rắc hành hoa, ngò rí và tiêu xay rồi tắt bếp. Múc canh ra tô sứ lớn ăn nóng cùng cơm.',
          tip: 'Nêm nước mắm ở bước cuối cùng khi tắt bếp để canh dậy mùi thơm nức.'
        }
      ],
      tags: r.tags,
      chefTip: r.chef,
      difficulty: 'Dễ'
    });
  });
}

console.log('generateAllMonCanh defined.');
