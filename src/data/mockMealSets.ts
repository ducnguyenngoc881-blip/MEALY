import { VietnameseMealSet } from '../types';
import { mockRecipes, AUTHENTIC_REGIONAL_RECIPES } from './mockRecipes';

// Map of all recipes usable in meal sets (combining canonical catalog and authentic regional presets)
const mealSetRecipeMap = new Map<string, (typeof mockRecipes)[0]>();
for (const r of mockRecipes) {
  mealSetRecipeMap.set(r.id, r);
}
for (const r of AUTHENTIC_REGIONAL_RECIPES) {
  mealSetRecipeMap.set(r.id, r);
}

// Helper to get recipe by ID
const getRecipe = (id: string) => {
  const found = mealSetRecipeMap.get(id);
  if (!found) {
    throw new Error(`Recipe with id ${id} not found`);
  }
  return found;
};

const RAW_MEAL_SETS: Array<Omit<VietnameseMealSet, 'totalCostVnd' | 'totalCalories'> & { totalCostVnd?: number; totalCalories?: number }> = [
  {
    id: 'mam-com-bac-bo',
    title: 'Mâm Cơm Đậm Vị Bắc Bộ',
    region: 'bac',
    description: 'Bữa cơm chuẩn vị đồng quê miền Bắc với thịt rang cháy cạnh đậm đà, canh cua đồng rêu béo ngậy và rau muống luộc dầm sấu mát lành.',
    mainDish: getRecipe('thit-rang-chay-canh'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Cà pháo muối giòn tan & Nước mắm chanh tỏi ớt tươi',
    totalCostVnd: 140000,
    totalCalories: 710,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Mâm Cơm 3 Món', 'Đồng Quê', 'Yêu Thích', '1 Người', 'Đậm Đà']
  },
  {
    id: 'mam-com-nam-bo',
    title: 'Mâm Cơm Nam Bộ Tròn Vị',
    region: 'nam',
    description: 'Hương vị đậm đà sông nước Miền Nam với thịt kho tàu dừa tươi béo ngậy, canh chua cá hú thanh mát và dưa giá bóp xổi ngâm chua giòn.',
    mainDish: getRecipe('thit-kho-tau-trung-vit'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm nhĩ Phú Quốc ớt hiểm & Ớt sừng tỏi băm',
    totalCostVnd: 177000,
    totalCalories: 785,
    imageUrl: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Đậm Đà', 'Mứt Ngọt', '1 Người', 'Yêu Thích', 'Đồng Quê']
  },
  {
    id: 'mam-com-mien-trung',
    title: 'Mâm Cơm Miền Trung Cay Nồng',
    region: 'trung',
    description: 'Đặc trưng dải đất Miền Trung nắng gió với cá nục kho tiêu kho rục cay nồng, canh ngao dứa nấu chua ngọt và rau lang xào tỏi Lý Sơn.',
    mainDish: getRecipe('ca-nuc-kho-tieu'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Dưa món củ kiệu & Nước mắm gừng cay nồng',
    totalCostVnd: 128000,
    totalCalories: 650,
    imageUrl: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Mâm Cơm 3 Món', 'Cay Nồng', 'Cá Biển', '1 Người', 'Đậm Đà', 'Tiết Kiệm', 'Yêu Thích', 'Đồng Quê']
  },
  {
    id: 'mam-com-chay-thanh-tinh',
    title: 'Mâm Cơm Chay Thanh Tịnh',
    region: 'chay',
    description: 'Bữa ăn thực dưỡng thanh tịnh cân bằng dinh dưỡng với đậu hũ chiên sả ớt, canh nấm hạt sen bùi béo và rau củ luộc chấm sốt kho quẹt chay.',
    mainDish: getRecipe('dau-hu-chien-sa-ot'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Chao môn béo ngậy & Nước tương tỏi ớt chay',
    totalCostVnd: 120000,
    totalCalories: 620,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Món Chay', 'Mâm Cơm 3 Món', 'Thanh Tịnh', 'Bổ Dưỡng', '1 Người', 'Eat Clean', 'Yêu Thích', 'Đồng Quê']
  },
  {
    id: 'mam-com-gymer-giau-dam',
    title: 'Mâm Cơm Gymer Siêu Giàu Đạm',
    region: 'toan-quoc',
    description: 'Tối ưu cho người tập gym, tăng cơ giảm mỡ: Ức gà xào bắp cải giàu đạm, canh ngao ngọt thanh và rau muống luộc dầm sấu mát lành.',
    mainDish: getRecipe('uc-ga-xao-bap-cai'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Nước tương tỏi ớt ít muối & Tiêu đen giã dập',
    totalCostVnd: 110000,
    totalCalories: 580,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Giàu Đạm', 'Eat Clean', 'Tập Gym', 'Mâm Cơm 3 Món', 'Yêu Thích']
  },
  {
    id: 'mam-com-eat-clean-healthy',
    title: 'Mâm Cơm Eat Clean Thanh Lành',
    region: 'toan-quoc',
    description: 'Bữa ăn thanh nhẹ ít dầu mỡ, nhiều chất xơ và đạm thực vật từ nấm, đậu và rau củ ngũ sắc cho vóc dáng thon gọn.',
    mainDish: getRecipe('dau-hu-sot-ca-chua'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Sốt chấm mè rang thanh nhẹ & Chanh tươi',
    totalCostVnd: 84000,
    totalCalories: 590,
    imageUrl: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
    tags: ['Eat Clean', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-doc-than-nhanh-gon',
    title: 'Mâm Cơm Độc Thân 1 Người Nhanh Gọn',
    region: 'toan-quoc',
    description: 'Nấu nhanh dưới 20 phút cho người sống một mình: Thịt rang cháy cạnh đậm đà, canh ngao ngọt mát, dĩa rau lang xào giòn thơm nức mũi.',
    mainDish: getRecipe('thit-rang-chay-canh'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Nước mắm tỏi ớt tươi ăn liền',
    totalCostVnd: 98000,
    totalCalories: 600,
    imageUrl: 'https://images.unsplash.com/photo-1762305193367-91e072e47c3f?auto=format&fit=crop&w=600&q=80',
    tags: ['1 Người', 'Nhanh Gọn', 'Mâm Cơm 3 Món', 'Yêu Thích']
  },
  {
    id: 'mam-com-suon-ram-dam-da',
    title: 'Mâm Cơm Sườn Ram Mặn Ngọt',
    region: 'nam',
    description: 'Sườn non ram sánh vàng mặn ngọt kết hợp canh cua thanh mát và dưa giá giòn rụm.',
    mainDish: getRecipe('com-suon-ram-man-ngot'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm ớt tỏi chua ngọt',
    totalCostVnd: 135000,
    totalCalories: 680,
    imageUrl: 'https://images.unsplash.com/photo-1761315412952-a3a9e3ed06ff?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Đậm Đà', '1 Người', 'Yêu Thích', 'Giàu Đạm']
  },
  {
    id: 'mam-com-bo-xao-muong',
    title: 'Mâm Cơm Bò Thăn Xào Muống Tỏi',
    region: 'bac',
    description: 'Bò thăn mềm ngọt xào rau muống giòn thơm mùi tỏi phi, kèm canh ngao chua thanh giải nhiệt.',
    mainDish: getRecipe('thit-bo-xao-rau-muong'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Tương ớt & chanh ớt tươi',
    totalCostVnd: 155000,
    totalCalories: 720,
    imageUrl: 'https://images.unsplash.com/photo-1760504526069-ff0f8bf6e4ca?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Mâm Cơm 3 Món', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Đậm Đà']
  },
  {
    id: 'mam-com-dau-sot-ca-tiet-kiem',
    title: 'Mâm Cơm Đậu Hũ Sốt Cà Cơm Nhà',
    region: 'toan-quoc',
    description: 'Đậu hũ sốt cà chua mềm béo, canh cua mồng tơi ngọt lành và đọt rau lang xào tỏi thơm nức.',
    mainDish: getRecipe('dau-hu-sot-ca-chua'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Nước tương tỏi ớt truyền thống',
    totalCostVnd: 78000,
    totalCalories: 510,
    imageUrl: 'https://images.unsplash.com/photo-1680991172715-4074203a40d3?auto=format&fit=crop&w=600&q=80',
    tags: ['Tiết Kiệm', '1 Người', 'Mâm Cơm 3 Món', 'Nhanh Gọn']
  },
  {
    id: 'mam-com-trung-chien-thit-bam',
    title: 'Mâm Cơm Trứng Chiên Thịt Băm',
    region: 'toan-quoc',
    description: 'Trứng chiên thịt băm hành hoa thơm lừng, canh ngao thì là thanh ngọt cùng dưa giá bóp xổi chống ngấy.',
    mainDish: getRecipe('trung-chien-thit-bam-hanh'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm tiêu ớt',
    totalCostVnd: 85000,
    totalCalories: 560,
    imageUrl: 'https://images.unsplash.com/photo-1608039762150-b682eb589303?auto=format&fit=crop&w=600&q=80',
    tags: ['Tiết Kiệm', '1 Người', 'Mâm Cơm 3 Món', 'Bình Dân']
  },
  {
    id: 'mam-com-thit-xao-cai-ngot',
    title: 'Mâm Cơm Thịt Nạc Xào Cải Ngọt',
    region: 'bac',
    description: 'Thịt nạc dăm xào cải ngọt giòn mát, canh cua đồng ngọt lịm cùng dĩa rau muống luộc xanh mướt.',
    mainDish: getRecipe('thit-nac-dam-xao-cai-ngot'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Nước mắm chanh tỏi ớt',
    totalCostVnd: 92000,
    totalCalories: 590,
    imageUrl: 'https://images.unsplash.com/photo-1625477811233-044633d10dd1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Mâm Cơm 3 Món', 'Tiết Kiệm', '1 Người', 'Eat Clean']
  },
  {
    id: 'mam-com-trung-op-la-chay-ria',
    title: 'Mâm Cơm Trứng Ốp La Canh Thịt Băm',
    region: 'toan-quoc',
    description: 'Trứng ốp la lòng đào cháy rìa giòn rụm, canh rau muống thịt băm ngọt mát và rau lang xào tỏi.',
    mainDish: getRecipe('canh-rau-muong-thit-bam'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Xì dầu tỏi ớt xắt lát',
    totalCostVnd: 75000,
    totalCalories: 530,
    imageUrl: 'https://images.unsplash.com/photo-1684866907269-2248f7334a09?auto=format&fit=crop&w=600&q=80',
    tags: ['Tiết Kiệm', 'Nhanh Gọn', '1 Người', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-tom-rim-ba-chi',
    title: 'Mâm Cơm Tôm Thẻ Rim Ba Chỉ',
    region: 'nam',
    description: 'Tôm thẻ tươi rim thịt ba rọi ngậy béo màu cánh gián, canh chua cá hú thanh mát và dưa giá chua ngọt.',
    mainDish: getRecipe('tom-rim-thit-ba-chi'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm nhĩ ớt hiểm',
    totalCostVnd: 145000,
    totalCalories: 710,
    imageUrl: 'https://images.unsplash.com/photo-1625477811233-044633d10dd1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Đậm Đà', '1 Người', 'Đồng Quê', 'Giàu Đạm']
  },
  {
    id: 'mam-com-thit-kho-trung-nha-lam',
    title: 'Mâm Cơm Thịt Ba Chỉ Kho Trứng Canh Chua',
    region: 'nam',
    description: 'Thịt ba rọi kho trứng vịt béo ngậy, nước dừa thơm lừng chan cùng canh chua cá hú ngọt lành.',
    mainDish: getRecipe('thit-ba-chi-kho-trung'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Ớt sừng tỏi băm ngâm giấm',
    totalCostVnd: 130000,
    totalCalories: 690,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Canh_chua_c%C3%A1_l%C3%B3c_%E1%BB%9F_Th%E1%BB%A7y_Tr%C3%BAc_Qu%C3%A1n%2C_%C4%91%C6%B0%E1%BB%9Dng_Nguy%E1%BB%85n_Nh%E1%BB%AF_L%C3%A3m_%281%29.jpg/960px-Canh_chua_c%C3%A1_l%C3%B3c_%E1%BB%9F_Th%E1%BB%A7y_Tr%C3%BAc_Qu%C3%A1n%2C_%C4%91%C6%B0%E1%BB%9Dng_Nguy%E1%BB%85n_Nh%E1%BB%AF_L%C3%A3m_%281%29.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Cơm Nhà', '1 Người', 'Yêu Thích', 'Đậm Đà', 'Tiết Kiệm']
  },
  {
    id: 'mam-com-dau-ran-trung-may',
    title: 'Mâm Cơm Đậu Rán Canh Cà Chua Trứng Mây',
    region: 'chay',
    description: 'Bữa cơm thanh nhẹ: Đậu hũ rán giòn chấm mắm tỏi, canh cà chua trứng mây thơm nồng và rau củ luộc ngũ sắc.',
    mainDish: getRecipe('dau-hu-chien-sa-ot'),
    soupDish: getRecipe('canh-ca-chua-trung-dau-ran'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Tương bần & Nước tương gừng tỏi',
    totalCostVnd: 72000,
    totalCalories: 620,
    imageUrl: 'https://images.unsplash.com/photo-1763470260582-894ae15f43bb?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Tiết Kiệm', 'Thanh Tịnh', 'Mâm Cơm 3 Món', '1 Người', 'Eat Clean']
  },
  {
    id: 'mam-com-nam-ca-basa-kho-thom',
    title: 'Mâm Cơm Nam Bộ Cá Basa Kho Thơm',
    region: 'nam',
    description: 'Cơm trưa Nam Bộ chuẩn vị mẹ nấu: Cá basa kho thơm đậm đà chua ngọt, canh chua cá thanh mát và dưa giá giòn rụm chống ngấy.',
    mainDish: getRecipe('mam-com-nam-10-ca-basa-kho-thom-chua-cay'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm ớt hiểm & Dưa giá giòn',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/C%C3%A1_kho_t%E1%BB%99.JPG/960px-C%C3%A1_kho_t%E1%BB%99.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', '1 Người', 'Tiết Kiệm', 'Yêu Thích', 'Đậm Đà']
  },
  {
    id: 'mam-com-nam-trung-chien-canh-chua',
    title: 'Mâm Cơm Nam Bộ Trứng Chiên Canh Chua',
    region: 'nam',
    description: 'Bữa cơm nhanh gọn bình dân miền Nam: Trứng chiên thịt băm hành hoa thơm nức, canh chua cá hú giải nhiệt và dưa giá bóp xổi.',
    mainDish: getRecipe('trung-chien-thit-bam-hanh'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm cá cơm ớt sừng',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Canh_chua_c%C3%A1_di%C3%AAu_h%E1%BB%93ng.jpg/960px-Canh_chua_c%C3%A1_di%C3%AAu_h%E1%BB%93ng.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', '1 Người', 'Tiết Kiệm', 'Yêu Thích', 'Đậm Đà']
  },
  {
    id: 'mam-com-trung-ca-nuc-kho-keo',
    title: 'Mâm Cơm Miền Trung Cá Nục Kho Keo',
    region: 'trung',
    description: 'Đặc sản miền Trung đậm đà nắng gió: Cá nục kho keo tiêu ớt cay nồng, canh ngao nấu chua thì là và đọt rau lang xào tỏi giòn mát.',
    mainDish: getRecipe('ca-nuc-kho-tieu'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Nước mắm gừng ớt hiểm',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/C%C3%A1_kho_t%E1%BB%99.JPG/960px-C%C3%A1_kho_t%E1%BB%99.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Mâm Cơm 3 Món', '1 Người', 'Tiết Kiệm', 'Cay Nồng', 'Đậm Đà', 'Cá Biển', 'Yêu Thích']
  },
  {
    id: 'mam-com-chay-nam-bo-thanh-lanh',
    title: 'Mâm Cơm Chay Nam Bộ Thanh Lành',
    region: 'chay',
    description: 'Thực đơn thuần chay thanh tịnh đậm đà: Đậu hũ sốt cà chua hành hoa thơm dịu, canh nấm hạt sen bùi béo và rau củ ngũ sắc kho quẹt chay.',
    mainDish: getRecipe('dau-hu-sot-ca-chua'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Nước tương tỏi ớt chay & Chanh tươi',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Mâm Cơm 3 Món', 'Thanh Tịnh', '1 Người', 'Eat Clean', 'Tiết Kiệm', 'Yêu Thích', 'Đồng Quê']
  },
  {
    id: 'mam-com-au-steakhouse-bo-bit-tet',
    title: 'Mâm Cơm Âu: Bít Tết Thăn Bò Sốt Tiêu & Súp Kem',
    region: 'toan-quoc',
    description: 'Đổi vị phong cách Steakhouse: Bít tết thăn bò mềm mọng sốt tiêu đen, súp kem nấm tươi thảo mộc và khoai tây nghiền bơ tỏi mịn như nhung.',
    mainDish: getRecipe('steak-thiet-ban-sot-tieu-den'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('khoai-tay-nghien-bo-toi-thao-moc'),
    condimentNote: 'Bơ tỏi thảo mộc & Sốt tiêu đen xay giã dập',
    totalCostVnd: 165000,
    totalCalories: 760,
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bít Tết', 'Steakhouse', 'Đổi Vị', 'Mâm Cơm 3 Món', 'Yêu Thích', '1 Người', 'Giàu Đạm']
  },
  {
    id: 'mam-com-au-mi-y-bolognese',
    title: 'Mâm Cơm Âu: Mì Ý Sốt Bò Băm & Bánh Mì Bơ Tỏi',
    region: 'toan-quoc',
    description: 'Bữa ăn chuẩn phong cách Ý: Mì Ý sốt bò băm Bolognese thơm lừng cà chua, súp cà chua nướng húng quế và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('spaghetti-bolognese-bo-bam'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Phô mai bột Parmesan & Lá oregano khô',
    totalCostVnd: 135000,
    totalCalories: 710,
    imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Mì Ý', 'Bolognese', 'Ý Gia Đình', 'Mâm Cơm 3 Món', '1 Người', 'Tiết Kiệm']
  },
  {
    id: 'mam-com-au-mi-y-carbonara',
    title: 'Mâm Cơm Âu: Mì Ý Carbonara & Salad Caesar',
    region: 'toan-quoc',
    description: 'Mì Ý sốt kem nấm thịt xông khói ngậy béo, súp kem bí đỏ sữa tươi thơm lừng và salad Caesar xà lách Romaine giòn mát sốt phô mai.',
    mainDish: getRecipe('spaghetti-carbonara-kem-nam'),
    soupDish: getRecipe('sup-kem-bi-do-banh-mi-bo'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Tiêu đen xay & Bánh mì sấy croutons giòn',
    totalCostVnd: 140000,
    totalCalories: 720,
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Mì Ý', 'Carbonara', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ca-hoi-ap-chao',
    title: 'Mâm Cơm Âu: Cá Hồi Nauy Áp Chảo & Măng Tây Bơ Tỏi',
    region: 'toan-quoc',
    description: 'Thực đơn Địa Trung Hải cao cấp: Cá hồi Nauy áp chảo bơ chanh giàu Omega-3, súp kem nấm tươi và măng tây áp chảo bơ tỏi giòn ngọt.',
    mainDish: getRecipe('ca-hoi-ap-chao-sot-bo-chanh'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('mang-tay-ap-chao-bo-toi'),
    condimentNote: 'Sốt bơ chanh vàng thì là & Muối hồng Himalaya',
    totalCostVnd: 175000,
    totalCalories: 680,
    imageUrl: 'https://images.unsplash.com/photo-1641898378716-1f38ec04bb0f?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Cá Hồi', 'Địa Trung Hải', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-suon-bbq-kieu-my',
    title: 'Mâm Cơm Âu: Sườn Que Nướng BBQ & Khoai Tây Chiên',
    region: 'toan-quoc',
    description: 'Hương vị tiệc nướng BBQ kiểu Mỹ: Sườn que nướng sốt BBQ đượm khói mật ong, súp kem bắp ngọt gà xé sánh mịn và khoai tây chiên lắc phô mai giòn tan.',
    mainDish: getRecipe('mon-au-fastfood-30-s--n-n--ng-bbq-kh-i-k-m-k'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('french-fries-lac-pho-mai'),
    condimentNote: 'Sốt chấm BBQ khói & Mayonnaise mù tạt vàng',
    totalCostVnd: 155000,
    totalCalories: 770,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'BBQ', 'American Feast', 'Đổi Vị', 'Mâm Cơm 3 Món', 'Giàu Đạm']
  },
  {
    id: 'mam-com-au-bistro-bo-ham-vang',
    title: 'Mâm Cơm Âu: Bò Hầm Rượu Vang & Bánh Mì Bơ Tỏi',
    region: 'toan-quoc',
    description: 'Hương vị Bistro kiểu Pháp lãng mạn: Thịt bò hầm mềm nhừ trong nước sốt rượu vang sánh đậm, súp kem bí đỏ thơm mịn và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('bo-ham-ruou-vang-beef-bourguignon'),
    soupDish: getRecipe('sup-kem-bi-do-banh-mi-bo'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Lá thơm Thyme tươi & Bơ lạt Anchor',
    totalCostVnd: 170000,
    totalCalories: 750,
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bò Hầm', 'Bistro Pháp', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ga-nuong-parmigiana',
    title: 'Mâm Cơm Âu: Gà Nướng Parmigiana & Salad Caesar',
    region: 'toan-quoc',
    description: 'Món ăn gia đình Mỹ - Ý đầm ấm: Ức gà nướng phô mai mozzarella đút lò sốt cà chua marinara, súp cà chua nướng húng quế và salad Caesar xà lách tươi giòn.',
    mainDish: getRecipe('ga-nuong-parmigiana-pho-mai'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Phô mai Parmesan bột & Sốt Caesar chanh tỏi',
    totalCostVnd: 145000,
    totalCalories: 730,
    imageUrl: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Chicken Parmigiana', 'Đút Lò', 'Mâm Cơm 3 Món', 'Giàu Đạm']
  },
  {
    id: 'mam-com-au-mi-y-pesto-hai-san',
    title: 'Mâm Cơm Âu: Mì Ý Pesto Hải Sản & Salad Địa Trung Hải',
    region: 'toan-quoc',
    description: 'Thực đơn hải sản phong cách Địa Trung Hải thanh mát: Mì Ý sốt Pesto húng tây xào tôm sú mực tươi, súp kem nấm tươi và salad dưa leo cà chua dầu ô liu.',
    mainDish: getRecipe('mi-y-pesto-hai-san-tom-muc'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('salad-dia-trung-hai-feta-dau-oliu'),
    condimentNote: 'Dầu ô liu Extra Virgin & Quả ô liu đen ngâm muối',
    totalCostVnd: 155000,
    totalCalories: 710,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Hải Sản', 'Mì Ý Pesto', 'Địa Trung Hải', 'Mâm Cơm 3 Món']
  }
,
  {
    id: 'mam-com-au-burger-bo-cheddar',
    title: 'Mâm Cơm Âu: Burger Bò Nướng Phô Mai Cheddar & Coleslaw',
    region: 'toan-quoc',
    description: 'Phong cách ẩm thực nhanh kiểu Mỹ cao cấp: Burger bò nướng than hoa phô mai cheddar tan chảy, súp kem bắp ngọt gà xé và salad bắp cải tím Coleslaw giòn chua ngọt.',
    mainDish: getRecipe('burger-bo-pho-mai-cheddar'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('french-fries-lac-pho-mai'),
    condimentNote: 'Sốt Mayonnaise mù tạt & Tương cà Heinz',
    totalCostVnd: 150000,
    totalCalories: 760,
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Burger', 'Bữa Trưa', 'Mâm Cơm 3 Món', '1 Người']
  },
  {
    id: 'mam-com-au-steak-ribeye-sot-nam',
    title: 'Mâm Cơm Âu: Bít Tết Thăn Lưng Ribeye Sốt Kem Nấm & Bánh Mì Bơ',
    region: 'toan-quoc',
    description: 'Trải nghiệm Steakhouse chuẩn vị: Thăn bò ribeye vân mỡ mềm mọng sốt kem nấm béo ngậy, súp kem bí đỏ sữa tươi và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('steak-thiet-ban-sot-trung-muoi'),
    soupDish: getRecipe('sup-kem-bi-do-banh-mi-bo'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Muối hồng Himalaya & Tiêu đen xay giã dập',
    totalCostVnd: 175000,
    totalCalories: 770,
    imageUrl: 'https://images.unsplash.com/photo-1600454309261-3dc9b7597637?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bít Tết', 'Steakhouse', 'Mâm Cơm 3 Món', 'Giàu Đạm']
  },
  {
    id: 'mam-com-au-mi-y-aglio-olio-tom',
    title: 'Mâm Cơm Âu: Mì Ý Aglio e Olio Tôm Mực & Salad Caesar',
    region: 'toan-quoc',
    description: 'Phong cách ẩm thực Ý cổ điển thanh nhẹ: Mì Ý xào dầu ô liu tỏi ớt hải sản tôm mực ngọt đậm, súp cà chua nướng húng quế và salad Caesar tươi giòn.',
    mainDish: getRecipe('spaghetti-aglio-e-olio-hai-san'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Dầu ô liu Extra Virgin & Ớt mảnh khô',
    totalCostVnd: 155000,
    totalCalories: 690,
    imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Mì Ý', 'Aglio Olio', 'Hải Sản', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-suon-bbq-salad-dia-trung-hai',
    title: 'Mâm Cơm Âu: Sườn Que Nướng BBQ Mật Ong & Salad Địa Trung Hải',
    region: 'toan-quoc',
    description: 'Hương vị tiệc nướng đượm khói: Sườn que nướng sốt BBQ mật ong bắp Mỹ, súp kem nấm tươi và salad dưa leo cà chua dầu ô liu thanh mát cân bằng vị giác.',
    mainDish: getRecipe('suon-que-nuong-bbq-mat-ong'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('salad-dia-trung-hai-feta-dau-oliu'),
    condimentNote: 'Sốt chấm BBQ khói cay nhẹ & Chanh vàng',
    totalCostVnd: 160000,
    totalCalories: 740,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Boston_Market_BBQ_Ribs_close_up_%2827988017902%29.jpg/960px-Boston_Market_BBQ_Ribs_close_up_%2827988017902%29.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Sườn BBQ', 'Địa Trung Hải', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ga-ap-chao-khoai-tay-nghien',
    title: 'Mâm Cơm Âu: Đùi Gà Áp Chảo Sốt Kem Nấm & Khoai Tây Nghiền',
    region: 'toan-quoc',
    description: 'Món ăn gia đình phương Tây ấm cúng: Đùi gà áp chảo sốt kem nấm mềm ngọt, súp kem bí đỏ mịn màng và khoai tây nghiền bơ tỏi thơm ngậy.',
    mainDish: getRecipe('dui-ga-ap-chao-sot-kem-nam'),
    soupDish: getRecipe('sup-kem-bi-do-banh-mi-bo'),
    sideDish: getRecipe('khoai-tay-nghien-bo-toi-thao-moc'),
    condimentNote: 'Lá thơm Oregano & Tiêu đen xay',
    totalCostVnd: 140000,
    totalCalories: 730,
    imageUrl: 'https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Gà Áp Chảo', 'Gia Đình', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-xuc-xich-duc-khoai-tay-chien',
    title: 'Mâm Cơm Âu: Xúc Xích Đức Xông Khói Nướng & Súp Bắp Ngọt',
    region: 'toan-quoc',
    description: 'Đặc sản ẩm thực Đức thịnh soạn: Xúc xích Đức xông khói nướng chảo vàng ươm, súp kem bắp ngọt gà xé thơm bùi và khoai tây chiên lắc phô mai.',
    mainDish: getRecipe('xuc-xich-duc-nuong-chao-khoai'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('french-fries-lac-pho-mai'),
    condimentNote: 'Mù tạt vàng hạt Dijon & Mayonnaise béo',
    totalCostVnd: 135000,
    totalCalories: 720,
    imageUrl: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Xúc Xích Đức', 'Nhanh Gọn', 'Mâm Cơm 3 Món', '1 Người', 'Tiết Kiệm']
  },
  {
    id: 'mam-com-au-bo-luc-lac-mang-tay',
    title: 'Mâm Cơm Âu: Bò Lúc Lắc Bơ Tỏi & Măng Tây Áp Chảo',
    region: 'toan-quoc',
    description: 'Sự giao thoa ẩm thực Pháp - Việt tinh tế: Thịt thăn bò xào bơ tỏi lửa lớn mềm mọng, súp kem nấm tươi thảo mộc và măng tây áp chảo bơ tỏi giòn ngọt.',
    mainDish: getRecipe('mon-au-fastfood-55-b--l-c-l-c-x-o-b--t-i--n-'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('mang-tay-ap-chao-bo-toi'),
    condimentNote: 'Muối tiêu chanh & Bơ tỏi thảo mộc',
    totalCostVnd: 165000,
    totalCalories: 740,
    imageUrl: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bò Lúc Lắc', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ga-burger-sup-ca-chua',
    title: 'Mâm Cơm Âu: Burger Gà Chiên Giòn & Súp Cà Chua Basil',
    region: 'toan-quoc',
    description: 'Bữa trưa tươi ngon tràn đầy năng lượng: Burger gà chiên giòn rụm sốt mayonnaise thơm béo, súp cà chua nướng húng quế và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('mon-au-fastfood-36-burger-g--chi-n-gi-n-s-t-'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Tương ớt chua ngọt & Sốt mayonnaise tỏi',
    totalCostVnd: 140000,
    totalCalories: 720,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Burger Gà', 'Bữa Trưa', 'Mâm Cơm 3 Món', '1 Người']
  },
  {
    id: 'mam-com-au-khoai-tay-nghien-bo-bam',
    title: 'Mâm Cơm Âu: Khoai Tây Nghiền Sốt Bò Băm & Salad Caesar',
    region: 'toan-quoc',
    description: 'Món ăn gia đình kiểu Anh Shepherd\'s Pie thu nhỏ: Khoai tây nghiền bơ sữa đút lò phủ sốt thịt bò băm đậm đà, súp kem nấm tươi và salad Caesar tươi mát.',
    mainDish: getRecipe('mon-au-fastfood-58-khoai-t-y-nghi-n-tr-n-b--'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Tiêu đen xay giã dập & Bột phô mai Parmesan',
    totalCostVnd: 145000,
    totalCalories: 710,
    imageUrl: 'https://images.unsplash.com/photo-1582034986517-30d163aa1da9?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Shepherd Pie', 'Bò Băm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ca-hoi-mang-tay-sup-bap',
    title: 'Mâm Cơm Âu: Cá Hồi Nauy Áp Chảo Bơ Tỏi & Súp Bắp Ngọt',
    region: 'toan-quoc',
    description: 'Thực đơn Eat Clean cao cấp giàu Omega-3: Cá hồi Nauy áp chảo bơ tỏi thơm lừng, súp kem bắp ngọt gà xé thanh dịu và măng tây áp chảo bơ tỏi giòn ngọt.',
    mainDish: getRecipe('ca-hoi-ap-chao-sot-bo-chanh'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('mang-tay-ap-chao-bo-toi'),
    condimentNote: 'Chanh vàng lát mỏng & Muối tiêu thảo mộc',
    totalCostVnd: 175000,
    totalCalories: 690,
    imageUrl: 'https://images.unsplash.com/photo-1641898378716-1f38ec04bb0f?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Cá Hồi', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-beef-bourguignon-salad',
    title: 'Mâm Cơm Âu: Bò Hầm Pháp Bœuf Bourguignon & Salad Caesar',
    region: 'toan-quoc',
    description: 'Món hầm trứ danh nước Pháp: Bò hầm rượu vang nấm hương mềm rục thơm nồng ấm, súp cà chua nướng húng quế và salad Caesar xà lách tươi mát.',
    mainDish: getRecipe('bo-ham-ruou-vang-beef-bourguignon'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Lá thơm Thyme tươi & Bơ lạt Anchor',
    totalCostVnd: 170000,
    totalCalories: 740,
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bò Hầm', 'Pháp', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-chicken-parm-khoai-nghien',
    title: 'Mâm Cơm Âu: Gà Nướng Parmigiana & Khoai Tây Nghiền Bơ Tỏi',
    region: 'toan-quoc',
    description: 'Hương vị ẩm thực Mỹ - Ý kinh điển: Ức gà nướng phô mai đút lò sốt cà chua marinara, súp kem nấm tươi và khoai tây nghiền bơ tỏi thơm mịn.',
    mainDish: getRecipe('ga-nuong-parmigiana-pho-mai'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('khoai-tay-nghien-bo-toi-thao-moc'),
    condimentNote: 'Bột phô mai Parmesan & Tiêu đen',
    totalCostVnd: 150000,
    totalCalories: 750,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Chicken_cordon_bleu%2C_Bee%27s_Steak_and_Shake%2C_Sleman%2C_Yogyakarta.jpg/960px-Chicken_cordon_bleu%2C_Bee%27s_Steak_and_Shake%2C_Sleman%2C_Yogyakarta.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Chicken Parmigiana', 'Đút Lò', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-pesto-hai-san-banh-mi-bo',
    title: 'Mâm Cơm Âu: Mì Ý Pesto Tôm Mực & Bánh Mì Bơ Tỏi Giòn',
    region: 'toan-quoc',
    description: 'Thực đơn Địa Trung Hải thanh khiết: Mì Ý sốt pesto húng tây hải sản tôm sú mực tươi, súp kem bí đỏ sữa tươi và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('mi-y-pesto-hai-san-tom-muc'),
    soupDish: getRecipe('sup-kem-bi-do-banh-mi-bo'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Dầu ô liu Extra Virgin & Muối tiêu hồng',
    totalCostVnd: 160000,
    totalCalories: 720,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Pesto', 'Hải Sản', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-steak-khoai-tay-lac',
    title: 'Mâm Cơm Âu: Bít Tết Thăn Bò Sốt Tiêu & Khoai Tây Lắc Phô Mai',
    region: 'toan-quoc',
    description: 'Bữa ăn Steakhouse trẻ trung hấp dẫn: Thăn bò bít tết áp chảo bơ tỏi sốt tiêu đen mọng nước, súp kem bắp ngọt gà xé và khoai tây chiên lắc phô mai giòn tan.',
    mainDish: getRecipe('steak-thiet-ban-sot-tieu-den'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('french-fries-lac-pho-mai'),
    condimentNote: 'Sốt tiêu đen giã dập & Tương cà Heinz',
    totalCostVnd: 165000,
    totalCalories: 760,
    imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bít Tết', 'Khoai Chiên', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-bolognese-khoai-nghien',
    title: 'Mâm Cơm Âu: Mì Ý Sốt Bò Băm & Khoai Tây Nghiền Bơ Tỏi',
    region: 'toan-quoc',
    description: 'Mâm cơm Âu trọn vị cho cả nhà: Mì Ý sốt bò băm cà chua đậm đà, súp kem nấm tươi thơm béo và khoai tây nghiền bơ tỏi mịn như nhung.',
    mainDish: getRecipe('spaghetti-bolognese-bo-bam'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('khoai-tay-nghien-bo-toi-thao-moc'),
    condimentNote: 'Phô mai Parmesan & Lá mùi tây Oregano',
    totalCostVnd: 140000,
    totalCalories: 730,
    imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Mì Ý', 'Bolognese', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-suon-bbq-mang-tay',
    title: 'Mâm Cơm Âu: Sườn Que BBQ Mật Ong & Măng Tây Áp Chảo Bơ',
    region: 'toan-quoc',
    description: 'Sự kết hợp hoàn mỹ: Sườn que nướng sốt BBQ đượm khói mật ong, súp cà chua nướng húng quế Ý và măng tây áp chảo bơ tỏi giòn ngọt thanh vị.',
    mainDish: getRecipe('mon-au-fastfood-30-s--n-n--ng-bbq-kh-i-k-m-k'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('mang-tay-ap-chao-bo-toi'),
    condimentNote: 'Sốt BBQ chua ngọt & Tiêu đập dập',
    totalCostVnd: 160000,
    totalCalories: 740,
    imageUrl: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'BBQ Ribs', 'Măng Tây', 'Mâm Cơm 3 Món']
  }
];

export const mockMealSets: VietnameseMealSet[] = RAW_MEAL_SETS.map(set => {
  const totalCost = (set.mainDish?.estimatedCostVnd || 0) + (set.soupDish?.estimatedCostVnd || 0) + (set.sideDish?.estimatedCostVnd || 0);
  const totalCal = (set.mainDish?.calories || 0) + (set.soupDish?.calories || 0) + (set.sideDish?.calories || 0);
  return {
    ...set,
    totalCostVnd: totalCost,
    totalCalories: totalCal
  };
});

const RAW_NEW_MEAL_SETS: Array<Omit<VietnameseMealSet, 'totalCostVnd' | 'totalCalories'> & { totalCostVnd?: number; totalCalories?: number }> = [
  // =========================================================================
  // 1. MIỀN BẮC (bac) - 22 authentic sets
  // =========================================================================
  // --- Cay Nồng (7 sets) ---
  {
    id: 'mam-com-bac-ga-rang-gung-ot',
    title: 'Mâm Cơm Bắc Bộ Gà Ta Rang Gừng Ấm Nồng',
    region: 'bac',
    description: 'Hương vị mùa đông Bắc Bộ ấm nồng với gà ta rang gừng già ớt tươi thơm nức, canh sườn non nấu sấu chua thanh và rau cải luộc chấm trứng dầm mắm gừng cay.',
    mainDish: getRecipe('mam-com-bac-7-ga-ta-rang-gung-la-chanh-'),
    soupDish: getRecipe('canh-suon-nau-sau'),
    sideDish: getRecipe('rau-cai-luoc-cham-trung'),
    condimentNote: 'Nước mắm gừng ớt hiểm & Ớt tươi thái lát',
    imageUrl: 'https://images.unsplash.com/photo-1747628857852-2ffef1e3d06b?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-ca-tram-kho-rieng-tieu',
    title: 'Mâm Cơm Bắc Bộ Cá Trắm Cỏ Kho Riềng Tiêu Ấm',
    region: 'bac',
    description: 'Đặc sản niêu cá kho đất Bắc: Cá trắm cỏ kho riềng tiêu cay nồng đượm vị, canh cà chua trứng mây đậu rán và dưa cải muối chua giòn Hà Nội.',
    mainDish: getRecipe('mam-com-bac-19-ca-tram-co-kho-rieng-tieu'),
    soupDish: getRecipe('canh-ca-chua-trung-dau-ran'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Riềng tươi thái lát & Nước mắm cốt hạt tiêu sọ',
    imageUrl: 'https://images.unsplash.com/photo-1616557938459-b9baef2b7be3?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Đồng Quê', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-suon-sun-rang-muoi-sa',
    title: 'Mâm Cơm Bắc Bộ Sườn Sụn Heo Rang Muối Sả Ớt',
    region: 'bac',
    description: 'Món nhậu đưa cơm chuẩn vị Bắc: Sườn sụn giòn sần sật rang muối sả ớt the cay, canh sườn nấu sấu chua thanh mát và bắp cải non xào tỏi phi thơm nức.',
    mainDish: getRecipe('mam-com-bac-17-suon-sun-heo-rang-muoi-sa'),
    soupDish: getRecipe('canh-suon-nau-sau'),
    sideDish: getRecipe('bap-cai-xao-toi'),
    condimentNote: 'Muối tiêu chanh ớt tươi & Cà pháo muối giòn',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Suon_xao_chua_ngot_bac_ninh.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Giàu Đạm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-ca-chep-om-dua',
    title: 'Mâm Cơm Bắc Bộ Cá Chép Om Dưa Chua Cay',
    region: 'bac',
    description: 'Đặc sản trứ danh ẩm thực Bắc: Cá chép tươi rán vàng óng om dưa cải chua cay nồng ấm bụng, canh bí xanh nấu tôm thanh ngọt và rau cải luộc chấm trứng mắm gừng.',
    mainDish: getRecipe('ca-chep-om-dua'),
    soupDish: getRecipe('canh-bi-nau-tom'),
    sideDish: getRecipe('rau-cai-luoc-cham-trung'),
    condimentNote: 'Ớt chỉ thiên dầm nước mắm cốt & Thì là hành hoa',
    imageUrl: 'https://images.unsplash.com/photo-1767436093457-84ea9122eb4e?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Đổi Vị', 'Đồng Quê', 'Giàu Đạm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-ca-kho-rieng-tieu-ot',
    title: 'Mâm Cơm Bắc Bộ Cá Kho Riềng Tiêu Ớt Đất Bắc',
    region: 'bac',
    description: 'Cá đồng kho 2 lửa ngấu riềng tiêu ớt cay nồng đượm khói bếp, canh sườn non nấu sấu chua thanh tao và dưa cải muối chua giòn chống ngấy.',
    mainDish: getRecipe('ca-kho-rieng-tieu-ot'),
    soupDish: getRecipe('canh-suon-nau-sau'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Nước mắm tỏi ớt chanh & Tiêu sọ xay vỡ',
    imageUrl: 'https://images.unsplash.com/photo-1616557938459-b9baef2b7be3?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Đồng Quê', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-ca-nuc-kho-dua-cay',
    title: 'Mâm Cơm Bắc Bộ Cá Nục Kho Dưa Cải Chua Cay',
    region: 'bac',
    description: 'Mâm cơm bình dân ngày lạnh: Cá nục kho dưa chua cay xè bắt cơm, canh ngao nấu chua thì là giải nhiệt và rau muống luộc dầm sấu tươi.',
    mainDish: getRecipe('mam-com-bac-13-ca-nuc-kho-dua-cai-chua-c'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Nước mắm tỏi ớt chanh & Ớt chỉ thiên ngâm',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg/960px-C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Tiết Kiệm', '1 Người', 'Đồng Quê', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-dau-phu-nhoi-thit-cay',
    title: 'Mâm Cơm Bắc Bộ Đậu Phụ Nhồi Thịt Sốt Cà Cay',
    region: 'bac',
    description: 'Cơm nhà phố cổ hấp dẫn: Đậu phụ nhồi thịt băm mộc nhĩ sốt cà chua cay đậm, canh cà chua đậu phụ thanh nhẹ và dưa cải muối chua giòn.',
    mainDish: getRecipe('mam-com-bac-18--au-phu-nhoi-thit-sot-ca-'),
    soupDish: getRecipe('canh-ca-chua-dau-phu'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Tiêu sọ xay nhuyễn & Nước mắm tỏi ớt',
    imageUrl: 'https://images.unsplash.com/photo-1680173073730-852e0ec93bec?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Cay Nồng', 'Đậm Đà', 'Tiết Kiệm', '1 Người', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },

  // --- Đồng Quê & Đậm Đà (5 sets) ---
  {
    id: 'mam-com-bac-cha-la-lot',
    title: 'Mâm Cơm Bắc Bộ Chả Lá Lốt Thịt Nạc Dăm',
    region: 'bac',
    description: 'Hương thơm lá lốt nướng xèo xèo: Chả lá lốt thịt nạc dăm giòn bùi, canh cua đồng mồng tơi thơm béo và rau muống luộc dầm sấu mát lòng.',
    mainDish: getRecipe('mam-com-bac-3-cha-la-lot-thit-nac-dam-g'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Nước mắm cốt chanh ớt & Cà pháo muối giòn',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Thit_rang_chay_canh.jpg/960px-Thit_rang_chay_canh.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Đồng Quê', 'Đậm Đà', 'Yêu Thích', '1 Người', 'Giàu Đạm', 'Tiết Kiệm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-thit-dong-dua-chua',
    title: 'Mâm Cơm Bắc Bộ Thịt Đông Mộc Nhĩ Dưa Chua',
    region: 'bac',
    description: 'Chuẩn phong vị Tết Bắc: Thịt chân giò đông trong veo như thạch béo bùi, canh bí xanh nấu tôm tươi ngọt mát và dưa cải muối chua giòn tan.',
    mainDish: getRecipe('thit-dong-dua-chua'),
    soupDish: getRecipe('canh-bi-nau-tom'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Nước mắm cá cơm tiêu sọ & Ớt tươi thái lát',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Roast_pork_and_Char_Siu_Rice%2C_Singapore_September_2017.jpg/960px-Roast_pork_and_Char_Siu_Rice%2C_Singapore_September_2017.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Đồng Quê', 'Đậm Đà', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-chan-gio-luoc-mam-tom',
    title: 'Mâm Cơm Bắc Bộ Thịt Chân Giò Luộc Giòn Bì',
    region: 'bac',
    description: 'Phong vị mộc mạc Bắc Bộ: Thịt chân giò cuộn luộc thái mỏng giòn bì chấm mắm tôm chanh ớt sủi bọt, canh cua mồng tơi và rau muống luộc.',
    mainDish: getRecipe('mam-com-bac-5-thit-chan-gio-luoc-gion-b'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Mắm tôm Thanh Hóa đánh bông đường chanh & Ớt tươi',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Thit_rang_chay_canh.jpg/960px-Thit_rang_chay_canh.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Đậm Đà', 'Đồng Quê', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-ca-ro-kho-khe',
    title: 'Mâm Cơm Bắc Bộ Cá Rô Đồng Kho Khế Chua',
    region: 'bac',
    description: 'Món ngon hoài niệm thôn quê: Cá rô đồng kho khế chua thơm nức xương mềm rục, canh cua mồng tơi ngọt rêu và rau muống luộc dầm sấu mát.',
    mainDish: getRecipe('mam-com-bac-4-ca-ro--ong-kho-khe-chua-t'),
    soupDish: getRecipe('canh-cua-mong-toi'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Khế chua kho rục & Nước mắm gừng cay',
    imageUrl: 'https://images.unsplash.com/photo-1767436093457-84ea9122eb4e?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Đồng Quê', 'Đậm Đà', 'Đổi Vị', '1 Người', 'Tiết Kiệm', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-suon-xao-chua-ngot',
    title: 'Mâm Cơm Bắc Bộ Sườn Xào Chua Ngọt Hà Nội',
    region: 'bac',
    description: 'Món ăn gia đình được yêu thích nhất: Sườn non xào chua ngọt óng ả màu cánh gián, canh bí xanh nấu tôm ngọt lành và bắp cải xào tỏi giòn mát.',
    mainDish: getRecipe('mam-com-bac-2-suon-xao-chua-ngot-ha-noi'),
    soupDish: getRecipe('canh-bi-nau-tom'),
    sideDish: getRecipe('bap-cai-xao-toi'),
    condimentNote: 'Nước sốt chua ngọt sệt kẹo & Tiêu đen thơm',
    imageUrl: 'https://images.unsplash.com/photo-1761315414596-62d1f1ed5ed9?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Đậm Đà', 'Yêu Thích', '1 Người', 'Giàu Đạm', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },

  // --- Giàu Đạm & Đổi Vị (5 sets) ---
  {
    id: 'mam-com-bac-bo-xao-can-toi',
    title: 'Mâm Cơm Bắc Bộ Bò Xào Cần Tỏi Cà Chua',
    region: 'bac',
    description: 'Đĩa bò xào thơm nức căn bếp: Thịt bò mềm ngọt xào cần tây tỏi thơm và cà chua mọng nước, canh ngao thì là thanh mát và rau cải luộc chấm trứng.',
    mainDish: getRecipe('mam-com-bac-10-bo-xao-can-toi-ca-chua-th'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-cai-luoc-cham-trung'),
    condimentNote: 'Nước tương tỏi ớt tươi & Tiêu Phú Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1760504526069-ff0f8bf6e4ca?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Giàu Đạm', 'Đậm Đà', 'Yêu Thích', '1 Người', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-nem-ran-ha-noi',
    title: 'Mâm Cơm Bắc Bộ Nem Rán Hà Nội Giòn Rụm',
    region: 'bac',
    description: 'Món cỗ truyền thống: Nem rán vỏ giòn rụm nhân tôm thịt miến mộc nhĩ thơm nức, canh sườn non nấu sấu chua thanh và dưa cải muối chua giòn.',
    mainDish: getRecipe('nem-ran-ha-noi'),
    soupDish: getRecipe('canh-suon-nau-sau'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Nước mắm dưa góp đu đủ chua ngọt & Ớt tươi',
    imageUrl: 'https://images.unsplash.com/photo-1695712641388-87c0f9c2d36e?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Giàu Đạm', 'Đậm Đà', 'Đổi Vị', 'Yêu Thích', '1 Người', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-bo-sot-vang',
    title: 'Mâm Cơm Bắc Bộ Bò Sốt Vang Quế Hồi',
    region: 'bac',
    description: 'Ẩm thực phố cổ giao thoa: Bò sốt vang quế hồi rượu vang đỏ ninh mềm rục sánh kẹo, súp khoai tây cà rốt sườn heo và salad dầu giấm tươi mát.',
    mainDish: getRecipe('bo-sot-vang'),
    soupDish: getRecipe('canh-sup-khoai-tay'),
    sideDish: getRecipe('salad-dau-giam-ha-noi'),
    condimentNote: 'Rau mùi ta thơm nức & Bánh mì giòn chấm sốt',
    imageUrl: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Đổi Vị', 'Giàu Đạm', 'Đậm Đà', 'Yêu Thích', '1 Người', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-muc-xao-dua-can-toi',
    title: 'Mâm Cơm Bắc Bộ Mực Xào Dứa Cần Tỏi Giòn',
    region: 'bac',
    description: 'Hương vị phố biển Hạ Long: Mực tươi xào dứa chua ngọt giòn sần sật, canh ngao nấu chua thì là thanh mát và bắp cải non xào tỏi phi.',
    mainDish: getRecipe('mam-com-bac-15-muc-xao-dua-can-toi-gion-'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('bap-cai-xao-toi'),
    condimentNote: 'Tương ớt cay nồng & Tiêu thơm đập dập',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Grilled_squid_001.jpg/960px-Grilled_squid_001.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Giàu Đạm', 'Đổi Vị', 'Eat Clean', '1 Người', 'Yêu Thích', 'Đậm Đà', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-trung-duc-thit-nam-huong',
    title: 'Mâm Cơm Bắc Bộ Trứng Đúc Thịt Bằm Nấm Hương',
    region: 'bac',
    description: 'Mâm cơm ấm cúng gia đình: Trứng đúc thịt băm nấm hương vàng ruộm xốp mềm, canh cà chua đậu phụ thanh nhẹ và dưa cải muối chua giòn.',
    mainDish: getRecipe('mam-com-bac-8-trung--uc-thit-bam-nam-hu'),
    soupDish: getRecipe('canh-ca-chua-dau-phu'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Nước mắm tỏi ớt chanh & Hạt tiêu xay',
    imageUrl: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Tiết Kiệm', '1 Người', 'Đậm Đà', 'Yêu Thích', 'Đồng Quê', 'Mâm Cơm 3 Món']
  },

  // --- Ăn Chay / Thanh Tịnh (5 sets) ---
  {
    id: 'mam-com-bac-chay-tinh-tam',
    title: 'Mâm Cơm Chay Tịnh Tâm Bắc Bộ',
    region: 'bac',
    description: 'Thực đơn chay thanh tịnh đậm chất Hà Thành với cà tím om đậu phụ nấm tía tô thơm lừng, canh nấm hương sấu chua thanh tịnh và bắp cải xào tỏi.',
    mainDish: getRecipe('mam-com-chay-4-ca-tim-om--au-phu-nam-tia'),
    soupDish: getRecipe('canh-nam-sau-chua-thanh'),
    sideDish: getRecipe('bap-cai-xao-toi'),
    condimentNote: 'Nước tương gừng ớt tỏi & Cà pháo muối giòn',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Món Chay', 'Ăn Chay', 'Thanh Tịnh', 'Eat Clean', 'Đồng Quê', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-chay-dau-sot-ca',
    title: 'Mâm Cơm Chay Đậu Sốt Cà Phố Cổ',
    region: 'bac',
    description: 'Mâm cơm chay giản dị mộc mạc phố cổ với đậu hũ non sốt cà chua hành hoa, canh cà chua đậu phụ thanh nhẹ và dưa cải muối chua giòn.',
    mainDish: getRecipe('dau-hu-sot-ca-chua'),
    soupDish: getRecipe('canh-ca-chua-dau-phu'),
    sideDish: getRecipe('dua-cai-chua-ha-noi'),
    condimentNote: 'Muối vừng mè rang & Nước tương ớt tươi',
    imageUrl: 'https://images.unsplash.com/photo-1680173073730-852e0ec93bec?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Món Chay', 'Ăn Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', 'Yêu Thích', '1 Người', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-chay-dau-ran-luot-van',
    title: 'Mâm Cơm Chay Đậu Phụ Lướt Ván Bắc Bộ',
    region: 'bac',
    description: 'Thanh khiết vị chùa Trầm: Đậu phụ Mơ rán lướt ván giòn vỏ ngoài mềm mướt bên trong, canh nấm hương sấu chua thanh mát và rau muống luộc dầm sấu.',
    mainDish: getRecipe('mam-com-bac-11--au-phu-ran-gion-luot-van'),
    soupDish: getRecipe('canh-nam-sau-chua-thanh'),
    sideDish: getRecipe('rau-muong-luoc-sau'),
    condimentNote: 'Nước tương gừng ớt tỏi & Muối vừng thơm lừng',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Món Chay', 'Ăn Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-chay-cu-sen-kho',
    title: 'Mâm Cơm Chay Củ Sen Om Nước Dừa Bắc Bộ',
    region: 'bac',
    description: 'Bữa ăn chay bồi bổ cơ thể với củ sen kho tiêu bùi dẻo đậm đà, canh nấm hạt sen tươi bùi béo và rau củ luộc chấm kho quẹt nấm chay.',
    mainDish: getRecipe('mam-com-chay-10-cu-sen-kho-tieu-nuoc-dua-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Kho quẹt chay tóp mỡ bánh mì & Chao môn',
    imageUrl: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Món Chay', 'Ăn Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-bac-chay-nam-sau',
    title: 'Mâm Cơm Chay Đậu Mơ Chấm Tương Sấu Chua',
    region: 'bac',
    description: 'Phong vị mộc mạc chùa cổ: Đậu phụ Mơ rán vàng chấm tương Bần, canh nấm hương sấu chua thanh tịnh và bắp cải xào tỏi giòn thơm.',
    mainDish: getRecipe('mam-com-bac-11--au-phu-ran-gion-luot-van'),
    soupDish: getRecipe('canh-nam-sau-chua-thanh'),
    sideDish: getRecipe('bap-cai-xao-toi'),
    condimentNote: 'Tương Bần Hưng Yên thơm nồng & Ớt tươi',
    imageUrl: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Món Chay', 'Ăn Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Đồng Quê', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },

  // =========================================================================
  // 2. MIỀN TRUNG (trung) - 15 authentic sets
  // =========================================================================
  {
    id: 'mam-com-trung-ca-nuc-kho-keo-mat-mia',
    title: 'Mâm Cơm Miền Trung Cá Nục Kho Keo Mật Mía',
    region: 'trung',
    description: 'Đặc sản dải đất miền Trung: Cá nục rim mật mía sánh keo màu cánh gián ớt xiêm xanh cay nồng, canh chua cá biển thơm lừng và rau khoai lang luộc chấm mắm nêm Dì Cẩn.',
    mainDish: getRecipe('ca-nuc-kho-keo'),
    soupDish: getRecipe('canh-chua-ca-nam'),
    sideDish: getRecipe('rau-khoai-lang-luoc-cham-mam-nem'),
    condimentNote: 'Ớt xiêm xanh đập dập & Mắm nêm Dì Cẩn',
    imageUrl: 'https://images.unsplash.com/photo-1616557938459-b9baef2b7be3?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', 'Cá Biển', '1 Người', 'Yêu Thích', 'Đồng Quê', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-thit-xao-mam-ruoc',
    title: 'Mâm Cơm Miền Trung Ba Chỉ Xào Mắm Ruốc Huế',
    region: 'trung',
    description: 'Đậm vị Cố Đô: Thịt ba chỉ rang mắm ruốc sả ớt cay nồng đưa cơm, canh hến nấu rau tập tàng ngọt lịm mát lành và dưa giá bóp xổi ngâm chua giòn.',
    mainDish: getRecipe('mam-com-trung-34-thit-ba-chi-xao-mam-ruoc-'),
    soupDish: getRecipe('canh-hen-nau-rau-tap-tang'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Mắm ruốc sả ớt cay xé & Dưa leo thái mỏng',
    imageUrl: 'https://images.unsplash.com/photo-1625477811233-044633d10dd1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', '1 Người', 'Yêu Thích', 'Đồng Quê', 'Giàu Đạm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-hen-xao-sa-ot',
    title: 'Mâm Cơm Miền Trung Hến Xào Sả Ớt Rau Răm',
    region: 'trung',
    description: 'Hương vị sông Hương cồn Hến: Hến xào sả ớt rau răm cay nồng thơm ngát xúc bánh tráng nướng, canh hến nấu rau tập tàng và rau lang xào tỏi Lý Sơn.',
    mainDish: getRecipe('mam-com-trung-11-hen-xao-sa-ot-rau-ram--am'),
    soupDish: getRecipe('canh-hen-nau-rau-tap-tang'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Bánh tráng nướng mè giòn rụm & Nước mắm gừng cay',
    imageUrl: 'https://images.unsplash.com/photo-1648422709905-8c3d148974e1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', 'Đổi Vị', '1 Người', 'Tiết Kiệm', 'Yêu Thích', 'Đồng Quê', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-ga-kho-sa-ot',
    title: 'Mâm Cơm Miền Trung Gà Kho Sả Ớt Nghệ Tươi',
    region: 'trung',
    description: 'Bữa cơm xứ Quảng vàng ruộm: Thịt gà ta kho sả ớt nghệ tươi thơm lừng cay the, canh ngao nấu chua thì là và rau lang xào tỏi giòn mát.',
    mainDish: getRecipe('mam-com-trung-9-ga-kho-sa-ot-nghe-tuoi-va'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Ớt hiểm ngâm mắm cá cơm & Nghệ tươi giã dập',
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Đồng Quê', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-ca-bong-kho-tieu',
    title: 'Mâm Cơm Miền Trung Cá Bống Kho Tiêu Cay Nồng',
    region: 'trung',
    description: 'Cơm gia đình miền Trung ấm nồng với cá bống kho tiêu ớt hiểm cay xé lưỡi, canh chua cá biển miền Trung thơm ngọt và rau khoai lang luộc chấm mắm nêm.',
    mainDish: getRecipe('mam-com-trung-33-ca-bong-kho-tieu-ot-cay-n'),
    soupDish: getRecipe('canh-chua-ca-nam'),
    sideDish: getRecipe('rau-khoai-lang-luoc-cham-mam-nem'),
    condimentNote: 'Ớt hiểm dầm nước mắm cá cơm & Cà pháo muối',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/C%C3%A1_kho_t%E1%BB%99.JPG/960px-C%C3%A1_kho_t%E1%BB%99.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', 'Cá Biển', '1 Người', 'Yêu Thích', 'Đồng Quê', 'Tiết Kiệm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-muc-xao-sa-te',
    title: 'Mâm Cơm Miền Trung Mực Xào Sa Tế Cay Thơm',
    region: 'trung',
    description: 'Mâm cơm đậm đà miền Trung với mực tươi xào sả ớt sa tế cay nồng giòn sần sật, canh ngao nấu chua ngọt thì là và rau lang xào tỏi Lý Sơn.',
    mainDish: getRecipe('mam-com-trung-39-muc-la-xao-sa-ot-sa-te'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Sa tế tôm rim & Muối ớt chanh miền Trung',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Grilled_squid_001.jpg/960px-Grilled_squid_001.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', 'Cá Biển', 'Giàu Đạm', '1 Người', 'Đổi Vị', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-suon-ram-man-ngot',
    title: 'Mâm Cơm Miền Trung Sườn Non Ram Mặn Ngọt Xứ Huế',
    region: 'trung',
    description: 'Sườn heo non ram mặn ngọt vàng óng keo dẻo chuẩn vị cố đô, canh ngao nấu chua và rau lang xào tỏi giòn ngọt.',
    mainDish: getRecipe('mam-com-trung-3-suon-non-ram-man-ngot-xu-'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Nước sốt ram tiêu cay ngọt & Tỏi Lý Sơn',
    imageUrl: 'https://images.unsplash.com/photo-1761315414596-62d1f1ed5ed9?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Đậm Đà', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Đồng Quê', 'Đổi Vị', 'Tiết Kiệm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-tom-rim-keo',
    title: 'Mâm Cơm Miền Trung Tôm Biển Rim Mặn Ngọt Keo Óng',
    region: 'trung',
    description: 'Tôm đất biển miền Trung rim mặn ngọt keo màu óng ánh, canh ngao dứa nấu chua ngọt và rau lang xào tỏi thơm lừng.',
    mainDish: getRecipe('mam-com-trung-4-tom-bien-rim-man-ngot-keo'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Nước mắm nhỉ dầm ớt xiêm xanh & Tiêu sọ',
    imageUrl: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Đậm Đà', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Cá Biển', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-thit-luoc-mam-nem',
    title: 'Mâm Cơm Miền Trung Thịt Ba Chỉ Luộc Mắm Nêm',
    region: 'trung',
    description: 'Đặc sản Đà Nẵng: Thịt ba chỉ luộc giòn ngọt cuốn rau sống chấm mắm nêm cá cơm chua cay nồng nàn, canh hến nấu rau tập tàng và rau khoai lang luộc.',
    mainDish: getRecipe('mam-com-trung-12-thit-ba-chi-luoc-cham-mam'),
    soupDish: getRecipe('canh-hen-nau-rau-tap-tang'),
    sideDish: getRecipe('rau-khoai-lang-luoc-cham-mam-nem'),
    condimentNote: 'Mắm nêm Dì Cẩn tỏi ớt băm nhuyễn & Dứa băm',
    imageUrl: 'https://images.unsplash.com/photo-1707056503922-91c9ebaf0774?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Cay Nồng', 'Đậm Đà', 'Đồng Quê', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-bo-xao-can-toi',
    title: 'Mâm Cơm Miền Trung Thịt Bò Xào Hành Cần',
    region: 'trung',
    description: 'Bò mềm xào hành tây cần tỏi tiêu đen the ấm, canh ngao nấu chua thanh ngọt và rau lang xào tỏi giòn mát.',
    mainDish: getRecipe('mam-com-trung-8-thit-bo-xao-hanh-tay-can-'),
    soupDish: getRecipe('canh-ngao-nau-chua'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Nước tương tỏi ớt & Hạt tiêu giã dập',
    imageUrl: 'https://images.unsplash.com/photo-1723531055852-744d14ac00b4?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Giàu Đạm', 'Đậm Đà', '1 Người', 'Yêu Thích', 'Đổi Vị', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  // --- Chay Miền Trung (5 sets) ---
  {
    id: 'mam-com-trung-chay-nam-sa-ot',
    title: 'Mâm Cơm Chay Miền Trung Nấm Kho Sả Ớt Cay',
    region: 'trung',
    description: 'Thực đơn chay Cố Đô: Nấm xào sả ớt giòn thơm cay the đầu lưỡi, canh nấm hạt sen thanh ngọt và rau củ luộc chấm kho quẹt chay.',
    mainDish: getRecipe('mam-com-chay-2--au-hu-chien-vang-sa-ot-g'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Nước tương ớt chỉ thiên & Muối ớt sả',
    imageUrl: 'https://images.unsplash.com/photo-1785031765104-9af3d84fd3ff?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Cay Nồng', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-chay-dau-kho-tieu',
    title: 'Mâm Cơm Chay Miền Trung Đậu Hũ Kho Tiêu Tiết Kiệm',
    region: 'trung',
    description: 'Món chay mộc mạc chùa Từ Hiếu: Đậu hũ kho nấm rơm tiêu đen cay ấm, canh nấm hạt sen tươi bùi và rau củ luộc mát lành.',
    mainDish: getRecipe('mam-com-chay-1--au-hu-kho-nam-rom-tieu--'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Tiêu sọ xay nhuyễn & Nước tương gừng tỏi',
    imageUrl: 'https://images.unsplash.com/photo-1591522913962-3ecfa6b271f1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Đậm Đà', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-chay-cu-sen-om',
    title: 'Mâm Cơm Chay Miền Trung Củ Sen Hầm Tiêu',
    region: 'trung',
    description: 'Củ sen hồ Tịnh Tâm hầm tiêu nước dừa đậm đà dẻo bùi, canh nấm hạt sen thanh khiết và rau củ luộc kho quẹt chay thơm ngon.',
    mainDish: getRecipe('mam-com-chay-10-cu-sen-kho-tieu-nuoc-dua-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Nước tương mè rang & Tiêu đen thơm lừng',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', 'Đổi Vị', '1 Người', 'Đậm Đà', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-chay-nam-dui-ga',
    title: 'Mâm Cơm Chay Miền Trung Nấm Đùi Gà Xào Sả',
    region: 'trung',
    description: 'Nấm đùi gà xào sả ớt cay nồng giòn ngọt, canh nấm hạt sen bùi béo và rau củ luộc chấm kho quẹt thơm nức.',
    mainDish: getRecipe('mam-com-chay-3-nam--ui-ga-xao-sa-ot-dai-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Ớt bột cay Huế & Vừng rang',
    imageUrl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Cay Nồng', 'Giàu Đạm', 'Eat Clean', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-trung-chay-nam-bao-ngu',
    title: 'Mâm Cơm Chay Miền Trung Nấm Bào Ngư Chiên Giòn',
    region: 'trung',
    description: 'Nấm bào ngư tẩm bột chiên vàng giòn sốt chua ngọt miền Trung đậm đà, canh nấm hạt sen thanh ngọt và rau lang xào tỏi giòn mát.',
    mainDish: getRecipe('mam-com-chay-7-nam-bao-ngu-chien-gion-so'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-lang-xao-toi'),
    condimentNote: 'Ớt hiểm dầm nước tương & Vừng rang',
    imageUrl: 'https://images.unsplash.com/photo-1762305194201-077e7e23ccf2?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },

  // =========================================================================
  // 3. MIỀN NAM (nam) - 15 authentic sets
  // =========================================================================
  {
    id: 'mam-com-nam-ca-loc-kho-to',
    title: 'Mâm Cơm Nam Bộ Cá Lóc Đồng Kho Tộ',
    region: 'nam',
    description: 'Đậm đà hương đồng gió nội miền Tây với cá lóc kho tộ sánh kẹo tiêu đen, canh chua cá lóc bông điên điển thanh mát thơm ngon và dưa giá bóp xổi ngâm chua giòn.',
    mainDish: getRecipe('mam-com-nam-2-ca-loc--ong-kho-to-sanh-k'),
    soupDish: getRecipe('canh-chua-ca-loc-bong-dien-dien'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước mắm nhĩ tỏi ớt & Rau thơm ngò om',
    imageUrl: 'https://images.unsplash.com/photo-1767436093457-84ea9122eb4e?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Đồng Quê', 'Đậm Đà', 'Yêu Thích', '1 Người', 'Giàu Đạm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-canh-kho-qua',
    title: 'Mâm Cơm Nam Bộ Canh Khổ Qua & Thịt Kho Tộ',
    region: 'nam',
    description: 'Bữa cơm trọn vẹn tình quê: Canh khổ qua dồn thịt thanh mát giải nhiệt, thịt ba rọi kho tộ đất kẹo dẻo tiêu đen cay thơm và bông bí xào tỏi phi.',
    mainDish: getRecipe('thit-kho-to'),
    soupDish: getRecipe('canh-kho-qua-don-thit'),
    sideDish: getRecipe('bong-bi-xao-toi'),
    condimentNote: 'Nước mắm nhĩ ớt hiểm & Tiêu xay Phú Quốc',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Canh_kh%E1%BB%95_qua.JPG/960px-Canh_kh%E1%BB%95_qua.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Đậm Đà', 'Đồng Quê', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-muc-rim-me',
    title: 'Mâm Cơm Nam Bộ Mực Tươi Rim Me Chua Cay',
    region: 'nam',
    description: 'Mực tươi giòn ngọt rim sốt me sánh kẹo chua ngọt cay bùng nổ, canh chua cá hú thanh mát và bông bí non xào tỏi giòn ngọt.',
    mainDish: getRecipe('muc-rim-me'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('bong-bi-xao-toi'),
    condimentNote: 'Muối tiêu chanh ớt tươi & Tỏi phi thơm',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Flavorful_Grilled_Squid.jpg/960px-Flavorful_Grilled_Squid.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Cay Nồng', 'Đậm Đà', 'Giàu Đạm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-ca-keo-kho-rau-ram-cay',
    title: 'Mâm Cơm Nam Bộ Cá Kèo Kho Rau Răm Cay Kẹo',
    region: 'nam',
    description: 'Đặc sản Cà Mau: Cá kèo kho rau răm nước mắm kẹo dẻo cay the ấm nồng, canh chua cá lóc bông điên điển thanh mát và dưa giá chua giòn.',
    mainDish: getRecipe('mam-com-nam-7-ca-keo-kho-rau-ram-nuoc-m'),
    soupDish: getRecipe('canh-chua-ca-loc-bong-dien-dien'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Tiêu đen xay vỡ & Ớt hiểm dầm',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg/960px-C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Cay Nồng', 'Đậm Đà', 'Đồng Quê', '1 Người', 'Yêu Thích', 'Tiết Kiệm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-bach-tuoc-sa-te',
    title: 'Mâm Cơm Nam Bộ Bạch Tuộc Xào Sa Tế Giòn Cay',
    region: 'nam',
    description: 'Món ăn đậm đà sông nước miền Nam: Bạch tuộc tươi giòn sần sật xào sa tế cay nồng thơm lừng, canh chua cá hú thanh mát và dưa giá bóp xổi.',
    mainDish: getRecipe('mam-com-nam-13-bach-tuoc-xao-sa-te-can-t'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Muối tiêu chanh ớt hiểm & Rau răm thơm',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Grilled_squid_001.jpg/960px-Grilled_squid_001.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Cay Nồng', 'Đậm Đà', 'Giàu Đạm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-tom-rim-ba-chi-cay',
    title: 'Mâm Cơm Nam Bộ Tôm Rim Ba Chỉ Mặn Ngọt Tiêu Cay',
    region: 'nam',
    description: 'Tôm đất rim cùng thịt ba chỉ béo thơm cháy xém đậm đà rắc tiêu cay nồng, canh khổ qua dồn thịt thanh mát và bông bí xào tỏi giòn mát.',
    mainDish: getRecipe('mam-com-nam-5-tom-rim-thit-ba-chi-man-n'),
    soupDish: getRecipe('canh-kho-qua-don-thit'),
    sideDish: getRecipe('bong-bi-xao-toi'),
    condimentNote: 'Nước sốt rim kẹo nâu óng & Tiêu sọ',
    imageUrl: 'https://images.unsplash.com/photo-1688084468401-4938b073aef2?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Cay Nồng', 'Đậm Đà', 'Giàu Đạm', '1 Người', 'Yêu Thích', 'Đồng Quê', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-ca-basa-kho-thom-cay',
    title: 'Mâm Cơm Nam Bộ Cá Basa Kho Thơm Chua Cay',
    region: 'nam',
    description: 'Cá basa béo ngậy kho thơm và ớt hiểm cay nồng đậm đà, canh chua cá hú mát lành giải nhiệt và dưa giá bóp xổi ngâm chua giòn.',
    mainDish: getRecipe('mam-com-nam-10-ca-basa-kho-thom-chua-cay'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Ớt sừng băm & Nước mắm nhĩ Phú Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1767436093457-84ea9122eb4e?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Cay Nồng', 'Đậm Đà', 'Tiết Kiệm', '1 Người', 'Đồng Quê', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-ga-roti-nuoc-dua',
    title: 'Mâm Cơm Nam Bộ Đùi Gà Roti Nước Dừa',
    region: 'nam',
    description: 'Bữa cơm miền Nam ngọt bùi: Đùi gà roti rim nước dừa tươi ngũ vị óng ả, canh khổ qua dồn thịt thanh mát và dưa giá bóp chua xổi giòn tan.',
    mainDish: getRecipe('mam-com-nam-4--ui-ga-roti-nuoc-dua-ngu-'),
    soupDish: getRecipe('canh-kho-qua-don-thit'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Muối tiêu chanh & Dưa leo giòn mát',
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Đậm Đà', '1 Người', 'Giàu Đạm', 'Yêu Thích', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-ca-dieu-hong-chien-xu',
    title: 'Mâm Cơm Nam Bộ Cá Diêu Hồng Chiên Giòn Mắm Me',
    region: 'nam',
    description: 'Hương vị sông nước Cửu Long: Cá diêu hồng chiên xù giòn rụm chấm nước mắm me chua ngọt cay nồng, canh chua cá lóc điên điển và bông bí xào tỏi.',
    mainDish: getRecipe('mam-com-nam-6-ca-dieu-hong-chien-gion-r'),
    soupDish: getRecipe('canh-chua-ca-loc-bong-dien-dien'),
    sideDish: getRecipe('bong-bi-xao-toi'),
    condimentNote: 'Nước sốt mắm me kẹo dẻo ớt băm & Rau thơm',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/C%C3%A1_kho_t%E1%BB%99.JPG/960px-C%C3%A1_kho_t%E1%BB%99.JPG?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Đồng Quê', 'Đậm Đà', '1 Người', 'Yêu Thích', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-bo-xao-bong-he',
    title: 'Mâm Cơm Nam Bộ Bò Xào Bông Hẹ & Canh Chua',
    region: 'nam',
    description: 'Thực đơn healthy miền Nam: Thịt bò mềm xào bông hẹ tươi ngọt thanh nhẹ, canh chua cá hú thanh mát nhiều rau và dưa giá xổi chua giải ngấy.',
    mainDish: getRecipe('mam-com-nam-9-bo-xao-bong-he-tuoi-gion-'),
    soupDish: getRecipe('canh-chua-ca-hu'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước tương tỏi ớt băm tươi & Tiêu Phú Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1723531055852-744d14ac00b4?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Eat Clean', '1 Người', 'Giàu Đạm', 'Tiết Kiệm', 'Yêu Thích', 'Đậm Đà', 'Mâm Cơm 3 Món']
  },
  // --- Chay Miền Nam (5 sets) ---
  {
    id: 'mam-com-nam-chay-dau-hu-sa-ot',
    title: 'Mâm Cơm Chay Nam Bộ Đậu Hũ Chiên Sả Ớt',
    region: 'nam',
    description: 'Đậu hũ chiên vàng giòn rụm thơm lừng sả ớt cay nồng, canh nấm hạt sen tươi bùi béo và dưa giá bóp xổi chua ngọt thanh mát.',
    mainDish: getRecipe('dau-hu-chien-sa-ot'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Nước tương tỏi ớt băm & Chao môn béo ngậy',
    imageUrl: 'https://images.unsplash.com/photo-1591522913962-3ecfa6b271f1?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Cay Nồng', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-chay-kho-quet',
    title: 'Mâm Cơm Chay Nam Bộ Rau Luộc Kho Quẹt',
    region: 'nam',
    description: 'Đặc sản chay Nam Bộ: Nấm đùi gà xào thơm giòn, canh nấm hạt sen thanh ngọt và bông bí non xào tỏi giòn ngọt.',
    mainDish: getRecipe('mam-com-chay-3-nam--ui-ga-xao-sa-ot-dai-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('bong-bi-xao-toi'),
    condimentNote: 'Kho quẹt chay tóp mỡ bánh mì & Ớt xanh',
    imageUrl: 'https://images.unsplash.com/photo-1780842819206-435e9b52bc60?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Đồng Quê', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-chay-cu-sen-dua-tuoi',
    title: 'Mâm Cơm Chay Nam Bộ Củ Sen Kho Nước Dừa',
    region: 'nam',
    description: 'Củ sen kho nước dừa xiêm Bến Tre sánh quyện ngọt bùi đượm tiêu, canh nấm thanh tịnh và rau củ luộc tươi giòn chấm kho quẹt.',
    mainDish: getRecipe('mam-com-chay-10-cu-sen-kho-tieu-nuoc-dua-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Nước dừa tươi kho kẹo & Tiêu hạt Phú Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-chay-muop-dang-dau-non',
    title: 'Mâm Cơm Chay Nam Bộ Mướp Đắng Xào Đậu Phụ',
    region: 'nam',
    description: 'Mướp đắng xào đậu hũ non thanh nhiệt giải độc, canh nấm hạt sen ngọt lành và bông bí xào tỏi thơm béo.',
    mainDish: getRecipe('mam-com-chay-5-muop--ang-xao--au-phu-non'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('bong-bi-xao-toi'),
    condimentNote: 'Chao ớt miền Tây & Nước tương tỏi',
    imageUrl: 'https://images.unsplash.com/photo-1760504526069-ff0f8bf6e4ca?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Đổi Vị', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-nam-chay-dau-hu-kho-nam',
    title: 'Mâm Cơm Chay Nam Bộ Đậu Hũ Kho Nấm Tiêu',
    region: 'nam',
    description: 'Đậu hũ non kho nấm rơm tiêu đen sánh đậm đưa cơm, canh nấm thanh đạm và dưa giá bóp chua xổi giòn tan giải nhiệt.',
    mainDish: getRecipe('mam-com-chay-1--au-hu-kho-nam-rom-tieu--'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('dua-gia-bop-xoi'),
    condimentNote: 'Ớt sừng cắt khoanh & Nước tương nấm hương',
    imageUrl: 'https://images.unsplash.com/photo-1785031765104-9af3d84fd3ff?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', 'Đậm Đà', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },

  // =========================================================================
  // 4. MÓN ĂN CHAY (chay) - 5 authentic sets
  // =========================================================================
  {
    id: 'mam-com-chay-nam-bao-ngu-chua-ngot',
    title: 'Mâm Cơm Chay Nấm Bào Ngư Chiên Giòn Sốt Chua Ngọt',
    region: 'chay',
    description: 'Nấm bào ngư tẩm bột chiên vàng giòn rụm sốt chua ngọt đậm vị, canh nấm hạt sen thanh ngọt và rau củ luộc chấm kho quẹt nấm chay.',
    mainDish: getRecipe('mam-com-chay-7-nam-bao-ngu-chien-gion-so'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Muối tiêu chanh chay & Rau húng quế',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Đổi Vị', 'Eat Clean', '1 Người', 'Yêu Thích', 'Đậm Đà', 'Tiết Kiệm', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-chay-dau-hu-sa-ot-cay-nong',
    title: 'Mâm Cơm Chay Đậu Hũ Chiên Vàng Sả Ớt Cay Nồng',
    region: 'chay',
    description: 'Đậu hũ chiên sả ớt giòn rụm the cay kích thích vị giác, canh nấm hạt sen tươi bùi béo và rau củ luộc chấm kho quẹt thơm lừng.',
    mainDish: getRecipe('mam-com-chay-2--au-hu-chien-vang-sa-ot-g'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Ớt sả phi thơm & Chao môn béo',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Cay Nồng', 'Đậm Đà', '1 Người', 'Yêu Thích', 'Tiết Kiệm', 'Eat Clean', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-chay-nam-dui-ga-sa-ot',
    title: 'Mâm Cơm Chay Nấm Đùi Gà Xào Sả Ớt Cay',
    region: 'chay',
    description: 'Nấm đùi gà thái lát xào sả ớt dai giòn ngọt tự nhiên cay ấm nồng, canh nấm hạt sen và rau củ luộc kho quẹt chay.',
    mainDish: getRecipe('mam-com-chay-3-nam--ui-ga-xao-sa-ot-dai-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Nước tương gừng ớt & Vừng rang vàng',
    imageUrl: 'https://images.unsplash.com/photo-1592578630143-fac65cda7a67?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Cay Nồng', 'Giàu Đạm', 'Eat Clean', '1 Người', 'Yêu Thích', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-chay-cu-sen-tieu-đen',
    title: 'Mâm Cơm Chay Củ Sen Kho Tiêu Đen Nước Dừa',
    region: 'chay',
    description: 'Củ sen tươi kho tiêu đen nước dừa bùi dẻo đậm vị, canh nấm hạt sen thanh ngọt và rau củ luộc chấm sốt kho quẹt chay.',
    mainDish: getRecipe('mam-com-chay-10-cu-sen-kho-tieu-nuoc-dua-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Tiêu sọ xay nhuyễn & Kho quẹt tóp mỡ chay',
    imageUrl: 'https://images.unsplash.com/photo-1762305194201-077e7e23ccf2?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Đậm Đà', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-chay-dau-phu-sot-nam-huong',
    title: 'Mâm Cơm Chay Đậu Hũ Sốt Cà Nấm Hương',
    region: 'chay',
    description: 'Đậu hũ non sốt cà chua nấm hương ngọt dịu tự nhiên, canh nấm hạt sen tươi bùi béo và rau củ luộc thanh khiết.',
    mainDish: getRecipe('mam-com-chay-6--au-hu-sot-ca-chua---nam-'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Muối mè rang thơm & Nước tương tỏi ớt',
    imageUrl: 'https://images.unsplash.com/photo-1680991172715-4074203a40d3?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Đậm Đà', 'Mâm Cơm 3 Món']
  },

  // =========================================================================
  // 5. MÓN ÂU (western) - 10 authentic sets
  // =========================================================================
  {
    id: 'mam-com-au-steak-chimichurri',
    title: 'Mâm Cơm Âu: Bít Tết Thăn Bò Sốt Chimichurri Cay Thơm',
    region: 'western',
    description: 'Phong cách Nam Mỹ phóng khoáng: Bít tết thăn nội bò áp chảo bơ tỏi ăn kèm sốt thảo mộc Chimichurri cay dịu thơm nồng, súp cà chua húng quế và salad Địa Trung Hải.',
    mainDish: getRecipe('western-main-6-steak'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-dia-trung-hai-feta-dau-oliu'),
    condimentNote: 'Sốt Chimichurri ớt đỏ rau mùi & Muối hồng Himalaya',
    imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Cay Nồng', 'Giàu Đạm', 'Đậm Đà', 'Đổi Vị', 'Yêu Thích', '1 Người', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ca-hoi-dia-trung-hai',
    title: 'Mâm Cơm Âu: Cá Hồi Áp Chảo Bơ Chanh & Súp Cà Chua Basil',
    region: 'western',
    description: 'Bữa ăn Eat Clean phong cách Địa Trung Hải: Cá hồi Nauy áp chảo da giòn thịt mọng sốt bơ chanh thơm ngát, súp cà chua húng quế Ý và xà lách sốt dầu ô liu.',
    mainDish: getRecipe('ca-hoi-ap-chao-sot-bo-chanh'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-dia-trung-hai-feta-dau-oliu'),
    condimentNote: 'Dầu ô liu nguyên chất & Hạt tiêu đen xay vỡ',
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Eat Clean', 'Giàu Đạm', 'Đổi Vị', 'Yêu Thích', '1 Người', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-bo-luc-lac-khoai-nghien',
    title: 'Mâm Cơm Âu: Bò Lúc Lắc Bơ Tỏi Tiêu Cay & Súp Kem Bắp',
    region: 'western',
    description: 'Sự giao thoa ẩm thực tuyệt hảo: Bò phi lê lúc lắc áp chảo tiêu đen bơ tỏi thơm nức mũi hơi the cay, súp kem bắp gà xé mịn ngậy và khoai tây nghiền bơ thơm.',
    mainDish: getRecipe('mon-au-fastfood-55-b--l-c-l-c-x-o-b--t-i--n-'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('khoai-tay-nghien-bo-toi-thao-moc'),
    condimentNote: 'Muối tiêu chanh tươi & Bơ lạt thảo mộc',
    imageUrl: 'https://images.unsplash.com/photo-1723531055852-744d14ac00b4?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Cay Nồng', 'Giàu Đạm', 'Đậm Đà', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-ga-parmigiana-mang-tay',
    title: 'Mâm Cơm Âu: Gà Nướng Phô Mai Parmigiana & Măng Tây Áp Chảo',
    region: 'western',
    description: 'Thực đơn chuẩn Ý cho người mê đạm và healthy: Ức gà nướng phô mai sốt cà chua đút lò vàng ruộm, súp kem nấm thảo mộc và măng tây áp chảo bơ tỏi ngọt giòn.',
    mainDish: getRecipe('ga-nuong-parmigiana-pho-mai'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('mang-tay-ap-chao-bo-toi'),
    condimentNote: 'Bột ớt Paprika cay ngọt & Phô mai Parmesan bột',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Chicken_cordon_bleu%2C_Bee%27s_Steak_and_Shake%2C_Sleman%2C_Yogyakarta.jpg/960px-Chicken_cordon_bleu%2C_Bee%27s_Steak_and_Shake%2C_Sleman%2C_Yogyakarta.jpg?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Eat Clean', 'Giàu Đạm', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-beef-bourguignon',
    title: 'Mâm Cơm Âu: Bò Hầm Pháp Bœuf Bourguignon & Salad Caesar',
    region: 'western',
    description: 'Món hầm trứ danh nước Pháp: Bò hầm rượu vang nấm hương mềm rục thơm nồng ấm, súp cà chua nướng húng quế và salad Caesar xà lách tươi mát.',
    mainDish: getRecipe('bo-ham-ruou-vang-beef-bourguignon'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Lá thơm Thyme tươi & Bơ lạt Anchor',
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Bò Hầm', 'Pháp', 'Giàu Đạm', 'Đậm Đà', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  // --- Western Vegetarian Sets (5 sets) ---
  {
    id: 'mam-com-au-chay-pasta-pesto',
    title: 'Mâm Cơm Âu Chay: Mì Ý Sốt Pesto Húng Tây & Súp Cà Chua',
    region: 'western',
    description: 'Ẩm thực Ý chay thanh khiết: Đậu hũ chiên thảo mộc kèm mì Ý sốt Pesto húng tây thơm mát bùi béo, súp cà chua nướng basil và salad Caesar rau củ.',
    mainDish: getRecipe('dau-hu-chien-sa-ot'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('salad-caesar-xac-lach-romaine'),
    condimentNote: 'Phô mai Parmesan & Dầu ô liu Extra Virgin',
    imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-chay-sup-nam-banh-mi-bo',
    title: 'Mâm Cơm Âu Chay: Súp Kem Nấm Tươi & Bánh Mì Bơ Tỏi',
    region: 'western',
    description: 'Bữa ăn chay kiểu Pháp nhẹ nhàng: Đậu hũ sốt cà chua nấm hương, súp kem nấm tươi thảo mộc thơm béo ngậy và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('mam-com-chay-6--au-hu-sot-ca-chua---nam-'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Lá xạ hương Thyme & Tiêu đen xay mịn',
    imageUrl: 'https://images.unsplash.com/photo-1757489345059-31d51e241a3e?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-chay-mang-tay-khoai-nghien',
    title: 'Mâm Cơm Âu Chay: Măng Tây Áp Chảo Bơ Tỏi & Khoai Nghiền',
    region: 'western',
    description: 'Thực đơn xanh thanh lành phong cách Địa Trung Hải: Nấm bào ngư chiên giòn, súp cà chua húng quế và khoai tây nghiền bơ tỏi thơm mịn.',
    mainDish: getRecipe('mam-com-chay-7-nam-bao-ngu-chien-gion-so'),
    soupDish: getRecipe('sup-ca-chua-hung-que-y'),
    sideDish: getRecipe('khoai-tay-nghien-bo-toi-thao-moc'),
    condimentNote: 'Bột tỏi thảo mộc & Dầu ô liu chanh vàng',
    imageUrl: 'https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Đổi Vị', '1 Người', 'Yêu Thích', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-chay-salad-dia-trung-hai',
    title: 'Mâm Cơm Âu Chay: Salad Địa Trung Hải & Súp Kem Bắp',
    region: 'western',
    description: 'Bữa trưa tươi ngon thanh tịnh: Nấm đùi gà áp chảo sốt sả ớt the cay, súp kem bắp ngọt và salad Địa Trung Hải dưa leo cà chua dầu ô liu.',
    mainDish: getRecipe('mam-com-chay-3-nam--ui-ga-xao-sa-ot-dai-'),
    soupDish: getRecipe('sup-kem-bap-ngot-ga-xe'),
    sideDish: getRecipe('salad-dia-trung-hai-feta-dau-oliu'),
    condimentNote: 'Dấm Balsamic Ý & Muối hồng thảo mộc',
    imageUrl: 'https://images.unsplash.com/photo-1666083580269-6f409e1765d8?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', '1 Người', 'Yêu Thích', 'Đổi Vị', 'Mâm Cơm 3 Món']
  },
  {
    id: 'mam-com-au-chay-cu-sen-tieu-banh-mi',
    title: 'Mâm Cơm Âu Chay: Củ Sen Hầm Tiêu & Bánh Mì Bơ Tỏi',
    region: 'western',
    description: 'Sự kết hợp Á - Âu sáng tạo: Củ sen kho tiêu cay ấm đượm vị, súp kem nấm thảo mộc và bánh mì bơ tỏi nướng giòn rụm.',
    mainDish: getRecipe('mam-com-chay-10-cu-sen-kho-tieu-nuoc-dua-'),
    soupDish: getRecipe('sup-kem-nam-tuoi-thao-moc'),
    sideDish: getRecipe('banh-mi-bo-toi-nuong-gion-rum'),
    condimentNote: 'Bột ớt Paprika cay ngọt & Tiêu đen xay',
    imageUrl: 'https://images.unsplash.com/photo-1724041305788-afe63ae3bb5a?auto=format&fit=crop&w=600&q=80',
    tags: ['Món Âu', 'Western Food', 'Ăn Chay', 'Món Chay', 'Thanh Tịnh', 'Eat Clean', 'Tiết Kiệm', '1 Người', 'Yêu Thích', 'Đổi Vị', 'Mâm Cơm 3 Món']
  }
];

export const newMealSets: VietnameseMealSet[] = RAW_NEW_MEAL_SETS.map(set => {
  const totalCost = (set.mainDish?.estimatedCostVnd || 0) + (set.soupDish?.estimatedCostVnd || 0) + (set.sideDish?.estimatedCostVnd || 0);
  const totalCal = (set.mainDish?.calories || 0) + (set.soupDish?.calories || 0) + (set.sideDish?.calories || 0);
  return {
    ...set,
    totalCostVnd: totalCost,
    totalCalories: totalCal
  };
});

export const extendedMealSets: VietnameseMealSet[] = [
  ...mockMealSets,
  ...newMealSets
];
