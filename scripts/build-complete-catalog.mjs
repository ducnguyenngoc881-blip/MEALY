import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { POOLS, pickImg, rootDir } from './recipe-pools.mjs';

function createRecipe({
  id,
  title,
  description,
  category,
  region,
  prepTimeMinutes,
  cookTimeMinutes,
  servings = 4,
  calories,
  estimatedCostVnd,
  pool,
  poolIndex,
  ingredients,
  instructions,
  tags,
  chefTip,
  difficulty = 'Dễ'
}) {
  const imageUrl = pickImg(pool, poolIndex);
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

// ----------------------------------------------------------------------------
// 1. MÓN MẶN (350 TOTAL: 200 IN PART 1, 150 IN PART 2)
// ----------------------------------------------------------------------------
export function generateAllMonMan() {
  const recipes = [];

  // PORK (110)
  const porkCuts = [
    { name: 'Thịt ba chỉ rút sườn', ingName: 'Thịt ba chỉ rút sườn tươi', pM: 1.1, cM: 1.2 },
    { name: 'Sườn non heo', ingName: 'Sườn non heo chặt khúc', pM: 1.2, cM: 1.0 },
    { name: 'Thịt nạc dăm heo', ingName: 'Thịt nạc dăm thái lát', pM: 0.95, cM: 0.9 },
    { name: 'Thịt chân giò heo', ingName: 'Thịt chân giò rút xương', pM: 1.0, cM: 1.1 },
    { name: 'Tai heo giòn sần sật', ingName: 'Tai heo tươi làm sạch cạo trắng', pM: 0.85, cM: 0.8 },
    { name: 'Cốt lết heo mềm mọng', ingName: 'Cốt lết heo có xương', pM: 1.0, cM: 0.95 },
    { name: 'Thịt nạc vai heo', ingName: 'Thịt nạc vai băm hoặc thái mỏng', pM: 0.9, cM: 0.85 },
    { name: 'Thịt dải heo tươi', ingName: 'Thịt dải heo nạc mềm', pM: 1.15, cM: 1.0 },
    { name: 'Móng giò heo ninh mềm', ingName: 'Móng giò heo chặt khoanh', pM: 0.9, cM: 1.15 },
    { name: 'Chả lụa heo truyền thống', ingName: 'Chả lụa heo cắt lát dày', pM: 0.95, cM: 0.9 },
    { name: 'Thịt ba rọi một nắng', ingName: 'Thịt ba rọi phơi một nắng', pM: 1.2, cM: 1.1 }
  ];

  const porkStyles = [
    {
      suffix: 'Kho Tiêu Xanh Nước Dừa Xiêm',
      desc: 'Hương vị béo ngậy đậm đà: Thịt kho tộ nước dừa tươi Bến Tre, hạt tiêu xanh the cay nồng ấm đưa cơm.',
      method: 'Xào săn thịt trên lửa vừa cho tiết bớt mỡ thừa. Đổ nước dừa tươi xiêm ngập mặt thịt, nêm nước mắm cốt và tiêu sọ xanh đập dập. Đun sôi rồi hạ lửa liu riu kho trong 25 phút cho nước sốt sánh nâu óng ánh.',
      tip: 'Kho lửa nhỏ liu riu giúp mỡ thịt trong veo và không bị ngấy.',
      chef: 'Bí quyết đầu bếp: Dùng nước dừa tươi thay cho nước lọc sẽ giúp thịt heo lên màu cánh gián tự nhiên bóng bẩy, thịt mềm ngọt đậm đà từ sâu bên trong thớ thịt.',
      tags: ['Món Mặn', 'Thịt Kho', 'Nước Dừa', 'Đậm Đà'],
      cost: 75000,
      cal: 480,
      reg: 'nam'
    },
    {
      suffix: 'Rang Cháy Cạnh Hành Hoa Mắm Tỏi',
      desc: 'Món mặn quốc dân giòn rụm thơm lừng: Từng miếng thịt xém vàng cạnh bao bọc nước mắm đường hành hoa dậy mùi ngào ngạt.',
      method: 'Cho thịt vào chảo không dầu, rang lửa vừa cho thịt tự tiết mỡ. Khi mép thịt cong và hai mặt xém vàng cánh gián, chắt kiệt 80% mỡ thừa. Rưới hỗn hợp mắm đường tỏi băm đảo đều lửa lớn 2 phút cho kẹo lại rồi thả hành lá.',
      tip: 'Chắt sạch mỡ thừa trước khi rim mắm giúp món ăn giòn thơm không ngấy.',
      chef: 'Bí quyết đầu bếp: Chần sơ thịt qua nước sôi có gừng đập dập để bì giòn sần sật. Rang khô để thịt tự tiết mỡ tự thân, khi thịt xém vàng mới cho tỏi ớt vào đảo để tỏi không bị cháy khét đắng.',
      tags: ['Món Mặn', 'Thịt Ba Chỉ', 'Rang Cháy Cạnh', 'Cơm Nhà'],
      cost: 70000,
      cal: 460,
      reg: 'bac'
    },
    {
      suffix: 'Ram Mặn Ngọt Sốt Tỏi Ớt',
      desc: 'Miếng thịt ram nâu vàng đậm vị: Lớp ngoài óng ánh sốt caramel mặn ngọt cay nồng kích thích vị giác.',
      method: 'Áp chảo thịt vàng đều hai mặt trên lửa vừa. Cho hỗn hợp sốt gồm mắm cá cơm, đường thốt nốt, ớt sừng băm và tỏi đập dập vào chảo. Đậy nắp đun lửa nhỏ 15 phút, sau đó mở nắp đảo nhanh tay trên lửa lớn cho sốt bám chặt.',
      tip: 'Đảo nhanh tay ở công đoạn cuối để sốt áo đều quanh miếng thịt mà không bị cháy keo.',
      chef: 'Bí quyết đầu bếp: Dùng đường thốt nốt nấu chảy tạo màu caramel nâu vàng thay vì dùng phẩm màu công nghiệp, món ram sẽ có mùi thơm thanh dịu và độ dẻo óng ả tuyệt vời.',
      tags: ['Món Mặn', 'Ram Mặn Ngọt', 'Đưa Cơm', 'Gia Đình'],
      cost: 78000,
      cal: 450,
      reg: 'trung'
    },
    {
      suffix: 'Xào Mắm Ruốc Sả Ớt Xứ Huế',
      desc: 'Hương vị miền Trung đặc trưng nồng nàn: Mắm ruốc Huế thơm đậm hòa quyện vị sả ớt the cay ấm nồng thấm vào từng miếng thịt.',
      method: 'Phi thơm nhiều sả băm và ớt hiểm trong dầu nóng. Trút thịt vào xào săn trên lửa lớn trong 5 phút. Hòa mắm ruốc Huế với chút nước ấm và đường, rưới vào chảo đảo đều liên tục trên lửa vừa cho nước sốt ngấm kiệt vào thịt.',
      tip: 'Xào thật săn thịt trước khi đổ mắm ruốc để thịt thấm trọn gia vị cay mặn.',
      chef: 'Bí quyết đầu bếp: Xào sả ớt thật khô và thơm vàng trước khi cho mắm ruốc vào chảo, đảo đều tay trên lửa vừa đến khi thịt săn cứng và dậy mùi thơm nức mũi cả gian bếp.',
      tags: ['Món Mặn', 'Mắm Ruốc', 'Xứ Huế', 'Cay Nồng'],
      cost: 72000,
      cal: 430,
      reg: 'trung'
    },
    {
      suffix: 'Chiên Sả Ớt Giòn Rụm Thơm Nức',
      desc: 'Lớp vỏ ngoài giòn rụm vàng ươm thơm nức mùi sả chiên, bên trong thớ thịt mềm ngọt mọng nước.',
      method: 'Lăn thịt đã ướp qua lớp sả băm nhuyễn. Đun nóng dầu trên lửa vừa, thả thịt vào chiên vàng đều hai mặt trong 12 phút. Khi thịt chín vàng ruộm, vớt ra đĩa có lót giấy thấm dầu, cắt miếng vừa ăn và rắc sả chiên giòn lên trên.',
      tip: 'Chiên lửa vừa để sả không bị cháy trước khi thịt kịp chín vàng bên trong.',
      chef: 'Bí quyết đầu bếp: Giữ lại một phần sả băm ướp, phần sả còn lại phi giòn riêng trong chảo dầu rồi rắc lên mặt thịt khi bày ra đĩa để món ăn vừa đẹp mắt vừa thơm giòn trọn vẹn.',
      tags: ['Món Mặn', 'Chiên Sả Ớt', 'Giòn Tan', 'Đổi Vị'],
      cost: 76000,
      cal: 510,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nướng Mật Ong Sả Sa Tế Cay',
      desc: 'Món nướng đượm khói thơm phức: Thịt ngấm vị mật ong rừng ngọt thanh kết hợp sả tươi và sa tế cay tê tái hấp dẫn.',
      method: 'Xếp thịt lên vỉ nướng trên than hoa hoặc nồi chiên không dầu ở 180°C trong 15 phút. Quết đều lớp sốt mật ong sa tế lên hai mặt thịt rồi nướng tiếp ở 200°C trong 5 phút cho bề mặt xém nâu vàng giòn thơm.',
      tip: 'Quết sốt mật ong ở 5 phút cuối để đường không bị cháy khét bề mặt.',
      chef: 'Bí quyết đầu bếp: Thêm 1 muỗng cà phê dầu mè thơm và 1 muỗng sữa đặc vào nước sốt ướp thịt nướng, miếng thịt sau khi nướng sẽ mềm mọng nước suốt nhiều giờ mà không bao giờ bị khô xác.',
      tags: ['Món Mặn', 'Nướng Mật Ong', 'Sa Tế', 'Hấp Dẫn'],
      cost: 82000,
      cal: 490,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Kho Măng Tươi Chua Cay Đất Bắc',
      desc: 'Vị chua nhẹ giòn ngọt của măng tre tươi kết hợp thịt heo kho mềm rục béo ngậy, nước kho đậm đà chan cơm cực đỉnh.',
      method: 'Xào thơm hành khô băm, trút thịt vào đảo săn. Cho măng tươi đã luộc kỹ vào xào cùng trong 3 phút. Châm nước sôi và nước mắm cốt, đậy vung kho lửa nhỏ trong 20 phút cho măng ngấm đều mỡ thịt và gia vị đậm đà.',
      tip: 'Luộc măng 2 lần với nước muối mở vung để loại bỏ sạch độc tố tự nhiên.',
      chef: 'Bí quyết đầu bếp: Măng tươi luộc mở nắp 2 lần với chút muối hạt giúp loại bỏ hoàn toàn vị đắng và độc tố tự nhiên, xào kỹ măng với chút mỡ heo trước khi kho cùng thịt sẽ giúp măng mềm giòn thấm vị.',
      tags: ['Món Mặn', 'Măng Tươi', 'Thịt Kho', 'Đồng Quê'],
      cost: 68000,
      cal: 420,
      reg: 'bac'
    },
    {
      suffix: 'Áp Chảo Sốt Ngũ Vị Hương & Tỏi',
      desc: 'Thịt heo áp chảo thơm nức hương quế hồi ngũ vị, bì ngoài giòn xém vàng, thịt bên trong mềm ngọt đậm đà.',
      method: 'Đun nóng chảo với chút dầu ăn, đặt thịt vào áp chảo lửa vừa trong 10 phút đến khi hai mặt vàng ruộm. Cho tỏi tép đập dập và nước sốt ngũ vị vào rim nhỏ lửa 5 phút cho sốt keo sánh bọc quanh miếng thịt.',
      tip: 'Áp chảo mặt bì trước để bì giòn xém vàng không bị dai.',
      chef: 'Bí quyết đầu bếp: Châm đều tăm nhọn lên phần bì heo rồi thoa giấm trắng pha muối hạt lên bì trước khi áp chảo, lớp bì sẽ nở phồng giòn rụm như heo quay mà thịt vẫn mềm ngọt mọng nước.',
      tags: ['Món Mặn', 'Áp Chảo', 'Ngũ Vị Hương', 'Thơm Nức'],
      cost: 74000,
      cal: 470,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nấu Giả Cầy Riềng Mẻ Mắm Tôm',
      desc: 'Món ăn đặc sản đất Bắc: Thịt nướng thơm vàng nấu cùng riềng già, mẻ ngấu, mắm tôm và nghệ tươi sánh vàng ngậy béo.',
      method: 'Thui xém vàng bì thịt rồi rửa sạch chặt miếng vừa ăn. Ướp kỹ cùng riềng giã, mắm tôm, mẻ lọc và bột nghệ 20 phút. Xào săn trên lửa lớn, châm nước xâm xấp ninh lửa nhỏ trong 30 phút đến khi thịt mềm nhừ nước sốt sánh vàng óng.',
      tip: 'Lọc kỹ nước mẻ qua rây để loại bỏ bã hạt gạo giúp nước sốt sánh mịn.',
      chef: 'Bí quyết đầu bếp: Thui rơm hoặc khò vàng sém lớp bì heo trước khi nấu giúp thịt có mùi thơm nồng đặc trưng của khói bếp, mẻ phải ngấu chua dịu hòa cùng mắm tôm cốt truyền thống tạo nước sốt sánh vàng ngậy.',
      tags: ['Món Mặn', 'Giả Cầy', 'Đặc Sản', 'Đất Bắc'],
      cost: 78000,
      cal: 520,
      reg: 'bac'
    },
    {
      suffix: 'Om Chuối Đậu Nghệ Vàng Thanh Mát',
      desc: 'Món ăn đồng quê trứ danh: Thịt mềm béo, chuối xanh bùi ngọt và đậu phụ rán vàng hòa quyện nước om nghệ tía tô thơm lừng.',
      method: 'Chuối xanh tước vỏ ngâm nước chanh cắt khúc. Xào săn thịt heo với mắm muối. Cho chuối và đậu rán vào đảo nhẹ tay. Châm nước dùng nghệ đun sôi, hạ lửa nhỏ om 18 phút cho chuối mềm bở. Rắc lá lốt, tía tô thái nhỏ rồi tắt bếp.',
      tip: 'Thả tía tô lá lốt vào sau cùng và tắt bếp ngay để rau giữ trọn mùi thơm nồng.',
      chef: 'Bí quyết đầu bếp: Ngâm chuối xanh đã tước vỏ vào nước muối pha giấm loãng để chuối không bị thâm đen, khi om lấy 1-2 miếng chuối nghiền nhuyễn khuấy vào nồi nước giúp nước canh sánh vàng óng ả tự nhiên.',
      tags: ['Món Mặn', 'Om Chuối Đậu', 'Đồng Quê', 'Bắc Bộ'],
      cost: 65000,
      cal: 390,
      reg: 'bac'
    }
  ];

  let count = 0;
  for (let c = 0; c < porkCuts.length && count < 110; c++) {
    for (let s = 0; s < porkStyles.length && count < 110; s++) {
      const cut = porkCuts[c];
      const style = porkStyles[s];
      recipes.push({
        title: `${cut.name} ${style.suffix}`,
        desc: `${cut.name}: ${style.desc}`,
        cost: Math.round((style.cost * cut.pM) / 1000) * 1000,
        cal: Math.round(style.cal * cut.cM),
        reg: style.reg,
        pool: 'pork',
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Thịt Heo', 'Món Chính'],
        ingName: cut.ingName
      });
      count++;
    }
  }

  // POULTRY (90)
  const poultryCuts = [
    { name: 'Gà ta thả vườn chặt miếng', ingName: 'Gà ta thả vườn chặt miếng', pM: 1.1, cM: 1.0 },
    { name: 'Cánh gà tươi chiên giòn', ingName: 'Cánh gà tươi khía nhẹ', pM: 1.05, cM: 1.15 },
    { name: 'Đùi gà góc tư đượm vị', ingName: 'Đùi gà tươi khía thớ thịt', pM: 1.0, cM: 1.1 },
    { name: 'Ức gà tươi phi lê', ingName: 'Ức gà phi lê cắt quân cờ', pM: 0.9, cM: 0.8 },
    { name: 'Vịt cỏ Vân Đình om mềm', ingName: 'Thịt vịt cỏ chặt miếng vừa ăn', pM: 1.15, cM: 1.2 },
    { name: 'Chim cút tươi bổ đôi', ingName: 'Chim cút làm sạch bổ đôi', pM: 1.2, cM: 1.05 },
    { name: 'Gà ta rút xương xào săn', ingName: 'Thịt đùi gà ta rút xương', pM: 1.15, cM: 0.95 },
    { name: 'Mề gà xào giòn sần sật', ingName: 'Mề gà tươi khía hoa làm sạch', pM: 0.85, cM: 0.8 },
    { name: 'Lòng gà ta xào thơm', ingName: 'Lòng mề gà ta bóp muối gừng', pM: 0.85, cM: 0.85 }
  ];

  const poultryStyles = [
    {
      suffix: 'Kho Sả Ớt Hiểm Thơm Cay',
      desc: 'Món gà kho đậm đà ấm nồng: Từng miếng thịt gà vàng ươm ngấm đượm vị thơm cay của sả non và ớt hiểm đỏ.',
      method: 'Phi thơm nhiều sả băm và tỏi ớt, trút thịt gà vào xào săn trên lửa lớn cho tươm mỡ vàng da. Nêm 2 muỗng nước mắm, 1 muỗng đường, châm 1 chén nước sôi om lửa vừa 15 phút đến khi nước kho sánh keo.',
      tip: 'Xào gà thật săn trên lửa lớn giúp da gà giòn dai không bị bở.',
      chef: 'Bí quyết đầu bếp: Xào gà thật săn với chút nghệ tươi giã nát để da gà lên màu vàng óng ả bắt mắt, kho cùng sả đập dập giúp thịt gà thơm lừng không còn mùi tanh.',
      tags: ['Món Mặn', 'Gà Kho Sả Ớt', 'Cay Nồng', 'Cơm Nhà'],
      cost: 75000,
      cal: 420,
      reg: 'nam'
    },
    {
      suffix: 'Chiên Nước Mắm Tỏi Ớt Giòn Cay',
      desc: 'Lớp da giòn rụm màu cánh gián óng ả, phủ đều lớp sốt nước mắm tỏi ớt chua ngọt cay tê đậm đà đưa cơm.',
      method: 'Chiên thịt gà trong dầu nóng lửa vừa đến khi da vàng ruộm giòn tan thì vớt ra để ráo dầu. Phi thơm tỏi ớt băm, đổ hỗn hợp nước mắm đường vào nấu sôi lăn tăn, trút gà vào đảo nhanh tay 2 phút cho sốt bọc đều quanh thịt.',
      tip: 'Nấu sốt mắm kẹo sệt lại rồi mới trút gà chiên vào đảo nhanh tay để giữ độ giòn.',
      chef: 'Bí quyết đầu bếp: Rửa gà bằng nước gừng pha rượu trắng rồi thấm thật khô da trước khi chiên, da gà sẽ giòn rụm mà bên trong thịt vẫn mềm mọng nước thơm nức.',
      tags: ['Món Mặn', 'Chiên Nước Mắm', 'Giòn Rụm', 'Yêu Thích'],
      cost: 82000,
      cal: 490,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Hấp Lá Chanh Truyền Thống Xứ Bắc',
      desc: 'Hương vị tinh hoa gà luộc hấp lá chanh: Da vàng căng mọng giòn sần sật, thịt gà ngọt đậm thoảng hương thơm thanh tao của lá chanh non.',
      method: 'Lót sả đập dập và 1/2 lượng lá chanh dưới đáy xửng hấp. Đặt gà lên trên, rắc muối hạt và lá chanh thái chỉ. Đậy kín vung hấp cách thủy trên lửa vừa 22 phút đến khi que tăm xiên qua không còn nước đỏ thì tắt bếp.',
      tip: 'Hấp cách thủy giữ trọn 100% vị ngọt thanh tự nhiên của thịt gà mà không bị nhạt nước.',
      chef: 'Bí quyết đầu bếp: Khi gà vừa chín tới, vớt ra ngâm ngay vào âu nước đá lạnh 3 phút giúp lớp da gà săn giòn sần sật và căng bóng vàng ươm đẹp mắt.',
      tags: ['Món Mặn', 'Gà Hấp Lá Chanh', 'Truyền Thống', 'Đặc Sản'],
      cost: 85000,
      cal: 380,
      reg: 'bac'
    },
    {
      suffix: 'Ram Me Chua Ngọt Cay Bùng Vị',
      desc: 'Nước sốt me sánh nâu óng ánh vị chua ngọt thanh mát bao trọn từng miếng thịt gà dai giòn bùi béo.',
      method: 'Chiên gà chín vàng hai mặt trên lửa vừa. Nấu nước cốt me với đường thốt nốt, mắm nhĩ và ớt băm cho sốt sánh kẹo lại. Trút gà vào đảo đều trên lửa nhỏ trong 5 phút cho sốt ngấm sâu vào từng thớ thịt.',
      tip: 'Dùng nước cốt me tươi đun lửa nhỏ cho sốt keo sánh mượt mà.',
      chef: 'Bí quyết đầu bếp: Hòa nước cốt me với chút đường thốt nốt và ớt bột cay, rim trên lửa nhỏ cho sốt sánh đặc óng ánh rồi mới thả thịt chiên vào để giữ độ giòn mềm.',
      tags: ['Món Mặn', 'Ram Me', 'Chua Ngọt', 'Hấp Dẫn'],
      cost: 78000,
      cal: 440,
      reg: 'nam'
    },
    {
      suffix: 'Om Sấu Chua Thanh Dịu Phố Cổ',
      desc: 'Món ngon nức tiếng mùa sấu Hà Nội: Thịt mềm nhừ thấm đượm vị chua thanh khiết của quả sấu tươi, nước om sánh vàng béo ngậy.',
      method: 'Xào săn thịt với hành tím và chút nước mắm. Thả sấu đã cạo vỏ vào đảo cùng 3 phút. Châm nước sôi ngập mặt thịt om lửa nhỏ 25 phút. Dầm nát sấu lọc lấy nước chua thanh trút lại nồi om, nêm vừa ăn và rắc mùi tàu.',
      tip: 'Dầm sấu khi sấu đã chín mềm nhũn để dễ tách hạt và lấy trọn vị chua thanh.',
      chef: 'Bí quyết đầu bếp: Khử tanh vịt hoặc gà bằng rượu gừng trước khi nấu, xào thịt thật săn rồi mới châm nước om cùng quả sấu tươi để nước canh chua thanh trong vắt thơm dịu.',
      tags: ['Món Mặn', 'Om Sấu', 'Hà Nội', 'Đặc Sản'],
      cost: 88000,
      cal: 430,
      reg: 'bac'
    },
    {
      suffix: 'Kho Gừng Già Ấm Nồng Miền Trung',
      desc: 'Vị cay ấm thơm nồng của gừng già thái sợi hòa quyện cùng thịt gà săn chắc, nước kho đậm đà ấm bụng ngày mưa.',
      method: 'Phi thơm gừng già thái sợi trong dầu nóng. Cho thịt gà vào xào săn trên lửa lớn cho tươm mỡ. Nêm nước mắm cốt và chút tiêu xay, đun nhỏ lửa 18 phút cho thịt gà ngấm trọn vị cay ấm của gừng.',
      tip: 'Chọn gừng ta củ nhỏ vỏ sần để có hương thơm nồng nàn đậm đà nhất.',
      chef: 'Bí quyết đầu bếp: Dùng gừng già thái lát mỏng xào thật thơm cùng dầu lạc trước khi thả gà vào, vị cay ấm của gừng già sẽ ngấm sâu vào tủy xương gà giúp món ăn thơm nức đưa cơm.',
      tags: ['Món Mặn', 'Gà Kho Gừng', 'Ấm Nồng', 'Miền Trung'],
      cost: 76000,
      cal: 410,
      reg: 'trung'
    },
    {
      suffix: 'Rang Muối Sả Ớt Giòn Rụm Đậm Đà',
      desc: 'Lớp bột muối sả bùi bùi mằn mặn phủ đều miếng thịt giòn rụm bên ngoài, thơm lừng mùi lá chanh nướng.',
      method: 'Lăn gà qua bột chiên giòn mỏng, chiên ngập dầu lửa lớn đến khi chín vàng ruộm vớt ra để ráo. Cho gà vào âu lớn, rắc hỗn hợp bột muối đậu xanh rang và sả ớt chiên giòn, xóc đều tay cho bột muối bám đều.',
      tip: 'Xóc muối ngay khi thịt gà vừa vớt ra còn nóng để bột muối bám chặt.',
      chef: 'Bí quyết đầu bếp: Làm bột muối từ gạo nếp, đậu xanh và muối hột rang thơm giã mịn, xóc muối khi gà vừa chiên xong nóng hổi giúp lớp muối bám chặt bùi béo giòn tan.',
      tags: ['Món Mặn', 'Rang Muối', 'Giòn Tan', 'Hấp Dẫn'],
      cost: 84000,
      cal: 480,
      reg: 'bac'
    },
    {
      suffix: 'Xào Nấm Đông Cô Tươi Dầu Hào',
      desc: 'Thịt gà mềm ngọt mọng nước hòa quyện cùng nấm đông cô tươi dai giòn bùi béo và nước sốt dầu hào bóng mượt.',
      method: 'Xào thịt gà chín tới trút ra đĩa. Phi thơm hành tỏi băm, cho nấm đông cô và cà rốt vào xào nhanh 3 phút trên lửa lớn. Đổ thịt gà vào đảo đều, rưới 1.5 muỗng dầu hào và chút tiêu xay rồi tắt bếp.',
      tip: 'Xào nấm trên lửa lớn để nấm giữ trọn độ giòn ngọt không bị ra nước.',
      chef: 'Bí quyết đầu bếp: Khía nhẹ hình chữ thập trên mũ nấm đông cô để nấm nhanh ngấm gia vị dầu hào, xào lửa lớn đảo nhanh tay để nấm giữ nguyên độ giòn ngọt tự nhiên.',
      tags: ['Món Mặn', 'Nấm Đông Cô', 'Dầu Hào', 'Bổ Dưỡng'],
      cost: 82000,
      cal: 390,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Áp Chảo Sốt Mật Ong Chanh Tươi',
      desc: 'Sự cân bằng hoàn hảo giữa vị ngọt thanh của mật ong rừng và vị chua dịu thanh khiết của chanh tươi thơm mát.',
      method: 'Áp chảo thịt gà vàng ruộm hai mặt trên lửa vừa trong 12 phút. Hòa tan mật ong, nước cốt chanh tươi, xì dầu và tỏi băm. Rưới sốt vào chảo rim nhỏ lửa 3 phút cho sốt keo sánh vàng bọc quanh miếng thịt.',
      tip: 'Rim nhỏ lửa khi cho sốt mật ong để sốt không bị sẫm màu cháy khét.',
      chef: 'Bí quyết đầu bếp: Thêm 1 thìa cà phê vỏ chanh vàng bào nhuyễn vào nước sốt mật ong ở phút cuối cùng, tinh dầu vỏ chanh sẽ tạo hương thơm thanh nhã đẳng cấp làm say lòng thực khách.',
      tags: ['Món Mặn', 'Mật Ong Chanh', 'Thơm Mát', 'Eat Clean'],
      cost: 80000,
      cal: 400,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Nấu Xáo Nghệ Tươi Ớt Chỉ Thiên',
      desc: 'Món ăn gia truyền miền Trung: Thịt gà ta săn chắc nấu cùng nghệ tươi giã nát, lá chanh và ớt chỉ thiên cay nồng ấm bụng.',
      method: 'Ướp thịt gà với nghệ tươi giã nát, ớt chỉ thiên và nước mắm cốt. Phi thơm nén băm, xào gà thật săn trên lửa lớn. Châm chút nước sôi om nhỏ lửa 15 phút cho nước xáo vàng óng sánh đặc, rắc lá chanh thái nhỏ.',
      tip: 'Nghệ tươi giã nhuyễn giúp màu vàng óng ả và khử sạch mùi tanh.',
      chef: 'Bí quyết đầu bếp: Phi củ nén đập dập với dầu lạc thơm lừng rồi xào thịt gà cùng nghệ tươi giã nát, món gà nấu xáo sẽ có sắc vàng rực rỡ và hương vị cay nồng đặc trưng đất Quảng.',
      tags: ['Món Mặn', 'Nấu Xáo Nghệ', 'Miền Trung', 'Cay Nồng'],
      cost: 77000,
      cal: 390,
      reg: 'trung'
    }
  ];

  let pCount = 0;
  for (let c = 0; c < poultryCuts.length && pCount < 90; c++) {
    for (let s = 0; s < poultryStyles.length && pCount < 90; s++) {
      const cut = poultryCuts[c];
      const style = poultryStyles[s];
      recipes.push({
        title: `${cut.name} ${style.suffix}`,
        desc: `${cut.name}: ${style.desc}`,
        cost: Math.round((style.cost * cut.pM) / 1000) * 1000,
        cal: Math.round(style.cal * cut.cM),
        reg: style.reg,
        pool: 'poultry',
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Gia Cầm', 'Món Chính'],
        ingName: cut.ingName
      });
      pCount++;
    }
  }

  // BEEF (75)
  const beefCuts = [
    { name: 'Bắp bò hoa giòn ngọt', ingName: 'Bắp bò hoa thái lát mỏng', pM: 1.15, cM: 0.95 },
    { name: 'Thăn bò mềm thượng hạng', ingName: 'Thịt thăn bò thái mỏng ngang thớ', pM: 1.25, cM: 0.9 },
    { name: 'Gầu bò giòn ngậy', ingName: 'Gầu bò tươi thái lát mỏng', pM: 1.1, cM: 1.25 },
    { name: 'Nạc vai bò tươi', ingName: 'Nạc vai bò thái lát mỏng vừa ăn', pM: 1.0, cM: 1.0 },
    { name: 'Dẻ sườn bò tươi', ingName: 'Dẻ sườn bò cắt khúc vuông quân cờ', pM: 1.2, cM: 1.2 },
    { name: 'Nạm bò thơm béo', ingName: 'Nạm bò thái lát dày dặn', pM: 1.05, cM: 1.15 },
    { name: 'Thịt bò băm tươi', ingName: 'Thịt bò tươi xay nhuyễn', pM: 0.95, cM: 0.9 },
    { name: 'Bò tơ mềm mọng', ingName: 'Thịt bò tơ thái lát mỏng mềm', pM: 1.2, cM: 0.95 }
  ];

  const beefStyles = [
    {
      suffix: 'Xào Hoa Thiên Lý Tỏi Phi Thơm',
      desc: 'Sự kết hợp hoàn hảo: Thịt bò mềm mọng nước xào cùng hoa thiên lý giòn ngọt thanh mát và tỏi phi thơm nức.',
      method: 'Phi thơm tỏi đập dập trên lửa lớn, trút thịt bò vào đảo nhanh tay 1 phút vừa chín tái rồi múc riêng ra đĩa. Cho hoa thiên lý vào chảo đảo nhanh 2 phút với chút dầu hào, trút thịt bò lại đảo đều 30 giây rồi tắt bếp.',
      tip: 'Xào riêng thịt bò trên lửa lớn để thịt mềm mọng nước mà không bị dai.',
      chef: 'Bí quyết đầu bếp: Thái bò thật mỏng ngang thớ và ướp cùng 1 muỗng cà phê dầu ăn trong 10 phút để khóa ẩm, xào lửa cực lớn đảo thật nhanh tay giúp thịt bò mềm ngọt tan trong miệng.',
      tags: ['Món Mặn', 'Thịt Bò', 'Hoa Thiên Lý', 'Món Xào'],
      cost: 110000,
      cal: 360,
      reg: 'bac'
    },
    {
      suffix: 'Sốt Tiêu Đen Bơ Tỏi Đậm Vị',
      desc: 'Từng miếng thịt bò mềm mọng ngập trong sốt tiêu đen sánh đặc, cay nồng ấm áp thơm lừng bơ tỏi.',
      method: 'Đun nóng chảo với chút bơ lạt và tỏi băm. Cho thịt bò vào áp chảo lửa lớn 2 phút mỗi mặt. Rưới nước sốt tiêu đen gồm dầu hào, xì dầu, tiêu sọ xay vỡ và chút đường vào rim nhanh 2 phút cho sốt sánh sệt bao quanh thịt.',
      tip: 'Không nấu quá lâu trên bếp tránh làm thịt bò bị co rút mất nước.',
      chef: 'Bí quyết đầu bếp: Dùng hạt tiêu đen Phú Quốc rang thơm giã dập tay thay vì bột tiêu mịn để khi ăn cắn trúng hạt tiêu bung tỏa hương thơm cay the nồng nàn mà không bị gắt cổ.',
      tags: ['Món Mặn', 'Bò Sốt Tiêu Đen', 'Đậm Đà', 'Giàu Đạm'],
      cost: 125000,
      cal: 420,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Xào Cần Tây Hành Tây Cà Chua',
      desc: 'Món xào kinh điển đưa cơm: Thịt bò ngọt mềm hòa quyện cần tây giòn thơm, hành tây ngọt lịm và cà chua chín mọng.',
      method: 'Xào thịt bò trên lửa lớn vừa chín tới trút ra đĩa. Cho hành tây, cà chua và cần tây vào chảo xào nhanh lửa lớn 3 phút cho chín tới giòn ngọt. Đổ thịt bò vào đảo đều tay 30 giây, nêm dầu hào và tiêu xay rồi tắt bếp.',
      tip: 'Xào lửa to giúp rau củ giữ nguyên màu xanh tươi giòn ngọt mà không bị chảy nước.',
      chef: 'Bí quyết đầu bếp: Thêm 1/2 muỗng nước cốt gừng tươi vào ướp cùng thịt bò giúp thịt dậy mùi thơm nức đặc trưng và mềm tan khi xào trên lửa lớn.',
      tags: ['Món Mặn', 'Bò Xào Cần Tỏi', 'Đưa Cơm', 'Dễ Làm'],
      cost: 105000,
      cal: 340,
      reg: 'bac'
    },
    {
      suffix: 'Kho Mật Mía Quế Hồi Xứ Nghệ',
      desc: 'Đặc sản xứ Nghệ trứ danh: Thịt bò hầm mềm rục đượm hương quế hồi cay ấm, mật mía sánh nâu cánh gián óng ả.',
      method: 'Xào săn thịt bò với hành tăm và gừng đập dập. Cho mật mía Nghệ An, quế chi, hoa hồi nướng thơm và nước mắm cốt vào đảo đều. Châm nước ngập thịt đun sôi, hạ lửa liu riu kho trong 40 phút cho nước sánh kẹo lại.',
      tip: 'Kho lửa nhỏ liu riu để gia vị quế hồi mật mía ngấm sâu vào từng thớ thịt.',
      chef: 'Bí quyết đầu bếp: Nướng thơm quế hồi trên than trước khi thả vào nồi kho cùng mật mía nguyên chất, thịt bò sẽ mềm thơm ngọt bùi với hương thơm đặc trưng của ẩm thực miền Trung.',
      tags: ['Món Mặn', 'Bò Kho Mật Mía', 'Xứ Nghệ', 'Đậm Vị'],
      cost: 130000,
      cal: 480,
      reg: 'trung'
    },
    {
      suffix: 'Cuộn Nấm Kim Châm Áp Chảo Sốt Mắm Tỏi',
      desc: 'Từng cuốn thịt bò mỏng bọc nấm kim châm giòn ngọt, áp chảo xém vàng thơm nức rưới sốt mắm tỏi ớt đậm đà.',
      method: 'Trải từng lát thịt bò mỏng, đặt cụm nấm kim châm vào cuộn tròn chặt tay. Đun nóng chảo với chút dầu ăn, xếp từng cuộn bò vào áp chảo lửa vừa trong 4 phút cho chín đều các mặt. Rưới sốt mắm tỏi ớt lên mặt đảo nhẹ 1 phút.',
      tip: 'Cuộn chặt tay và đặt mép thịt xuống mặt chảo trước để cuộn thịt không bị bung.',
      chef: 'Bí quyết đầu bếp: Cuộn nấm thật chặt tay và cố định mép cuộn bằng cách áp chảo mặt mép trước, nấm sẽ tiết nước ngọt tự nhiên hòa cùng vị ngọt của thịt bò tạo độ mọng nước tuyệt vời.',
      tags: ['Món Mặn', 'Bò Cuộn Nấm', 'Áp Chảo', 'Hấp Dẫn'],
      cost: 115000,
      cal: 370,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Xào Đậu Cô Ve Giòn Ngọt Tỏi Phi',
      desc: 'Món ăn gia đình thanh nhẹ: Đậu cô ve xanh mướt giòn sần sật xào cùng thịt bò mềm ngọt ngập tràn dinh dưỡng.',
      method: 'Xào thịt bò tái trên lửa lớn rồi trút ra đĩa. Cho đậu cô ve tước xơ thái vát vào chảo xào nhanh lửa lớn với 2 muỗng nước dùng trong 3 phút. Đổ thịt bò vào xào chung 30 giây, nêm dầu hào và rắc tỏi phi vàng.',
      tip: 'Thêm 2 muỗng nước khi xào đậu để tạo hơi nước giúp đậu chín giòn xanh ngắt.',
      chef: 'Bí quyết đầu bếp: Chần sơ đậu cô ve qua nước sôi có muối hạt trong 1 phút rồi sốc qua nước đá lạnh, khi xào cùng thịt bò đĩa rau sẽ giữ trọn màu xanh ngọc bích và vị giòn ngọt mọng nước.',
      tags: ['Món Mặn', 'Bò Xào Đậu', 'Thanh Nhẹ', 'Cơm Nhà'],
      cost: 100000,
      cal: 330,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Lúc Lắc Khoai Tây Chiên Bơ Tỏi',
      desc: 'Từng viên thịt bò vuông vức xém cạnh mềm mọng nước sốt nâu bóng, ăn kèm khoai tây chiên giòn tan thơm lừng.',
      method: 'Ướp thịt bò cắt quân cờ với dầu hào, xì dầu và tỏi băm. Đun chảo thật nóng với chút dầu và bơ lạt, trút thịt bò vào lắc chảo liên tục trên lửa lớn trong 2 phút cho xém các mặt. Cho ớt chuông hành tây vào đảo nhanh 1 phút.',
      tip: 'Chảo phải thật nóng và lắc chảo liên tục để tạo độ xém cạnh caramel hấp dẫn.',
      chef: 'Bí quyết đầu bếp: Đun chảo gang thật bốc khói rồi mới cho thịt bò vào lắc nhanh tay trong 90 giây, bên ngoài xém nâu cánh gián mà bên trong thịt vẫn giữ trọn màu hồng ngọc mọng nước mềm tan.',
      tags: ['Món Mặn', 'Bò Lúc Lắc', 'Đặc Sắc', 'Hấp Dẫn'],
      cost: 135000,
      cal: 490,
      reg: 'nam'
    },
    {
      suffix: 'Xào Bông Cải Xanh Nấm Hương Dầu Hào',
      desc: 'Bông cải xanh giòn ngọt, nấm hương thơm bùi kết hợp thịt bò mềm mọng tạo nên đĩa món xào thanh khiết giàu vitamin.',
      method: 'Xào thịt bò chín tới trên lửa lớn trút ra đĩa riêng. Cho bông cải xanh và nấm hương vào xào cùng chút dầu hào trên lửa vừa trong 4 phút cho chín giòn. Đổ thịt bò vào đảo đều 30 giây rồi tắt bếp rắc tiêu.',
      tip: 'Cắt bông cải miếng vừa ăn để bông cải chín đều mà không bị nát vụn.',
      chef: 'Bí quyết đầu bếp: Luộc sơ bông cải xanh 30 giây trong nước sôi có chút dầu ăn để bông cải bóng mượt, sau đó xào trên lửa lớn cùng thịt bò giúp món ăn giữ trọn vị ngọt thanh mát tự nhiên.',
      tags: ['Món Mặn', 'Bông Cải Xanh', 'Eat Clean', 'Bổ Dưỡng'],
      cost: 110000,
      cal: 350,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Xào Sả Ớt Hiểm The Cay Nồng Ấm',
      desc: 'Hương vị cay nồng bùng nổ: Sả non bào mỏng phi vàng thơm phức quyện trong từng thớ thịt bò mềm đậm đà vị mắm tỏi.',
      method: 'Phi thơm nhiều sả bào và ớt hiểm trong dầu nóng. Trút thịt bò vào đảo thật nhanh tay trên lửa cực lớn trong 2 phút cho thịt vừa chín tới và ngấm đều tinh dầu sả ớt, nêm chút nước mắm ngon rồi trút ra đĩa.',
      tip: 'Xào trên lửa cực lớn trong thời gian ngắn nhất để thịt bò không bị dai.',
      chef: 'Bí quyết đầu bếp: Sả non bào mỏng tang phi vàng giòn trong dầu trước, sau đó trút thịt bò vào xào cực nhanh trên lửa lớn giúp thịt bò thơm nồng nàn vị thảo mộc mà mềm mọng nước.',
      tags: ['Món Mặn', 'Bò Xào Sả Ớt', 'Cay Nồng', 'Ấm Bụng'],
      cost: 115000,
      cal: 380,
      reg: 'trung'
    },
    {
      suffix: 'Hầm Khoai Tây Cà Rốt Sốt Vang Quế Hồi',
      desc: 'Món bò sốt vang mùa đông trứ danh: Thịt bò hầm mềm nhừ tan trong miệng, khoai tây bở tơi ngọt bùi thơm lừng quế hồi rượu vang.',
      method: 'Xào săn thịt bò với sốt cà chua, gấc tạo màu và bột quế hồi. Đổ nước sôi ngập thịt hầm nhỏ lửa trong 35 phút. Cho khoai tây cà rốt cắt miếng vào hầm thêm 15 phút đến khi củ quả mềm bở nước sốt sánh mịn.',
      tip: 'Hầm lửa nhỏ liu riu để thịt bò mềm rục mà củ quả không bị nát vụn.',
      chef: 'Bí quyết đầu bếp: Thêm 1 ly nhỏ rượu vang đỏ và chút nước cốt gấc tươi khi xào thịt bò, nước sốt vang sẽ có màu đỏ cam óng ánh tuyệt đẹp và mùi thơm nồng ấm đặc trưng của ẩm thực Hà Thành.',
      tags: ['Món Mặn', 'Bò Sốt Vang', 'Hầm Nhừ', 'Mùa Đông'],
      cost: 140000,
      cal: 520,
      reg: 'bac'
    }
  ];

  let bCount = 0;
  for (let c = 0; c < beefCuts.length && bCount < 75; c++) {
    for (let s = 0; s < beefStyles.length && bCount < 75; s++) {
      const cut = beefCuts[c];
      const style = beefStyles[s];
      recipes.push({
        title: `${cut.name} ${style.suffix}`,
        desc: `${cut.name}: ${style.desc}`,
        cost: Math.round((style.cost * cut.pM) / 1000) * 1000,
        cal: Math.round(style.cal * cut.cM),
        reg: style.reg,
        pool: 'beef',
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Thịt Bò', 'Giàu Đạm'],
        ingName: cut.ingName
      });
      bCount++;
    }
  }

  // SEAFOOD (75)
  const seafoodCuts = [
    { name: 'Cá basa phi lê tươi', ingName: 'Cá basa phi lê cắt khoanh', pM: 0.9, cM: 1.1 },
    { name: 'Cá lóc đồng tươi', ingName: 'Cá lóc đồng làm sạch cắt khoanh', pM: 1.1, cM: 0.9 },
    { name: 'Cá thu biển tươi', ingName: 'Cá thu cắt lát dày dặn', pM: 1.3, cM: 1.15 },
    { name: 'Tôm sú tươi sống', ingName: 'Tôm sú tươi bóc nõn chừa đuôi', pM: 1.35, cM: 0.85 },
    { name: 'Mực ống tươi dày mình', ingName: 'Mực ống tươi làm sạch cắt khoanh', pM: 1.25, cM: 0.8 },
    { name: 'Cá hồi Na Uy tươi', ingName: 'Cá hồi phi lê tươi cắt miếng vuông', pM: 1.4, cM: 1.2 },
    { name: 'Cá diêu hồng tươi', ingName: 'Cá diêu hồng làm sạch khía thớ', pM: 0.95, cM: 0.9 },
    { name: 'Cá rô phi rán giòn', ingName: 'Cá rô phi làm sạch ráo nước', pM: 0.85, cM: 0.95 },
    { name: 'Cá nục chuối tươi', ingName: 'Cá nục chuối tươi làm sạch', pM: 0.9, cM: 1.0 },
    { name: 'Cá bống sông tươi', ingName: 'Cá bống sông làm sạch để ráo', pM: 1.1, cM: 0.9 },
    { name: 'Tôm đồng giòn rụm', ingName: 'Tôm đồng tươi cắt râu rửa sạch', pM: 1.15, cM: 0.85 },
    { name: 'Ngao hoa ngọt lịm', ingName: 'Ngao hoa ngâm sạch cát', pM: 0.9, cM: 0.75 },
    { name: 'Mực một nắng áp chảo', ingName: 'Mực một nắng khía vảy rồng', pM: 1.35, cM: 0.9 },
    { name: 'Chả cá thát lát thì là', ingName: 'Chả cá thát lát quết dai giòn', pM: 1.2, cM: 1.0 },
    { name: 'Cá trê đồng kho tiêu', ingName: 'Cá trê đồng làm sạch cắt khúc', pM: 0.95, cM: 1.05 }
  ];

  const seafoodStyles = [
    {
      suffix: 'Kho Tộ Tiêu Đen Nước Dừa Nam Bộ',
      desc: 'Hương vị sông nước Nam Bộ đậm đà: Thịt cá săn chắc màu cánh gián óng ả, nước kho sánh keo the nồng tiêu đen cay ấm.',
      method: 'Thắng caramel đường thốt nốt với chút dầu ăn cho lên màu nâu cánh gián. Xếp cá vào tộ đất, nêm nước mắm cốt, ớt hiểm và nước dừa tươi. Đun sôi rồi hạ lửa liu riu kho trong 25 phút đến khi nước cạn keo sánh bám đều khoanh cá.',
      tip: 'Kho trong tộ đất giữ nhiệt cực tốt giúp thịt cá săn cứng đậm đà.',
      chef: 'Bí quyết đầu bếp: Dùng nước dừa xiêm tươi kho cá trên tộ đất lửa nhỏ liu riu, khi nước kho kẹo lại thì rắc thật nhiều tiêu sọ xay vỡ để tạo mùi thơm nồng nàn không thể cưỡng lại.',
      tags: ['Món Mặn', 'Hải Sản', 'Kho Tộ', 'Nam Bộ'],
      cost: 95000,
      cal: 390,
      reg: 'nam'
    },
    {
      suffix: 'Rim Mặn Ngọt Tỏi Ớt Đưa Cơm',
      desc: 'Từng miếng hải sản săn giòn bọc lớp sốt mắm đường tỏi ớt đỏ óng ánh, vị mặn ngọt cay đậm đà cực kỳ bắt cơm.',
      method: 'Xào săn hải sản trên lửa lớn trong 2 phút rồi vớt ra ráo nước. Phi thơm tỏi ớt băm, đổ hỗn hợp nước mắm đường nâu vào đun sôi kẹo lại. Trút hải sản vào đảo nhanh tay 3 phút cho sốt bọc kín bề mặt.',
      tip: 'Xào nhanh trên lửa lớn để hải sản giữ trọn độ giòn ngọt mọng nước.',
      chef: 'Bí quyết đầu bếp: Nấu sốt mắm đường kẹo lại sủi bọt tăm li ti rồi mới cho tôm/mực/cá vào đảo nhanh trên lửa lớn, lớp sốt sẽ bao bọc óng ánh mà hải sản vẫn giòn ngọt sần sật.',
      tags: ['Món Mặn', 'Rim Mặn Ngọt', 'Hải Sản', 'Đưa Cơm'],
      cost: 105000,
      cal: 340,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Hấp Xì Dầu Gừng Hành Hoa Thanh Tao',
      desc: 'Hải sản hấp chín tới ngọt lịm tự nhiên, hòa quyện xì dầu thượng hạng, dầu mè và gừng tươi thái sợi thơm nức.',
      method: 'Xếp hải sản lên đĩa sâu lòng, rắc gừng sợi và đầu hành trắng lên trên. Rưới hỗn hợp xì dầu, dầu hào và chút đường. Cho vào xửng hấp cách thủy trên lửa lớn trong 15 phút. Khi chín, rưới 1 muỗng dầu ăn đun sôi lên mặt hành gừng.',
      tip: 'Rưới dầu sôi nóng lên mặt hành gừng để kích hoạt tối đa tinh dầu thơm ngát.',
      chef: 'Bí quyết đầu bếp: Khi hải sản vừa hấp chín tới, đun sôi 1 muỗng canh dầu ăn rồi rưới trực tiếp lên lớp gừng và hành hoa trên mặt đĩa, hương thơm sẽ bùng nổ ngào ngạt như nhà hàng 5 sao.',
      tags: ['Món Mặn', 'Hấp Xì Dầu', 'Hải Sản', 'Thanh Nhẹ'],
      cost: 115000,
      cal: 290,
      reg: 'toan-quoc'
    },
    {
      suffix: 'Sốt Cà Chua Thì Là Đậm Vị Bắc',
      desc: 'Món ăn gia đình thân thương: Cá rán vàng giòn sốt cùng cà chua đỏ mọng chua dịu, thì là hành hoa thơm nức mũi.',
      method: 'Rán hải sản vàng đều hai mặt rồi vớt ra đĩa. Xào cà chua chín mềm tạo sốt đỏ óng, nêm nước mắm và hạt nêm. Thả hải sản vào om nhỏ lửa 6 phút cho ngấm vị chua ngọt dịu, rắc nhiều thì là và hành hoa cắt khúc rồi tắt bếp.',
      tip: 'Thì là và hành hoa cho vào sau cùng đảo nhẹ tay để giữ nguyên hương thơm tươi mát.',
      chef: 'Bí quyết đầu bếp: Xào cà chua với chút dầu ăn và muối trước khi châm nước sốt để cà chua tiết trọn sắc đỏ tự nhiên, thì là cắt khúc thả vào đảo 10 giây tắt bếp ngay để không bị nồng nát.',
      tags: ['Món Mặn', 'Sốt Cà Chua', 'Thì Là', 'Bắc Bộ'],
      cost: 90000,
      cal: 320,
      reg: 'bac'
    },
    {
      suffix: 'Cháy Tỏi Bơ Thơm Lừng Ngất Ngây',
      desc: 'Hương thơm nức mũi lan tỏa: Hải sản giòn sần sật quyện vị béo ngậy của bơ lạt và tỏi phi vàng ruộm giòn tan.',
      method: 'Phi vàng giòn lượng lớn tỏi băm trong dầu rồi vớt ra để riêng. Dùng chảo đó cho bơ lạt vào đun chảy, trút hải sản vào đảo nhanh trên lửa lớn trong 4 phút cho chín giòn, nêm chút hạt nêm và rắc tỏi phi vàng lên trên.',
      tip: 'Phi tỏi vàng giòn riêng để tỏi không bị ỉu mềm khi xào cùng hải sản.',
      chef: 'Bí quyết đầu bếp: Dùng bơ lạt chất lượng cao đảo ở công đoạn cuối trên lửa lớn, rắc tỏi đã phi vàng giòn lên trên cùng ngay trước khi thưởng thức để giữ trọn độ giòn tan bùi ngậy.',
      tags: ['Món Mặn', 'Cháy Tỏi Bơ', 'Giòn Tan', 'Hấp Dẫn'],
      cost: 120000,
      cal: 380,
      reg: 'toan-quoc'
    }
  ];

  let sCount = 0;
  for (let c = 0; c < seafoodCuts.length && sCount < 75; c++) {
    for (let s = 0; s < seafoodStyles.length && sCount < 75; s++) {
      const cut = seafoodCuts[c];
      const style = seafoodStyles[s];
      recipes.push({
        title: `${cut.name} ${style.suffix}`,
        desc: `${cut.name}: ${style.desc}`,
        cost: Math.round((style.cost * cut.pM) / 1000) * 1000,
        cal: Math.round(style.cal * cut.cM),
        reg: style.reg,
        pool: 'seafood',
        method: style.method,
        tip: style.tip,
        chef: style.chef,
        tags: [...style.tags, 'Hải Sản', 'Đậm Đà'],
        ingName: cut.ingName
      });
      sCount++;
    }
  }

  // Format into 350 recipes: 200 in Part 1, 150 in Part 2
  return recipes.map((r, idx) => {
    const isP1 = idx < 200;
    const num = isP1 ? idx + 1 : idx - 200 + 1;
    const id = isP1 ? `vn-p1-man-${String(num).padStart(3, '0')}` : `vn-p2-man-${String(num).padStart(3, '0')}`;
    return createRecipe({
      id,
      title: r.title,
      description: r.desc,
      category: 'mon-man',
      region: r.reg,
      prepTimeMinutes: 12,
      cookTimeMinutes: 20,
      calories: r.cal,
      estimatedCostVnd: r.cost,
      pool: r.pool,
      poolIndex: idx,
      ingredients: [
        { name: r.ingName, amount: 450, unit: 'g', category: 'thit-ca' },
        { name: 'Hành tím củ băm nhuyễn', amount: 3, unit: 'củ', category: 'rau-cu' },
        { name: 'Tỏi khô băm nhuyễn', amount: 1, unit: 'củ', category: 'rau-cu' },
        { name: 'Nước mắm truyền thống', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Đường thốt nốt nguyên chất', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Hành hoa & Tiêu đen xay', amount: 3, unit: 'nhánh', category: 'rau-cu' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Chuẩn bị nguyên liệu',
          durationMinutes: 5,
          heatLevel: 'không dùng nhiệt',
          content: 'Làm sạch nguyên liệu chính với nước muối loãng pha chút gừng đập dập, rửa lại với nước lạnh rồi để thật ráo nước. Cắt thái miếng vừa ăn đều tay.',
          tip: 'Để ráo nước hoàn toàn giúp nguyên liệu khi xào nấu nhanh săn chắc và đậm vị.'
        },
        {
          step: 2,
          title: 'Ướp gia vị chuẩn vị truyền thống',
          durationMinutes: 10,
          heatLevel: 'không dùng nhiệt',
          content: 'Ướp nguyên liệu với 1 muỗng canh nước mắm cốt, 1 muỗng cà phê hạt tiêu xay, hành tím băm nhuyễn trong 10 phút cho ngấm sâu gia vị từ bên trong.',
          tip: 'Ướp đủ thời gian giúp từng thớ thịt đậm đà từ trong ra ngoài.'
        },
        {
          step: 3,
          title: 'Kỹ thuật chế biến & Canh lửa',
          durationMinutes: 12,
          heatLevel: 'lửa vừa',
          content: r.method,
          tip: r.tip
        },
        {
          step: 4,
          title: 'Hoàn thiện & Bày đĩa thưởng thức',
          durationMinutes: 3,
          heatLevel: 'lửa lớn',
          content: 'Khi món ăn đạt độ chín mềm và nước sốt sánh keo óng ả, rắc hành lá cắt khúc và tiêu xay đảo đều 30 giây rồi tắt bếp. Múc ra đĩa sâu lòng ăn cùng cơm nóng.',
          tip: 'Bày ra đĩa và thưởng thức ngay khi món ăn còn nóng hổi bốc khói.'
        }
      ],
      tags: r.tags,
      chefTip: r.chef,
      difficulty: 'Dễ'
    });
  });
}

console.log('generateAllMonMan defined.');
