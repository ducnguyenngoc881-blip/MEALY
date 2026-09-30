/**
 * Ingredient Normalizer & Grocery Aggregator
 * 
 * Unifies varied culinary ingredient names, de-bundles compound ingredients,
 * and handles intelligent unit conversions (count <-> weight) so that multiple dishes
 * requiring the same ingredient display as a single consolidated item with an
 * aggregated total quantity and a dish usage counter.
 */

export interface NormalizedIngredientInfo {
  cleanName: string;
  baseAmount: number;
  baseUnit: string;
  family: 'weight' | 'volume' | 'spoon_soup' | 'spoon_tea' | 'spoon' | 'count' | 'other';
  groupKey: string;
  isConvertibleProduce?: boolean;
}

// Average culinary unit weights in grams for common Vietnamese market produce
export const PRODUCE_UNIT_WEIGHTS: Record<string, { unit: string; grams: number; alt?: Record<string, number> }> = {
  'cà chua': { unit: 'quả', grams: 100, alt: { 'trái': 100 } },
  'cà chua bi': { unit: 'quả', grams: 15, alt: { 'trái': 15 } },
  'chanh': { unit: 'quả', grams: 50, alt: { 'trái': 50 } },
  'hành tây': { unit: 'củ', grams: 150 },
  'cà rốt': { unit: 'củ', grams: 100 },
  'khoai tây': { unit: 'củ', grams: 150 },
  'khoai lang': { unit: 'củ', grams: 150 },
  'dưa leo': { unit: 'quả', grams: 150, alt: { 'trái': 150 } },
  'dưa chuột': { unit: 'quả', grams: 150, alt: { 'trái': 150 } },
  'tỏi': { unit: 'củ', grams: 30, alt: { 'tép': 5, 'nhánh': 5 } },
  'hành tím': { unit: 'củ', grams: 15, alt: { 'tép': 5 } },
  'hành khô': { unit: 'củ', grams: 15 },
  'hành tím (hành khô)': { unit: 'củ', grams: 15 },
  'gừng': { unit: 'củ', grams: 40, alt: { 'nhánh': 20, 'lát': 5 } },
  'sả': { unit: 'cây', grams: 20, alt: { 'nhánh': 20 } },
  'ớt': { unit: 'quả', grams: 10, alt: { 'trái': 10 } },
  'ớt tươi': { unit: 'quả', grams: 10, alt: { 'trái': 10 } },
  'dứa': { unit: 'quả', grams: 600, alt: { 'trái': 600 } },
  'thơm': { unit: 'quả', grams: 600, alt: { 'trái': 600 } },
  'dứa (thơm)': { unit: 'quả', grams: 600, alt: { 'trái': 600 } },
  'bắp cải': { unit: 'bắp', grams: 800 },
  'súp lơ xanh': { unit: 'cái', grams: 400, alt: { 'cây': 400 } },
  'súp lơ': { unit: 'cái', grams: 400, alt: { 'cây': 400 } },
  'bông cải xanh': { unit: 'cái', grams: 400, alt: { 'cây': 400 } },
  'bắp ngô': { unit: 'bắp', grams: 250, alt: { 'trái': 250 } },
  'bắp ngọt (ngô)': { unit: 'bắp', grams: 250, alt: { 'trái': 250 } },
  'ngô ngọt': { unit: 'bắp', grams: 250 },
  'mướp hương': { unit: 'quả', grams: 250, alt: { 'trái': 250 } },
  'bí đỏ': { unit: 'quả', grams: 800 },
  'bí đao': { unit: 'quả', grams: 700 },
  'đậu bắp': { unit: 'quả', grams: 20, alt: { 'trái': 20 } },
  'hành lá': { unit: 'nhánh', grams: 10, alt: { 'bó': 100, 'cây': 10 } },
  'rau muống': { unit: 'bó', grams: 300, alt: { 'mớ': 300 } },
  'rau mồng tơi': { unit: 'bó', grams: 300, alt: { 'mớ': 300 } },
  'rau ngót': { unit: 'bó', grams: 200, alt: { 'mớ': 200 } },
  'đậu phụ': { unit: 'miếng', grams: 150, alt: { 'bìa': 150 } },
  'trứng gà': { unit: 'quả', grams: 50, alt: { 'trái': 50, 'hột': 50 } },
  'trứng vịt': { unit: 'quả', grams: 65, alt: { 'trái': 65, 'hột': 65 } },
  'trứng cút': { unit: 'quả', grams: 12, alt: { 'trái': 12, 'hột': 12 } }
};

