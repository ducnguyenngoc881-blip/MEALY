import { Recipe } from '../types';

export const INITIAL_RECIPES: Recipe[] = [
  // --- MIỀN BẮC ---
  {
    id: 'thit-rang-chay-canh',
    title: 'Thịt Ba Chỉ Rang Cháy Cạnh',
    description: 'Món mặn quốc dân với thịt ba chỉ giòn rụm xém cạnh, thơm lừng mắm tỏi và hành hoa.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 450,
    estimatedCostVnd: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Thịt ba chỉ rút xương', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Hành khô băm', amount: 2, unit: 'củ', category: 'rau-cu' },
      { name: 'Nước mắm truyền thống', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Đường thốt nốt/Đường kính', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Hành lá cắt khúc', amount: 3, unit: 'nhánh', category: 'rau-cu' },
      { name: 'Tiêu xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Sơ chế thịt', content: 'Thịt ba chỉ rửa sạch với nước muối loãng, thái miếng vừa ăn mỏng khoảng 0.5cm.' },
      { step: 2, title: 'Rang cháy cạnh', content: 'Cho thịt vào chảo đảo đều với lửa vừa đến khi thịt tiết bớt mỡ và xém vàng các cạnh.' },
      { step: 3, title: 'Nêm nếm chuẩn vị', content: 'Gạt bớt mỡ dư, cho hành khô băm vào phi thơm. Cho nước mắm, đường, tiêu đảo nhanh tay đến khi sốt keo bám đều thịt.' },
      { step: 4, title: 'Hoàn thành', content: 'Rắc hành lá cắt khúc vào đảo 30 giây rồi tắt bếp, trút ra đĩa.' }
    ],
    tags: ['Món Mặn', 'Đậm Đà', 'Dễ Làm', 'Miền Bắc']
  },
  {
    id: 'canh-cua-mong-toi',
    title: 'Canh Cua Đồng Mồng Tơi Rêu Cua',
    description: 'Bát canh cua béo ngậy ngọt thanh, rêu cua đóng mảng dày kết hợp rau mồng tơi giòn mát.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 180,
    estimatedCostVnd: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cua đồng xay nguyên chất', amount: 300, unit: 'g', category: 'thit-ca' },
      { name: 'Rau mồng tơi tươi', amount: 1, unit: 'bó', category: 'rau-cu' },
      { name: 'Rau đay hoặc mướp hương', amount: 1, unit: 'quả/bó', category: 'rau-cu' },
      { name: 'Mắm tôm Bắc', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Gia vị: Muối, hạt nêm', amount: 1, unit: 'ít', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Lọc nước cua', content: 'Khuấy đều cua xay với 1.2 lít nước lọc và 1 nhúm muối nhỏ, lọc qua rây 2-3 lần lấy nước trong.' },
      { step: 2, title: 'Nấu rêu cua', content: 'Đun nồi nước cua trên lửa vừa, khuấy nhẹ ban đầu. Khi rêu cua nổi mảng đông lại thì hạ lửa nhỏ, vớt rêu ra đĩa riêng.' },
      { step: 3, title: 'Nấu rau', content: 'Thả rau mồng tơi và mướp hương thái lát vào nồi nước dùng đun sôi lại 2 phút.' },
      { step: 4, title: 'Trình bày', content: 'Trút rau ra bát to, đặt mảng rêu cua béo ngậy lên trên.' }
    ],
    tags: ['Món Canh', 'Giải Nhiệt', 'Đặc Sản', 'Miền Bắc']
  },
  {
    id: 'rau-muong-luoc-sau',
    title: 'Rau Muống Luộc Dầm Sấu',
    description: 'Dĩa rau muống xanh mướt giòn sần sật, bát nước luộc dầm sấu chua thanh giải nhiệt mùa hè.',
    category: 'mon-rau',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 4,
    calories: 80,
    estimatedCostVnd: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Rau muống ngọn nhỏ', amount: 1, unit: 'bó', category: 'rau-cu' },
      { name: 'Quả sấu tươi hoặc dầm', amount: 3, unit: 'quả', category: 'rau-cu' },
      { name: 'Muối tinh', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Chuẩn bị nước luộc', content: 'Đun sôi 1.5 lít nước với 1 muỗng muối tinh trên lửa lớn.' },
      { step: 2, title: 'Luộc rau', content: 'Thả rau muống vào dìm ngập nước, đun sôi lại 3 phút cho rau chín tới giữ độ xanh giòn.' },
      { step: 3, title: 'Dầm sấu', content: 'Vớt rau ra đĩa. Thả sấu vào nồi nước luộc đun 2 phút cho mềm rồi dầm nát, nêm nếm lại cho chua thanh.' }
    ],
    tags: ['Món Rau', 'Dễ Làm', 'Giảm Béo', 'Miền Bắc']
  },

  // --- MIỀN NAM ---
  {
    id: 'thit-kho-tau-trung-vit',
    title: 'Thịt Kho Tàu Trứng Vịt Dừa Tươi',
    description: 'Thịt ba rọi kho mềm rục béo ngậy trong nước dừa tươi ngọt thanh, trứng vịt thấm đượm màu cánh gián.',
    category: 'mon-man',
    region: 'nam',
    prepTimeMinutes: 20,
    cookTimeMinutes: 50,
    servings: 4,
    calories: 520,
    estimatedCostVnd: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Thịt ba rọi heo', amount: 600, unit: 'g', category: 'thit-ca' },
      { name: 'Trứng vịt luộc bóc vỏ', amount: 5, unit: 'quả', category: 'thit-ca' },
      { name: 'Nước dừa tươi', amount: 500, unit: 'ml', category: 'do-kho' },
      { name: 'Nước mắm Phú Quốc', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Hỏi tỏi ớt băm', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Nước màu dừa', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Ướp thịt', content: 'Thịt cắt vuông to 4x4cm. Ướp với nước mắm, đường, tỏi băm và nước màu dừa trong 30 phút.' },
      { step: 2, title: 'Kho với nước dừa', content: 'Đun sôi nước dừa tươi, thả thịt đã ướp vào đun lửa lớn 10 phút hớt sạch bọt.' },
      { step: 3, title: 'Kho nhỏ lửa', content: 'Hạ lửa riu riu kho 30 phút cho thịt mềm dẻo. Cho trứng vịt luộc vào kho tiếp 15 phút đến khi sốt sánh nhẹ.' }
    ],
    tags: ['Món Mặn', 'Truyền Thống', 'Đặc Sản', 'Miền Nam']
  },
  {
    id: 'canh-chua-ca-hu',
    title: 'Canh Chua Cá Hú Bạc Hà',
    description: 'Sự hòa quyện tuyệt vời giữa cá hú béo ngọt, nước canh chua me thanh nhẹ cùng dọc mùng, giá đậu và thơm.',
    category: 'mon-canh',
    region: 'nam',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 220,
    estimatedCostVnd: 70000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cá hú tươi cắt khúc', amount: 400, unit: 'g', category: 'thit-ca' },
      { name: 'Bạc hà (Dọc mùng)', amount: 2, unit: 'cây', category: 'rau-cu' },
      { name: 'Dứa (Thơm) chín', amount: 1/4, unit: 'quả', category: 'rau-cu' },
      { name: 'Cà chua chín', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Giá đỗ tươi', amount: 100, unit: 'g', category: 'rau-cu' },
      { name: 'Nước cốt me chua', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Rau ngổ & Ngò gai', amount: 1, unit: 'ít', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Nấu nước canh chua', content: 'Đun sôi 1.2 lít nước, cho dứa và cà chua vào nấu đun sôi. Thêm nước cốt me, đường, nước mắm nêm vị chua ngọt hài hòa.' },
      { step: 2, title: 'Cho cá hú', content: 'Thả cá hú vào nấu lửa vừa trong 10 phút cho cá chín ngọt.' },
      { step: 3, title: 'Cho rau canh', content: 'Thả bạc hà, giá đỗ vào đun sôi bùng lại 1 phút rồi tắt bếp. Rắc ngổ và ngò gai cắt nhỏ lên trên.' }
    ],
    tags: ['Món Canh', 'Chua Sweet', 'Miền Nam']
  },
  {
    id: 'dua-gia-bop-xoi',
    title: 'Dưa Giá Bóp Xổi Chần Chanh',
    description: 'Món kèm ngâm chua giòn ngọt chống ngấy cực đỉnh cho mâm cơm thịt kho tàu.',
    category: 'mon-rau',
    region: 'nam',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 45,
    estimatedCostVnd: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Giá đỗ mập', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Cà rốt bào sợi', amount: 1/2, unit: 'củ', category: 'rau-cu' },
      { name: 'Hẹ lá cắt khúc', amount: 50, unit: 'g', category: 'rau-cu' },
      { name: 'Nước giấm/chanh & đường', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Trộn giá hẹ', content: 'Trộn đều giá đỗ, cà rốt bào sợi và hẹ cắt khúc trong thau sạch.' },
      { step: 2, title: 'Ngâm chua ngọt', content: 'Pha hỗn hợp nước ấm, giấm, đường, chút muối rồi rưới lên dưa giá bóp nhẹ, ngâm 20 phút cho thấm giòn.' }
    ],
    tags: ['Món Rau', 'Gợi Vị', 'Miền Nam']
  },

  // --- MIỀN TRUNG ---
  {
    id: 'ca-nuc-kho-tieu',
    title: 'Cá Nục Kho Tiêu Ớt Hiểm Miền Trung',
    description: 'Cá nục tươi kho rục xương, vị cay nồng nàn của tiêu đen và ớt hiểm làm mê đắm lòng người.',
    category: 'mon-man',
    region: 'trung',
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
    servings: 4,
    calories: 380,
    estimatedCostVnd: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cá nục chuối tươi', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Tiêu sọ đập dập', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Ớt hiểm nguyên quả', amount: 5, unit: 'quả', category: 'rau-cu' },
      { name: 'Nước mắm nhĩ', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Mỡ heo & tóp mỡ', amount: 50, unit: 'g', category: 'thit-ca' }
    ],
    instructions: [
      { step: 1, title: 'Sơ chế cá', content: 'Cá nục làm sạch, ướp với nước mắm, tiêu sọ đập dập, ớt hiểm trong 20 phút.' },
      { step: 2, title: 'Kho lửa nhỏ', content: 'Cho mỡ heo và tóp mỡ vào niêu đất, xếp cá vào kho lửa nhỏ đến khi cá săn lại và cạn nước.' }
    ],
    tags: ['Món Mặn', 'Cay Nồng', 'Miền Trung']
  },
  {
    id: 'canh-ngao-nau-chua',
    title: 'Canh Ngao Nấu Chua Thì Là',
    description: 'Vị ngọt tự nhiên của ngao biển kết hợp dứa chua, cà chua tươi và thơm nồng thì là.',
    category: 'mon-canh',
    region: 'trung',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 160,
    estimatedCostVnd: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Ngao/Nghêu sống', amount: 1, unit: 'kg', category: 'thit-ca' },
      { name: 'Cà chua & Dứa', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Rau thì là & Hành lá', amount: 1, unit: 'bó', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Luộc ngao', content: 'Luộc ngao với 1 lít nước cho mở miệng. Vớt ngao gỡ lấy thịt, nước luộc gạn trong.' },
      { step: 2, title: 'Nấu canh chua', content: 'Xào cà chua dứa thơm lừng, trút nước ngao vào đun sôi, thả thịt ngao và thì là tắt bếp.' }
    ],
    tags: ['Món Canh', 'Ngọt Thanh', 'Miền Trung']
  },
  {
    id: 'rau-lang-xao-toi',
    title: 'Rau Lang Xào Tỏi Cháy',
    description: 'Rau lang đọt mềm xào tỏi đập dập lửa lớn thơm phức giòn ngọt.',
    category: 'mon-rau',
    region: 'trung',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 110,
    estimatedCostVnd: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Rau lang đọt non', amount: 1, unit: 'bó', category: 'rau-cu' },
      { name: 'Tỏi Lý Sơn đập dập', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Dầu ăn & Hạt nêm', amount: 1, unit: 'ít', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Chần rau', content: 'Chần nhanh rau lang qua nước sôi 30 giây rồi vớt ra nước lạnh cho xanh.' },
      { step: 2, title: 'Xào tỏi lửa lớn', content: 'Phi thơm tỏi dập dập với dầu ăn, trút rau lang vào đảo nhanh tay 1 phút trên lửa lớn, nêm chút hạt nêm.' }
    ],
    tags: ['Món Rau', 'Nhanh Gọn', 'Miền Trung']
  },

  // --- MÓN CHAY ---
  {
    id: 'dau-hu-chien-sa-ot',
    title: 'Đậu Hũ Chiên Sả Ớt Giòn Rụm',
    description: 'Đậu hũ chiên vàng giòn bên ngoài, bên trong mềm mịn bọc lớp sả ớt thơm cay nồng nàn.',
    category: 'mon-chay',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 280,
    estimatedCostVnd: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Đậu hũ trắng tươi', amount: 4, unit: 'miếng', category: 'thit-ca' },
      { name: 'Sả băm mịn', amount: 3, unit: 'củ', category: 'rau-cu' },
      { name: 'Ớt băm & Nước tương', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Chiên đậu', content: 'Đậu hũ cắt vuông chiên vàng giòn các mặt trên chảo dầu hot.' },
      { step: 2, title: 'Bọc sả ớt', content: 'Phi sả băm ớt thơm vàng với chút hạt nêm chay, dồn sả ớt lên mặt đậu hũ chiên nóng.' }
    ],
    tags: ['Món Chay', 'Nhanh Gọn', 'Giòn Rụm']
  },
  {
    id: 'canh-nam-hat-sen',
    title: 'Canh Nấm Hạt Sen Thanh Tịnh',
    description: 'Canh nấm tươi mộc nhĩ cùng hạt sen bùi béo mang lại sự thanh tịnh cho tâm trí và sức khỏe.',
    category: 'mon-chay',
    region: 'toan-quoc',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 150,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Hạt sen tươi bỏ tâm', amount: 100, unit: 'g', category: 'rau-cu' },
      { name: 'Nấm đùi gà & Nấm rơm', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Cà rốt & Táo đỏ', amount: 1, unit: 'ít', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Nầm hạt sen', content: 'Đun sôi hạt sen tươi trong 1 lít nước trong 15 phút cho chín bùi.' },
      { step: 2, title: 'Thả nấm tươi', content: 'Cho nấm đùi gà, nấm rơm và cà rốt vào nấu thêm 5 phút, nêm hạt nêm chay.' }
    ],
    tags: ['Món Chay', 'Bổ Dưỡng', 'Thanh Mát']
  },
  {
    id: 'rau-cu-luoc-kho-quet-chay',
    title: 'Rau Củ Luộc Kho Quẹt Chay',
    description: 'Đĩa rau củ luộc ngũ sắc thập cẩm chấm sốt kho quẹt chay mặn ngọt béo ngậy từ mộc nhĩ đậu hũ.',
    category: 'mon-chay',
    region: 'toan-quoc',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 190,
    estimatedCostVnd: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cà rốt, súp lơ, bầu, đậu bún', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Nước tương & Đường thốt nốt', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Tóp đậu hũ kho quẹt', amount: 50, unit: 'g', category: 'thit-ca' }
    ],
    instructions: [
      { step: 1, title: 'Luộc rau củ Ngũ sắc', content: 'Luộc cà rốt, súp lơ xanh, bầu giòn vừa tới, xếp đẹp ra đĩa to.' },
      { step: 2, title: 'Làm sốt kho quẹt chay', content: 'Đun sệt nước tương, đường thốt nốt, tiêu sọ nguyên hạt và tóp đậu hũ sên quánh mịn.' }
    ],
    tags: ['Món Chay', 'Giàu Xơ', 'Kho Quẹt']
  },

  // --- ĂN SÁNG ---
  {
    id: 'pho-bo-ha-noi',
    title: 'Phở Bò Gia Truyền Hà Nội',
    description: 'Tô phở bò nóng hổi thơm nồng thảo quả, nước dùng trong vắt ngọt thanh từ xương bò ninh kỹ.',
    category: 'an-sang',
    region: 'bac',
    prepTimeMinutes: 20,
    cookTimeMinutes: 60,
    servings: 4,
    calories: 480,
    estimatedCostVnd: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bánh phở tươi', amount: 800, unit: 'g', category: 'do-kho' },
      { name: 'Thịt bò thăn & Nạm bò', amount: 400, unit: 'g', category: 'thit-ca' },
      { name: 'Xương ống bò ninh nước dùng', amount: 1, unit: 'kg', category: 'thit-ca' },
      { name: 'Gừng nướng, thảo quả, hoa hồi', amount: 1, unit: 'gói', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Ninh nước dùng', content: 'Ninh xương bò cùng gừng nướng, hoa hồi, thảo quả trong 2 tiếng lấy nước ngọt tự nhiên.' },
      { step: 2, title: 'Trụng phở', content: 'Trụng bánh phở qua nước sôi, cho vào tô, xếp thịt bò thái mỏng cùng hành chẻ.' },
      { step: 3, title: 'Chan nước dùng', content: 'Chan nước dùng đang sôi sùng sục lên tô phở và thưởng thức nóng với quẩy giòn.' }
    ],
    tags: ['Ăn Sáng', 'Đặc Sản', 'Phở Việt']
  }
];

