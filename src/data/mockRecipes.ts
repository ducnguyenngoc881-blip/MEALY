import { Recipe } from '../types';

export const INITIAL_RECIPES: Recipe[] = [
  // --- MIỀN BẮC ---
  {
    id: 'thit-rang-chay-canh',
    title: 'Thịt Ba Chỉ Rang Cháy Cạnh',
    description: 'Món mặn quốc dân với thịt ba chỉ giòn rụm xém cạnh, thơm lừng mắm tỏi và hành hoa, đậm đà đưa cơm.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 450,
    estimatedCostVnd: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Thịt ba chỉ rút sườn', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Hành khô băm', amount: 3, unit: 'củ', category: 'rau-cu' },
      { name: 'Nước mắm truyền thống', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Đường thốt nốt (hoặc đường phèn nâu)', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Hành lá cắt khúc', amount: 4, unit: 'nhánh', category: 'rau-cu' },
      { name: 'Tiêu đen xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Khử hôi bì thịt',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Thịt ba chỉ cạo sạch lông bì, ngâm nước muối loãng pha chút giấm trong 5 phút rồi rửa sạch, để ráo. Cắt lát mỏng đều tay dày khoảng 0.3 - 0.4cm. Hành khô bóc vỏ băm nhuyễn, hành lá rửa sạch cắt khúc 3cm.',
        tip: 'Thái lát mỏng vừa phải giúp thịt nhanh chín giòn xém cạnh mà không bị khô cứng bên trong.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 10,
        heatLevel: 'không dùng nhiệt',
        content: 'Ướp thịt với 1 muỗng cà phê hạt nêm và 1 muỗng cà phê nước mắm ngon trong 10 phút để thịt đậm vị từ bên trong. Không ướp đường hay hành tỏi ở bước này để tránh bị cháy khét khi rang.',
        tip: 'Không ướp đường trước vì đường dễ bị cháy đen trước khi thịt kịp xém cạnh.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 8,
        heatLevel: 'lửa vừa',
        content: 'Bắc chảo lên bếp không cần cho dầu ăn. Cho thịt ba chỉ vào đảo đều trên lửa vừa cho thịt tự tiết mỡ. Khi miếng thịt săn lại, mép bì cong nhẹ và hai mặt xém vàng cánh gián giòn rụm, nghiêng chảo chắt bớt 80% lượng mỡ dư ra chén.',
        tip: 'Chắt kiệt mỡ thừa trước khi rim nước sốt giúp món ăn thơm ngậy giòn bùi mà không bị ngấy mỡ.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 3,
        heatLevel: 'lửa lớn',
        content: 'Vặn lửa vừa, cho hành khô băm vào phi thơm nức cùng thịt. Hòa tan 2 muỗng canh nước mắm, 1 muỗng canh đường và 1 muỗng canh nước lọc rồi rưới đều quanh chảo. Đảo nhanh tay trên lửa lớn cho sốt kẹo lại bao quanh từng miếng thịt. Rắc hành lá và tiêu xay đảo đều 20 giây rồi tắt bếp.',
        tip: 'Rưới sốt quanh thành chảo nóng giúp tạo hiệu ứng caramel hóa dậy mùi thơm nồng nàn.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Chần thịt qua nước sôi có đập dập 1 củ hành tím trước khi thái sẽ giúp bì giòn sần sật và loại bỏ 100% mùi tanh hôi. Khi rang không dùng dầu, để thịt tự tiết mỡ tự thân, chắt sạch mỡ rồi mới rim mắm đường để nước sốt sánh keo óng ả.',
    tags: ['Món Mặn', 'Đậm Đà', 'Dễ Làm', 'Miền Bắc', 'Cơm Gia Đình']
  },
  {
    id: 'canh-cua-mong-toi',
    title: 'Canh Cua Đồng Mồng Tơi Rêu Cua',
    description: 'Bát canh cua béo ngậy ngọt thanh, rêu cua đóng mảng dày kết hợp rau mồng tơi giòn mát và mướp hương thơm ngát.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 180,
    estimatedCostVnd: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Cua đồng xay nguyên chất', amount: 350, unit: 'g', category: 'thit-ca' },
      { name: 'Rau mồng tơi tươi non', amount: 1, unit: 'bó (300g)', category: 'rau-cu' },
      { name: 'Mướp hương gọt vỏ thái vát', amount: 1, unit: 'quả (200g)', category: 'rau-cu' },
      { name: 'Mắm tôm Bắc chai thủy tinh', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Gia vị: Muối hạt, hạt nêm', amount: 1.5, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Giã lọc nước cua',
        durationMinutes: 8,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho cua xay vào âu cùng 1.2 lít nước lọc và 1/2 muỗng cà phê muối hạt, dùng tay bóp kỹ để thịt cua tan đều vào nước. Rót qua rây lọc lấy nước trong, lặp lại lần 2 để vắt kiệt phần thịt cua còn đọng lại trong bã vỏ.',
        tip: 'Thêm một nhúm muối khi lọc giúp các phân tử protein cua kết tụ thành từng mảng rêu dày dặn.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Rau mồng tơi nhặt lá non, rửa sạch ngâm nước muối loãng 5 phút rồi thái khúc 2cm. Mướp hương gọt vỏ, khía vát mỏng. Hòa 1 muỗng cà phê mắm tôm Bắc với 2 muỗng nước lọc, gạn bỏ cặn để chuẩn bị nêm nước dùng.',
        tip: 'Mắm tôm Bắc là bí quyết tạo nên chiều sâu hương vị ngọt đậm đà đặc trưng của canh cua đồng.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 6,
        heatLevel: 'lửa nhỏ',
        content: 'Đổ nước cua vào nồi đun trên lửa vừa, dùng đũa khuấy nhẹ đáy nồi theo một chiều để cua không bén đáy. Khi nước bắt đầu bốc khói và mảng rêu cua nổi dần lên mặt thì ngừng khuấy, hạ lửa nhỏ riu riu để rêu cua kết mảng dày chắc. Khéo léo vớt mảng rêu cua ra bát riêng.',
        tip: 'Không để nước cua sôi bùng trào vì bọt sôi mạnh sẽ làm vỡ tan mảng rêu cua béo ngậy.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 3,
        heatLevel: 'lửa lớn',
        content: 'Thêm mắm tôm đã hòa tan, 1 muỗng cà phê hạt nêm vào nồi nước cua đang sôi. Thả mướp hương và rau mồng tơi vào nấu chín trong 2 phút trên lửa vừa. Múc canh và rau ra bát to, nhẹ nhàng đặt mảng rêu cua lên trên, ăn kèm cà pháo muối giòn.',
        tip: 'Không đậy vung sau khi cho rau mồng tơi để rau giữ trọn màu xanh mướt mọng nước.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Chưng gạch cua riêng với chút hành khô phi thơm và dầu màu điều, khi múc canh ra bát thì rưới gạch cua vàng óng lên trên tảng rêu cua để bát canh vừa thơm nức mũi vừa có màu sắc hấp dẫn chuẩn cơm mẹ nấu.',
    tags: ['Món Canh', 'Giải Nhiệt', 'Đặc Sản', 'Miền Bắc', 'Mùa Hè']
  },
  {
    id: 'rau-muong-luoc-sau',
    title: 'Rau Muống Luộc Dầm Sấu',
    description: 'Đĩa rau muống xanh mướt giòn sần sật, bát nước luộc dầm sấu chua thanh giải nhiệt mùa hè miền Bắc.',
    category: 'mon-rau',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 4,
    calories: 80,
    estimatedCostVnd: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Rau muống ngọn non cọng nhỏ', amount: 1, unit: 'bó (500g)', category: 'rau-cu' },
      { name: 'Quả sấu tươi cạo vỏ', amount: 4, unit: 'quả', category: 'rau-cu' },
      { name: 'Muối hạt tinh khiết', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Nước mắm chấm tỏi ớt', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Nhặt rau sạch',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Rau muống nhặt ngọn non, bỏ bớt lá già gốc cỗi, ngắt đoạn dài cỡ ngón tay. Rửa sạch qua 3 lần nước, ngâm nước muối loãng 5 phút rồi vớt ra rổ xốc thật ráo nước. Quả sấu tươi cạo sạch vỏ xanh, khía vài đường quanh thân quả.',
        tip: 'Cạo sạch vỏ sấu trước khi luộc giúp nước luộc có vị chua thanh dịu mà không bị chát nhựa.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Pha sẵn bát nước chấm: 2 muỗng canh nước mắm truyền thống, 1 muỗng cà phê đường, tỏi ớt băm nhỏ và vài giọt nước cốt chanh. Chuẩn bị sẵn một âu nước đá lạnh tinh khiết để sốc nhiệt cho rau.',
        tip: 'Chuẩn bị trước nước chấm và âu nước đá giúp các thao tác luộc rau diễn ra liên tục, chuẩn xác.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 4,
        heatLevel: 'lửa lớn',
        content: 'Đun sôi bùng 1.5 lít nước với 1 muỗng cà phê muối hạt trên lửa lớn. Thả rau muống vào dìm ngập nước thật nhanh tay, luộc mở vung trên lửa lớn trong 2-3 phút cho cọng rau chín tới. Vớt ngay rau ra ngâm vào âu nước đá lạnh 1 phút rồi gắp ra đĩa dàn phẳng.',
        tip: 'Luộc ngập nhiều nước trên lửa lớn và sốc nước đá lạnh giúp diệp lục không bị biến tính, rau giữ màu xanh biếc.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 3,
        heatLevel: 'lửa vừa',
        content: 'Thả 4 quả sấu vào nồi nước luộc rau đang sôi, đun 3-4 phút cho sấu chín mềm. Vớt sấu ra bát con dầm nát, gạn lấy nước cốt chua thanh đổ lại nồi nước luộc, nêm chút hạt nêm cho vừa miệng rồi múc ra bát to thưởng thức.',
        tip: 'Dầm sấu bằng bát riêng rồi gạn nước chua giúp điều chỉnh độ chua chuẩn xác theo khẩu vị gia đình.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Nguyên tắc vàng luộc rau: (1) Nước nhiều gấp 3 lần rau; (2) Luôn cho muối hạt; (3) Mở vung tuyệt đối; (4) Vớt ra dàn phẳng mặt đĩa không vun ngọn để hơi nóng không ủ úa rau bên trong.',
    tags: ['Món Rau', 'Dễ Làm', 'Giảm Béo', 'Miền Bắc', 'Mùa Hè']
  },

  // --- MIỀN NAM ---
  {
    id: 'thit-kho-tau-trung-vit',
    title: 'Thịt Kho Tàu Trứng Vịt Dừa Tươi',
    description: 'Thịt ba chỉ rút sườn kho mềm rục béo ngậy trong nước dừa xiêm thanh ngọt, trứng vịt thấm đượm màu cánh gián hổ phách bóng bẩy chuẩn phong vị Tết Nam Bộ.',
    category: 'mon-man',
    region: 'nam',
    prepTimeMinutes: 20,
    cookTimeMinutes: 50,
    servings: 4,
    calories: 520,
    estimatedCostVnd: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Thịt ba chỉ rút sườn (hoặc thịt nách bì mỏng)', amount: 600, unit: 'g', category: 'thit-ca' },
      { name: 'Trứng vịt tươi', amount: 5, unit: 'quả', category: 'thit-ca' },
      { name: 'Nước dừa xiêm tươi ngọt', amount: 500, unit: 'ml', category: 'do-kho' },
      { name: 'Nước mắm cá cơm truyền thống (40 độ đạm)', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Đường thốt nốt (hoặc đường phèn nâu)', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Nước màu dừa Bến Tre nguyên chất', amount: 0.5, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Hành tím khô & tỏi ta', amount: 3, unit: 'củ', category: 'rau-cu' },
      { name: 'Tiêu sọ xay & ớt hiểm nguyên trái', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Khử hôi bì thịt',
        durationMinutes: 8,
        heatLevel: 'không dùng nhiệt',
        content: 'Thịt ba chỉ cạo sạch lông bì, ngâm rửa với nước muối loãng pha chút giấm. Đun sôi nồi nước với 1 củ hành tím đập dập, chần thịt trong 2-3 phút để thải hết bọt bẩn và máu đọng. Vớt ra xả ngay dưới vòi nước lạnh, thấm thật khô rồi cắt khối vuông dày dặn cỡ bao diêm (khoảng 3.5 x 3.5cm).',
        tip: 'Không thái thịt quá mỏng vì khi kho nhừ mỡ sẽ tan chảy làm miếng thịt bị quắt và nát.'
      },
      {
        step: 2,
        title: 'Ướp gia vị ngấm sâu',
        durationMinutes: 30,
        heatLevel: 'không dùng nhiệt',
        content: 'Hành tỏi giã nhuyễn vắt lấy nước cốt để ướp (giữ lại bã phi sau để kho không bị cháy đen cặn). Ướp thịt với 3 muỗng canh nước mắm, 1 muỗng canh đường thốt nốt, 1/2 muỗng cà phê hạt nêm, 1/2 muỗng tiêu và 1/2 muỗng cà phê nước màu dừa. Trộn đều và để thấm tối thiểu 30-40 phút ở nhiệt độ phòng (nếu có nắng, hong thịt 20 phút cho mỡ trong veo).',
        tip: 'Ướp bằng đường thốt nốt giúp thịt mềm thanh dịu và mỡ heo có độ trong veo óng ánh sau khi kho.'
      },
      {
        step: 3,
        title: 'Đảo săn & Kho riu riu nước dừa',
        durationMinutes: 35,
        heatLevel: 'riu riu',
        content: 'Cho thịt vào nồi đảo trên lửa vừa 3-4 phút cho săn chắc các mặt và tiết bớt mỡ. Đổ 500ml nước dừa xiêm vào ngập thịt, tăng lửa lớn đun sôi bùng, dùng muôi hớt sạch bọt trắng. Sau đó, hạ lửa nhỏ riu riu, không đậy nắp vung để nước dừa không bị chua đỏ. Kho riu riu 35 phút cho thịt mềm 70%, sau đó thả trứng vịt đã luộc bóc vỏ vào kho tiếp 15 phút.',
        tip: 'Tuyệt đối không đậy kín nắp vung khi đun nước dừa vì hơi nước bí lại sẽ làm nước kho bị đục ngầu và chua.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện sắc sốt',
        durationMinutes: 5,
        heatLevel: 'lửa nhỏ',
        content: 'Khi nước dừa cạn rút còn 1/3, ngả màu hổ phách nâu đỏ sánh nhẹ và bao quanh từng miếng thịt mềm rục, nếm lại vị ngọt mặn hài hòa. Thả 3 quả ớt hiểm nguyên cuống và rắc nhẹ chút tiêu sọ xay lên trên, tắt bếp để nguội nhẹ 5 phút trước khi thưởng thức.',
        tip: 'Dùng tăm xăm nhẹ vài lỗ li ti quanh lòng trắng trứng trước khi kho giúp trứng thấm đậm màu mà không bị dai cứng lòng đỏ.'
      }
    ],
    chefTip: 'Bí quyết vàng của đầu bếp Nam Bộ: Hãy đậy một tờ giấy nến có khoét lỗ tròn nhỏ ở giữa (drop-lid / otoshibuta) trực tiếp lên bề mặt nồi thịt khi kho. Giấy nến sẽ tự động hút sạch váng mỡ dư thừa, đồng thời đối lưu dòng nước dừa sôi nhẹ tuần hoàn đều trên bề mặt, giúp thịt mềm tan mà bì vẫn dẻo giòn, nước kho trong vắt như gương!',
    tags: ['Món Mặn', 'Truyền Thống', 'Đặc Sản Nam Bộ', 'Cơm Mẹ Nấu', 'Tết Cổ Truyền']
  },
  {
    id: 'canh-chua-ca-hu',
    title: 'Canh Chua Cá Hú Bạc Hà Thơm Mát Chuẩn Vị',
    description: 'Bát canh chua bốc khói nghi ngút với khúc cá hú béo ngậy ngọt lịm, nước canh chua dịu từ me dầm và dứa chín, hòa quyện bạc hà giòn sần sật và thơm nức tỏi phi.',
    category: 'mon-canh',
    region: 'nam',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 230,
    estimatedCostVnd: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Cá hú (hoặc cá lóc) cắt khúc dày', amount: 450, unit: 'g', category: 'thit-ca' },
      { name: 'Bạc hà (Dọc mùng)', amount: 2, unit: 'cây', category: 'rau-cu' },
      { name: 'Dứa (Thơm) chín gọt sạch mắt', amount: 0.25, unit: 'quả', category: 'rau-cu' },
      { name: 'Cà chua chín đỏ mọng', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Đậu bắp non', amount: 5, unit: 'trái', category: 'rau-cu' },
      { name: 'Giá đỗ tươi rửa sạch', amount: 100, unit: 'g', category: 'rau-cu' },
      { name: 'Me chua vắt nấu canh', amount: 50, unit: 'g', category: 'gia-vi' },
      { name: 'Rau ngổ (ngò om) & Ngò gai', amount: 1, unit: 'bó nhỏ', category: 'rau-cu' },
      { name: 'Tỏi ta băm phi vàng & ớt sừng', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Gia vị: Nước mắm ngon, đường phèn, muối', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế cá & Bóp muối bạc hà chống ngứa',
        durationMinutes: 8,
        heatLevel: 'không dùng nhiệt',
        content: 'Cá rửa sạch nhớt bằng nước cốt chanh và muối hạt, bỏ sạch màng đen trong khoang bụng rồi thấm khô. Bạc hà tước vỏ xơ, cắt lát xéo dày 1cm; cho 1 muỗng canh muối hạt vào bóp kỹ trong 2 phút cho bạc hà xẹp nước ngứa, sau đó xả sạch qua 3 lần nước lạnh rồi vắt thật kiệt nước. Dứa cắt lát tam giác, cà chua bổ múi cau, đậu bắp cắt lát xéo, ngò gai ngò om cắt nhỏ.',
        tip: 'Bóp muối và vắt thật kiệt nước bạc hà đảm bảo 100% không bị ngứa ran cổ họng khi thưởng thức canh.'
      },
      {
        step: 2,
        title: 'Ướp nhẹ & Áp chảo thơm tỏi khử tanh',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Ướp khúc cá với 1 muỗng canh nước mắm ngon, 1/3 muỗng muối, chút tiêu và đầu hành băm trong 10 phút. Phi thơm vàng 1 muỗng tỏi băm với dầu ăn rồi vớt 1/2 tỏi phi vàng ra chén để riêng. Cho cá vào chảo dầu tỏi áp chảo nhanh 1 phút mỗi mặt cho thớ cá săn lại và thơm ngát hương tỏi, không bị nát hay tanh khi nấu canh.',
        tip: 'Áp chảo sơ cá với dầu tỏi phi là bí quyết sống còn giúp cá nước ngọt không bị tanh và không tan nát thịt.'
      },
      {
        step: 3,
        title: 'Nấu nước dùng chua ngọt & Canh chín tầng lớp',
        durationMinutes: 8,
        heatLevel: 'lửa vừa',
        content: 'Đun sôi 1.2 lít nước trên lửa lớn. Cho me chín vào rây dầm lấy nước cốt chua thanh vào nồi. Cho dứa và 1/2 lượng cà chua vào nấu sôi 2 phút tạo màu đẹp. Thả cá đã áp chảo vào, hạ lửa vừa đun 5-6 phút cho cá chín tới (hớt sạch bọt). Tiếp tục cho đậu bắp và bạc hà vào đun 2 phút, cuối cùng cho giá đỗ và phần cà chua còn lại đun sôi bùng đúng 30 giây rồi tắt bếp.',
        tip: 'Cho rau củ theo đúng thứ tự thời gian chín giúp đậu bắp không bị nhớt, bạc hà giữ độ giòn sần sật.'
      },
      {
        step: 4,
        title: 'Nêm nếm cân bằng vị giác & Hoàn thiện',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Nêm vào nồi: 2 muỗng canh đường phèn, 2.5 muỗng canh nước mắm ngon, 1/2 muỗng cà phê muối cho vị chua ngọt dịu hài hòa. Múc cá và rau củ ra tô lớn, chan ngập nước canh trong vắt. Rắc ngập rau ngổ, ngò gai thái nhỏ, vài lát ớt hiểm và rưới 1 muỗng canh tỏi phi vàng giòn lên trên cùng.',
        tip: 'Lớp tỏi phi vàng rưới mặt cùng tinh dầu rau ngổ chính là nốt hương tinh hoa triệt tiêu mọi mùi tanh của cá.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Nước canh chua Nam Bộ bắt buộc phải dùng đường phèn để tạo vị ngọt hậu thanh tao không gắt cổ. Hãy nêm nước mắm cốt sau khi tắt bếp một chút để giữ trọn vẹn hương thơm nồng nàn của mắm mà không bị chua gắt do đun sôi lâu.',
    tags: ['Món Canh', 'Chua Ngọt', 'Đặc Sản Nam Bộ', 'Giải Nhiệt', 'Cơm Gia Đình']
  },
  {
    id: 'dua-gia-bop-xoi',
    title: 'Dưa Giá Bóp Xổi Chần Chanh',
    description: 'Món kèm ngâm chua giòn ngọt chống ngấy cực đỉnh cho mâm cơm thịt kho tàu và các món chiên rán.',
    category: 'mon-rau',
    region: 'nam',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 45,
    estimatedCostVnd: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Giá đỗ tươi thân mập', amount: 350, unit: 'g', category: 'rau-cu' },
      { name: 'Cà rốt tươi bào sợi mỏng', amount: 1, unit: 'củ nhỏ (80g)', category: 'rau-cu' },
      { name: 'Hẹ lá xanh non cắt khúc', amount: 60, unit: 'g', category: 'rau-cu' },
      { name: 'Ớt sừng đỏ thái sợi chỉ', amount: 1, unit: 'trái', category: 'rau-cu' },
      { name: 'Nước cốt chanh tươi & Giấm gạo', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Đường cát trắng & Muối tinh', amount: 2.5, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Làm sạch giá hẹ',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Giá đỗ nhặt bỏ vỏ đậu và rễ thâm, rửa nhẹ tay qua nước lạnh tránh gãy giập, vớt ra rổ để ráo. Hẹ rửa sạch cắt khúc 4cm tương đương cọng giá. Cà rốt gọt vỏ bào sợi mỏng. Ớt sừng bỏ hạt thái sợi chỉ mỏng.',
        tip: 'Rửa giá thật nhẹ tay và để ráo nước hoàn toàn để dưa giá giữ được độ giòn rụm không bị ủng nước.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Pha nước ngâm chua ngọt: hòa tan 150ml nước đun sôi để nguội với 2 muỗng canh giấm gạo, 1 muỗng canh nước cốt chanh, 2.5 muỗng canh đường và 1 muỗng cà phê muối tinh, khuấy cho tan hoàn toàn.',
        tip: 'Tỉ lệ nước chua ngọt cân bằng giúp giá ngấm vị nhanh mà vẫn giữ nguyên màu trắng tinh khiết.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 10,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho giá đỗ, hẹ, cà rốt và ớt sừng vào âu sạch, trộn đều nhẹ tay. Rưới hỗn hợp nước ngâm chua ngọt vào đảo đều, dùng tay bóp thật nhẹ trong 1 phút cho ngấm đều các mặt.',
        tip: 'Bóp thật nhẹ tay, không vò mạnh làm giá bị dập nát tiết nhiều nước chua.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 10,
        heatLevel: 'không dùng nhiệt',
        content: 'Để dưa giá nghỉ trong 15-20 phút cho thấm gia vị giòn tan. Khi ăn, gắp dưa giá ra đĩa có lót lá xà lách, chấm kèm nước kho thịt hoặc mắm ớt cay nồng.',
        tip: 'Dưa giá ngon nhất khi dùng ngay trong ngày, nếu muốn để lâu hãy bảo quản ngăn mát tủ lạnh.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Thêm nước cốt chanh vào cùng giấm gạo giúp dưa giá trắng muốt, khử sạch mùi ngái của giá sống và thơm ngát hương tinh dầu chanh tươi tự nhiên.',
    tags: ['Món Rau', 'Gợi Vị', 'Miền Nam', 'Chua Ngọt', 'Dễ Làm']
  },

  // --- MIỀN TRUNG ---
  {
    id: 'ca-nuc-kho-tieu',
    title: 'Cá Nục Kho Tiêu Ớt Hiểm Miền Trung',
    description: 'Cá nục chuối tươi kho rục xương đậm đà, vị cay nồng nàn của tiêu đen và ớt hiểm quyện cùng tóp mỡ béo ngậy.',
    category: 'mon-man',
    region: 'trung',
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
    servings: 4,
    calories: 380,
    estimatedCostVnd: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Cá nục chuối tươi làm sạch', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Tiêu sọ đập dập & tiêu xay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Ớt hiểm cay nguyên trái', amount: 5, unit: 'quả', category: 'rau-cu' },
      { name: 'Nước mắm nhĩ truyền thống', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Đường phèn hoặc đường mía', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Mỡ heo & tóp mỡ giòn', amount: 50, unit: 'g', category: 'thit-ca' },
      { name: 'Hành tím khô băm nhỏ', amount: 3, unit: 'củ', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Khử tanh cá biển',
        durationMinutes: 8,
        heatLevel: 'không dùng nhiệt',
        content: 'Cá nục mổ bụng bỏ mang, ruột và cạo sạch màng đen trong bụng. Rửa cá với nước muối pha rượu trắng hoặc gừng đập dập để tẩy sạch mùi tanh biển, sau đó dùng khăn bếp thấm thật khô từng con cá.',
        tip: 'Thấm khô ráo mình cá trước khi ướp là yếu tố quyết định để thớ thịt cá kho săn chắc, không tanh.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 20,
        heatLevel: 'không dùng nhiệt',
        content: 'Ướp cá nục với 3 muỗng canh nước mắm nhĩ, 1 muỗng canh đường phèn, 1 muỗng canh tiêu sọ đập dập, hành tím băm và ớt hiểm đập dập. Để thấm trong 20-30 phút cho gia vị ngấm sâu vào từng thớ thịt cá.',
        tip: 'Ướp cá cùng tiêu sọ đập dập giúp tinh dầu tiêu tỏa hương thơm cay ấm nồng ngấm từ trong ra ngoài.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 30,
        heatLevel: 'riu riu',
        content: 'Cho 1 muỗng mỡ heo và đường vào nồi đất thắng nước màu cánh gián. Xếp cá vào nồi đun trên lửa vừa 3 phút cho thịt cá săn co lại. Đổ nước ướp cá và châm thêm 1/2 chén nước sôi nóng ngập ngang thân cá. Đun sôi bùng hạ lửa nhỏ liu riu kho trong 25-30 phút.',
        tip: 'Kho cá biển bắt buộc phải châm nước sôi nóng, tuyệt đối không châm nước lạnh làm cá bị tanh bở.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Khi nước kho rút cạn sền sệt sánh nâu óng, thả tóp mỡ giòn rụm và rắc phần tiêu xay còn lại lên mặt cá. Nêm lại vị mặn ngọt đậm đà cay nồng đặc trưng miền Trung. Đun thêm 2 phút cho tóp mỡ ngấm sốt rồi tắt bếp.',
        tip: 'Thêm tóp mỡ và rắc tiêu xay lúc chuẩn bị tắt bếp giúp tóp mỡ giòn bùi và giữ trọn hương tiêu ấm.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Kho cá nục 2 lửa (kho lần 1 để nguội rồi kho lại lần 2 liu riu) sẽ làm xương cá mềm rục, thịt cá săn chắc dẻo quánh, ăn vào những ngày mưa lạnh cùng cơm nóng thì không gì sánh bằng.',
    tags: ['Món Mặn', 'Cay Nồng', 'Miền Trung', 'Cá Kho', 'Hao Cơm']
  },
  {
    id: 'canh-ngao-nau-chua',
    title: 'Canh Ngao Nấu Chua Thì Là',
    description: 'Vị ngọt thanh tự nhiên của ngao biển kết hợp dứa chua, cà chua đỏ mọng và thơm nồng thì là hành hoa.',
    category: 'mon-canh',
    region: 'trung',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 160,
    estimatedCostVnd: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Ngao (nghêu) sống sạch cát', amount: 1, unit: 'kg', category: 'thit-ca' },
      { name: 'Cà chua chín đỏ mọng', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Dứa (thơm) chín', amount: 0.25, unit: 'quả', category: 'rau-cu' },
      { name: 'Rau thì là & Hành lá', amount: 1, unit: 'bó nhỏ (50g)', category: 'rau-cu' },
      { name: 'Hành khô băm nhỏ', amount: 2, unit: 'củ', category: 'rau-cu' },
      { name: 'Gia vị: Nước mắm, hạt nêm, muối', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Luộc ngao lấy nước ngọt',
        durationMinutes: 10,
        heatLevel: 'lửa lớn',
        content: 'Ngao ngâm nước có cắt vài lát ớt trong 30 phút để nhả sạch cát, cọ rửa sạch vỏ. Cho ngao vào nồi cùng 1 lít nước, đun sôi trên lửa lớn đến khi ngao vừa mở miệng thì vớt ngay ra. Gỡ lấy ruột ngao, nặn bỏ phần phân đen rồi rửa sạch. Nước luộc ngao để lắng rồi gạn lấy phần nước trong vắt.',
        tip: 'Vớt ngao ngay khi vừa mở miệng để thịt ngao béo múp, không bị teo khô và dai.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Ướp phần thịt ngao với 1 muỗng cà phê nước mắm ngon và 1/2 muỗng tiêu xay cho ngấm vị đậm đà. Cà chua bổ múi cau, dứa cắt lát tam giác mỏng, thì là và hành hoa rửa sạch thái nhỏ khúc 2cm.',
        tip: 'Ướp nhẹ thịt ngao với chút nước mắm giúp ruột ngao thơm ngon và đậm đà hơn khi cho vào canh.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Phi thơm hành khô với 1 muỗng canh dầu ăn, cho 1/2 lượng cà chua vào xào chín mềm tạo màu đỏ tự nhiên. Trút phần thịt ngao vào xào nhanh 1 phút cho thơm rồi trút ra bát. Đổ phần nước luộc ngao trong vào nồi đun sôi bùng, thả dứa và phần cà chua còn lại vào đun 2 phút.',
        tip: 'Xào nhanh thịt ngao rồi trút ra giúp ngao không bị dai cứng do đun sôi lâu trong nước canh.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 2,
        heatLevel: 'lửa lớn',
        content: 'Thả thịt ngao đã xào vào lại nồi canh, nêm 1 muỗng canh nước mắm ngon và 1/2 muỗng hạt nêm cho vị chua ngọt thanh mát hài hòa. Cho toàn bộ thì là và hành hoa cắt nhỏ vào nồi đun sôi bùng 10 giây rồi tắt bếp ngay, múc ra tô lớn.',
        tip: 'Thì là cho vào cuối cùng và tắt bếp ngay để giữ trọn vẹn hương thơm thảo mộc và màu xanh tươi.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Nước luộc ngao bản chất đã có vị mặn tự nhiên, hãy nếm nước canh trước khi nêm thêm muối hoặc mắm để canh giữ trọn vẹn vị ngọt thanh thanh, mát lành giải nhiệt.',
    tags: ['Món Canh', 'Ngọt Thanh', 'Miền Trung', 'Hải Sản', 'Giải Nhiệt']
  },
  {
    id: 'rau-lang-xao-toi',
    title: 'Rau Lang Xào Tỏi Cháy',
    description: 'Rau lang đọt non xanh mướt xào tỏi đập dập lửa lớn thơm phức, cọng rau giòn ngọt thoang thoảng khói chảo.',
    category: 'mon-rau',
    region: 'trung',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 110,
    estimatedCostVnd: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Đọt rau lang non tươi', amount: 1, unit: 'bó (400g)', category: 'rau-cu' },
      { name: 'Tỏi Lý Sơn đập dập', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Dầu ăn hoặc mỡ heo', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Dầu hào & Nước mắm ngon', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Muối hạt tinh khiết', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Nhặt đọt non',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Rau lang ngắt lấy đọt non và lá bánh tẻ, tước nhẹ lớp xơ ở cuống già. Rửa sạch qua 3 lần nước, ngâm nước muối loãng 5 phút rồi vớt ra rổ xốc thật ráo nước. Tỏi bóc vỏ, 1/2 đập dập xém mặt, 1/2 băm nhỏ.',
        tip: 'Rau lang phải để thật ráo nước trước khi xào để chảo không bị hạ nhiệt độ đột ngột.'
      },
      {
        step: 2,
        title: 'Chần sơ sốc nhiệt đá lạnh',
        durationMinutes: 2,
        heatLevel: 'lửa lớn',
        content: 'Đun sôi 1.5 lít nước với 1 muỗng cà phê muối hạt trên lửa lớn. Thả rau lang vào chần nhanh trong 30 giây cho rau vừa tái và xanh mướt. Vớt ra thả ngay vào âu nước đá lạnh 1 phút rồi gắp ra để ráo hoàn toàn.',
        tip: 'Chần nước sôi rồi sốc đá lạnh giúp rau lang không bị thâm đen và giữ độ giòn sần sật mướt mắt.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 2,
        heatLevel: 'lửa lớn',
        content: 'Làm nóng chảo trên lửa lớn hết cỡ với 2 muỗng canh dầu ăn (hoặc mỡ heo). Cho phần tỏi đập dập vào phi 15 giây cho dậy mùi thơm xém vàng. Trút toàn bộ rau lang đã ráo vào đảo thật nhanh tay trên lửa cực lớn.',
        tip: 'Xào trên lửa lớn nhất giúp hơi nước bốc nhanh, rau ngấm mỡ bóng bẩy mà không bị chảy nước ỉu xìu.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 1,
        heatLevel: 'lửa lớn',
        content: 'Nêm nhanh 1 muỗng canh dầu hào, 1/2 muỗng cà phê hạt nêm. Rưới 1 muỗng cà phê nước mắm quanh thành mép chảo nóng để tạo khói thơm Wok Hei. Cho phần tỏi băm còn lại vào đảo đều 10 giây rồi trút ngay ra đĩa phẳng.',
        tip: 'Rắc tỏi băm tươi ở giây cuối cùng giúp món rau bùng nổ hương thơm nồng nàn.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Rau lang chứa nhiều mủ nhựa dễ làm xỉn màu món ăn. Thêm chút muối hạt khi chần và xào với lửa lớn trong vòng dưới 2 phút sẽ giữ đĩa rau xanh mướt như ngọc bích.',
    tags: ['Món Rau', 'Nhanh Gọn', 'Miền Trung', 'Dễ Làm', 'Thanh Mát']
  },

  // --- MÓN CHAY ---
  {
    id: 'dau-hu-chien-sa-ot',
    title: 'Đậu Hũ Chiên Sả Ớt Giòn Rụm',
    description: 'Đậu hũ chiên vàng giòn bên ngoài, bên trong mềm mịn béo bùi, bọc lớp sả ớt phi vàng thơm cay nồng nàn.',
    category: 'mon-chay',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 280,
    estimatedCostVnd: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Đậu hũ trắng tươi nguyên miếng', amount: 4, unit: 'miếng (500g)', category: 'thit-ca' },
      { name: 'Sả cây tươi băm nhuyễn', amount: 4, unit: 'cây', category: 'rau-cu' },
      { name: 'Ớt hiểm băm & ớt bột', amount: 1.5, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Nước tương đậm đặc & Hạt nêm chay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Dầu ăn thực vật', amount: 4, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Thấm khô đậu hũ',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Đậu hũ rửa nhẹ qua nước ấm, dùng khăn giấy nhà bếp thấm thật khô ráo toàn bộ các mặt. Khía các đường ca-rô nông trên bề mặt hoặc cắt miếng vuông dày 2.5cm để gia vị dễ ngấm.',
        tip: 'Thấm khô ráo nước bề mặt đậu giúp khi chiên dầu không bị bắn nổ và vỏ đậu nhanh giòn xốp.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Trộn đều sả băm, ớt băm cùng 1 muỗng cà phê hạt nêm chay, 1/2 muỗng cà phê đường, 1/2 muỗng bột nghệ để tạo màu vàng óng. Nhẹ nhàng xát một lớp mỏng hỗn hợp sả ớt vào các đường khía của đậu hũ.',
        tip: 'Bột nghệ giúp lớp sả ớt sau khi chiên có màu vàng ươm bắt mắt tự nhiên.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 8,
        heatLevel: 'lửa vừa',
        content: 'Làm nóng chảo với dầu ăn trên lửa vừa. Cho đậu hũ vào chiên vàng giòn đều 4 mặt trong khoảng 6-8 phút. Khi lớp vỏ ngoài vàng rụm, vớt đậu ra đĩa có lót giấy thấm dầu.',
        tip: 'Không lật trở đậu quá nhiều lần khi mặt dưới chưa se cứng giòn để tránh làm nát vỡ đậu.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 3,
        heatLevel: 'lửa nhỏ',
        content: 'Chắt bớt dầu trong chảo, cho phần sả ớt còn lại vào phi trên lửa nhỏ 1-2 phút cho sả vàng giòn thơm nức mũi. Nêm 1 muỗng canh nước tương đảo đều rồi trút toàn bộ lớp sả ớt vàng giòn phủ lên từng miếng đậu hũ nóng hổi.',
        tip: 'Phi sả ớt trên lửa nhỏ để sả giòn rụm mà không bị đắng hay cháy khét.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Chiên đậu hũ trước cho vàng giòn rồi mới phi sả ớt rưới lên mặt sau, không chiên đậu chung với sả từ đầu vì sả sẽ bị cháy khét đen trước khi đậu kịp giòn vỏ.',
    tags: ['Món Chay', 'Nhanh Gọn', 'Giòn Rụm', 'Dễ Làm', 'Cơm Gia Đình']
  },
  {
    id: 'canh-nam-hat-sen',
    title: 'Canh Nấm Hạt Sen Thanh Tịnh',
    description: 'Canh nấm tươi thập cẩm cùng hạt sen bùi béo mang lại sự thanh tịnh cho tâm hồn, bồi bổ sức khỏe cho cả gia đình.',
    category: 'mon-chay',
    region: 'toan-quoc',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 160,
    estimatedCostVnd: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Hạt sen tươi thông tâm', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Nấm đùi gà baby & Nấm rơm tươi', amount: 200, unit: 'g', category: 'rau-cu' },
      { name: 'Nấm hương tươi (hoặc nấm đông cô)', amount: 6, unit: 'tai', category: 'rau-cu' },
      { name: 'Cà rốt tỉa hoa', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Ngò rí & Tiêu trắng xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Hạt nêm chay nấm hương & Muối', amount: 1.5, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Làm sạch nấm hạt sen',
        durationMinutes: 8,
        heatLevel: 'không dùng nhiệt',
        content: 'Hạt sen tươi rửa sạch, kiểm tra bỏ sạch tâm sen để canh không bị đắng. Nấm rơm cạo sạch chân nấm, ngâm nước muối loãng 5 phút. Nấm đùi gà và nấm hương rửa sạch cắt miếng vừa ăn. Cà rốt gọt vỏ, tỉa hoa cắt lát dày 0.5cm.',
        tip: 'Rút sạch tâm sen xanh để nước canh có vị ngọt bùi thanh tao trọn vẹn.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Ướp nhẹ các loại nấm tươi với 1/2 muỗng cà phê hạt nêm chay và vài giọt dầu mè thơm trong 5 phút để nấm đậm đà và dậy mùi thơm tự nhiên.',
        tip: 'Vài giọt dầu mè giúp nấm dậy mùi hương đặc trưng hấp dẫn khi nấu canh.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 15,
        heatLevel: 'lửa vừa',
        content: 'Cho 1.2 lít nước vào nồi cùng hạt sen tươi đun sôi trên lửa vừa. Khi nước sôi, hạ lửa nhỏ ninh trong 12-15 phút cho hạt sen chín mềm bở tơi. Cho cà rốt và các loại nấm vào nấu tiếp 5 phút trên lửa vừa cho nấm chín ngọt nước.',
        tip: 'Ninh hạt sen trước trên lửa nhỏ để hạt sen mềm bùi mà không bị vỡ nát làm đục nước canh.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện',
        durationMinutes: 2,
        heatLevel: 'lửa nhỏ',
        content: 'Nêm 1 muỗng canh hạt nêm chay nấm hương và 1/2 muỗng cà phê muối cho vừa miệng ngọt thanh. Múc canh ra tô lớn, rắc ngò rí cắt nhỏ và chút tiêu trắng xay lên trên.',
        tip: 'Tiêu trắng xay hòa quyện vị nấm tạo cảm giác ấm bụng dễ chịu cho món canh chay thanh tịnh.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Không đun nấm quá lâu vì nấm sẽ tiết nhớt và mất độ giòn ngọt tự nhiên. Luôn cho nấm vào sau khi hạt sen đã chín mềm để bát canh giữ được độ trong veo và ngọt lịm.',
    tags: ['Món Chay', 'Bổ Dưỡng', 'Thanh Mát', 'Hạt Sen', 'Cơm Chay']
  },
  {
    id: 'rau-cu-luoc-kho-quet-chay',
    title: 'Rau Củ Luộc Kho Quẹt Chay',
    description: 'Đĩa rau củ luộc ngũ sắc thập cẩm giòn ngọt chấm sốt kho quẹt chay mặn ngọt béo ngậy từ nấm hương, mộc nhĩ và đậu hũ.',
    category: 'mon-chay',
    region: 'toan-quoc',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 140,
    estimatedCostVnd: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cà rốt, súp lơ xanh, bầu non, đậu bắp', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Đậu hũ chiên cắt hạt lựu nhỏ (tóp mỡ chay)', amount: 80, unit: 'g', category: 'thit-ca' },
      { name: 'Nấm hương khô ngâm nở cắt nhỏ', amount: 5, unit: 'tai', category: 'rau-cu' },
      { name: 'Nước tương đậm đặc & Đường thốt nốt', amount: 3.5, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Tiêu xanh nguyên hạt & Tiêu sọ xay', amount: 1.5, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Ớt hiểm băm nhỏ & Hành boa-rô', amount: 2, unit: 'muỗng canh', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Cắt tỉa rau củ ngũ sắc',
        durationMinutes: 8,
        heatLevel: 'không dùng nhiệt',
        content: 'Bầu gọt vỏ cắt thanh dài, súp lơ cắt miếng nhỏ vừa ăn, cà rốt tỉa hoa, đậu bắp cắt bỏ cuống. Rửa sạch ngâm nước muối loãng 5 phút rồi để ráo. Đậu hũ cắt hạt lựu chiên vàng giòn rụm làm tóp mỡ chay. Nấm hương ngâm mềm vắt ráo băm nhỏ.',
        tip: 'Cắt các loại rau củ có kích thước đồng đều để khi luộc các loại rau chín đều cùng một thời điểm.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Pha hỗn hợp sốt kho quẹt: 3 muỗng canh nước tương ngon, 1.5 muỗng canh đường thốt nốt, 2 muỗng canh nước lọc và 1/2 muỗng cà phê hạt nêm chay, khuấy tan đều.',
        tip: 'Đường thốt nốt giúp sốt kho quẹt có màu nâu hổ phách cánh gián và độ dẻo quánh tự nhiên.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa',
        durationMinutes: 6,
        heatLevel: 'lửa vừa',
        content: 'Đun sôi nồi nước với chút muối, lần lượt luộc rau củ: cho cà rốt và súp lơ vào trước 2 phút, tiếp tục cho bầu và đậu bắp vào luộc 1.5 phút. Vớt ra ngâm nhanh nước đá rồi xếp đẹp mắt quanh đĩa lớn.',
        tip: 'Luộc theo thứ tự độ cứng của rau củ giúp tất cả giữ được độ giòn ngọt mọng nước.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện sốt kho quẹt',
        durationMinutes: 5,
        heatLevel: 'lửa nhỏ',
        content: 'Phi thơm hành boa-rô với chút dầu trong tộ nhỏ, cho nấm hương vào xào săn thơm. Đổ bát nước sốt vào đun sôi hạ lửa liu riu cho sốt keo đặc lại. Thả đậu hũ tóp mỡ chay, tiêu xanh nguyên hạt và ớt băm vào sên sệt bóng, đặt tộ kho quẹt vào giữa đĩa rau luộc.',
        tip: 'Sên sốt trên lửa nhỏ liu riu cho đến khi sốt kéo sợi sánh dẻo như mạch nha.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Chiên đậu hũ thật khô và giòn rụm như tóp mỡ thật, cho vào nồi kho quẹt ở 2 phút cuối cùng để đậu hũ ngấm nước sốt mặn ngọt cay nồng mà vẫn giữ được độ xốp giòn rụm bên trong.',
    tags: ['Món Chay', 'Giàu Xơ', 'Kho Quẹt', 'Đậm Đà', 'Thanh Đạm']
  },

  // --- ĂN SÁNG ---
  {
    id: 'pho-bo-ha-noi',
    title: 'Phở Bò Gia Truyền Hà Nội',
    description: 'Tô phở bò nóng hổi thơm nồng hoa hồi thảo quả, nước dùng trong vắt ngọt thanh từ xương bò hầm kỹ, thăn bò mềm ngọt tái lăn.',
    category: 'an-sang',
    region: 'bac',
    prepTimeMinutes: 20,
    cookTimeMinutes: 60,
    servings: 4,
    calories: 480,
    estimatedCostVnd: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Cầu kỳ',
    ingredients: [
      { name: 'Bánh phở tươi sợi mềm', amount: 800, unit: 'g', category: 'do-kho' },
      { name: 'Thịt bò thăn & nạm bò tươi', amount: 450, unit: 'g', category: 'thit-ca' },
      { name: 'Xương ống bò hầm nước dùng', amount: 1, unit: 'kg', category: 'thit-ca' },
      { name: 'Gừng già nướng & Hành tây nướng', amount: 2, unit: 'củ', category: 'rau-cu' },
      { name: 'Hoa hồi, thảo quả, quế chi, tiểu hồi', amount: 25, unit: 'g', category: 'gia-vi' },
      { name: 'Hành hoa, ngò gai & Hành tây thái mỏng', amount: 100, unit: 'g', category: 'rau-cu' },
      { name: 'Nước mắm ngon truyền thống & Muối hạt', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Khử tanh tẩy mùi xương bò',
        durationMinutes: 15,
        heatLevel: 'lửa lớn',
        content: 'Xương bò ngâm nước muối loãng pha giấm trong 1 tiếng. Đun sôi nồi nước chần xương với gừng đập dập trong 5 phút để thải sạch máu đọng và bọt bẩn, vớt ra xả sạch dưới vòi nước lạnh cạo sạch mảng đen bám quanh xương. Thịt bò thăn rửa sạch thấm khô thái mỏng ngang thớ.',
        tip: 'Chần kỹ xương ống và rửa sạch là bí quyết cốt lõi để nước dùng phở trong veo không bị váng đục.'
      },
      {
        step: 2,
        title: 'Rang thảo mộc & Nướng hương liệu',
        durationMinutes: 8,
        heatLevel: 'lửa vừa',
        content: 'Gừng già và hành tây để nguyên vỏ nướng trên lửa cho xém thơm rồi cạo sạch lớp vỏ cháy, đập dập. Hoa hồi, thảo quả nướng nứt vỏ, quế chi và tiểu hồi rang trên chảo cho dậy mùi thơm nồng nàn rồi cho vào túi lọc vải buộc chặt.',
        tip: 'Nướng thơm gừng và hành tây mang lại vị ngọt đậm đà và màu nước dùng vàng sáng tự nhiên.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa hầm nước dùng',
        durationMinutes: 50,
        heatLevel: 'riu riu',
        content: 'Cho xương vào nồi lớn cùng 3 lít nước đun sôi bùng, hớt sạch toàn bộ bọt trắng. Thả túi thảo mộc, gừng nướng, hành tây nướng và 1 muỗng canh muối hạt vào. Hạ lửa nhỏ riu riu đun mở hé nắp trong 50-60 phút. Nêm nước mắm cốt và hạt nêm cho vị ngọt sâu thanh thoát.',
        tip: 'Tuyệt đối không đậy kín nắp và không đun sôi bùng để nước phở không bị đục ngầu.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện tô phở',
        durationMinutes: 5,
        heatLevel: 'lửa lớn',
        content: 'Trần bánh phở qua nồi nước sôi, xóc ráo cho vào các tô. Xếp thịt bò tái (đã chần nhanh nước sôi 15 giây) và thịt nạm thái mỏng lên trên, rải ngập hành hoa cắt nhỏ, đầu hành chẻ và hành tây thái lát. Chan nước dùng đang sôi sùng sục ngập bánh phở, rắc tiêu xay thơm lừng ăn kèm quẩy giòn.',
        tip: 'Nước dùng bắt buộc phải sôi sùng sục khi chan để làm chín tới thịt bò tái và kích hoạt hương thơm của hành ngò.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Không dùng hạt nêm có bột ngọt nhân tạo quá nhiều làm lợ cổ. Vị ngọt của phở truyền thống Hà Nội phải đến từ tủy xương bò hầm kỹ kết hợp hành nướng và chút nước mắm cốt hảo hạng nêm vào lúc nước dùng sôi nhẹ.',
    tags: ['Ăn Sáng', 'Đặc Sản', 'Phở Việt', 'Hà Nội', 'Món Nước']
  }
];

// --- MÓN TẬN DỤNG CƠM NGUỘI & ĐỒ ĂN THỪA ---
export const LEFTOVER_RECIPES: Recipe[] = [
  {
    id: 'com-rang-dua-bo-ha-noi',
    title: 'Cơm Rang Dưa Bò Hà Nội Giòn Rụm',
    description: 'Món cơm rang quốc dân trứ danh: Tận dụng cơm nguội bữa trước đảo săn hạt giòn rụm cùng dưa cải chua giòn tan và thịt bò mềm ngập khói lửa.',
    category: 'an-sang',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 490,
    estimatedCostVnd: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cơm nguội bữa trước (để tơi hạt)', amount: 600, unit: 'g', category: 'do-kho' },
      { name: 'Thịt bò thăn thái mỏng', amount: 250, unit: 'g', category: 'thit-ca' },
      { name: 'Dưa cải muối chua rửa sạch vắt ráo', amount: 200, unit: 'g', category: 'rau-cu' },
      { name: 'Trứng gà tươi', amount: 2, unit: 'quả', category: 'khac' },
      { name: 'Tỏi băm & Hành khô', amount: 3, unit: 'củ', category: 'rau-cu' },
      { name: 'Nước tương đậm đặc & Hạt tiêu xay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Trộn áo trứng lòng đỏ',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Bóp nhẹ cơm nguội với 1 lòng đỏ trứng gà và 1 muỗng dầu ăn để hạt cơm áo đều sắc vàng óng và tơi xốp không dính chùm.',
        tip: 'Trộn lòng đỏ trước giúp từng hạt cơm được bao bọc lớp màng vàng thơm giòn.'
      },
      {
        step: 2,
        title: 'Ướp & Xào thịt bò dưa chua chín tái',
        durationMinutes: 4,
        heatLevel: 'lửa lớn',
        content: 'Thịt bò ướp với tỏi băm, chút tiêu và dầu hào. Phi thơm tỏi xào bò trên lửa lớn trong 1 phút vừa chín tới rồi trút ngay ra đĩa. Xào tiếp dưa cải chua với chút đường cho giòn đậm.',
        tip: 'Xào bò thật nhanh trên lửa lớn để thịt bò giữ trọn vẹn nước ngọt không bị dai xác.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa rang cơm',
        durationMinutes: 5,
        heatLevel: 'lửa lớn',
        content: 'Cho mỡ vào chảo gang đun thật nóng bốc khói, trút cơm vào đảo đều tay trên lửa lớn 5-7 phút cho hạt cơm săn giòn lách tách.',
        tip: 'Chảo gang lửa lớn là bí quyết để hạt cơm rang săn giòn ngoài giòn trong dẻo mềm.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện dưa bò',
        durationMinutes: 2,
        heatLevel: 'lửa lớn',
        content: 'Trút đĩa thịt bò và dưa cải chua vào chảo cơm rang, rưới 1 muỗng nước tương đậm đặc đảo nhanh tay 1 phút trên lửa lớn, rắc hành hoa tiêu xay rồi tắt bếp.',
        tip: 'Đảo thật nhanh ở phút cuối để các nguyên liệu hòa quyện mà không làm mềm ỉu hạt cơm giòn.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Trộn 1 lòng đỏ trứng gà sống vào cơm nguội trước khi rang giúp từng hạt cơm được bọc một lớp màng vàng ruộm, khi rang hạt cơm săn tơi xốp giòn lách tách như ngoài hàng phố cổ.',
    tags: ['Tận Dụng Cơm Nguội', 'Cơm Rang', 'Đặc Sản Hà Nội', 'Nhanh Gọn']
  },
  {
    id: 'com-chien-duong-chau-tom-lap-xuong',
    title: 'Cơm Chiên Dương Châu Tôm Lạp Xưởng',
    description: 'Công thức tận dụng cơm nguội tuyệt hảo với lạp xưởng Mai Quế Lộ béo ngọt, tôm nõn giòn sần sật, trứng gà và rau củ ngũ sắc tươi ngọt.',
    category: 'an-sang',
    region: 'nam',
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 520,
    estimatedCostVnd: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cơm nguội bữa trước tơi hạt', amount: 600, unit: 'g', category: 'do-kho' },
      { name: 'Lạp xưởng Mai Quế Lộ thái hạt lựu', amount: 100, unit: 'g', category: 'thit-ca' },
      { name: 'Tôm nõn tươi bóc vỏ thái nhỏ', amount: 120, unit: 'g', category: 'thit-ca' },
      { name: 'Đậu Hà Lan & Cà rốt hạt lựu', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Trứng gà tươi', amount: 2, unit: 'quả', category: 'khac' },
      { name: 'Hành hoa & Ngò rí thái nhỏ', amount: 3, unit: 'nhánh', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Thái hạt lựu nguyên liệu',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Cơm nguội đánh tơi hạt. Lạp xưởng luộc sơ rồi cắt hạt lựu nhỏ. Tôm nõn bóc vỏ thái hạt lựu. Cà rốt gọt vỏ thái hạt lựu chần sơ cùng đậu Hà Lan.',
        tip: 'Thái đều hạt lựu các nguyên liệu giúp đĩa cơm chiên Dương Châu đẹp mắt và chín đều.'
      },
      {
        step: 2,
        title: 'Ướp & Xào nhân tôm lạp xưởng',
        durationMinutes: 3,
        heatLevel: 'lửa vừa',
        content: 'Cho lạp xưởng vào chảo đảo trên lửa vừa cho tiết bớt mỡ thơm, trút tôm và rau củ vào xào chín săn trong 2 phút rồi múc ra đĩa riêng.',
        tip: 'Dùng chính mỡ lạp xưởng tiết ra để xào tôm giúp nhân cơm thơm nức mùi rượu Mai Quế Lộ.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa rang cơm trứng',
        durationMinutes: 5,
        heatLevel: 'lửa lớn',
        content: 'Cho cơm nguội vào chảo mỡ lạp xưởng đảo tơi trên lửa lớn. Đập 2 quả trứng gà đánh tan rưới đều vào cơm, đảo liên tục cho trứng bọc quanh từng hạt cơm vàng óng.',
        tip: 'Đảo thật nhanh tay khi rưới trứng để trứng bám màng mỏng quanh hạt cơm chứ không bị vón cục to.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện sắc màu ngũ sắc',
        durationMinutes: 2,
        heatLevel: 'lửa lớn',
        content: 'Trút đĩa nhân tôm lạp xưởng rau củ vào chảo cơm, nêm 1 muỗng canh nước tương ngon và tiêu xay. Đảo đều 1 phút cho hạt cơm săn bóng, rắc ngập hành hoa ngò rí rồi tắt bếp.',
        tip: 'Rắc hành hoa và tiêu xay ngay khi tắt bếp để giữ màu xanh tươi mát mắt.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Xào lạp xưởng trước trên chảo không dầu để lạp xưởng tự tiết mỡ thơm lừng, dùng chính mỡ lạp xưởng đó để rang cơm sẽ giúp hạt cơm bóng bẩy đượm hương rượu Mai Quế Lộ đặc trưng.',
    tags: ['Tận Dụng Cơm Nguội', 'Cơm Chiên', 'Hương Vị Sài Gòn', 'Nhanh Gọn']
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cơm nguội ép mỏng thành bánh', amount: 500, unit: 'g', category: 'do-kho' },
      { name: 'Chà bông heo (ruốc thịt) tơi sợi', amount: 80, unit: 'g', category: 'thit-ca' },
      { name: 'Hành lá tươi thái nhỏ', amount: 50, unit: 'g', category: 'rau-cu' },
      { name: 'Dầu ăn & Ớt băm', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Nước mắm kẹo chua ngọt', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Ép mỏng bánh cơm',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho cơm nguội vào túi zip hoặc trải giữa 2 lớp màng bọc thực phẩm, dùng cây lăn cán ép dẹt thành bánh dày khoảng 0.5cm.',
        tip: 'Ép cơm chặt tay và đều độ dày giúp bánh cơm khi chiên giòn đều không bị vỡ vụn.'
      },
      {
        step: 2,
        title: 'Ướp sốt mắm đường kẹo & Chuẩn bị mỡ hành',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Khuấy đều 2 muỗng canh nước mắm ngon với 2 muỗng canh đường, 1 muỗng tương ớt và 1 muỗng nước cốt chanh cho sánh kẹo. Cắt nhỏ hành lá cho vào bát cùng chút muối tiêu.',
        tip: 'Cho chút muối vào hành lá trước khi đổ dầu nóng giúp mỡ hành giữ màu xanh ngọc bích.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Canh lửa chiên cơm giòn rụm',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Đun nóng chảo dầu trên lửa vừa, thả bánh cơm vào chiên ngập dầu hoặc áp chảo không dầu đến khi hai mặt vàng ươm phồng rộp giòn tan. Vớt ra đĩa có lót giấy thấm dầu.',
        tip: 'Dầu phải đủ nóng khi thả cơm vào để hạt cơm nở bung xốp giòn rụm.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện quết mỡ hành chà bông',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Đun sôi 3 muỗng canh dầu ăn dội trực tiếp vào bát hành lá làm mỡ hành. Rưới nước mắm kẹo và mỡ hành bóng bẩy lên mặt cơm cháy, rải đều chà bông heo tơi xốp lên trên và thưởng thức.',
        tip: 'Rưới mỡ hành và rắc chà bông khi cơm cháy còn nóng hổi để bánh hấp thụ trọn vẹn gia vị thơm ngon.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Dùng màng bọc thực phẩm cán mỏng cơm nguội rồi sấy trong nồi chiên không dầu ở 100°C trong 15 phút cho khô se mặt trước khi chiên ngập dầu, bánh cơm sẽ phồng rộp giòn tan xốp rụm như ngoài tiệm.',
    tags: ['Tận Dụng Cơm Nguội', 'Cơm Cháy', 'Ăn Vặt', 'Dễ Làm']
  },
  {
    id: 'leftover-goi-ga-xe-phay-bap-cai',
    title: 'Gỏi Gà Xé Phay Bắp Cải Hành Tây',
    description: 'Giải pháp hoàn hảo tận dụng thịt gà luộc thừa bữa trước: Gà xé sợi dai ngọt quyện cùng bắp cải giòn rụm, hành tây chua thanh và nước mắm tỏi ớt chua cay đậm đà.',
    category: 'mon-rau',
    region: 'toan-quoc',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 320,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Thịt gà luộc thừa (xé phay)', amount: 350, unit: 'g', category: 'thit-ca' },
      { name: 'Bắp cải trắng thái sợi mỏng', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây ngâm giấm đá giòn', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Rau răm tươi & Đậu phộng rang giòn', amount: 60, unit: 'g', category: 'rau-cu' },
      { name: 'Nước cốt chanh, tỏi ớt, mắm đường', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế thịt gà & Bào sợi bắp cải',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Thịt gà luộc nguội dùng tay xé thành từng sợi vừa ăn kèm theo da gà dai giòn. Bắp cải bào sợi mỏng, rửa sạch ngâm nước muối loãng 3 phút rồi vắt ráo.',
        tip: 'Xé gà bằng tay theo thớ thịt giúp thịt gà giữ trọn vẹn vị ngọt dai tự nhiên hơn dùng dao cắt.'
      },
      {
        step: 2,
        title: 'Ngâm hành tây giòn & Pha nước trộn gỏi',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Hành tây bóc vỏ thái lát mỏng ngâm ngay vào âu nước đá lạnh có pha 1 muỗng giấm gạo trong 10 phút. Pha nước trộn gỏi: 2 muỗng canh nước mắm, 2 muỗng nước cốt chanh, 2.5 muỗng đường, tỏi ớt băm nhỏ khuấy tan sánh.',
        tip: 'Nước đá lạnh giúp khử sạch mùi hăng cay của hành tây và làm hành giòn sần sật mọng nước.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chế biến & Trộn gỏi thấm vị',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho thịt gà xé, bắp cải bào sợi và hành tây vắt ráo vào âu lớn. Rưới từ từ 2/3 lượng nước mắm chua ngọt vào, dùng tay trộn nhẹ nhàng đều các nguyên liệu trong 2 phút cho ngấm đều vị.',
        tip: 'Trộn nhẹ tay không bóp vò mạnh để bắp cải không bị dập nát chảy nhiều nước.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện rắc đậu phộng',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho rau răm cắt nhỏ và phần nước sốt còn lại vào đảo đều. Gắp gỏi ra đĩa lớn, rắc ngập đậu phộng rang giã dập và hành phi giòn lên trên, dùng ngay kèm bánh phồng tôm.',
        tip: 'Rắc đậu phộng ngay trước khi dọn ra bàn để giữ độ giòn rụm bùi béo tuyệt hảo.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Hành tây sau khi thái mỏng hãy ngâm ngay vào tô nước đá lạnh pha 1 muỗng giấm trong 10 phút để loại bỏ 100% mùi hăng cay nồng, giữ cọng hành giòn tan sần sật mọng nước.',
    tags: ['Tận Dụng Đồ Thừa', 'Thịt Gà Luộc', 'Gỏi Nộm', 'Chua Ngọt']
  },
  {
    id: 'thit-luoc-cuon-banh-trang-thinh',
    title: 'Thịt Ba Chỉ Luộc Cuốn Bánh Tráng & Rau Sống',
    description: 'Món cuốn thanh mát tuyệt ngon tận dụng thịt heo luộc thái mỏng, cuộn bánh tráng phơi sương, rau sống tươi non chấm cùng mắm nêm thơm nồng.',
    category: 'mon-man',
    region: 'trung',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 420,
    estimatedCostVnd: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Thịt heo luộc thừa thái mỏng', amount: 350, unit: 'g', category: 'thit-ca' },
      { name: 'Bánh tráng phơi sương Trảng Bàng', amount: 1, unit: 'xấp (20 lá)', category: 'do-kho' },
      { name: 'Rau sống, xà lách, dưa leo, chuối chát', amount: 350, unit: 'g', category: 'rau-cu' },
      { name: 'Mắm nêm pha dứa ớt tỏi', amount: 1, unit: 'bát con (100ml)', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế & Hấp nóng thịt luộc thái lát mỏng',
        durationMinutes: 4,
        heatLevel: 'lửa vừa',
        content: 'Thịt heo luộc từ tủ lạnh lấy ra đem hấp cách thủy 3 phút với vài lát gừng cho mềm ấm, sau đó dùng dao thật sắc thái lát thật mỏng đều tay.',
        tip: 'Hấp nhẹ thịt lại giúp mỡ heo trong mềm mọng nước trở lại mà không bị khô cứng.'
      },
      {
        step: 2,
        title: 'Rửa rau sống & Chuẩn bị đồ cuốn',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Rau sống, xà lách, rau thơm các loại rửa sạch ngâm nước muối loãng vắt ráo. Dưa leo và chuối chát bào lát mỏng dài.',
        tip: 'Chuối chát ngâm nước muối chanh để không bị thâm đen và giữ độ giòn chát dịu.'
      },
      {
        step: 3,
        title: 'Pha mắm nêm dứa thơm chuẩn vị',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Dứa chín băm nhuyễn. Pha 3 muỗng canh mắm nêm ngon với dứa băm, tỏi ớt giã nhuyễn, 1.5 muỗng canh đường và nước cốt chanh khuấy đều sền sệt.',
        tip: 'Dứa băm nhuyễn là linh hồn giúp mắm nêm thơm ngọt dịu và giảm độ mặn gắt.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện mẹt cuốn',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Bày thịt heo luộc thái mỏng ra mẹt tre cùng đĩa rau sống xanh mướt, xấp bánh tráng phơi sương dẻo mềm và bát mắm nêm thơm nồng thưởng thức ngay.',
        tip: 'Thưởng thức cuốn bánh tráng với đầy đủ các loại rau thơm và chấm ngập mắm nêm đậm đà.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Thịt luộc từ tủ lạnh lấy ra hãy hấp cách thủy lại trong 3 phút với vài nhánh sả và gừng thái lát, thớ thịt sẽ mềm mọng trở lại như vừa mới luộc mà không bị khô teo thâm mặt.',
    tags: ['Tận Dụng Đồ Thừa', 'Thịt Heo Luộc', 'Món Cuốn', 'Thanh Mát']
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Trứng gà tươi', amount: 6, unit: 'quả', category: 'khac' },
      { name: 'Nấm mỡ tươi thái lát', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Phô mai Mozzarella bào sợi', amount: 80, unit: 'g', category: 'khac' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Sữa tươi không đường', amount: 50, unit: 'ml', category: 'khac' },
      { name: 'Bánh mì sandwich nướng bơ tỏi', amount: 4, unit: 'lát', category: 'do-kho' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế nấm & Đánh trứng bông mịn',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Nấm mỡ lau sạch bằng khăn ẩm, cắt lát mỏng 0.3cm. Đập trứng gà vào âu cùng sữa tươi không đường, 1/2 muỗng cà phê muối tiêu, dùng phới lồng đánh tan bông nhẹ.',
        tip: 'Thêm sữa tươi giúp trứng rán mềm mượt xốp mịn chuẩn phong cách ẩm thực Pháp.'
      },
      {
        step: 2,
        title: 'Ướp gia vị & Xào nấm bơ thơm',
        durationMinutes: 2,
        heatLevel: 'lửa vừa',
        content: 'Làm nóng chảo với 10g bơ lạt trên lửa vừa, cho nấm mỡ vào xào nhanh tay trong 2 phút với chút muối tiêu cho nấm chín thơm dậy mùi rồi trút ra đĩa riêng.',
        tip: 'Xào nấm lửa vừa để nấm giữ độ giòn ngọt mọng nước mà không bị thâm xỉn.'
      },
      {
        step: 3,
        title: 'Kỹ thuật cuộn Omelette trên lửa nhỏ',
        durationMinutes: 3,
        heatLevel: 'lửa nhỏ',
        content: 'Cho 15g bơ lạt còn lại vào chảo láng đều trên lửa nhỏ. Đổ hỗn hợp trứng vào lắc nhẹ chảo. Khi mặt dưới se lại nhưng mặt trên còn mềm ẩm (custardy), rải đều nấm xào và phô mai Mozzarella vào giữa rồi khéo léo cuộn tròn gập đôi lại.',
        tip: 'Giữ lửa thật nhỏ để trứng không bị cháy vàng xém mặt đáy mà giữ được màu vàng kem mịn màng.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện bánh mì bơ tỏi',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Trượt nhẹ cuộn trứng Omelette ra đĩa lớn, rắc thêm chút lá mùi tây parsley thái nhỏ và tiêu đen xay. Dọn kèm bánh mì sandwich nướng bơ tỏi giòn tan.',
        tip: 'Thưởng thức ngay khi phô mai bên trong còn đang nóng hổi tan chảy kéo sợi hấp dẫn.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Đánh trứng cùng chút sữa tươi và giữ lửa thật nhỏ, khi trứng vừa se mặt dưới nhưng mặt trên còn mềm ẩm (custardy) thì cho phô mai và cuộn nhanh tay, phô mai sẽ tan chảy kéo sợi hoàn hảo.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bánh mì đen hoặc sandwich ngũ cốc', amount: 4, unit: 'lát', category: 'do-kho' },
      { name: 'Bơ sáp 034 chín tới', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Trứng gà tươi (chần lòng đào)', amount: 4, unit: 'quả', category: 'khac' },
      { name: 'Dầu ô liu nguyên chất Extra Virgin', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Nước cốt chanh vàng & Muối hồng, tiêu đập dập', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế bơ & Bánh mì nướng giòn',
        durationMinutes: 3,
        heatLevel: 'lửa vừa',
        content: 'Bánh mì ngũ cốc nướng áp chảo hoặc máy nướng cho 4 lát vàng giòn rụm hai mặt. Bơ sáp bổ đôi, bỏ hạt, dùng thìa nạo lấy phần thịt bơ dẻo mịn.',
        tip: 'Nướng bánh mì thật giòn để chịu được độ ẩm của lớp sốt bơ và trứng chần phía trên.'
      },
      {
        step: 2,
        title: 'Ướp gia vị & Dầm bơ sáp chanh tiêu',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Dùng nĩa dầm nhuyễn thịt bơ cùng 1 muỗng cà phê nước cốt chanh vàng, muối hồng và tiêu đen giã dập cho hòa quyện sánh ngậy.',
        tip: 'Nước cốt chanh vàng giúp bơ giữ được màu xanh tươi mát mắt và không bị thâm đen do oxy hóa.'
      },
      {
        step: 3,
        title: 'Kỹ thuật chần trứng xoáy nước lòng đào',
        durationMinutes: 3,
        heatLevel: 'lửa nhỏ',
        content: 'Đun sôi lăn tăn nồi nước với 1 muỗng giấm gạo, dùng muôi khuấy tạo xoáy nước nhẹ giữa nồi. Thả nhẹ từng quả trứng gà vào tâm xoáy chần đúng 3 phút cho lòng trắng bao trọn lòng đỏ rồi vớt ra ngâm nước ấm.',
        tip: 'Xoáy nước giúp lòng trắng cuộn tròn đẹp mắt ôm chặt lấy lòng đỏ lòng đào.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện Avocado Toast',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Phết lớp bơ nghiền dày dặn lên 4 lát bánh mì giòn. Đặt khéo léo trứng chần lòng đào lên đỉnh, rưới chút dầu ô liu Extra Virgin, rắc muối hồng tiêu sọ và chút ớt bột Paprika lên trên.',
        tip: 'Cắt nhẹ quả trứng khi thưởng thức để lòng đào chảy tràn quyện vào lớp bơ sáp béo ngậy.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Cho 1 muỗng giấm vào nồi nước sôi lăn tăn và dùng muôi khuấy tạo xoáy nước mạnh rồi thả nhẹ trứng vào tâm xoáy, lòng trắng sẽ tự động ôm trọn lòng đỏ thành khối tròn mượt mà.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Trứng gà tươi', amount: 6, unit: 'quả', category: 'khac' },
      { name: 'Xúc xích Đức xông khói nướng', amount: 4, unit: 'cây', category: 'thit-ca' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Kem tươi whipping cream hoặc sữa tươi', amount: 40, unit: 'ml', category: 'khac' },
      { name: 'Bánh mì sandwich bơ nướng', amount: 4, unit: 'lát', category: 'do-kho' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế nguyên liệu & Đánh trứng sữa',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Khía nhẹ thân xúc xích Đức thành các đường chéo. Đập trứng gà vào tô cùng kem whipping, 1/2 muỗng muối tinh và tiêu xay, dùng dĩa đánh nhẹ vừa hòa quyện (không đánh nổi bọt).',
        tip: 'Không đánh quá mạnh tay làm nổi bọt khí, trứng khuấy sẽ mịn mượt như kem lụa.'
      },
      {
        step: 2,
        title: 'Áp chảo xúc xích vàng thơm',
        durationMinutes: 3,
        heatLevel: 'lửa vừa',
        content: 'Làm nóng chảo áp chảo xúc xích trên lửa vừa 3-4 phút cho vàng ươm xém các cạnh, tỏa hương khói thơm nức rồi gắp ra đĩa.',
        tip: 'Khía thân xúc xích giúp nhiệt len lỏi vào trong làm xúc xích căng mọng không bị nứt vỏ.'
      },
      {
        step: 3,
        title: 'Kỹ thuật khuấy trứng bơ mịn vân sóng',
        durationMinutes: 3,
        heatLevel: 'lửa nhỏ',
        content: 'Đun chảy 25g bơ lạt trên lửa thật nhỏ, đổ trứng vào. Dùng phới dẹt silicone đảo nhẹ nhàng từ mép chảo vào giữa tạo thành các lớp vân trứng gợn sóng mềm mượt ẩm ướt (nhấc chảo ra khỏi bếp khi trứng chín 80%).',
        tip: 'Nhiệt dư của chảo sẽ làm chín tới phần trứng còn lại mà không làm trứng bị khô xác.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Dọn đĩa ăn sáng kiểu Mỹ',
        durationMinutes: 1,
        heatLevel: 'không dùng nhiệt',
        content: 'Bày trứng khuấy bông mềm, xúc xích nướng giòn và lát bánh mì bơ nướng ra đĩa lớn, rắc chút lá hẹ chives cắt nhỏ và tiêu xay thơm nức mũi.',
        tip: 'Dùng nóng ngay để thưởng thức độ tan mềm béo ngậy của trứng bơ lạt.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Bí quyết làm Scrambled Eggs chuẩn bếp Âu là nhấc chảo ra khỏi bếp mỗi 30 giây rồi lại đặt lên bếp, khuấy liên tục bằng phới silicone trên lửa thật nhỏ để trứng mềm mượt như kem sữa.',
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
    imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bột làm bánh pancake hoặc bột mì đa dụng', amount: 200, unit: 'g', category: 'do-kho' },
      { name: 'Sữa tươi tiệt trùng không đường', amount: 180, unit: 'ml', category: 'khac' },
      { name: 'Trứng gà tươi', amount: 2, unit: 'quả', category: 'khac' },
      { name: 'Mật ong hoa rừng nguyên chất', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Chuối tiêu chín thái lát & Bơ lạt', amount: 2, unit: 'quả', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Rây bột & Trộn hỗn hợp bột sánh mịn',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Rây bột mì vào âu lớn cùng 1 muỗng cà phê bột nở (baking powder) và 1 muỗng đường. Đánh tan trứng gà cùng sữa tươi và bơ đun chảy, rót từ từ vào âu bột khuấy đều đến khi hỗn hợp sánh mịn không vón cục.',
        tip: 'Không khuấy bột quá kỹ làm bánh bị dai đặc mất độ xốp mềm nhẹ tênh.'
      },
      {
        step: 2,
        title: 'Nghỉ bột 10 phút kích hoạt bọt khí',
        durationMinutes: 10,
        heatLevel: 'không dùng nhiệt',
        content: 'Để âu bột nghỉ trong 10 phút ở nhiệt độ phòng để bột nở kích hoạt tạo các bọt khí li ti bên trong cấu trúc bột.',
        tip: 'Thời gian nghỉ bột là bí quyết giúp pancake nở phồng xốp mềm như bông gòn.'
      },
      {
        step: 3,
        title: 'Kỹ thuật rán bánh pancake vàng đều 2 mặt',
        durationMinutes: 6,
        heatLevel: 'lửa nhỏ',
        content: 'Làm nóng chảo chống dính trên lửa nhỏ, thoa một lớp bơ mỏng rồi dùng khăn giấy lau gần sạch. Múc 1 muôi bột đổ thẳng vào giữa chảo từ trên cao tạo hình tròn. Rán lửa nhỏ đến khi mặt trên sủi bọt khí vỡ ra thì lật mặt rán thêm 1 phút cho vàng đều.',
        tip: 'Lau sạch bơ dư trên chảo giúp mặt bánh pancake có màu nâu vàng óng ả đồng nhất không bị loang lổ.'
      },
      {
        step: 4,
        title: 'Xếp tầng & Hoàn thiện bơ mật ong chuối lát',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Xếp 3-4 lát bánh pancake chồng lên nhau trên đĩa. Xếp chuối tiêu chín cắt lát xung quanh, đặt viên bơ lạt lên đỉnh bánh và rưới đẫm mật ong hoa rừng nguyên chất ấm nóng.',
        tip: 'Nhiệt độ của bánh pancake nóng sẽ làm viên bơ tan chảy từ từ quyện vào mật ong ngọt dịu.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Để bột bánh nghỉ 10 phút sau khi trộn giúp gluten thư giãn và bột nở đều. Khi rán chỉ lật mặt bánh một lần duy nhất khi bề mặt xuất hiện các bọt khí li ti vỡ ra.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bánh mì sandwich lát dày hoặc baguette', amount: 6, unit: 'lát', category: 'do-kho' },
      { name: 'Trứng gà tươi', amount: 3, unit: 'quả', category: 'khac' },
      { name: 'Sữa tươi tiệt trùng & Whipping cream', amount: 120, unit: 'ml', category: 'khac' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Bột quế & Mật ong hoa nhãn', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Cắt bánh mì & Pha hỗn hợp trứng sữa béo',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Cắt bánh mì sandwich thành lát dày 2.5cm. Trong đĩa sâu lòng, đánh tan trứng gà cùng sữa tươi, kem whipping, 1 muỗng đường nâu, 1/2 muỗng cà phê bột quế và vani.',
        tip: 'Bánh mì cắt dày giúp hút trọn hỗn hợp sữa mà không bị nát nhũn khi lật.'
      },
      {
        step: 2,
        title: 'Nhúng đẫm bánh mì trong hỗn hợp',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Đặt từng lát bánh mì vào hỗn hợp trứng sữa ngâm 20-30 giây mỗi mặt cho bánh mì ngấm đẫm custard từ ngoài vào trong ruột bánh.',
        tip: 'Ngâm đủ thời gian để ruột bánh mì sau khi nướng mềm ẩm như bánh pudding.'
      },
      {
        step: 3,
        title: 'Kỹ thuật áp chảo bơ lạt vàng caramel',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Đun chảy 25g bơ lạt trên chảo chống dính với lửa vừa. Cho các lát bánh mì vào áp chảo mỗi mặt 2-3 phút đến khi bề mặt chuyển sang màu vàng caramel giòn xém thơm nức.',
        tip: 'Áp chảo trên lửa vừa để bơ không bị cháy khét và custard bên trong bánh chín mềm.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Rắc bột quế mật ong',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Gắp các lát bánh mì ra đĩa, rây nhẹ một lớp đường bột và bột quế mịn lên mặt bánh, rưới mật ong hoa nhãn hoặc siro lá phong thơm lừng.',
        tip: 'Bột quế kết hợp mật ong ấm áp tạo nên hương vị đặc trưng sang trọng của ẩm thực Pháp.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Dùng bánh mì sandwich cũ (stale bread) để ngâm hỗn hợp trứng sữa sẽ hút đượm sốt mà không bị rã nát, khi áp chảo bơ mặt ngoài giòn rụm bên trong mềm ẩm như bánh pudding.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Yến mạch Úc nguyên hạt cán mỏng', amount: 150, unit: 'g', category: 'do-kho' },
      { name: 'Sữa chua Hy Lạp không đường', amount: 2, unit: 'hộp', category: 'khac' },
      { name: 'Sữa hạnh nhân hoặc sữa tươi', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Hạt chia & Hạnh nhân lát', amount: 30, unit: 'g', category: 'do-kho' },
      { name: 'Hoa quả tươi (chuối, dâu tây, việt quất)', amount: 150, unit: 'g', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế yến mạch & Hạt chia dinh dưỡng',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho yến mạch cán mỏng và hạt chia organic vào 4 hũ thủy tinh sạch, trộn đều hạt khô.',
        tip: 'Hạt chia nở ra sẽ tạo độ sánh đặc tự nhiên và bổ sung nguồn Omega-3 dồi dào.'
      },
      {
        step: 2,
        title: 'Ướp gia vị chuẩn vị sữa chua sữa hạt',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Rót sữa chua Hy Lạp, sữa hạnh nhân và 1 muỗng mật ong vào từng hũ, dùng thìa khuấy đều cho yến mạch ngập đẫm chất lỏng.',
        tip: 'Khuấy kỹ từ đáy hũ để không còn vón cục yến mạch khô dưới đáy.'
      },
      {
        step: 3,
        title: 'Kỹ thuật ủ mát ngăn lạnh qua đêm',
        durationMinutes: 120,
        heatLevel: 'không dùng nhiệt',
        content: 'Đậy kín nắp hũ thủy tinh, cất vào ngăn mát tủ lạnh ủ qua đêm hoặc tối thiểu 2-4 tiếng cho yến mạch và hạt chia nở mềm dẻo mịn.',
        tip: 'Ủ lạnh giúp hạt yến mạch lên men nhẹ tiêu hóa dễ dàng và giữ trọn vẹn vitamin.'
      },
      {
        step: 4,
        title: 'Nêm nếm & Hoàn thiện hoa quả tươi',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Sáng hôm sau mở nắp hũ, rải dâu tây, việt quất và chuối chín cắt lát lên bề mặt, rắc hạnh nhân nướng giòn và thưởng thức lạnh sảng khoái.',
        tip: 'Cho hoa quả tươi vào lúc ăn để trái cây giữ được độ tươi giòn mọng nước.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Tỉ lệ vàng 1 phần yến mạch : 1 phần sữa chua : 1.5 phần sữa tươi giúp yến mạch sau khi ủ qua đêm có độ sánh dẻo mịn màng như kem tươi mà không hề bị khô cứng.',
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
    imageUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Nấm mỡ tươi hoặc nấm đùi gà baby', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây trắng thái hạt lựu', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Bơ lạt tự nhiên Anchor', amount: 30, unit: 'g', category: 'khac' },
      { name: 'Kem tươi Whipping Cream', amount: 100, unit: 'ml', category: 'khac' },
      { name: 'Sữa tươi không đường', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Bánh mì bơ tỏi nướng giòn ăn kèm', amount: 4, unit: 'lát', category: 'do-kho' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế nấm mỡ & Khử đất',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Nấm mỡ gọt nhẹ gốc, lau sạch bằng khăn ẩm rồi thái lát mỏng. Hành tây bóc vỏ cắt hạt lựu nhỏ.',
        tip: 'Không ngâm nấm trong nước quá lâu vì nấm sẽ hút nhiều nước làm loãng vị súp.'
      },
      {
        step: 2,
        title: 'Ướp & Xào nấm bơ tỏi thơm ngát thảo mộc',
        durationMinutes: 4,
        heatLevel: 'lửa vừa',
        content: 'Đun chảy 20g bơ lạt trên lửa vừa, cho hành tây vào xào trong mềm ngọt trong 2 phút. Cho nấm mỡ vào xào xém cạnh với 1 muỗng cà phê lá xạ hương thyme và muối tiêu thơm lừng.',
        tip: 'Xào nấm xém cạnh để đánh thức hương thơm đất thảo mộc nồng nàn đặc trưng của nấm tươi.'
      },
      {
        step: 3,
        title: 'Kỹ thuật nấu nước dùng gà & Xay súp sánh mượt',
        durationMinutes: 6,
        heatLevel: 'lửa nhỏ',
        content: 'Cho sữa tươi và 300ml nước dùng gà vào nồi đun sôi lăn tăn 5 phút cho nấm mềm. Múc 2/3 lượng nấm vào máy xay nhuyễn mịn rồi đổ ngược lại vào nồi tạo độ sánh kem mượt mà.',
        tip: 'Xay nhuyễn 2/3 lượng nấm tạo độ sánh tự nhiên mà không cần dùng đến bột mì hay bột bắp.'
      },
      {
        step: 4,
        title: 'Nêm nếm whipping cream & Dọn đĩa bánh mì bơ tỏi',
        durationMinutes: 3,
        heatLevel: 'lửa nhỏ',
        content: 'Rưới 100ml kem whipping vào nồi súp khuấy nhẹ tay trên lửa nhỏ lăn tăn, nêm lại muối tiêu cho vừa miệng ngậy béo. Múc ra đĩa sâu lòng, rắc lá thyme và ăn kèm bánh mì nướng bơ tỏi giòn tan.',
        tip: 'Không đun sôi bùng sau khi cho kem tươi để súp không bị tách dầu bơ.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Xay nhuyễn 2/3 lượng nấm xào cùng nước dùng gà để tạo độ sánh mịn tự nhiên mà không cần dùng nhiều bột mì, 1/3 nấm còn lại giữ nguyên để tạo độ giòn sần sật vui miệng khi thưởng thức.',
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
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cà chua chín đỏ mọng', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây & Tỏi khô băm', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Lá húng tây Basil tươi hoặc khô', amount: 10, unit: 'g', category: 'rau-cu' },
      { name: 'Dầu ô liu nguyên chất', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Kem tươi whipping cream', amount: 60, unit: 'ml', category: 'khac' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế cà chua & Nướng xém cạnh',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Cà chua rửa sạch bổ múi cau. Hành tây bóc vỏ cắt múi nhỏ, tỏi băm nhuyễn. Trộn cà chua với 1 muỗng dầu ô liu và chút muối tiêu.',
        tip: 'Chọn cà chua chín mọng màu đỏ sẫm để món súp có vị ngọt thanh và sắc màu rực rỡ.'
      },
      {
        step: 2,
        title: 'Xào hành tỏi thơm & Nấu nhừ cà chua',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Phi thơm hành tỏi với dầu ô liu trên lửa vừa, trút toàn bộ cà chua vào xào nhừ trong 5 phút. Đổ 300ml nước dùng rau củ vào đun sôi lăn tăn 6 phút.',
        tip: 'Đun kỹ cà chua cho ra hết chất chua ngọt tự nhiên.'
      },
      {
        step: 3,
        title: 'Xay nhuyễn mịn cùng lá húng tây Basil',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho súp cà chua vào máy xay mịn cùng lá húng tây basil tươi và chút bơ lạt cho đến khi súp sánh mịn màng nhung đỏ ruby.',
        tip: 'Lá basil tươi xay cùng cà chua nóng mang lại nốt hương thơm nồng nàn thảo mộc đặc trưng nước Ý.'
      },
      {
        step: 4,
        title: 'Nêm nếm whipping cream & Hoàn thiện hoa văn kem',
        durationMinutes: 3,
        heatLevel: 'lửa nhỏ',
        content: 'Đổ súp lại nồi đun sôi nhẹ, nêm chút muối hồng và đường nâu cho cân bằng độ chua. Múc ra bát sâu lòng, rưới kem whipping tạo vòng tròn xoáy và trang trí nhánh basil tươi.',
        tip: 'Vòng xoáy kem tươi vừa tạo điểm nhấn thị giác bắt mắt vừa cân bằng vị chua dịu của cà chua.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Nướng cà chua chín mọng trước khi nấu giúp cô đọng lượng đường tự nhiên trong quả, làm nước súp có vị ngọt sâu thanh thoát và màu đỏ ruby rực rỡ đặc trưng vùng Địa Trung Hải.',
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
    imageUrl: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bắp ngọt Mỹ tách hạt', amount: 2, unit: 'bắp', category: 'rau-cu' },
      { name: 'Ức gà tươi luộc xé sợi', amount: 150, unit: 'g', category: 'thit-ca' },
      { name: 'Sữa tươi & Kem tươi', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Bơ lạt Anchor', amount: 20, unit: 'g', category: 'khac' },
      { name: 'Hành tây hạt lựu', amount: 0.5, unit: 'củ', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Tách hạt bắp Mỹ & Luộc ức gà xé sợi',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Bắp ngọt dùng dao gọt tách hạt vàng tươi, giữ lại lõi bắp. Ức gà luộc chín tới với chút muối gừng rồi dùng tay xé sợi nhỏ mỏng.',
        tip: 'Lõi bắp ngô chứa nhiều đường tự nhiên ngọt lịm, giữ lại luộc lấy nước ngọt nấu súp.'
      },
      {
        step: 2,
        title: 'Xào bắp ngọt với bơ lạt dậy mùi thơm',
        durationMinutes: 3,
        heatLevel: 'lửa vừa',
        content: 'Đun chảy 20g bơ lạt trên lửa vừa, cho hành tây và bắp ngọt vào xào chín dậy mùi thơm ngậy trong 3 phút.',
        tip: 'Xào bắp với bơ lạt giúp hạt ngô căng bóng và dậy mùi hương sữa béo ngọt ngào.'
      },
      {
        step: 3,
        title: 'Nấu sữa tươi & Xay nhuyễn tạo độ sánh',
        durationMinutes: 5,
        heatLevel: 'lửa nhỏ',
        content: 'Đổ nước luộc gà và sữa tươi vào nồi bắp đun sôi lăn tăn 5 phút. Múc 1/2 lượng bắp ra máy xay mịn rồi trút lại nồi để tạo độ sánh mịn vàng ươm.',
        tip: 'Xay một nửa số bắp giúp súp vừa sánh mượt vừa có những hạt bắp giòn ngọt nhai thích miệng.'
      },
      {
        step: 4,
        title: 'Thả gà xé nêm nếm & Hoàn thiện',
        durationMinutes: 2,
        heatLevel: 'lửa nhỏ',
        content: 'Thả ức gà xé sợi vào nồi súp, rưới kem tươi và nêm chút muối tiêu vừa ăn. Đun sôi nhẹ 1 phút rồi múc ra bát, rắc ngò rí và tiêu xay thơm nức mũi.',
        tip: 'Ức gà cho vào cuối cùng để thớ thịt giữ trọn độ mềm mọng nước không bị khô xơ.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Lấy lõi bắp ngô luộc cùng nước dùng gà trước khi nấu súp để chiết xuất vị ngọt thanh tự nhiên nhất của ngô non vào nước súp.',
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
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Xà lách Romaine tươi giòn', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Bánh mì sấy giòn bơ tỏi (Croutons)', amount: 60, unit: 'g', category: 'do-kho' },
      { name: 'Phô mai bột Parmesan', amount: 30, unit: 'g', category: 'khac' },
      { name: 'Sốt Salad Caesar ngậy béo', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Cà chua bi tươi', amount: 100, unit: 'g', category: 'rau-cu' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Sơ chế xà lách Romaine & Sốc nước đá giòn',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Xà lách Romaine tách bẹ lá, ngâm nước đá lạnh 5 phút cho giòn tan. Vớt ra để thật ráo nước hoặc dùng rổ quay rau vắt kiệt nước, cắt khúc vừa ăn 3-4cm.',
        tip: 'Rau xà lách bắt buộc phải khô ráo hoàn toàn để lớp sốt Caesar bám đều vào từng phiến lá.'
      },
      {
        step: 2,
        title: 'Làm bánh mì sấy tỏi Croutons vàng ươm',
        durationMinutes: 3,
        heatLevel: 'lửa vừa',
        content: 'Bánh mì sandwich cắt hạt lựu 1.5cm, đảo trên chảo với chút bơ tỏi và tiêu trong 3 phút đến khi vàng ruộm giòn tan.',
        tip: 'Bánh mì croutons tự làm giòn rụm tạo kết cấu tương phản tuyệt hảo cho đĩa salad.'
      },
      {
        step: 3,
        title: 'Pha sốt Caesar béo ngậy chuẩn vị',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Pha sốt: 3 muỗng sốt mayonnaise, 1 muỗng nước cốt chanh vàng, 1/2 muỗng mù tạt vàng Dijon, 1 tép tỏi băm nhuyễn và tiêu đen xay khuấy đều.',
        tip: 'Mù tạt Dijon mang lại vị cay nồng tinh tế và cân bằng độ ngậy của sốt mayonnaise.'
      },
      {
        step: 4,
        title: 'Trộn salad & Bào ngập phô mai Parmesan',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho xà lách Romaine và cà chua bi bổ đôi vào âu lớn, rưới sốt Caesar đảo nhẹ tay. Trút ra đĩa, rải bánh mì sấy croutons giòn rụm và bào ngập phô mai Parmesan lên trên.',
        tip: 'Trộn sốt ngay trước khi ăn để xà lách giữ trọn độ giòn sần sật mọng nước.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Xà lách Romaine ngâm nước đá lạnh rồi vắt thật ráo bằng rổ quay rau trước khi trộn giúp lá rau giòn tan mọng nước và sốt bám đều vào từng kẽ lá mà không bị chảy nước.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Khoai tây vàng Đà Lạt', amount: 600, unit: 'g', category: 'rau-cu' },
      { name: 'Bơ lạt Anchor béo ngậy', amount: 40, unit: 'g', category: 'khac' },
      { name: 'Sữa tươi tiệt trùng không đường ấm', amount: 80, unit: 'ml', category: 'khac' },
      { name: 'Tỏi băm phi thơm & Tiêu đen xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Muối tinh & Nhánh hương thảo tươi', amount: 1, unit: 'nhúm', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Gọt vỏ khoai tây & Cắt khối đều nhau',
        durationMinutes: 4,
        heatLevel: 'không dùng nhiệt',
        content: 'Khoai tây gọt sạch vỏ, cắt khối vuông cỡ 3x3cm đều nhau, rửa sạch tinh bột thừa dưới vòi nước.',
        tip: 'Cắt khối đều nhau giúp các miếng khoai tây chín mềm bở cùng một lúc.'
      },
      {
        step: 2,
        title: 'Luộc khoai tây ngập nước muối chín bở',
        durationMinutes: 12,
        heatLevel: 'lửa lớn',
        content: 'Cho khoai vào nồi ngập nước lạnh cùng 1 muỗng cà phê muối hạt, đun sôi trên lửa lớn rồi hạ lửa vừa luộc trong 12-15 phút đến khi dùng nĩa xiên qua mềm bở tơi.',
        tip: 'Luộc khoai từ nước lạnh giúp khoai chín thấu đều từ trong lõi ra ngoài.'
      },
      {
        step: 3,
        title: 'Nghiền mịn khoai khi còn nóng hổi',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Vớt khoai ra để ráo 1 phút, cho vào âu dùng dụng cụ nghiền khoai hoặc rây mịn khi khoai còn đang bốc khói nóng hổi.',
        tip: 'Nghiền khoai ngay khi còn nóng giúp khoai mịn mượt không bị vón cục lợn cợn.'
      },
      {
        step: 4,
        title: 'Hòa quyện bơ lạt, sữa ấm & Tỏi phi thơm lừng',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Đun ấm sữa tươi cùng 40g bơ lạt cho tan chảy. Rót từ từ bơ sữa ấm vào khoai tây nghiền, dùng phới khuấy đều tay cho khoai bóng mượt như kem lụa. Rắc tỏi phi thơm và tiêu xay lên trên.',
        tip: 'Luôn dùng sữa và bơ ấm nóng để khoai hấp thu chất béo tạo độ dẻo quánh mịn mượt.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Bắt buộc phải đun ấm sữa tươi và bơ lạt trước khi trộn vào khoai tây nghiền còn nóng, giúp khoai hấp thụ chất béo nhanh chóng và đạt độ mịn màng như kem lụa nhung.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bánh mì baguette hoặc bánh mì chuột', amount: 2, unit: 'ổ', category: 'do-kho' },
      { name: 'Bơ lạt Anchor làm mềm', amount: 40, unit: 'g', category: 'khac' },
      { name: 'Tỏi tươi băm thật nhuyễn', amount: 3, unit: 'tép', category: 'rau-cu' },
      { name: 'Lá mùi tây Oregano khô', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Chút xíu muối tinh', amount: 1, unit: 'nhúm', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Cắt lát bánh mì baguette xéo 2cm',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Dùng dao răng cưa cắt bánh mì baguette thành từng lát chéo dày 2cm đều đặn.',
        tip: 'Cắt lát chéo giúp diện tích bề mặt bánh rộng hơn, ngấm được nhiều sốt bơ tỏi.'
      },
      {
        step: 2,
        title: 'Đánh nhuyễn bơ lạt mềm cùng tỏi và lá oregano',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Để bơ lạt ở nhiệt độ phòng cho mềm, trộn đều cùng tỏi băm nhuyễn, 1 muỗng cà phê lá oregano khô và nhúm muối nhỏ thành sốt bơ thơm dẻo quánh.',
        tip: 'Tỏi băm thật nhuyễn để khi nướng tỏi chín mềm thơm mà không bị sượng.'
      },
      {
        step: 3,
        title: 'Phết đều hỗn hợp bơ tỏi lên mặt bánh mì',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Dùng thìa phết một lớp sốt bơ tỏi dày đều lên cả hai mặt của từng lát bánh mì baguette.',
        tip: 'Phết đều đến tận mép viền bánh để bánh nướng giòn tan thơm lừng khắp lát bánh.'
      },
      {
        step: 4,
        title: 'Kỹ thuật nướng giòn vàng ươm thơm nức',
        durationMinutes: 6,
        heatLevel: 'lửa vừa',
        content: 'Xếp bánh vào nồi chiên không dầu hoặc chảo nướng ở 170°C trong 6-7 phút đến khi mặt bánh chuyển sang màu vàng ruộm, viền bánh giòn tan thơm nức mũi.',
        tip: 'Nướng ở nhiệt độ vừa phải để bánh vàng giòn từ từ mà tỏi không bị cháy sém đắng.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Thêm một nhúm lá mùi tây oregano khô vào sốt bơ tỏi và nướng ở 170°C trong 6-7 phút để tỏi chín thơm ngọt dịu mà không bao giờ bị đắng hay cháy xém sém.',
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
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Dưa leo baby giòn', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Cà chua chín tới hoặc cà chua bi', amount: 200, unit: 'g', category: 'rau-cu' },
      { name: 'Hành tây tím thái lát mỏng', amount: 0.5, unit: 'củ', category: 'rau-cu' },
      { name: 'Quả ô-liu đen ngâm muối', amount: 40, unit: 'g', category: 'khac' },
      { name: 'Dầu ô-liu Extra Virgin & Nước cốt chanh vàng', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Cắt khoanh dưa leo baby & Cà chua múi cau',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Dưa leo baby rửa sạch ngâm nước muối loãng, cắt khoanh tròn dày 0.8cm. Cà chua cắt múi cau hoặc bổ đôi nếu dùng cà chua bi.',
        tip: 'Giữ nguyên vỏ dưa leo baby để giữ trọn vẹn độ giòn sần sật mọng nước.'
      },
      {
        step: 2,
        title: 'Ngâm hành tây tím khử hăng giòn ngọt',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Hành tây tím thái khoanh mỏng ngâm ngay vào âu nước đá lạnh 5 phút để loại bỏ vị cay hăng rồi vớt ra thấm ráo.',
        tip: 'Hành tây tím tạo màu sắc tương phản nổi bật và có độ ngọt thanh dễ chịu khi ngâm đá.'
      },
      {
        step: 3,
        title: 'Pha sốt dầu ô liu nguyên chất chanh vàng',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Khuấy đều 2 muỗng canh dầu ô-liu Extra Virgin ép lạnh với 1 muỗng canh nước cốt chanh vàng, muối tiêu và lá kinh giới oregano khô.',
        tip: 'Dầu ô liu nguyên chất ép lạnh mang lại hương thơm thảo mộc tươi mát đặc trưng Địa Trung Hải.'
      },
      {
        step: 4,
        title: 'Trộn nhẹ rau củ & Thả quả ô liu đen',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Cho dưa leo, cà chua và hành tây tím vào đĩa nông lòng. Rưới đẫm sốt dầu giấm chanh lên trên, thả các quả ô liu đen bùi mặn và thưởng thức ngay.',
        tip: 'Trộn nhẹ tay bằng kẹp salad để giữ nguyên hình dạng nguyên vẹn của từng miếng rau củ.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Dùng dầu ô-liu nguyên chất Extra Virgin ép lạnh kết hợp nước cốt chanh vàng tươi tạo nên nốt hương hoa quả Địa Trung Hải sảng khoái và thanh khiết bậc nhất.',
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
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Đọt măng tây xanh tươi giòn', amount: 250, unit: 'g', category: 'rau-cu' },
      { name: 'Cà rốt baby ngọt hoặc cà rốt củ', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Bơ lạt Anchor', amount: 25, unit: 'g', category: 'khac' },
      { name: 'Tỏi băm nhuyễn', amount: 3, unit: 'tép', category: 'rau-cu' },
      { name: 'Muối tiêu gia vị', amount: 1, unit: 'nhúm', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Bẻ gốc già măng tây & Tỉa cà rốt baby',
        durationMinutes: 2,
        heatLevel: 'không dùng nhiệt',
        content: 'Măng tây cầm hai đầu bẻ nhẹ, phần gốc già xơ sẽ tự động gãy bỏ. Rửa sạch ngọn non để ráo. Cà rốt baby cạo vỏ chẻ đôi.',
        tip: 'Bẻ gãy tự nhiên đảm bảo 100% phần giữ lại đều là phần ngọn non giòn mềm ngọt.'
      },
      {
        step: 2,
        title: 'Chần nhanh măng tây qua nước sôi sốc đá',
        durationMinutes: 2,
        heatLevel: 'lửa lớn',
        content: 'Chần măng tây và cà rốt baby trong nồi nước sôi có chút muối trong 40 giây, vớt ra sốc ngay vào âu nước đá lạnh 1 phút rồi để ráo.',
        tip: 'Chần sơ sốc đá giúp măng tây xanh biếc như ngọc bích và không bị nhũn khi áp chảo.'
      },
      {
        step: 3,
        title: 'Áp chảo bơ tỏi trên lửa lớn',
        durationMinutes: 3,
        heatLevel: 'lửa lớn',
        content: 'Đun chảy 25g bơ lạt trên chảo lớn với lửa lớn. Cho tỏi băm vào phi 15 giây cho dậy mùi thơm nức. Trút măng tây và cà rốt vào đảo nhanh tay liên tục trong 2-3 phút.',
        tip: 'Áp chảo trên lửa lớn để bơ bọc một lớp màng óng ánh quanh cọng măng tây.'
      },
      {
        step: 4,
        title: 'Nêm nếm muối hồng tiêu đen giã dập',
        durationMinutes: 1,
        heatLevel: 'lửa lớn',
        content: 'Nêm muối hồng và tiêu đen giã dập, tắt bếp khi măng tây còn căng mọng nước giòn ngọt. Trút ra đĩa trắng phẳng thưởng thức kèm bít tết nóng.',
        tip: 'Rắc tiêu đen xay thô ở giây cuối cùng giúp hương tiêu bốc lên thơm ngát gian bếp.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Cầm cọng măng tây bẻ nhẹ bằng hai tay, măng tây sẽ tự gãy đúng vị trí phân định giữa phần non giòn ngọt và phần gốc già xơ xơ.',
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
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Ức gà phi lê tươi', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Sốt cà chua Marinara kiểu Ý', amount: 150, unit: 'g', category: 'gia-vi' },
      { name: 'Phô mai Mozzarella kéo sợi', amount: 120, unit: 'g', category: 'khac' },
      { name: 'Bột chiên xù & Bột mì', amount: 100, unit: 'g', category: 'do-kho' },
      { name: 'Mì Ý luộc chín tới xóc bơ tỏi', amount: 200, unit: 'g', category: 'do-kho' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Đập dẹt ức gà & Tẩm bột chiên xù',
        durationMinutes: 5,
        heatLevel: 'không dùng nhiệt',
        content: 'Ức gà lạng mỏng, dùng búa dần thịt đập dẹt đều dày khoảng 1.5cm. Lăn gà qua bột mì, nhúng trứng đánh tan rồi áo đều lớp bột chiên xù giòn.',
        tip: 'Đập dẹt giúp ức gà chín đều mọng nước và không bị khô cứng.'
      },
      {
        step: 2,
        title: 'Chiên gà vàng giòn rụm hai mặt',
        durationMinutes: 6,
        heatLevel: 'lửa vừa',
        content: 'Đun nóng chảo dầu trên lửa vừa, thả miếng gà tẩm bột vào chiên 3 phút mỗi mặt đến khi lớp vỏ bột vàng ươm giòn tan, vớt ra khay nướng.',
        tip: 'Chiên trên lửa vừa để vỏ ngoài vàng giòn mà thịt gà bên trong vừa chín tới.'
      },
      {
        step: 3,
        title: 'Phết sốt marinara & Đút lò phô mai Mozzarella chảy xém',
        durationMinutes: 6,
        heatLevel: 'lửa lớn',
        content: 'Múc 2 muỗng canh sốt cà chua marinara phết đều lên miếng gà chiên, rải ngập phô mai Mozzarella kéo sợi lên trên. Cho vào lò nướng hoặc nồi chiên không dầu ở 200°C đút lò 5-6 phút cho phô mai tan chảy xém vàng phồng rộp.',
        tip: 'Nướng lửa trên ở nhiệt độ cao giúp phô mai tạo những đốm nâu caramel xém mặt quyến rũ.'
      },
      {
        step: 4,
        title: 'Xóc mì Ý bơ tỏi & Hoàn thiện đĩa ăn',
        durationMinutes: 3,
        heatLevel: 'không dùng nhiệt',
        content: 'Xóc đĩa mì Ý nóng hổi với chút bơ tỏi và lá parsley. Đặt miếng gà nướng phô mai bốc khói kéo sợi lên đĩa mì Ý, rắc phô mai Parmesan bào mịn và thưởng thức ngay.',
        tip: 'Thưởng thức khi phô mai còn đang sôi lăn tăn trên bề mặt gà để cảm nhận độ giòn ngậy đỉnh cao.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Đút lò ở nhiệt độ cao 200°C trong 5-6 phút để lớp phô mai Mozzarella tan chảy xém vàng phồng rộp mà miếng ức gà bên trong vẫn giữ nguyên độ ẩm mềm mọng nước.',
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
    difficulty: 'Cầu kỳ',
    ingredients: [
      { name: 'Thịt bắp bò (hoặc thăn bò)', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Cà rốt', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Khoai tây', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Nấm mỡ tươi', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Rượu vang đỏ Đà Lạt', amount: 150, unit: 'ml', category: 'gia-vi' },
      { name: 'Bơ tỏi & lá thơm Thyme', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Cắt khối thăn bò & Áp chảo xém nâu vàng',
        durationMinutes: 5,
        heatLevel: 'lửa lớn',
        content: 'Thịt bò cắt khối vuông dày 3x3cm, ướp muối tiêu trong 10 phút. Làm nóng chảo với chút dầu trên lửa lớn, áp chảo thịt bò cho xém nâu vàng các mặt để khóa chặt nước ngọt bên trong, gắp ra đĩa.',
        tip: 'Áp chảo tạo phản ứng Maillard giúp thịt bò có màu nâu caramel đậm đà và mùi thơm nồng nàn.'
      },
      {
        step: 2,
        title: 'Xào rau củ thơm & Khử chảo deglaze bằng rượu vang',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Xào hành tây, tỏi và cà rốt với bơ lạt cho thơm ngọt. Rót 150ml rượu vang đỏ vào chảo nóng, dùng thìa gỗ cạo sạch lớp caramel bám đáy chảo (deglaze) hòa quyện vào nước sốt.',
        tip: 'Kỹ thuật deglaze là linh hồn tạo nên độ sâu hương vị rượu vang nồng ấm của ẩm thực Pháp.'
      },
      {
        step: 3,
        title: 'Hầm riu riu lửa nhỏ 35 phút mềm rục',
        durationMinutes: 30,
        heatLevel: 'riu riu',
        content: 'Cho thịt bò trở lại nồi cùng khoai tây, lá nguyệt quế và nhánh thyme. Đổ nước dùng bò ngập ngang thịt, đậy nắp đun sôi rồi hạ lửa nhỏ riu riu hầm trong 30-35 phút cho thịt bò mềm rục tan trong miệng.',
        tip: 'Hầm lửa riu riu giúp gân bò chuyển hóa thành gelatin dẻo mềm béo ngậy.'
      },
      {
        step: 4,
        title: 'Thêm nấm mỡ sên sốt sánh kẹo nâu óng',
        durationMinutes: 5,
        heatLevel: 'lửa vừa',
        content: 'Thêm nấm mỡ cắt đôi vào đun thêm 5 phút cho nước sốt rút lại keo sánh nâu óng ả bao quanh thịt bò. Nêm lại muối tiêu vừa miệng, múc ra đĩa sâu lòng ăn kèm bánh mì nướng giòn.',
        tip: 'Nấm mỡ cho vào cuối để nấm không bị nhũn nát và hút trọn vị sốt rượu vang thơm phức.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Kỹ thuật deglaze: Đổ rượu vang đỏ vào chảo nóng ngay sau khi áp chảo thịt bò, dùng thìa gỗ cạo sạch các mảng caramel bám đáy chảo để hòa tan trọn vẹn vị umami đậm đà nhất vào nước sốt.',
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
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Mì Ý sợi dài Spaghetti lúa mì cứng', amount: 300, unit: 'g', category: 'do-kho' },
      { name: 'Tôm sú tươi bóc nõn', amount: 200, unit: 'g', category: 'thit-ca' },
      { name: 'Mực ống tươi cắt khoanh', amount: 150, unit: 'g', category: 'thit-ca' },
      { name: 'Sốt Pesto húng tây kiểu Ý (Basil Pesto)', amount: 80, unit: 'g', category: 'gia-vi' },
      { name: 'Dầu ô liu & Tỏi lát', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      {
        step: 1,
        title: 'Luộc mì Ý Al Dente giữ lại nước luộc',
        durationMinutes: 8,
        heatLevel: 'lửa lớn',
        content: 'Đun sôi 2 lít nước với 1 muỗng canh muối hạt, thả mì Ý vào luộc 8 phút cho sợi mì chín chuẩn al dente (còn lõi cứng nhẹ). Vớt mì ra rổ, giữ lại 1 chén nước luộc mì giàu tinh bột.',
        tip: 'Nước luộc mì chứa tinh bột quý giá giúp tạo nhũ tương liên kết sốt dầu ô liu bám chặt vào sợi mì.'
      },
      {
        step: 2,
        title: 'Xào hải sản tôm mực lửa lớn chín tới',
        durationMinutes: 3,
        heatLevel: 'lửa lớn',
        content: 'Làm nóng chảo với 2 muỗng canh dầu ô liu, phi thơm tỏi lát. Cho tôm sú bóc nõn và mực cắt khoanh vào xào trên lửa lớn trong 2 phút cho hải sản vừa chín tới giòn ngọt, trút ra đĩa riêng.',
        tip: 'Xào hải sản thật nhanh trên lửa lớn để tôm mực không bị dai và không bị ra nước.'
      },
      {
        step: 3,
        title: 'Xóc mì cùng nước luộc tạo nhũ tương',
        durationMinutes: 2,
        heatLevel: 'lửa vừa',
        content: 'Cho mì Ý đã ráo vào chảo tỏi, rưới 1/2 chén nước luộc mì vào xóc đều tay trên lửa vừa 1 phút cho sợi mì ngấm dầu ô liu bóng bẩy.',
        tip: 'Xóc mì liên tục giúp dầu và nước luộc mì hòa quyện thành lớp sốt óng ánh mịn màng.'
      },
      {
        step: 4,
        title: 'Trộn sốt Pesto húng tây xanh mướt tắt bếp',
        durationMinutes: 1,
        heatLevel: 'không dùng nhiệt',
        content: 'Tắt bếp hoàn toàn, cho 80g sốt Pesto húng tây và tôm mực xào vào chảo mì. Đảo nhanh tay cho sốt xanh ngọc bích bao bọc đều từng sợi mì. Múc ra đĩa, rắc phô mai Parmesan và lá húng quế tươi thưởng thức.',
        tip: 'Tắt bếp trước khi trộn sốt Pesto để nhiệt độ cao không làm sốt bị thâm đen và mất mùi thơm húng tây.'
      }
    ],
    chefTip: 'Bí quyết đầu bếp: Tuyệt đối không nấu sốt Pesto trên lửa lớn vì nhiệt cao sẽ làm lá húng tây basil bị đen xỉn và dầu ô liu mất mùi thơm tươi mới. Hãy tắt bếp trước khi trộn sốt Pesto vào mì nóng.',
    tags: ['Món Âu', 'Món Mặn', 'Mì Ý Pesto', 'Hải Sản', 'Địa Trung Hải', 'Western Food']
  }
];

export const AUTHENTIC_REGIONAL_RECIPES: Recipe[] = [
  // --- MIỀN BẮC AUTHENTIC DISHES ---
  {
    id: 'canh-suon-nau-sau',
    title: 'Canh Sườn Nấu Sấu Chua Hà Nội',
    description: 'Món canh giải nhiệt kinh điển đất Bắc: Sườn non ninh mềm ngọt nước kết hợp vị chua thanh đặc trưng của quả sấu Hà Nội, cà chua và mùi tàu hành hoa.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 280,
    estimatedCostVnd: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Sườn non heo chặt khúc', amount: 400, unit: 'g', category: 'thit-ca' },
      { name: 'Sấu tươi Hà Nội cạo vỏ', amount: 5, unit: 'quả', category: 'rau-cu' },
      { name: 'Cà chua chín', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Hành hoa & Mùi tàu thái nhỏ', amount: 1, unit: 'nắm', category: 'rau-cu' },
      { name: 'Nước mắm & Hạt nêm', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Chần sườn heo', durationMinutes: 5, heatLevel: 'lửa lớn', content: 'Chần sườn qua nước sôi pha muối loãng, rửa sạch bọt bẩn để nước canh trong ngọt.', tip: 'Chần sườn giúp nước canh trong veo không bị đục.' },
      { step: 2, title: 'Ninh sườn cùng sấu', durationMinutes: 15, heatLevel: 'lửa vừa', content: 'Xào sườn với chút mắm cho săn, đổ 1.2 lít nước vào đun sôi, thả sấu vào ninh lửa vừa 15 phút cho sườn mềm nhừ.', tip: 'Dầm sấu khi sấu đã mềm rồi vớt bỏ hạt.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Khi sấu chín mềm, vớt ra bát dầm nát lọc lấy nước chua thanh rồi trút ngược lại nồi canh, nêm chút nước mắm ngon trước khi tắt bếp để canh dậy mùi thơm.',
    tags: ['Miền Bắc', 'Món Canh', 'Canh Chua', 'Sườn Non', 'Cơm Gia Đình']
  },
  {
    id: 'rau-cai-luoc-cham-trung',
    title: 'Rau Cải Ngọt Luộc Chấm Trứng Dầm Nước Mắm Gừng',
    description: 'Đĩa rau cải ngọt luộc xanh mướt giòn ngọt, chấm ngập chén nước mắm gừng ớt dầm trứng gà lòng đào béo ngậy the cay đưa cơm.',
    category: 'mon-rau',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 4,
    calories: 120,
    estimatedCostVnd: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Rau cải ngọt tươi non', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Trứng gà ta luộc lòng đào', amount: 2, unit: 'quả', category: 'thit-ca' },
      { name: 'Nước mắm cá cơm & Gừng ớt băm', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Luộc rau cải xanh giòn', durationMinutes: 5, heatLevel: 'lửa lớn', content: 'Đun nước sôi bùng với chút muối hạt, thả rau cải vào luộc 3 phút vừa chín tới, vớt ngay ra đĩa ráo nước.', tip: 'Luộc lửa lớn ngập nước giúp rau giữ màu xanh ngọc bích.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Cho chút muối hạt vào nồi nước luộc đang sôi bùng, vớt rau ra sốc qua nước đá lạnh 30 giây rồi để ráo, đĩa rau sẽ giữ trọn màu xanh mướt và độ giòn ngọt mọng nước.',
    tags: ['Miền Bắc', 'Món Rau', 'Rau Cải', 'Eat Clean', 'Dễ Làm']
  },
  {
    id: 'canh-bi-nau-tom',
    title: 'Canh Bí Xanh Nấu Tôm Tươi Ngọt Thanh',
    description: 'Vị ngọt thanh khiết mùa hè: Bí xanh non thái mỏng nấu cùng tôm đồng giã dập ngọt lịm, rắc hành hoa mùi tàu thơm ngát.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 140,
    estimatedCostVnd: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bí đao non (bí xanh)', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Tôm tươi bóc nõn giã dập', amount: 150, unit: 'g', category: 'thit-ca' },
      { name: 'Hành hoa & Ngò rí', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Xào tôm & Nấu canh', durationMinutes: 8, heatLevel: 'lửa vừa', content: 'Phi thơm đầu hành, trút tôm vào đảo săn rồi thêm 1 lít nước đun sôi. Thả bí xanh vào nấu chín tới trong 4 phút.', tip: 'Không nấu bí quá nhừ để giữ độ giòn ngọt.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Tôm giã dập cùng đầu hành và chút tiêu trắng trước khi xào giúp nước canh thơm ngọt đậm sâu mà không cần dùng đến bột ngọt hay hạt nêm.',
    tags: ['Miền Bắc', 'Món Canh', 'Bí Xanh', 'Thanh Mát', 'Eat Clean']
  },
  {
    id: 'bap-cai-xao-toi',
    title: 'Bắp Cải Xào Tỏi Phi Giòn Thơm',
    description: 'Bắp cải tươi ngọt xào lửa lớn cùng tỏi đập dập thơm lừng, lá rau giòn sần sật đậm đà gia vị.',
    category: 'mon-rau',
    region: 'bac',
    prepTimeMinutes: 8,
    cookTimeMinutes: 7,
    servings: 4,
    calories: 110,
    estimatedCostVnd: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bắp cải non thái sợi', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Tỏi khô đập dập', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Dầu ăn & Tiêu xay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Xào bắp cải lửa lớn', durationMinutes: 5, heatLevel: 'lửa lớn', content: 'Phi tỏi thơm vàng trên lửa lớn, trút bắp cải vào đảo nhanh tay 4 phút cho chín tới giòn ngọt, rắc tiêu xay rồi tắt bếp.', tip: 'Xào lửa lớn giữ trọn vị ngọt tự nhiên của bắp cải.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Bắp cải sau khi thái ngâm nước muối loãng vớt ra để thật ráo nước. Xào trên chảo thật nóng lửa to để rau chín nhanh giòn sần sật mà không bị ra nước.',
    tags: ['Miền Bắc', 'Món Rau', 'Bắp Cải', 'Dễ Làm', 'Tiết Kiệm']
  },
  {
    id: 'canh-ca-chua-dau-phu',
    title: 'Canh Cà Chua Đậu Phụ Hành Hoa Thanh Nhẹ',
    description: 'Món canh mộc mạc thơm lành: Đậu phụ Mơ mềm mướt béo ngậy nấu cùng cà chua đỏ mọng, chua dịu thơm nức mùi hành hoa mùi tàu.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 4,
    calories: 130,
    estimatedCostVnd: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Đậu phụ Mơ cắt khối vuông', amount: 3, unit: 'bìa', category: 'do-kho' },
      { name: 'Cà chua bổ múi cau', amount: 3, unit: 'quả', category: 'rau-cu' },
      { name: 'Hành hoa & Mùi tàu thái nhỏ', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Xào cà chua & Nấu đậu', durationMinutes: 8, heatLevel: 'lửa vừa', content: 'Xào cà chua chín mềm tạo màu đỏ đẹp, thêm nước đun sôi lăn tăn, nhẹ nhàng thả đậu phụ vào đun sôi 3 phút rồi thả hành hoa.', tip: 'Thả đậu phụ nhẹ tay để đậu không bị vỡ nát.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Xào cà chua với chút dầu ăn và muối trước khi châm nước để cà chua ra màu đỏ óng ánh tự nhiên, thả đậu hũ vào đun sôi nhỏ lửa cho đậu ngấm vị chua ngọt dịu mát.',
    tags: ['Miền Bắc', 'Món Canh', 'Đậu Phụ', 'Tiết Kiệm', 'Ăn Chay']
  },
  {
    id: 'dua-cai-chua-ha-noi',
    title: 'Dưa Cải Muối Chua Giòn Hà Nội',
    description: 'Món dưa muối truyền thống lên men giòn rụm màu vàng óng, chua thanh cay dịu với ớt tươi và hành củ, ăn kèm thịt kho cá kho tuyệt đỉnh.',
    category: 'mon-rau',
    region: 'bac',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 45,
    estimatedCostVnd: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Dưa cải sen muối chua vàng giòn', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Hành củ muối chua & Ớt tươi', amount: 3, unit: 'củ', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Trộn dưa chua bày đĩa', durationMinutes: 3, heatLevel: 'không dùng nhiệt', content: 'Dưa cải chua vớt ráo, cắt khúc vừa ăn, trộn cùng vài lát ớt tươi và hành củ muối, bày ra đĩa ăn kèm cơm nóng.', tip: 'Chấm nước kho thịt kho cá là chuẩn vị Bắc.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Dưa cải chua vắt nhẹ nước trước khi bày ra đĩa, chấm cùng nước thịt kho cá kho sẽ bùng nổ hương vị thơm ngon chống ngấy hoàn hảo.',
    tags: ['Miền Bắc', 'Món Rau', 'Dưa Chua', 'Truyền Thống', 'Đồng Quê']
  },
  {
    id: 'canh-nam-sau-chua-thanh',
    title: 'Canh Nấm Hương Sấu Chua Thanh Tịnh',
    description: 'Thực đơn chay thanh khiết chùa Trầm: Nấm hương nấm đùi gà tươi thơm ngọt nấu cùng sấu chua Hà Nội và đậu hũ non thanh mát.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 4,
    calories: 110,
    estimatedCostVnd: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Nấm hương & Nấm rơm tươi', amount: 200, unit: 'g', category: 'rau-cu' },
      { name: 'Sấu tươi cạo vỏ', amount: 4, unit: 'quả', category: 'rau-cu' },
      { name: 'Đậu hũ non cắt quân cờ', amount: 2, unit: 'bìa', category: 'do-kho' },
      { name: 'Cà chua bi & Mùi tàu', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Nấu canh nấm sấu', durationMinutes: 10, heatLevel: 'lửa vừa', content: 'Xào nấm với chút dầu thực vật, châm 1 lít nước đun sôi cùng sấu. Dầm sấu chua thanh rồi thả đậu hũ non và rắc mùi tàu.', tip: 'Nấu sấu chín mềm trước khi dầm chua.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Dầm sấu chín tới tạo vị chua thanh tao dịu nhẹ làm nổi bật trọn vẹn vị ngọt đậm của nấm hương tươi mà không lấn át hương thảo mộc.',
    tags: ['Miền Bắc', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Món Canh']
  },
  {
    id: 'bo-sot-vang',
    title: 'Bò Sốt Vang Quế Hồi Hà Nội',
    description: 'Đặc sản mùa đông phố cổ: Dẻ sườn bò ninh mềm nhừ đượm hương quế hồi thảo quả và rượu vang đỏ, nước sốt gấc sánh kẹo đỏ cam thơm lừng nức mũi.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
    servings: 4,
    calories: 480,
    estimatedCostVnd: 110000,
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Dẻ sườn hoặc bắp bò cắt quân cờ', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Rượu vang đỏ & Quế hồi thảo quả', amount: 50, unit: 'ml', category: 'gia-vi' },
      { name: 'Khoai tây & Cà rốt', amount: 2, unit: 'củ', category: 'rau-cu' },
      { name: 'Sốt cà chua & Bột gấc tạo màu', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Ướp bò với quế hồi rượu vang', durationMinutes: 15, heatLevel: 'không dùng nhiệt', content: 'Ướp thịt bò với rượu vang đỏ, bột quế, hồi nướng thơm, tỏi băm và hạt nêm trong 15 phút.', tip: 'Ướp rượu vang giúp thịt bò mềm ngọt ngấm gia vị sâu.' },
      { step: 2, title: 'Hầm sốt vang sánh mịn', durationMinutes: 30, heatLevel: 'lửa nhỏ', content: 'Xào săn thịt bò, đổ nước ngập hầm lửa nhỏ 30 phút. Cho khoai tây cà rốt vào hầm thêm 10 phút cho sốt sánh đậm.', tip: 'Hầm lửa nhỏ giúp thịt bò mềm rục mà không bị khô.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Dùng chút bột gấc tươi xào cùng sốt cà chua tạo màu đỏ cam óng ánh tuyệt đẹp đúng chất sốt vang cổ truyền Hà Nội.',
    tags: ['Miền Bắc', 'Món Mặn', 'Bò Sốt Vang', 'Đổi Vị', 'Giàu Đạm']
  },
  {
    id: 'salad-dau-giam-ha-noi',
    title: 'Salad Dầu Giấm Xà Lách Cà Chua Hà Nội',
    description: 'Đĩa xà lách ta giòn mọng nước, cà chua dưa leo thanh mát rưới sốt dầu giấm chua ngọt truyền thống giải ngấy tuyệt hảo.',
    category: 'mon-rau',
    region: 'bac',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 4,
    calories: 95,
    estimatedCostVnd: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Xà lách ta mọng nước', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Cà chua & Dưa chuột', amount: 2, unit: 'quả', category: 'rau-cu' },
      { name: 'Sốt giấm đường tỏi ớt dầu mè', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Trộn salad dầu giấm', durationMinutes: 5, heatLevel: 'không dùng nhiệt', content: 'Rau rửa sạch để ráo vắt kiệt nước. Rưới sốt dầu giấm chua ngọt lên trên ngay trước khi ăn để xà lách giòn tan.', tip: 'Chỉ trộn sốt ngay trước bữa ăn để xà lách không bị ỉu.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Pha giấm gạo với chút đường thốt nốt và dầu mè thơm, rưới nhẹ lên xà lách khô ráo giòn ngọt kích thích vị giác tối đa.',
    tags: ['Miền Bắc', 'Món Rau', 'Salad', 'Eat Clean', 'Đổi Vị']
  },
  {
    id: 'canh-sup-khoai-tay',
    title: 'Canh Súp Khoai Tây Cà Rốt Sườn Heo',
    description: 'Khoai tây bở tơi ngọt bùi, cà rốt thơm ngọt ninh nhừ cùng sườn non heo béo ngậy, món canh gia đình thân thương ngày lạnh.',
    category: 'mon-canh',
    region: 'bac',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    calories: 240,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Sườn non heo chặt khúc', amount: 300, unit: 'g', category: 'thit-ca' },
      { name: 'Khoai tây cắt miếng vừa', amount: 3, unit: 'củ', category: 'rau-cu' },
      { name: 'Cà rốt cắt khúc hoa', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Hành hoa & Mùi ta', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Ninh sườn với củ quả', durationMinutes: 25, heatLevel: 'lửa nhỏ', content: 'Ninh sườn 15 phút, cho khoai tây cà rốt vào ninh thêm 10 phút đến khi khoai bở tơi, nêm vừa ăn và rắc hành mùi.', tip: 'Không ninh khoai tây quá lâu tránh bị nát đục nước.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Xào khoai tây cà rốt sơ qua với chút dầu ăn và hạt nêm trước khi thả vào nồi nước dùng giúp miếng khoai giữ nguyên hình khối mà bên trong vẫn bở tơi thơm ngọt.',
    tags: ['Miền Bắc', 'Món Canh', 'Khoai Tây', 'Sườn Non', 'Cơm Nhà']
  },
  {
    id: 'ca-chep-om-dua',
    title: 'Cá Chép Om Dưa Chua Cay Bắc Bộ',
    description: 'Đặc sản trứ danh ẩm thực Bắc: Cá chép tươi rán vàng óng om cùng dưa cải chua giòn, thì là hành hoa thơm nức, vị chua cay đậm đà ấm nồng.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 12,
    cookTimeMinutes: 25,
    servings: 4,
    calories: 420,
    estimatedCostVnd: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Cá chép sông tươi làm sạch', amount: 700, unit: 'g', category: 'thit-ca' },
      { name: 'Dưa cải sen muối chua', amount: 300, unit: 'g', category: 'rau-cu' },
      { name: 'Thì là, hành hoa, ớt hiểm', amount: 1, unit: 'nắm', category: 'rau-cu' },
      { name: 'Cà chua & Nghệ tươi giã', amount: 2, unit: 'quả', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Rán sơ cá & Xào dưa', durationMinutes: 10, heatLevel: 'lửa vừa', content: 'Rán cá chép vàng đều hai mặt. Xào cà chua và dưa chua với chút mỡ cá cho mềm ngấu.', tip: 'Rán cá trước giúp thịt săn chắc không bị nát khi om.' },
      { step: 2, title: 'Om cá với dưa chua cay', durationMinutes: 15, heatLevel: 'lửa nhỏ', content: 'Đặt cá vào chảo dưa, châm nước sôi ngập 1/2 thân cá, nêm ớt hiểm, đậy vung om 15 phút cho cá ngấm vị chua cay đậm đà, rắc thì là hành hoa.', tip: 'Om lửa nhỏ liu riu cho vị chua ngọt hòa quyện vào thớ cá.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Thêm chút mỡ gà hoặc tóp mỡ xào cùng dưa cải chua trước khi om giúp nước om cá bóng bẩy ngậy béo và khử hoàn toàn vị tanh của cá chép.',
    tags: ['Miền Bắc', 'Cay Nồng', 'Món Mặn', 'Cá Chép Om Dưa', 'Đậm Đà']
  },
  {
    id: 'thit-dong-dua-chua',
    title: 'Thịt Đông Mộc Nhĩ Dưa Chua Bắc Bộ',
    description: 'Món ăn Tết cổ truyền đất Bắc: Chân giò heo ninh mềm trong veo đông như thạch cùng mộc nhĩ nấm hương giòn sần sật, ăn kèm dưa chua cay giòn tan.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
    servings: 4,
    calories: 460,
    estimatedCostVnd: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Thịt chân giò & Bì heo', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Mộc nhĩ & Nấm hương ngâm nở', amount: 50, unit: 'g', category: 'do-kho' },
      { name: 'Nước mắm ngon & Tiêu sọ xay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Ninh nhừ thịt chân giò', durationMinutes: 40, heatLevel: 'lửa nhỏ', content: 'Ninh thịt chân giò cùng bì heo cho nhừ tơi, thả mộc nhĩ nấm hương đảo đều 5 phút. Múc ra âu để nguội cho đông thành khối trong veo.', tip: 'Bì heo tạo gelatin tự nhiên giúp thịt đông chắc.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Dùng nhiều bì heo cạo sạch ninh kỹ để tiết collagen gelatin tự nhiên giúp bát thịt đông trong vắt như thạch ngọc, ăn kèm dưa cải muối chua ngon quên sầu.',
    tags: ['Miền Bắc', 'Món Mặn', 'Thịt Đông', 'Truyền Thống', 'Đồng Quê']
  },
  {
    id: 'nem-ran-ha-noi',
    title: 'Nem Rán Hà Nội Vỏ Giòn Rụm',
    description: 'Món ngon nức tiếng Thủ Đô: Nem rán nhân thịt băm, tôm nõn, mộc nhĩ nấm hương, miến dong cuốn bánh đa nem rán vàng ruộm giòn tan rụm rụm.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 490,
    estimatedCostVnd: 80000,
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Thịt nạc dăm heo xay', amount: 300, unit: 'g', category: 'thit-ca' },
      { name: 'Tôm nõn băm nhỏ', amount: 100, unit: 'g', category: 'thit-ca' },
      { name: 'Mộc nhĩ, miến dong, giá đỗ, cà rốt', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Bánh đa nem Hà Nội & Trứng gà', amount: 1, unit: 'tệp', category: 'do-kho' }
    ],
    instructions: [
      { step: 1, title: 'Trộn nhân & Cuốn nem', durationMinutes: 10, heatLevel: 'không dùng nhiệt', content: 'Trộn đều thịt, tôm, miến, mộc nhĩ với lòng đỏ trứng. Cuốn chặt tay từng chiếc nem thon đều.', tip: 'Không cho quá nhiều trứng làm nhân bị nhão chảy nước.' },
      { step: 2, title: 'Rán nem 2 lửa giòn rụm', durationMinutes: 15, heatLevel: 'lửa vừa', content: 'Rán ngập dầu lửa vừa cho chín tới lần 1. Khi ăn rán lại lần 2 lửa lớn cho vỏ ngoài vàng ruộm giòn tan.', tip: 'Kỹ thuật rán 2 lửa giúp nem giòn rụm hàng giờ không ỉu.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Quết chút giấm ăn pha bia lên mặt bánh đa nem trước khi gói giúp vỏ nem khi rán có màu vàng cánh gián óng ả và giòn tan suốt cả buổi.',
    tags: ['Miền Bắc', 'Món Mặn', 'Nem Rán', 'Đặc Sản', 'Yêu Thích']
  },
  {
    id: 'ca-kho-rieng-tieu-ot',
    title: 'Cá Kho Riềng Tiêu Ớt Đất Bắc Cay Nồng',
    description: 'Hương vị niêu cá đồng ấm cúng: Cá kho 2 lửa lót riềng già thái lát, ớt chỉ thiên và tiêu sọ the cay, thịt cá săn chắc thơm nồng đượm khói bếp.',
    category: 'mon-man',
    region: 'bac',
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 4,
    calories: 380,
    estimatedCostVnd: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cá trôi hoặc cá bống sông', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Riềng già thái lát', amount: 1, unit: 'củ', category: 'rau-cu' },
      { name: 'Ớt hiểm chỉ thiên & Tiêu sọ', amount: 5, unit: 'quả', category: 'gia-vi' },
      { name: 'Nước hàng cốt dừa & Nước mắm cốt', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Xếp riềng & Kho cá 2 lửa', durationMinutes: 30, heatLevel: 'lửa nhỏ', content: 'Lót riềng kín đáy nồi, xếp cá lên trên, ướp nước mắm và nước hàng 15 phút. Đun sôi rồi hạ lửa liu riu kho cạn keo sánh nước.', tip: 'Kho 2 lửa giúp thịt cá rắn chắc đậm đà.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Đun cá cạn nước lần 1 rồi châm thêm 1 chén nước sôi nóng kho tiếp lần 2 lửa nhỏ liu riu, thịt cá sẽ ngấu đều vị cay ấm của riềng tiêu ăn rất bắt cơm.',
    tags: ['Miền Bắc', 'Cay Nồng', 'Món Mặn', 'Cá Kho', 'Đậm Đà']
  },

  // --- MIỀN TRUNG AUTHENTIC DISHES ---
  {
    id: 'ca-nuc-kho-keo',
    title: 'Cá Nục Kho Keo Mật Mía Ớt Xiêm Miền Trung',
    description: 'Cá nục biển tươi kho cùng mật mía sánh kẹo màu cánh gián, ớt xiêm xanh cay xé lưỡi, nước kho đậm đà mặn ngọt the nồng đặc trưng xứ Quảng.',
    category: 'mon-man',
    region: 'trung',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    calories: 390,
    estimatedCostVnd: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cá nục biển tươi làm sạch', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Mật mía Nghệ An & Nước mắm cá cơm', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Ớt xiêm xanh đập dập', amount: 8, unit: 'quả', category: 'gia-vi' },
      { name: 'Hành tăm (củ nén) băm', amount: 1, unit: 'muỗng canh', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Kho keo cá nục', durationMinutes: 25, heatLevel: 'lửa nhỏ', content: 'Phi hành tăm thơm, cho cá nục vào rim cùng mật mía, nước mắm và ớt xiêm. Kho lửa nhỏ đến khi nước kho kẹo lại óng ánh keo dẻo.', tip: 'Mật mía giúp cá săn cứng màu cánh gián óng ả.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Phi thơm củ nén (hành tăm) giã dập với dầu lạc trước khi kho, mật mía sẽ quyện chặt vào thớ cá tạo độ giòn săn chắc tuyệt hảo.',
    tags: ['Miền Trung', 'Cay Nồng', 'Món Mặn', 'Cá Biển', 'Đậm Đà']
  },
  {
    id: 'canh-chua-ca-nam',
    title: 'Canh Chua Cá Biển Miền Trung Thơm Chua',
    description: 'Bát canh chua dải đất miền Trung với cá biển tươi ngọt, dứa thơm, cà chua, me chua dịu và chút ớt bột cay nồng kích thích vị giác.',
    category: 'mon-canh',
    region: 'trung',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 200,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Cá biển tươi cắt khúc', amount: 350, unit: 'g', category: 'thit-ca' },
      { name: 'Dứa chín & Cà chua', amount: 0.5, unit: 'quả', category: 'rau-cu' },
      { name: 'Me vắt & Ớt xiêm dầm', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Hành hoa & Rau ngổ', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Nấu canh chua cá biển', durationMinutes: 12, heatLevel: 'lửa vừa', content: 'Đun nước sôi cùng nước cốt me, thả cá biển vào đun chín tới. Cho dứa và cà chua vào sôi bùng, nêm nước mắm và ớt xiêm.', tip: 'Thả cá khi nước sôi sùng sục để không bị tanh.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Nấu nước thật sôi mới thả cá biển vào, thêm chút ớt bột cay và rau ngổ thái nhỏ khi tắt bếp để đánh thức hương vị biển miền Trung.',
    tags: ['Miền Trung', 'Món Canh', 'Canh Chua', 'Cá Biển', 'Thanh Mát']
  },
  {
    id: 'rau-khoai-lang-luoc-cham-mam-nem',
    title: 'Rau Khoai Lang Luộc Chấm Mắm Nêm Miền Trung',
    description: 'Đọt rau khoai lang tươi non luộc xanh mướt giòn ngọt, chấm chén mắm nêm cá cơm Dì Cẩn tỏi ớt dứa băm chua cay nồng nàn.',
    category: 'mon-rau',
    region: 'trung',
    prepTimeMinutes: 5,
    cookTimeMinutes: 6,
    servings: 4,
    calories: 105,
    estimatedCostVnd: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Đọt rau khoai lang tươi non', amount: 500, unit: 'g', category: 'rau-cu' },
      { name: 'Mắm nêm Dì Cẩn pha tỏi ớt dứa', amount: 3, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Luộc rau khoai lang', durationMinutes: 4, heatLevel: 'lửa lớn', content: 'Nước sôi già thả rau lang vào luộc 3 phút vừa chín tới, vớt ra đĩa ráo nước.', tip: 'Không đậy vung khi luộc để rau giữ màu xanh mướt.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Pha mắm nêm với dứa băm nhuyễn, nước cốt chanh tươi, tỏi ớt băm và chút đường tạo độ sánh sệt thơm nức mũi.',
    tags: ['Miền Trung', 'Món Rau', 'Rau Lang', 'Đồng Quê', 'Dễ Làm']
  },
  {
    id: 'canh-hen-nau-rau-tap-tang',
    title: 'Canh Hến Nấu Rau Tập Tàng Xứ Huế',
    description: 'Hương vị sông Hương cồn Hến: Nước luộc hến ngọt lịm nấu cùng rau mồng tơi, rau dền, ngót ngọt thanh mát xua tan cái nóng miền Trung.',
    category: 'mon-canh',
    region: 'trung',
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 4,
    calories: 140,
    estimatedCostVnd: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Thịt hến tươi & Nước luộc hến', amount: 200, unit: 'g', category: 'thit-ca' },
      { name: 'Rau tập tàng (mồng tơi, rau dền, bồ ngót)', amount: 400, unit: 'g', category: 'rau-cu' },
      { name: 'Hành khô & Nước mắm ngon', amount: 1, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Nấu canh hến rau', durationMinutes: 6, heatLevel: 'lửa vừa', content: 'Xào thơm thịt hến với hành khô, đổ nước luộc hến đã lắng trong vào đun sôi, thả rau tập tàng vào sôi 2 phút rồi tắt bếp.', tip: 'Lắng thật kỹ nước luộc hến để loại bỏ hết cặn cát.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Xào thịt hến với chút ớt bột Huế và hành khô cho săn thơm trước khi trút nước dùng vào, canh sẽ ngọt đậm đà thơm ngát.',
    tags: ['Miền Trung', 'Món Canh', 'Hến Huế', 'Thanh Mát', 'Đồng Quê']
  },

  // --- MIỀN NAM AUTHENTIC DISHES ---
  {
    id: 'canh-kho-qua-don-thit',
    title: 'Canh Khổ Qua Dồn Thịt Băm Thanh Mát Nam Bộ',
    description: 'Món canh truyền thống Nam Bộ: Mướp đắng dồn thịt nạc dăm mộc nhĩ ninh nước dùng trong ngọt, vị đắng thanh giải nhiệt mát gan.',
    category: 'mon-canh',
    region: 'nam',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 230,
    estimatedCostVnd: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Mướp đắng (khổ qua) bào khúc', amount: 3, unit: 'quả', category: 'rau-cu' },
      { name: 'Thịt nạc dăm heo xay', amount: 250, unit: 'g', category: 'thit-ca' },
      { name: 'Mộc nhĩ ngâm nở băm nhỏ', amount: 20, unit: 'g', category: 'do-kho' },
      { name: 'Hành hoa & Ngò rí', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Nhồi thịt vào khổ qua', durationMinutes: 8, heatLevel: 'không dùng nhiệt', content: 'Khổ qua móc ruột, nhồi chặt nhân thịt băm mộc nhĩ đã nêm tiêu mắm.', tip: 'Cắt khổ qua khoanh vừa ăn giúp nhanh chín mềm.' },
      { step: 2, title: 'Nấu nước dùng trong ngọt', durationMinutes: 15, heatLevel: 'lửa nhỏ', content: 'Đun sôi nước dùng, thả khổ qua vào hầm lửa vừa 15 phút đến khi chín mềm, vớt bọt thường xuyên.', tip: 'Không đậy vung để nước canh trong veo.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Chần sơ khổ qua qua nước sôi trước khi nhồi thịt để giảm bớt vị đắng gắt, khi ninh không đậy nắp giúp nước canh trong veo ngọt thanh.',
    tags: ['Miền Nam', 'Món Canh', 'Khổ Qua', 'Thanh Nhiệt', 'Cơm Mẹ Nấu']
  },
  {
    id: 'thit-kho-to',
    title: 'Thịt Ba Rọi Kho Tộ Tiêu Đen Nam Bộ',
    description: 'Món mặn đậm đà miền sông nước: Thịt ba chỉ thái dày kho trong tộ đất với nước dừa xiêm, nước mắm kẹo dẻo và tiêu đen cay thơm nức mũi.',
    category: 'mon-man',
    region: 'nam',
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 4,
    calories: 510,
    estimatedCostVnd: 80000,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Thịt ba rọi rút sườn thái miếng dày', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Nước dừa tươi Bến Tre', amount: 200, unit: 'ml', category: 'khac' },
      { name: 'Nước mắm nhĩ Phú Quốc', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Tiêu đen xay vỡ & Ớt hiểm', amount: 2, unit: 'muỗng cà phê', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Kho tộ thịt ba rọi', durationMinutes: 30, heatLevel: 'lửa nhỏ', content: 'Xào săn thịt ba chỉ, châm nước dừa tươi và mắm đường. Kho lửa nhỏ liu riu trong tộ đất đến khi nước sốt keo nâu óng ánh rắc nhiều tiêu đen.', tip: 'Kho tộ đất giữ nhiệt cực tốt giúp thịt mềm thơm.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Dùng nước dừa tươi kho lửa nhỏ cho mỡ thịt trong veo, tắt bếp rắc một nắm tiêu đen Phú Quốc xay vỡ để tạo mùi thơm nồng đặc trưng.',
    tags: ['Miền Nam', 'Món Mặn', 'Thịt Kho Tộ', 'Đậm Đà', 'Cay Nồng']
  },
  {
    id: 'muc-rim-me',
    title: 'Mực Tươi Rim Me Chua Ngọt Cay Nam Bộ',
    description: 'Mực tươi giòn sần sật rim cùng nước sốt me sánh keo chua ngọt cay bùng nổ, rắc ớt băm và mè rang thơm lừng đưa cơm.',
    category: 'mon-man',
    region: 'nam',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 370,
    estimatedCostVnd: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Mực ống tươi cắt khoanh', amount: 400, unit: 'g', category: 'thit-ca' },
      { name: 'Nước cốt me chua & Đường thốt nốt', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Ớt sừng băm & Tỏi phi', amount: 1, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Rim mực sốt me', durationMinutes: 10, heatLevel: 'lửa vừa', content: 'Xào săn mực trên lửa lớn trút ra đĩa. Nấu kẹo sốt me đường ớt, trút mực vào đảo nhanh 2 phút cho sốt bọc đều quanh từng khoanh mực.', tip: 'Không rim mực quá lâu để mực không bị dai.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Nấu sốt me với đường thốt nốt kẹo sệt lại rồi mới trút mực đã xào vào đảo thật nhanh trên lửa lớn, mực sẽ ngấm sốt đậm đà mà giữ trọn độ giòn ngọt mọng nước.',
    tags: ['Miền Nam', 'Cay Nồng', 'Món Mặn', 'Mực Rim Me', 'Đổi Vị']
  },
  {
    id: 'canh-chua-ca-loc-bong-dien-dien',
    title: 'Canh Chua Cá Lóc Bông Điên Điển Miền Tây',
    description: 'Đặc sản mùa nước nổi miền Tây: Cá lóc đồng nấu me chua ngọt thanh tao, hòa quyện bông điên điển vàng tươi giòn ngọt và rau ngò om thơm ngát.',
    category: 'mon-canh',
    region: 'nam',
    prepTimeMinutes: 12,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 220,
    estimatedCostVnd: 70000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Cá lóc đồng cắt khoanh', amount: 400, unit: 'g', category: 'thit-ca' },
      { name: 'Bông điên điển vàng tươi', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Me chín, ngò om, ngò gai, ớt hiểm', amount: 1, unit: 'nắm', category: 'rau-cu' }
    ],
    instructions: [
      { step: 1, title: 'Nấu canh chua điên điển', durationMinutes: 10, heatLevel: 'lửa vừa', content: 'Nấu nước me sôi, thả cá lóc vào đun chín tới. Cho bông điên điển vào đun sôi bùng 30 giây rồi tắt bếp, rắc ngò om và tỏi phi.', tip: 'Bông điên điển cho vào sau cùng để giữ độ giòn.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Bông điên điển chỉ thả vào nồi canh khi đã tắt bếp hoặc sôi bùng 30 giây để hoa giữ màu vàng tươi rực rỡ và độ giòn bùi ngọt thanh mát.',
    tags: ['Miền Nam', 'Món Canh', 'Cá Lóc', 'Bông Điên Điển', 'Đồng Quê']
  },
  {
    id: 'bong-bi-xao-toi',
    title: 'Bông Bí Xào Tỏi Phi Giòn Ngọt',
    description: 'Bông bí ngô tươi non tước xơ xào cùng tỏi đập dập thơm nức mũi, cánh hoa ngọt thanh đượm gia vị giòn mát.',
    category: 'mon-rau',
    region: 'nam',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 4,
    calories: 110,
    estimatedCostVnd: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Bông bí tươi non tước xơ', amount: 400, unit: 'g', category: 'rau-cu' },
      { name: 'Tỏi băm & Dầu hào', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
    ],
    instructions: [
      { step: 1, title: 'Xào bông bí lửa lớn', durationMinutes: 4, heatLevel: 'lửa lớn', content: 'Phi tỏi thơm lừng, cho bông bí vào đảo thật nhanh tay trên lửa lớn trong 3 phút, nêm chút dầu hào rồi tắt bếp.', tip: 'Xào thật nhanh để cánh hoa không bị nát.' }
    ],
    chefTip: 'Bí quyết đầu bếp: Ngắt bỏ nhụy đắng bên trong bông bí trước khi rửa, xào nhanh trên lửa lớn để bông bí giữ trọn độ giòn ngọt thơm mát.',
    tags: ['Miền Nam', 'Món Rau', 'Bông Bí', 'Thanh Nhẹ', 'Eat Clean']
  }
];

import { recipesDatabase } from './recipesDatabase';
import { westernDishes500 } from './westernDishes500';

export { westernDishes500 };
export const mockRecipes: Recipe[] = [...INITIAL_RECIPES, ...LEFTOVER_RECIPES, ...WESTERN_RECIPES, ...westernDishes500, ...recipesDatabase];
export { recipesDatabase };

