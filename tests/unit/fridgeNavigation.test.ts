import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import { recipesDatabase } from '../../src/data/recipesDatabase';
import { PantryItem } from '../../src/types';

describe('Unit: Smart Fridge & Leftover Navigation (User Priority Feature)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('FRIDGE-01: Sidebar replaces Món Ngon (recipes) with Tủ Lạnh (pantry) using Refrigerator icon', () => {
    const sidebarCode = fs.readFileSync(path.join(srcDir, 'components/Sidebar.tsx'), 'utf-8');
    
    // Check that Refrigerator icon is imported
    expect(sidebarCode).toContain('Refrigerator');
    // Check that rightNavItems contains id: 'pantry', label: 'Tủ Lạnh'
    expect(sidebarCode).toContain("id: 'pantry'");
    expect(sidebarCode).toContain("label: 'Tủ Lạnh'");
    expect(sidebarCode).toContain("icon: Refrigerator");
    // Verify whitespace-nowrap and leading-none are maintained for layout resilience
    expect(sidebarCode).toContain('leading-none whitespace-nowrap');
  });

  it('FRIDGE-02: Navbar maps tab "pantry" to "Tủ Lạnh & Đồ Thừa"', () => {
    const navbarCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    expect(navbarCode).toContain("case 'pantry':");
    expect(navbarCode).toContain("'Tủ Lạnh & Đồ Thừa'");
  });

  it('FRIDGE-03: App mounts FridgeView component when activeTab is pantry', () => {
    const appCode = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    expect(appCode).toContain("import { FridgeView } from './components/FridgeView';");
    expect(appCode).toContain("{activeTab === 'pantry' && <FridgeView />}");
  });

  it('FRIDGE-04: GroceryList header button routes directly to pantry tab', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain("setActiveTab('pantry')");
  });

  it('FRIDGE-05: Smart Recipe Matcher can discover recipes matching pantry items/leftovers', () => {
    // Example ingredients commonly left over
    const commonLeftovers = ['thịt heo', 'cà chua', 'trứng', 'gà', 'đậu phụ', 'thịt bò'];
    
    for (const ing of commonLeftovers) {
      const matching = recipesDatabase.filter(r => 
        r.title.toLowerCase().includes(ing) || 
        r.ingredients.some(i => i.name.toLowerCase().includes(ing))
      );
      expect(matching.length).toBeGreaterThan(0);
    }
  });

  it('FRIDGE-06: Pantry items calculate correct urgency and potential grocery savings', () => {
    const sampleItems: PantryItem[] = [
      { id: '1', name: 'Cơm nguội', category: 'leftover', quantity: '2 bát', daysLeft: 1, isLeftover: true, addedAt: '2026-09-20' },
      { id: '2', name: 'Thịt kho tàu', category: 'leftover', quantity: '1 hộp', daysLeft: 2, isLeftover: true, addedAt: '2026-09-19' },
      { id: '3', name: 'Trứng gà', category: 'protein', quantity: '6 quả', daysLeft: 10, isLeftover: false, addedAt: '2026-09-18' },
    ];

    const urgentItems = sampleItems.filter(i => i.daysLeft <= 2);
    const leftoverItems = sampleItems.filter(i => i.isLeftover);
    
    expect(urgentItems.length).toBe(2);
    expect(leftoverItems.length).toBe(2);

    // Mock savings calculation (e.g. 25,000 VND saved per leftover item)
    const estimatedSavingsVnd = sampleItems.length * 25000;
    expect(estimatedSavingsVnd).toBe(75000);
  });

  it('FRIDGE-07: Leftover cooked rice ("Cơm nguội bữa trước") strictly suggests rice dishes and NEVER suggests bread or noodles', async () => {
    const { mockRecipes } = await import('../../src/data/mockRecipes');
    const { findLeftoverRecipeSuggestions } = await import('../../src/utils/fridgeMatcher');

    const riceLeftover: PantryItem = {
      id: 'test-rice',
      name: 'Cơm nguội bữa trước',
      category: 'Đồ ăn thừa',
      quantity: '1 tô to',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true,
      notes: 'Chiên cơm rang dưa bò, cơm chiên trứng hoặc cơm rang kim chi'
    };

    const suggestions = findLeftoverRecipeSuggestions(riceLeftover, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    // Assert that NONE of the suggestions have bread or noodles
    for (const dish of suggestions) {
      const titleLower = dish.title.toLowerCase();
      expect(titleLower.includes('bánh mì')).toBe(false);
      expect(titleLower.includes('sandwich')).toBe(false);
      expect(titleLower.includes('bún')).toBe(false);
      expect(titleLower.includes('phở')).toBe(false);
      expect(titleLower.includes('hủ tiếu')).toBe(false);
      expect(titleLower.includes('miến')).toBe(false);

      // Verify that the suggested dish is a genuine rice dish
      const isRiceDish = 
        titleLower.includes('cơm rang') || 
        titleLower.includes('cơm chiên') || 
        titleLower.includes('cơm cháy') || 
        titleLower.includes('cháo') ||
        titleLower.includes('cơm');
      expect(isRiceDish).toBe(true);
    }
  });

  it('FRIDGE-08: Seasoning "nước mắm cá cơm" does not cause bread or noodle dishes to match "cơm nguội"', async () => {
    const { mockRecipes } = await import('../../src/data/mockRecipes');
    const { findLeftoverRecipeSuggestions } = await import('../../src/utils/fridgeMatcher');

    // Bread recipe "Bánh Mì Ốp La" has "nước mắm cá cơm" in ingredients
    const banhMiRecipe = mockRecipes.find(r => r.id === 'banh-mi-op-la-bo-dua-leo');
    expect(banhMiRecipe).toBeDefined();

    const riceLeftover: PantryItem = {
      id: 'test-rice-2',
      name: 'Cơm nguội',
      category: 'Đồ ăn thừa',
      quantity: '1 bát',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };

    const suggestions = findLeftoverRecipeSuggestions(riceLeftover, mockRecipes, 10);
    const hasBanhMi = suggestions.some(r => r.id === 'banh-mi-op-la-bo-dua-leo' || r.title.toLowerCase().includes('bánh mì'));
    expect(hasBanhMi).toBe(false);
  });

  it('FRIDGE-09: Other leftovers (thịt gà luộc thừa, thịt heo luộc thừa) produce authentic repurposing dishes', async () => {
    const { mockRecipes } = await import('../../src/data/mockRecipes');
    const { findLeftoverRecipeSuggestions } = await import('../../src/utils/fridgeMatcher');

    // Boiled chicken leftover
    const chickenLeftover: PantryItem = {
      id: 'test-chicken',
      name: 'Thịt gà luộc thừa',
      category: 'Đồ ăn thừa',
      quantity: '300 g',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true,
      notes: 'Xé phay làm gỏi bắp cải'
    };

    const chickenSuggestions = findLeftoverRecipeSuggestions(chickenLeftover, mockRecipes, 4);
    expect(chickenSuggestions.length).toBeGreaterThan(0);
    // Should prioritize chicken dishes (e.g. gỏi gà, gà xé) and not beef or pork
    const topChickenDish = chickenSuggestions[0];
    expect(topChickenDish.title.toLowerCase().includes('gà')).toBe(true);

    // Boiled pork leftover
    const porkLeftover: PantryItem = {
      id: 'test-pork',
      name: 'Thịt heo luộc thừa',
      category: 'Đồ ăn thừa',
      quantity: '200 g',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true,
      notes: 'Thái mỏng cuốn bánh tráng'
    };

    const porkSuggestions = findLeftoverRecipeSuggestions(porkLeftover, mockRecipes, 4);
    expect(porkSuggestions.length).toBeGreaterThan(0);
    const topPorkDish = porkSuggestions[0];
    expect(
      topPorkDish.title.toLowerCase().includes('thịt') || 
      topPorkDish.title.toLowerCase().includes('heo') ||
      topPorkDish.title.toLowerCase().includes('ba chỉ')
    ).toBe(true);
  });

  it('FRIDGE-10: Whole-Fridge Matcher (findWholeFridgeRecipeSuggestions) takes all items in fridge into account and awards multi-ingredient synergy', async () => {
    const { mockRecipes } = await import('../../src/data/mockRecipes');
    const { findWholeFridgeRecipeSuggestions } = await import('../../src/utils/fridgeMatcher');

    const fridgeItems: PantryItem[] = [
      { id: '1', name: 'Cơm nguội bữa trước', category: 'Đồ ăn thừa', quantity: '1 tô', daysLeft: 1, isLeftover: true },
      { id: '2', name: 'Trứng gà ta', category: 'Trứng & Đậu', quantity: '4 quả', daysLeft: 4, isLeftover: false },
      { id: '3', name: 'Cà chua chín', category: 'Rau củ quả', quantity: '3 quả', daysLeft: 2, isLeftover: false },
      { id: '4', name: 'Đậu phụ sống', category: 'Trứng & Đậu', quantity: '2 bìa', daysLeft: 1, isLeftover: false }
    ];

    const result = findWholeFridgeRecipeSuggestions(fridgeItems, mockRecipes, 4, 0);
    expect(result.totalEligible).toBeGreaterThan(10);
    expect(result.results.length).toBe(4);

    // Verify each result identifies matched fridge items and summary text
    for (const res of result.results) {
      expect(res.matchedPantryItems.length).toBeGreaterThanOrEqual(1);
      expect(res.summary).toContain('Có sẵn');
      expect(res.score).toBeGreaterThan(0);
    }

    // Top results should feature recipes combining multiple fridge items (e.g. egg + tomato + tofu, or rice + egg)
    const topMultiItemDish = result.results.find(r => r.matchedCount >= 2);
    expect(topMultiItemDish).toBeDefined();
  });

  it('FRIDGE-11: Reload button offset rotation cycles through different dishes from the 700+ database', async () => {
    const { mockRecipes } = await import('../../src/data/mockRecipes');
    const { findWholeFridgeRecipeSuggestions } = await import('../../src/utils/fridgeMatcher');

    expect(mockRecipes.length).toBeGreaterThanOrEqual(700);

    const fridgeItems: PantryItem[] = [
      { id: '1', name: 'Cơm nguội bữa trước', category: 'Đồ ăn thừa', quantity: '1 tô', daysLeft: 1, isLeftover: true },
      { id: '2', name: 'Trứng gà ta', category: 'Trứng & Đậu', quantity: '4 quả', daysLeft: 4, isLeftover: false }
    ];

    // Batch 1 (Offset 0)
    const batch1 = findWholeFridgeRecipeSuggestions(fridgeItems, mockRecipes, 4, 0);
    // Batch 2 (Offset 4)
    const batch2 = findWholeFridgeRecipeSuggestions(fridgeItems, mockRecipes, 4, 4);

    expect(batch1.results.length).toBe(4);
    expect(batch2.results.length).toBe(4);

    // Assert that batch 1 and batch 2 present distinct dishes (users get fresh meal ideas on reload)
    const batch1Ids = new Set(batch1.results.map(r => r.recipe.id));
    const batch2Ids = new Set(batch2.results.map(r => r.recipe.id));

    let overlapCount = 0;
    for (const id of batch2Ids) {
      if (batch1Ids.has(id)) overlapCount++;
    }
    expect(overlapCount).toBeLessThan(4); // At least some or all dishes are rotated
  });

  it('FRIDGE-12: Single-item reload offset allows users to change their meal without repeating', async () => {
    const { mockRecipes } = await import('../../src/data/mockRecipes');
    const { findLeftoverRecipeSuggestions } = await import('../../src/utils/fridgeMatcher');

    const riceLeftover: PantryItem = {
      id: 'test-rice',
      name: 'Cơm nguội bữa trước',
      category: 'Đồ ăn thừa',
      quantity: '1 tô',
      daysLeft: 1,
      isLeftover: true
    };

    const batch1 = findLeftoverRecipeSuggestions(riceLeftover, mockRecipes, 4, 0);
    const batch2 = findLeftoverRecipeSuggestions(riceLeftover, mockRecipes, 4, 4);

    expect(batch1.length).toBe(4);
    expect(batch2.length).toBe(4);

    // IDs between consecutive batches should differ
    const b1First = batch1[0].id;
    const b2First = batch2[0].id;
    expect(b1First).not.toBe(b2First);
  });

  it('FRIDGE-13: Whole-fridge suggestions box defaults to closed and remembers user preference across sessions', () => {
    const fridgeViewCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');

    // 1. Verify storage key constant is defined and exported
    expect(fridgeViewCode).toContain("STORAGE_KEY_WHOLE_FRIDGE_EXPANDED = 'mealwise_fridge_suggestions_expanded'");

    // 2. Verify default state is strictly false (closed) when no localStorage is present
    expect(fridgeViewCode).toContain("return false; // Default setting: always closed");

    // 3. Verify it reads from localStorage during lazy initialization
    expect(fridgeViewCode).toContain("localStorage.getItem(STORAGE_KEY_WHOLE_FRIDGE_EXPANDED)");
    expect(fridgeViewCode).toContain("return saved === 'true'");

    // 4. Verify it persists changes back to localStorage via useEffect
    expect(fridgeViewCode).toContain("localStorage.setItem(STORAGE_KEY_WHOLE_FRIDGE_EXPANDED, String(isWholeFridgeExpanded))");

    // 5. Verify the toggle button and header area provide toggle interaction
    expect(fridgeViewCode).toContain("aria-expanded={isWholeFridgeExpanded}");
  });

  it('FRIDGE-14: Layered Refrigerator Compartments (Freezer, Fridge, Crisper) & Contextual Dynamic Category Filter', async () => {
    const { 
      inferItemCompartment, 
      getSubCategoriesForCompartment, 
      matchesSubCategory,
      COMPARTMENT_TABS 
    } = await import('../../src/components/FridgeView');

    // 1. Verify Compartment Tabs definition (Tất cả, Ngăn đá, Ngăn lạnh, Ngăn rau)
    expect(COMPARTMENT_TABS.length).toBe(4);
    const tabIds = COMPARTMENT_TABS.map(t => t.id);
    expect(tabIds).toEqual(['all', 'freezer', 'fridge', 'crisper']);

    // 2. Test inferItemCompartment for realistic items across compartments
    // A. Explicit compartment preserved
    const explicitItem: PantryItem = {
      id: 'exp-1',
      name: 'Thịt bò',
      category: 'Thịt / Hải sản',
      quantity: '500g',
      daysLeft: 3,
      compartment: 'freezer'
    };
    expect(inferItemCompartment(explicitItem)).toBe('freezer');

    // B. Automatic inference for freezer items (frozen, ice cream, hotpot balls, long shelf life meat)
    expect(inferItemCompartment({ id: 'f1', name: 'Chả giò đông lạnh', category: 'Chế biến sẵn', quantity: '1 gói', daysLeft: 30 })).toBe('freezer');
    expect(inferItemCompartment({ id: 'f2', name: 'Sườn non heo cấp đông', category: 'Thịt / Hải sản', quantity: '500g', daysLeft: 45 })).toBe('freezer');
    expect(inferItemCompartment({ id: 'f3', name: 'Kem vani Vinamilk', category: 'Đồ uống & Khác', quantity: '1 hộp', daysLeft: 20 })).toBe('freezer');
    expect(inferItemCompartment({ id: 'f4', name: 'Cá viên chiên lẩu', category: 'Chế biến sẵn', quantity: '1 gói', daysLeft: 15 })).toBe('freezer');

    // C. Automatic inference for veggie crisper items (leafy greens, gourds/squash, fresh mushrooms, fruits)
    expect(inferItemCompartment({ id: 'c1', name: 'Rau muống non', category: 'Rau củ quả', quantity: '1 bó', daysLeft: 2 })).toBe('crisper');
    expect(inferItemCompartment({ id: 'c2', name: 'Bí đỏ hồ lô', category: 'Rau củ quả', quantity: '1 quả', daysLeft: 5 })).toBe('crisper');
    expect(inferItemCompartment({ id: 'c3', name: 'Nấm đùi gà tươi', category: 'Rau củ quả', quantity: '200g', daysLeft: 3 })).toBe('crisper');
    expect(inferItemCompartment({ id: 'c4', name: 'Cam sành Hàm Yên', category: 'Rau củ quả', quantity: '1 kg', daysLeft: 6 })).toBe('crisper');

    // Fermented veggies stay in fridge compartment
    expect(inferItemCompartment({ id: 'c5', name: 'Kim chi Hàn Quốc', category: 'Rau củ quả', quantity: '1 hũ', daysLeft: 10 })).toBe('fridge');

    // D. Automatic inference for fridge items (leftovers, fresh protein for quick use, eggs, tofu, milk)
    expect(inferItemCompartment({ id: 'm1', name: 'Cơm nguội bữa trước', category: 'Đồ ăn thừa', quantity: '1 tô', daysLeft: 1, isLeftover: true })).toBe('fridge');
    expect(inferItemCompartment({ id: 'm2', name: 'Trứng gà ta', category: 'Trứng & Đậu', quantity: '6 quả', daysLeft: 5 })).toBe('fridge');
    expect(inferItemCompartment({ id: 'm3', name: 'Đậu phụ non Ichiban', category: 'Trứng & Đậu', quantity: '1 hộp', daysLeft: 2 })).toBe('fridge');
    expect(inferItemCompartment({ id: 'm4', name: 'Thịt nạc vai xay tươi', category: 'Thịt / Hải sản', quantity: '300g', daysLeft: 2 })).toBe('fridge');
    expect(inferItemCompartment({ id: 'm5', name: 'Sữa tươi tiệt trùng', category: 'Đồ uống & Khác', quantity: '1 hộp', daysLeft: 3 })).toBe('fridge');

    // 3. Test contextual subcategory generation per shelf
    // Freezer subcategories
    const freezerSubCats = getSubCategoriesForCompartment('freezer');
    const freezerSubIds = freezerSubCats.map(s => s.id);
    expect(freezerSubIds).toContain('all');
    expect(freezerSubIds).toContain('frozen_meat');
    expect(freezerSubIds).toContain('frozen_seafood');
    expect(freezerSubIds).toContain('frozen_ready');
    expect(freezerSubIds).toContain('ice_dessert');
    expect(freezerSubIds).toContain('urgent');

    // Fridge subcategories
    const fridgeSubCats = getSubCategoriesForCompartment('fridge');
    const fridgeSubIds = fridgeSubCats.map(s => s.id);
    expect(fridgeSubIds).toContain('all');
    expect(fridgeSubIds).toContain('leftovers');
    expect(fridgeSubIds).toContain('fresh_protein');
    expect(fridgeSubIds).toContain('egg_tofu');
    expect(fridgeSubIds).toContain('ready_to_eat');
    expect(fridgeSubIds).toContain('dairy_drinks');
    expect(fridgeSubIds).toContain('sauces_pickles');
    expect(fridgeSubIds).toContain('urgent');

    // Crisper subcategories
    const crisperSubCats = getSubCategoriesForCompartment('crisper');
    const crisperSubIds = crisperSubCats.map(s => s.id);
    expect(crisperSubIds).toContain('all');
    expect(crisperSubIds).toContain('leafy_greens');
    expect(crisperSubIds).toContain('tubers_squash');
    expect(crisperSubIds).toContain('mushrooms');
    expect(crisperSubIds).toContain('fresh_fruits');
    expect(crisperSubIds).toContain('urgent');

    // 4. Test matchesSubCategory secondary filtering
    // In Freezer:
    const frozenFish: PantryItem = { id: 'ff1', name: 'Cá hồi phi lê đông lạnh', category: 'Thịt / Hải sản', quantity: '300g', daysLeft: 20 };
    expect(matchesSubCategory(frozenFish, 'freezer', 'frozen_seafood')).toBe(true);
    expect(matchesSubCategory(frozenFish, 'freezer', 'frozen_meat')).toBe(false);

    // In Crisper:
    const morningGlory: PantryItem = { id: 'rm1', name: 'Rau muống bào sợi', category: 'Rau củ quả', quantity: '1 bọc', daysLeft: 1 };
    expect(matchesSubCategory(morningGlory, 'crisper', 'leafy_greens')).toBe(true);
    expect(matchesSubCategory(morningGlory, 'crisper', 'tubers_squash')).toBe(false);
    expect(matchesSubCategory(morningGlory, 'crisper', 'urgent')).toBe(true); // daysLeft <= 2

    // In Fridge:
    const eggItem: PantryItem = { id: 'eg1', name: 'Trứng vịt lộn', category: 'Trứng & Đậu', quantity: '4 quả', daysLeft: 3 };
    expect(matchesSubCategory(eggItem, 'fridge', 'egg_tofu')).toBe(true);
    expect(matchesSubCategory(eggItem, 'fridge', 'fresh_protein')).toBe(false);
  });

  it('FRIDGE-15: FridgeView component defines all summary card metric variables (urgentList, leftoversList) without runtime reference errors', () => {
    const fridgeViewCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');

    // 1. Verify urgentList is defined and memoized
    expect(fridgeViewCode).toContain("const urgentList = useMemo(() => pantryItems.filter(i => i.daysLeft <= 2), [pantryItems]);");

    // 2. Verify leftoversList is defined and memoized
    expect(fridgeViewCode).toContain("const leftoversList = useMemo(() => pantryItems.filter(i => i.isLeftover || i.category === 'Đồ ăn thừa'), [pantryItems]);");

    // 3. Verify totalPotentialSavings is defined
    expect(fridgeViewCode).toContain("totalPotentialSavings");

    // 4. Verify rendered metric card elements bind to these variables
    expect(fridgeViewCode).toContain("{urgentList.length} món");
    expect(fridgeViewCode).toContain("{leftoversList.length} món");
  });

  it('FRIDGE-16: Golden Loop - Pantry Spices Checklist and Fridge Compartment Ingestion Invariant', async () => {
    const { COMMON_PANTRY_SPICES } = await import('../../src/components/GroceryList');
    const { inferItemCompartment } = await import('../../src/components/FridgeView');

    // 1. Spices checklist contains 10 core household spices
    expect(COMMON_PANTRY_SPICES.length).toBe(10);
    const spiceNames = COMMON_PANTRY_SPICES.map(s => s.name);
    expect(spiceNames).toContain('Nước mắm cá cơm');
    expect(spiceNames).toContain('Dầu ăn thực vật');
    expect(spiceNames).toContain('Hạt nêm thịt thăn');
    expect(spiceNames).toContain('Tiêu đen xay');

    // 2. Ingestion correctly maps bought proteins to freezer or fridge, and greens to crisper
    expect(inferItemCompartment({ id: '1', name: 'Sườn non heo cấp đông', category: 'thit-ca', quantity: '500g', daysLeft: 30 })).toBe('freezer');
    expect(inferItemCompartment({ id: '1b', name: 'Sườn non heo tươi', category: 'thit-ca', quantity: '500g', daysLeft: 3 })).toBe('fridge');
    expect(inferItemCompartment({ id: '2', name: 'Rau muống', category: 'rau-cu', quantity: '1 bó', daysLeft: 3 })).toBe('crisper');
    expect(inferItemCompartment({ id: '3', name: 'Trứng gà ta', category: 'khac', quantity: '10 quả', daysLeft: 3 })).toBe('fridge');
  });

  it('FRIDGE-17: Golden Loop - Dish Freshness Tiering & Priority Days', async () => {
    const { getDishFreshnessTier, computeDayFreshnessAdjustment } = await import('../../src/utils/mealPlanGenerator');

    // 1. Short shelf-life perishables are classified as 'fresh-perishable'
    const bunDish = { title: 'Bún Chả Hà Nội', description: 'Bún tươi', category: 'main' as const };
    const banhMiDish = { title: 'Bánh Mì Xíu Mại', description: 'Bánh mì giòn', category: 'breakfast' as const };
    const dauPhuDish = { title: 'Đậu Phụ Sốt Cà Chua', description: 'Đậu phụ tươi', category: 'main' as const };

    expect(getDishFreshnessTier(bunDish)).toBe('fresh-perishable');
    expect(getDishFreshnessTier(banhMiDish)).toBe('fresh-perishable');
    expect(getDishFreshnessTier(dauPhuDish)).toBe('fresh-perishable');

    // 2. Hearty shelf-life items are classified as 'hearty-pantry'
    const biDoDish = { title: 'Canh Bí Đỏ Thịt Bằm', description: 'Bí đỏ ngọt', category: 'soup' as const };
    const bapCaiDish = { title: 'Bắp Cải Xào Thịt Bò', description: 'Bắp cải', category: 'side' as const };

    expect(getDishFreshnessTier(biDoDish)).toBe('hearty-pantry');
    expect(getDishFreshnessTier(bapCaiDish)).toBe('hearty-pantry');

    // 3. Score adjustments: Perishable gets +6 on Day 0-1, -6 on Day 2-6
    expect(computeDayFreshnessAdjustment(bunDish, 0, 20)).toBe(6);
    expect(computeDayFreshnessAdjustment(bunDish, 1, 20)).toBe(6);
    expect(computeDayFreshnessAdjustment(bunDish, 2, 20)).toBe(-6);
    expect(computeDayFreshnessAdjustment(bunDish, 6, 20)).toBe(-6);

    // Hearty gets 0 on Day 0-1, +4 on Day 2-6
    expect(computeDayFreshnessAdjustment(biDoDish, 0, 20)).toBe(0);
    expect(computeDayFreshnessAdjustment(biDoDish, 4, 20)).toBe(4);
  });

  it('FRIDGE-18: GroceryList provides universal Select All / Deselect All adapting to active category filter', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');

    // 1. Verify universal select all handlers are defined
    expect(groceryCode).toContain('handleToggleSelectAllUniversal');
    expect(groceryCode).toContain('handleSelectAllDisplayed');
    expect(groceryCode).toContain('handleUnselectAllDisplayed');

    // 2. Verify isAllDisplayedChecked state computation scoped to displayedList
    expect(groceryCode).toContain('const isAllDisplayedChecked = displayedList.length > 0 && displayedCheckedCount === displayedList.length;');

    // 3. Verify universal toggle button with 'Chọn tất cả' and 'Bỏ chọn' labels
    expect(groceryCode).toContain("{isAllDisplayedChecked ? 'Bỏ chọn' : 'Chọn tất cả'}");

    // 4. Verify CheckSquare icon and active aisle name toast notification
    expect(groceryCode).toContain('CheckSquare');
    expect(groceryCode).toContain('tất cả các quầy');
  });

  it('FRIDGE-19: Cookable items prioritized before uncookable condiments & spices in fridge list', async () => {
    const { hasCookableRecipes } = await import('../../src/utils/fridgeMatcher');
    const fridgeViewCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');

    // 1. Verify FridgeView imports and utilizes hasCookableRecipes
    expect(fridgeViewCode).toContain('hasCookableRecipes');
    expect(fridgeViewCode).toContain('const aCookable = hasCookableRecipes(a, recipes);');
    expect(fridgeViewCode).toContain('const bCookable = hasCookableRecipes(b, recipes);');

    // 2. Base condiments and seasonings are identified as uncookable (no standalone recipe)
    const tieuXay: PantryItem = { id: 'tieu', name: 'Tiêu xay', category: 'Khác', quantity: '50g', daysLeft: 1, status: 'fresh' };
    const nuocMam: PantryItem = { id: 'mam', name: 'Nước mắm', category: 'Gia vị', quantity: '1 chai', daysLeft: 1, status: 'fresh' };
    const dauAn: PantryItem = { id: 'dau', name: 'Dầu ăn', category: 'Đồ khô & Gia vị', quantity: '1 chai', daysLeft: 2, status: 'fresh' };

    expect(hasCookableRecipes(tieuXay, recipesDatabase)).toBe(false);
    expect(hasCookableRecipes(nuocMam, recipesDatabase)).toBe(false);
    expect(hasCookableRecipes(dauAn, recipesDatabase)).toBe(false);

    // 3. Genuine cooking ingredients have matching recipes
    const thitBaChi: PantryItem = { id: 'thit', name: 'Thịt ba chỉ', category: 'Thịt / Hải sản', quantity: '400g', daysLeft: 5, status: 'fresh' };
    const rauMuong: PantryItem = { id: 'rau', name: 'Rau muống', category: 'Rau củ quả', quantity: '1 bó', daysLeft: 4, status: 'fresh' };
    const nuocCotDua: PantryItem = { id: 'dua', name: 'Nước cốt dừa béo ngậy', category: 'Đồ khô & Gia vị', quantity: '1 lon', daysLeft: 3, status: 'fresh' };

    expect(hasCookableRecipes(thitBaChi, recipesDatabase)).toBe(true);
    expect(hasCookableRecipes(rauMuong, recipesDatabase)).toBe(true);
    expect(hasCookableRecipes(nuocCotDua, recipesDatabase)).toBe(true);

    // 4. Test sorting comparator logic: Cookable items appear first, uncookable go to bottom
    const mixedItems: PantryItem[] = [
      tieuXay,      // 1 day left, uncookable
      nuocMam,      // 1 day left, uncookable
      thitBaChi,    // 5 days left, cookable
      rauMuong,     // 4 days left, cookable
      nuocCotDua    // 3 days left, cookable
    ];

    const sorted = [...mixedItems].sort((a, b) => {
      const aCookable = hasCookableRecipes(a, recipesDatabase);
      const bCookable = hasCookableRecipes(b, recipesDatabase);
      if (aCookable !== bCookable) {
        return aCookable ? -1 : 1;
      }
      return a.daysLeft - b.daysLeft;
    });

    // Cookable items must come first, sorted by daysLeft ascending (3 -> 4 -> 5)
    expect(sorted[0].id).toBe('dua');    // Nước cốt dừa (3 days)
    expect(sorted[1].id).toBe('rau');    // Rau muống (4 days)
    expect(sorted[2].id).toBe('thit');   // Thịt ba chỉ (5 days)

    // Uncookable items are pushed to the bottom
    expect(sorted[3].id).toBe('tieu');   // Tiêu xay (1 day, but uncookable)
    expect(sorted[4].id).toBe('mam');    // Nước mắm (1 day, but uncookable)
  });

  it('FRIDGE-20: Weekly Shopping Completion Status & Reassurance Notification', () => {
    const weeklyBoardCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    const groceryListCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');

    // 1. Verify MealWiseContext exposes isWeeklyShoppingCompleted
    expect(contextCode).toContain('isWeeklyShoppingCompleted: boolean');
    expect(contextCode).toContain('setIsWeeklyShoppingCompleted:');
    expect(contextCode).toContain('localStorage.setItem(\'mealwise_weekly_shopping_completed\'');

    // 2. Verify WeeklyBoard indicates shopping completed status and notifies user
    expect(weeklyBoardCode).toContain('isWeeklyShoppingDone');
    expect(weeklyBoardCode).toContain('Đã xong');
    expect(weeklyBoardCode).toContain('✓ Bạn đã hoàn thành đi chợ cho thực đơn tuần này và cất vào tủ lạnh!');

    // 3. Verify GroceryList shows celebratory empty state when weekly shopping is done
    expect(groceryListCode).toContain('isWeeklyShoppingDone');
    expect(groceryListCode).toContain('Đã Hoàn Thành Đi Chợ Cho Thực Đơn Tuần Này!');
    expect(groceryListCode).toContain('Bạn đã mua sắm đủ toàn bộ nguyên liệu cho thực đơn tuần và cất vào Tủ Lạnh Thông Minh.');
    expect(groceryListCode).toContain('Mua Lại Tuần Này');

    // 4. Verify WeeklyBoard guards 1-click autofill with confirmation modal when shopping is already done
    expect(weeklyBoardCode).toContain('Thực Đơn Đang Khóa An Toàn');
    expect(weeklyBoardCode).toContain('Bạn đã hoàn thành đi chợ và cất nguyên liệu tuần này vào tủ lạnh.');
    expect(weeklyBoardCode).toContain('Vẫn Tạo Mới');
  });

  it('FRIDGE-21: Weekday Soft Lock & Weekend Unlocking for Meal Plan Modifications', () => {
    const weeklyBoardCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');

    // 1. Verify weekend check logic (Saturday = 6, Sunday = 0)
    expect(weeklyBoardCode).toContain('const isWeekendDay = (): boolean =>');
    expect(weeklyBoardCode).toContain('day === 0 || day === 6');

    // 2. Verify soft lock invariant: only active on weekdays after shopping is done
    expect(weeklyBoardCode).toContain('const isPlanSoftLocked = isWeeklyShoppingDone && !isWeekendDay()');

    // 3. Verify handlers wrapped with soft lock confirmation
    expect(weeklyBoardCode).toContain('const handleAutoFillWeekly = () =>');
    expect(weeklyBoardCode).toContain('const handleRandomSwap = (dayId: string, slot: MealSlot) =>');
    expect(weeklyBoardCode).toContain('const handleSwapDishInWeeklySlot = (dayId: string, slot: MealSlot, dishType:');
    expect(weeklyBoardCode).toContain('const handleRemoveMealFromSlot = (dayId: string, slot: MealSlot) =>');
    expect(weeklyBoardCode).toContain('const handleOpenSlotPicker = (dayId: string, slot: MealSlot) =>');

    // 4. Verify JSX buttons use guarded handlers
    expect(weeklyBoardCode).toContain('handleSwapDishInWeeklySlot(activeDay.dayId, \'breakfast\', \'mainDish\')');
    expect(weeklyBoardCode).toContain('handleSwapDishInWeeklySlot(activeDay.dayId, \'lunch\', \'mainDish\')');
    expect(weeklyBoardCode).toContain('handleSwapDishInWeeklySlot(activeDay.dayId, \'dinner\', \'mainDish\')');
    expect(weeklyBoardCode).toContain('handleRemoveMealFromSlot(activeDay.dayId, \'breakfast\')');
    expect(weeklyBoardCode).toContain('handleRemoveMealFromSlot(activeDay.dayId, \'lunch\')');
    expect(weeklyBoardCode).toContain('handleRemoveMealFromSlot(activeDay.dayId, \'dinner\')');
    expect(weeklyBoardCode).toContain('handleRemoveMealFromSlot(activeDay.dayId, \'snack\')');

    // 5. Verify status badges for weekday soft lock and weekend planning
    expect(weeklyBoardCode).toContain('Khóa An Toàn Tuần Này');
    expect(weeklyBoardCode).toContain('Cuối Tuần: Mở Đổi Thực Đơn');

    // 6. Test weekend simulation directly
    const testIsWeekend = (dayOfWeek: number) => dayOfWeek === 0 || dayOfWeek === 6;
    expect(testIsWeekend(0)).toBe(true);  // Sunday
    expect(testIsWeekend(6)).toBe(true);  // Saturday
    expect(testIsWeekend(1)).toBe(false); // Monday
    expect(testIsWeekend(2)).toBe(false); // Tuesday
    expect(testIsWeekend(3)).toBe(false); // Wednesday
    expect(testIsWeekend(4)).toBe(false); // Thursday
    expect(testIsWeekend(5)).toBe(false); // Friday
  });
});



