import { ApexCaseTier, ApexLootDrop, OfficeDrink, FastMealPreferenceMode } from '../types';
import { pickNonDuplicateDish } from '../utils/caseDeduplication';

export interface TierConfig {
  tier: ApexCaseTier;
  name: string;
  badge: string;
  priceRange: string;
  targetBudgetVnd: number;
  colorHex: string;
  lightBg: string;
  darkBg: string;
  textColor: string;
  borderClass: string;
  glowClass: string;
  bgGradient: string;
  description: string;
  vibeQuote: string;
  dropRateText: string;
}

export const APEX_TIERS: Record<ApexCaseTier, TierConfig> = {
  blue: {
    tier: 'blue',
    name: 'Hộp Tiết Kiệm',
    badge: 'RARE • TIẾT KIỆM',
    priceRange: '18.000 – 35.000 đ',
    targetBudgetVnd: 35000,
    colorHex: '#00d4ff',
    lightBg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-950/30',
    textColor: 'text-sky-700 dark:text-sky-400',
    borderClass: 'border-sky-400/50 dark:border-sky-500/40',
    glowClass: 'shadow-sky-500/30 shadow-lg',
    bgGradient: 'from-sky-500 via-blue-500 to-indigo-600',
    description: 'Bữa trưa văn phòng bình dân, no bụng, hạt dẻ dưới 35k.',
    vibeQuote: 'Cơm ngon chắc dạ, tiết kiệm để dành cuối tuần quẩy!',
    dropRateText: 'Chắc chắn trúng cơm ngon bình dân chuẩn vị'
  },
  purple: {
    tier: 'purple',
    name: 'Hộp Bình Dân',
    badge: 'EPIC • BÌNH DÂN',
    priceRange: '35.000 – 65.000 đ',
    targetBudgetVnd: 65000,
    colorHex: '#a855f7',
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-950/30',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderClass: 'border-purple-400/50 dark:border-purple-500/40',
    glowClass: 'shadow-purple-500/30 shadow-lg',
    bgGradient: 'from-purple-500 via-violet-500 to-indigo-700',
    description: 'Bữa trưa chuẩn văn phòng, đủ đạm, nhiều rau, kèm đồ uống chill.',
    vibeQuote: 'Ăn ngon tròn vị, nạp đầy năng lượng đánh bay buồn ngủ.',
    dropRateText: 'Set ăn chất lượng cao, cân đối dinh dưỡng & cà phê'
  },
  gold: {
    tier: 'gold',
    name: 'Hộp Hoàng Gia',
    badge: 'LEGENDARY • ĂN SANG',
    priceRange: '65.000 – 120.000+ đ',
    targetBudgetVnd: 120000,
    colorHex: '#f59e0b',
    lightBg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-400/60 dark:border-amber-500/50',
    glowClass: 'shadow-amber-500/40 shadow-xl',
    bgGradient: 'from-amber-400 via-amber-500 to-yellow-600',
    description: 'Bữa trưa thịnh soạn tự thưởng sau chuỗi ngày cày deadline căng thẳng.',
    vibeQuote: 'Deadline đã chốt, ví tiền rủng rỉnh, hôm nay phải ăn sang!',
    dropRateText: 'Thực đơn thượng hạng: Bò Mỹ, Lẩu mini, Sashimi, Nước ép cao cấp'
  }
};

export interface PreferenceModeConfig {
  id: FastMealPreferenceMode;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  borderClass: string;
  bgGlow: string;
}

export const PREFERENCE_MODES: Record<FastMealPreferenceMode, PreferenceModeConfig> = {
  combo: {
    id: 'combo',
    name: 'Cơm Trưa 3 Món',
    shortName: 'Cơm 3 Món',
    icon: '🍱',
    badge: 'CHUẨN 3 MÓN',
    tagline: 'Cơm mặn + Canh rau + Đồ uống',
    description: 'Set ăn 3 món cân bằng dinh dưỡng, nạp trọn năng lượng.',
    accentColor: '#10b981',
    borderClass: 'border-emerald-500/50',
    bgGlow: 'rgba(16, 185, 129, 0.35)'
  },
  'express-1dish': {
    id: 'express-1dish',
    name: 'Ăn Nhanh 1 Món',
    shortName: 'Ăn Nhanh',
    icon: '⚡',
    badge: '10–15 PHÚT',
    tagline: 'Gọn lẹ • Kịp ngủ trưa 30p',
    description: 'Bánh mì, phở, kebab, xôi... ăn gọn 10-15 phút để kịp ngủ trưa.',
    accentColor: '#06b6d4',
    borderClass: 'border-cyan-500/50',
    bgGlow: 'rgba(6, 182, 212, 0.35)'
  },
  'snack-genz': {
    id: 'snack-genz',
    name: 'Ăn Vặt Gen Z',
    shortName: 'Ăn Vặt',
    icon: '🍟',
    badge: 'ĐỂ NGUỘI VẪN NGON',
    tagline: 'Finger food • Nhâm nhi cả chiều',
    description: 'Đồ ăn nhanh bốc tay, để bàn làm việc ăn nguội vẫn ngon.',
    accentColor: '#f97316',
    borderClass: 'border-orange-500/50',
    bgGlow: 'rgba(249, 115, 22, 0.35)'
  },
  'bizarre-dare': {
    id: 'bizarre-dare',
    name: 'Độc Lạ Thử Thách',
    shortName: 'Thử Thách',
    icon: '💀',
    badge: 'KÈO PHẠT GAY CẤN',
    tagline: 'Món dị • Kèo cá cược văn phòng',
    description: 'Món độc lạ cho kèo cá cược văn phòng hoặc trải nghiệm mạo hiểm.',
    accentColor: '#ec4899',
    borderClass: 'border-pink-500/50',
    bgGlow: 'rgba(236, 72, 153, 0.4)'
  }
};

interface FastDishItem {
  id: string;
  title: string;
  category?: string;
  estimatedCostVnd: number;
  calories: number;
  imageUrl: string;
  description: string;
  speedMinutes?: number;
  napBuff?: string;
  snackFeature?: string;
  dareLevel?: string;
  darePenalty?: string;
}

interface FastSideItem {
  id: string;
  title: string;
  estimatedCostVnd: number;
  calories: number;
  imageUrl: string;
}

// ---------------- POOL BLUE (TIẾT KIỆM) ----------------
const BLUE_MAINS: FastDishItem[] = [
  {
    id: 'blue-com-tam-suon',
    title: 'Cơm Tấm Sườn Bì Trứng Ốp La',
    description: 'Sườn cốt lết nướng than hoa thơm lừng, mỡ hành óng ả, đồ chua giòn ngọt.',
    estimatedCostVnd: 28000,
    calories: 520,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-bun-thit-nuong',
    title: 'Bún Thịt Nướng Chả Giò Giòn Rụm',
    description: 'Bún tươi, thịt nướng mè thơm nức, rau thơm và nước mắm chua ngọt thanh tao.',
    estimatedCostVnd: 27000,
    calories: 460,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-banh-mi-xa-xiu',
    title: 'Bánh Mì Pate Chả Lụa Thịt Xá Xíu',
    description: 'Bánh mì giòn rụm kẹp pate béo, xá xíu đậm đà, dưa leo ngò rí và sốt tương ớt.',
    estimatedCostVnd: 22000,
    calories: 390,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-com-ga-xoi-mo',
    title: 'Cơm Gà Xối Mỡ Đùi Góc Tư Giòn Da',
    description: 'Cơm chiên hạt ngọc dẻo thơm, góc tư đùi gà giòn tan chấm tương ớt chua cay.',
    estimatedCostVnd: 30000,
    calories: 580,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-bun-dau-mam-tom',
    title: 'Bún Đậu Mắm Tôm Chả Cốm Hà Nội',
    description: 'Đậu mơ rán giòn rụm lướt ván, chả cốm thơm dẻo chấm mắm tôm sủi bọt tắc ớt.',
    estimatedCostVnd: 28000,
    calories: 480,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-com-thit-rang-chay-canh',
    title: 'Cơm Thịt Ba Chỉ Rang Cháy Cạnh',
    description: 'Ba chỉ xém vàng giòn thơm mắm tỏi hành phi, kèm cơm trắng nóng hổi.',
    estimatedCostVnd: 25000,
    calories: 490,
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80'
  }
];

const BLUE_SIDES: FastSideItem[] = [
  {
    id: 'blue-canh-cai-ngot',
    title: 'Canh Cải Ngọt Nấu Thịt Bằm',
    estimatedCostVnd: 4000,
    calories: 65,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-canh-rong-bien',
    title: 'Canh Rong Biển Đậu Hũ Non',
    estimatedCostVnd: 5000,
    calories: 55,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-dua-chua-bop-xoi',
    title: 'Đĩa Dưa Giá Hẹ Bóp Xổi Giòn Tan',
    estimatedCostVnd: 3000,
    calories: 35,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'blue-rau-muong-luoc',
    title: 'Rau Muống Luộc Nước Chanh Tươi',
    estimatedCostVnd: 3000,
    calories: 40,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  }
];

