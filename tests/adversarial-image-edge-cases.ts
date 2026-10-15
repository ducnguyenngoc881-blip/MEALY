/**
 * Adversarial Edge Cases & Stress Harness for Dish Image Resolution & SafeImage Cascade
 * 
 * Tests:
 * 1. Empty strings, whitespace, null/undefined, special characters, unicode & emojis.
 * 2. Rare and fusion dishes (e.g., "Bánh Mì Pizza Sốt Cà Chua Phô Mai", "Lẩu Thái Bò Bít Tết", "Kem Chiên Giòn").
 * 3. Subtle Vietnamese homographs (Cà Ri, Cà Pháo, Cà Tím, Cà Chua, Cà Phê vs Cá Hồi, Cá Kho, Cá Lóc, Chả Cá).
 * 4. 4-Stage Resilient Fallback Cascade in SafeImage (Stage 0 -> Stage 1 -> Stage 2 -> Stage 3).
 * 5. Full catalog audit: 100% of all recipes resolve to valid online food photography, zero cloche SVGs, zero blacklisted IDs.
 * 6. Semantic Collision & Homograph Isolation Assertions (Phô Mai + Bơ != Phở Bò, Fish & Chips != Cá Kho Tộ, Bánh Mì Chảo != Hotdog).
 */

import {
  getDishImageUrl,
  resolveCulinaryCluster,
  normalizeVietnameseDish,
  isDeadOrPlaceholderUrl,
  OVERUSED_PLACEHOLDER_IDS,
  FOOD_IMAGE_POOLS,
  CULINARY_82_POOLS
} from '../src/utils/dishImageResolver';

import { getOfflineFoodPlaceholder } from '../src/utils/offlineImage';
import { mockRecipes } from '../src/data/mockRecipes';
import { recipesDatabase } from '../src/data/recipesDatabase';
import { westernDishes500 } from '../src/data/westernDishes500';

interface TestCaseResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestCaseResult[] = [];

function assert(condition: boolean, message: string, details?: any) {
  if (!condition) {
    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }
}

function runTestCase(suite: string, name: string, fn: () => void) {
  try {
    fn();
    testResults.push({ suite, name, passed: true });
    console.log(`  [PASS] [${suite}] ${name}`);
  } catch (err: any) {
    testResults.push({ suite, name, passed: false, error: err.message, details: err.details });
    console.error(`  [FAIL] [${suite}] ${name}: ${err.message}`);
    if (err.details) {
      console.error(`         Details:`, JSON.stringify(err.details));
    }
  }
}

console.log('\n======================================================================');
console.log('  CHALLENGER ADVERSARIAL STRESS HARNESS: DISH IMAGE RESOLVER & SAFEIMAGE');
console.log('======================================================================\n');

// ============================================================================
// SUITE 1: BOUNDARY STRINGS, SPECIAL CHARACTERS, WHITESPACE & EMOJIS
// ============================================================================
console.log('--- SUITE 1: Boundary Strings, Special Characters, Whitespace & Emojis ---');

runTestCase('Suite 1: Boundaries', 'Empty string title and empty category', () => {
  const url = getDishImageUrl('', '');
  assert(typeof url === 'string' && url.length > 0, 'Must return non-empty URL string');
  assert(url.startsWith('https://'), 'Must return valid HTTPS URL');
  assert(!url.startsWith('data:image/svg+xml'), 'Must not return offline SVG cloche');
  assert(!isDeadOrPlaceholderUrl(url), 'Must not be blacklisted or dead');
});

runTestCase('Suite 1: Boundaries', 'Whitespace only title and category (spaces, tabs, newlines)', () => {
  const whitespaceInputs = ['   ', '\t\t\n\r', ' \n \t '];
  for (const ws of whitespaceInputs) {
    const url = getDishImageUrl(ws, ws);
    assert(typeof url === 'string' && url.length > 0, `Whitespace '${JSON.stringify(ws)}' returned empty`);
    assert(url.startsWith('https://'), `Whitespace '${JSON.stringify(ws)}' did not return HTTPS`);
    assert(!url.startsWith('data:image/svg+xml'), 'Must not return offline SVG cloche');
    assert(!isDeadOrPlaceholderUrl(url), 'Must not be dead/placeholder');
  }
});

runTestCase('Suite 1: Boundaries', 'Null and undefined title/category boundary handling', () => {
  const url1 = getDishImageUrl(null as any, undefined);
  assert(url1.startsWith('https://'), 'null title must return valid HTTPS URL');

  const url2 = getDishImageUrl(undefined as any, null as any);
  assert(url2.startsWith('https://'), 'undefined title must return valid HTTPS URL');

  const url3 = getDishImageUrl('Phở Bò', undefined, null as any);
  assert(url3.startsWith('https://'), 'null existingUrl must be gracefully bypassed');
});

