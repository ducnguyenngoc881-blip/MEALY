import { normalizeVietnameseDish, resolveCulinaryCluster, getDishImageUrl, OVERUSED_PLACEHOLDER_IDS } from '../src/utils/dishImageResolver';
import { mockRecipes } from '../src/data/mockRecipes';
import { westernDishes500 } from '../src/data/westernDishes500';
import { recipesDatabase } from '../src/data/recipesDatabase';

console.log('======================================================================');
console.log('     FORENSIC INTEGRITY AUDIT — ITERATION 2 REMEDIATIONS');
console.log('======================================================================');

let failureCount = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    failureCount++;
  }
}

// ----------------------------------------------------------------------------
// CHECK 1: PRE-LEXICAL MASKS & HOMOGRAPH DISAMBIGUATION
// ----------------------------------------------------------------------------
console.log('\n--- CHECK 1: Pre-Lexical Phrase Masks & Rules in dishImageResolver.ts ---');
const normCaprese = normalizeVietnameseDish('Salad Cà Chua Phô Mai Caprese');
assert(normCaprese.tokens.includes('__ingr_pho_mai__'), 'Mask __INGR_PHO_MAI__ active in tokens');
assert(normCaprese.tokens.includes('__veg_ca_chua__'), 'Mask __VEG_CA_CHUA__ active in tokens');

const clusterCaprese = resolveCulinaryCluster('Salad Cà Chua Phô Mai Caprese', 'khai-vi');
assert(clusterCaprese === 'salad_tay_caesar', `Caprese resolves to salad_tay_caesar (got: ${clusterCaprese})`);
assert(clusterCaprese !== 'pho_bo', 'Caprese does NOT resolve to pho_bo');

const clusterAvo = resolveCulinaryCluster('Salad Quả Bơ Phô Mai Bơ Lạt', 'khai-vi');
assert(clusterAvo === 'salad_tay_caesar', `Avocado salad resolves to salad_tay_caesar (got: ${clusterAvo})`);
assert(clusterAvo !== 'pho_bo', 'Avocado salad does NOT resolve to pho_bo');

const clusterSteakCream = resolveCulinaryCluster('Bò Bít Tết Sốt Kem Nấm', 'mon-chinh');
assert(clusterSteakCream === 'steak_beef', `Steak cream sauce resolves to steak_beef (got: ${clusterSteakCream})`);
assert(clusterSteakCream !== 'kem_gelato_yogurt', 'Steak cream sauce does NOT resolve to kem_gelato_yogurt');

const clusterFishChips = resolveCulinaryCluster('Fish & Chips Sốt Tartar', 'mon-chinh');
assert(clusterFishChips === 'seafood_western', `Fish & Chips resolves to seafood_western (got: ${clusterFishChips})`);
assert(clusterFishChips !== 'ca_kho_to', 'Fish & Chips does NOT resolve to ca_kho_to');

const clusterSchnitzel = resolveCulinaryCluster('Viennese Schnitzel Thịt Heo', 'mon-chinh');
assert(clusterSchnitzel === 'bbq_ribs_roast', `Schnitzel resolves to bbq_ribs_roast (got: ${clusterSchnitzel})`);
assert(clusterSchnitzel !== 'thit_kho_tau', 'Schnitzel does NOT resolve to thit_kho_tau');

const clusterCaPhao = resolveCulinaryCluster('Cà Pháo Muối Chua Cay', 'mon-rau');
assert(clusterCaPhao === 'rau_cu_luoc_kho_quet', `Ca phao resolves to rau_cu_luoc_kho_quet (got: ${clusterCaPhao})`);

const clusterBanhMiChao = resolveCulinaryCluster('Bánh Mì Chảo Xúc Xích Trứng', 'an-sang');
assert(clusterBanhMiChao === 'banh_mi', `Banh mi chao resolves to banh_mi (got: ${clusterBanhMiChao})`);
assert(clusterBanhMiChao !== 'hotdogs_sausage', 'Banh mi chao does NOT resolve to hotdogs_sausage');