const BLUE_DRINKS: OfficeDrink[] = [
  {
    id: 'blue-tra-tac-nha-dam',
    title: 'Trà Tắc Mật Ong Nha Đam',
    estimatedCostVnd: 5000,
    calories: 60,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    officeBuff: '⚡ +50% Tỉnh táo giải nhiệt trưa hè'
  },
  {
    id: 'blue-nuoc-mia-sau-rieng',
    title: 'Nước Mía Cốt Dừa Thơm Mát',
    estimatedCostVnd: 5000,
    calories: 85,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    officeBuff: '💪 Hồi phục sinh lực tức thì sau 4 tiếng họp'
  },
  {
    id: 'blue-sua-dau-nanh',
    title: 'Sữa Đậu Nành Lá Dứa Nóng/Đá',
    estimatedCostVnd: 5000,
    calories: 70,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🌿 Thanh lọc cơ thể, tiêu hóa nhẹ nhàng'
  },
  {
    id: 'blue-tra-da-hoa-cuc',
    title: 'Trà Đá Hoa Cúc La Hán Quả',
    estimatedCostVnd: 3000,
    calories: 15,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🎯 Sáng mắt mát gan, nhìn rõ từng dòng code'
  }
];

// ---------------- POOL PURPLE (BÌNH DÂN) ----------------
const PURPLE_MAINS: FastDishItem[] = [
  {
    id: 'purple-com-nieu-bo-tieu',
    title: 'Cơm Niêu Singapore Bò Sốt Tiêu Đen',
    description: 'Cơm cháy đáy niêu giòn rụm, thịt bò xào sốt tiêu đen sôi sùng sục thơm nức mũi.',
    estimatedCostVnd: 48000,
    calories: 590,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-bun-bo-hue-dac-biet',
    title: 'Bún Bò Huế Đặc Biệt Nạm Gầu Chả Cua',
    description: 'Nước dùng ninh xương thơm nồng mùi sả mắm ruốc, bắp bò hoa và chả cua béo ngậy.',
    estimatedCostVnd: 45000,
    calories: 550,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-bento-ca-hoi-teriyaki',
    title: 'Bento Cá Hồi Áp Chảo Sốt Teriyaki',
    description: 'Cá hồi tươi áp chảo đẫm sốt teriyaki Nhật Bản, cơm rắc rong biển mè rang.',
    estimatedCostVnd: 52000,
    calories: 520,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-com-ga-hoi-an',
    title: 'Cơm Gà Hội An Xé Phay Cơm Vàng Nghệ',
    description: 'Cơm nấu nước luộc gà dẻo thơm óng vàng, gà ta xé phay bóp rau răm hành tây chua ngọt.',
    estimatedCostVnd: 46000,
    calories: 510,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-com-bo-luc-lac',
    title: 'Cơm Bò Lúc Lắc Khoai Tây Chiên Giòn',
    description: 'Bò thăn cắt vuông xào bơ tỏi ớt chuông mềm mọng, ăn kèm cơm chiên tỏi.',
    estimatedCostVnd: 50000,
    calories: 610,
    imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-pho-bo-tho-da',
    title: 'Phở Bò Thố Đá Tái Lăn Nước Dùng Trong',
    description: 'Thố đá giữ nhiệt sôi bùng bùng, thịt bò tái lăn mềm ngọt, bánh phở tươi dẻo dai.',
    estimatedCostVnd: 48000,
    calories: 530,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
  }
];

const PURPLE_SIDES: FastSideItem[] = [
  {
    id: 'purple-canh-kim-chi',
    title: 'Canh Kim Chi Hàn Quốc Thịt Ba Rọi',
    estimatedCostVnd: 8000,
    calories: 85,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-sup-miso',
    title: 'Súp Miso Rong Biển Đậu Phụ Non Nhật',
    estimatedCostVnd: 7000,
    calories: 50,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-salad-dau-giam',
    title: 'Salad Xà Lách Trộn Sốt Dầu Giấm Trứng Cút',
    estimatedCostVnd: 8000,
    calories: 70,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'purple-canh-chua-tom',
    title: 'Canh Chua Tôm Tươi Nấu Bạc Hà',
    estimatedCostVnd: 9000,
    calories: 75,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
  }
];

const PURPLE_DRINKS: OfficeDrink[] = [
  {
    id: 'purple-ca-phe-muoi',
    title: 'Cà Phê Muối Béo Ngậy Chú Long',
    estimatedCostVnd: 12000,
    calories: 110,
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    officeBuff: '☕ +100% Tập trung xuyên màn hình máy tính'
  },
  {
    id: 'purple-tra-dao-cam-sa',
    title: 'Trà Đào Cam Sả Tươi Mát Giòn Miếng',
    estimatedCostVnd: 14000,
    calories: 95,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    officeBuff: '✨ Tăng 200% cảm hứng sáng tạo đồ họa & viết lách'
  },
  {
    id: 'purple-tra-sua-oolong-nuong',
    title: 'Trà Sữa Oolong Nướng Kem Trứng 50% Đường',
    estimatedCostVnd: 15000,
    calories: 160,
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🧋 Kháng 100% stress từ khách hàng & sếp'
  },
  {
    id: 'purple-nuoc-ep-oi-hong',
    title: 'Nước Ép Ổi Hồng Ruby Không Đường',
    estimatedCostVnd: 12000,
    calories: 60,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍎 Nạp Vitamin C dồi dào, da sáng dáng thon'
  }
];

// ---------------- POOL GOLD (LEGENDARY • ĂN SANG) ----------------
const GOLD_MAINS: FastDishItem[] = [
  {
    id: 'gold-beefsteak-angus',
    title: 'Beefsteak Thăn Bò Black Angus Sốt Tiêu Đen',
    description: 'Thăn bò nhập khẩu áp chảo Medium Rare mọng nước, ăn kèm khoai tây nghiền bơ Pháp và măng tây.',
    estimatedCostVnd: 95000,
    calories: 680,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-mini-lau-haidilao',
    title: 'Set Mini Lẩu Haidilao Thăn Bò Mỹ & Tôm Sú',
    description: 'Nước lẩu cà chua trứ danh hoặc cốt xương thảo mộc, đĩa thăn bò Mỹ cuộn nấm và tôm sú tươi.',
    estimatedCostVnd: 88000,
    calories: 640,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-sashimi-ca-hoi-unagi',
    title: 'Set Sashimi Cá Hồi Na Uy & Cơm Lươn Nhật Unagi',
    description: 'Cá hồi tươi rói béo ngọt kèm lươn nướng sốt Kabayaki đậm đà, trứng cá chuồn và wasabi tươi.',
    estimatedCostVnd: 98000,
    calories: 590,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-com-nieu-bo-luc-lac',
    title: 'Cơm Niêu Bò Lúc Lắc Trứng Lòng Đào Tiêu Xanh',
    description: 'Bò lúc lắc xào thơm bơ tỏi hạt tiêu xanh cay dịu ăn cùng cơm niêu cháy giòn rụm và trứng lòng đào.',
    estimatedCostVnd: 75000,
    calories: 620,
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-pizza-hai-san-phomai',
    title: 'Pizza Hải Sản Tôm Mực Đút Lò Phô Mai Mozzarella',
    description: 'Đế bánh bột lên men 48h nướng củi, tôm sú, mực ống tươi và phô mai kéo sợi ngập tràn.',
    estimatedCostVnd: 85000,
    calories: 670,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
  }
];

const GOLD_SIDES: FastSideItem[] = [
  {
    id: 'gold-salad-ca-ngu-bo',
    title: 'Salad Cá Ngừ Đại Dương Quả Bơ Sốt Mè Rang',
    estimatedCostVnd: 15000,
    calories: 95,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-sup-bao-ngu',
    title: 'Súp Bào Ngư Hải Sản Nấm Đông Cô Mini',
    estimatedCostVnd: 18000,
    calories: 85,
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-salad-uc-ngong',
    title: 'Salad Ức Ngỗng Xông Khói Quả Óc Chó Dầu Olive',
    estimatedCostVnd: 16000,
    calories: 110,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gold-canh-ga-dong-trung',
    title: 'Canh Gà Hầm Đông Trùng Hạ Thảo Táo Đỏ',
    estimatedCostVnd: 16000,
    calories: 90,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'
  }
];

