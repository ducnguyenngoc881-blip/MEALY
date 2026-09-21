import { VietnameseMealSet } from '../types';
import { mockRecipes } from './mockRecipes';

// Helper to get recipe by ID
const getRecipe = (id: string) => {
  const found = mockRecipes.find(r => r.id === id);
  if (!found) {
    throw new Error(`Recipe with id ${id} not found`);
  }
  return found;
};

export const mockMealSets: VietnameseMealSet[] = [
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
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Mâm Cơm 3 Món', 'Đồng Quê', 'Bán Chạy']
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
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Đậm Đà', 'Mứt Ngọt']
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
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Trung', 'Mâm Cơm 3 Món', 'Cay Nồng', 'Cá Biển']
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
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Mâm Cơm 3 Món', 'Thanh Tịnh', 'Bổ Dưỡng']
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
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    tags: ['Giàu Đạm', 'Eat Clean', 'Tập Gym', 'Mâm Cơm 3 Món', 'Bán Chạy']
  },
  {
    id: 'mam-com-eat-clean-healthy',
    title: 'Mâm Cơm Eat Clean Thanh Lành',
    region: 'toan-quoc',
    description: 'Bữa ăn thanh nhẹ ít dầu mỡ, nhiều chất xơ và đạm thực vật từ nấm, đậu và rau củ ngũ sắc cho vóc dáng thon gọn.',
    mainDish: getRecipe('dau-hu-chien-sa-ot'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Sốt chấm mè rang thanh nhẹ & Chanh tươi',
    totalCostVnd: 105000,
    totalCalories: 520,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['Eat Clean', 'Ăn Chay', 'Thanh Tịnh', 'Mâm Cơm 3 Món']
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
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    tags: ['1 Người', 'Nhanh Gọn', 'Mâm Cơm 3 Món', 'Bán Chạy']
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
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Đậm Đà']
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
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Mâm Cơm 3 Món', 'Giàu Đạm']
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
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Bắc', 'Mâm Cơm 3 Món', 'Tiết Kiệm']
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
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Đậm Đà']
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
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    tags: ['Miền Nam', 'Mâm Cơm 3 Món', 'Cơm Nhà']
  },
  {
    id: 'mam-com-dau-ran-trung-may',
    title: 'Mâm Cơm Đậu Rán Canh Cà Chua Trứng Mây',
    region: 'chay',
    description: 'Bữa cơm thanh nhẹ: Đậu hũ rán giòn chấm mắm tỏi, canh cà chua trứng mây thơm nồng và rau củ luộc ngũ sắc.',
    mainDish: getRecipe('canh-ca-chua-trung-dau-ran'),
    soupDish: getRecipe('canh-nam-hat-sen'),
    sideDish: getRecipe('rau-cu-luoc-kho-quet-chay'),
    condimentNote: 'Tương bần & Nước tương gừng tỏi',
    totalCostVnd: 72000,
    totalCalories: 490,
    imageUrl: 'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    tags: ['Ăn Chay', 'Tiết Kiệm', 'Thanh Tịnh', 'Mâm Cơm 3 Món']
  }
];
