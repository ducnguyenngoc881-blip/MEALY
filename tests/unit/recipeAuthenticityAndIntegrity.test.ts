import { describe, it, expect } from '../helpers/testRunner';
import { 
  mockRecipes, 
  INITIAL_RECIPES, 
  LEFTOVER_RECIPES, 
  WESTERN_RECIPES, 
  recipesDatabase, 
  westernDishes500 
} from '../../src/data/mockRecipes';
import { Recipe, Ingredient, CookingInstruction } from '../../src/types';
import { 
  getDishImageUrl, 
  resolveCulinaryCluster,
  OVERUSED_PLACEHOLDER_IDS, 
  isDeadOrPlaceholderUrl 
} from '../../src/utils/dishImageResolver';
import { mockMealSets } from '../../src/data/mockMealSets';

// ============================================================================
// HELPER FUNCTIONS & LOGIC UNDER TEST
// ============================================================================

/**
 * Format scaled ingredient amount mirroring RecipeDetailModal implementation.
 */
export function formatScaledAmount(amount: number | string, currentServings: number, baseServings: number): string {
  if (baseServings <= 0) return String(amount);
  const ratio = currentServings / baseServings;

  if (typeof amount === 'number') {
    const scaled = amount * ratio;
    if (Number.isInteger(scaled)) {
      return scaled.toString();
    }
    const rounded = Math.round(scaled * 100) / 100;
    return rounded.toString().replace('.', ',');
  }

  const str = String(amount).trim();

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0].trim());
      const den = parseFloat(parts[1].trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        const scaled = (num / den) * ratio;
        if (Number.isInteger(scaled)) {
          return scaled.toString();
        }
        const rounded = Math.round(scaled * 100) / 100;
        return rounded.toString().replace('.', ',');
      }
    }
  }

  const parsed = parseFloat(str.replace(',', '.'));
  if (!isNaN(parsed) && isFinite(parsed)) {
    const scaled = parsed * ratio;
    if (Number.isInteger(scaled)) {
      return scaled.toString();
    }
    const rounded = Math.round(scaled * 100) / 100;
    return rounded.toString().replace('.', ',');
  }

  return str;
}

export interface CategorizedGroup {
  key: 'thit-ca' | 'rau-cu' | 'gia-vi';
  title: string;
  badgeLabel: string;
  items: { ingredient: Ingredient; originalIndex: number }[];
}

/**
 * Categorize ingredient list into clean visual sections mirroring RecipeDetailModal.
 */
export function categorizeIngredients(ingredients: Ingredient[]): CategorizedGroup[] {
  if (!ingredients || !Array.isArray(ingredients)) return [];

  const groups: Record<'thit-ca' | 'rau-cu' | 'gia-vi', { ingredient: Ingredient; originalIndex: number }[]> = {
    'thit-ca': [],
    'rau-cu': [],
    'gia-vi': []
  };

  ingredients.forEach((ing, originalIndex) => {
    const cat = ing.category;
    if (cat === 'rau-cu') {
      groups['rau-cu'].push({ ingredient: ing, originalIndex });
    } else if (cat === 'gia-vi' || cat === 'do-kho') {
      groups['gia-vi'].push({ ingredient: ing, originalIndex });
    } else if (cat === 'thit-ca') {
      groups['thit-ca'].push({ ingredient: ing, originalIndex });
    } else {
      // Fallback heuristic based on common Vietnamese culinary keywords
      const lower = (ing.name || '').toLowerCase();
      if (/rau|cải|cà chua|dưa|nấm|hành|tỏi|ớt|gừng|sả|chanh|mướp|bầu|bí|giá|ngò|thì là|chuối|đậu bắp|đậu cô ve|bắp/.test(lower)) {
        groups['rau-cu'].push({ ingredient: ing, originalIndex });
      } else if (/nước mắm|nước tương|muối|tiêu|đường|hạt nêm|mì chính|bột ngọt|dầu|dầu hào|giấm|rượu|sa tế|ngũ vị|bột|mắm|tương|mè|vừng|quế|hồi/.test(lower)) {
        groups['gia-vi'].push({ ingredient: ing, originalIndex });
      } else {
        groups['thit-ca'].push({ ingredient: ing, originalIndex });
      }
    }
  });

  const result: CategorizedGroup[] = [];

  if (groups['thit-ca'].length > 0) {
    result.push({
      key: 'thit-ca',
      title: 'Nguyên liệu chính',
      badgeLabel: 'Đạm & Cốt lõi',
      items: groups['thit-ca']
    });
  }

  if (groups['rau-cu'].length > 0) {
    result.push({
      key: 'rau-cu',
      title: 'Rau củ',
      badgeLabel: 'Rau củ tươi',
      items: groups['rau-cu']
    });
  }

  if (groups['gia-vi'].length > 0) {
    result.push({
      key: 'gia-vi',
      title: 'Gia vị & Ướp',
      badgeLabel: 'Gia vị & Đồ ướp',
      items: groups['gia-vi']
    });
  }

  return result;
}