const GOLD_DRINKS: OfficeDrink[] = [
  {
    id: 'gold-sinh-to-bo-sau-rieng',
    title: 'Sinh Tố Bơ Sáp Sầu Riêng Ri6 Kem Dừa',
    estimatedCostVnd: 22000,
    calories: 190,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
    officeBuff: '👑 Năng lượng hoàng gia: Bất bại trước mọi bug và deadline'
  },
  {
    id: 'gold-tra-hoa-qua-nhiet-doi',
    title: 'Trà Hoa Quả Hoàng Gia 7 Loại Quả Tươi Cao Cấp',
    estimatedCostVnd: 20000,
    calories: 110,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🌟 Tâm trạng thư thái như đang nghỉ dưỡng tại resort 5 sao'
  },
  {
    id: 'gold-coldbrew-cam-vang',
    title: 'Cold Brew Ủ Lạnh 24H Cam Vàng Hoa Rừng',
    estimatedCostVnd: 22000,
    calories: 50,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    officeBuff: '⚡ Siêu giác quan: Code không lỗi, tư duy sắc bén như dao cạo'
  },
  {
    id: 'gold-nuoc-ep-luu-do',
    title: 'Nước Ép Lựu Đỏ Tây Ban Nha Ép Lạnh Nguyên Chất',
    estimatedCostVnd: 25000,
    calories: 90,
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    officeBuff: '💎 Siêu chống lão hóa, phục hồi năng lượng 300%'
  }
];

// =========================================================================
// ⚡ POOL 1-DISH OFFICE EXPRESS (ĂN NHANH ĐỂ KỊP CHỢP MẮT TRƯA) - TIER EXCLUSIVE
// =========================================================================

// Tier Blue: Nhanh Rẻ (18k – 28k)
export const EXPRESS_BLUE_MAINS: FastDishItem[] = [
  {
    id: 'exp-blue-banh-bao-2-trung-cut',
    title: 'Bánh Bao 2 Trứng Cút Xá Xíu Cỡ Đại',
    description: 'Vỏ bánh bao mềm xốp nóng hổi, nhân thịt heo băm mộc nhĩ, lạp xưởng và 2 quả trứng cút.',
    estimatedCostVnd: 18000,
    calories: 360,
    speedMinutes: 8,
    napBuff: '💤 Cứu cánh đói bụng 5 phút, ngủ trưa tới 13h30!',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-blue-banh-mi-cha-ca-nong',
    title: 'Bánh Mì Chả Cá Nóng Thì Là Sốt Cay Hải Phòng',
    description: 'Chả cá basa chiên nóng tại chỗ thơm nức thì là, ớt bột chưng và nước sốt chua ngọt đậm đà.',
    estimatedCostVnd: 22000,
    calories: 370,
    speedMinutes: 10,
    napBuff: '💤 Bánh mì nóng giòn tan, tiết kiệm 35 phút ngủ trưa!',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-blue-banh-mi-pate-xa-xiu',
    title: 'Bánh Mì Pate Chả Lụa Thịt Xá Xíu Giòn Rụm',
    description: 'Bánh mì nóng hổi giòn rụm kẹp pate béo bùi, thịt xá xíu đậm vị, dưa leo ngò rí và sốt ớt cay nhẹ.',
    estimatedCostVnd: 25000,
    calories: 390,
    speedMinutes: 10,
    napBuff: '💤 Dành được 35 phút ngủ trưa say giấc!',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-blue-xoi-man-thap-cam',
    title: 'Xôi Mặn Thập Cẩm Chả Lụa Lạp Xưởng Pate',
    description: 'Xôi nếp dẻo thơm rưới mỡ hành, chà bông gà, lạp xưởng chiên xắt lát và pate béo ngậy.',
    estimatedCostVnd: 25000,
    calories: 480,
    speedMinutes: 10,
    napBuff: '💤 Chắc dạ no lâu, nằm xuống là ngủ ngay 35 phút!',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-blue-onigiri-ca-hoi-xuc-xich',
    title: 'Cơm Nắm Onigiri Cá Hồi Cay & Xúc Xích Đức',
    description: 'Set 2 nắm cơm bọc rong biển giòn kèm xúc xích nướng tiêu, tiện lợi vừa ăn vừa chuẩn bị ngủ.',
    estimatedCostVnd: 28000,
    calories: 410,
    speedMinutes: 8,
    napBuff: '💤 Siêu gọn gàng, dư hẳn 40 phút chợp mắt!',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-blue-banh-mi-opla-pate',
    title: 'Bánh Mì Ốp La 2 Trứng Lòng Đào Pate Tiêu',
    description: '2 trứng ốp la lòng béo ngậy, pate gan Hải Phòng thơm lừng kẹp bánh mì giòn tan.',
    estimatedCostVnd: 22000,
    calories: 380,
    speedMinutes: 9,
    napBuff: '💤 Ăn nhanh tức thì, nạp đạm chuẩn bị ngủ trưa!',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80'
  }
];

// Tier Purple: Vừa Vặn (30k – 45k)
export const EXPRESS_PURPLE_MAINS: FastDishItem[] = [
  {
    id: 'exp-pur-doner-kebab-tho-nhi-ky',
    title: 'Doner Kebab Bánh Mì Thổ Nhĩ Kỳ Đẫm Sốt Tỏi',
    description: 'Bánh mì tam giác nướng giòn kẹp thịt nướng xiên quay đẫm sốt tỏi mayonnaise và bắp cải tím.',
    estimatedCostVnd: 38000,
    calories: 460,
    speedMinutes: 12,
    napBuff: '💤 Ăn vèo 10 phút, dành trọn 30 phút ngủ trưa!',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-pur-mi-xao-bo-rau-cai',
    title: 'Mì Xào Bò Rau Cải Bắp Nóng Hổi',
    description: 'Mì trứng xào giòn thơm lừng lửa lớn, thịt bò ướp dầu hào mềm ngọt và rau cải xanh giòn mát.',
    estimatedCostVnd: 38000,
    calories: 520,
    speedMinutes: 12,
    napBuff: '💤 Ăn nhanh gọn gàng, sạc lại 100% pin buổi chiều!',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-pur-hu-tieu-nam-vang-kho',
    title: 'Hủ Tiếu Nam Vang Khô Sốt Đậm Đà Hộp Mang Đi',
    description: 'Sợi hủ tiếu dai trộn sốt tương đen đặc biệt, thịt băm, tôm tươi, gan heo và chén súp ngọt thanh.',
    estimatedCostVnd: 42000,
    calories: 490,
    speedMinutes: 14,
    napBuff: '💤 Hương vị Nam Bộ thơm ngon, kịp chợp mắt 25 phút!',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-pur-pho-bo-tai-lan-mang-di',
    title: 'Phở Bò Tái Lăn Hà Nội Hộp Giấy Mang Đi',
    description: 'Thịt bò xào tái lăn tỏi thơm nức, nước dùng xương bò thanh ngọt nóng hổi, bánh phở mềm dẻo.',
    estimatedCostVnd: 45000,
    calories: 520,
    speedMinutes: 15,
    napBuff: '💤 Ấm bụng tức thì, kịp ngủ trưa 25 phút!',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-pur-bun-cha-hop-van-phong',
    title: 'Bún Chả Nướng Hà Nội Đóng Hộp Văn Phòng',
    description: 'Chả viên và thịt ba chỉ nướng than hoa thơm lừng trong bát nước chấm ấm, bún tươi và rau ghém.',
    estimatedCostVnd: 45000,
    calories: 530,
    speedMinutes: 15,
    napBuff: '💤 Chuẩn vị Hà Nội, no bụng ngủ trưa say nồng!',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-pur-com-rang-dua-bo',
    title: 'Cơm Rang Dưa Bò Khói Lửa Hà Thành Mang Đi',
    description: 'Cơm đảo hạt vàng săn tơi giòn giòn, thịt bò mềm xào dưa chua ngấm đều vị tiêu bắc cay ấm.',
    estimatedCostVnd: 42000,
    calories: 550,
    speedMinutes: 13,
    napBuff: '💤 No chắc dạ, yên tâm ngủ trưa tràn trề sinh lực!',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80'
  }
];

// Tier Gold: Đặc Biệt / Thượng Hạng (50k – 80k+)
export const EXPRESS_GOLD_MAINS: FastDishItem[] = [
  {
    id: 'exp-gold-bo-bit-tet-kraft',
    title: 'Bò Bít Tết Hộp Giấy Kraft Kèm Khoai Tây & Bánh Mì Bơ Tỏi',
    description: 'Thăn bò Mỹ áp chảo sốt tiêu đen thơm lừng, kèm bánh mì bơ tỏi nướng giòn và khoai tây múi cau.',
    estimatedCostVnd: 68000,
    calories: 590,
    speedMinutes: 15,
    napBuff: '👑 Đẳng cấp thượng hạng, ăn xong ngủ một giấc mơ đẹp!',
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-gold-com-luon-unagi',
    title: 'Cơm Lươn Nhật Bản Unagi Nướng Sốt Teriyaki Hộp Bento',
    description: 'Lươn nướng than hoa phủ sốt Teriyaki óng ả, thịt lươn mềm ngậy béo ngậy rắc mè rang thơm nức.',
    estimatedCostVnd: 75000,
    calories: 610,
    speedMinutes: 14,
    napBuff: '👑 Nạp trọn dưỡng chất hoàng gia, tỉnh táo suốt ca chiều!',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-gold-burger-bo-wagyu',
    title: 'Burger Bò Nướng Phô Mai Tan Chảy & Khoai Giòn Tan',
    description: 'Bò băm nướng medium rare đẫm sốt phô mai cheddar tan chảy, hành tây caramen và bánh brioche bơ.',
    estimatedCostVnd: 65000,
    calories: 630,
    speedMinutes: 12,
    napBuff: '👑 Tiện lợi bốc tay ăn siêu tốc 10 phút, ngủ trưa 35p!',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-gold-com-ca-hoi-ap-chao',
    title: 'Cơm Cá Hồi Na-uy Áp Chảo Sốt Bơ Chanh Măng Tây',
    description: 'Cá hồi Na-uy tươi áp chảo giòn da béo mọng, sốt bơ chanh béo ngậy và măng tây xào tỏi giòn mát.',
    estimatedCostVnd: 79000,
    calories: 580,
    speedMinutes: 14,
    napBuff: '👑 Giàu Omega-3 bồi bổ trí não cho buổi chiều bứt phá!',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'exp-gold-pho-thin-tho-da',
    title: 'Phở Bò Tái Lăn Thố Đá Giữ Nhiệt Thượng Hạng Mang Đi',
    description: 'Thố phở nóng hổi sủi bọt ngập tràn thịt thăn bò xào gừng tỏi khói lửa, nước dùng thanh ngọt đậm đà.',
    estimatedCostVnd: 65000,
    calories: 570,
    speedMinutes: 15,
    napBuff: '👑 Bữa trưa cực phẩm Hà Thành, đánh tan mọi áp lực công việc!',
    imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80'
  }
];

