/**
 * ADVERSARIAL PURITY & REGRESSION STRESS HARNESS
 * Empirical Challenger: challenger_purity_regression
 * Milestone 3: Image Purity & Zero Regressions
 */

import { mockRecipes, INITIAL_RECIPES, LEFTOVER_RECIPES, WESTERN_RECIPES } from '../src/data/mockRecipes';
import { recipesDatabase } from '../src/data/recipesDatabase';
import { westernDishes500 } from '../src/data/westernDishes500';
import { mockMealSets } from '../src/data/mockMealSets';
import {
  getDishImageUrl,
  resolveCulinaryCluster,
  isDeadOrPlaceholderUrl,
  OVERUSED_PLACEHOLDER_IDS,
  CULINARY_82_POOLS,
  FOOD_IMAGE_POOLS,
} from '../src/utils/dishImageResolver';

interface AdversarialFailure {
  section: string;
  targetId: string;
  targetTitle: string;
  reason: string;
  value: string;
}

const failures: AdversarialFailure[] = [];
let totalAssertions = 0;

function assert(condition: boolean, section: string, targetId: string, targetTitle: string, reason: string, value: string = '') {
  totalAssertions++;
  if (!condition) {
    failures.push({ section, targetId, targetTitle, reason, value });
  }
}

const BLACKLISTED_IDS = [
  ...OVERUSED_PLACEHOLDER_IDS,
  'photo-1621996346565-e3d5d6281292',
  'photo-1621996346565-e3d5d6281744',
  'photo-1576107232684-1279f3908594',
  'photo-1627054234057-a41764661031',
  'photo-176107232684-1279f3908594',
  'photo-1573140247632-f8fd74997d5c', // Human face
];

const BURGER_PHOTO_ID = 'photo-1586190848861-99aa4a171e90';

console.log('\n======================================================================');
console.log('       EMPIRICAL CHALLENGER: ADVERSARIAL PURITY & REGRESSION STRESS     ');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// 1. EXHAUSTIVE STATIC IMAGE URL AUDIT ACROSS ALL DATASETS
// ----------------------------------------------------------------------------
console.log('[1/7] Auditing static URLs across all datasets...');

// 1.1 mockRecipes (all 1245)
assert(mockRecipes.length === 1245, 'Dataset Cardinality', 'mockRecipes', 'All Recipes', `Expected 1245, got ${mockRecipes.length}`, String(mockRecipes.length));

const seenRecipeIds = new Set<string>();
mockRecipes.forEach(r => {
  assert(!seenRecipeIds.has(r.id), 'ID Uniqueness', r.id, r.title, 'Duplicate recipe ID in mockRecipes', r.id);
  seenRecipeIds.add(r.id);

  assert(typeof r.imageUrl === 'string' && r.imageUrl.trim().length > 0, 'Static URL Non-Empty', r.id, r.title, 'Empty or non-string imageUrl', String(r.imageUrl));
  
  if (r.imageUrl) {
    assert(r.imageUrl.startsWith('https://images.unsplash.com/'), 'Valid Unsplash Domain', r.id, r.title, 'URL does not start with Unsplash CDN', r.imageUrl);
    assert(!r.imageUrl.startsWith('data:image/svg+xml'), 'No Offline Cloche', r.id, r.title, 'Static URL contains SVG cloche data URI', r.imageUrl);
    assert(!r.imageUrl.includes('Offline') && !r.imageUrl.includes('Ngoại Tuyến'), 'No Offline Label', r.id, r.title, 'Static URL contains offline label', r.imageUrl);

    for (const badId of BLACKLISTED_IDS) {
      assert(!r.imageUrl.includes(badId), 'Blacklisted / Overused ID Check', r.id, r.title, `Static URL contains blacklisted ID ${badId}`, r.imageUrl);
    }

    assert(!isDeadOrPlaceholderUrl(r.imageUrl), 'Pre-flight Validator Check', r.id, r.title, 'isDeadOrPlaceholderUrl returned true for static URL', r.imageUrl);

    // If recipe is not a burger dish, ensure it does not use burger photo
    const isBurgerDish = /burger|hamburger/i.test(r.title);
    if (!isBurgerDish) {
      assert(!r.imageUrl.includes(BURGER_PHOTO_ID), 'Contaminated Burger Photo', r.id, r.title, 'Non-burger dish assigned burger photo', r.imageUrl);
    }
  }
});