// --- MÓN TẬN DỤNG CƠM NGUỘI & ĐỒ ĂN THỪA ---
export const LEFTOVER_RECIPES: Recipe[] = [
  {
    id: 'com-rang-dua-bo-ha-noi',
    title: 'Cơm Rang Dưa Bò Hà Nội Giòn Rụm',
    description: 'Món cơm rang quốc dân trứ danh. Tận dụng cơm nguội bữa trước đảo săn hạt giòn rụm cùng dưa cải chua muối giòn tan và thịt bò thăn mềm thơm ngập khói lửa.',
    category: 'an-sang',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 490,
    estimatedCostVnd: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cơm nguội bữa trước (để tơi hạt)', amount: 600, unit: 'g', category: 'do-kho' },
      { name: 'Thịt bò thăn thái mỏng', amount: 250, unit: 'g', category: 'thit-ca' },
      { name: 'Dưa cải muối chua rửa sạch vắt ráo', amount: 200, unit: 'g', category: 'rau-cu' },
      { name: 'Trứng gà ta', amount: 2, unit: 'quả', category: 'khac' },
      { name: 'Tỏi băm & Hành khô', amount: 3, unit: 'nhánh', category: 'rau-cu' },
      { name: 'Nước tương & Hạt tiêu xay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Trộn cơm với lòng đỏ trứng', content: 'Bóp nhẹ cơm nguội với 1 lòng đỏ trứng gà và 1 muỗng dầu ăn để hạt cơm áo vàng đều.' },
      { step: 2, title: 'Xào bò dưa chua', content: 'Phi thơm tỏi, xào thịt bò chín tái nhanh tay rồi trút ra đĩa. Xào dưa cải chua giòn đậm đà.' },
      { step: 3, title: 'Rang cơm lửa lớn', content: 'Đảo cơm nguội trên chảo gang lửa lớn đến khi hạt cơm săn giòn lách tách, trút bò dưa vào đảo đều 1 phút.' }
    ],
    tags: ['Tận Dụng Cơm Nguội', 'Cơm Rang', 'Đặc Sản Hà Nội']
  },
  {
    id: 'com-chien-duong-chau-tom-lap-xuong',
    title: 'Cơm Chiên Dương Châu Tôm Lạp Xưởng',
    description: 'Công thức tận dụng cơm nguội bữa trước tuyệt vời nhất với lạp xưởng Mai Quế Lộ, tôm nõn giòn sần sật, trứng gà và rau củ ngũ sắc tươi ngọt.',
    category: 'an-sang',
    region: 'nam',
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 520,
    estimatedCostVnd: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cơm nguội bữa trước', amount: 600, unit: 'g', category: 'do-kho' },
      { name: 'Lạp xưởng Mai Quế Lộ thái hạt lựu', amount: 100, unit: 'g', category: 'thit-ca' },
      { name: 'Tôm nõn tươi hoặc tôm khô mềm', amount: 100, unit: 'g', category: 'thit-ca' },
      { name: 'Đậu Hà Lan & Cà rốt hạt lựu', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Trứng gà tươi', amount: 2, unit: 'quả', category: 'khac' },
      { name: 'Hành hoa & Ngò rí', amount: 2, unit: 'nhánh', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Chiên lạp xưởng & tôm', content: 'Cho lạp xưởng vào chảo đảo tiết mỡ thơm lừng, cho tôm và rau củ vào xào chín.' },
      { step: 2, title: 'Rang cơm nguội', content: 'Cho cơm nguội vào chảo đảo tơi xốp, rưới trứng đánh tan vào quết đều từng hạt cơm.' },
      { step: 3, title: 'Hoàn thiện', content: 'Trút đĩa nhân lạp xưởng tôm vào cơm, nêm chút nước tương ngon và rắc ngập hành hoa.' }
    ],
    tags: ['Tận Dụng Cơm Nguội', 'Cơm Chiên', 'Hương Vị Sài Gòn']
  },
  {
    id: 'com-chay-mo-hanh-cha-bong',
    title: 'Cơm Cháy Đáy Nồi Mỡ Hành Chà Bông',
    description: 'Món ăn vặt thơm ngon tận dụng từng hạt cơm nguội ép mỏng chiên vàng giòn rụm, rưới mỡ hành lá bóng bẩy và chà bông thơm lừng.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 380,
    estimatedCostVnd: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cơm nguội ép mỏng thành bánh', amount: 500, unit: 'g', category: 'do-kho' },
      { name: 'Chà bông heo (ruốc thịt)', amount: 80, unit: 'g', category: 'thit-ca' },
      { name: 'Hành lá tươi thái nhỏ', amount: 50, unit: 'g', category: 'rau-cu' },
      { name: 'Dầu ăn & Ớt băm', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Nước mắm chua ngọt pha kẹo', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Ép cơm mỏng', content: 'Dùng màng bọc thực phẩm ép dẹt cơm nguội dày khoảng 0.5cm.' },
      { step: 2, title: 'Chiên giòn', content: 'Chiên ngập dầu hoặc áp chảo gang không dầu đến khi hai mặt cơm vàng ươm giòn rụm.' },
      { step: 3, title: 'Quết mỡ hành', content: 'Rưới mỡ hành nóng hổi lên mặt cơm cháy, rắc chà bông và thưởng thức.' }
    ],
    tags: ['Tận Dụng Cơm Nguội', 'Cơm Cháy', 'Ăn Vặt']
  },
  {
    id: 'goi-ga-xe-phay-bap-cai',
    title: 'Gỏi Gà Xé Phay Bắp Cải Hành Tây',
    description: 'Giải pháp hoàn hảo tận dụng thịt gà luộc thừa bữa trước. Thịt gà xé sợi dai ngọt quyện cùng bắp cải giòn rụm và nước mắm chua ngọt đậm đà.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 320,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Thịt gà luộc thừa (xé phay)', amount: 300, unit: 'g', category: 'thit-ca' },
      { name: 'Bắp cải trắng thái sợi mỏng', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây ngâm giấm đá giòn', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Rau răm & Đậu phộng rang giã dập', amount: 50, unit: 'g', category: 'rau-cu' },
      { name: 'Nước cốt chanh, tỏi ớt, mắm đường', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Xé gà & bóp bắp cải', content: 'Gà luộc xé sợi nhỡ. Bắp cải rửa sạch vắt ráo bóp với chút xíu muối.' },
      { step: 2, title: 'Trộn gỏi', content: 'Trộn gà, bắp cải, hành tây, rau răm cùng nước mắm chua ngọt tỏi ớt.' },
      { step: 3, title: 'Trình bày', content: 'Rắc đậu phộng rang vàng giòn lên trên và thưởng thức ngay.' }
    ],
    tags: ['Tận Dụng Đồ Thừa', 'Thịt Gà Luộc', 'Gỏi Nộm']
  },
  {
    id: 'thit-luoc-cuon-banh-trang-thinh',
    title: 'Thịt Ba Chỉ Luộc Cuốn Bánh Tráng & Rau Sống',
    description: 'Món cuốn thanh mát tuyệt ngon tận dụng thịt heo luộc bữa trước thái mỏng, chấm cùng mắm nêm hoặc mắm chua ngọt tỏi ớt.',
    category: 'mon-man',
    region: 'trung',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 420,
    estimatedCostVnd: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Thịt heo luộc thừa thái mỏng', amount: 300, unit: 'g', category: 'thit-ca' },
      { name: 'Bánh tráng phơi sương Trảng Bàng', amount: 1, unit: 'xấp', category: 'do-kho' },
      { name: 'Rau thơm, xà lách, dưa leo, chuối chát', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Mắm nêm pha dứa ớt tỏi', amount: 1, unit: 'bát nhỏ', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Thái mỏng thịt luộc', content: 'Thịt luộc bữa trước thái lát thật mỏng đều tay.' },
      { step: 2, title: 'Bày đĩa cuốn', content: 'Xếp rau sống tươi giòn, dưa leo và bánh tráng ra mẹt.' },
      { step: 3, title: 'Thưởng thức', content: 'Nhúng nhẹ bánh tráng, đặt rau, thịt luộc và cuộn tròn chấm mắm nêm đậm đà.' }
    ],
    tags: ['Tận Dụng Đồ Thừa', 'Thịt Heo Luộc', 'Món Cuốn']
  }
];

