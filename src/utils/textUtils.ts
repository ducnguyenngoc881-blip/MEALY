/**
 * MealWise Vietnamese Text & Search Utilities
 * Centralized diacritic stripping, tone normalization, and multi-criteria search matching.
 */

/**
 * Remove Vietnamese tones and diacritics from a string,
 * preserving original case and replacing 'đ'/'Đ' with 'd'/'D'.
 *
 * Examples:
 * - "Thịt Ba Chỉ Rang Cháy Cạnh" -> "Thit Ba Chi Rang Chay Canh"
 * - "Đồng Quê" -> "Dong Que"
 * - "Canh Cua Mồng Tơi" -> "Canh Cua Mong Toi"
 * - "Phở Bò & Bún Chả" -> "Pho Bo & Bun Cha"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Alias for removeVietnameseTones returning a lowercased string.
 */
export function removeVietnameseDiacritics(str: string): string {
  return removeVietnameseTones(str).toLowerCase();
}

/**
 * Normalize string for search comparisons:
 * strips Vietnamese diacritics, converts to lowercase, and trims whitespace.
 */
export function normalizeSearchString(str: string | undefined | null): string {
  if (!str) return '';
  return removeVietnameseTones(str).toLowerCase().trim();
}

/**
 * Diacritic-insensitive, case-insensitive, whitespace-tolerant search match.
 *
 * Supports:
 * 1. Direct normalized substring matching (e.g. "thit ba chi" in "Thịt ba chỉ")
 * 2. Multi-token / all-words matching (e.g. "thit rang" matches "Thịt Ba Chỉ Rang Cháy Cạnh")
 *
 * @param target The string being searched in (e.g. recipe title, dish description)
 * @param query The user's input search query
 * @returns true if target matches query or if query is empty
 */
export function matchesSearchTerm(
  target: string | undefined | null,
  query: string | undefined | null
): boolean {
  if (!query || !query.trim()) return true;
  if (!target || !target.trim()) return false;

  const normTarget = normalizeSearchString(target);
  const normQuery = normalizeSearchString(query);

  if (!normQuery) return true;
  if (!normTarget) return false;

  // Direct substring match
  if (normTarget.includes(normQuery)) {
    return true;
  }

  // Multi-token match: all space-separated tokens in query must appear in target
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every(token => normTarget.includes(token));
  }

  return false;
}

export interface SearchableItem {
  title?: string;
  name?: string;
  description?: string;
  tags?: string[];
  category?: string;
  region?: string;
  ingredients?: Array<{ name: string } | string>;
  [key: string]: any;
}

/**
 * Multi-criteria search matching across title, description, tags, and ingredients.
 *
 * @param item The object containing searchable fields
 * @param query The user's input search query
 * @returns true if any field matches or all query tokens are found across the combined text
 */
export function matchesMultiField(
  item: SearchableItem | undefined | null,
  query: string | undefined | null
): boolean {
  if (!query || !query.trim()) return true;
  if (!item) return false;

  const normQuery = normalizeSearchString(query);
  if (!normQuery) return true;

  // Collect text segments
  const textSegments: string[] = [];

  if (item.title) textSegments.push(item.title);
  if (item.name) textSegments.push(item.name);
  if (item.description) textSegments.push(item.description);
  if (item.category) textSegments.push(item.category);
  if (item.region) textSegments.push(item.region);

  if (Array.isArray(item.tags)) {
    textSegments.push(...item.tags);
  }

  if (Array.isArray(item.ingredients)) {
    for (const ing of item.ingredients) {
      if (typeof ing === 'string') {
        textSegments.push(ing);
      } else if (ing && typeof ing.name === 'string') {
        textSegments.push(ing.name);
      }
    }
  }

  // 1. Check if any individual field has a direct match
  for (const segment of textSegments) {
    if (matchesSearchTerm(segment, query)) {
      return true;
    }
  }

  // 2. Check if all query tokens appear across the combined text
  const combinedNormText = textSegments
    .map(s => normalizeSearchString(s))
    .filter(Boolean)
    .join(' ');

  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  return queryTokens.every(token => combinedNormText.includes(token));
}

/**
 * Dedicated helper for recipe multi-criteria search
 * Matches against recipe title, description, tags, and ingredient names.
 */
export function matchesRecipeSearch(
  recipe: {
    title: string;
    description?: string;
    tags?: string[];
    ingredients?: Array<{ name: string } | string>;
  },
  query: string
): boolean {
  return matchesMultiField(recipe, query);
}

/**
 * Dedicated helper for VietnameseMealSet multi-criteria search
 * Matches against meal set title, description, tags, and component dishes (main, soup, side).
 */
export function matchesMealSetSearch(
  mealSet: {
    title: string;
    description?: string;
    tags?: string[];
    mainDish?: { title: string };
    soupDish?: { title: string };
    sideDish?: { title: string };
  },
  query: string
): boolean {
  if (!query || !query.trim()) return true;
  if (!mealSet) return false;

  const normQuery = normalizeSearchString(query);
  if (!normQuery) return true;

  // Check direct meal set fields
  if (matchesMultiField(mealSet, query)) {
    return true;
  }

  // Check dish names inside the meal set
  if (mealSet.mainDish?.title && matchesSearchTerm(mealSet.mainDish.title, query)) return true;
  if (mealSet.soupDish?.title && matchesSearchTerm(mealSet.soupDish.title, query)) return true;
  if (mealSet.sideDish?.title && matchesSearchTerm(mealSet.sideDish.title, query)) return true;

  // Check combined text including dish names
  const combined = [
    mealSet.title,
    mealSet.description,
    ...(mealSet.tags || []),
    mealSet.mainDish?.title,
    mealSet.soupDish?.title,
    mealSet.sideDish?.title
  ]
    .filter(Boolean)
    .map(s => normalizeSearchString(s as string))
    .join(' ');

  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  return queryTokens.every(token => combined.includes(token));
}

/**
 * Guard against recommending hotpot / banquet feast dishes in everyday family meal sets.
 * Hotpot (lẩu) is a standalone multi-course feast, not a component soup/dish in a 3-dish meal set.
 */
export function isHotpotOrFeast(recipe: { title?: string; id?: string; tags?: string[] } | null | undefined): boolean {
  if (!recipe) return false;
  const title = (recipe.title || '').toLowerCase();
  const id = (recipe.id || '').toLowerCase();
  if (/lẩu|hotpot|đại tiệc|mâm tiệc/i.test(title)) return true;
  if (/lẩu|hotpot|party/i.test(id)) return true;
  if (recipe.tags && recipe.tags.some(t => /lẩu|hotpot|mâm tiệc|đại tiệc/i.test(t))) return true;
  return false;
}