// Culinary descriptive adjectives and cutting/preparation words to strip during canonicalization
const PREPARATION_MODIFIERS = [
  'chín đỏ mọng', 'chín đỏ', 'chín mọng', 'chín tới', 'chín mềm', 'chín vàng', 'chín',
  'tươi non', 'tươi ngon', 'tươi sống', 'tươi rói', 'tươi',
  'sống sạch cát', 'sạch cát', 'gọt sạch mắt', 'gọt vỏ', 'rửa sạch', 'ngâm muối',
  'rút sườn', 'chặt khúc', 'cắt khối vuông', 'cắt miếng lớn', 'cắt miếng', 'cắt khúc',
  'cắt lát', 'cắt khoanh', 'thái mỏng', 'thái sợi', 'thái lát', 'thái vát', 'thái nhỏ',
  'thái hạt lựu', 'cắt hạt lựu', 'hạt lựu', 'băm nhuyễn', 'băm nhỏ', 'băm phi thơm',
  'băm phi vàng', 'băm', 'đập dập', 'giã nhuyễn', 'xay nhuyễn', 'nguyên hạt', 'nguyên trái',
  'nguyên củ', 'nguyên con', 'phi vàng', 'phi thơm', 'loại 1', 'loại ngon', 'ngon',
  'truyền thống', 'đậm đặc', 'tinh khiết', 'hạt tinh khiết', 'thực vật', 'nấu ăn'
];

/**
 * Canonicalizes an ingredient name into its standard marketplace entity name.
 * e.g., "Cà chua chín đỏ mọng" -> "Cà chua"
 * e.g., "Cà chua chín tới hoặc cà chua bi" -> "Cà chua"
 * e.g., "Cà chua bi tươi" -> "Cà chua"
 * e.g., "Thịt ba chỉ rút sườn" -> "Thịt ba chỉ"
 * e.g., "Hành tím khô & tỏi ta" -> will be split into "Hành tím" and "Tỏi" by decomposeBundledIngredients
 */