export const EXPRESS_1DISH_MAINS: FastDishItem[] = [
  ...EXPRESS_BLUE_MAINS,
  ...EXPRESS_PURPLE_MAINS,
  ...EXPRESS_GOLD_MAINS
];

// =========================================================================
// 🍟 POOL SNACK GEN Z (ĂN VẶT LAI RAI, ĐỂ LÂU ĂN NGUỘI VẪN NGON) - TIER EXCLUSIVE
// =========================================================================

// Tier Blue: Ăn Vặt 1 (25k – 35k)
export const SNACK_BLUE_MAINS: FastDishItem[] = [
  {
    id: 'snack-blue-khoai-lac-phomai',
    title: 'Khoai Tây Chiên Pháp Lắc Phô Mai Béo Bùi',
    description: 'Khoai tây cọng giòn rụm phủ lớp bột phô mai cam óng ánh mặn ngọt, món ăn vặt quốc dân của Gen Z.',
    estimatedCostVnd: 28000,
    calories: 350,
    snackFeature: '🍟 Mặn ngọt béo bùi, nhâm nhi xuyên suốt buổi chiều gõ phím',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-blue-banh-trang-nuong',
    title: 'Bánh Tráng Nướng Trứng Cút Bò Khô Xúc Xích',
    description: 'Pizza Việt Nam giòn tan trên than hồng, đẫm bơ, mỡ hành, ruốc tôm và mayonnaise béo ngậy.',
    estimatedCostVnd: 25000,
    calories: 340,
    snackFeature: '🍕 Bánh tráng giòn rụm, chuẩn phong cách ăn vặt cổng trường',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-blue-bap-xao-bo-tep',
    title: 'Bắp Nếp Xào Bơ Tép Mỡ Hành Thơm Nức Sài Gòn',
    description: 'Hạt bắp nếp dẻo ngọt xào bơ thơm ngào ngạt, tép khô giòn rụm và mỡ hành béo ngậy.',
    estimatedCostVnd: 22000,
    calories: 320,
    snackFeature: '🌽 Bốc thìa nhâm nhi trên bàn, để nguội vẫn dẻo thơm',
    imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-blue-banh-trang-tron',
    title: 'Bánh Tráng Trộn Sa Tế Khô Bò Trứng Cút Chua Ngọt',
    description: 'Bánh tráng sợi dai mềm thấm đẫm sốt me, sa tế tỏi ớt, xoài chua bào sợi và đậu phộng rang giòn.',
    estimatedCostVnd: 25000,
    calories: 310,
    snackFeature: '🥢 Món ăn vặt gây nghiện số 1 văn phòng, càng nhai càng cuốn',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'
  }
];

export const SNACK_BLUE_SIDES: FastSideItem[] = [
  {
    id: 'snack-side-dua-leo-muoi-tom',
    title: 'Dưa Leo Cắt Lát Chấm Muối Tôm Tây Ninh',
    estimatedCostVnd: 3000,
    calories: 25,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-side-xoai-non-lac',
    title: 'Xoài Non Chua Giòn Lắc Muối Ớt Cay Nồng',
    estimatedCostVnd: 5000,
    calories: 45,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  }
];

export const SNACK_BLUE_DRINKS: OfficeDrink[] = [
  {
    id: 'snack-drink-tra-chanh-gia-tay',
    title: 'Trà Chanh Giã Tay Quảng Đông Thơm Nồng',
    estimatedCostVnd: 8000,
    calories: 90,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍋 Tinh dầu chanh bừng sáng trí tuệ, tỉnh như sáo'
  },
  {
    id: 'snack-drink-tra-tac-xi-muoi',
    title: 'Trà Tắc Xí Muội Mát Lạnh Chua Ngọt',
    estimatedCostVnd: 8000,
    calories: 80,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍊 Đập tan cơn buồn ngủ sau giờ ăn trưa'
  }
];

// Tier Purple: Combo Chiều (38k – 65k)
export const SNACK_PURPLE_MAINS: FastDishItem[] = [
  {
    id: 'snack-pur-chicken-nuggets',
    title: 'Chicken Nuggets Chiên Giòn Sốt Mù Tạt Mật Ong',
    description: 'Miếng gà nugget chiên vàng ươm giòn rụm, để trên bàn làm việc cả tiếng ăn nguội vẫn giòn thơm béo ngậy.',
    estimatedCostVnd: 38000,
    calories: 420,
    snackFeature: '🍗 Để nguội ăn vẫn giòn tan, bốc tay tiện lợi vừa làm vừa nhâm nhi',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-pur-ga-ran-popcorn',
    title: 'Gà Rán Popcorn Giòn Rụm Lắc Cay Ngọt',
    description: 'Từng viên gà không xương chiên xù lắc sốt cay ngọt Hàn Quốc, cắn ngập miệng không lo dính dầu tay.',
    estimatedCostVnd: 40000,
    calories: 450,
    snackFeature: '🍿 Gà viên cắn ngập miệng, vừa gõ phím vừa ăn chill chill',
    imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-pur-nem-chua-ran',
    title: 'Nem Chua Rán Phố Cổ Hà Nội Giòn Dai',
    description: 'Nem chua tẩm bột chiên xù giòn tan, bên trong dẻo dai chua dịu chấm tương ớt cay nồng.',
    estimatedCostVnd: 35000,
    calories: 390,
    snackFeature: '🍢 Dai dai giòn giòn, ăn nguội chấm tương ớt ngon đỉnh chóp',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-pur-ca-vien-chien-mam-toi',
    title: 'Cá Viên Chiên Nước Mắm Bơ Tỏi Đậm Đà',
    description: 'Cá viên, bò viên, xúc xích chiên xào sốt mắm bơ tỏi thơm lừng kèm đậu bắp giòn giòn.',
    estimatedCostVnd: 36000,
    calories: 410,
    snackFeature: '🍡 Sốt bơ tỏi thơm nức mũi cả phòng, ăn cùng đồng nghiệp bao vui',
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-pur-muc-vong-chien-gion',
    title: 'Mực Vòng Tẩm Bột Chiên Giòn Lắc Muối Tiêu Chanh',
    description: 'Khoanh mực ống giòn sần sật bọc bột xù vàng óng, rắc muối tiêu chanh thơm lừng.',
    estimatedCostVnd: 45000,
    calories: 430,
    snackFeature: '🦑 Giòn sần sật mằn mặn đã miệng, để cả chiều không tanh',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  }
];

export const SNACK_PURPLE_SIDES: FastSideItem[] = [
  {
    id: 'snack-pur-side-khoai-lang-ken',
    title: 'Khoai Lang Kén Tẩm Mè Chiên Vàng Giòn',
    estimatedCostVnd: 10000,
    calories: 120,
    imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-pur-side-xuc-xich-nuong-que',
    title: 'Xúc Xích Phô Mai Nướng Que Rưới Sốt Mayonnaise',
    estimatedCostVnd: 12000,
    calories: 140,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'
  }
];

export const SNACK_PURPLE_DRINKS: OfficeDrink[] = [
  {
    id: 'snack-pur-drink-tra-sua-tran-chau',
    title: 'Trà Sữa Trân Châu Đường Đen Đài Loan Đậm Vị',
    estimatedCostVnd: 22000,
    calories: 220,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🧋 Nạp 100% đường huyết, tăng công suất gõ phím'
  },
  {
    id: 'snack-pur-drink-tra-dao-cam-sa',
    title: 'Trà Đào Cam Sả Thạch Đào Giòn Sần Sật',
    estimatedCostVnd: 20000,
    calories: 130,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍑 Tỉnh táo chém gió cùng hội đồng nghiệp thân thiết'
  }
];

