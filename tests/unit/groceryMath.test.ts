import { describe, it, expect } from '../helpers/testRunner';
import {
  GroceryItemAggregate,
  normalizeUnitAndAmount,
  aggregateIngredients,
  STORE_PRICE_MULTIPLIERS,
  simulateStorePrice,
  formatZaloShoppingList
} from '../helpers/calcUtils';

describe('Unit: Grocery Aggregation & Store Math (groceryMath)', () => {
  it('should normalize units between kg and g', () => {
    const res1 = normalizeUnitAndAmount(1.5, 'kg');
    expect(res1.amount).toBe(1500);
    expect(res1.unit).toBe('g');

    const res2 = normalizeUnitAndAmount(500, 'g');
    expect(res2.amount).toBe(500);
    expect(res2.unit).toBe('g');
  });

  it('should normalize spoons (muỗng / thìa canh)', () => {
    const res1 = normalizeUnitAndAmount(2, 'muỗng canh');
    expect(res1.unit).toBe('thìa canh');

    const res2 = normalizeUnitAndAmount(1, 'thìa cà phê');
    expect(res2.unit).toBe('thìa cà phê');
  });

  it('should aggregate identical ingredients across multiple recipes without duplicates', () => {
    const input = [
      {
        ingredient: { name: 'Thịt ba chỉ', amount: 300, unit: 'g', category: 'thit-ca' as const },
        recipeCost: 60000,
        totalIngredientsCount: 2
      },
      {
        ingredient: { name: 'Thịt ba chỉ', amount: 0.2, unit: 'kg', category: 'thit-ca' as const },
        recipeCost: 40000,
        totalIngredientsCount: 2
      }
    ];

    const result = aggregateIngredients(input);
    expect(result.items.length).toBe(1);
    // 300g + 200g = 500g
    expect(result.items[0].amount).toBe(500);
    expect(result.items[0].unit).toBe('g');
    // Portion 1: 60k/2 = 30k; Portion 2: 40k/2 = 20k -> Total: 50k
    expect(result.items[0].cost).toBe(50000);
    expect(result.totalCostEstimate).toBe(50000);
  });

  it('should calculate completion percentage accurately across 0%, partial, and 100%', () => {
    const items: GroceryItemAggregate[] = [
      { name: 'Thịt bò', normalizedName: 'thit bo', amount: 300, unit: 'g', category: 'thit-ca', cost: 60000, type: 'fresh' },
      { name: 'Hành lá', normalizedName: 'hanh la', amount: 50, unit: 'g', category: 'rau-cu', cost: 5000, type: 'fresh' }
    ];

    // 0%
    const zalo0 = formatZaloShoppingList(items, {}, 65000);
    expect(zalo0).toContain('TIẾN ĐỘ HOÀN TẤT: 0% (0/2 món)');
    expect(zalo0).toContain('[ ] CẦN MUA:');
    expect(zalo0).not.toContain('[✓] ĐÃ MUA:');

    // 50%
    const zalo50 = formatZaloShoppingList(items, { 'Thịt bò': true }, 65000);
    expect(zalo50).toContain('TIẾN ĐỘ HOÀN TẤT: 50% (1/2 món)');
    expect(zalo50).toContain('[ ] CẦN MUA:');
    expect(zalo50).toContain('[✓] ĐÃ MUA:');

    // 100%
    const zalo100 = formatZaloShoppingList(items, { 'Thịt bò': true, 'Hành lá': true }, 65000);
    expect(zalo100).toContain('TIẾN ĐỘ HOÀN TẤT: 100% (2/2 món)');
    expect(zalo100).not.toContain('[ ] CẦN MUA:');
  });

  it('should calculate 4-channel store pricing simulation correctly', () => {
    const baseCost = 100000;

    // Chợ Dân Sinh (-5%)
    expect(simulateStorePrice(baseCost, 'cho-dan-sinh')).toBe(95000);
    // WinMart (+15%)
    expect(simulateStorePrice(baseCost, 'winmart')).toBe(115000);
    // Bách Hóa Xanh (+5%)
    expect(simulateStorePrice(baseCost, 'bach-hoa-xanh')).toBe(105000);
    // Sạp Đối Tác (-10%)
    expect(simulateStorePrice(baseCost, 'sap-doi-tac')).toBe(90000);
    // All (baseline)
    expect(simulateStorePrice(baseCost, 'all')).toBe(100000);
  });

  it('should detect in-fridge matching items and identify leftovers', () => {
    const pantry = [
      { id: '1', name: 'Thịt ba chỉ luộc thừa', quantity: '300g', category: 'thit-ca' as const, daysLeft: 1, isLeftover: true },
      { id: '2', name: 'Trứng gà', quantity: '4 quả', category: 'do-kho' as const, daysLeft: 10, isLeftover: false }
    ];

    // Check matching against grocery item "Thịt ba chỉ"
    const groceryName = 'Thịt ba chỉ';
    const match = pantry.find(p => 
      p.name.toLowerCase().includes(groceryName.toLowerCase()) || 
      groceryName.toLowerCase().includes(p.name.toLowerCase())
    );

    expect(match).toBeDefined();
    expect(match?.isLeftover).toBe(true);
    expect(match?.quantity).toBe('300g');
    expect(match?.daysLeft <= 2).toBe(true); // Urgent leftover
  });
});