// 1.2 recipesDatabase (710)
assert(recipesDatabase.length === 710, 'Dataset Cardinality', 'recipesDatabase', 'recipesDatabase', `Expected 710, got ${recipesDatabase.length}`, String(recipesDatabase.length));
const seenDbIds = new Set<string>();
recipesDatabase.forEach(r => {
  assert(!seenDbIds.has(r.id), 'DB ID Uniqueness', r.id, r.title, 'Duplicate recipe ID in recipesDatabase', r.id);
  seenDbIds.add(r.id);

  if (r.imageUrl) {
    for (const badId of BLACKLISTED_IDS) {
      assert(!r.imageUrl.includes(badId), 'DB Blacklisted ID', r.id, r.title, `recipesDatabase contains badId ${badId}`, r.imageUrl);
    }
    assert(!isDeadOrPlaceholderUrl(r.imageUrl), 'DB isDead Check', r.id, r.title, 'recipesDatabase isDeadOrPlaceholderUrl returned true', r.imageUrl);
  }
});

// 1.3 westernDishes500 (500)
assert(westernDishes500.length === 500, 'Dataset Cardinality', 'westernDishes500', 'westernDishes500', `Expected 500, got ${westernDishes500.length}`, String(westernDishes500.length));
const seenWesternIds = new Set<string>();
westernDishes500.forEach(r => {
  assert(!seenWesternIds.has(r.id), 'Western ID Uniqueness', r.id, r.title, 'Duplicate recipe ID in westernDishes500', r.id);
  seenWesternIds.add(r.id);

  if (r.imageUrl) {
    for (const badId of BLACKLISTED_IDS) {
      assert(!r.imageUrl.includes(badId), 'Western Blacklisted ID', r.id, r.title, `westernDishes500 contains badId ${badId}`, r.imageUrl);
    }
    assert(!isDeadOrPlaceholderUrl(r.imageUrl), 'Western isDead Check', r.id, r.title, 'westernDishes500 isDeadOrPlaceholderUrl returned true', r.imageUrl);
    const isBurger = /burger|hamburger/i.test(r.title);
    if (!isBurger) {
      assert(!r.imageUrl.includes(BURGER_PHOTO_ID), 'Western Contaminated Burger Photo', r.id, r.title, 'Non-burger western dish assigned burger photo', r.imageUrl);
    }
  }
});

// 1.4 Subcollections: INITIAL_RECIPES, LEFTOVER_RECIPES, WESTERN_RECIPES
[...INITIAL_RECIPES, ...LEFTOVER_RECIPES, ...WESTERN_RECIPES].forEach(r => {
  if (r.imageUrl) {
    for (const badId of BLACKLISTED_IDS) {
      assert(!r.imageUrl.includes(badId), 'Subcollection Blacklisted ID', r.id, r.title, `Subcollection dish contains badId ${badId}`, r.imageUrl);
    }
    assert(!isDeadOrPlaceholderUrl(r.imageUrl), 'Subcollection isDead Check', r.id, r.title, 'Subcollection isDeadOrPlaceholderUrl returned true', r.imageUrl);
  }
});

// 1.5 mockMealSets (40 meal sets)
assert(mockMealSets.length === 40, 'Dataset Cardinality', 'mockMealSets', 'mockMealSets', `Expected 40, got ${mockMealSets.length}`, String(mockMealSets.length));
const seenMealSetIds = new Set<string>();
mockMealSets.forEach(ms => {
  assert(!seenMealSetIds.has(ms.id), 'MealSet ID Uniqueness', ms.id, ms.title, 'Duplicate meal set ID in mockMealSets', ms.id);
  seenMealSetIds.add(ms.id);

  assert(typeof ms.imageUrl === 'string' && ms.imageUrl.trim().length > 0, 'MealSet URL Non-Empty', ms.id, ms.title, 'Empty meal set imageUrl', String(ms.imageUrl));

  if (ms.imageUrl) {
    assert(ms.imageUrl.startsWith('https://images.unsplash.com/'), 'Valid Unsplash Domain', ms.id, ms.title, 'MealSet URL does not start with Unsplash', ms.imageUrl);
    assert(!ms.imageUrl.startsWith('data:image/svg+xml'), 'No Offline Cloche', ms.id, ms.title, 'MealSet URL contains SVG cloche data URI', ms.imageUrl);

    for (const badId of BLACKLISTED_IDS) {
      assert(!ms.imageUrl.includes(badId), 'MealSet Blacklisted ID', ms.id, ms.title, `MealSet contains badId ${badId}`, ms.imageUrl);
    }
    assert(!isDeadOrPlaceholderUrl(ms.imageUrl), 'MealSet isDead Check', ms.id, ms.title, 'MealSet isDeadOrPlaceholderUrl returned true', ms.imageUrl);
  }

  // Cross-reference: verify all 3 dishes in meal set exist in mockRecipes
  const setDishes = [ms.mainDish, ms.soupDish, ms.sideDish];
  setDishes.forEach(dish => {
    assert(dish && typeof dish.id === 'string', 'MealSet Dish Existence', ms.id, dish?.title || 'Unknown', 'Dish missing in meal set', '');
    const exists = mockRecipes.some(r => r.id === dish.id);
    assert(exists, 'MealSet Dish Reference Integrity', ms.id, dish.title, `Referenced dish ${dish.id} not found in mockRecipes`, dish.id);
  });
});

