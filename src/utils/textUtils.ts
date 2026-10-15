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

/**
 * Common Vietnamese regional food synonyms (North <-> South / Central).
 * Enables seamless cross-dialect search:
 * - "heo" <-> "lợn" (e.g. "thịt heo" <-> "thịt lợn")
 * - "ba rọi" <-> "ba chỉ"
 * - "đậu hũ" <-> "đậu phụ" <-> "tàu hũ"
 * - "ngô" <-> "bắp"
 * - "lạc" <-> "đậu phộng"
 * - "dưa chuột" <-> "dưa leo"
 * - "vừng" <-> "mè"
 * - "nấm mèo" <-> "mộc nhĩ"
 * - "rau mùi" <-> "ngò rí" / "ngò"
 * - "mùi tàu" <-> "ngò gai"
 * - "dọc mùng" <-> "bạc hà"
 */
export const VIETNAMESE_FOOD_SYNONYMS: Record<string, string[]> = {
  heo: ['lon'],
  lon: ['heo'],
  'thit heo': ['thit lon'],
  'thit lon': ['thit heo'],
  'ba chi': ['ba roi'],
  'ba roi': ['ba chi'],
  'dau hu': ['dau phu', 'tau hu'],
  'dau phu': ['dau hu', 'tau hu'],
  'tau hu': ['dau hu', 'dau phu'],
  bap: ['ngo'],
  ngo: ['bap'],
  'dua leo': ['dua chuot'],
  'dua chuot': ['dua leo'],
  lac: ['dau phong'],
  'dau phong': ['lac'],
  me: ['vung'],
  vung: ['me'],
  'moc nhi': ['nam meo'],
  'nam meo': ['moc nhi'],
  'rau mui': ['ngo', 'ngo ri'],
  'ngo ri': ['rau mui'],
  'mui tau': ['ngo gai'],
  'ngo gai': ['mui tau'],
  'hanh hoa': ['hanh la'],
  'hanh la': ['hanh hoa'],
  'cha gio': ['nem ran', 'nem'],
  'nem ran': ['cha gio'],
  thom: ['dua', 'khom'],
  khom: ['dua', 'thom'],
};

/**
 * Expands a food search query into an array of search variants including
 * regional Vietnamese synonyms.
 * For example:
 * - "thit lon" -> ["thit lon", "thit heo"]
 * - "heo" -> ["heo", "lon"]
 * - "thit h" -> ["thit h", "thit l"]
 * - "thit l" -> ["thit l", "thit h"]
 */
export function expandFoodSearchQueries(rawQuery: string): string[] {
  const norm = normalizeSearchString(rawQuery);
  if (!norm) return [];
  const results = new Set<string>([norm]);

  // Check prefix / partial typing: e.g. "thit l" <-> "thit h", "thit he" <-> "thit lo"
  if (norm.startsWith('thit l')) {
    results.add('thit heo' + norm.slice(6));
    results.add('thit h' + norm.slice(6));
  } else if (norm.startsWith('thit h')) {
    results.add('thit lon' + norm.slice(6));
    results.add('thit l' + norm.slice(6));
  } else if (norm.startsWith('l')) {
    results.add('heo' + norm.slice(1));
    results.add('h' + norm.slice(1));
  } else if (norm.startsWith('h')) {
    results.add('lon' + norm.slice(1));
    results.add('l' + norm.slice(1));
  }

  // Check direct compound phrases
  for (const [key, synonyms] of Object.entries(VIETNAMESE_FOOD_SYNONYMS)) {
    const normKey = normalizeSearchString(key);
    if (norm.includes(normKey)) {
      for (const syn of synonyms) {
        const normSyn = normalizeSearchString(syn);
        results.add(norm.replace(normKey, normSyn));
        results.add(normSyn);
      }
    }
  }

  // Token-level replacements
  const tokens = norm.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (VIETNAMESE_FOOD_SYNONYMS[t]) {
      for (const syn of VIETNAMESE_FOOD_SYNONYMS[t]) {
        const newTokens = [...tokens];
        newTokens[i] = syn;
        results.add(newTokens.join(' '));
      }
    }
  }

  return Array.from(results);
}

/**
 * Checks whether a target text matches any of the query variants,
 * taking into account Vietnamese regional synonyms (heo <-> lợn, bắp <-> ngô, etc.).
 */
export function matchesFoodSearch(target: string | undefined | null, rawQuery: string | undefined | null): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!target || !target.trim()) return false;

  const queries = expandFoodSearchQueries(rawQuery);
  const normTarget = normalizeSearchString(target);

  for (const q of queries) {
    if (normTarget.includes(q)) return true;
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length > 1 && tokens.every(tok => normTarget.includes(tok))) {
      return true;
    }
  }

  return false;
}