// Prohibited retail packaging units
export const PROHIBITED_PACKAGING_SUBSTRINGS = [
  'chai (1L)', 'chai (500ml)', 'chai (700ml)', 'chai (250ml)', 'chai (250g)', 'chai (240g)', 'chai (300g)', 'chai (200g)',
  'vỉ (10 quả)', 'vỉ (30 quả)', 'lốc (4 hộp)', 'lốc (6 lon)', 'hũ (100g)', 'hũ (250g)', 'hũ (350g)', 'hộp (300g)', 'hộp (1L)',
  'hộp (200g)', 'hộp (250ml)', 'hộp (500g)', 'hộp (198g)', 'lon (400ml)', 'gói (150g)', 'gói (500g)', 'gói (250g)', 'gói (200g)',
  'gói (100g)', 'gói (10g)', 'gói (50g)', 'gói (12 lát / 200g)', 'gói nhỏ', 'túi (4 cái)', 'túi (6 cái)', 'ml/g'
];

// Helper to check packaging violation
export function checkIngredientPackagingViolation(ing: Ingredient): string | null {
  const unitLower = (ing.unit || '').toLowerCase();

  for (const prohibited of PROHIBITED_PACKAGING_SUBSTRINGS) {
    if (unitLower.includes(prohibited.toLowerCase())) {
      return `Prohibited retail packaging unit: "${ing.unit}" contains "${prohibited}"`;
    }
  }

  // Fractional packaging unit check (< 0.1 or < 1 with retail container words)
  if (ing.amount < 0.1 && (unitLower.includes('chai') || unitLower.includes('hộp') || unitLower.includes('gói') || unitLower.includes('vỉ'))) {
    return `Fractional packaging amount (< 0.1): ${ing.amount} ${ing.unit}`;
  }

  if (ing.amount < 1 && (unitLower.includes('vỉ') || unitLower.includes('lốc'))) {
    return `Fractional pack packaging amount (< 1): ${ing.amount} ${ing.unit}`;
  }

  return null;
}

// ============================================================================
// TEST SUITE: Unit: Recipe Authenticity, Culinary Integrity & Scaling Invariants
// ============================================================================