// Tier Gold: Trùm Ăn Vặt (70k – 120k)
export const SNACK_GOLD_MAINS: FastDishItem[] = [
  {
    id: 'snack-gold-dai-tiec-ga-ran',
    title: 'Mâm Đại Tiệc Gà Rán Sốt Cay Hàn Quốc Phủ Mè (4 Miếng)',
    description: 'Combo 4 miếng gà rán đẫm sốt cay ngọt Yangnyeom chuẩn Seoul, giòn rụm bên ngoài mọng nước bên trong.',
    estimatedCostVnd: 75000,
    calories: 680,
    snackFeature: '🍗 Đại tiệc gà rán đỉnh chóp, cả bàn cùng nhậu nhẹt ăn vặt tưng bừng',
    imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-gold-khay-khoai-mui-cau',
    title: 'Khay Khoai Múi Cau Phô Mai Đút Lò Kèm Xúc Xích Đức',
    description: 'Khoai tây múi cau nướng phô mai béo ngậy kéo sợi, xúc xích nướng tiêu và sốt mù tạt mật ong.',
    estimatedCostVnd: 70000,
    calories: 620,
    snackFeature: '🧀 Đút lò phô mai ngập tràn, thơm lừng cả phòng ban',
    imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-gold-nem-nuong-nha-trang',
    title: 'Set Nem Nướng Nha Trang Cuộn Bánh Tráng Topping Đầy Đủ',
    description: 'Thanh nem nướng thơm nức mũi, bánh tráng chiên giòn rụm, xoài, dưa leo và bát nước chấm tương đậu thịt nạc.',
    estimatedCostVnd: 85000,
    calories: 650,
    snackFeature: '🌯 Cuốn mỏi tay ăn mỏi miệng, hội nhóm văn phòng cùng thưởng thức',
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-gold-tokbokki-lau-ly',
    title: 'Tokbokki Phô Mai Kéo Sợi Lẩu Ly Khổng Lồ Kèm Chả Cá',
    description: 'Bánh gạo dẻo quánh nấu sốt ớt Gochujang cay ngọt, ngập phô mai mozzarella kéo sợi và chả cá Busan.',
    estimatedCostVnd: 68000,
    calories: 590,
    snackFeature: '🌶️ Cay nồng nóng hổi, xua tan mọi áp lực deadline',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
  }
];

export const SNACK_GOLD_SIDES: FastSideItem[] = [
  {
    id: 'snack-gold-side-croffle-dau',
    title: 'Bánh Croffle Kẹp Kem Phô Mai Dâu Tây Tươi',
    estimatedCostVnd: 35000,
    calories: 180,
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'snack-gold-side-tart-trung',
    title: 'Bánh Tart Trứng Bồ Đào Nha Nóng Giòn Tan',
    estimatedCostVnd: 28000,
    calories: 160,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
  }
];

export const SNACK_GOLD_DRINKS: OfficeDrink[] = [
  {
    id: 'snack-gold-drink-tra-sua-nuong',
    title: 'Trà Sữa Nướng Vân Nam Đất Nung Topping 5 Loại',
    estimatedCostVnd: 45000,
    calories: 260,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    officeBuff: '💎 Cực phẩm trà sữa thượng lưu thơm mùi khói gỗ'
  },
  {
    id: 'snack-gold-drink-tra-trai-cay-khung',
    title: 'Trà Trái Cây Nhiệt Đới Size Khủng 1000ml Cỡ Đại',
    estimatedCostVnd: 42000,
    calories: 190,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍹 Bình 1 Lít uống lai rai cả chiều mát lịm tim gan'
  }
];

export const SNACK_GENZ_MAINS: FastDishItem[] = [
  ...SNACK_BLUE_MAINS,
  ...SNACK_PURPLE_MAINS,
  ...SNACK_GOLD_MAINS
];

export const SNACK_GENZ_SIDES: FastSideItem[] = [
  ...SNACK_BLUE_SIDES,
  ...SNACK_PURPLE_SIDES,
  ...SNACK_GOLD_SIDES
];

export const SNACK_GENZ_DRINKS: OfficeDrink[] = [
  ...SNACK_BLUE_DRINKS,
  ...SNACK_PURPLE_DRINKS,
  ...SNACK_GOLD_DRINKS
];

// =========================================================================
// 💀 POOL BIZARRE FOOD DARE (MÓN ĐỘC LẠ GAN DẠ, KÈO PHẠT VĂN PHÒNG) - TIER EXCLUSIVE
// =========================================================================

// Tier Blue: Cấp Độ 6 (Thử Nghiệm Nhẹ)
export const BIZARRE_BLUE_MAINS: FastDishItem[] = [
  {
    id: 'biz-blue-trung-bac-thao',
    title: 'Trứng Bắc Thảo Lòng Đào Đậu Hũ Non Gừng Cay',
    description: 'Trứng bách nhật thế kỷ đen tuyền đậm mùi nồng đặc trưng, ăn kèm đậu hũ trắng ngần và gừng non thái sợi.',
    estimatedCostVnd: 30000,
    calories: 220,
    dareLevel: '🥚 Thử Thách Vị Giác: 6/10',
    darePenalty: 'Kèo khởi động nhẹ nhàng, ai thua phải ăn hết nửa quả!',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-blue-nhong-tam-la-chanh',
    title: 'Nhộng Tằm Rang Lá Chanh Giòn Béo Ngậy',
    description: 'Nhộng tằm vàng óng rang săn cùng nước mắm ngon và lá chanh non thái chỉ, bùi béo thơm ngậy cực lạ.',
    estimatedCostVnd: 35000,
    calories: 280,
    dareLevel: '🐛 Thử Thách Côn Trùng: 6.5/10',
    darePenalty: 'Món ăn đại bổ đạm nhưng không phải ai cũng dám thử!',
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-blue-bun-dau-mam-tom-dac',
    title: 'Bún Đậu Mắm Tôm Nguyên Chất Không Pha Tắc',
    description: 'Mắm tôm Thanh Hóa nguyên chất thơm nồng nàn rưới ớt hiểm tươi, không pha đường không vắt tắc chua.',
    estimatedCostVnd: 35000,
    calories: 390,
    dareLevel: '💥 Nồng Nàn Đậm Vị: 6.8/10',
    darePenalty: 'Ăn xong cấm nói chuyện với đồng nghiệp trong 2 tiếng!',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  }
];

export const BIZARRE_BLUE_SIDES: FastSideItem[] = [
  {
    id: 'biz-blue-side-chanh-muoi',
    title: 'Chanh Tươi Cắt Lát Chấm Muối Hột Ăn Cả Vỏ',
    estimatedCostVnd: 5000,
    calories: 10,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  }
];

export const BIZARRE_BLUE_DRINKS: OfficeDrink[] = [
  {
    id: 'biz-blue-drink-dau-den-khong-duong',
    title: 'Nước Đậu Đen Rang Không Đường Giải Ngấy',
    estimatedCostVnd: 6000,
    calories: 25,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍵 Vị mộc giải nhiệt tức thì, thanh lọc cơ thể'
  }
];

// Tier Purple: Cấp Độ 8 (Cay Đắng Đậm Kèo)
export const BIZARRE_PURPLE_MAINS: FastDishItem[] = [
  {
    id: 'biz-pur-hot-vit-lon-xao-me',
    title: 'Hột Vịt Lộn Xào Me Rau Răm Chua Cay Nồng',
    description: 'Trứng vịt lộn nguyên quả tẩm sốt me sền sệt, đậu phộng rang giòn và nắm rau răm nồng ấm cay tê.',
    estimatedCostVnd: 36000,
    calories: 290,
    dareLevel: '💀 Cấp Độ Gan Dạ: 7.8/10',
    darePenalty: 'Ai không dám ăn bị phạt 50k vào quỹ trà sữa phòng!',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-pur-chan-ga-sot-thai-cap7',
    title: 'Chân Gà Rút Xương Sốt Thái Cay Cấp Độ 7',
    description: 'Chân gà rút xương giòn sần sật ngập trong sốt Thái chua cay nồng nặc ớt hiểm băm nhuyễn, chảy nước mắt sau 1 miếng.',
    estimatedCostVnd: 45000,
    calories: 310,
    dareLevel: '🔥 Cay Xé Lưỡi: 8.5/10',
    darePenalty: 'Kèo phạt cho người thua ván bi lắc / bóng bàn trưa nay!',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-pur-mat-ca-ngu-phu-yen',
    title: 'Mắt Cá Ngừ Đại Dương Tiềm Thuốc Bắc Phú Yên',
    description: 'Mắt cá ngừ đại dương to bằng nắm tay tiềm kỷ tử, táo tàu, gừng tươi và các vị thảo mộc bổ mắt tăng lực.',
    estimatedCostVnd: 55000,
    calories: 380,
    dareLevel: '🐟 Thử Thách Đại Dương: 8.2/10',
    darePenalty: 'Món đại bổ mắt cho coder cày đêm nhìn màn hình!',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-pur-nom-bo-kho-la-lach',
    title: 'Nộm Bò Khô Lá Lách Heo Nướng Sa Tế Siêu Cay',
    description: 'Lá lách heo tẩm sa tế ớt hiểm nướng cháy sém, trộn đu đủ xanh bào sợi và giấm tỏi cay tê tái.',
    estimatedCostVnd: 42000,
    calories: 360,
    dareLevel: '🌶️ Thử Thách Siêu Cay: 8/10',
    darePenalty: 'Thua kèo thì phải ăn trọn miếng lá lách chấm ớt!',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
  }
];

