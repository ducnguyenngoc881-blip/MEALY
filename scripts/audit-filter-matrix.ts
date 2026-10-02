import { extendedMealSets, newMealSets } from '../src/data/mockMealSets';
import { VietnameseMealSet } from '../src/types';
import { 
  matchesRegionFilter, 
  matchesTagFilter, 
  getRegionBadgeLabel 
} from '../src/components/MealSetExplorer';

export function getFilteredMealSets(
  mealSets: VietnameseMealSet[],
  regionFilter: 'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western',
  selectedTag: string,
  searchQuery: string = ''
): {
  strictMatches: VietnameseMealSet[];
  fallbackMatches: VietnameseMealSet[];
  combinedSets: VietnameseMealSet[];
} {
  const strictMatches = mealSets.filter(set => {
    return matchesRegionFilter(set, regionFilter) && matchesTagFilter(set, selectedTag);
  });

  if (searchQuery.trim() || strictMatches.length >= 5) {
    return {
      strictMatches,
      fallbackMatches: [],
      combinedSets: strictMatches
    };
  }

  const isVegetarianQuery = regionFilter === 'chay' || selectedTag === 'Ăn Chay' || selectedTag === 'Thanh Tịnh';
  const isWesternQuery = regionFilter === 'western';

  const seenIds = new Set(strictMatches.map(s => s.id));
  const fallbackMatches: VietnameseMealSet[] = [];

  if (regionFilter !== 'all') {
    // STRICT REGIONAL ISOLATION:
    // When a specific region is filtered, NEVER cross into other regions under any circumstances!
    // Fallbacks MUST come from the SAME region only!
    for (const set of mealSets) {
      if (strictMatches.length + fallbackMatches.length >= 5) break;
      if (seenIds.has(set.id)) continue;
      if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
      if (matchesRegionFilter(set, regionFilter)) {
        seenIds.add(set.id);
        fallbackMatches.push(set);
      }
    }
  } else {
    // When regionFilter === 'all':
    // Step 1: Same tag across regions / nationwide
    if (selectedTag !== 'Tất Cả') {
      for (const set of mealSets) {
        if (strictMatches.length + fallbackMatches.length >= 5) break;
        if (seenIds.has(set.id)) continue;
        if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
        if (matchesTagFilter(set, selectedTag)) {
          seenIds.add(set.id);
          fallbackMatches.push(set);
        }
      }
    }

    // Step 2: Global nationwide / popular sets
    for (const set of mealSets) {
      if (strictMatches.length + fallbackMatches.length >= 5) break;
      if (seenIds.has(set.id)) continue;
      if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
      if (isWesternQuery && !matchesRegionFilter(set, 'western')) continue;
      seenIds.add(set.id);
      fallbackMatches.push(set);
    }

    // Final safety: if somehow still < 5 and not vegetarian query, pad from remaining sets
    if (strictMatches.length + fallbackMatches.length < 5 && !isVegetarianQuery) {
      for (const set of mealSets) {
        if (strictMatches.length + fallbackMatches.length >= 5) break;
        if (!seenIds.has(set.id)) {
          seenIds.add(set.id);
          fallbackMatches.push(set);
        }
      }
    }
  }

  return {
    strictMatches,
    fallbackMatches,
    combinedSets: [...strictMatches, ...fallbackMatches]
  };
}

// Audit all 72 combinations (6 Regions x 12 Tags)
const REGIONS: Array<'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western'> = ['all', 'bac', 'trung', 'nam', 'chay', 'western'];
const TAGS = ['Tất Cả', 'Giàu Đạm', 'Eat Clean', '1 Người', 'Bán Chạy', 'Tiết Kiệm', 'Đổi Vị', 'Đồng Quê', 'Ăn Chay', 'Thanh Tịnh', 'Đậm Đà', 'Cay Nồng'];

console.log('AUDITING ALL 72 COMBINATIONS (6 Regions x 12 Tags) WITH STRICT REGIONAL ISOLATION:');
let passedCombos = 0;
let failedCombos = 0;
let dietaryViolations = 0;
let regionalViolations = 0;

for (const region of REGIONS) {
  for (const tag of TAGS) {
    const res = getFilteredMealSets(extendedMealSets, region, tag);
    if (res.combinedSets.length >= 5) {
      passedCombos++;
    } else {
      failedCombos++;
      console.error(`FAILED: ${region} + ${tag} only returned ${res.combinedSets.length} sets`);
    }

    // Verify strict regional isolation: NEVER show cross-region meals
    if (region !== 'all') {
      const wrongRegion = res.combinedSets.filter(s => !matchesRegionFilter(s, region));
      if (wrongRegion.length > 0) {
        regionalViolations++;
        console.error(`REGIONAL ISOLATION VIOLATION in ${region} + ${tag}: non-${region} sets returned:`, wrongRegion.map(s => `${s.id} (region=${s.region})`));
      }
    }

    // Verify dietary purity
    if (region === 'chay' || tag === 'Ăn Chay' || tag === 'Thanh Tịnh') {
      const nonVeg = res.combinedSets.filter(s => !matchesRegionFilter(s, 'chay'));
      if (nonVeg.length > 0) {
        dietaryViolations++;
        console.error(`DIETARY VIOLATION in ${region} + ${tag}: non-veg sets returned:`, nonVeg.map(s => s.id));
      }
    }
  }
}

console.log(`\nRESULTS: ${passedCombos} / 72 combinations returned >= 5 meal sets! (Failures: ${failedCombos})`);
console.log(`Regional Violations: ${regionalViolations}`);
console.log(`Dietary Violations: ${dietaryViolations}`);

// Explicitly audit the user's reported bug: Miền Bắc + Cay Nồng
console.log('\n--- VERIFYING USER BUG FIX: Region: Miền Bắc + Tag: Cay Nồng ---');
const userBugTest = getFilteredMealSets(extendedMealSets, 'bac', 'Cay Nồng');
console.log(`Strict matches count: ${userBugTest.strictMatches.length}`);
console.log(`Total displayed sets: ${userBugTest.combinedSets.length}`);

let crossRegionLeaked = false;
for (const s of userBugTest.combinedSets) {
  const isBac = matchesRegionFilter(s, 'bac');
  console.log(`  - [${s.region}] ${s.title}: Mặn="${s.mainDish.title}", Canh="${s.soupDish.title}", Rau="${s.sideDish.title}" (Cost: ${s.totalCostVnd.toLocaleString('vi-VN')}đ, Cal: ${s.totalCalories}kcal)`);
  if (!isBac) {
    crossRegionLeaked = true;
    console.error(`  --> LEAKED NON-NORTHERN SET: ${s.id}`);
  }
}

if (!crossRegionLeaked && userBugTest.combinedSets.length >= 5) {
  console.log('\nCONFIRMED: User bug 100% resolved. Miền Bắc + Cay Nồng returns strictly Northern meals, 0 Southern/Central dishes!');
} else {
  console.error('\nERROR: User bug still present!');
  process.exit(1);
}

if (failedCombos === 0 && dietaryViolations === 0 && regionalViolations === 0) {
  console.log('\n100% SUCCESS: Every single filter combination has at least 5 meal sets with ZERO regional or dietary violations!');
} else {
  process.exit(1);
}
