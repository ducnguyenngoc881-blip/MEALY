/**
 * Challenger Iteration 2 Deep Adversarial Verification Suite
 * Stress-testing edge cases, semantic isolation, DB purity, and robustness.
 */

import {
  getDishImageUrl,
  resolveCulinaryCluster,
  normalizeVietnameseDish,
  isDeadOrPlaceholderUrl,
  OVERUSED_PLACEHOLDER_IDS,
  FOOD_IMAGE_POOLS
} from '../src/utils/dishImageResolver';

import { mockRecipes } from '../src/data/mockRecipes';
import { recipesDatabase } from '../src/data/recipesDatabase';
import { westernDishes500 } from '../src/data/westernDishes500';

let passedChecks = 0;
let totalChecks = 0;

function check(desc: string, condition: boolean, detail?: any) {
  totalChecks++;
  if (!condition) {
    console.error(`[FAIL] ${desc}`, detail || '');
    throw new Error(`Assertion failed: ${desc}`);
  } else {
    passedChecks++;
  }
}

console.log('--- CHALLENGER ITERATION 2 DEEP ADVERSARIAL STRESS ---');

// 1. Mandatory Dispatch Invariants
console.log('\n[Section 1: Mandatory Dispatch Invariants]');

// 1.1 Caprese salads with cheese and butter do NOT resolve to pho_bo
const capreseVariants = [
  'Salad Cà Chua Phô Mai Caprese',
  'Salad Cà Chua Phô Mai Caprese (Bơ Lạt Anchor Thơm Lừng)',
  'Salad Bơ Trái Cây Hạt Dinh Dưỡng (Sốt Phô Mai Béo Ngậy)',
  'Salad Bơ Trái Cây Hạt Dinh Dưỡng (Phô Mai Bột Parmesan)',
  'Salad phô mai bơ tỏi tươi sốt kem chanh dây',
  'Caprese Salad tươi với phô mai Mozzarella và sốt bơ lạt',
];
for (const title of capreseVariants) {
  const cluster = resolveCulinaryCluster(title, 'mon-rau');
  check(`Caprese variant "${title}" must NOT resolve to pho_bo`, cluster !== 'pho_bo', { title, cluster });
  check(`Caprese variant "${title}" should resolve to salad_tay_caesar`, cluster === 'salad_tay_caesar', { title, cluster });
}

// 1.2 Bánh Mì skillet does NOT resolve to hotdogs_sausage
const banhMiChaoVariants = [
  'Bánh Mì Chảo Trứng Pate Xúc Xích',
  'Bánh mì chảo bò lúc lắc trứng ốp la',
  'Bánh mì chảo sốt cà xíu mại xúc xích Đức',
  'Bánh Mì Chảo Thập Cẩm Pate Bơ Tỏi'
];
for (const title of banhMiChaoVariants) {
  const cluster = resolveCulinaryCluster(title, 'an-sang');
  check(`Bánh Mì chảo variant "${title}" must NOT resolve to hotdogs_sausage`, cluster !== 'hotdogs_sausage', { title, cluster });
  check(`Bánh Mì chảo variant "${title}" must resolve to authentic breakfast/bread cluster`, ['banh_mi', 'trung_chien_op_la', 'steak_beef', 'ha_cao_dimsum'].includes(cluster), { title, cluster });
}
const specificBanhMi = resolveCulinaryCluster('Bánh Mì Chảo Trứng Pate Xúc Xích', 'an-sang');
check('Bánh Mì Chảo Trứng Pate Xúc Xích resolves specifically to banh_mi', specificBanhMi === 'banh_mi', { specificBanhMi });

// 1.3 Fish & Chips does NOT resolve to ca_kho_to
const fishAndChipsVariants = [
  'Hải Sản Kiểu Âu: Cá Hồi Nauy Chiên Giòn Fish & Chips Kèm Sốt Tartar',
  'Hải Sản Kiểu Âu: Cá Tuyết / Basa Phi Lê Chiên Giòn Fish & Chips Kèm Sốt Tartar',
  'Fish and Chips sốt Tartar kiểu Anh',
  'Fish & Chips cá phi lê giòn rụm',
  'Cá Hồi Nauy áp chảo sốt bơ chanh',
  'Cá Hồi Nướng Măng Tây'
];
for (const title of fishAndChipsVariants) {
  const cluster = resolveCulinaryCluster(title, 'mon-man');
  check(`Western fish variant "${title}" must NOT resolve to ca_kho_to`, cluster !== 'ca_kho_to', { title, cluster });
  check(`Western fish variant "${title}" should resolve to seafood_western`, cluster === 'seafood_western', { title, cluster });
}