export function canonicalizeIngredientName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') return 'Nguyên liệu khác';
  
  let s = rawName.trim();
  
  // 1. Remove parenthetical notes e.g., (hoặc ...), (40 độ đạm), (Thơm), (Dọc mùng)
  // But preserve recognizable disambiguations like (ngò om) or (thơm) if helpful
  const lower = s.toLowerCase();

  // Explicit High-Priority Culinary Mapping Dictionary
  if (lower.includes('cà chua')) return 'Cà chua';
  if (lower.includes('ba chỉ') || lower.includes('ba rọi')) return 'Thịt ba chỉ';
  if (lower.includes('nạc vai')) return 'Thịt nạc vai';
  if (lower.includes('nạc dăm')) return 'Thịt nạc dăm';
  if (lower.includes('thăn heo') || lower.includes('thăn lợn')) return 'Thịt thăn heo';
  if (lower.includes('heo xay') || lower.includes('lợn xay') || lower.includes('thịt băm')) return 'Thịt heo xay';
  if (lower.includes('sườn non') || lower.includes('sườn heo')) return 'Sườn non heo';
  if (lower.includes('chân giò') || lower.includes('móng giò')) return 'Chân giò heo';

  if (lower.includes('thăn bò') || (lower.includes('thịt bò') && !lower.includes('bắp') && !lower.includes('nạm'))) return 'Thịt bò';
  if (lower.includes('bắp bò')) return 'Bắp bò';
  if (lower.includes('nạm bò')) return 'Nạm bò';

  // Eggs must be evaluated strictly BEFORE poultry to prevent "Trứng gà ta" from matching "gà ta"
  if (lower.includes('trứng gà')) return 'Trứng gà';
  if (lower.includes('trứng vịt')) return 'Trứng vịt';
  if (lower.includes('trứng cút')) return 'Trứng cút';
  if (lower.includes('trứng')) return 'Trứng gà';

  // Mushrooms must be evaluated strictly BEFORE poultry to prevent "Nấm đùi gà" from matching "đùi gà"
  if (lower.includes('nấm rơm')) return 'Nấm rơm';
  if (lower.includes('nấm đùi gà')) return 'Nấm đùi gà';
  if (lower.includes('nấm kim châm')) return 'Nấm kim châm';
  if (lower.includes('nấm hương')) return 'Nấm hương';
  if (lower.includes('nấm mỡ')) return 'Nấm mỡ';
  if (lower.includes('nấm')) return 'Nấm tươi';

  if (lower.includes('đùi gà')) return 'Đùi gà';
  if (lower.includes('ức gà')) return 'Ức gà';
  if (lower.includes('cánh gà')) return 'Cánh gà';
  if (lower.includes('thịt gà') || lower.includes('gà ta') || lower.includes('gà thả vườn')) return 'Thịt gà';
  if (lower.includes('thịt vịt') || lower.includes('vịt')) return 'Thịt vịt';

  if (lower.includes('cá lóc') || lower.includes('cá quả') || lower.includes('cá chuối')) return 'Cá lóc';
  if (lower.includes('cá hồi')) return 'Cá hồi';
  if (lower.includes('cá basa') || lower.includes('cá ba sa')) return 'Cá basa';
  if (lower.includes('cá nục')) return 'Cá nục';
  if (lower.includes('cá diêu hồng') || lower.includes('cá điêu hồng')) return 'Cá diêu hồng';
  if (lower.includes('tôm sú') || lower.includes('tôm thẻ') || lower.includes('tôm tươi') || lower === 'tôm') return 'Tôm tươi';
  if (lower.includes('mực ống') || lower.includes('mực tươi') || lower.includes('mực lá') || lower === 'mực') return 'Mực tươi';
  if (lower.includes('nghêu') || lower.includes('ngao')) return 'Nghêu (Ngao)';
  if (lower.includes('cua đồng')) return 'Cua đồng xay';

  if (lower.includes('hành tím') || lower.includes('hành khô')) return 'Hành tím (hành khô)';
  if (lower.includes('hành tây')) return 'Hành tây';
  if (lower.includes('hành hoa') || lower.includes('hành lá')) return 'Hành lá';
  if (lower.includes('tỏi')) return 'Tỏi';
  if (lower.includes('gừng')) return 'Gừng';
  if (lower.includes('sả') || lower.includes('xả')) return 'Sả';
  if (lower.includes('ớt')) return 'Ớt tươi';
  if (lower.includes('chanh')) return 'Chanh';
  if (lower.includes('ngò rí') || lower.includes('rau mùi') && !lower.includes('tàu')) return 'Rau mùi (ngò rí)';
  if (lower.includes('ngò gai') || lower.includes('mùi tàu')) return 'Mùi tàu (ngò gai)';
  if (lower.includes('thì là')) return 'Thì là';
  if (lower.includes('rau răm')) return 'Rau răm';

  if (lower.includes('cà rốt')) return 'Cà rốt';
  if (lower.includes('khoai tây')) return 'Khoai tây';
  if (lower.includes('khoai lang')) return 'Khoai lang';
  if (lower.includes('dưa leo') || lower.includes('dưa chuột')) return 'Dưa leo';
  if (lower.includes('rau muống')) return 'Rau muống';
  if (lower.includes('rau mồng tơi') || lower.includes('mồng tơi')) return 'Rau mồng tơi';
  if (lower.includes('rau ngót')) return 'Rau ngót';
  if (lower.includes('cải ngọt')) return 'Cải ngọt';
  if (lower.includes('cải thìa') || lower.includes('cải chíp')) return 'Cải thìa';
  if (lower.includes('bắp cải')) return 'Bắp cải';
  if (lower.includes('súp lơ') || lower.includes('bông cải')) return 'Súp lơ xanh';
  if (lower.includes('mướp hương') || lower.includes('mướp')) return 'Mướp hương';
  if (lower.includes('bí đỏ')) return 'Bí đỏ';
  if (lower.includes('bí đao') || lower.includes('bí xanh')) return 'Bí đao';
  if (lower.includes('đậu bắp')) return 'Đậu bắp';
  if (lower.includes('đậu cô ve') || lower.includes('đậu cove') || lower.includes('đậu que')) return 'Đậu cô ve';
  if (lower.includes('giá đỗ') || lower.includes('giá sống')) return 'Giá đỗ';
  if (lower.includes('dứa') || lower.includes('thơm')) return 'Dứa (thơm)';
  if (lower.includes('đậu phụ') || lower.includes('đậu hũ')) return 'Đậu phụ';

  if (lower.includes('nấm rơm')) return 'Nấm rơm';
  if (lower.includes('nấm đùi gà')) return 'Nấm đùi gà';
  if (lower.includes('nấm kim châm')) return 'Nấm kim châm';
  if (lower.includes('nấm hương')) return 'Nấm hương';
  if (lower.includes('nấm mỡ')) return 'Nấm mỡ';
  if (lower.includes('ngô ngọt') || lower.includes('bắp ngọt') || lower.includes('bắp ngô')) return 'Bắp ngọt (ngô)';

  if (lower.includes('nước mắm')) return 'Nước mắm';
  if (lower.includes('nước tương') || lower.includes('xì dầu')) return 'Nước tương';
  if (lower.includes('dầu hào')) return 'Dầu hào';
  if (lower.includes('dầu ăn') || lower.includes('dầu thực vật')) return 'Dầu ăn';
  if (lower.includes('dầu ô-liu') || lower.includes('dầu ô liu') || lower.includes('dầu olive')) return 'Dầu ô-liu';
  if (lower.includes('đường')) return 'Đường';
  if (lower.includes('muối')) return 'Muối';
  if (lower.includes('tiêu')) return 'Tiêu xay';
  if (lower.includes('hạt nêm')) return 'Hạt nêm';
  if (lower.includes('bột ngọt') || lower.includes('mì chính')) return 'Bột ngọt';
  if (lower.includes('giấm')) return 'Giấm gạo';

  // 2. Generic Cleaning for non-dictionary items:
  // Remove parentheticals
  s = s.replace(/\s*\([^)]*\)/g, '').trim();

  // Strip preparation modifiers
  for (const mod of PREPARATION_MODIFIERS) {
    const reg = new RegExp(`\\b${mod}\\b`, 'gi');
    s = s.replace(reg, '').trim();
  }

  // Remove leading/trailing punctuation and excess spaces
  s = s.replace(/^[,.\-&/]+|[,.\-&/]+$/g, '').replace(/\s{2,}/g, ' ').trim();

  // Capitalize first letter
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s || rawName.trim();
}

