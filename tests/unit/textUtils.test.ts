import { describe, it, expect } from '../helpers/testRunner';
import {
  removeVietnameseTones,
  removeVietnameseDiacritics,
  normalizeSearchString,
  matchesSearchTerm,
  matchesMultiField,
  matchesRecipeSearch,
  matchesMealSetSearch
} from '../../src/utils/textUtils';

describe('Unit: Vietnamese Text Normalization & Search (textUtils)', () => {
  it('should strip all Vietnamese accents and replace d/D correctly', () => {
    expect(removeVietnameseTones('Thịt Ba Chỉ Rang Cháy Cạnh')).toBe('Thit Ba Chi Rang Chay Canh');
    expect(removeVietnameseTones('Đồng Quê')).toBe('Dong Que');
    expect(removeVietnameseTones('ĐẮC LẮC đà nẵng')).toBe('DAC LAC da nang');
    expect(removeVietnameseTones('Canh Cua Mồng Tơi')).toBe('Canh Cua Mong Toi');
    expect(removeVietnameseTones('Phở Bò Tái Nạm Gầu Bắp')).toBe('Pho Bo Tai Nam Gau Bap');
  });

  it('should handle empty, null, and whitespace inputs safely', () => {
    expect(removeVietnameseTones('')).toBe('');
    expect(removeVietnameseTones(null as any)).toBe('');
    expect(removeVietnameseTones(undefined as any)).toBe('');
    expect(normalizeSearchString('   ')).toBe('');
    expect(normalizeSearchString(null)).toBe('');
  });

  it('should remove diacritics and convert to lowercase with removeVietnameseDiacritics', () => {
    expect(removeVietnameseDiacritics('Cá Bống Kho Tiêu')).toBe('ca bong kho tieu');
    expect(removeVietnameseDiacritics('LẨU MẮM ĐẶC BIỆT')).toBe('lau mam dac biet');
  });

  it('should perform diacritic-insensitive substring match', () => {
    expect(matchesSearchTerm('Thịt kho tàu', 'thit')).toBe(true);
    expect(matchesSearchTerm('Thịt kho tàu', 'kho tau')).toBe(true);
    expect(matchesSearchTerm('Canh chua cá lóc', 'ca loc')).toBe(true);
    expect(matchesSearchTerm('Canh chua cá lóc', 'CANH CHUA')).toBe(true);
    expect(matchesSearchTerm('Rau muống xào tỏi', 'thịt')).toBe(false);
  });

  it('should match multiple space-separated tokens in any position', () => {
    // "thit rang" in "Thịt Ba Chỉ Rang Cháy Cạnh"
    expect(matchesSearchTerm('Thịt Ba Chỉ Rang Cháy Cạnh', 'thit rang')).toBe(true);
    expect(matchesSearchTerm('Canh Cua Mồng Tơi Mướp Hương', 'cua muop')).toBe(true);
    expect(matchesSearchTerm('Gà Luộc Lá Chanh', 'ga chanh luoc')).toBe(true);
    expect(matchesSearchTerm('Gà Luộc Lá Chanh', 'ga vit')).toBe(false);
  });

  it('should return true when search query is empty or whitespace only', () => {
    expect(matchesSearchTerm('Bất kỳ món nào', '')).toBe(true);
    expect(matchesSearchTerm('Bất kỳ món nào', '   ')).toBe(true);
    expect(matchesSearchTerm('Bất kỳ món nào', null)).toBe(true);
  });

  it('should match across title, description, tags, and ingredients via matchesMultiField', () => {
    const item = {
      title: 'Canh Chua Cá Bớp',
      description: 'Đặc sản miền Nam thanh mát chua ngọt',
      tags: ['Miền Nam', 'Đậm Đà', 'Giải Nhiệt'],
      ingredients: [
        { name: 'Cá bớp tươi cắt lát' },
        { name: 'Bạc hà (dọc mùng)' },
        { name: 'Thơm (dứa)' },
        { name: 'Cà chua chín' }
      ]
    };

    // Match title
    expect(matchesMultiField(item, 'ca bop')).toBe(true);
    // Match description
    expect(matchesMultiField(item, 'thanh mat')).toBe(true);
    // Match tags
    expect(matchesMultiField(item, 'giai nhiet')).toBe(true);
    // Match ingredient
    expect(matchesMultiField(item, 'doc mung')).toBe(true);
    expect(matchesMultiField(item, 'bac ha')).toBe(true);
    // Non-match
    expect(matchesMultiField(item, 'thit bo')).toBe(false);
  });

  it('should match recipes using matchesRecipeSearch', () => {
    const recipe = {
      title: 'Sườn Xào Chua Ngọt',
      description: 'Sườn non rim đậm vị chua ngọt sánh mịn',
      tags: ['Món Mặn', 'Bán Chạy'],
      ingredients: [{ name: 'Sườn heo non' }, { name: 'Giấm gạo' }]
    };

    expect(matchesRecipeSearch(recipe, 'suon xao')).toBe(true);
    expect(matchesRecipeSearch(recipe, 'giam gao')).toBe(true);
    expect(matchesRecipeSearch(recipe, 'ban chay')).toBe(true);
    expect(matchesRecipeSearch(recipe, 'tom rang')).toBe(false);
  });

  it('should match meal sets including component dishes via matchesMealSetSearch', () => {
    const mealSet = {
      title: 'Mâm Cơm Đậm Đà Hương Vị Bắc',
      description: 'Thịt rang cháy cạnh, canh cua mồng tơi, cà pháo',
      tags: ['Đồng Quê', 'Bán Chạy'],
      mainDish: { title: 'Thịt Ba Chỉ Rang Cháy Cạnh' },
      soupDish: { title: 'Canh Cua Mồng Tơi Mướp Hương' },
      sideDish: { title: 'Cà Pháo Muối Giòn' }
    };

    // Match meal set title
    expect(matchesMealSetSearch(mealSet, 'huong vi bac')).toBe(true);
    // Match component dish
    expect(matchesMealSetSearch(mealSet, 'canh cua')).toBe(true);
    expect(matchesMealSetSearch(mealSet, 'ca phao')).toBe(true);
    expect(matchesMealSetSearch(mealSet, 'thit ba chi')).toBe(true);
    // Non-match
    expect(matchesMealSetSearch(mealSet, 'lau mam')).toBe(false);
  });
});