// ----------------------------------------------------------------------------
// CHECK 2: SOURCE CODE RECIPES DATABASE & BURGER LEAKS
// ----------------------------------------------------------------------------
console.log('\n--- CHECK 2: Burger Photo Elimination in recipesDatabase.ts ---');
const BURGER_PHOTO = 'photo-1586190848861-99aa4a171e90';
const dbBurgers = recipesDatabase.filter(r => r.imageUrl?.includes(BURGER_PHOTO));
assert(dbBurgers.length === 0, `recipesDatabase has 0 burger photos (found: ${dbBurgers.length})`);

const nonBurgersWithBurger = mockRecipes.filter(r => !/burger|hamburger/i.test(r.title) && r.imageUrl?.includes(BURGER_PHOTO));
assert(nonBurgersWithBurger.length === 0, `mockRecipes has 0 non-burger recipes with burger photo (found: ${nonBurgersWithBurger.length})`);

// Specific check on the 6 previously contaminated items in recipesDatabase
const chao1 = recipesDatabase.find(r => r.id === 'chao-thit-bam-hanh-tia-to');
assert(chao1?.imageUrl?.includes('photo-1547592180-85f173990554') === true, 'chao-thit-bam has congee photo');
const chao2 = recipesDatabase.find(r => r.id === 'chao-46-suon-non---hanh-hoa-tia-to');
assert(chao2?.imageUrl?.includes('photo-1547592180-85f173990554') === true, 'chao-suon-non has congee photo');
const chao3 = recipesDatabase.find(r => r.id === 'chao-50--au-xanh-thit-bam-thanh-mat');
assert(chao3?.imageUrl?.includes('photo-1547592180-85f173990554') === true, 'chao-dau-xanh has congee photo');
const chao4 = recipesDatabase.find(r => r.id === 'chao-56-thit-bo-can-tay-hat-tieu');
assert(chao4?.imageUrl?.includes('photo-1547592180-85f173990554') === true, 'chao-thit-bo has congee photo');
const chao5 = recipesDatabase.find(r => r.id === 'chao-64-chao--au--o-nuoc-cot-dua');
assert(chao5?.imageUrl?.includes('photo-1547592180-85f173990554') === true, 'chao-dau-do has congee photo');
const tofu1 = recipesDatabase.find(r => r.id === 'egg-103--au-hu-non-ap-chao-trung');
assert(tofu1?.imageUrl?.includes('photo-1525351484163-7529414344d8') === true, 'egg-103 tofu has authentic tofu egg photo');

// ----------------------------------------------------------------------------
// CHECK 3: SAVORY ICE CREAM CONTAMINATION ELIMINATION IN westernDishes500
// ----------------------------------------------------------------------------
console.log('\n--- CHECK 3: Savory Dishes vs Ice Cream Photos in westernDishes500.ts ---');
const ICE_CREAM_PHOTOS = [
  'photo-1563805042-7684c019e1cb',
  'photo-1501443762994-82bd5dace89a',
  'photo-1579372786545-d24232daf58c',
];
const savoryIceWestern = westernDishes500.filter(r => {
  const isDessert = r.category === 'trang-mieng' || r.category === 'an-vat';
  return !isDessert && ICE_CREAM_PHOTOS.some(p => r.imageUrl?.includes(p));
});
assert(savoryIceWestern.length === 0, `westernDishes500 has 0 savory dishes with ice cream photo (found: ${savoryIceWestern.length})`);

const savoryIceMock = mockRecipes.filter(r => {
  const isDessert = r.category === 'trang-mieng' || r.category === 'an-vat';
  if (isDessert) return false;
  if (resolveCulinaryCluster(r.title, r.category) === 'kem_gelato_yogurt') return true;
  return ICE_CREAM_PHOTOS.some(p => r.imageUrl?.includes(p));
});
assert(savoryIceMock.length === 0, `mockRecipes has 0 savory dishes resolving to kem_gelato_yogurt or containing ice cream photo (found: ${savoryIceMock.length})`);