// 1.4 Schnitzel does NOT resolve to thit_kho_tau
const schnitzelVariants = [
  'Thịt Heo Kiểu Âu: Sườn Cây Heo Chiên Xù Kiểu Áo Viennese Schnitzel',
  'Thịt Heo Kiểu Âu: Thịt Cốt Lết Xé Sợi Pulled Pork Sốt Khói',
  'Viennese Schnitzel chiên xù',
  'Pork Schnitzel sốt kem nấm',
  'Pulled Pork Burger nướng than'
];
for (const title of schnitzelVariants) {
  const cluster = resolveCulinaryCluster(title, 'mon-man');
  check(`Western pork variant "${title}" must NOT resolve to thit_kho_tau`, cluster !== 'thit_kho_tau', { title, cluster });
}

// 1.5 Cà Pháo matches rau_cu_luoc_kho_quet
const caPhaoVariants = [
  'Cà Pháo Muối Chua Cay Giòn',
  'Cà pháo mắm tôm chua giòn',
  'Cà pháo chấm mắm nêm',
  'Rau luộc thập cẩm kèm cà pháo'
];
for (const title of caPhaoVariants) {
  const cluster = resolveCulinaryCluster(title, 'mon-rau');
  check(`Cà pháo variant "${title}" must resolve to rau_cu_luoc_kho_quet or veg cluster`,
    cluster === 'rau_cu_luoc_kho_quet' || cluster === 'rau_xao_thap_cam' || cluster === 'mam_tom_mam_nem',
    { title, cluster }
  );
  check(`Cà pháo variant "${title}" must NEVER resolve to ca_kho_to`, cluster !== 'ca_kho_to', { title, cluster });
}
const specificCaPhao = resolveCulinaryCluster('Cà Pháo Muối Chua Cay Giòn', 'mon-rau');
check('Cà Pháo Muối Chua Cay Giòn specifically matches rau_cu_luoc_kho_quet', specificCaPhao === 'rau_cu_luoc_kho_quet', { specificCaPhao });

// 2. Savory Cream Dishes vs Dessert Ice Cream Disambiguation
console.log('\n[Section 2: Savory Cream Sauces vs Dessert Ice Cream]');
const savoryCreamDishes = [
  { title: 'Bò Bít Tết Sốt Kem Nấm Truffle', cat: 'mon-chinh', expectedNot: 'kem_gelato_yogurt' },
  { title: 'Mì Ý Hải Sản Sốt Kem Béo Alfredo', cat: 'mon-chinh', expectedNot: 'kem_gelato_yogurt' },
  { title: 'Súp Kem Bí Đỏ Nướng Bơ', cat: 'mon-canh', expectedNot: 'kem_gelato_yogurt' },
  { title: 'Gà Áp Chảo Sốt Kem Tỏi Bơ', cat: 'mon-chinh', expectedNot: 'kem_gelato_yogurt' },
  { title: 'Thịt Heo Đút Lò Sốt Kem Chua Dijon', cat: 'mon-chinh', expectedNot: 'kem_gelato_yogurt' },
  { title: 'Salmon Steak Sốt Kem Thì Là', cat: 'mon-chinh', expectedNot: 'kem_gelato_yogurt' },
];
for (const item of savoryCreamDishes) {
  const cluster = resolveCulinaryCluster(item.title, item.cat);
  const url = getDishImageUrl(item.title, item.cat);
  check(`Savory cream "${item.title}" must NOT resolve to kem_gelato_yogurt`, cluster !== item.expectedNot, { cluster });
  check(`Savory cream "${item.title}" image must not be from kem_gelato_yogurt pool`, !FOOD_IMAGE_POOLS.kem_gelato_yogurt.includes(url));
}