/**
 * Decomposes bundled compound ingredients containing '&' or ' và ' into separate individual items.
 * e.g., "Cà rốt & Khoai tây cắt miếng lớn" (300g) -> 
 *   [ { name: "Cà rốt", amount: 150, unit: "g" }, { name: "Khoai tây", amount: 150, unit: "g" } ]
 */
export function decomposeBundledIngredients(
  name: string,
  amount: number | string | undefined | null,
  unit: string | undefined | null,
  category: string,
  cost: number = 0
): Array<{ name: string; amount: number; unit: string; category: any; cost: number }> {
  const rawName = (name || '').trim();
  const parsedAmt = typeof amount === 'number' ? amount : (parseFloat(String(amount || '1')) || 1);
  const safeUnit = (unit || '').trim();

  // Detect bundled pattern with '&' or ' và '
  if (rawName.includes('&') || rawName.includes(' và ')) {
    const parts = rawName.split(/\s*&\s*|\s+và\s+/i).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // Split amount and cost proportionally
      const count = parts.length;
      const splitAmount = Math.max(0.1, Math.round((parsedAmt / count) * 100) / 100);
      const splitCost = Math.round(cost / count);

      return parts.map(part => ({
        name: part,
        amount: splitAmount,
        unit: safeUnit,
        category: category as any,
        cost: splitCost
      }));
    }
  }

  return [{
    name: rawName,
    amount: parsedAmt,
    unit: safeUnit,
    category: category as any,
    cost
  }];
}