console.log(`✓ Completed static URL audits across 1,245 recipes & 40 meal sets. Total assertions: ${totalAssertions}`);

// ----------------------------------------------------------------------------
// 2. INTERNAL POOL PURITY (FOOD_IMAGE_POOLS & CULINARY_82_POOLS)
// ----------------------------------------------------------------------------
console.log('[2/7] Auditing internal culinary pools...');

const poolKeys = Object.keys(FOOD_IMAGE_POOLS);
assert(poolKeys.length >= 102, 'Pool Taxonomy Count', 'FOOD_IMAGE_POOLS', 'Taxonomy', `Expected >= 102 pools, got ${poolKeys.length}`, String(poolKeys.length));

const cluster82Keys = Object.keys(CULINARY_82_POOLS);
assert(cluster82Keys.length >= 82, 'Cluster 82 Count', 'CULINARY_82_POOLS', 'Taxonomy', `Expected >= 82 clusters, got ${cluster82Keys.length}`, String(cluster82Keys.length));

let totalPoolUrls = 0;
for (const [poolName, urls] of Object.entries(FOOD_IMAGE_POOLS)) {
  assert(urls.length >= 1, 'Non-Empty Pool', poolName, poolName, 'Pool has no URLs', String(urls.length));
  for (const url of urls) {
    totalPoolUrls++;
    assert(url.startsWith('https://images.unsplash.com/'), 'Pool URL Domain', poolName, poolName, 'Pool URL not Unsplash', url);
    assert(url.includes('auto=format') && url.includes('fit=crop'), 'Pool URL Crop Params', poolName, poolName, 'Pool URL missing crop params', url);
    assert(!url.startsWith('data:image/svg+xml'), 'No Cloche in Pool', poolName, poolName, 'Pool contains cloche SVG', url);

    for (const badId of BLACKLISTED_IDS) {
      assert(!url.includes(badId), 'Pool Blacklisted ID', poolName, poolName, `Pool ${poolName} contains badId ${badId}`, url);
    }

    if (poolName !== 'burger' && poolName !== 'fastfood_combo') {
      assert(!url.includes(BURGER_PHOTO_ID), 'Burger Contamination in Non-Burger Pool', poolName, poolName, `Non-burger pool ${poolName} contains burger photo`, url);
    }
  }
}
console.log(`✓ Audited ${poolKeys.length} pools and ${totalPoolUrls} total URLs. All clean.`);

// ----------------------------------------------------------------------------
// 3. RUNTIME DYNAMIC RESOLVER AUDIT (3-ARG, 2-ARG, 1-ARG RESOLUTION)
// ----------------------------------------------------------------------------
console.log('[3/7] Auditing runtime resolver across all 1,245 recipes in 3 modes...');

