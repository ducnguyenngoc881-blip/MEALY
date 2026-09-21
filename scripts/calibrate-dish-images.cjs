/**
 * Semantic Food & Drink Photography Calibration Script
 * Audits and replaces placeholder / repetitive image URLs across all MealWise databases
 * with authentic, verified food photography matching each dish's name and category.
 */

const fs = require('fs');
const path = require('path');

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const FOOD_IMAGE_POOLS = {
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80'
  ],
  fried_chicken: [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80'
  ],
  banh_mi: [
    'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80'
  ],
  pho_noodles: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80'
  ],
  bun_cha: [
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
  ],
  com_tam: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80'
  ],
  pork_dish: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80'
  ],
  beef_dish: [
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=600&q=80'
  ],
  fish_seafood: [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
  ],
  soup_dish: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'
  ],
  veggie_dish: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'
  ],
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'
  ],
  snacks: [
    'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281744?auto=format&fit=crop&w=600&q=80'
  ],
  coffee: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'
  ],
  tea_drink: [
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'
  ],
  dessert: [
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  ],
  bizarre_dare: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80'
  ]
};

function pick(poolKey, seed) {
  const pool = FOOD_IMAGE_POOLS[poolKey] || FOOD_IMAGE_POOLS.com_tam;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

function resolveImage(title, category) {
  const raw = title || '';
  const norm = removeVietnameseTones(raw).toLowerCase().trim();

  if (norm.includes('burger') || norm.includes('hamburger') || norm.includes('hotdog')) return pick('burger', raw);
  if (norm.includes('ga ran') || norm.includes('ga xoi mo') || norm.includes('ga chien') || norm.includes('canh ga') || norm.includes('dui ga')) return pick('fried_chicken', raw);
  if (norm.includes('banh mi') || norm.includes('pate') || norm.includes('sandwich')) return pick('banh_mi', raw);
  if (norm.includes('pizza')) return pick('pizza', raw);
  if (norm.includes('pho ') || norm.startsWith('pho') || norm.includes('bun bo') || norm.includes('bun rieu') || norm.includes('hu tieu') || norm.includes('mi quang') || norm.includes('ramen')) return pick('pho_noodles', raw);
  if (norm.includes('bun cha') || norm.includes('bun thit nuong') || norm.includes('bun dau')) return pick('bun_cha', raw);
  if (norm.includes('ca phe') || norm.includes('coffee') || norm.includes('bac xiu')) return pick('coffee', raw);
  if (norm.includes('tra sua') || norm.includes('tra dao') || norm.includes('tra tac') || norm.includes('sinh to') || category === 'nuoc-uong') return pick('tea_drink', raw);
  if (norm.includes('khoai tay') || norm.includes('nem chua') || norm.includes('banh trang') || norm.includes('snack') || category === 'an-vat') return pick('snacks', raw);
  if (norm.includes('canh') || norm.includes('sup') || norm.includes('lau ') || category === 'mon-canh') return pick('soup_dish', raw);
  if (norm.includes('ca ') || norm.includes('tom ') || norm.includes('muc ') || norm.includes('hai san')) return pick('fish_seafood', raw);
  if (norm.includes('bo ') || norm.includes('beef')) return pick('beef_dish', raw);
  if (norm.includes('thit kho') || norm.includes('ba chi') || norm.includes('suon') || norm.includes('heo') || category === 'mon-man') return pick('pork_dish', raw);
  if (norm.includes('rau ') || norm.includes('cai ') || norm.includes('dau phu') || norm.includes('tofu') || category === 'mon-xao') return pick('veggie_dish', raw);
  if (norm.includes('che ') || norm.includes('flan') || norm.includes('kem ') || category === 'trang-mieng') return pick('dessert', raw);
  if (category === 'doc-la') return pick('bizarre_dare', raw);

  return pick('com_tam', raw);
}

function calibrateFastMealData() {
  const filePath = path.join(__dirname, '../src/data/fastMealData.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Match items with title and imageUrl
  let replacedCount = 0;
  content = content.replace(/title:\s*['"`]([^'"`]+)['"`][\s\S]*?imageUrl:\s*['"`](https:\/\/images\.unsplash\.com\/[^'"`]+)['"`]/g, (match, title, oldUrl) => {
    const newUrl = resolveImage(title);
    if (newUrl !== oldUrl) {
      replacedCount++;
      return match.replace(oldUrl, newUrl);
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ fastMealData.ts: calibrated ${replacedCount} dish images.`);
}

function calibrateMockRecipes() {
  const filePath = path.join(__dirname, '../src/data/mockRecipes.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  let replacedCount = 0;
  content = content.replace(/title:\s*['"`]([^'"`]+)['"`][\s\S]*?category:\s*['"`]([^'"`]+)['"`][\s\S]*?imageUrl:\s*['"`](https:\/\/images\.unsplash\.com\/[^'"`]+)['"`]/g, (match, title, cat, oldUrl) => {
    const newUrl = resolveImage(title, cat);
    if (newUrl !== oldUrl) {
      replacedCount++;
      return match.replace(oldUrl, newUrl);
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ mockRecipes.ts: calibrated ${replacedCount} recipe images.`);
}

function calibrateJsonPool(fileName, defaultCat) {
  const filePath = path.join(__dirname, '../src/data/casePools', fileName);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let replacedCount = 0;
  content = content.replace(/"title":\s*"([^"]+)"[\s\S]*?"imageUrl":\s*"(https:\/\/images\.unsplash\.com\/[^"]+)"/g, (match, title, oldUrl) => {
    const newUrl = resolveImage(title, defaultCat);
    if (newUrl !== oldUrl) {
      replacedCount++;
      return match.replace(oldUrl, newUrl);
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ ${fileName}: calibrated ${replacedCount} dish images.`);
}

function calibrateCorporatePartyPresets() {
  const filePath = path.join(__dirname, '../src/data/corporatePartyPresets.ts');
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let replacedCount = 0;
  content = content.replace(/name:\s*['"`]([^'"`]+)['"`][\s\S]*?image:\s*['"`](https:\/\/images\.unsplash\.com\/[^'"`]+)['"`]/g, (match, name, oldUrl) => {
    const newUrl = resolveImage(name);
    if (newUrl !== oldUrl) {
      replacedCount++;
      return match.replace(oldUrl, newUrl);
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ corporatePartyPresets.ts: calibrated ${replacedCount} catering images.`);
}

console.log('======================================================================');
console.log('           CALIBRATING MEALWISE FOOD & DRINK PHOTOGRAPHY              ');
console.log('======================================================================');
calibrateFastMealData();
calibrateMockRecipes();
calibrateCorporatePartyPresets();
calibrateJsonPool('expressPool.ts', 'an-nhanh');
calibrateJsonPool('snackPool.ts', 'an-vat');
calibrateJsonPool('comboPool.ts', 'mon-chinh');
calibrateJsonPool('bizarrePool.ts', 'doc-la');
console.log('======================================================================');

