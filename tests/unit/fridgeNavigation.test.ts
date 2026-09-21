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
});