mockRecipes.forEach(r => {
  // Mode A: 3-arg (title, category, existingUrl)
  const resolvedA = getDishImageUrl(r.title, r.category, r.imageUrl);
  assert(typeof resolvedA === 'string' && resolvedA.length > 0, 'Resolver 3-arg non-empty', r.id, r.title, 'Resolved URL is empty', resolvedA);
  assert(resolvedA.startsWith('https://images.unsplash.com/'), 'Resolver 3-arg domain', r.id, r.title, 'Resolved URL not Unsplash', resolvedA);
  assert(!resolvedA.startsWith('data:image/svg+xml'), 'Resolver 3-arg no cloche', r.id, r.title, 'Resolved URL returned cloche SVG', resolvedA);
  assert(!resolvedA.includes('Offline') && !resolvedA.includes('Ngoại Tuyến'), 'Resolver 3-arg no offline label', r.id, r.title, 'Resolved URL returned offline label', resolvedA);
  for (const badId of BLACKLISTED_IDS) {
    assert(!resolvedA.includes(badId), 'Resolver 3-arg no badId', r.id, r.title, `Resolved URL contains badId ${badId}`, resolvedA);
  }

  // Mode B: 2-arg (title, category) - pure semantic resolution without fallback URL
  const resolvedB = getDishImageUrl(r.title, r.category);
  assert(typeof resolvedB === 'string' && resolvedB.length > 0, 'Resolver 2-arg non-empty', r.id, r.title, 'Pure semantic URL is empty', resolvedB);
  assert(resolvedB.startsWith('https://images.unsplash.com/'), 'Resolver 2-arg domain', r.id, r.title, 'Pure semantic URL not Unsplash', resolvedB);
  assert(!resolvedB.startsWith('data:image/svg+xml'), 'Resolver 2-arg no cloche', r.id, r.title, 'Pure semantic URL returned cloche SVG', resolvedB);
  for (const badId of BLACKLISTED_IDS) {
    assert(!resolvedB.includes(badId), 'Resolver 2-arg no badId', r.id, r.title, `Pure semantic URL contains badId ${badId}`, resolvedB);
  }

  // Mode C: 1-arg (title only)
  const resolvedC = getDishImageUrl(r.title);
  assert(typeof resolvedC === 'string' && resolvedC.length > 0, 'Resolver 1-arg non-empty', r.id, r.title, 'Pure title URL is empty', resolvedC);
  assert(resolvedC.startsWith('https://images.unsplash.com/'), 'Resolver 1-arg domain', r.id, r.title, 'Pure title URL not Unsplash', resolvedC);
  assert(!resolvedC.startsWith('data:image/svg+xml'), 'Resolver 1-arg no cloche', r.id, r.title, 'Pure title URL returned cloche SVG', resolvedC);
});

console.log(`✓ Audited 3,735 runtime resolution calls across all 1,245 recipes.`);

// ----------------------------------------------------------------------------
// 4. ADVERSARIAL STRESS TEST OF western-bfast-433
// ----------------------------------------------------------------------------
console.log('[4/7] Adversarially stress testing western-bfast-433 under permutations & poisoned inputs...');

const bfast433 = mockRecipes.find(r => r.id === 'western-bfast-433');
assert(bfast433 !== undefined, 'Target Dish Exists', 'western-bfast-433', 'Target Recipe', 'western-bfast-433 not found in mockRecipes', '');