// 3. Database Catalog Integrity & Purity Checks
console.log('\n[Section 3: Database Catalog Integrity Checks]');

// 3.1 mockRecipes ID uniqueness
const seenIds = new Set<string>();
const duplicateIds: string[] = [];
for (const r of mockRecipes) {
  if (seenIds.has(r.id)) {
    duplicateIds.push(r.id);
  }
  seenIds.add(r.id);
}
check(`All 1,245 mockRecipes IDs must be unique (duplicates found: ${duplicateIds.join(', ')})`, duplicateIds.length === 0, duplicateIds);
check(`Total mockRecipes count is 1,245`, mockRecipes.length === 1245, { count: mockRecipes.length });

// 3.2 Anti-Burger Check on non-burger recipes in mockRecipes
const burgerPhotoId = 'photo-1586190848861-99aa4a171e90';
const badBurgers = mockRecipes.filter(r => {
  const isBurger = r.title.toLowerCase().includes('burger') || r.category === 'an-nhanh';
  return !isBurger && r.imageUrl && r.imageUrl.includes(burgerPhotoId);
});
check(`Zero non-burger recipes in mockRecipes have burger photo`, badBurgers.length === 0, badBurgers.map(b => ({ id: b.id, title: b.title })));

// 3.3 Anti-Ice Cream Check on savory recipes in westernDishes500
const iceCreamPhotos = ['photo-1501443762994-82bd5dace89a', 'photo-1563805042-7684c019e1cb', 'photo-1579372786545-d24232daf58c'];
const badIceCreamWestern = westernDishes500.filter(d => {
  const isDessert = d.category === 'trang-mieng' || d.category === 'an-vat';
  return !isDessert && d.imageUrl && iceCreamPhotos.some(photoId => d.imageUrl.includes(photoId));
});
check(`Zero savory recipes in westernDishes500 have ice cream photo`, badIceCreamWestern.length === 0, badIceCreamWestern.map(b => ({ id: b.id, title: b.title })));

// 3.4 Dead 404 URL absence in westernDishes500
const dead404Id = 'photo-1621996346565-e3d5d6281292';
const dead404Western = westernDishes500.filter(d => d.imageUrl && d.imageUrl.includes(dead404Id));
check(`Zero dishes in westernDishes500 contain dead 404 photo-1621996346565-e3d5d6281292`, dead404Western.length === 0, dead404Western);

// 4. Random / Adversarial Fuzzing Stress
console.log('\n[Section 4: 1,000-Iteration Adversarial Fuzzing]');
const prefixes = ['', 'Món ngon: ', 'Đặc sản miền Bắc: ', 'Combo 3 trong 1: ', 'Thực đơn gia đình: '];
const suffixes = ['', ' cực phẩm', ' chuẩn vị bà nấu', ' phong cách hiện đại', ' thơm lừng giòn rụm'];
const dishesToFuzz = [
  'Cá Kho Tộ', 'Phở Bò Tái', 'Bánh Mì Chảo', 'Salad Caprese', 'Cà Ri Gà',
  'Cà Pháo Muối', 'Cà Tím Xào Mỡ Hành', 'Fish and Chips', 'Viennese Schnitzel',
  'Kem Gelato Dâu', 'Cháo Sườn Quẩy', 'Lẩu Thái Chua Cay'
];

let fuzzSuccesses = 0;
for (let i = 0; i < 1000; i++) {
  const prefix = prefixes[i % prefixes.length];
  const suffix = suffixes[i % suffixes.length];
  const base = dishesToFuzz[i % dishesToFuzz.length];
  const title = `${prefix}${base}${suffix}`;
  
  const url = getDishImageUrl(title, 'mon-chinh');
  if (url && url.startsWith('https://') && !isDeadOrPlaceholderUrl(url)) {
    fuzzSuccesses++;
  }
}
check(`1,000 fuzz iterations resolved to valid non-dead HTTPS URLs`, fuzzSuccesses === 1000, { fuzzSuccesses });

console.log(`\n======================================================`);
console.log(`CHALLENGER DEEP AUDIT: ${passedChecks}/${totalChecks} checks passed!`);
console.log(`======================================================`);