export const BIZARRE_PURPLE_SIDES: FastSideItem[] = [
  {
    id: 'biz-pur-side-ot-xiem-xanh',
    title: 'Đĩa Ớt Xiêm Xanh Rừng Ngâm Giấm Tỏi Cay Xé',
    estimatedCostVnd: 6000,
    calories: 15,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  }
];

export const BIZARRE_PURPLE_DRINKS: OfficeDrink[] = [
  {
    id: 'biz-pur-drink-tra-kho-qua-rung',
    title: 'Trà Khổ Qua Rừng Nước Cốt Đậm Đặc Hạ Hỏa',
    estimatedCostVnd: 18000,
    calories: 20,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🍵 Thuốc đắng dã tật, đánh thức mọi giác quan sau 1 ngụm'
  }
];

// Tier Gold: CỰC HẠN 10 (Liều Mạng Thách Đố)
export const BIZARRE_GOLD_MAINS: FastDishItem[] = [
  {
    id: 'biz-gold-duong-dua-tam-mam',
    title: 'Đuông Dừa Béo Múp Tắm Nước Mắm Ớt Cay Xè',
    description: 'Đuông dừa ngập trong bát nước mắm nhĩ ớt hiểm cay nồng, cắn vào béo ngậy nổ tung trong khoang miệng.',
    estimatedCostVnd: 65000,
    calories: 320,
    dareLevel: '💀 CỰC HẠN GAN DẠ: 10/10',
    darePenalty: 'Ai dám nuốt trọn được cả phòng phong làm Đại Ca!',
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-gold-nam-pia-tay-bac',
    title: 'Nậm Pịa Tây Bắc Đắng Cay Gia Truyền Chuẩn Vị',
    description: 'Món ăn đặc sản vùng cao Tây Bắc đượm mùi mắc khén hạt dổi, vị đắng dịu ở đầu lưỡi rồi ngọt hậu nơi cuống họng.',
    estimatedCostVnd: 78000,
    calories: 350,
    dareLevel: '💀 ĐỘC BẢN VÙNG CAO: 9.8/10',
    darePenalty: 'Ai ăn hết đĩa được miễn rửa chén và dọn văn phòng cả tuần!',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-gold-sau-rieng-nuong-muoi-ot',
    title: 'Sầu Riêng Nướng Than Hoa Quệt Muối Ớt Cay & Phô Mai',
    description: 'Múi sầu riêng nướng cháy sém mặt thơm nồng nàn, quệt muối ớt cay và phủ phô mai mặn mòi tan chảy.',
    estimatedCostVnd: 70000,
    calories: 460,
    dareLevel: '⚡ Đột Phá Vị Giác: 9.5/10',
    darePenalty: 'Kèo thử thách độc quyền dành riêng cho tín đồ sầu riêng!',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'biz-gold-sau-tre-chien-mac-khen',
    title: 'Sâu Tre Chiên Giòn Cay Nồng Hạt Mắc Khén Tây Bắc',
    description: 'Sâu tre rừng xào giòn tan với lá chanh, hạt mắc khén thơm lừng cay cay thơm ngậy như bơ.',
    estimatedCostVnd: 75000,
    calories: 390,
    dareLevel: '🐛 ĐỘC LẠ TÂY BẮC: 10/10',
    darePenalty: 'Thua kèo bắt buộc phải ăn ít nhất 3 con sâu tre giòn rụm!',
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80'
  }
];

export const BIZARRE_GOLD_SIDES: FastSideItem[] = [
  {
    id: 'biz-gold-side-kho-qua-uop-da',
    title: 'Mướp Đắng Ướp Đá Lạnh Chấm Ruốc Nồng',
    estimatedCostVnd: 10000,
    calories: 30,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
  }
];

export const BIZARRE_GOLD_DRINKS: OfficeDrink[] = [
  {
    id: 'biz-gold-drink-rau-ma-dang',
    title: 'Nước Rau Má Đắng Nguyên Chất Không Đường',
    estimatedCostVnd: 15000,
    calories: 35,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    officeBuff: '🌿 Đắng ngắt mát ruột, giải sạch nghiệp deadline'
  }
];

export const BIZARRE_MAINS: FastDishItem[] = [
  ...BIZARRE_BLUE_MAINS,
  ...BIZARRE_PURPLE_MAINS,
  ...BIZARRE_GOLD_MAINS
];

export const BIZARRE_SIDES: FastSideItem[] = [
  ...BIZARRE_BLUE_SIDES,
  ...BIZARRE_PURPLE_SIDES,
  ...BIZARRE_GOLD_SIDES
];

export const BIZARRE_DRINKS: OfficeDrink[] = [
  ...BIZARRE_BLUE_DRINKS,
  ...BIZARRE_PURPLE_DRINKS,
  ...BIZARRE_GOLD_DRINKS
];

export const BIZARRE_DARE_GOLDEN_PUNCHLINES = [
  'Ăn 1 thìa đầy mà không nhăn mặt sẽ được phong Vua Gan Dạ Văn Phòng!',
  'Dám ăn hết một miếng hoặc chịu phạt bao trà sữa cả team chiều nay!',
  'Ai nhăn mặt trước sẽ phải rửa toàn bộ cốc chén của phòng cả tuần!',
  'Kèo thua bi lắc / bóng bàn trưa nay: Thua là phải ăn trọn miếng không uống nước!',
  'Không dám thử? Tự giác nộp 50k vào quỹ liên hoan của phòng!',
  'Thử thách dũng cảm: Ăn xong cấm nhấp ngụm nước nào trong vòng 3 phút!',
  'Ai nuốt trọn được cả phòng tôn làm Đại Ca Gan Dạ nhất công ty!',
  'Ăn xong giữ nguyên biểu cảm tự tin chụp 1 tấm ảnh đăng lên Story công ty!',
  'Thua kèo trễ deadline trưa nay: Phạt ngay một miếng đẫm vị bùng nổ!',
  'Dám nuốt trọn miếng này, cả team cam kết không dí task bạn trong 1 ngày!',
  'Người ăn hết đĩa được đặc cách miễn trực nhật và dọn pantry tháng này!',
  'Kèo cá cược đỉnh cao: Thách thức giới hạn chịu đựng của vị giác cả phòng!',
  'Ăn 1 miếng mà mắt không rơi lệ được nhận 1 tràng pháo tay sấm truyền!',
  'Ai từ chối thử thách phải gọi sếp là "Đại Ca" suốt cả buổi chiều!',
  'Thử một lần để đời, lưu danh bảng vàng can trường bất tử của công ty!',
  'Ai ăn trọn miếng này được đặc quyền chọn quán ăn trưa cho cả team tuần tới!',
  'Kèo thách đấu tay đôi: Ai bỏ cuộc trước phải order bánh tráng cho cả phòng!',
  'Dám ăn miếng này, phòng IT hứa hỗ trợ fix bug trọn đời cho bạn!',
  'Thách thức cấp độ cao: Nuốt xong mỉm cười 10 giây trước camera điện thoại!',
  'Người chiến thắng thử thách sẽ được vinh danh trang trọng trên Slack/Zalo công ty!',
  'Ai không dám ăn phải hát chay một bài bolero trước toàn thể anh chị em!',
  'Dám nuốt mà không kêu gào sẽ được trao danh hiệu "Bao Tử Thép Của Năm"!',
  'Kèo phạt ai đi họp muộn sáng nay: Ăn ngay 1 miếng không được từ chối!',
  'Nuốt trôi miếng này, bạn chính là huyền thoại sống của văn phòng chúng ta!'
];