runTestCase('Suite 1: Boundaries', 'Special characters, quotes, and punctuation noise', () => {
  const noiseCases = [
    '!@#$%^&*()_+=-~`{}[]|:;"\'<>,.?/',
    '"""\'\'\'',
    '---____---',
    'Phở Bò @#$$%^&*()!!!! 12345'
  ];

  for (const input of noiseCases) {
    const url = getDishImageUrl(input, 'mon-chinh');
    assert(typeof url === 'string' && url.startsWith('https://'), `Special characters '${input}' failed`);
    assert(!url.startsWith('data:image/svg+xml'), 'Must not return offline SVG cloche');
    assert(!isDeadOrPlaceholderUrl(url), 'Must not be dead/placeholder');
  }

  // Dish with noise must still resolve accurately to pho_bo
  const phoWithNoise = getDishImageUrl('Phở Bò @#$$%^&*()!!!! 12345', 'mon-chinh');
  assert(FOOD_IMAGE_POOLS.pho_bo.includes(phoWithNoise), 'Dish with noise should still resolve to pho_bo');
});

runTestCase('Suite 1: Boundaries', 'XSS & HTML markup injection in title', () => {
  const xssCases = [
    "<script>alert('xss')</script><b>Phở Bò Tái Lăn</b>",
    "<img src=x onerror=alert(1)>Bún Bò Huế",
    "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/'/onclick='alert(1)'",
  ];

  for (const input of xssCases) {
    const url = getDishImageUrl(input, 'mon-chinh');
    assert(typeof url === 'string' && url.startsWith('https://'), `XSS input did not return HTTPS`);
    assert(!url.startsWith('data:image/svg+xml'), 'Must not return offline SVG cloche');
    assert(!isDeadOrPlaceholderUrl(url), 'Must not be dead/placeholder');
  }

  // Assert semantic extraction despite HTML tags
  const phoWithTag = getDishImageUrl("<script>alert('xss')</script><b>Phở Bò Tái Lăn</b>", 'mon-chinh');
  assert(FOOD_IMAGE_POOLS.pho_bo.includes(phoWithTag), 'Should cleanly extract pho_bo despite HTML tags');
});

runTestCase('Suite 1: Boundaries', 'Pure emojis and zero-width characters', () => {
  const zeroWidth = '\u200B\u200C\uFEFFPhở\u200B Bò\u200C';
  const urlZeroWidth = getDishImageUrl(zeroWidth, 'mon-chinh');
  assert(FOOD_IMAGE_POOLS.pho_bo.includes(urlZeroWidth), 'Should handle zero-width characters in Phở Bò');

  const pureEmojis = '🍲 🥢 🥩 🍜 🍕';
  const urlEmojis = getDishImageUrl(pureEmojis, 'mon-canh');
  assert(urlEmojis.startsWith('https://'), 'Pure emojis should safely resolve to valid fallback');
  assert(!isDeadOrPlaceholderUrl(urlEmojis), 'Pure emojis must not yield dead URL');
});

runTestCase('Suite 1: Boundaries', 'Dishes with rich emoji accents', () => {
  const emojiDishes = [
    { title: '🍜 Phở Bò Tái Lăn 🥩', pool: 'pho_bo', cat: 'mon-chinh' },
    { title: '🍕 Pizza Hải Sản Phô Mai 🧀', pool: 'pizza', cat: 'an-nhanh' },
    { title: '🍔 Burger Bò Nướng 🍟', pool: 'burger', cat: 'an-nhanh' },
    { title: '☕ Cà Phê Sữa Đá 🧊', pool: 'ca_phe_vietnam', cat: 'nuoc-uong' },
    { title: '🥩 Bò Bít Tết Thăn Ngoại 🍷', pool: 'steak_beef', cat: 'mon-chinh' },
    { title: '🍳 Trứng Ốp La Lòng Đào 🥖', pool: 'trung_chien_op_la', cat: 'an-sang' },
    { title: '🥞 Pancake Mật Ong & Chuối 🍌', pool: 'pancake_waffle', cat: 'an-sang' },
  ];

  for (const item of emojiDishes) {
    const url = getDishImageUrl(item.title, item.cat);
    const targetPool = FOOD_IMAGE_POOLS[item.pool];
    assert(targetPool.includes(url), `Emoji dish '${item.title}' failed to match pool '${item.pool}'`, {
      resolvedUrl: url,
      expectedPool: item.pool
    });
  }
});

