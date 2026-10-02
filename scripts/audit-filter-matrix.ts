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

  // Step 1: Same tag across other regions
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

  // Step 2: Same region with related tags
  if (regionFilter !== 'all') {
    for (const set of mealSets) {
      if (strictMatches.length + fallbackMatches.length >= 5) break;
      if (seenIds.has(set.id)) continue;
      if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
      if (matchesRegionFilter(set, regionFilter)) {
        seenIds.add(set.id);
        fallbackMatches.push(set);
      }
    }
  }

  // Step 3: Global nationwide / popular sets
  for (const set of mealSets) {
    if (strictMatches.length + fallbackMatches.length >= 5) break;
    if (seenIds.has(set.id)) continue;
    if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
    if (isWesternQuery && !matchesRegionFilter(set, 'western')) continue;
    seenIds.add(set.id);
    fallbackMatches.push(set);
  }

  if (strictMatches.length + fallbackMatches.length < 5 && !isVegetarianQuery) {
    for (const set of mealSets) {
      if (strictMatches.length + fallbackMatches.length >= 5) break;
      if (!seenIds.has(set.id)) {
        seenIds.add(set.id);
        fallbackMatches.push(set);
      }
    }
  }

  return {
    strictMatches,
    fallbackMatches,
    combinedSets: [...strictMatches, ...fallbackMatches]
  };
}

// Audit all 72 combinations
const REGIONS: Array<'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western'> = ['all', 'bac', 'trung', 'nam', 'chay', 'western'];
const TAGS = ['Tất Cả', 'Giàu Đạm', 'Eat Clean', '1 Người', 'Bán Chạy', 'Tiết Kiệm', 'Đổi Vị', 'Đồng Quê', 'Ăn Chay', 'Thanh Tịnh', 'Đậm Đà', 'Cay Nồng'];

console.log('AUDITING ALL 72 COMBINATIONS (6 Regions x 12 Tags):');
let passedCombos = 0;
let failedCombos = 0;
let dietaryViolations = 0;

for (const region of REGIONS) {
  for (const tag of TAGS) {
    const res = getFilteredMealSets(extendedMealSets, region, tag);
    if (res.combinedSets.length >= 5) {
      passedCombos++;
    } else {
      failedCombos++;
      console.error(`FAILED: ${region} + ${tag} only returned ${res.combinedSets.length} sets`);
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
console.log(`Dietary Violations: ${dietaryViolations}`);

if (failedCombos === 0 && dietaryViolations === 0) {
  console.log('100% SUCCESS: Every single filter combination has at least 5 meal sets with ZERO dietary violations!');
} else {
  process.exit(1);
}