export const EXPRESS_GOLDEN_PUNCHLINES = [
  'Ăn gọn 10-15 phút, chợp mắt trưa 30 phút sạc lại 100% pin cày chiều!',
  'Món gọn nhẹ không mùi nồng, ăn tại bàn làm việc cực kỳ lịch sự!',
  'Bật chế độ ăn nhanh chớp nhoáng, kịp giờ trùm chăn ngủ trưa sướng rơn!',
  'Đơn giản, no lâu, không lo đầy bụng buồn ngủ gật gù trong cuộc họp 2h chiều!',
  '15 phút xử lý xong bữa trưa, dành trọn 45 phút nghỉ ngơi nạp lại năng lượng!',
  'Cứu tinh ngày ngập deadline, ăn vèo một cái là xong không cần đắn đo!',
  'No bụng êm ái, tối ưu thời gian nghỉ trưa để tinh thần luôn sảng khoái!',
  'Món ruột của dân văn phòng: Nhanh - Gọn - Chuẩn vị - Tiết kiệm thời gian!',
  'Ăn nhanh nghỉ sớm, chiều nay tỉnh táo gánh team không sợ bug dí!',
  'Tiết kiệm 30 phút chờ đợi, trưa ngủ một giấc chiều làm việc gấp đôi năng suất!',
  'Bữa trưa thông minh: Ăn nhẹ bụng, đầu óc minh mẫn, không lo sập nguồn!',
  'Giải pháp tối ưu cho ngày bận rộn: Vừa kịp ăn ngon, vừa kịp chợp mắt!',
  'Chỉ 1 bát/hộp duy nhất, dọn dẹp trong 10 giây, sạch sẽ tinh tươm!',
  'Ăn nhanh như chớp, ngủ trưa như mơ, chiều chạy task nhẹ như bay!',
  'Bỏ qua khâu phân vân "Trưa nay ăn gì", chốt đơn nhanh gọn ngủ trưa thôi!',
  'Nạp năng lượng tức thì trong 12 phút, sẵn sàng cho buổi chiều bùng nổ!',
  'Bữa trưa cấp tốc chuẩn công sở: Nhanh chóng, tiện lợi, đủ chất!',
  'Ăn xong thong thả pha ly cà phê, lướt điện thoại 15 phút rồi ngủ trưa!',
  'Đánh nhanh rút gọn bữa trưa, dành thời gian thư giãn mắt và cột sống!',
  '1 phần ăn duy nhất giải quyết cơn đói, không bày biện, không lỉnh kỉnh!',
  'Trưa chợp mắt 30p bằng cả đêm ngủ say, chiều tỉnh táo bứt phá mọi KPI!',
  'Ăn vội mà vẫn ngon miệng, tối ưu từng phút nghỉ ngơi quý giá!'
];

export const SNACK_GOLDEN_PUNCHLINES = [
  'Bốc tay tiện lợi một tay gõ phím, một tay nhâm nhi cả buổi chiều chill chill!',
  'Món chiên giòn rụm để nguội cả tiếng đồng hồ ăn vẫn giòn tan đậm vị!',
  'Cứu đói 3 giờ chiều, nhâm nhi cùng đồng nghiệp xua tan cơn buồn ngủ!',
  'Đồ ăn vặt chuẩn gu Gen Z: Vừa lướt TikTok vừa nhai rôm rốp cực cuốn!',
  'Khô ráo sạch sẽ không dính dầu mỡ bàn phím, ăn lai rai hết cả buổi làm việc!',
  'Kèo order xế chiều cùng hội chị em, chia nhau ăn là vui hết nấc!',
  'Đậm đà thơm nức mũi, để trên bàn làm việc ai đi qua cũng phải xin một miếng!',
  'Bổ sung "vitamin vui vẻ" cho não bộ giải quyết deadline căng thẳng!',
  'Lai rai từng miếng giòn tan, nhai rôm rốp át luôn tiếng thở dài deadline!',
  'Món ăn vặt quốc dân: Ăn một miếng là không thể dừng tay lại được!',
  'Đỉnh cao cứu đói ca chiều, nạp năng lượng tức thì không lo nặng bụng!',
  'Món ngon để nguội không ỉu, cày phim cày việc đều hợp gu!',
  'Vừa ăn vừa chém gió xuyên phòng ban, gắn kết tình đồng nghiệp keo sơn!',
  'Giòn rụm bên ngoài, đậm đà bên trong, chấm sốt béo ngậy ăn là mê!',
  'Combo ăn vặt đánh bay uể oải 15h, sạc đầy mood sáng tạo cho cả team!',
  'Nhâm nhi lai rai không chiếm chỗ bàn làm việc, gọn gàng và trendy!',
  'Hương vị bùng nổ vị giác, thơm lừng góc văn phòng khiến ai cũng thèm!',
  'Món ăn chống tụt mood giờ tăng ca, nhai vui miệng tinh thần phơi phới!',
  'Bốc lẹ nhai liền, hương vị mê ly chuẩn chỉnh từng miếng một!',
  'Thần dược xóa tan áp lực công việc, ăn vặt một chút là yêu đời ngay!',
  'Đồ ăn vặt văn phòng: Ít dơ tay, ngon lâu, càng ăn càng ghiền!',
  'Giòn tan từng hạt, đậm đà từng miếng, xế chiều bừng tỉnh sảng khoái!'
];

export const COMBO_GOLDEN_PUNCHLINES = [
  'Chuẩn cơm mẹ nấu 3 món cân bằng: Đủ thịt đạm, đủ canh mát, đủ rau xanh!',
  'Bữa trưa dinh dưỡng đủ chất, ăn chắc dạ không lo đói cồn cào lúc 4h chiều!',
  'Đầy đặn thơm ngon chuẩn vị cơm nhà, tiếp thêm năng lượng gánh team buổi chiều!',
  'Cơm dẻo canh ngọt rau xanh mướt, ăn trưa chuẩn chỉnh cho ngày làm việc năng suất!',
  'Mâm cơm tròn vị 3 miền, cân bằng dinh dưỡng giúp duy trì vóc dáng và sức khỏe!',
  'Đậm đà hương vị gia đình giữa chốn công sở, xua tan cảm giác nhớ nhà!',
  '1 món mặn đậm đà + 1 tô canh thanh mát + 1 đĩa rau xào giòn ngọt hoàn hảo!',
  'Nạp đủ protein và chất xơ, không lo thiếu chất hay đầy bụng khó tiêu!',
  'Bữa trưa thịnh soạn tiếp lửa đam mê, tinh thần tỉnh táo bứt phá mọi KPI!',
  'Ăn no nê ngon miệng, chuẩn bị cho những bước chạy nước rút cuối ngày!',
  'Cơm nóng canh ngọt, ăn một bữa trưa đàng hoàng yêu thương bản thân!',
  'Mâm cơm 3 món chuẩn chỉ: Đạm bồi bổ cơ bắp, rau mát gan thanh nhiệt!',
  'Hương vị thơm nức góc phòng, bữa trưa đầm ấm quây quần cùng đồng nghiệp!',
  'Cân đối calo hoàn hảo, vừa no lâu vừa không lo tăng cân mất kiểm soát!',
  'Món mặn đưa cơm, canh chan ngọt lịm, bữa trưa điểm 10 cho sức khỏe!',
  'Tránh xa đồ ăn nhanh tạm bợ, tận hưởng mâm cơm chuẩn chỉnh chất lượng cao!',
  'Bữa ăn trọn vẹn cả lượng lẫn chất, nạp đầy pin cho bộ não sáng tạo!',
  'Sự kết hợp hoàn mỹ giữa truyền thống và tiện lợi cho bữa trưa công sở!',
  'Cơm canh tươm tất, ăn xong tràn đầy sinh lực sẵn sàng đối đầu mọi thử thách!',
  'Bữa trưa điểm tựa vững chắc, tiếp sức cho ngày dài cống hiến hết mình!',
  'Đủ dưỡng chất, chuẩn vệ sinh, bữa cơm trưa tiếp năng lượng cho ngày dài!',
  'Ăn cơm đúng giờ đủ món, bí quyết giữ phong độ làm việc đỉnh cao!'
];

const OFFICE_PUNCHLINES = COMBO_GOLDEN_PUNCHLINES;

/**
 * Generate an Apex Loot Drop based on selected Tier and Preference Mode
 * 100% ZERO DUPLICATION: Drawn exclusively from the 800+ exclusive case database without repeats!
 */
