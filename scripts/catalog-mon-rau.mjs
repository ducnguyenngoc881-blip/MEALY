import { POOLS, pickImg } from './recipe-pools.mjs';

function createRecipe({
  id,
  title,
  description,
  category = 'mon-rau',
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
  const imageUrl = pickImg('veggie', poolIndex);
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

export function generateAllMonRau() {
  const recipes = [];

  // Group A: Rau xào tỏi & lửa lớn (60 dishes)
  const xaoVeggies = [
    { name: 'Rau muống non', ing: 'Rau muống non ngắt ngọn rửa sạch', cM: 0.9, calM: 0.9 },
    { name: 'Rau lang tươi non', ing: 'Đọt rau khoai lang non xanh mướt', cM: 0.95, calM: 0.85 },
    { name: 'Đọt bí non tước xơ', ing: 'Đọt bí ngô non tước sạch xơ', cM: 1.15, calM: 0.9 },
    { name: 'Cải thìa non chẻ đôi', ing: 'Cải thìa tươi non chẻ dọc', cM: 1.0, calM: 0.8 },
    { name: 'Bắp cải non thái sợi', ing: 'Bắp cải tươi non thái sợi mỏng', cM: 0.85, calM: 0.95 },
    { name: 'Đậu cô ve non tước xơ', ing: 'Đậu cô ve tươi non tước xơ thái vát', cM: 1.05, calM: 0.9 },
    { name: 'Mướp hương non giá đỗ', ing: 'Mướp hương thái vát & giá đỗ sạch', cM: 0.9, calM: 0.85 },
    { name: 'Măng trúc tươi non', ing: 'Măng trúc tươi luộc kỹ thái lát', cM: 1.1, calM: 0.75 },
    { name: 'Đọt su su Tam Đảo', ing: 'Đọt su su non tước xơ xanh giòn', cM: 1.2, calM: 0.85 },
    { name: 'Bông cải xanh giòn', ing: 'Bông cải xanh cắt miếng vừa ăn', cM: 1.15, calM: 0.9 },
    { name: 'Hoa thiên lý tươi', ing: 'Hoa thiên lý tươi nhặt cuống', cM: 1.3, calM: 0.8 },
    { name: 'Ngó sen non giòn ngọt', ing: 'Ngó sen tươi chẻ đôi ngâm chanh', cM: 1.2, calM: 0.85 }
  ];

  const xaoStyles = [
    {
      suffix: 'Xào Tỏi Phi Lửa Lớn Giòn Ngọt',
      desc: 'Món rau xào quốc dân: Tỏi phi vàng ruộm thơm nức mũi, cọng rau xanh mướt giòn sần sật mọng nước đưa cơm.',
      method: 'Phi thơm vàng tỏi đập dập trên chảo dầu thật nóng. Trút rau vào đảo thật nhanh tay trên lửa cực lớn trong 3 phút cho rau vừa chín tới. Nêm chút nước mắm ngon và hạt nêm, rắc thêm tỏi phi giòn lên trên rồi tắt bếp.',
      tip: 'Xào trên lửa cực lớn và đảo liên tục để rau chín giòn mà không bị úa vàng hay chảy nước.',
      chef: 'Bí quyết đầu bếp: Đun chảo thật bốc khói với dầu ăn và phi thơm 2/3 lượng tỏi trước, xào rau trên lửa lớn trong đúng 2 phút rồi rắc 1/3 tỏi phi vàng còn lại lên trên để đĩa rau bóng bẩy thơm nức.',
      tags: ['Món Rau', 'Xào Tỏi', 'Giòn Ngọt', 'Cơm Nhà'],
      baseCost: 26000,
      baseCal: 120,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Xào Sốt Dầu Hào Nấm Hương Thơm Bùi',
      desc: 'Rau xanh giòn mọng nước quyện trong lớp sốt dầu hào bóng bẩy thơm lừng, điểm xuyết nấm hương bùi béo.',
      method: 'Xào thơm nấm hương với hành tỏi băm. Cho rau vào xào lửa lớn trong 3 phút. Hòa tan dầu hào thượng hạng với chút nước và tiêu, rưới đều lên rau đảo nhanh tay 30 giây cho sốt bám đều quanh cọng rau.',
      tip: 'Hòa dầu hào với chút nước trước khi rưới để sốt ngấm đều mà không bị vón cục.',
      chef: 'Bí quyết đầu bếp: Hòa 1 muỗng canh dầu hào cùng 1 muỗng nước dùng và 1/2 muỗng dầu mè thơm, rưới quanh thành chảo nóng ở phút cuối để tạo hiệu ứng sốt nâu bóng bẩy hấp dẫn.',
      tags: ['Món Rau', 'Dầu Hào', 'Nấm Hương', 'Thanh Nhẹ'],
      baseCost: 29000,
      baseCal: 135,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Xào Mỡ Hành Ớt Sừng The Cay',
      desc: 'Hương vị Nam Bộ dân dã: Mỡ hành thơm béo ngậy điểm xuyết vài lát ớt sừng the cay giòn ngọt kích thích vị giác.',
      method: 'Đun nóng mỡ heo với đầu hành trắng cho dậy mùi thơm. Trút rau và ớt sừng thái sợi vào đảo nhanh trên lửa lớn trong 3 phút. Nêm nước mắm cốt và chút tiêu xay, tắt bếp trút ra đĩa sâu lòng.',
      tip: 'Dùng mỡ heo xào giúp cọng rau có độ bóng mượt và hương vị thơm bùi đặc trưng.',
      chef: 'Bí quyết đầu bếp: Dùng mỡ heo thắng giòn thay cho dầu ăn thực vật khi xào rau, mỡ heo giúp rau giữ trọn sắc xanh bóng bẩy và tạo độ bùi béo ngọt thanh tuyệt đỉnh.',
      tags: ['Món Rau', 'Mỡ Hành', 'Ớt Sừng', 'Nam Bộ'],
      baseCost: 27000,
      baseCal: 140,
      reg: 'nam'
    },
    {
      suffix: 'Xào Tỏi Tiêu Sọ Ấm Nồng Đất Bắc',
      desc: 'Món xào thanh đạm mùa đông đất Bắc: Tiêu sọ xay thơm nồng ấm áp kết hợp rau xanh giòn ngọt tự nhiên.',
      method: 'Phi thơm tỏi tép đập dập, trút rau vào đảo đều trên lửa lớn trong 3 phút. Rưới chút nước sôi nếu chảo quá khô, nêm muối hạt và rắc lượng lớn tiêu sọ xay vỡ đảo đều 20 giây rồi trút ra đĩa.',
      tip: 'Tiêu sọ xay vỡ thơm nồng mà không bị cay gắt như tiêu bột.',
      chef: 'Bí quyết đầu bếp: Dùng hạt tiêu sọ trắng giã vỡ hạt rang thơm rắc lên rau xào ngay khi vừa tắt bếp, nhiệt độ chảo nóng sẽ bung tỏa hương thơm cay ấm dịu dàng quyến rũ.',
      tags: ['Món Rau', 'Tiêu Sọ', 'Bắc Bộ', 'Ấm Bụng'],
      baseCost: 28000,
      baseCal: 125,
      reg: 'bac'
    },
    {
      suffix: 'Xào Tỏi Ớt Hiểm Xứ Quảng Cay Giòn',
      desc: 'Vị the cay bùng nổ của ớt xiêm xanh đập dập hòa quyện cọng rau giòn sần sật mọng nước đậm vị miền Trung.',
      method: 'Phi thơm củ nén và ớt hiểm đập dập với dầu lạc. Cho rau vào xào thật nhanh tay trên lửa lớn trong 2.5 phút. Nêm nước mắm cá cơm truyền thống, đảo thêm 20 giây rồi múc ra đĩa ăn nóng.',
      tip: 'Ớt hiểm đập dập vừa phải để tinh dầu ớt tiết ra thơm cay mà không nát.',
      chef: 'Bí quyết đầu bếp: Phi củ nén (hành tăm) thơm lừng cùng vài quả ớt xiêm xanh trước khi cho rau vào chảo lửa to, hương vị cay the nồng nàn đặc trưng xứ Quảng sẽ ngấm sâu vào từng ngọn rau.',
      tags: ['Món Rau', 'Ớt Hiểm', 'Xứ Quảng', 'Cay Giòn'],
      baseCost: 28000,
      baseCal: 130,
      reg: 'trung'
    }
  ];

  for (let v = 0; v < xaoVeggies.length; v++) {
    for (let s = 0; s < xaoStyles.length; s++) {
      const veg = xaoVeggies[v];
      const style = xaoStyles[s];
      recipes.push({
        title: `${veg.name} ${style.suffix}`,
        desc: `${veg.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (veg.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.baseCal * (veg.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Rau Xào', 'Thanh Nhẹ'],
        ingName: veg.ing,
        ingAmount: 500,
        ingUnit: 'g'
      });
    }
  }

  // Group B: Rau luộc chấm kho quẹt / chao / mắm tôm (50 dishes)
  const luocVeggies = [
    { name: 'Rau củ thập cẩm thanh ngọt', ing: 'Cà rốt, su su, bông cải & đậu bắp', cM: 1.1, calM: 0.9 },
    { name: 'Bông cải xanh trắng non', ing: 'Bông cải xanh & bông cải trắng tươi non', cM: 1.15, calM: 0.85 },
    { name: 'Bầu non thái khúc dày', ing: 'Bầu sao non gọt vỏ thái khúc 4cm', cM: 0.85, calM: 0.8 },
    { name: 'Mướp hương non ngọt mát', ing: 'Mướp hương tươi gọt vỏ thái vát dày', cM: 0.9, calM: 0.8 },
    { name: 'Rau rừng Tây Ninh tươi non', ing: 'Rau nhái, lá cóc, đọt xoài non & quế vị', cM: 1.25, calM: 0.95 },
    { name: 'Bắp cải non ngọt mát', ing: 'Bắp cải non bổ múi cau luộc giòn', cM: 0.85, calM: 0.85 },
    { name: 'Củ cải trắng luộc thanh mát', ing: 'Củ cải trắng gọt vỏ cắt con chì', cM: 0.85, calM: 0.8 },
    { name: 'Su hào giòn ngọt thái khúc', ing: 'Su hào bánh tẻ gọt vỏ thái con chì', cM: 0.9, calM: 0.85 },
    { name: 'Đậu bắp non giòn nhớt', ing: 'Đậu bắp non ngắt cuống rửa sạch', cM: 0.95, calM: 0.8 },
    { name: 'Cải ngọt non luộc xanh mướt', ing: 'Cải ngọt tươi non cắt khúc dài', cM: 0.85, calM: 0.85 }
  ];

  const luocDips = [
    {
      suffix: 'Chấm Kho Quẹt Tôm Thịt Tóp Mỡ',
      desc: 'Món ăn Nam Bộ gây nghiện: Đĩa rau luộc xanh mướt giòn ngọt chấm ngập nồi kho quẹt kẹo dẻo tóp mỡ tôm khô thơm nức mũi.',
      method: 'Đun sôi nước với muối hạt, thả rau củ vào luộc lửa lớn trong 3-4 phút vừa chín tới, vớt ngay ra đĩa ráo nước. Chấm cùng nồi kho quẹt nấu từ mắm cốt, đường thốt nốt, tôm khô và tóp mỡ giòn.',
      tip: 'Cho chút muối hạt vào nước luộc đang sôi bùng để rau củ giữ nguyên màu xanh tươi rói.',
      chef: 'Bí quyết đầu bếp: Vớt rau luộc ra nhúng ngay vào thau nước đá lạnh 30 giây rồi vớt ráo, đĩa rau củ sẽ giữ trọn sắc xanh bóng bẩy và độ giòn ngọt mọng nước sần sật suốt cả bữa ăn.',
      tags: ['Món Rau', 'Rau Luộc', 'Kho Quẹt', 'Nam Bộ'],
      baseCost: 35000,
      baseCal: 180,
      reg: 'nam'
    },
    {
      suffix: 'Chấm Chao Đỏ Pha Tỏi Ớt Cay Nồng',
      desc: 'Hương vị chấm chao độc đáo: Rau củ luộc thanh ngọt chấm chén chao đỏ béo ngậy pha đường, tỏi ớt băm nhuyễn chua cay.',
      method: 'Luộc rau củ trong nước sôi có chút dầu ăn để cọng rau bóng bẩy. Dầm nhuyễn chao đỏ với đường thốt nốt, nước cốt tắc, tỏi ớt băm tạo nước chấm sánh mịn béo ngậy.',
      tip: 'Thêm nước cốt tắc vào chao giúp giảm vị mặn chát và tăng hương thơm thanh mát.',
      chef: 'Bí quyết đầu bếp: Tán nhuyễn chao đỏ với chút nước cốt tắc tươi và đường phèn xay mịn, nước chấm chao sẽ béo ngậy thơm nồng mà không bị gắt mặn.',
      tags: ['Món Rau', 'Rau Luộc', 'Chấm Chao', 'Thanh Tịnh'],
      baseCost: 26000,
      baseCal: 110,
      reg: 'nam'
    },
    {
      suffix: 'Chấm Trứng Gà Lòng Đào Dầm Nước Mắm',
      desc: 'Món chấm đồng nội Bắc Bộ thân thương: Rau luộc thanh mát chấm ngập chén nước mắm ngon dầm trứng gà ta lòng đào béo ngậy.',
      method: 'Luộc rau chín tới vớt ráo. Luộc trứng gà ta trong 5 phút để lòng đào dẻo quánh. Bóc vỏ trứng thả vào bát nước mắm cốt nhĩ Phú Quốc cùng vài lát ớt hiểm, dầm nhẹ cho lòng đỏ béo ngậy tan vào mắm.',
      tip: 'Canh chuẩn 5.5 phút luộc trứng gà để lòng đỏ dẻo quánh béo ngậy.',
      chef: 'Bí quyết đầu bếp: Trứng gà ta luộc đúng 5 phút 30 giây cho lòng đào dẻo quánh như thạch, dầm cùng nước mắm cá cơm nhĩ truyền thống và ớt chỉ thiên ăn kèm rau luộc ngon tuyệt đỉnh.',
      tags: ['Món Rau', 'Rau Luộc', 'Trứng Lòng Đào', 'Bắc Bộ'],
      baseCost: 28000,
      baseCal: 140,
      reg: 'bac'
    },
    {
      suffix: 'Chấm Muối Vừng Lạc Rang Thơm Bùi',
      desc: 'Món ăn dưỡng sinh mộc mạc: Vị ngọt thanh của rau củ tươi non chấm muối vừng mè lạc rang giã dập thơm lừng bùi béo.',
      method: 'Luộc chín tới rau củ trong nước sôi rồi vớt ra đĩa. Rang vàng thơm lạc nhân và vừng trắng, giã dập tay trong cối đá cùng chút muối hạt sấy khô tạo bát muối vừng thơm nức mũi.',
      tip: 'Giã dập hạt lạc thay vì xay mịn để khi ăn cảm nhận độ giòn bùi sần sật.',
      chef: 'Bí quyết đầu bếp: Rang riêng lạc và vừng trên lửa nhỏ đến khi nổ lách tách thơm lừng, giã tay thô để hạt lạc còn vỡ đôi vỡ ba, chấm rau củ luộc bùi béo ngọt lành thanh tịnh.',
      tags: ['Món Rau', 'Muối Vừng Lạc', 'Dưỡng Sinh', 'Mộc Mạc'],
      baseCost: 25000,
      baseCal: 130,
      reg: 'bac'
    },
    {
      suffix: 'Chấm Mắm Tôm Chanh Sủi Bọt Tỏi Ớt',
      desc: 'Hương vị Bắc Bộ đậm đà bùng nổ: Mắm tôm Hậu Lộc đánh bông sủi bọt cùng nước cốt chanh, ớt tươi chấm rau luộc thơm nức.',
      method: 'Luộc rau chín giòn vớt ra đĩa. Cho mắm tôm vào chén cùng đường, nước cốt chanh tươi, dùng đũa đánh thật mạnh tay đến khi mắm tôm sủi bọt trắng bông xốp, thả ớt thái lát và rưới chút dầu sôi.',
      tip: 'Đánh bông mắm tôm với chanh đường giúp khử hoàn toàn vị mặn gắt và dậy mùi thơm nức.',
      chef: 'Bí quyết đầu bếp: Đánh mắm tôm cùng nước cốt chanh tươi và rượu trắng đến khi sủi bọt trắng mịn như bông, rưới 1 muỗng mỡ nóng phi hành vào bát mắm tôm giúp mắm thơm lừng béo ngậy.',
      tags: ['Món Rau', 'Mắm Tôm Chanh', 'Đặc Sản', 'Bắc Bộ'],
      baseCost: 26000,
      baseCal: 105,
      reg: 'bac'
    }
  ];

  for (let l = 0; l < luocVeggies.length; l++) {
    for (let d = 0; d < luocDips.length; d++) {
      const veg = luocVeggies[l];
      const dip = luocDips[d];
      recipes.push({
        title: `${veg.name} ${dip.suffix}`,
        desc: `${veg.name}: ${dip.desc}`,
        cost: Math.round((dip.baseCost * (veg.cM || 1)) / 1000) * 1000,
        cal: Math.round(dip.baseCal * (veg.calM || 1)),
        reg: dip.reg,
        method: dip.method,
        tip: dip.tip,
        chef: dip.chef,
        tags: [...dip.tags, 'Rau Luộc', 'Đồng Quê'],
        ingName: veg.ing,
        ingAmount: 500,
        ingUnit: 'g'
      });
    }
  }

  // Group C: Nộm & Gỏi truyền thống (40 dishes)
  const goiBases = [
    { name: 'Nộm hoa chuối tây', ing: 'Hoa chuối tây thái mỏng ngâm nước chanh', cM: 1.0, calM: 0.9 },
    { name: 'Nộm ngó sen non', ing: 'Ngó sen tươi chẻ sợi trắng muốt', cM: 1.25, calM: 0.85 },
    { name: 'Nộm đu đủ xanh', ing: 'Đu đủ xanh bào sợi ngâm giòn sần sật', cM: 0.9, calM: 0.8 },
    { name: 'Gỏi dưa leo nếp', ing: 'Dưa leo nếp tươi thái lát mỏng bỏ ruột', cM: 0.85, calM: 0.8 },
    { name: 'Nộm xoài xanh chua giòn', ing: 'Xoài keo xanh bào sợi mỏng', cM: 1.05, calM: 0.85 },
    { name: 'Gỏi bắp chuối non', ing: 'Bắp chuối non thái chỉ ngâm nước muối', cM: 0.95, calM: 0.9 },
    { name: 'Gỏi củ hũ dừa Bến Tre', ing: 'Củ hũ dừa non thái sợi giòn ngọt', cM: 1.4, calM: 0.95 },
    { name: 'Gỏi bưởi da xanh tép mọng', ing: 'Tép bưởi da xanh tách múi mọng nước', cM: 1.35, calM: 0.85 },
    { name: 'Gỏi rau càng cua non', ing: 'Rau càng cua tươi non nhặt sạch', cM: 1.1, calM: 0.8 },
    { name: 'Nộm rau muống chẻ ngọn', ing: 'Ngọn rau muống chẻ sợi ngâm cong', cM: 0.9, calM: 0.8 }
  ];

  const goiStyles = [
    {
      suffix: 'Trộn Tai Heo Giòn Sần Sật Chua Ngọt',
      desc: 'Tai heo luộc giòn sần sật trộn cùng rau củ giòn tan, nước sốt chua ngọt đậm đà và lạc rang vàng bùi béo.',
      method: 'Tai heo luộc chín giòn thái lát mỏng. Pha nước sốt trộn nộm gồm nước mắm, đường, giấm gạo và tỏi ớt băm. Trộn đều tai heo và rau củ với sốt chua ngọt, rắc rau răm và lạc rang giã dập lên trên.',
      tip: 'Trộn nộm trước khi ăn 5 phút để rau không bị chảy nước làm mềm nhũn.',
      chef: 'Bí quyết đầu bếp: Tai heo sau khi luộc chín ngâm ngay vào âu nước đá lạnh có pha chút giấm gạo, tai heo sẽ trắng tinh giòn sần sật, trộn cùng nước sốt chua ngọt sánh kẹo cực kỳ bắt mắt.',
      tags: ['Món Rau', 'Nộm Tai Heo', 'Chua Ngọt', 'Khai Vị'],
      baseCost: 38000,
      baseCal: 210,
      reg: 'bac'
    },
    {
      suffix: 'Trộn Tôm Thịt Mắm Chua Cay Rau Răm',
      desc: 'Món gỏi tiệc truyền thống: Tôm sú đỏ au ngọt lịm, thịt ba chỉ luộc thái mỏng hòa cùng rau củ giòn mát nước mắm chua cay.',
      method: 'Tôm luộc bóc vỏ chẻ đôi, thịt ba chỉ thái lát mỏng. Trộn đều tôm thịt với rau củ và nước mắm chua ngọt pha tỏi ớt. Bày ra đĩa rắc rau răm, húng quế và hành phi giòn tan.',
      tip: 'Chẻ đôi con tôm theo chiều dọc để tôm ngấm đều nước sốt chua ngọt.',
      chef: 'Bí quyết đầu bếp: Pha nước mắm trộn gỏi theo tỉ lệ vàng 2 mắm : 2 đường : 1 nước cốt chanh : 1 giấm, khuấy tan đường rồi mới cho tỏi ớt băm để tỏi ớt nổi bồng bềnh đẹp mắt.',
      tags: ['Món Rau', 'Gỏi Tôm Thịt', 'Truyền Thống', 'Đặc Sắc'],
      baseCost: 45000,
      baseCal: 230,
      reg: 'nam'
    },
    {
      suffix: 'Trộn Bò Khô Lá Quế The Cay Phố Cổ',
      desc: 'Món nộm ăn vặt nức tiếng Hà Thành: Bò khô the cay đượm vị quế hồi hòa quyện rau củ giòn ngọt chua dịu mát lành.',
      method: 'Bào sợi nguyên liệu rau củ bóp nhẹ với muối vắt ráo. Xé sợi thịt bò khô. Rưới nước giấm đường ớt tỏi lên rau củ trộn đều, rắc bò khô xé sợi, kinh giới, lá quế và lạc rang giòn lên mặt.',
      tip: 'Bóp vắt kiệt nước rau củ trước khi trộn để nộm khô ráo giòn tan.',
      chef: 'Bí quyết đầu bếp: Thêm vài lá kinh giới và húng láng thái nhỏ trộn cùng thịt bò khô xé sợi, tinh dầu rau thơm Hà Nội sẽ quyện chặt cùng vị cay ấm của bò khô tạo hương vị phố cổ khó quên.',
      tags: ['Món Rau', 'Nộm Bò Khô', 'Hà Nội', 'Ăn Vặt'],
      baseCost: 36000,
      baseCal: 190,
      reg: 'bac'
    },
    {
      suffix: 'Trộn Tép Đồng & Hành Phi Thơm Lừng',
      desc: 'Món gỏi đồng quê mộc mạc: Tép đồng rang vàng thơm ngọt bùi trộn cùng rau củ thanh mát và hành phi giòn rụm.',
      method: 'Tép đồng rang săn với chút mắm đường cho vàng giòn. Trộn đều rau củ với nước cốt chanh tỏi ớt đường. Trút tép đồng lên trên đĩa nộm, rắc rau ngò gai và hành phi vàng ruộm thơm nức.',
      tip: 'Rang tép đồng thật săn giòn trước khi trộn để tép giữ nguyên độ bùi béo.',
      chef: 'Bí quyết đầu bếp: Rang tép riu đồng trên chảo khô đến khi vỏ tép đỏ au giòn rụm mới nêm chút nước mắm cốt, trộn nhẹ tay với rau củ để tép không bị nát mà thơm lừng đậm đà.',
      tags: ['Món Rau', 'Gỏi Tép Đồng', 'Mộc Mạc', 'Đồng Quê'],
      baseCost: 32000,
      baseCal: 170,
      reg: 'trung'
    }
  ];

  for (let g = 0; g < goiBases.length; g++) {
    for (let s = 0; s < goiStyles.length; s++) {
      const base = goiBases[g];
      const style = goiStyles[s];
      recipes.push({
        title: `${base.name} ${style.suffix}`,
        desc: `${base.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (base.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.baseCal * (base.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Nộm Gỏi', 'Chua Ngọt'],
        ingName: base.ing,
        ingAmount: 400,
        ingUnit: 'g'
      });
    }
  }

  // Group D: Dưa củ muối & muối xổi (30 dishes)
  const duaBases = [
    { name: 'Dưa cải sen muối chua', ing: 'Dưa cải sen tươi phơi héo cắt khúc', cM: 0.85, calM: 0.8 },
    { name: 'Sung nếp non muối giòn', ing: 'Sung nếp non bổ đôi ngâm nước chanh', cM: 0.9, calM: 0.85 },
    { name: 'Cà pháo tươi muối giòn tan', ing: 'Cà pháo tươi gọt cuống khía chữ thập', cM: 0.9, calM: 0.8 },
    { name: 'Dưa giá đỗ hẹ tươi', ing: 'Giá đỗ sạch, hẹ lá & cà rốt thái sợi', cM: 0.8, calM: 0.75 },
    { name: 'Củ kiệu Huế giòn rụm', ing: 'Củ kiệu Huế làm sạch ngâm tro', cM: 1.25, calM: 0.9 },
    { name: 'Bắp cải muối xổi rau răm', ing: 'Bắp cải non thái sợi & rau răm thơm', cM: 0.85, calM: 0.8 },
    { name: 'Dưa chuột muối xổi tỏi ớt', ing: 'Dưa chuột nếp thái lát dày 0.5cm', cM: 0.8, calM: 0.75 },
    { name: 'Ngó sen ngâm chua ngọt', ing: 'Ngó sen non cắt khúc chẻ sợi', cM: 1.2, calM: 0.85 },
    { name: 'Củ cải ngâm mắm đường', ing: 'Củ cải trắng phơi héo thái con chì', cM: 0.85, calM: 0.85 },
    { name: 'Xoài non ngâm chua ngọt cay', ing: 'Xoài non thái lát vừa ăn', cM: 0.95, calM: 0.9 }
  ];

  const duaStyles = [
    {
      suffix: 'Chua Giòn Truyền Thống Tỏi Ớt',
      desc: 'Món muối truyền thống lên men tự nhiên giòn rụm màu vàng óng, vị chua thanh the nồng cay dịu chống ngấy hoàn hảo.',
      method: 'Đun sôi nước muối hạt đường để nguội hoàn toàn. Xếp nguyên liệu cùng tỏi tép và ớt tươi vào hũ sành sạch. Đổ nước muối ngập mặt nén chặt bằng nan tre, để nơi thoáng mát 2 ngày cho lên men chua giòn.',
      tip: 'Nước muối phải để nguội hoàn toàn trước khi muối để dưa không bị úng mềm.',
      chef: 'Bí quyết đầu bếp: Dùng nước đun sôi để nguội pha cùng chút nước mía hoặc đường mía vàng, nén chặt dưới nan tre để nguyên liệu chìm hoàn toàn trong nước giúp dưa muối vàng óng giòn rụm.',
      tags: ['Món Rau', 'Muối Chua', 'Truyền Thống', 'Đưa Cơm'],
      baseCost: 20000,
      baseCal: 60,
      reg: 'bac'
    },
    {
      suffix: 'Muối Xổi Chua Cay Ăn Liền Thơm Nức',
      desc: 'Món muối xổi nhanh gọn giòn tan: Ngấm đượm sốt giấm đường tỏi ớt riềng thơm nức mũi, có thể thưởng thức sau 30 phút.',
      method: 'Nguyên liệu bóp muối hạt vắt nhẹ cho ra bớt nước chát. Trộn đều với hỗn hợp giấm gạo, đường cát, nước mắm ngon, tỏi ớt băm và riềng sợi. Để ngấm trong 30 phút là có thể bày đĩa thưởng thức.',
      tip: 'Bóp muối trước khi trộn giúp nguyên liệu giòn tan và loại bỏ hoàn toàn vị chát hăng.',
      chef: 'Bí quyết đầu bếp: Bóp nguyên liệu với muối hạt trong 5 phút rồi rửa sạch vắt ráo kiệt nước, trộn cùng giấm gạo thanh và đường thốt nốt giúp món muối xổi giòn tan rụm rụm tức thì.',
      tags: ['Món Rau', 'Muối Xổi', 'Ăn Liền', 'Chua Cay'],
      baseCost: 22000,
      baseCal: 70,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Ngâm Chua Ngọt Thảo Mộc Giòn Tan',
      desc: 'Nước ngâm giấm đường thơm thanh thảo mộc: Từng miếng củ quả giòn sần sật mọng nước chua ngọt hài hòa thanh khiết.',
      method: 'Nấu sôi giấm gạo cùng đường phèn và chút muối cho tan hết, để thật nguội. Cho nguyên liệu cùng tỏi lát, ớt đỏ và hoa hồi vào hũ thủy tinh, trút nước giấm đường ngập mặt bảo quản trong ngăn mát tủ lạnh.',
      tip: 'Bảo quản trong ngăn mát tủ lạnh giúp dưa giòn ngon suốt cả tuần.',
      chef: 'Bí quyết đầu bếp: Dùng đường phèn nấu cùng giấm gạo thanh giúp nước ngâm chua ngọt trong vắt thanh tao, bảo quản trong hũ thủy tinh đậy kín ngăn mát tủ lạnh giúp giữ độ giòn tan suốt tuần.',
      tags: ['Món Rau', 'Ngâm Chua Ngọt', 'Giòn Tan', 'Chống Ngấy'],
      baseCost: 24000,
      baseCal: 75,
      reg: 'nam'
    }
  ];

  for (let d = 0; d < duaBases.length; d++) {
    for (let s = 0; s < duaStyles.length; s++) {
      const base = duaBases[d];
      const style = duaStyles[s];
      recipes.push({
        title: `${base.name} ${style.suffix}`,
        desc: `${base.name}: ${style.desc}`,
        cost: Math.round((style.baseCost * (base.cM || 1)) / 1000) * 1000,
        cal: Math.round(style.calM * (base.calM || 1)),
        reg: style.reg,
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Dưa Muối', 'Chống Ngấy'],
        ingName: base.ing,
        ingAmount: 400,
        ingUnit: 'g'
      });
    }
  }

  // Format into 180 recipes: 90 in Part 1, 90 in Part 2
  return recipes.map((r, idx) => {
    const isP1 = idx < 90;
    const num = isP1 ? idx + 1 : idx - 90 + 1;
    const id = isP1 ? `vn-p1-rau-${String(num).padStart(3, '0')}` : `vn-p2-rau-${String(num).padStart(3, '0')}`;
    return createRecipe({
      id,
      title: r.title,
      description: r.desc,
      category: 'mon-rau',
      region: r.reg,
      prepTimeMinutes: 10,
      cookTimeMinutes: 8,
      calories: r.cal,
      estimatedCostVnd: r.cost,
      poolIndex: idx,
      ingredients: [
        { name: r.ingName, amount: r.ingAmount, unit: r.ingUnit, category: 'rau-cu' },
        { name: 'Tỏi khô băm nhuyễn', amount: 2, unit: 'củ', category: 'rau-cu' },
        { name: 'Nước mắm truyền thống', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Dầu ăn thực vật', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Ớt sừng đỏ tươi', amount: 2, unit: 'trái', category: 'rau-cu' },
        { name: 'Hạt tiêu đen xay', amount: 0.5, unit: 'muỗng cà phê', category: 'gia-vi' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Làm sạch rau củ',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Nhặt sạch rau củ, loại bỏ phần cuống già và xơ cứng. Ngâm nước muối loãng 5 phút rồi rửa lại với nước lạnh, để thật ráo nước.',
          tip: 'Để rau thật ráo nước trước khi chế biến giúp rau giữ trọn độ giòn ngọt.'
        },
        {
          step: 2,
          title: 'Chuẩn bị gia vị & Tỏi ớt',
          durationMinutes: 3,
          heatLevel: 'không dùng nhiệt',
          content: 'Tỏi bóc vỏ đập dập băm nhỏ. Ớt tươi thái lát vát. Pha sẵn hỗn hợp gia vị gồm nước mắm, đường, tiêu theo khẩu vị gia đình.',
          tip: 'Đập dập tỏi giúp tinh dầu tỏi bung tỏa mùi thơm nồng nàn hơn băm nhuyễn.'
        },
        {
          step: 3,
          title: 'Chế biến & Canh lửa chuẩn',
          durationMinutes: 5,
          heatLevel: 'lửa lớn',
          content: r.method,
          tip: r.tip
        },
        {
          step: 4,
          title: 'Hoàn thiện & Bày đĩa thưởng thức',
          durationMinutes: 2,
          heatLevel: 'không dùng nhiệt',
          content: 'Bày món rau ra đĩa sứ trắng, rắc thêm tỏi phi hoặc tiêu xay lên mặt. Thưởng thức ngay khi món ăn còn nóng hổi giòn ngọt.',
          tip: 'Dùng đĩa sứ trắng làm nổi bật màu xanh ngọc bích tươi rói của rau củ.'
        }
      ],
      tags: r.tags,
      chefTip: r.chef,
      difficulty: 'Dễ'
    });
  });
}

console.log('generateAllMonRau defined.');