if (bfast433) {
  // Check static properties
  assert(bfast433.title === 'Trứng Cuộn Omelette Xúc Xích Đức & Bánh Mì Bơ', 'Dish Title', bfast433.id, bfast433.title, 'Title mismatch', bfast433.title);
  assert(bfast433.imageUrl.includes('photo-1584776296944-ab6fb57b0bdd'), 'Static Omelette Photo', bfast433.id, bfast433.title, 'Static imageUrl does not contain authentic omelette photo', bfast433.imageUrl);
  assert(!bfast433.imageUrl.includes('photo-1621996346565-e3d5d6281292'), 'Static Dead URL Absent', bfast433.id, bfast433.title, 'Static imageUrl contains dead 404 URL', bfast433.imageUrl);
  assert(!bfast433.imageUrl.includes(BURGER_PHOTO_ID), 'Static Burger Photo Absent', bfast433.id, bfast433.title, 'Static imageUrl contains burger photo', bfast433.imageUrl);

  // Permutation 1: Title Variations (casing, accents, substrings)
  const titleVariations = [
    'Trứng Cuộn Omelette Xúc Xích Đức & Bánh Mì Bơ',
    'trứng cuộn omelette xúc xích đức & bánh mì bơ',
    'TRỨNG CUỘN OMELETTE XÚC XÍCH ĐỨC & BÁNH MÌ BƠ',
    'TrỨnG cUộN oMeLeTtE xÚc XíCh ĐứC & bÁnH mÌ bƠ',
    'trung cuon omelette xuc xich duc & banh mi bo',
    'TRUNG CUON OMELETTE XUC XICH DUC & BANH MI BO',
    'Trứng Cuộn Omelette',
    'Omelette Xúc Xích Đức',
    'Omelette Trứng Cuộn',
    'Trứng Omelette',
    'Trứng Cuộn Phô Mai Omelette',
    'Omelette',
  ];

  const categories = [
    'an-sang',
    'mon-chinh',
    'mon-man',
    'khai-vi',
    'an-vat',
    'western',
    'unknown-cat',
    '',
    undefined,
  ];

  for (const t of titleVariations) {
    for (const cat of categories) {
      const cluster = resolveCulinaryCluster(t, cat);
      const resolvedUrl = getDishImageUrl(t, cat);

      assert(
        cluster === 'trung_cuon_omelette',
        'Title Variation Cluster',
        'western-bfast-433',
        t,
        `Title variation resolved to unexpected cluster: ${cluster} (category: ${cat})`,
        cluster
      );

      assert(
        !resolvedUrl.includes(BURGER_PHOTO_ID),
        'Anti-Burger Invariant',
        'western-bfast-433',
        t,
        `Title variation resolved to burger photo! (category: ${cat})`,
        resolvedUrl
      );

      for (const badId of BLACKLISTED_IDS) {
        assert(!resolvedUrl.includes(badId), 'Permutation Bad ID', 'western-bfast-433', t, `Permutation resolved to blacklisted badId ${badId}`, resolvedUrl);
      }

      assert(!resolvedUrl.startsWith('data:image/svg+xml'), 'Permutation Cloche Free', 'western-bfast-433', t, 'Permutation resolved to cloche SVG', resolvedUrl);
    }
  }

  // Permutation 2: Poisoned Fallback URLs (Testing Fallback Resilience)
  const poisonedFallbacks = [
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281292', // dead URL
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281744', // dead URL
    'https://images.unsplash.com/photo-1540420773420-3366772f4999', // overused salad
    'https://images.unsplash.com/photo-1547592166-23ac45744acd', // overused soup
    'https://images.unsplash.com/photo-1574484284002-952d92456975', // overused bowl
    'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c', // human face
    'data:image/svg+xml;utf8,<svg>offline-cloche</svg>',             // SVG cloche
    '',                                                              // empty string
    '   ',                                                           // whitespace
    null as unknown as string,                                       // null
    undefined,                                                       // undefined
  ];

  for (const poisoned of poisonedFallbacks) {
    const safeResult = getDishImageUrl(bfast433.title, bfast433.category, poisoned);

    assert(
      typeof safeResult === 'string' && safeResult.startsWith('https://images.unsplash.com/'),
      'Poisoned Fallback Sanitization',
      'western-bfast-433',
      String(poisoned),
      'Resolver failed to discard poisoned fallback URL',
      safeResult
    );

    for (const badId of BLACKLISTED_IDS) {
      assert(
        !safeResult.includes(badId),
        'Poisoned Bad ID Leak',
        'western-bfast-433',
        String(poisoned),
        `Resolver leaked badId ${badId} from poisoned input`,
        safeResult
      );
    }

    assert(
      !safeResult.startsWith('data:image/svg+xml'),
      'Poisoned Cloche Leak',
      'western-bfast-433',
      String(poisoned),
      'Resolver leaked SVG cloche from poisoned input',
      safeResult
    );

    assert(
      !safeResult.includes(BURGER_PHOTO_ID),
      'Poisoned Burger Leak',
      'western-bfast-433',
      String(poisoned),
      'Resolver returned burger photo on omelette',
      safeResult
    );
  }
}

console.log(`✓ western-bfast-433 successfully withstood all permutations, category sweeps, and poisoned fallbacks.`);

// ----------------------------------------------------------------------------
// 5. PHOTO FREQUENCY & SATURATION ANALYSIS
// ----------------------------------------------------------------------------
console.log('[5/7] Analyzing photo ID distribution and saturation across catalog...');

const photoFreq = new Map<string, number>();
mockRecipes.forEach(r => {
  const match = r.imageUrl?.match(/photo-[a-zA-Z0-9-]+/);
  const id = match ? match[0] : 'no_photo_id';
  photoFreq.set(id, (photoFreq.get(id) || 0) + 1);
});