// Safely parse numerical amount from number, string, or fraction
export function parseAmount(val: number | string | undefined | null): number {
  if (val === null || val === undefined) return 1;
  if (typeof val === 'number') {
    return Number.isFinite(val) && val > 0 ? val : 1;
  }
  if (typeof val === 'string') {
    const sanitized = val.trim().replace(',', '.');
    if (sanitized.includes('/')) {
      const parts = sanitized.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        return Math.max(0.01, num / den);
      }
    }
    const parsed = parseFloat(sanitized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
  return 1;
}

/**
 * Normalizes an ingredient unit, amount, and canonical name into a unified aggregation key.
 * Converts produce measured in count (quả, củ, bắp, miếng) into weight (grams)
 * when that produce is standardly traded by weight, ensuring dishes with different
 * units for the same ingredient merge seamlessly into a single item.
 */
export function normalizeIngredientUnitAndAmount(
  rawName: string,
  rawAmount: number | string | undefined | null,
  rawUnit: string | undefined | null
): NormalizedIngredientInfo {
  const cleanName = canonicalizeIngredientName(rawName);
  const parsedAmt = parseAmount(rawAmount);
  const u = (rawUnit || '').trim().toLowerCase();
  const lowerName = cleanName.toLowerCase();

  // 1. Weight family: g, gram, gam, kg, kilogram, kí, ký, lạng, lang
  if (u === 'kg' || u === 'kilogram' || u === 'kí' || u === 'ký') {
    return {
      cleanName,
      baseAmount: parsedAmt * 1000,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${lowerName}__weight`
    };
  }
  if (u === 'lạng' || u === 'lang') {
    return {
      cleanName,
      baseAmount: parsedAmt * 100,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${lowerName}__weight`
    };
  }
  if (u === 'g' || u === 'gram' || u === 'gam' || u === 'gr') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${lowerName}__weight`
    };
  }

  // 2. Volume family: l, lít, lit, ml, mililit
  if (u === 'l' || u === 'lít' || u === 'lit') {
    return {
      cleanName,
      baseAmount: parsedAmt * 1000,
      baseUnit: 'ml',
      family: 'volume',
      groupKey: `${lowerName}__volume`
    };
  }
  if (u === 'ml' || u === 'mililit') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'ml',
      family: 'volume',
      groupKey: `${lowerName}__volume`
    };
  }

  // 3. Spoons family: muỗng canh vs thìa canh
  if (u === 'muỗng canh' || u === 'thìa canh' || u === 'muong canh' || u === 'thia canh' || u === 'tbsp') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'muỗng canh',
      family: 'spoon_soup',
      groupKey: `${lowerName}__spoon_soup`
    };
  }
  if (u === 'muỗng cà phê' || u === 'thìa cà phê' || u === 'muỗng cafe' || u === 'thìa cafe' || u === 'tsp') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'muỗng cà phê',
      family: 'spoon_tea',
      groupKey: `${lowerName}__spoon_tea`
    };
  }
  if (u === 'muỗng' || u === 'thìa') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'muỗng',
      family: 'spoon',
      groupKey: `${lowerName}__spoon`
    };
  }

  // 4. Produce Count-to-Weight Equivalence:
  // For produce that is commonly traded by weight (tomatoes, carrots, potatoes, onions, etc.),
  // map count (quả, củ, tép, nhánh) directly into weight family so that "2 kg" and "6 quả" merge!
  const produceConversion = PRODUCE_UNIT_WEIGHTS[lowerName];
  if (produceConversion && (u === produceConversion.unit || (produceConversion.alt && produceConversion.alt[u]))) {
    // If it's an egg, keep in count family unless already mixed with grams
    if (lowerName.includes('trứng')) {
      return {
        cleanName,
        baseAmount: parsedAmt,
        baseUnit: produceConversion.unit,
        family: 'count',
        groupKey: `${lowerName}__count`,
        isConvertibleProduce: true
      };
    }

    const unitGrams = produceConversion.alt && produceConversion.alt[u]
      ? produceConversion.alt[u]
      : produceConversion.grams;

    return {
      cleanName,
      baseAmount: parsedAmt * unitGrams,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${lowerName}__weight`,
      isConvertibleProduce: true
    };
  }

  // 5. Default / Other count units: quả, củ, bó, miếng, tép, nhánh, bát, gói, hộp...
  const safeUnit = rawUnit && rawUnit.trim() ? rawUnit.trim() : 'phần';
  return {
    cleanName,
    baseAmount: parsedAmt,
    baseUnit: safeUnit,
    family: 'other',
    groupKey: `${lowerName}__${safeUnit.toLowerCase()}`
  };
}

/**
 * Formats accumulated base amount back into clean, natural Vietnamese kitchen units.
 */
export function formatDisplayAmountAndUnit(
  baseAmount: number,
  family: NormalizedIngredientInfo['family'],
  baseUnit: string,
  rawUnitCounts?: Record<string, number>
): { amount: number; unit: string; displayStr: string } {
  if (family === 'weight') {
    if (baseAmount >= 1000) {
      const kg = Math.round((baseAmount / 1000) * 100) / 100;
      return {
        amount: kg,
        unit: 'kg',
        displayStr: `${kg} kg`
      };
    }
    const g = Math.round(baseAmount * 10) / 10;
    return {
      amount: g,
      unit: 'g',
      displayStr: `${g} g`
    };
  }

  if (family === 'volume') {
    if (baseAmount >= 1000) {
      const l = Math.round((baseAmount / 1000) * 100) / 100;
      return {
        amount: l,
        unit: 'lít',
        displayStr: `${l} lít`
      };
    }
    const ml = Math.round(baseAmount * 10) / 10;
    return {
      amount: ml,
      unit: 'ml',
      displayStr: `${ml} ml`
    };
  }

  const rounded = Math.round(baseAmount * 100) / 100;
  return {
    amount: rounded,
    unit: baseUnit,
    displayStr: `${rounded} ${baseUnit}`
  };
}