// ----------------------------------------------------------------------------
// CHECK 4: ID DEDUPLICATION IN mockRecipes.ts
// ----------------------------------------------------------------------------
console.log('\n--- CHECK 4: ID Uniqueness & Deduplication in mockRecipes.ts ---');
const idMap = new Map<string, number>();
const duplicateIds: string[] = [];
mockRecipes.forEach(r => {
  const count = (idMap.get(r.id) || 0) + 1;
  idMap.set(r.id, count);
  if (count === 2) duplicateIds.push(r.id);
});
assert(mockRecipes.length === 2245, `Total mockRecipes is 2,245 (got: ${mockRecipes.length})`);
assert(idMap.size === 2245, `Unique recipe IDs count is 2,245 (got: ${idMap.size})`);
assert(duplicateIds.length === 0, `Duplicate recipe IDs is 0 (found: ${duplicateIds.join(', ')})`);

const leftoverGoi = mockRecipes.find(r => r.id === 'leftover-goi-ga-xe-phay-bap-cai');
assert(leftoverGoi !== undefined, 'leftover-goi-ga-xe-phay-bap-cai exists in mockRecipes');
const dbGoi = mockRecipes.find(r => r.id === 'goi-ga-xe-phay-bap-cai');
assert(dbGoi !== undefined, 'goi-ga-xe-phay-bap-cai exists in mockRecipes');
assert(leftoverGoi?.id !== dbGoi?.id, 'Both chicken salad recipes have distinct unique IDs');

// ----------------------------------------------------------------------------
// CHECK 5: FOOD PHOTOGRAPHY PURITY & DEAD URL ELIMINATION
// ----------------------------------------------------------------------------
console.log('\n--- CHECK 5: Food Photography Purity & Dead URL Elimination ---');
const FACE_PHOTO = 'photo-1573140247632-f8fd74997d5c';
const faceViolations = mockRecipes.filter(r => r.imageUrl?.includes(FACE_PHOTO));
assert(faceViolations.length === 0, `0 human face photos across all recipes (found: ${faceViolations.length})`);

const deadViolations = mockRecipes.filter(r => OVERUSED_PLACEHOLDER_IDS.some(badId => r.imageUrl?.includes(badId)));
assert(deadViolations.length === 0, `0 dead or overused placeholder photos across all recipes (found: ${deadViolations.length})`);

// ----------------------------------------------------------------------------
// CHECK 6: western-bfast-433 AUTHENTICITY
// ----------------------------------------------------------------------------
console.log('\n--- CHECK 6: western-bfast-433 Omelette Authenticity ---');
const w433 = westernDishes500.find(r => r.id === 'western-bfast-433');
assert(w433 !== undefined, 'western-bfast-433 exists');
assert(w433?.imageUrl?.includes('photo-1584776296944-ab6fb57b0bdd') === true, 'western-bfast-433 has authentic omelette photo');
assert(!w433?.imageUrl?.includes('photo-1621996346565-e3d5d6281292'), 'western-bfast-433 does NOT contain dead 404 URL');
assert(!w433?.imageUrl?.includes(BURGER_PHOTO), 'western-bfast-433 does NOT contain burger photo');

const w433Resolved = getDishImageUrl(w433!.title, w433!.category, w433!.imageUrl);
assert(w433Resolved.includes('photo-1584776296944-ab6fb57b0bdd'), 'getDishImageUrl resolves western-bfast-433 to authentic omelette');

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TOTAL FORENSIC FAILURES: ${failureCount}`);
if (failureCount === 0) {
  console.log('VERDICT: CLEAN ✅');
} else {
  console.log('VERDICT: INTEGRITY VIOLATION ❌');
  process.exit(1);
}
console.log('======================================================================');