runTestCase('Suite 1: Boundaries', 'Massive 10,000-character input string stress', () => {
  const hugeTitle = 'Phở Bò Tái Lăn ' + 'Rất Ngon '.repeat(1000);
  const start = Date.now();
  const url = getDishImageUrl(hugeTitle, 'mon-chinh');
  const duration = Date.now() - start;

  assert(duration < 100, `Huge string took too long: ${duration}ms`);
  assert(FOOD_IMAGE_POOLS.pho_bo.includes(url), 'Huge string starting with Phở Bò must resolve to pho_bo');
});

// ============================================================================
// SUITE 2: RARE & FUSION DISHES
// ============================================================================
console.log('\n--- SUITE 2: Rare & Complex Fusion Dishes ---');

runTestCase('Suite 2: Fusion', 'Bánh Mì Pizza Sốt Cà Chua Phô Mai', () => {
  const title = 'Bánh Mì Pizza Sốt Cà Chua Phô Mai';
  const cluster = resolveCulinaryCluster(title, 'an-nhanh');
  const url = getDishImageUrl(title, 'an-nhanh');

  assert(['pizza', 'banh_mi'].includes(cluster), `Expected 'pizza' or 'banh_mi', got '${cluster}'`);
  assert(url.startsWith('https://'), 'Must return valid HTTPS photo');
  assert(!isDeadOrPlaceholderUrl(url), 'Must not be placeholder');
});

runTestCase('Suite 2: Fusion', 'Lẩu Thái Bò Bít Tết', () => {
  const title = 'Lẩu Thái Bò Bít Tết';
  const cluster = resolveCulinaryCluster(title, 'mon-chinh');
  const url = getDishImageUrl(title, 'mon-chinh');

  assert(['steak_beef', 'lau_vietnam'].includes(cluster), `Expected 'steak_beef' or 'lau_vietnam', got '${cluster}'`);
  assert(url.startsWith('https://'), 'Must return valid HTTPS photo');
  assert(!isDeadOrPlaceholderUrl(url), 'Must not be placeholder');
});

runTestCase('Suite 2: Fusion', 'Kem Chiên Giòn', () => {
  const title = 'Kem Chiên Giòn';
  const cluster = resolveCulinaryCluster(title, 'trang-mieng');
  const url = getDishImageUrl(title, 'trang-mieng');

  assert(cluster === 'kem_gelato_yogurt', `Expected 'kem_gelato_yogurt', got '${cluster}'`);
  assert(FOOD_IMAGE_POOLS.kem_gelato_yogurt.includes(url), 'Must pick from kem_gelato_yogurt pool');
});

runTestCase('Suite 2: Fusion', 'Cà Phê Muối Nướng Phô Mai (Artisan drink fusion)', () => {
  const title = 'Cà Phê Muối Nướng Phô Mai';
  const cluster = resolveCulinaryCluster(title, 'nuoc-uong');
  assert(cluster === 'ca_phe_muoi_artisan', `Expected 'ca_phe_muoi_artisan', got '${cluster}'`);
});

runTestCase('Suite 2: Fusion', 'Phở Bò Viên Chiên Xóc Mắm Tỏi', () => {
  const title = 'Phở Bò Viên Chiên Xóc Mắm Tỏi';
  const cluster = resolveCulinaryCluster(title, 'mon-chinh');
  assert(['pho_bo', 'xien_que_ca_vien'].includes(cluster), `Got unexpected cluster '${cluster}'`);
});

runTestCase('Suite 2: Fusion', 'Trứng Cuộn Omelette Bò Bít Tết Khoai Tây Chiên (Triple western combo)', () => {
  const title = 'Trứng Cuộn Omelette Bò Bít Tết Khoai Tây Chiên';
  const cluster = resolveCulinaryCluster(title, 'an-sang');
  assert(['trung_cuon_omelette', 'steak_beef', 'french_fries'].includes(cluster), `Got cluster '${cluster}'`);
  const url = getDishImageUrl(title, 'an-sang');
  assert(url.startsWith('https://'), 'Must return valid HTTPS');
});

// ============================================================================
// SUITE 3: SUBTLE VIETNAMESE HOMOGRAPHS & PRE-LEXICAL DISAMBIGUATION
// ============================================================================
console.log('\n--- SUITE 3: Subtle Vietnamese Homographs & Pre-Lexical Disambiguation ---');

