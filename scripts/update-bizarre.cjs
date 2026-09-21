const fs = require('fs');

let bizContent = fs.readFileSync('./src/data/casePools/bizarrePool.ts', 'utf8');

const replacements = [
  {
    findId: 'biz-gold-3',
    title: 'Mắm cá linh ủ muối 2 năm nguyên con đậm đặc mùi nồng',
    desc: 'Mắm cá linh ủ muối 2 năm nguyên con đậm đặc mùi nồng - CỰC HẠN 10 HUYỀN THOẠI, đặc sản miền Tây đậm đà mùi nồng thử thách mọi khứu giác!'
  },
  {
    findId: 'biz-gold-5',
    title: 'Đuông dừa Bến Tre tắm nước mắm ớt hiểm sống ngoe nguẩy',
    desc: 'Đuông dừa Bến Tre tắm nước mắm ớt hiểm sống ngoe nguẩy - CỰC HẠN 10 HUYỀN THOẠI, món nhậu đặc sản trứ danh miền Tây cắn ngập miệng béo ngậy!'
  },
  {
    findId: 'biz-gold-6',
    title: 'Bánh mì kẹp sầu riêng chấm mắm tôm pha ớt tươi',
    desc: 'Bánh mì kẹp sầu riêng chấm mắm tôm pha ớt tươi - CỰC HẠN 10 HUYỀN THOẠI, combo thách đố sáng tạo văn phòng bùng nổ mùi vị độc nhất vô nhị!'
  },
  {
    findId: 'biz-gold-7',
    title: 'Chân gà rút xương sốt ớt ma 7 cấp độ siêu cay xé họng',
    desc: 'Chân gà rút xương sốt ớt ma 7 cấp độ siêu cay xé họng - CỰC HẠN 10 HUYỀN THOẠI, món nhậu vỉa hè Việt Nam cay bỏng rát thử thách thần kinh!'
  },
  {
    findId: 'biz-gold-9',
    title: 'Thắng Cố lòng ngựa Tây Bắc ninh nhừ thảo quả mùi nồng',
    desc: 'Thắng Cố lòng ngựa Tây Bắc ninh nhừ thảo quả mùi nồng - CỰC HẠN 10 HUYỀN THOẠI, đặc sản vùng cao Bắc Hà thơm nồng vị thảo mộc và nội tạng ngựa!'
  },
  {
    findId: 'biz-gold-10',
    title: 'Mì tôm bóp vụn trộn 5 gói muối ớt tôm và ớt hiểm tươi',
    desc: 'Mì tôm bóp vụn trộn 5 gói muối ớt tôm và ớt hiểm tươi - CỰC HẠN 10 HUYỀN THOẠI, món ăn vặt văn phòng cấp độ tử thần cay xé lưỡi!'
  },
  {
    findId: 'biz-gold-11',
    title: 'Mắm ba khía Rạch Gốc Cà Mau mặn chát cay nồng xé lưỡi',
    desc: 'Mắm ba khía Rạch Gốc Cà Mau mặn chát cay nồng xé lưỡi - CỰC HẠN 10 HUYỀN THOẠI, đặc sản Đất Mũi thơm nồng đậm đà thách thức mọi vị giác!'
  },
  {
    findId: 'biz-gold-12',
    title: 'Bọ xít rừng già Tây Bắc rang giòn lá chanh chấm tương ớt',
    desc: 'Bọ xít rừng già Tây Bắc rang giòn lá chanh chấm tương ớt - CỰC HẠN 10 HUYỀN THOẠI, món nhậu côn trùng đặc sản giòn rụm béo bùi khó cưỡng!'
  },
  {
    findId: 'biz-gold-13',
    title: 'Trứng vịt lộn nguyên con 21 ngày tuổi hấp tiêu cay xé lưỡi',
    desc: 'Trứng vịt lộn nguyên con 21 ngày tuổi hấp tiêu cay xé lưỡi - CỰC HẠN 10 HUYỀN THOẠI, món đại bổ Việt Nam dành cho những tay chơi ẩm thực gan dạ!'
  },
  {
    findId: 'biz-gold-14',
    title: 'Dế mèn chiên bơ tỏi ớt hiểm cay nồng giòn rụm',
    desc: 'Dế mèn chiên bơ tỏi ớt hiểm cay nồng giòn rụm - CỰC HẠN 10 HUYỀN THOẠI, món đặc sản quán nhậu Việt Nam béo bùi giòn tan!'
  },
  {
    findId: 'biz-gold-15',
    title: 'Châu chấu rang lá chanh giòn rụm chấm muối tiêu chanh',
    desc: 'Châu chấu rang lá chanh giòn rụm chấm muối tiêu chanh - CỰC HẠN 10 HUYỀN THOẠI, đặc sản mùa lúa chín miền Bắc thơm nức giòn rụm!'
  },
  {
    findId: 'biz-gold-16',
    title: 'Nước mắm cá cơm 45 độ đạm nguyên chất uống cạn 1 chén con',
    desc: 'Nước mắm cá cơm 45 độ đạm nguyên chất uống cạn 1 chén con - CỰC HẠN 10 HUYỀN THOẠI, thử thách mặn chát đậm đà của dân biển Phú Quốc!'
  },
  {
    findId: 'biz-gold-19',
    title: 'Cà phê phin đen đặc quánh không đường dầm 3 trái ớt hiểm đỏ',
    desc: 'Cà phê phin đen đặc quánh không đường dầm 3 trái ớt hiểm đỏ - CỰC HẠN 10 HUYỀN THOẠI, thức uống chống ngủ gật cấp độ tử thần của dân văn phòng!'
  },
  {
    findId: 'biz-gold-20',
    title: 'Ốc bươu nhồi thịt hấp sả gừng chấm mắm gừng ớt hiểm siêu cay',
    desc: 'Ốc bươu nhồi thịt hấp sả gừng chấm mắm gừng ớt hiểm siêu cay - CỰC HẠN 10 HUYỀN THOẠI, món ngon quán ốc Việt Nam thơm nồng bỏng rát vòm họng!'
  },
  {
    findId: 'biz-gold-25',
    title: 'Mắm ruốc Huế xào thịt ba chỉ cay cấp 10 nồng nặc',
    desc: 'Mắm ruốc Huế xào thịt ba chỉ cay cấp 10 nồng nặc - CỰC HẠN 10 HUYỀN THOẠI, đặc sản Cố Đô thơm nồng nàn đưa cơm nhưng cay xé ruột!'
  },
  {
    findId: 'biz-gold-31',
    title: 'Bia hơi dầm ớt hiểm xanh và muối hạt cay nồng',
    desc: 'Bia hơi dầm ớt hiểm xanh và muối hạt cay nồng - CỰC HẠN 10 HUYỀN THOẠI, trò cá cược bàn nhậu Việt Nam sảng khoái cay bỏng họng!'
  },
  {
    findId: 'biz-gold-32',
    title: 'Rượu nếp cái hoa vàng ngâm tỏi cô đơn cay nồng ấm bụng',
    desc: 'Rượu nếp cái hoa vàng ngâm tỏi cô đơn cay nồng ấm bụng - CỰC HẠN 10 HUYỀN THOẠI, bài thuốc dân gian đậm vị cay hăng xộc thẳng lên mũi!'
  },
  {
    findId: 'biz-gold-40',
    title: 'Bao tử cá ba sa xào sa tế ớt hiểm cay xé họng',
    desc: 'Bao tử cá ba sa xào sa tế ớt hiểm cay xé họng - CỰC HẠN 10 HUYỀN THOẠI, món nhậu giòn sần sật bùng nổ hương vị vỉa hè Việt Nam!'
  },
  {
    findId: 'biz-gold-41',
    title: 'Ếch đồng nướng mọi chấm muối ớt chanh cay nồng',
    desc: 'Ếch đồng nướng mọi chấm muối ớt chanh cay nồng - CỰC HẠN 10 HUYỀN THOẠI, món ngon đồng quê thơm phức thịt ngọt da giòn cay cay!'
  },
  {
    findId: 'biz-gold-42',
    title: 'Cuống họng heo luộc giòn sần sật chấm mắm tôm nguyên chất',
    desc: 'Cuống họng heo luộc giòn sần sật chấm mắm tôm nguyên chất - CỰC HẠN 10 HUYỀN THOẠI, món lòng heo khoái khẩu của dân nhậu sành ăn Việt Nam!'
  },
  {
    findId: 'biz-gold-44',
    title: 'Canh khổ qua đắng ngắt không nêm đường ép ăn trọn bát',
    desc: 'Canh khổ qua đắng ngắt không nêm đường ép ăn trọn bát - CỰC HẠN 10 HUYỀN THOẠI, món cơm nhà thanh nhiệt nhưng đắng thấu tận tâm can!'
  },
  {
    findId: 'biz-gold-45',
    title: 'Cá trích ép trứng sống chấm mù tạt wasabi cay xộc óc',
    desc: 'Cá trích ép trứng sống chấm mù tạt wasabi cay xộc óc - CỰC HẠN 10 HUYỀN THOẠI, món gỏi cá sống béo giòn cay nồng bật khóc!'
  },
  {
    findId: 'biz-gold-48',
    title: 'Mướp đắng sống ướp đá lạnh chấm mắm ruốc đậm đặc',
    desc: 'Mướp đắng sống ướp đá lạnh chấm mắm ruốc đậm đặc - CỰC HẠN 10 HUYỀN THOẠI, đặc sản bàn nhậu giòn lạnh tanh đắng chát hòa quyện mắm ruốc nồng!'
  },
  {
    findId: 'biz-gold-50',
    title: 'Gỏi lá Tây Nguyên cuốn 40 loại lá rừng kẹp thịt ba chỉ chấm nước chấm cay',
    desc: 'Gỏi lá Tây Nguyên cuốn 40 loại lá rừng kẹp thịt ba chỉ chấm nước chấm cay - CỰC HẠN 10 HUYỀN THOẠI, đặc sản Kon Tum đủ vị chua chát đắng cay bùi!'
  }
];

let count = 0;
for (const r of replacements) {
  const reg = new RegExp(id:\\s*' + r.findId + ',[\\s\\S]*?title:\\s*'[^']+',[\\s\\S]*?description:\\s*'[^']+', m);
  if (reg.test(bizContent)) {
    bizContent = bizContent.replace(reg, id: ' + r.findId + ',\n title: ' + r.title + ',\n description: ' + r.desc + ');
    count++;
  }
}
console.log('Replaced count:', count);

bizContent = bizContent.replace('Đậu hũ thối chiên giòn sốt sa tế Đài Loan', 'Đậu hũ thối chiên giòn sốt sa tế tỏi ớt');
bizContent = bizContent.replace('Mì cay Hàn Quốc cấp độ 6 ớt hiểm tươi', 'Mì cay 7 cấp độ ớt hiểm tươi siêu bỏng rát');

fs.writeFileSync('./src/data/casePools/bizarrePool.ts', bizContent, 'utf8');
console.log('Saved bizarrePool.ts successfully');