export const generateApexLootDrop = (
  tier: ApexCaseTier = 'purple',
  mode: FastMealPreferenceMode = 'combo'
): ApexLootDrop => {
  const modeConfig = PREFERENCE_MODES[mode];
  const tierConfig = APEX_TIERS[tier];

  // Pick non-duplicate main dish from the 800+ exclusive database for this account
  const { dish: main, isNew, unlockedCount, totalCount, prestigeCycle } = pickNonDuplicateDish(mode, tier);

  // 1. EXPRESS 1-DISH MODE (ĂN NHANH ĐỂ KỊP NGỦ TRƯA - TIER EXCLUSIVE)
  if (mode === 'express-1dish') {
    const speed = main.speedMinutes || 12;
    const nap = EXPRESS_GOLDEN_PUNCHLINES[Math.floor(Math.random() * EXPRESS_GOLDEN_PUNCHLINES.length)];

    return {
      id: `apex-drop-${mode}-${tier}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tier,
      tierName: tierConfig.name,
      mode,
      modeName: modeConfig.name,
      totalCostVnd: main.estimatedCostVnd,
      totalCalories: main.calories,
      mainDish: main,
      speedMinutes: speed,
      napBuff: nap,
      quoteOffice: `⚡ ${nap}`,
      isNewUnlock: isNew,
      unlockedCount,
      totalPoolCount: totalCount,
      prestigeCycle
    };
  }

  // 2. SNACK GEN Z MODE (ĂN VẶT LAI RAI, ĐỂ LÂU ĂN NGUỘI VẪN NGON - TIER EXCLUSIVE)
  if (mode === 'snack-genz') {
    const sides = tier === 'gold' 
      ? SNACK_GOLD_SIDES 
      : tier === 'purple' 
      ? SNACK_PURPLE_SIDES 
      : SNACK_BLUE_SIDES;

    const drinks = tier === 'gold' 
      ? SNACK_GOLD_DRINKS 
      : tier === 'purple' 
      ? SNACK_PURPLE_DRINKS 
      : SNACK_BLUE_DRINKS;

    const side = sides[Math.floor(Math.random() * sides.length)];
    const drink = drinks[Math.floor(Math.random() * drinks.length)];
    const snackFeature = SNACK_GOLDEN_PUNCHLINES[Math.floor(Math.random() * SNACK_GOLDEN_PUNCHLINES.length)];

    return {
      id: `apex-drop-${mode}-${tier}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tier,
      tierName: tierConfig.name,
      mode,
      modeName: modeConfig.name,
      totalCostVnd: main.estimatedCostVnd + side.estimatedCostVnd + drink.estimatedCostVnd,
      totalCalories: main.calories + side.calories + drink.calories,
      mainDish: main,
      sideDish: side,
      officeDrink: drink,
      snackFeature,
      quoteOffice: `🍟 ${snackFeature}`,
      isNewUnlock: isNew,
      unlockedCount,
      totalPoolCount: totalCount,
      prestigeCycle
    };
  }

  // 3. BIZARRE DARE MODE (MÓN ĐỘC LẠ GAN DẠ, KÈO PHẠT VĂN PHÒNG - TIER EXCLUSIVE)
  if (mode === 'bizarre-dare') {
    const sides = tier === 'gold' 
      ? BIZARRE_GOLD_SIDES 
      : tier === 'purple' 
      ? BIZARRE_PURPLE_SIDES 
      : BIZARRE_BLUE_SIDES;

    const drinks = tier === 'gold' 
      ? BIZARRE_GOLD_DRINKS 
      : tier === 'purple' 
      ? BIZARRE_PURPLE_DRINKS 
      : BIZARRE_BLUE_DRINKS;

    const side = sides[Math.floor(Math.random() * sides.length)];
    const drink = drinks[Math.floor(Math.random() * drinks.length)];
    const darePenalty = BIZARRE_DARE_GOLDEN_PUNCHLINES[Math.floor(Math.random() * BIZARRE_DARE_GOLDEN_PUNCHLINES.length)];

    return {
      id: `apex-drop-${mode}-${tier}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tier,
      tierName: tierConfig.name,
      mode,
      modeName: modeConfig.name,
      totalCostVnd: main.estimatedCostVnd + side.estimatedCostVnd + drink.estimatedCostVnd,
      totalCalories: main.calories + side.calories + drink.calories,
      mainDish: main,
      sideDish: side,
      officeDrink: drink,
      dareLevel: main.dareLevel || (tier === 'gold' ? 'CỰC HẠN 10: HUYỀN THOẠI GAN DẠ' : tier === 'purple' ? 'Cấp 8: Cay Đắng Tột Cùng' : 'Cấp 6: Thử Nghiệm'),
      darePenalty,
      quoteOffice: `💀 KÈO THÁCH ĐỐ: ${darePenalty}`,
      isNewUnlock: isNew,
      unlockedCount,
      totalPoolCount: totalCount,
      prestigeCycle
    };
  }

  // 4. STANDARD 3-COURSE COMBO MODE (BLUE / PURPLE / GOLD - TIER EXCLUSIVE)
  let sides = BLUE_SIDES;
  let drinks = BLUE_DRINKS;

  if (tier === 'purple') {
    sides = PURPLE_SIDES;
    drinks = PURPLE_DRINKS;
  } else if (tier === 'gold') {
    sides = GOLD_SIDES;
    drinks = GOLD_DRINKS;
  }

  const side = sides[Math.floor(Math.random() * sides.length)];
  const drink = drinks[Math.floor(Math.random() * drinks.length)];

  const totalCostVnd = main.estimatedCostVnd + side.estimatedCostVnd + drink.estimatedCostVnd;
  const totalCalories = main.calories + side.calories + drink.calories;
  const quoteOffice = COMBO_GOLDEN_PUNCHLINES[Math.floor(Math.random() * COMBO_GOLDEN_PUNCHLINES.length)];

  return {
    id: `apex-drop-${tier}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tier,
    tierName: tierConfig.name,
    mode: 'combo',
    modeName: modeConfig.name,
    totalCostVnd,
    totalCalories,
    mainDish: main,
    sideDish: side,
    officeDrink: drink,
    quoteOffice,
    isNewUnlock: isNew,
    unlockedCount,
    totalPoolCount: totalCount,
    prestigeCycle
  };
};

/**
 * Format a fun Zalo invitation message customized for each Preference Mode
 */
export const formatZaloOfficeInvite = (drop: ApexLootDrop): string => {
  // 1. EXPRESS 1-DISH
  if (drop.mode === 'express-1dish') {
    return [
      `⚡ KÈO ĂN NHANH ĐỂ KỊP NGỦ TRƯA — MEALWISE EXPRESS 💤`,
      `Trưa nay chốt đơn ăn gọn siêu tốc:`,
      `👉 Món ăn: ${drop.mainDish.title}`,
      `⏱️ Thời gian ăn: Chỉ ${drop.speedMinutes || 12} phút sau khi nhận món!`,
      `💤 Lợi ích: ${drop.napBuff || 'Dành trọn 30 phút ngủ trưa sạc năng lượng'}`,
      `💵 Chi phí: ~${drop.totalCostVnd.toLocaleString('vi-VN')} đ | 🔥 Calo: ~${drop.totalCalories} kcal`,
      `💬 "${drop.quoteOffice}"`,
      `👉 Anh em ai muốn ăn nhanh ngủ trưa thì chốt đơn trước 11h30 nhé! ⚡`
    ].join('\n');
  }

  // 2. SNACK GEN Z
  if (drop.mode === 'snack-genz') {
    return [
      `🍟 KÈO ĂN VẶT GEN Z — LAI RAI CHẠY DEADLINE 🧋`,
      `Trưa/Chiều nay quay trúng combo ăn vặt cực dính:`,
      `👉 Món chiên vặt: ${drop.mainDish.title}`,
      drop.sideDish ? `👉 Món nhắm kèm: ${drop.sideDish.title}` : '',
      drop.officeDrink ? `👉 Nước uống: ${drop.officeDrink.title} (${drop.officeDrink.officeBuff})` : '',
      `💡 Đặc điểm: ${drop.snackFeature || 'Để lâu trên bàn ăn nguội vẫn ngon giòn!'}`,
      `💵 Chi phí: ~${drop.totalCostVnd.toLocaleString('vi-VN')} đ | 🔥 Calo: ~${drop.totalCalories} kcal`,
      `👉 Anh em ai nhập hội bốc tay ăn vặt thì ké đơn trước 14h nha! 🍗`
    ].filter(Boolean).join('\n');
  }

  // 3. BIZARRE DARE
  if (drop.mode === 'bizarre-dare') {
    return [
      `💀 KÈO THÁCH ĐỐ ĂN MÓN ĐỘC LẠ — AI THUA BAO! 💥`,
      `Vừa mở hòm trúng món thử thách gan dạ:`,
      `👉 Món thách đố: ${drop.mainDish.title}`,
      `⚠️ ${drop.dareLevel || 'Cấp độ gan dạ: CỰC HẠN 10/10'}`,
      drop.sideDish ? `👉 Gia vị kèm: ${drop.sideDish.title}` : '',
      drop.officeDrink ? `👉 Nước giải độc: ${drop.officeDrink.title}` : '',
      `⚖️ Hình phạt: "${drop.darePenalty || 'Ai thua kèo ăn trưa phải ăn món này!'}"`,
      `👉 Dám chơi dám chịu, trưa nay ai vào kèo cá cược không? 😈🔥`
    ].filter(Boolean).join('\n');
  }

  // 4. COMBO 3 MÓN CHUẨN
  const tierEmoji = drop.tier === 'gold' ? '👑' : drop.tier === 'purple' ? '💜' : '💙';
  return [
    `🍱 KÈO ĂN TRƯA VĂN PHÒNG — MỞ HÒM BỮA CƠM ${tierEmoji}`,
    `Hôm nay quay trúng combo [${drop.tierName.toUpperCase()}]:`,
    `👉 Món chính: ${drop.mainDish.title}`,
    drop.sideDish ? `👉 Món kèm: ${drop.sideDish.title}` : '',
    drop.officeDrink ? `👉 Nước uống: ${drop.officeDrink.title} (${drop.officeDrink.officeBuff})` : '',
    `💵 Chi phí: ~${drop.totalCostVnd.toLocaleString('vi-VN')} đ | 🔥 Calo: ~${drop.totalCalories} kcal`,
    `💬 "${drop.quoteOffice}"`,
    `👉 Anh em ai order chung chốt đơn trước 11h30 nha! 🔥`
  ].filter(Boolean).join('\n');
};