runTestCase('Suite 3: Homographs', 'Cà Ri Gà & Cà Ri Bò (Must NEVER match fish/cá kho)', () => {
  const curries = [
    'Cà Ri Gà Nước Cốt Dừa',
    'Cà Ri Bò Khoai Tây Kiểu Ấn',
    'Cà Ri Tôm Cay Nồng Thái Lan',
    'Japanese Curry Bò Viên'
  ];

  for (const title of curries) {
    const cluster = resolveCulinaryCluster(title, 'mon-chinh');
    const url = getDishImageUrl(title, 'mon-chinh');
    assert(cluster === 'curry_dishes', `Disambiguation failed for '${title}': expected 'curry_dishes', got '${cluster}'`);
    assert(FOOD_IMAGE_POOLS.curry_dishes.includes(url), `Must pick from curry_dishes pool for '${title}'`);
    assert(!FOOD_IMAGE_POOLS.ca_kho_to.includes(url), `'${title}' incorrectly mapped to braised fish!`);
  }
});

runTestCase('Suite 3: Homographs', 'Cà Tím dishes (Must NEVER match fish/cá kho)', () => {
  const eggplants = [
    'Cà Tím Xào Mỡ Hành',
    'Cà Tím Xào Thịt Băm',
    'Cà Tím Nướng Mỡ Hành Thịt Heo',
    'Cà Tím Xào Tỏi Chay'
  ];

  for (const title of eggplants) {
    const cluster = resolveCulinaryCluster(title, 'mon-xao');
    const url = getDishImageUrl(title, 'mon-xao');
    assert(cluster !== 'ca_kho_to', `'${title}' falsely resolved to ca_kho_to (fish)!`);
    assert(!FOOD_IMAGE_POOLS.ca_kho_to.includes(url), `'${title}' URL came from ca_kho_to pool!`);
    assert(cluster === 'rau_xao_thap_cam' || cluster === 'rau_cu_luoc_kho_quet', `Expected veg cluster, got '${cluster}'`);
  }
});

runTestCase('Suite 3: Homographs', 'Cà Pháo dishes (Must match vegetable cluster, not fallback)', () => {
  const caPhao = 'Cà Pháo Muối Chua Cay Giòn';
  const cluster = resolveCulinaryCluster(caPhao, 'mon-rau');
  assert(
    cluster === 'rau_cu_luoc_kho_quet' || cluster === 'rau_xao_thap_cam',
    `'${caPhao}' should match vegetable cluster rau_cu_luoc_kho_quet, but got '${cluster}' (Mask __VEG_CA_PHAO__ unrecognized)`
  );
});

runTestCase('Suite 3: Homographs', 'Cà Chua dishes (Must NEVER match fish/cá kho)', () => {
  const tomatoes = [
    'Đậu Sốt Cà Chua',
    'Đậu Phụ Nhồi Thịt Sốt Cà',
    'Cà Chua Nhồi Thịt Hấp Sốt Cà'
  ];

  for (const title of tomatoes) {
    const cluster = resolveCulinaryCluster(title, 'mon-man');
    const url = getDishImageUrl(title, 'mon-man');
    assert(cluster !== 'ca_kho_to', `'${title}' falsely resolved to ca_kho_to (fish)!`);
    assert(!FOOD_IMAGE_POOLS.ca_kho_to.includes(url), `'${title}' URL came from ca_kho_to pool!`);
    assert(cluster === 'dau_sot_ca_chua', `Expected 'dau_sot_ca_chua', got '${cluster}'`);
  }
});

runTestCase('Suite 3: Homographs', 'Cà Phê beverages (Must NEVER match fish/cá kho)', () => {
  const coffees = [
    'Cà Phê Sữa Đá Sài Gòn',
    'Cà Phê Đen Đá Không Đường',
    'Cà Phê Muối Artisan Huế',
    'Cà Phê Trứng Hà Nội',
    'Bạc Xỉu Đá 3 Tầng'
  ];

  for (const title of coffees) {
    const cluster = resolveCulinaryCluster(title, 'nuoc-uong');
    const url = getDishImageUrl(title, 'nuoc-uong');
    assert(cluster === 'ca_phe_vietnam' || cluster === 'ca_phe_muoi_artisan', `'${title}' got '${cluster}'`);
    assert(!FOOD_IMAGE_POOLS.ca_kho_to.includes(url), `'${title}' URL came from ca_kho_to pool!`);
  }
});