const sortedFreq = [...photoFreq.entries()].sort((a, b) => b[1] - a[1]);
console.log(`  Total unique photo IDs in catalog: ${sortedFreq.length}`);
console.log(`  Top 5 most frequent photos:`);
sortedFreq.slice(0, 5).forEach(([id, cnt]) => console.log(`    ${id}: ${cnt} recipes`));

// Invariant: No single photo should exceed 100 occurrences in a healthy 1,245 recipe catalog
sortedFreq.forEach(([id, cnt]) => {
  assert(cnt <= 100, 'Photo Over-saturation', id, 'Photo Frequency', `Photo ${id} is over-saturated with ${cnt} usages (threshold: 100)`, String(cnt));
});

// ----------------------------------------------------------------------------
// 5. SEMANTIC DISAMBIGUATION & HOMOGRAPH STRESS MATRIX
// ----------------------------------------------------------------------------
console.log('[5/7] Testing semantic disambiguation & homographs...');

const disambiguationCases: { title: string; expected?: string; forbidden: string[] }[] = [
  // Cà chua & Cà tím must never resolve to fish or meat
  { title: 'Đậu Phụ Sốt Cà Chua', expected: 'dau_sot_ca_chua', forbidden: ['ca_kho_to', 'fish_seafood', 'thit_kho_tau'] },
  { title: 'Cà Tím Nướng Mỡ Hành', forbidden: ['ca_kho_to', 'fish_seafood'] },
  { title: 'Cà Tím Xào Thịt Băm', forbidden: ['ca_kho_to', 'fish_seafood'] },
  // Canh chua must resolve to soup / sour soup, never steak or fried
  { title: 'Canh Chua Cá Hồi Nấu Thơm', expected: 'canh_chua', forbidden: ['steak_beef', 'fried_chicken', 'burger'] },
  { title: 'Canh Cua Mồng Tơi Mướp', expected: 'canh_cua_rau_day', forbidden: ['ca_kho_to', 'burger'] },
  // Thịt kho tàu must resolve to braised pork, never dessert or drink
  { title: 'Thịt Kho Tàu Nước Dừa Trứng Cút', expected: 'thit_kho_tau', forbidden: ['che_viet_dessert', 'tra_sua_boba'] },
  // Beefsteak vs Burger
  { title: 'Bò Bít Tết Sốt Tiêu Đen Thảo Mộc', expected: 'steak_beef', forbidden: ['burger', 'fried_chicken'] },
  { title: 'Ribeye Steak Áp Chảo Bơ Tỏi', expected: 'steak_beef', forbidden: ['burger'] },
  // Pasta vs Burger
  { title: 'Mì Ý Spaghetti Bò Bằm Sốt Cà Chua', expected: 'my_y_pasta', forbidden: ['burger', 'ca_kho_to'] },
  // Salad vs Soup
  { title: 'Caesar Salad Lườn Gà Parmesan', expected: 'salad_tay_caesar', forbidden: ['sup_kem_tay_chowder', 'canh_chua'] },
  // Clam chowder vs Clear broth
  { title: 'Súp Nghêu Clam Chowder Kiểu Boston', expected: 'sup_kem_tay_chowder', forbidden: ['burger', 'mon_nuoc_pho'] },
];

for (const c of disambiguationCases) {
  const cluster = resolveCulinaryCluster(c.title);
  const resolvedUrl = getDishImageUrl(c.title);

  if (c.expected) {
    assert(
      cluster === c.expected,
      'Semantic Homograph Disambiguation',
      c.title,
      c.title,
      `Expected cluster ${c.expected}, got ${cluster}`,
      cluster
    );
  }

  for (const f of c.forbidden) {
    const forbiddenUrls = FOOD_IMAGE_POOLS[f] || [];
    assert(
      !forbiddenUrls.includes(resolvedUrl),
      'Forbidden Semantic Pool Leak',
      c.title,
      c.title,
      `Dish resolved to photo from forbidden pool ${f}!`,
      resolvedUrl
    );
  }
}

// Hostile/dirty inputs resilience
const hostileInputs = [
  '',
  '   ',
  '1234567890',
  '!@#$%^&*()_+{}[]:;"\'|<>,.?/',
  '<script>alert("xss")</script>',
  'A'.repeat(500),
  'Món Ăn Quái Lạ Không Có Trong Từ Điển ABCD XYZ 9999',
];