describe('Unit: Recipe Authenticity, Culinary Integrity & Scaling Invariants (Domain 5)', () => {

  // --------------------------------------------------------------------------
  // Test 1: Zero retail packaging fraction units across all active recipes
  // --------------------------------------------------------------------------
  it('should have zero retail packaging fraction units across all 1,245 recipes in mockRecipes (Test 1)', () => {
    expect(mockRecipes.length).toBe(1245);

    const violations: { recipeId: string; ingredient: string; reason: string }[] = [];

    mockRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const violationReason = checkIngredientPackagingViolation(ing);
        if (violationReason) {
          violations.push({
            recipeId: recipe.id,
            ingredient: `${ing.name} (${ing.amount} ${ing.unit})`,
            reason: violationReason
          });
        }
      });
    });

    // Zero packaging violations across all 1,245 recipes
    expect(violations.length).toBe(0);

    // Adversarial verification: Confirm validator flags synthetic bad units
    const badSample1: Ingredient = { name: 'Nước mắm Nam Ngư', amount: 0.04, unit: 'chai (1L)' };
    const badSample2: Ingredient = { name: 'Trứng gà Ba Huân', amount: 0.6, unit: 'vỉ (10 quả)' };
    const goodSample: Ingredient = { name: 'Nước mắm ngon', amount: 2, unit: 'muỗng canh' };

    expect(checkIngredientPackagingViolation(badSample1)).not.toBeNull();
    expect(checkIngredientPackagingViolation(badSample2)).not.toBeNull();
    expect(checkIngredientPackagingViolation(goodSample)).toBeNull();
  });

  // --------------------------------------------------------------------------
  // Test 2: 100% of recipes have at least 4 pedagogical steps with non-generic titles
  // --------------------------------------------------------------------------
  it('should ensure 100% of recipes have at least 4 pedagogical steps with non-generic titles and descriptive content (Test 2)', () => {
    let shortStepCount = 0;
    let genericTitleCount = 0;
    let shortContentCount = 0;

    mockRecipes.forEach(recipe => {
      // Step count invariant: >= 4 steps
      if (!recipe.instructions || recipe.instructions.length < 4) {
        shortStepCount++;
      }

      recipe.instructions.forEach(step => {
        // Non-generic title check: not just "Bước 1", "Bước 2", etc.
        const isGenericTitle = /^bước\s*\d+\s*$/i.test(step.title.trim());
        if (isGenericTitle || step.title.trim().length < 5) {
          genericTitleCount++;
        }

        // Actionable content check: >= 15 characters
        if (!step.content || step.content.trim().length < 15) {
          shortContentCount++;
        }
      });
    });

    expect(shortStepCount).toBe(0);
    expect(genericTitleCount).toBe(0);
    expect(shortContentCount).toBe(0);

    // Verify INITIAL_RECIPES strictly implement standard 4-step sequence
    INITIAL_RECIPES.forEach(recipe => {
      expect(recipe.instructions.length).toBeGreaterThanOrEqual(4);
      expect(recipe.instructions[0].step).toBe(1);
      expect(recipe.instructions[1].step).toBe(2);
      expect(recipe.instructions[2].step).toBe(3);
      expect(recipe.instructions[3].step).toBe(4);

      // Verify presence of step tips, duration, or heat level on core recipes
      const hasDetailedMeta = recipe.instructions.some(i => i.tip || i.durationMinutes || i.heatLevel);
      expect(hasDetailedMeta).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Test 3: 100% of recipes contain an actionable, non-empty chefTip (>= 15 characters)
  // --------------------------------------------------------------------------
  it('should verify 100% of recipes contain an actionable, non-empty chefTip >= 15 characters (Test 3)', () => {
    let missingChefTipCount = 0;
    let totalLength = 0;

    mockRecipes.forEach(recipe => {
      if (!recipe.chefTip || typeof recipe.chefTip !== 'string' || recipe.chefTip.trim().length < 15) {
        missingChefTipCount++;
      } else {
        totalLength += recipe.chefTip.trim().length;
      }
    });

    expect(missingChefTipCount).toBe(0);

    // Catalog average chefTip length exceeds 30 characters
    const averageLength = totalLength / mockRecipes.length;
    expect(averageLength).toBeGreaterThan(30);

    // Verify chef tips on core recipes contain authentic culinary techniques
    const coreWithChefSecret = INITIAL_RECIPES.filter(r => 
      r.chefTip?.toLowerCase().includes('bí quyết') || 
      r.chefTip?.toLowerCase().includes('lửa') ||
      r.chefTip?.toLowerCase().includes('nấu')
    );
    expect(coreWithChefSecret.length).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // Test 4: Servings scaling invariant across 1 to 20 portions preserving natural units and clean numbers
  // --------------------------------------------------------------------------
  it('should verify servings scaling invariants across 1 to 20 portions with zero NaN/Infinity (Test 4)', () => {
    let nanOrInfinityCount = 0;
    let emptyScaledStringCount = 0;
    let invalidCostCalCount = 0;

    // Test a broad representative sample across all categories and pools
    // 35 core recipes + 50 sample database recipes + 50 western recipes = 135 recipes
    const sampleRecipes = [
      ...INITIAL_RECIPES,
      ...LEFTOVER_RECIPES,
      ...WESTERN_RECIPES,
      ...recipesDatabase.slice(0, 50),
      ...westernDishes500.slice(0, 50)
    ];

    expect(sampleRecipes.length).toBeGreaterThanOrEqual(135);

    // Sweep servings from 1 to 20 portions
    for (let servings = 1; servings <= 20; servings++) {
      for (const recipe of sampleRecipes) {
        const baseServings = recipe.servings || 4;

        // Scaled cost and calories invariants
        const scaledCost = Math.round(((recipe.estimatedCostVnd || 30000) * servings) / baseServings);
        const scaledCal = Math.round(((recipe.calories || 400) * servings) / baseServings);

        if (isNaN(scaledCost) || !isFinite(scaledCost) || scaledCost < 0 ||
            isNaN(scaledCal) || !isFinite(scaledCal) || scaledCal < 0) {
          invalidCostCalCount++;
        }

        // Scaled ingredient amounts invariants
        for (const ing of recipe.ingredients) {
          const scaledStr = formatScaledAmount(ing.amount, servings, baseServings);

          if (!scaledStr || scaledStr.trim() === '') {
            emptyScaledStringCount++;
          }

          if (scaledStr.includes('NaN') || scaledStr.includes('Infinity') || scaledStr.includes('undefined')) {
            nanOrInfinityCount++;
          }
        }
      }
    }

    expect(nanOrInfinityCount).toBe(0);
    expect(emptyScaledStringCount).toBe(0);
    expect(invalidCostCalCount).toBe(0);

    // Specific boundary mathematical assertions on core recipe
    const testRecipe = INITIAL_RECIPES[0]; // Thịt ba chỉ rang cháy cạnh (base: 4 servings, 500g)
    expect(formatScaledAmount(500, 1, 4)).toBe('125');
    expect(formatScaledAmount(500, 2, 4)).toBe('250');
    expect(formatScaledAmount(500, 4, 4)).toBe('500');
    expect(formatScaledAmount(500, 8, 4)).toBe('1000');
    expect(formatScaledAmount(500, 20, 4)).toBe('2500');

    // Fractional amount scaling with comma formatting
    expect(formatScaledAmount(1, 2, 4)).toBe('0,5');
    expect(formatScaledAmount(3, 2, 4)).toBe('1,5');
    expect(formatScaledAmount('1/2', 4, 4)).toBe('0,5');
    expect(formatScaledAmount('1/2', 8, 4)).toBe('1');
    expect(formatScaledAmount('ít', 20, 4)).toBe('ít');
    expect(formatScaledAmount('vừa đủ', 1, 4)).toBe('vừa đủ');
  });

  // --------------------------------------------------------------------------
  // Test 5: Ingredient categorization mapping correctly maps categories
  // --------------------------------------------------------------------------
  it('should correctly map ingredient categories into Nguyên liệu chính, Rau củ, and Gia vị & Ướp (Test 5)', () => {
    // 1. Direct Category Mapping Assertions
    const sampleIngredients: Ingredient[] = [
      { name: 'Thịt ba chỉ rút sườn', amount: 500, unit: 'g', category: 'thit-ca' },
      { name: 'Cá hồi fillet tươi', amount: 300, unit: 'g', category: 'thit-ca' },
      { name: 'Rau muống non', amount: 1, unit: 'bó', category: 'rau-cu' },
      { name: 'Cà chua chín mọng', amount: 3, unit: 'quả', category: 'rau-cu' },
      { name: 'Nước mắm truyền thống', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      { name: 'Hạt tiêu đen xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
      { name: 'Mì Ý Spaghetti khô', amount: 200, unit: 'g', category: 'do-kho' }
    ];

    const groups = categorizeIngredients(sampleIngredients);

    expect(groups.length).toBe(3);

    const mainGroup = groups.find(g => g.key === 'thit-ca');
    const vegGroup = groups.find(g => g.key === 'rau-cu');
    const spiceGroup = groups.find(g => g.key === 'gia-vi');

    expect(mainGroup).toBeDefined();
    expect(mainGroup?.title).toBe('Nguyên liệu chính');
    expect(mainGroup?.items.length).toBe(2);
    expect(mainGroup?.items.map(i => i.ingredient.name)).toContain('Thịt ba chỉ rút sườn');
    expect(mainGroup?.items.map(i => i.ingredient.name)).toContain('Cá hồi fillet tươi');

    expect(vegGroup).toBeDefined();
    expect(vegGroup?.title).toBe('Rau củ');
    expect(vegGroup?.items.length).toBe(2);
    expect(vegGroup?.items.map(i => i.ingredient.name)).toContain('Rau muống non');
    expect(vegGroup?.items.map(i => i.ingredient.name)).toContain('Cà chua chín mọng');

    expect(spiceGroup).toBeDefined();
    expect(spiceGroup?.title).toBe('Gia vị & Ướp');
    expect(spiceGroup?.items.length).toBe(3); // 2 gia-vi + 1 do-kho
    expect(spiceGroup?.items.map(i => i.ingredient.name)).toContain('Nước mắm truyền thống');
    expect(spiceGroup?.items.map(i => i.ingredient.name)).toContain('Mì Ý Spaghetti khô');

    // 2. Total Ingredient Invariant: zero dropped, zero duplicated across core recipes
    [...INITIAL_RECIPES, ...LEFTOVER_RECIPES, ...WESTERN_RECIPES].forEach(recipe => {
      const categorized = categorizeIngredients(recipe.ingredients);
      const totalCategorizedItems = categorized.reduce((sum, g) => sum + g.items.length, 0);

      expect(totalCategorizedItems).toBe(recipe.ingredients.length);

      // Verify each group has valid key and title
      categorized.forEach(g => {
        expect(['thit-ca', 'rau-cu', 'gia-vi']).toContain(g.key);
        expect(['Nguyên liệu chính', 'Rau củ', 'Gia vị & Ướp']).toContain(g.title);
        expect(g.items.length).toBeGreaterThan(0);
      });
    });

    // 3. Fallback Heuristic Verification for Untagged / Unknown Category
    const untaggedIngredients: Ingredient[] = [
      { name: 'Nấm đùi gà tươi', amount: 200, unit: 'g' } as any,
      { name: 'Dầu hào thơm ngon', amount: 1, unit: 'muỗng canh' } as any,
      { name: 'Sườn heo non mềm', amount: 400, unit: 'g' } as any
    ];

    const fallbackGroups = categorizeIngredients(untaggedIngredients);
    expect(fallbackGroups.some(g => g.key === 'rau-cu' && g.items.some(i => i.ingredient.name.includes('Nấm')))).toBe(true);
    expect(fallbackGroups.some(g => g.key === 'gia-vi' && g.items.some(i => i.ingredient.name.includes('Dầu hào')))).toBe(true);
    expect(fallbackGroups.some(g => g.key === 'thit-ca' && g.items.some(i => i.ingredient.name.includes('Sườn')))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Test 6: Zero null or empty ingredient arrays, zero null or empty instruction arrays
  // --------------------------------------------------------------------------
  it('should ensure zero null or empty ingredient/instruction arrays across the entire database (Test 6)', () => {
    // Check total dataset and individual dataset partitions
    expect(mockRecipes.length).toBe(1245);
    expect(INITIAL_RECIPES.length).toBe(13);
    expect(LEFTOVER_RECIPES.length).toBe(5);
    expect(WESTERN_RECIPES.length).toBe(17);
    expect(recipesDatabase.length).toBe(710);
    expect(westernDishes500.length).toBe(500);

    let emptyIngredientRecipeCount = 0;
    let emptyInstructionRecipeCount = 0;
    let invalidIngredientFieldCount = 0;
    let invalidInstructionFieldCount = 0;

    mockRecipes.forEach(recipe => {
      // Ingredients array validation
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        emptyIngredientRecipeCount++;
      } else {
        recipe.ingredients.forEach(ing => {
          if (!ing.name || typeof ing.name !== 'string' || ing.name.trim().length === 0 ||
              typeof ing.amount !== 'number' || isNaN(ing.amount) || ing.amount <= 0 ||
              !ing.unit || typeof ing.unit !== 'string' || ing.unit.trim().length === 0) {
            invalidIngredientFieldCount++;
          }
        });
      }

      // Instructions array validation
      if (!recipe.instructions || !Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
        emptyInstructionRecipeCount++;
      } else {
        recipe.instructions.forEach(step => {
          if (typeof step.step !== 'number' || step.step <= 0 ||
              !step.title || typeof step.title !== 'string' || step.title.trim().length === 0 ||
              !step.content || typeof step.content !== 'string' || step.content.trim().length === 0) {
            invalidInstructionFieldCount++;
          }
        });
      }
    });

    expect(emptyIngredientRecipeCount).toBe(0);
    expect(emptyInstructionRecipeCount).toBe(0);
    expect(invalidIngredientFieldCount).toBe(0);
    expect(invalidInstructionFieldCount).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Test 7: Adversarial Edge Cases: Base Servings <= 0, Malformed Fractions, Bounds
  // --------------------------------------------------------------------------
  it('should handle adversarial scaling inputs, zero base servings, and malformed strings gracefully (Test 7)', () => {
    // Base servings <= 0 should safely return original string representation
    expect(formatScaledAmount(500, 4, 0)).toBe('500');
    expect(formatScaledAmount(500, 4, -2)).toBe('500');

    // Malformed fraction string should return as-is
    expect(formatScaledAmount('abc/def', 4, 4)).toBe('abc/def');
    expect(formatScaledAmount('foo/bar', 4, 4)).toBe('foo/bar');

    // Clean comma decimal parsing
    expect(formatScaledAmount('2,5', 4, 4)).toBe('2,5');
    expect(formatScaledAmount('2,5', 8, 4)).toBe('5');

    // Qualitative text preserved
    expect(formatScaledAmount('tùy chọn', 4, 4)).toBe('tùy chọn');
    expect(formatScaledAmount('nêm vừa ăn', 8, 4)).toBe('nêm vừa ăn');

    // Clamping servings stepper
    const clampServings = (val: number) => Math.min(20, Math.max(1, val));
    expect(clampServings(-10)).toBe(1);
    expect(clampServings(0)).toBe(1);
    expect(clampServings(1)).toBe(1);
    expect(clampServings(10)).toBe(10);
    expect(clampServings(20)).toBe(20);
    expect(clampServings(50)).toBe(20);
  });

  // --------------------------------------------------------------------------
  // Test 8: Canonical Vietnamese culinary keywords preservation across the catalog
  // --------------------------------------------------------------------------
  it('should preserve canonical Vietnamese culinary keywords across the active catalog (Test 8)', () => {
    const requiredKeywords = [
      { kw: 'thịt heo', minExpected: 20 },
      { kw: 'cà chua', minExpected: 150 },
      { kw: 'trứng', minExpected: 100 },
      { kw: 'gà', minExpected: 150 },
      { kw: 'đậu phụ', minExpected: 25 },
      { kw: 'thịt bò', minExpected: 25 },
      { kw: 'cá', minExpected: 200 }
    ];

    requiredKeywords.forEach(({ kw, minExpected }) => {
      const matchCount = mockRecipes.filter(r => 
        r.title.toLowerCase().includes(kw) || 
        r.ingredients.some(i => i.name.toLowerCase().includes(kw))
      ).length;

      expect(matchCount).toBeGreaterThanOrEqual(minExpected);
    });
  });

  // --------------------------------------------------------------------------
  // Test 9: Catalog-Wide Zero Dead / Blacklisted Image URLs (Spec 1)
  // --------------------------------------------------------------------------
  it('should assert 0 dead URLs, 0 blacklisted placeholder IDs, 0 human faces, and 0 cloche fallbacks across all 1,245 recipes in mockRecipes (both static and resolved) (Spec 1)', () => {
    expect(mockRecipes.length).toBe(1245);

    const violations: { id: string; title: string; badId: string; type: string }[] = [];

    const KNOWN_DEAD_AND_OVERUSED = [
      ...OVERUSED_PLACEHOLDER_IDS,
      'photo-1621996346565-e3d5d6281292',
      'photo-1621996346565-e3d5d6281744',
      'photo-1576107232684-1279f3908594',
      'photo-1627054234057-a41764661031',
      'photo-176107232684-1279f3908594',
      'photo-1573140247632-f8fd74997d5c', // human face
    ];

    mockRecipes.forEach(recipe => {
      // 1. Static URL check
      if (!recipe.imageUrl || typeof recipe.imageUrl !== 'string' || recipe.imageUrl.trim() === '') {
        violations.push({ id: recipe.id, title: recipe.title, badId: 'empty_static_url', type: 'static_empty' });
      } else {
        if (!recipe.imageUrl.startsWith('https://images.unsplash.com/') && !recipe.imageUrl.startsWith('http')) {
          violations.push({ id: recipe.id, title: recipe.title, badId: 'invalid_domain', type: 'static_domain' });
        }
        for (const badId of KNOWN_DEAD_AND_OVERUSED) {
          if (recipe.imageUrl.includes(badId)) {
            violations.push({ id: recipe.id, title: recipe.title, badId, type: 'static' });
          }
        }
        if (isDeadOrPlaceholderUrl(recipe.imageUrl)) {
          violations.push({ id: recipe.id, title: recipe.title, badId: 'isDeadOrPlaceholderUrl_true', type: 'static_predicate' });
        }
        if (recipe.imageUrl.startsWith('data:image/svg+xml')) {
          violations.push({ id: recipe.id, title: recipe.title, badId: 'static_cloche_svg', type: 'static_cloche' });
        }
      }

      // 2. Resolved URL check
      const resolved = getDishImageUrl(recipe.title, recipe.category, recipe.imageUrl);
      if (!resolved || typeof resolved !== 'string' || resolved.trim() === '') {
        violations.push({ id: recipe.id, title: recipe.title, badId: 'empty_resolved_url', type: 'resolved_empty' });
      } else {
        if (!resolved.startsWith('https://images.unsplash.com/') && !resolved.startsWith('http')) {
          violations.push({ id: recipe.id, title: recipe.title, badId: 'invalid_resolved_domain', type: 'resolved_domain' });
        }
        for (const badId of KNOWN_DEAD_AND_OVERUSED) {
          if (resolved.includes(badId)) {
            violations.push({ id: recipe.id, title: recipe.title, badId, type: 'resolved' });
          }
        }
        if (isDeadOrPlaceholderUrl(resolved)) {
          violations.push({ id: recipe.id, title: recipe.title, badId: 'isDeadOrPlaceholderUrl_resolved_true', type: 'resolved_predicate' });
        }
        // 3. Online cloche check
        if (resolved.startsWith('data:image/svg+xml') || resolved.includes('Offline') || resolved.includes('Ngoại Tuyến')) {
          violations.push({ id: recipe.id, title: recipe.title, badId: 'cloche_placeholder', type: 'cloche' });
        }
      }
    });

    expect(violations.length).toBe(0);

    // Specific verification for western-bfast-433
    const omeletteDish = mockRecipes.find(r => r.id === 'western-bfast-433');
    expect(omeletteDish).toBeDefined();
    expect(omeletteDish?.title).toBe('Trứng Cuộn Omelette Xúc Xích Đức & Bánh Mì Bơ');
    expect(omeletteDish?.imageUrl).toContain('photo-1584776296944-ab6fb57b0bdd');
    expect(omeletteDish?.imageUrl).not.toContain('photo-1621996346565-e3d5d6281292');
    expect(omeletteDish?.imageUrl).not.toContain('photo-1586190848861-99aa4a171e90');

    const resolvedOmelette = getDishImageUrl(omeletteDish!.title, omeletteDish!.category, omeletteDish!.imageUrl);
    expect(resolvedOmelette).toContain('photo-1584776296944-ab6fb57b0bdd');

    // 4. Also assert across all 44 meal sets in mockMealSets
    expect(mockMealSets.length).toBe(44);
    const mealSetViolations: string[] = [];
    mockMealSets.forEach(ms => {
      if (!ms.imageUrl) {
        mealSetViolations.push(`${ms.id}: empty imageUrl`);
      } else {
        for (const badId of KNOWN_DEAD_AND_OVERUSED) {
          if (ms.imageUrl.includes(badId)) {
            mealSetViolations.push(`${ms.id}: contains ${badId}`);
          }
        }
      }
    });
    expect(mealSetViolations.length).toBe(0);

    // 5. Global anti-burger invariant: 0 non-burger recipes have burger photo
    const BURGER_PHOTO_ID = 'photo-1586190848861-99aa4a171e90';
    const nonBurgerWithBurgerPhoto = mockRecipes.filter(r => {
      const isBurger = /burger|hamburger/i.test(r.title);
      return !isBurger && r.imageUrl?.includes(BURGER_PHOTO_ID);
    });
    expect(nonBurgerWithBurgerPhoto.length).toBe(0);

    // 6. Global anti-ice-cream invariant: No savory dish resolves to kem_gelato_yogurt or contains ice cream photo IDs
    const ICE_CREAM_PHOTO_IDS = [
      'photo-1563805042-7684c019e1cb',
      'photo-1501443762994-82bd5dace89a',
      'photo-1579372786545-d24232daf58c',
    ];
    const savoryIceCreamViolations: { id: string; title: string; issue: string }[] = [];
    mockRecipes.forEach(r => {
      const isDessertOrSnack = r.category === 'trang-mieng' || r.category === 'an-vat';
      if (!isDessertOrSnack) {
        const cluster = resolveCulinaryCluster(r.title, r.category);
        if (cluster === 'kem_gelato_yogurt') {
          savoryIceCreamViolations.push({ id: r.id, title: r.title, issue: 'resolved_to_kem_gelato_yogurt' });
        }
        for (const iceCreamId of ICE_CREAM_PHOTO_IDS) {
          if (r.imageUrl?.includes(iceCreamId)) {
            savoryIceCreamViolations.push({ id: r.id, title: r.title, issue: `contains_${iceCreamId}` });
          }
        }
      }
    });
    expect(savoryIceCreamViolations.length).toBe(0);

    // 7. Semantic isolation: Western salads with cheese/butter never resolve to pho_bo
    const cheeseButterSaladTitles = [
      'Salad Cà Chua Phô Mai Caprese',
      'Salad Quả Bơ Phô Mai Bơ Lạt',
      'Salad Phô Mai Bơ Trộn Giấm Đen Balsamic',
    ];
    cheeseButterSaladTitles.forEach(title => {
      const cluster = resolveCulinaryCluster(title, 'khai-vi');
      expect(cluster).not.toBe('pho_bo');
      expect(cluster).toBe('salad_tay_caesar');
    });
  });
});