export const WESTERN_RECIPES: Recipe[] = [
  // --- BỮA SÁNG KIỂU TÂY (WESTERN BREAKFAST) ---
  {
    id: 'omelette-nam-pho-mai-mozzarella',
    title: 'Trứng Cuộn Omelette Nấm & Phô Mai Kéo Sợi',
    description: 'Bữa sáng chuẩn vị Âu: Trứng gà tươi đánh bông cuộn nấm mỡ xào bơ thơm lừng, nhân phô mai mozzarella béo ngậy kéo sợi tan chảy, ăn kèm bánh mì nướng giòn.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    servings: 4,
    calories: 380,
    estimatedCostVnd: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Trứng gà tươi', amount: 6, unit: 'quả', category: 'khac' },
      { name: 'Nấm mỡ hoặc nấm đùi gà baby thái lát', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Phô mai Mozzarella bào sợi', amount: 80, unit: 'g', category: 'khac' },
      { name: 'Bơ lạt Anchor', amount: 20, unit: 'g', category: 'khac' },
      { name: 'Sữa tươi không đường', amount: 50, unit: 'ml', category: 'khac' },
      { name: 'Bánh mì sandwich nướng bơ tỏi', amount: 4, unit: 'lát', category: 'do-kho' }
    ],
    instructions: [
      { step: 1, title: 'Đánh trứng & xào nấm', content: 'Đánh tan trứng gà cùng sữa tươi và nhúm muối tiêu. Xào nấm với chút bơ lạt trên lửa vừa đến khi nấm chín thơm.' },
      { step: 2, title: 'Cuộn Omelette', content: 'Làm nóng chảo với bơ lạt, trút trứng vào lắc đều chảo. Khi mặt dưới se lại nhưng lòng còn mềm ẩm, rải nấm xào và phô mai vào giữa rồi khéo léo cuộn lại.' },
      { step: 3, title: 'Trình bày', content: 'Trượt trứng ra đĩa, rắc thêm chút mùi tây cắt nhỏ và ăn kèm bánh mì sandwich nướng giòn.' }
    ],
    tags: ['Món Âu', 'Ăn Sáng', 'Trứng', 'Omelette', 'Western Food', 'Nhanh Gọn']
  },
  {
    id: 'banh-mi-nuong-bo-trung-chan-avocado-toast',
    title: 'Bánh Mì Bơ Tươi & Trứng Chần Lòng Đào (Avocado Toast)',
    description: 'Bữa sáng dinh dưỡng hiện đại phong cách Úc & Bắc Mỹ: Bánh mì nướng bơ tỏi giòn tan, phủ lớp bơ sáp nghiền béo bùi, trứng chần mềm chảy lòng đào và rắc mè tiêu thơm.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 360,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bánh mì đen hoặc sandwich ngũ cốc', amount: 4, unit: 'lát', category: 'do-kho' },
      { name: 'Bơ sáp 034 chín tới', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Trứng gà tươi (chần lòng đào)', amount: 4, unit: 'quả', category: 'khac' },
      { name: 'Dầu ô liu nguyên chất Extra Virgin', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Nước cốt chanh vàng & Muối hồng, tiêu đập dập', amount: 1, unit: 'ít', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Nướng bánh mì', content: 'Nướng áp chảo hoặc máy nướng cho 4 lát bánh mì vàng giòn rụm.' },
      { step: 2, title: 'Nghiền bơ sáp', content: 'Dằm nhuyễn bơ sáp cùng chút muối, tiêu đen và nước cốt chanh vàng.' },
      { step: 3, title: 'Chần trứng lòng đào', content: 'Khuấy nước sôi tạo xoáy nhẹ, thả trứng vào chần 3 phút lấy ra ngâm nước ấm.' },
      { step: 4, title: 'Hoàn thành', content: 'Phết bơ nghiền lên lát bánh mì, đặt trứng chần lên trên, rưới chút dầu ô liu và rắc ớt bột hoặc tiêu đen.' }
    ],
    tags: ['Món Âu', 'Ăn Sáng', 'Avocado Toast', 'Eat Clean', 'Western Food', 'Healthy']
  },
  {
    id: 'trung-khuay-scrambled-eggs-xuc-xich-banh-mi',
    title: 'Trứng Khuấy Bơ Scrambled Eggs & Xúc Xích Nướng',
    description: 'Bữa sáng kinh điển kiểu Mỹ: Trứng khuấy bơ lạt mềm mịn mượt mà tan ngay trong miệng, kèm xúc xích Đức nướng xém cạnh thơm nức và bánh mì nướng bơ.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 4,
    calories: 440,
    estimatedCostVnd: 58000,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Trứng gà tươi', amount: 6, unit: 'quả', category: 'khac' },
      { name: 'Xúc xích Đức xông khói nướng', amount: 4, unit: 'cây', category: 'thit-ca' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Kem tươi whipping cream hoặc sữa tươi', amount: 40, unit: 'ml', category: 'khac' },
      { name: 'Bánh mì sandwich bơ nướng', amount: 4, unit: 'lát', category: 'do-kho' }
    ],
    instructions: [
      { step: 1, title: 'Nướng xúc xích', content: 'Khía nhẹ thân xúc xích, áp chảo lửa vừa cho vàng thơm xém cạnh.' },
      { step: 2, title: 'Khuấy trứng bơ mịn', content: 'Đánh tan trứng và kem tươi. Đun chảy bơ trên lửa thật nhỏ, đổ trứng vào dùng thìa gỗ đảo nhẹ nhàng tạo những vân trứng gợn sóng mềm mượt.' },
      { step: 3, title: 'Dọn đĩa', content: 'Bày trứng khuấy, xúc xích và bánh mì nướng ra đĩa, nêm tiêu đen xay thơm nức.' }
    ],
    tags: ['Món Âu', 'Ăn Sáng', 'Scrambled Eggs', 'American Breakfast', 'Western Food']
  },
  {
    id: 'pancake-mat-ong-bo-lat-chuoi',
    title: 'Bánh Pancake Xốp Mềm Bơ Mật Ong & Chuối Lát',
    description: 'Bữa sáng ngọt ngào được trẻ nhỏ và cả gia đình yêu thích: Bánh pancake xốp mềm vàng óng, rưới mật ong hoa rừng ngọt dịu, lát bơ béo ngậy và chuối chín tươi.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 390,
    estimatedCostVnd: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bột làm bánh pancake hoặc bột mì đa dụng', amount: 200, unit: 'g', category: 'do-kho' },
      { name: 'Sữa tươi tiệt trùng không đường', amount: 180, unit: 'ml', category: 'khac' },
      { name: 'Trứng gà tươi', amount: 2, unit: 'quả', category: 'khac' },
      { name: 'Mật ong hoa rừng nguyên chất', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Chuối tiêu chín thái lát & Bơ lạt', amount: 2, unit: 'quả/miếng', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Trộn bột', content: 'Khuấy đều bột mì, trứng gà, sữa tươi và chút đường vani thành hỗn hợp sánh mịn.' },
      { step: 2, title: 'Rán bánh', content: 'Thoa chút bơ lên chảo chống dính, múc 1 muôi bột vào rán lửa nhỏ đến khi sủi tăm bóng thì lật mặt rán thêm 1 phút cho vàng đều.' },
      { step: 3, title: 'Xếp tầng & rưới mật ong', content: 'Xếp các lát bánh chồng lên nhau, xếp chuối lát, đặt viên bơ lạt lên đỉnh và rưới mật ong thơm lừng.' }
    ],
    tags: ['Món Âu', 'Ăn Sáng', 'Pancake', 'Bánh Ngọt', 'Western Food', 'Trẻ Em']
  },
  {
    id: 'french-toast-banh-mi-nuong-kieu-phap',
    title: 'Bánh Mì Nướng Kiểu Pháp Sốt Bơ Quế (French Toast)',
    description: 'Món ăn sáng trứ danh của nước Pháp: Lát bánh mì ngâm đẫm trong hỗn hợp trứng sữa béo ngậy, áp chảo bơ lạt thơm lừng mùi bột quế và đường mịn.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 4,
    calories: 370,
    estimatedCostVnd: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bánh mì sandwich lát dày hoặc baguette', amount: 6, unit: 'lát', category: 'do-kho' },
      { name: 'Trứng gà tươi', amount: 3, unit: 'quả', category: 'khac' },
      { name: 'Sữa tươi tiệt trùng & Whipping cream', amount: 120, unit: 'ml', category: 'khac' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Bột quế & Mật ong hoa nhãn', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Pha hỗn hợp trứng sữa', content: 'Đánh tan trứng gà, sữa tươi, whipping cream, chút đường và xíu bột quế.' },
      { step: 2, title: 'Nhúng bánh mì', content: 'Nhúng từng lát bánh mì vào hỗn hợp khoảng 15 giây cho thấm đều 2 mặt.' },
      { step: 3, title: 'Áp chảo bơ', content: 'Đun chảy bơ lạt trên chảo, áp chảo bánh mỗi mặt 2-3 phút đến khi vàng giòn caramel.' }
    ],
    tags: ['Món Âu', 'Ăn Sáng', 'French Toast', 'Phong Cách Pháp', 'Western Food']
  },
  {
    id: 'yen-mach-sua-chua-hoa-qua-say-overnight-oats',
    title: 'Yến Mạch Sữa Chua Hy Lạp & Hoa Quả Hạt Chia',
    description: 'Bữa sáng thực dưỡng chuẩn Healthy Âu - Mỹ: Yến mạch cán mỏng ngâm sữa chua Hy Lạp sánh đặc, hạt chia giàu Omega-3 và hoa quả tươi mọng mát lành.',
    category: 'an-sang',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 320,
    estimatedCostVnd: 46000,
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Yến mạch Úc nguyên hạt cán mỏng', amount: 150, unit: 'g', category: 'do-kho' },
      { name: 'Sữa chua Hy Lạp hoặc sữa chua không đường', amount: 2, unit: 'hộp', category: 'khac' },
      { name: 'Sữa hạnh nhân hoặc sữa tươi', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Hạt chia & Hạnh nhân lát', amount: 30, unit: 'g', category: 'do-kho' },
      { name: 'Hoa quả tươi (chuối, dâu tây, việt quất)', amount: 150, unit: 'g', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Trộn yến mạch', content: 'Trộn đều yến mạch, hạt chia, sữa tươi và sữa chua trong hũ thủy tinh.' },
      { step: 2, title: 'Ủ mát', content: 'Đậy kín để ngăn mát tủ lạnh qua đêm hoặc tối thiểu 2 tiếng cho yến mạch nở mềm dẻo quánh.' },
      { step: 3, title: 'Thưởng thức', content: 'Rải hoa quả tươi cắt lát và hạnh nhân giòn lên trên, rưới chút mật ong là có bữa sáng tiện lợi.' }
    ],
    tags: ['Món Âu', 'Ăn Sáng', 'Overnight Oats', 'Eat Clean', 'Western Food', 'Healthy']
  },

  // --- SÚP & KHAI VỊ KIỂU ÂU (WESTERN SOUPS & STARTERS) ---
  {
    id: 'sup-kem-nam-tuoi-thao-moc',
    title: 'Súp Kem Nấm Tươi Thảo Mộc & Bánh Mì Bơ Giòn',
    description: 'Món súp kem nấm kinh điển phương Tây: Nấm mỡ và nấm hương tươi xào bơ tỏi dậy mùi, nấu cùng nước hầm xương gà và whipping cream béo ngậy, rắc lá thyme thơm ngát.',
    category: 'mon-canh',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 220,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Nấm mỡ tươi hoặc nấm đùi gà baby', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây trắng thái hạt lựu', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Bơ lạt tự nhiên Anchor', amount: 30, unit: 'g', category: 'khac' },
      { name: 'Kem tươi Whipping Cream', amount: 100, unit: 'ml', category: 'khac' },
      { name: 'Sữa tươi không đường', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Bánh mì bơ tỏi nướng giòn ăn kèm', amount: 4, unit: 'lát', category: 'do-kho' }
    ],
    instructions: [
      { step: 1, title: 'Xào nấm bơ tỏi', content: 'Xào hành tây với bơ cho thơm ngọt, cho nấm vào xào chín vàng xém cạnh.' },
      { step: 2, title: 'Nấu súp kem', content: 'Thêm sữa tươi và nước dùng gà vào đun sôi lăn tăn 8 phút. Xay mịn 2/3 lượng nấm để tạo độ sánh mượt tự nhiên.' },
      { step: 3, title: 'Hoàn thiện', content: 'Rưới whipping cream vào khuấy đều trên lửa nhỏ, nêm muối tiêu vừa ăn và dọn kèm bánh mì bơ nướng.' }
    ],
    tags: ['Món Âu', 'Súp Kem', 'Khai Vị', 'Nấm Tươi', 'Western Food']
  },
  {
    id: 'sup-ca-chua-hung-que-y',
    title: 'Súp Cà Chua Nướng Húng Quế Kiểu Ý (Tomato Basil Soup)',
    description: 'Món súp nổi tiếng vùng Địa Trung Hải: Cà chua chín mọng nướng đượm vị ngọt ngào, nấu nhuyễn cùng lá húng tây basil thơm nồng và chút kem béo, xua tan mọi mỏi mệt.',
    category: 'mon-canh',
    region: 'toan-quoc',
    prepTimeMinutes: 8,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 190,
    estimatedCostVnd: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Cà chua chín đỏ mọng', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây & Tỏi khô băm', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Lá húng tây Basil tươi hoặc khô', amount: 10, unit: 'g', category: 'rau-cu' },
      { name: 'Dầu ô liu nguyên chất', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Kem tươi whipping cream', amount: 60, unit: 'ml', category: 'khac' }
    ],
    instructions: [
      { step: 1, title: 'Nướng/xào cà chua', content: 'Xào hành tỏi thơm với dầu ô liu, cho cà chua thái múi cau vào đun chín nhừ.' },
      { step: 2, title: 'Xay nhuyễn mịn', content: 'Cho cà chua vào máy xay mịn cùng lá basil tươi và nước dùng.' },
      { step: 3, title: 'Khuấy kem béo', content: 'Đun sôi lại súp, nêm muối tiêu, rưới kem whipping tạo hoa văn xoáy hấp dẫn.' }
    ],
    tags: ['Món Âu', 'Súp Kem', 'Kiểu Ý', 'Tomato Basil', 'Western Food']
  },
  {
    id: 'sup-kem-bap-ngot-ga-xe',
    title: 'Súp Kem Bắp Ngọt & Gà Xé Sữa Tươi',
    description: 'Món súp ngô ngọt ngọt lịm bổ dưỡng: Hạt bắp Mỹ vàng tươi nấu sữa tươi kem béo, hòa quyện ức gà xé sợi mềm ngọt, rắc tiêu đen thơm nức mũi.',
    category: 'mon-canh',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 230,
    estimatedCostVnd: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bắp ngọt Mỹ tách hạt', amount: 2, unit: 'bắp', category: 'rau-cu' },
      { name: 'Ức gà tươi luộc xé sợi', amount: 150, unit: 'g', category: 'thit-ca' },
      { name: 'Sữa tươi & Kem tươi', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Bơ lạt Anchor', amount: 20, unit: 'g', category: 'khac' },
      { name: 'Hành tây hạt lựu', amount: 0.5, unit: 'củ', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Xào bắp ngọt bơ', content: 'Xào hành tây và bắp ngọt với bơ lạt cho chín dậy mùi thơm ngọt.' },
      { step: 2, title: 'Nấu súp sánh', content: 'Cho sữa tươi và nước luộc gà vào nấu mềm bắp, xay nhuyễn một nửa số bắp để tạo độ sánh tự nhiên.' },
      { step: 3, title: 'Thêm gà xé', content: 'Thả ức gà xé sợi vào nồi súp đun sôi nhẹ, nêm muối tiêu vừa ăn.' }
    ],
    tags: ['Món Âu', 'Súp Bắp', 'Khai Vị', 'Gà Xé', 'Western Food']
  },

  // --- MÓN RAU, SALAD & TINH BỘT KÈM KIỂU ÂU (WESTERN SIDES & SALADS) ---
  {
    id: 'salad-caesar-xac-lach-romaine',
    title: 'Salad Caesar Xà Lách Romaine & Bánh Mì Sấy Giòn Sốt Phô Mai',
    description: 'Món salad nổi tiếng thế giới: Xà lách Romaine tươi giòn mọng nước, bánh mì sấy tỏi croutons vàng ươm, bào ngập phô mai Parmesan và trộn sốt Caesar ngậy béo.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 180,
    estimatedCostVnd: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Xà lách Romaine hoặc xà lách mỡ giòn', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Bánh mì sấy giòn bơ tỏi (Croutons)', amount: 60, unit: 'g', category: 'do-kho' },
      { name: 'Phô mai bột Parmesan', amount: 30, unit: 'g', category: 'khac' },
      { name: 'Sốt Salad Caesar hoặc Mayonnaise chanh tỏi', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Cà chua bi tươi', amount: 100, unit: 'g', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Rửa rau xà lách', content: 'Xà lách Romaine ngâm nước đá cho giòn tan, vắt thật ráo nước và cắt khúc vừa ăn.' },
      { step: 2, title: 'Trộn sốt Caesar', content: 'Rưới sốt Caesar đều lên xà lách và cà chua bi, đảo nhẹ tay bằng kẹp salad.' },
      { step: 3, title: 'Hoàn thiện', content: 'Rải bánh mì croutons giòn rụm và rắc đầy phô mai Parmesan bào mịn lên mặt đĩa.' }
    ],
    tags: ['Món Âu', 'Salad', 'Caesar Salad', 'Rau Củ', 'Western Food', 'Eat Clean']
  },
  {
    id: 'khoai-tay-nghien-bo-toi-thao-moc',
    title: 'Khoai Tây Nghiền Bơ Tỏi Thảo Mộc (Garlic Mashed Potatoes)',
    description: 'Món ăn kèm hoàn hảo cho bít tết và sườn nướng: Khoai tây hấp chín nghiền mịn mượt như nhung, hòa quyện bơ lạt, sữa tươi béo ngậy và tỏi phi thảo mộc thơm lừng.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 240,
    estimatedCostVnd: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Khoai tây vàng Đà Lạt', amount: 600, unit: 'g', category: 'rau-cu' },
      { name: 'Bơ lạt Anchor hoặc bơ tự nhiên', amount: 40, unit: 'g', category: 'khac' },
      { name: 'Sữa tươi tiệt trùng không đường ấm', amount: 80, unit: 'ml', category: 'khac' },
      { name: 'Tỏi băm phi thơm & Tiêu đen xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Muối tinh & Nhánh hương thảo tươi', amount: 1, unit: 'ít', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Luộc mềm khoai tây', content: 'Khoai tây gọt vỏ cắt khối, luộc ngập nước muối loãng 15 phút đến khi xiên đũa qua dễ dàng.' },
      { step: 2, title: 'Nghiền mịn', content: 'Vớt khoai ráo nước, dùng nĩa hoặc dụng cụ nghiền mịn khi khoai còn nóng hổi.' },
      { step: 3, title: 'Hòa quyện bơ sữa', content: 'Cho bơ lạt và sữa ấm vào quậy đều tay đến khi khoai tây bóng mượt như kem, rắc tiêu tỏi lên trên.' }
    ],
    tags: ['Món Âu', 'Khoai Tây Nghiền', 'Món Kèm', 'Mashed Potatoes', 'Western Food']
  },
  {
    id: 'banh-mi-bo-toi-nuong-gion-rum',
    title: 'Bánh Mì Bơ Tỏi Nướng Giòn Rụm Thảo Mộc',
    description: 'Món ăn kèm kinh điển của ẩm thực Âu: Bánh mì baguette phết đẫm bơ lạt tỏi tươi phi thơm cùng lá mùi tây oregano, nướng vàng ươm giòn tan thơm lừng gian bếp.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    servings: 4,
    calories: 210,
    estimatedCostVnd: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bánh mì baguette hoặc bánh mì chuột', amount: 2, unit: 'ổ', category: 'do-kho' },
      { name: 'Bơ lạt Anchor làm mềm', amount: 40, unit: 'g', category: 'khac' },
      { name: 'Tỏi tươi băm thật nhuyễn', amount: 3, unit: 'tép', category: 'rau-cu' },
      { name: 'Lá mùi tây Oregano khô', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Chút xíu muối tinh', amount: 1, unit: 'nhúm', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Làm sốt bơ tỏi', content: 'Trộn bơ lạt mềm cùng tỏi băm nhuyễn, lá mùi tây oregano và nhúm muối nhỏ.' },
      { step: 2, title: 'Phết bánh mì', content: 'Cắt bánh mì thành từng lát chéo dày 2cm, phết đều hỗn hợp bơ tỏi lên bề mặt.' },
      { step: 3, title: 'Nướng giòn', content: 'Nướng nồi chiên không dầu hoặc chảo áp 5-7 phút ở 170°C cho mặt bánh vàng ươm giòn tan.' }
    ],
    tags: ['Món Âu', 'Bánh Mì Bơ Tỏi', 'Món Kèm', 'Garlic Bread', 'Western Food']
  },
  {
    id: 'salad-dia-trung-hai-feta-dau-oliu',
    title: 'Salad Địa Trung Hải Dưa Leo Cà Chua & Dầu Ô-Liu',
    description: 'Hương vị Địa Trung Hải tươi mát: Dưa leo giòn rụm kết hợp cà chua mọng nước, hành tây tím, quả ô liu đen và dầu ô liu nguyên chất chanh vàng sảng khoái.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 160,
    estimatedCostVnd: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Dưa leo baby giòn', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Cà chua chín tới hoặc cà chua bi', amount: 200, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây tím thái lát mỏng', amount: 0.5, unit: 'củ', category: 'rau-cu' },
      { name: 'Quả ô-liu đen ngâm muối', amount: 40, unit: 'g', category: 'khac' },
      { name: 'Dầu ô-liu Extra Virgin & Nước cốt chanh vàng', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Cắt rau củ', content: 'Dưa leo cắt khoanh tròn giòn, cà chua cắt múi cau, hành tây tím ngâm nước đá cho bớt hăng.' },
      { step: 2, title: 'Pha sốt dầu giấm', content: 'Khuấy đều dầu ô liu, nước cốt chanh vàng, muối tiêu và lá oregano.' },
      { step: 3, title: 'Trộn nhẹ', content: 'Rưới sốt lên đĩa rau củ, thả quả ô liu đen lên trên và thưởng thức ngay.' }
    ],
    tags: ['Món Âu', 'Salad', 'Địa Trung Hải', 'Greek Salad', 'Western Food', 'Eat Clean']
  },
  {
    id: 'mang-tay-ap-chao-bo-toi',
    title: 'Măng Tây & Cà Rốt Baby Áp Chảo Bơ Tỏi Thơm Nức',
    description: 'Món rau cao cấp cho bữa tiệc kiểu Âu: Đọt măng tây xanh mướt giòn ngọt cùng cà rốt baby áp chảo lửa lớn với bơ tỏi thơm lừng, rắc tiêu đen muối hồng.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 5,
    cookTimeMinutes: 6,
    servings: 4,
    calories: 140,
    estimatedCostVnd: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Đọt măng tây xanh tươi giòn', amount: 250, unit: 'g', category: 'rau-cu' },
      { name: 'Cà rốt baby ngọt hoặc cà rốt củ', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Tỏi băm nhuyễn', amount: 3, unit: 'tép', category: 'rau-cu' },
      { name: 'Muối tiêu gia vị', amount: 1, unit: 'ít', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Sơ chế măng tây', content: 'Cắt bỏ gốc già măng tây, rửa sạch để ráo.' },
      { step: 2, title: 'Áp chảo bơ tỏi', content: 'Đun chảy bơ lạt, phi tỏi thơm lừng, cho cà rốt và măng tây vào đảo nhanh tay trên lửa lớn 4-5 phút.' },
      { step: 3, title: 'Rắc muối tiêu', content: 'Nêm muối hồng và tiêu đen giã dập, tắt bếp khi măng tây còn giòn ngọt mọng nước.' }
    ],
    tags: ['Món Âu', 'Món Rau', 'Măng Tây', 'Bơ Tỏi', 'Western Food', 'Eat Clean']
  },

  // --- MÓN CHÍNH KIỂU ÂU (WESTERN MAINS) ---
  {
    id: 'ga-nuong-parmigiana-pho-mai',
    title: 'Gà Nướng Parmigiana Phô Mai Mozzarella Đút Lò & Mì Ý Bơ Tỏi',
    description: 'Món gà đút lò phong cách Ý - Mỹ trứ danh: Miếng ức gà chiên giòn phủ đẫm sốt cà chua marinara đậm đà, phô mai mozzarella kéo sợi vàng ươm mặt, ăn kèm mì Ý bơ tỏi thơm lừng.',
    category: 'mon-man',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    servings: 4,
    calories: 590,
    estimatedCostVnd: 125000,
    imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Ức gà phi lê tươi', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Sốt cà chua Marinara kiểu Ý', amount: 150, unit: 'g', category: 'gia-vi' },
      { name: 'Phô mai Mozzarella kéo sợi', amount: 120, unit: 'g', category: 'khac' },
      { name: 'Bột chiên xù & Bột mì', amount: 100, unit: 'g', category: 'do-kho' },
      { name: 'Mì Ý luộc chín tới xóc bơ tỏi', amount: 200, unit: 'g', category: 'do-kho' }
    ],
    instructions: [
      { step: 1, title: 'Tẩm bột rán gà', content: 'Đập dẹt ức gà, tẩm bột mì, trứng và bột chiên xù, rán vàng ươm hai mặt.' },
      { step: 2, title: 'Đút lò phô mai', content: 'Rưới sốt cà chua marinara lên miếng gà, phủ đầy phô mai mozzarella rồi đút lò hoặc nồi chiên không dầu 6 phút cho phô mai tan chảy xém vàng.' },
      { step: 3, title: 'Thưởng thức', content: 'Dọn gà nóng hổi kéo sợi phô mai ăn kèm đĩa mì Ý bơ tỏi thảo mộc.' }
    ],
    tags: ['Món Âu', 'Món Mặn', 'Chicken Parmigiana', 'Đút Lò', 'Western Food']
  },
  {
    id: 'bo-ham-ruou-vang-beef-bourguignon',
    title: 'Bò Hầm Rượu Vang & Rau Củ Kiểu Pháp (Bœuf Bourguignon)',
    description: 'Đặc sản trứ danh nước Pháp: Thịt thăn bò mềm tan ninh nhừ trong nước sốt rượu vang nồng ấm, hòa quyện cà rốt ngọt lịm, nấm tươi và hành tây, chấm cùng bánh mì nướng bơ tỏi giòn tan.',
    category: 'mon-man',
    region: 'toan-quoc',
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    servings: 4,
    calories: 560,
    estimatedCostVnd: 165000,
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Bắp bò hoặc thăn bò cắt khối vuông', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Cà rốt & Khoai tây cắt miếng lớn', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Nấm mỡ tươi hoặc nấm hương', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Rượu vang đỏ đà lạt nấu ăn', amount: 150, unit: 'ml', category: 'gia-vi' },
      { name: 'Lá thơm Thyme, lá nguyệt quế & Bơ tỏi', amount: 1, unit: 'gói nhỏ', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Áp chảo thịt bò', content: 'Thịt bò ướp muối tiêu, áp chảo lửa lớn cho xém nâu vàng các mặt rồi gắp ra.' },
      { step: 2, title: 'Hầm sốt rượu vang', content: 'Xào hành tây, tỏi, cà rốt với bơ. Đổ rượu vang và nước dùng bò vào ninh lửa nhỏ 30 phút cho thịt bò mềm rục.' },
      { step: 3, title: 'Hoàn thiện', content: 'Thêm nấm mỡ vào đun thêm 5 phút cho nước sốt sánh kẹo nâu óng ả, chấm bánh mì nóng hổi.' }
    ],
    tags: ['Món Âu', 'Món Mặn', 'Bò Hầm Pháp', 'Beef Bourguignon', 'Western Food', 'Tiệc Gia Đình']
  },
  {
    id: 'mi-y-pesto-hai-san-tom-muc',
    title: 'Mì Ý Sốt Húng Tây Pesto Hải Sản Tôm Mực',
    description: 'Hương vị biển Địa Trung Hải thanh khiết: Tôm sú và mực tươi xào chín tới ngọt đậm, quyện đều từng sợi mì Ý sốt Pesto xanh mướt từ húng tây, hạt thông bùi béo và dầu ô liu nguyên chất.',
    category: 'mon-man',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 520,
    estimatedCostVnd: 145000,
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Mì Ý sợi dài Spaghetti lúa mì cứng', amount: 300, unit: 'g', category: 'do-kho' },
      { name: 'Tôm sú tươi bóc nõn', amount: 200, unit: 'g', category: 'thit-ca' },
      { name: 'Mực ống tươi cắt khoanh', amount: 150, unit: 'g', category: 'thit-ca' },
      { name: 'Sốt Pesto húng tây kiểu Ý (Basil Pesto)', amount: 80, unit: 'g', category: 'gia-vi' },
      { name: 'Dầu ô liu & Tỏi lát', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Luộc mì Ý', content: 'Luộc mì Ý với nước muối 8 phút cho chín chuẩn al dente, vớt ráo giữ lại 1 muôi nước luộc mì.' },
      { step: 2, title: 'Xào hải sản tỏi ớt', content: 'Phi thơm tỏi lát với dầu ô liu, cho tôm mực vào xào lửa lớn chín tới trong 2 phút.' },
      { step: 3, title: 'Trộn sốt Pesto', content: 'Tắt lửa, cho mì và sốt Pesto vào xóc đều chảo cho lớp sốt xanh ngọc bám đều từng sợi mì.' }
    ],
    tags: ['Món Âu', 'Món Mặn', 'Mì Ý Pesto', 'Hải Sản', 'Địa Trung Hải', 'Western Food']
  }
];

import { recipesDatabase } from './recipesDatabase';
import { westernDishes500 } from './westernDishes500';

export { westernDishes500 };
export const mockRecipes: Recipe[] = [...INITIAL_RECIPES, ...LEFTOVER_RECIPES, ...WESTERN_RECIPES, ...westernDishes500, ...recipesDatabase];
export { recipesDatabase };