runTestCase('Suite 3: Homographs', 'Cá (Genuine Fish Dishes) must match authentic fish pools', () => {
  const fishDishes = [
    { title: 'Cá Kho Tộ Đậm Đà Chuẩn Vị Nam Bộ', pool: 'ca_kho_to', cat: 'mon-man' },
    { title: 'Cá Basa Kho Tiêu', pool: 'ca_kho_to', cat: 'mon-man' },
    { title: 'Cá Lóc Kho Nghệ', pool: 'ca_kho_to', cat: 'mon-man' },
    { title: 'Chả Cá Lã Vọng Hà Nội', pool: 'cha_ca_vietnam', cat: 'mon-chinh' },
    { title: 'Cá Hồi Áp Chảo Sốt Bơ Chanh', pool: 'seafood_western', cat: 'mon-chinh' },
    { title: 'Canh Chua Cá Hồi', pool: 'canh_chua', cat: 'mon-canh' },
  ];

  for (const item of fishDishes) {
    const cluster = resolveCulinaryCluster(item.title, item.cat);
    const url = getDishImageUrl(item.title, item.cat);
    assert(cluster === item.pool, `Fish dish '${item.title}' expected pool '${item.pool}', got '${cluster}'`);
    assert(FOOD_IMAGE_POOLS[item.pool].includes(url), `'${item.title}' did not pick from pool '${item.pool}'`);
  }
});

runTestCase('Suite 3: Homographs', 'Bánh Mì Chảo vs Cháo (chao without tones collision)', () => {
  const chaoDishes = [
    'Cháo Sườn Quẩy Nóng',
    'Cháo Gà Hạt Sen',
    'Cháo Bò Băm Hành Hoa'
  ];
  for (const title of chaoDishes) {
    const cluster = resolveCulinaryCluster(title, 'mon-chinh');
    assert(cluster === 'chao_vietnam', `'${title}' expected 'chao_vietnam', got '${cluster}'`);
  }
});

runTestCase('Suite 3: Homographs', 'Hủ Tiếu Nam Vang (Nam Vang idiom mask collision check)', () => {
  const huTieu = 'Hủ Tiếu Nam Vang Thập Cẩm';
  const cluster = resolveCulinaryCluster(huTieu, 'mon-chinh');
  assert(cluster === 'hu_tieu', `Expected 'hu_tieu', got '${cluster}'`);
  assert(cluster !== 'mon_chay_tofu_mushroom', 'Should not collide with mushrooms (nam)');
});

// ============================================================================
// SUITE 4: SIMULATED NETWORK ERROR STAGES IN SAFEIMAGE CASCADE
// ============================================================================
console.log('\n--- SUITE 4: Simulated SafeImage 4-Stage Fallback Cascade ---');

runTestCase('Suite 4: SafeImage Cascade', 'Stage 0 (Pre-Flight Sanitization with Dead URL)', () => {
  const deadSrc = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80';
  const title = 'Trứng Cuộn Omelette Xúc Xích Đức & Bánh Mì Bơ';
  
  const resolved = getDishImageUrl(title, 'an-sang', deadSrc);
  
  assert(resolved !== deadSrc, 'Stage 0 MUST NOT return dead URL');
  assert(!isDeadOrPlaceholderUrl(resolved), 'Stage 0 MUST NOT return blacklisted or placeholder URL');
  assert(FOOD_IMAGE_POOLS.trung_cuon_omelette.includes(resolved), 'Stage 0 must resolve to authentic omelette pool');
});

runTestCase('Suite 4: SafeImage Cascade', 'Stage 0 (Pre-Flight Sanitization with Cloche SVG)', () => {
  const offlineSvg = getOfflineFoodPlaceholder('Canh Chua Cá Hồi', 'mon-canh');
  const resolved = getDishImageUrl('Canh Chua Cá Hồi', 'mon-canh', offlineSvg);

  assert(resolved !== offlineSvg, 'Stage 0 MUST NOT return cloche SVG when online');
  assert(
    resolved.startsWith('https://images.unsplash.com/') ||
    resolved.startsWith('https://upload.wikimedia.org/') ||
    resolved.startsWith('https://thumb.wikimedia.org/'),
    'Stage 0 must return live CDN URL'
  );
  assert(FOOD_IMAGE_POOLS.canh_chua.includes(resolved), 'Must resolve to canh_chua pool');
});