for (const h of hostileInputs) {
  try {
    const resUrl = getDishImageUrl(h);
    assert(
      typeof resUrl === 'string' && resUrl.startsWith('https://images.unsplash.com/'),
      'Hostile Input Graceful Fallback',
      'Hostile',
      h.slice(0, 30),
      'Resolver crashed or returned non-Unsplash URL on hostile input',
      resUrl
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    assert(false, 'Hostile Input Exception', 'Hostile', h.slice(0, 30), `Resolver threw exception on hostile input: ${errorMsg}`, errorMsg);
  }
}

console.log(`✓ Semantic disambiguation & hostile resilience passed 100%.`);

// ----------------------------------------------------------------------------
// 6. RECIPE CULINARY INTEGRITY (NATURAL UNITS & 4-STEP INSTRUCTIONS)
// ----------------------------------------------------------------------------
console.log('[6/7] Auditing recipe culinary integrity (R1-R4)...');

const packagingRegex = /\b(\d+(\.\d+)?\s*(chai|lon|hộp|gói|vỉ|bịch|lốc|thùng|bọc))\b/i;

mockRecipes.forEach(r => {
  // Check ingredient units
  assert(r.ingredients && r.ingredients.length > 0, 'Non-empty Ingredients', r.id, r.title, 'Recipe has 0 ingredients', '');
  
  if (r.ingredients) {
    r.ingredients.forEach(ing => {
      assert(ing.name.trim().length > 0, 'Ingredient Name', r.id, r.title, 'Empty ingredient name', ing.name);
      assert(ing.unit.trim().length > 0, 'Ingredient Unit', r.id, r.title, 'Empty ingredient unit', ing.unit);
      assert(!packagingRegex.test(ing.unit), 'No Packaging Units', r.id, r.title, `Unnatural packaging unit: ${ing.unit}`, ing.unit);
    });
  }

  // Check 4-step instructions
  assert(r.instructions && r.instructions.length >= 4, '4-Step Instructions', r.id, r.title, `Expected >= 4 steps, got ${r.instructions?.length}`, String(r.instructions?.length));

  if (r.instructions) {
    r.instructions.forEach((st, idx) => {
      assert(st.step === idx + 1, 'Step Number Sequence', r.id, r.title, `Step number out of order at idx ${idx}`, String(st.step));
      assert(st.title.trim().length > 0, 'Step Title', r.id, r.title, `Empty step title at step ${idx + 1}`, st.title);
      assert(st.content.trim().length > 15, 'Actionable Step Content', r.id, r.title, `Step content too short at step ${idx + 1}`, st.content);
    });
  }

  // Check chef tip
  assert(typeof r.chefTip === 'string' && r.chefTip.trim().length > 15, 'Chef Tip Present', r.id, r.title, 'Missing or trivial chefTip', String(r.chefTip));
});

console.log(`✓ Recipe culinary integrity verified across all 1,245 recipes.`);

// ----------------------------------------------------------------------------
// 7. DEV SERVER HEALTH CHECK (HTTP 200)
// ----------------------------------------------------------------------------
console.log('[7/7] Checking live development server (http://localhost:5173/)...');

async function checkDevServer() {
  try {
    const res = await fetch('http://localhost:5173/');
    assert(res.status === 200, 'Dev Server Health', 'localhost:5173', 'Dev Server', `Expected HTTP 200, got ${res.status}`, String(res.status));
    console.log(`✓ Live dev server responded with HTTP ${res.status}.`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    assert(false, 'Dev Server Health', 'localhost:5173', 'Dev Server', `Failed to connect to dev server: ${errorMsg}`, errorMsg);
  }

  // --------------------------------------------------------------------------
  // SUMMARY AND VERDICT
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('                 ADVERSARIAL CHALLENGE EXECUTION SUMMARY               ');
  console.log('======================================================================');
  console.log(`Total Programmatic Assertions: ${totalAssertions}`);
  console.log(`Total Violations / Regressions: ${failures.length}`);

  if (failures.length > 0) {
    console.log('\n[CRITICAL FAILURE LIST]');
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.section}] Target: ${f.targetId} (${f.targetTitle})`);
      console.log(`     Reason: ${f.reason} | Value: ${f.value}`);
    });
    console.log('\nVERDICT: REJECT ❌');
    process.exit(1);
  } else {
    console.log('\nAll 7 challenge specifications PASSED with 0 regressions and 0 violations.');
    console.log('VERDICT: APPROVE ✅');
    process.exit(0);
  }
}

checkDevServer();
