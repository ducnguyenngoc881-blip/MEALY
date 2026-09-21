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

import { recipesDatabase } from './recipesDatabase';

export const mockRecipes: Recipe[] = [...INITIAL_RECIPES, ...LEFTOVER_RECIPES, ...recipesDatabase];
export { recipesDatabase };