runTestCase('Suite 4: SafeImage Cascade', 'Stage 1 (Fallback to Semantic Cluster ignoring broken src)', () => {
  const title = 'Bò Bít Tết Sốt Tiêu Đen';
  const stage1Src = getDishImageUrl(title, 'mon-chinh');

  assert(
    stage1Src.startsWith('https://images.unsplash.com/') ||
    stage1Src.startsWith('https://upload.wikimedia.org/') ||
    stage1Src.startsWith('https://thumb.wikimedia.org/'),
    'Stage 1 must return valid HTTPS photo'
  );
  assert(FOOD_IMAGE_POOLS.steak_beef.includes(stage1Src), 'Stage 1 must resolve to steak_beef cluster');
  assert(!isDeadOrPlaceholderUrl(stage1Src), 'Stage 1 must not be dead');
});

runTestCase('Suite 4: SafeImage Cascade', 'Stage 2 (Guaranteed High-Definition Food Pool Fallback)', () => {
  const guaranteedPool = FOOD_IMAGE_POOLS['com_tam'] || FOOD_IMAGE_POOLS['banh_mi'] || [];
  const stage2Src = guaranteedPool[0];

  assert(typeof stage2Src === 'string' && stage2Src.length > 0, 'Stage 2 guaranteed pool must exist');
  assert(
    stage2Src.startsWith('https://images.unsplash.com/') ||
    stage2Src.startsWith('https://upload.wikimedia.org/') ||
    stage2Src.startsWith('https://thumb.wikimedia.org/'),
    'Stage 2 must be an online food photo'
  );
  assert(!isDeadOrPlaceholderUrl(stage2Src), 'Stage 2 guaranteed pool must never contain dead or blacklisted IDs');
});

runTestCase('Suite 4: SafeImage Cascade', 'Stage 3 (Offline Cloche SVG only on total exhaustion / offline)', () => {
  const title = 'Lẩu Hải Sản Chua Cay';
  const category = 'mon-chinh';
  const stage3Src = getOfflineFoodPlaceholder(title, category);

  assert(stage3Src.startsWith('data:image/svg+xml'), 'Stage 3 must generate an inline SVG data URI');
  assert(decodeURIComponent(stage3Src).includes('MEALWISE'), 'Stage 3 SVG must include brand watermark');
  assert(decodeURIComponent(stage3Src).includes(title), 'Stage 3 SVG must render dish title');
});

runTestCase('Suite 4: SafeImage Cascade', 'Stage 0 -> Stage 1 -> Stage 2 -> Stage 3 State Transition Simulation', () => {
  const title = 'Gà Nướng Mật Ong';
  const category = 'mon-chinh';
  let errorStage = 0;
  
  function getSafeImageSrc(stage: number, src?: string): string {
    if (stage === 0) {
      return getDishImageUrl(title, category, src);
    } else if (stage === 1) {
      return getDishImageUrl(title, category);
    } else if (stage === 2) {
      const guaranteedPool = FOOD_IMAGE_POOLS['com_tam'] || FOOD_IMAGE_POOLS['banh_mi'] || [];
      return guaranteedPool[0] || getOfflineFoodPlaceholder(title, category);
    } else {
      return getOfflineFoodPlaceholder(title, category);
    }
  }

  const brokenExternalUrl = 'https://broken-cdn.example.com/not-found.jpg';
  let currentSrc = getSafeImageSrc(errorStage, brokenExternalUrl);
  assert(currentSrc === brokenExternalUrl, 'Stage 0 initially renders valid-looking external URL');

  errorStage = Math.min(errorStage + 1, 3);
  currentSrc = getSafeImageSrc(errorStage);
  assert(errorStage === 1, 'Error stage transitioned to 1');
  assert(
    currentSrc.startsWith('https://images.unsplash.com/') ||
    currentSrc.startsWith('https://upload.wikimedia.org/') ||
    currentSrc.startsWith('https://thumb.wikimedia.org/'),
    'Stage 1 provides semantic cluster fallback'
  );

  errorStage = Math.min(errorStage + 1, 3);
  currentSrc = getSafeImageSrc(errorStage);
  assert(errorStage === 2, 'Error stage transitioned to 2');
  assert(FOOD_IMAGE_POOLS['com_tam'].includes(currentSrc), 'Stage 2 provides guaranteed com_tam fallback');

  errorStage = Math.min(errorStage + 1, 3);
  currentSrc = getSafeImageSrc(errorStage);
  assert(errorStage === 3, 'Error stage transitioned to 3');
  assert(currentSrc.startsWith('data:image/svg+xml'), 'Stage 3 provides offline cloche SVG');

  errorStage = Math.min(errorStage + 1, 3);
  assert(errorStage === 3, 'Error stage remains capped at 3');
});

// ============================================================================
// SUITE 5: EXHAUSTIVE CATALOG AUDIT (100% ONLINE PURITY & INTEGRITY)
// ============================================================================
console.log('\n--- SUITE 5: Full Database Catalog Audit (2,245 Recipes) ---');

runTestCase('Suite 5: Catalog Audit', 'Audit all mockRecipes (zero dead URLs, zero cloches)', () => {
  let count = 0;
  for (const recipe of mockRecipes) {
    count++;
    const resolved = getDishImageUrl(recipe.title, recipe.category, recipe.imageUrl);
    assert(!isDeadOrPlaceholderUrl(resolved), `mockRecipes id=${recipe.id} '${recipe.title}' resolved to dead/placeholder: ${resolved}`);
    assert(!resolved.startsWith('data:image/svg+xml'), `mockRecipes id=${recipe.id} '${recipe.title}' resolved to offline cloche!`);
    assert(resolved.startsWith('https://'), `mockRecipes id=${recipe.id} '${recipe.title}' URL is not HTTPS`);

    const clusterUrl = getDishImageUrl(recipe.title, recipe.category);
    assert(!isDeadOrPlaceholderUrl(clusterUrl), `mockRecipes fallback id=${recipe.id} '${recipe.title}' returned dead/placeholder`);
    assert(!clusterUrl.startsWith('data:image/svg+xml'), `mockRecipes fallback id=${recipe.id} returned cloche`);
  }
  console.log(`         Audited ${count} mockRecipes successfully.`);
});

runTestCase('Suite 5: Catalog Audit', 'Audit all recipesDatabase (zero dead URLs, zero cloches)', () => {
  let count = 0;
  for (const recipe of recipesDatabase) {
    count++;
    const resolved = getDishImageUrl(recipe.title, recipe.category, recipe.imageUrl);
    assert(!isDeadOrPlaceholderUrl(resolved), `recipesDatabase id=${recipe.id} '${recipe.title}' resolved to dead/placeholder: ${resolved}`);
    assert(!resolved.startsWith('data:image/svg+xml'), `recipesDatabase id=${recipe.id} '${recipe.title}' resolved to offline cloche!`);
    assert(resolved.startsWith('https://'), `recipesDatabase id=${recipe.id} '${recipe.title}' URL is not HTTPS`);

    const clusterUrl = getDishImageUrl(recipe.title, recipe.category);
    assert(!isDeadOrPlaceholderUrl(clusterUrl), `recipesDatabase fallback id=${recipe.id} returned dead/placeholder`);
    assert(!clusterUrl.startsWith('data:image/svg+xml'), `recipesDatabase fallback id=${recipe.id} returned cloche`);
  }
  console.log(`         Audited ${count} recipesDatabase dishes successfully.`);
});

runTestCase('Suite 5: Catalog Audit', 'Audit all westernDishes500 (zero dead URLs, zero cloches)', () => {
  let count = 0;
  for (const dish of westernDishes500) {
    count++;
    const resolved = getDishImageUrl(dish.title, dish.category, dish.imageUrl);
    assert(!isDeadOrPlaceholderUrl(resolved), `westernDishes500 id=${dish.id} '${dish.title}' resolved to dead/placeholder: ${resolved}`);
    assert(!resolved.startsWith('data:image/svg+xml'), `westernDishes500 id=${dish.id} '${dish.title}' resolved to offline cloche!`);
    assert(resolved.startsWith('https://'), `westernDishes500 id=${dish.id} '${dish.title}' URL is not HTTPS`);

    const clusterUrl = getDishImageUrl(dish.title, dish.category);
    assert(!isDeadOrPlaceholderUrl(clusterUrl), `westernDishes500 fallback id=${dish.id} returned dead/placeholder`);
    assert(!clusterUrl.startsWith('data:image/svg+xml'), `westernDishes500 fallback id=${dish.id} returned cloche`);
  }
  console.log(`         Audited ${count} westernDishes500 dishes successfully.`);
});

runTestCase('Suite 5: Catalog Audit', 'Specifically verify Western Omelette (western-bfast-433)', () => {
  const omeletteDish = westernDishes500.find(d => d.id === 'western-bfast-433');
  assert(!!omeletteDish, 'Must find western-bfast-433');
  
  assert(!omeletteDish!.imageUrl.includes('photo-1621996346565-e3d5d6281292'), 'western-bfast-433 must not contain dead 404 ID');
  
  const resolved = getDishImageUrl(omeletteDish!.title, omeletteDish!.category, omeletteDish!.imageUrl);
  assert(!isDeadOrPlaceholderUrl(resolved), 'western-bfast-433 resolved URL must be valid');
  assert(!resolved.startsWith('data:image/svg+xml'), 'western-bfast-433 must not show cloche');
  assert(FOOD_IMAGE_POOLS.trung_cuon_omelette.includes(resolved), 'Must resolve to genuine omelette pool');
});

// ============================================================================
// SUITE 6: ADVERSARIAL SEMANTIC ISOLATION & PURITY REGRESSION TESTS
// ============================================================================
console.log('\n--- SUITE 6: Adversarial Semantic Isolation & Purity Regressions ---');

runTestCase('Suite 6: Semantic Isolation', 'Caprese & Avocado Salads with Cheese & Butter must NOT resolve to Pho Bo', () => {
  const capreseSalads = [
    'Salad Cà Chua Phô Mai Caprese (Bơ Lạt Anchor Thơm Lừng)',
    'Salad Bơ Trái Cây Hạt Dinh Dưỡng (Sốt Phô Mai Béo Ngậy)',
    'Salad Bơ Trái Cây Hạt Dinh Dưỡng (Phô Mai Bột Parmesan)'
  ];

  for (const title of capreseSalads) {
    const cluster = resolveCulinaryCluster(title, 'mon-rau');
    assert(
      cluster !== 'pho_bo',
      `SEVERE SEMANTIC REGRESSION: '${title}' falsely mapped to Vietnamese Beef Noodle Soup ('pho_bo')! Expected 'salad_tay_caesar'`
    );
  }
});

runTestCase('Suite 6: Semantic Isolation', 'Bánh Mì Chảo with sausage must resolve to Bánh Mì, not American Hotdog', () => {
  const title = 'Bánh Mì Chảo Trứng Pate Xúc Xích';
  const cluster = resolveCulinaryCluster(title, 'an-sang');
  assert(
    cluster === 'banh_mi' || cluster === 'banh_mi_chao',
    `SEMANTIC COLLISION: '${title}' mapped to '${cluster}' (American hot dogs), expected 'banh_mi'`
  );
});

runTestCase('Suite 6: Semantic Isolation', 'Western Fish & Chips and Baked Salmon must NOT resolve to Vietnamese Cá Kho Tộ', () => {
  const westernFishDishes = [
    'Hải Sản Kiểu Âu: Cá Hồi Nauy Chiên Giòn Fish & Chips Kèm Sốt Tartar',
    'Hải Sản Kiểu Âu: Cá Tuyết / Basa Phi Lê Chiên Giòn Fish & Chips Kèm Sốt Tartar',
    'Cá Hồi Nướng Măng Tây'
  ];

  for (const title of westernFishDishes) {
    const cluster = resolveCulinaryCluster(title, 'mon-man');
    assert(
      cluster !== 'ca_kho_to',
      `WESTERN-VIETNAMESE COLLISION: '${title}' mapped to traditional Vietnamese claypot fish ('ca_kho_to'), expected 'seafood_western'`
    );
  }
});

runTestCase('Suite 6: Semantic Isolation', 'Viennese Schnitzel & Pulled Pork must NOT resolve to Vietnamese Thịt Kho Tàu', () => {
  const westernPork = [
    'Thịt Heo Kiểu Âu: Sườn Cây Heo Chiên Xù Kiểu Áo Viennese Schnitzel',
    'Thịt Heo Kiểu Âu: Thịt Cốt Lết Xé Sợi Pulled Pork Sốt Khói'
  ];

  for (const title of westernPork) {
    const cluster = resolveCulinaryCluster(title, 'mon-man');
    assert(
      cluster !== 'thit_kho_tau',
      `WESTERN-VIETNAMESE COLLISION: '${title}' mapped to Vietnamese caramelized pork belly ('thit_kho_tau'), expected 'bbq_ribs_roast'`
    );
  }
});

// ============================================================================
// FINAL SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log('                          HARNESS SUMMARY                             ');
console.log('======================================================================');

const total = testResults.length;
const passed = testResults.filter(r => r.passed).length;
const failed = testResults.filter(r => !r.passed).length;

console.log(`Total Scenarios: ${total}`);
console.log(`Passed:          ${passed}`);
console.log(`Failed:          ${failed}`);

if (failed > 0) {
  console.error('\nFAILURE DETAILS:');
  testResults.filter(r => !r.passed).forEach(r => {
    console.error(`- [${r.suite}] ${r.name}: ${r.error}`);
  });
  console.log('\nVERDICT: REJECT');
  process.exit(1);
} else {
  console.log('\nALL ADVERSARIAL STRESS CHALLENGES PASSED!');
  console.log('VERDICT: APPROVE');
  process.exit(0);
}
