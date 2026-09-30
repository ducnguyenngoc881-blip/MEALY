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
  'cà chua': { unit: 'quả', grams: 100, alt: { 'trái': 100, 'muỗng canh': 15, 'thìa canh': 15 } },
  'cà chua bi': { unit: 'quả', grams: 15, alt: { 'trái': 15 } },
  'chanh': { unit: 'quả', grams: 50, alt: { 'trái': 50, 'muỗng canh': 15, 'muỗng cà phê': 5, 'thìa canh': 15, 'thìa cà phê': 5 } },
  'hành tây': { unit: 'củ', grams: 150, alt: { 'củ nhỏ': 100, 'củ to': 250 } },
  'cà rốt': { unit: 'củ', grams: 100, alt: { 'củ nhỏ': 80, 'củ to': 150 } },
  'khoai tây': { unit: 'củ', grams: 150, alt: { 'củ nhỏ': 100, 'củ to': 200 } },
  'khoai lang': { unit: 'củ', grams: 150, alt: { 'củ nhỏ': 100, 'củ to': 200 } },
  'dưa leo': { unit: 'quả', grams: 150, alt: { 'trái': 150 } },
  'dưa chuột': { unit: 'quả', grams: 150, alt: { 'trái': 150 } },
  'tỏi': { unit: 'củ', grams: 30, alt: { 'tép': 5, 'nhánh': 5, 'lát': 3, 'muỗng canh': 15, 'muỗng cà phê': 5, 'thìa canh': 15, 'thìa cà phê': 5, 'củ / tép': 10, 'bát con': 100 } },
  'hành tím': { unit: 'củ', grams: 15, alt: { 'tép': 5, 'củ nhỏ': 10 } },
  'hành khô': { unit: 'củ', grams: 15, alt: { 'tép': 5, 'củ nhỏ': 10 } },
  'hành tím (hành khô)': { unit: 'củ', grams: 15, alt: { 'tép': 5, 'củ nhỏ': 10 } },
  'gừng': { unit: 'củ', grams: 40, alt: { 'nhánh': 20, 'lát': 5, 'muỗng canh': 15, 'muỗng cà phê': 5, 'thìa canh': 15, 'thìa cà phê': 5 } },
  'sả': { unit: 'cây', grams: 20, alt: { 'nhánh': 20, 'bó': 100 } },
  'ớt': { unit: 'quả', grams: 10, alt: { 'trái': 10, 'muỗng canh': 15, 'muỗng cà phê': 5, 'thìa canh': 15, 'thìa cà phê': 5 } },
  'ớt tươi': { unit: 'quả', grams: 10, alt: { 'trái': 10, 'muỗng canh': 15, 'muỗng cà phê': 5, 'thìa canh': 15, 'thìa cà phê': 5 } },
  'dứa': { unit: 'quả', grams: 600, alt: { 'trái': 600, 'bó': 600, 'lát': 50 } },
  'thơm': { unit: 'quả', grams: 600, alt: { 'trái': 600, 'bó': 600, 'lát': 50 } },
  'dứa (thơm)': { unit: 'quả', grams: 600, alt: { 'trái': 600, 'bó': 600, 'lát': 50 } },
  'bắp cải': { unit: 'bắp', grams: 800, alt: { 'cái': 800 } },
  'súp lơ xanh': { unit: 'cái', grams: 400, alt: { 'cây': 400, 'bông': 400 } },
  'súp lơ': { unit: 'cái', grams: 400, alt: { 'cây': 400, 'bông': 400 } },
  'bông cải xanh': { unit: 'cái', grams: 400, alt: { 'cây': 400, 'bông': 400 } },
  'bắp ngô': { unit: 'bắp', grams: 250, alt: { 'trái': 250 } },
  'bắp ngọt (ngô)': { unit: 'bắp', grams: 250, alt: { 'trái': 250 } },
  'ngô ngọt': { unit: 'bắp', grams: 250, alt: { 'trái': 250 } },
  'mướp hương': { unit: 'quả', grams: 250, alt: { 'trái': 250, 'quả nhỏ': 150 } },
  'bí đỏ': { unit: 'quả', grams: 800 },
  'bí đao': { unit: 'quả', grams: 700 },
  'đậu bắp': { unit: 'quả', grams: 20, alt: { 'trái': 20 } },
  'hành lá': { unit: 'nhánh', grams: 10, alt: { 'bó': 100, 'bó nhỏ': 50, 'cây': 10, 'mớ': 100 } },
  'rau muống': { unit: 'bó', grams: 300, alt: { 'bó nhỏ': 200, 'mớ': 300 } },
  'rau mồng tơi': { unit: 'bó', grams: 300, alt: { 'bó nhỏ': 200, 'mớ': 300 } },
  'rau ngót': { unit: 'bó', grams: 200, alt: { 'mớ': 200 } },
  'cải ngọt': { unit: 'bó', grams: 300, alt: { 'bó nhỏ': 200, 'mớ': 300 } },
  'cải thìa': { unit: 'cây', grams: 50, alt: { 'bó': 300, 'bó nhỏ': 200 } },
  'đậu phụ': { unit: 'miếng', grams: 150, alt: { 'bìa': 150, 'hộp': 300 } },
  'nấm hương': { unit: 'tai', grams: 5, alt: { 'muỗng canh': 10, 'muỗng cà phê': 3, 'thìa canh': 10, 'thìa cà phê': 3 } },
  'nấm tươi': { unit: 'gói', grams: 150, alt: { 'tai': 20, 'hộp': 200 } },
  'nấm rơm': { unit: 'gói', grams: 150, alt: { 'hộp': 200 } },
  'nấm bào ngư': { unit: 'gói', grams: 150, alt: { 'hộp': 200 } },
  'rau mùi (ngò rí)': { unit: 'nhánh', grams: 5, alt: { 'cây': 5, 'bó': 50, 'bó nhỏ': 30 } },
  'mùi tàu (ngò gai)': { unit: 'lá', grams: 3, alt: { 'nhánh': 5, 'cây': 5, 'bó': 50, 'bó nhỏ': 30 } },
  'thì là': { unit: 'nhánh', grams: 5, alt: { 'cây': 5, 'bó': 50, 'bó nhỏ': 30 } },
  'gạo': { unit: 'g', grams: 1, alt: { 'muỗng canh': 15, 'thìa canh': 15, 'bát': 150, 'chén': 150 } },
  'chuối chín': { unit: 'quả', grams: 100, alt: { 'trái': 100 } },
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
  const lower = s.toLowerCase();

  // 1. Specific negative guards & disambiguation exceptions
  if (lower.includes('chuối tiêu') || lower.includes('chuối')) return 'Chuối chín';
  if (lower.includes('cà pháo muối') || lower.includes('cà pháo')) return 'Cà pháo muối';
  if (lower.includes('dưa cải') || lower.includes('dưa muối') || lower.includes('dưa chua')) return 'Dưa cải muối chua';
  if (lower.includes('pate')) return 'Pate';
  if (lower.includes('rau thơm')) return 'Rau thơm';
  if (lower.includes('mướp đắng') || lower.includes('khổ qua')) return 'Mướp đắng (khổ qua)';
  if (lower.includes('tương ớt')) return 'Tương ớt';
  if (lower.includes('tương cà')) return 'Tương cà';
  if (lower.includes('hạt nêm')) return 'Hạt nêm';
  if (lower.includes('bột ngọt') || lower.includes('mì chính')) return 'Bột ngọt';

  // 2. Pasta / Spaghetti / Noodles (e.g., Mì Ý sợi dài Spaghetti, Spaghetti lúa mì cứng -> unified)
  if (lower.includes('spaghetti') || lower.includes('mì ý')) return 'Mì Ý (Spaghetti)';
  if (lower.includes('penne') || lower.includes('nui') || lower.includes('pasta') || lower.includes('fusilli')) return 'Nui (Pasta)';
  if (lower.includes('mì trứng')) return 'Mì trứng';
  if (lower.includes('bún tươi') || lower === 'bún') return 'Bún tươi';
  if (lower.includes('bánh phở') || lower === 'phở') return 'Bánh phở tươi';
  if (lower.includes('miến dong') || (/\bmiến\b/i.test(lower) && !lower.includes('miếng'))) return 'Miến dong';
  if (lower.includes('bánh đa')) return 'Bánh đa đỏ';

  // 3. Dairy / Butter / Cheese / Cream
  if (lower.includes('bơ sáp') || lower.includes('bơ 034') || lower.includes('bơ đắk lắk')) return 'Trái bơ sáp (Avocado)';
  if (lower.includes('mozzarella')) return 'Phô mai Mozzarella';
  if (lower.includes('parmesan')) return 'Phô mai Parmesan';
  if (lower.includes('cheddar')) return 'Phô mai Cheddar';
  if (lower.includes('whipping') || lower.includes('cooking cream') || lower.includes('kem béo') || lower.includes('kem tươi')) return 'Kem tươi (Whipping cream)';
  if (lower.includes('bơ lạt') || lower.includes('bơ anchor') || (lower.includes('bơ') && !lower.includes('bánh mì') && !lower.includes('bơ tỏi') && !lower.includes('sốt bơ'))) return 'Bơ lạt';
  if (lower.includes('sữa đặc')) return 'Sữa đặc';
  if (lower.includes('sữa tươi')) return 'Sữa tươi';

  // 4. Bánh mì
  if (lower.includes('bánh mì sandwich') || lower.includes('sandwich')) return 'Bánh mì sandwich';
  if (lower.includes('bánh mì bơ tỏi') || lower.includes('crouton')) return 'Bánh mì bơ tỏi';
  if (lower.includes('bánh mì burger') || lower.includes('burger')) return 'Vỏ bánh mì burger';
  if (lower.includes('tortilla')) return 'Vỏ bánh Tortilla';

  // 5. Western Herbs
  if (lower.includes('oregano')) return 'Lá Oregano khô';
  if (lower.includes('rosemary') || lower.includes('hương thảo')) return 'Lá hương thảo (Rosemary)';
  if (lower.includes('thyme') || lower.includes('xạ hương')) return 'Lá xạ hương (Thyme)';
  if (lower.includes('basil') || lower.includes('húng tây') || lower.includes('húng quế ý')) return 'Húng tây (Basil)';

  // 6. Beef
  if (lower.includes('bắp bò')) return 'Bắp bò';
  if (lower.includes('dẻ sườn bò') || lower.includes('sườn bò')) return 'Dẻ sườn bò';
  if (lower.includes('gầu bò')) return 'Gầu bò';
  if (lower.includes('nạc vai bò')) return 'Nạc vai bò';
  if (lower.includes('ba chỉ bò')) return 'Ba chỉ bò';
  if (lower.includes('nạm bò')) return 'Nạm bò';
  if (lower.includes('thăn lưng') || lower.includes('ribeye') || lower.includes('striploin') || lower.includes('thăn bò') || (lower.includes('thịt bò') && !lower.includes('xương'))) return 'Thịt bò thăn';
  if (lower.includes('xương ống bò') || lower.includes('xương bò')) return 'Xương ống bò';

  // 7. Pork
  if (lower.includes('sườn non') || lower.includes('sườn cây') || lower.includes('sườn que') || lower.includes('sườn heo')) return 'Sườn non heo';
  if (lower.includes('sườn sụn')) return 'Sườn sụn heo';
  if (lower.includes('thịt ba chỉ') || lower.includes('ba chỉ heo') || lower.includes('ba rọi')) return 'Thịt ba chỉ';
  if (lower.includes('nạc dăm')) return 'Thịt nạc dăm';
  if (lower.includes('nạc vai')) return 'Thịt nạc vai';
  if (lower.includes('thăn cốt lết') || lower.includes('cốt lết') || lower.includes('thăn heo') || lower.includes('thăn lợn')) return 'Thịt thăn heo';
  if (lower.includes('chân giò') || lower.includes('móng giò')) return 'Chân giò heo';
  if (lower.includes('giò sống') || lower.includes('mọc')) return 'Giò sống';
  if (lower.includes('chả lụa') || lower.includes('giò lụa')) return 'Chả lụa';
  if (lower.includes('heo xay') || lower.includes('lợn xay') || lower.includes('thịt băm') || (lower.includes('thịt heo') && lower.includes('xay'))) return 'Thịt heo xay';

  // 8. Poultry (Eggs evaluated strictly before birds)
  if (lower.includes('trứng cút')) return 'Trứng cút';
  if (lower.includes('trứng vịt')) return 'Trứng vịt';
  if (lower.includes('trứng gà') || lower.includes('trứng tươi') || lower.includes('trứng ta') || lower === 'trứng') return 'Trứng gà';
  if (lower.includes('đùi tỏi') || lower.includes('đùi gà')) return 'Đùi gà';
  if (lower.includes('cánh gà')) return 'Cánh gà';
  if (lower.includes('ức gà')) return 'Ức gà';
  if (lower.includes('thịt gà') || lower.includes('gà ta') || lower.includes('gà thả vườn') || lower.includes('gà nửa con')) return 'Thịt gà';
  if (lower.includes('thịt vịt') || lower.includes('vịt')) return 'Thịt vịt';

  // 9. Seafood
  if (lower.includes('cá hồi')) return 'Cá hồi';
  if (lower.includes('cá basa') || lower.includes('cá ba sa') || lower.includes('cá tuyết')) return 'Cá basa';
  if (lower.includes('cá nục')) return 'Cá nục';
  if (lower.includes('cá lóc') || lower.includes('cá quả') || lower.includes('cá chuối') || lower.includes('cá hú')) return 'Cá lóc';
  if (lower.includes('cá rô đồng') || lower.includes('cá rô')) return 'Cá rô đồng';
  if (lower.includes('cá thu')) return 'Cá thu';
  if (lower.includes('cá chim')) return 'Cá chim trắng';
  if (lower.includes('cá kèo')) return 'Cá kèo';
  if (lower.includes('cá diêu hồng') || lower.includes('cá điêu hồng')) return 'Cá diêu hồng';
  if (lower.includes('cá vược') || lower.includes('cá chẽm')) return 'Cá chẽm (vược)';
  if (lower.includes('cá trứng')) return 'Cá trứng';
  if (lower.includes('chả cá')) return 'Chả cá';
  if (lower.includes('tôm nõn') || lower.includes('tôm sú') || lower.includes('tôm thẻ') || lower.includes('tôm tươi') || lower === 'tôm') return 'Tôm tươi';
  if (lower.includes('mực ống') || lower.includes('mực tươi') || lower.includes('mực lá') || lower === 'mực') return 'Mực tươi';
  if (lower.includes('nghêu') || lower.includes('ngao')) return 'Nghêu (Ngao)';
  if (lower.includes('cua đồng')) return 'Cua đồng xay';

  // 10. Mushrooms (Must evaluate before chicken to avoid "Nấm đùi gà" -> "Đùi gà")
  if (lower.includes('nấm rơm')) return 'Nấm rơm';
  if (lower.includes('nấm đùi gà')) return 'Nấm đùi gà';
  if (lower.includes('nấm kim châm')) return 'Nấm kim châm';
  if (lower.includes('nấm hương') || lower.includes('đông cô')) return 'Nấm hương';
  if (lower.includes('nấm mỡ')) return 'Nấm mỡ';
  if (lower.includes('nấm bào ngư')) return 'Nấm bào ngư';
  if (lower.includes('nấm linh chi')) return 'Nấm linh chi';
  if (lower.includes('mộc nhĩ') || lower.includes('nấm mèo')) return 'Mộc nhĩ';
  if (lower.includes('nấm')) return 'Nấm tươi';

  // 11. Produce / Veggies
  if (lower.includes('cà chua')) return 'Cà chua';
  if (lower.includes('măng tây')) return 'Măng tây';
  if (lower.includes('cần tây')) return 'Cần tây';
  if (lower.includes('súp lơ') || lower.includes('bông cải')) return 'Súp lơ xanh';
  if (lower.includes('bắp cải')) return 'Bắp cải';
  if (lower.includes('khoai tây')) return 'Khoai tây';
  if (lower.includes('khoai lang')) return 'Khoai lang';
  if (lower.includes('cà rốt')) return 'Cà rốt';
  if (lower.includes('dưa leo') || lower.includes('dưa chuột')) return 'Dưa leo';
  if (lower.includes('xà lách') || lower.includes('romaine')) return 'Xà lách';
  if (lower.includes('rau muống')) return 'Rau muống';
  if (lower.includes('rau mồng tơi') || lower.includes('mồng tơi')) return 'Rau mồng tơi';
  if (lower.includes('rau ngót')) return 'Rau ngót';
  if (lower.includes('cải ngọt')) return 'Cải ngọt';
  if (lower.includes('cải thìa') || lower.includes('cải chíp')) return 'Cải thìa';
  if (lower.includes('mướp hương') || lower.includes('mướp')) return 'Mướp hương';
  if (lower.includes('bí đỏ')) return 'Bí đỏ';
  if (lower.includes('bí đao') || lower.includes('bí xanh')) return 'Bí đao';
  if (lower.includes('đậu bắp')) return 'Đậu bắp';
  if (lower.includes('đậu cô ve') || lower.includes('đậu cove') || lower.includes('đậu que')) return 'Đậu cô ve';
  if (lower.includes('giá đỗ') || lower.includes('giá sống')) return 'Giá đỗ';
  if (lower.includes('dứa') || lower.includes('thơm')) return 'Dứa (thơm)';
  if (lower.includes('đậu phụ') || lower.includes('đậu hũ')) return 'Đậu phụ';

  // 12. Aromatics
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

  // 13. Staples, Seasonings, Grains
  if (lower.includes('nước mắm')) return 'Nước mắm';
  if (lower.includes('nước tương') || lower.includes('xì dầu')) return 'Nước tương';
  if (lower.includes('dầu hào')) return 'Dầu hào';
  if (lower.includes('dầu ăn') || lower.includes('dầu thực vật')) return 'Dầu ăn';
  if (lower.includes('dầu ô-liu') || lower.includes('dầu ô liu') || lower.includes('dầu olive')) return 'Dầu ô-liu';
  if (lower.includes('đường')) return 'Đường';
  if (lower.includes('muối')) return 'Muối';
  if (lower.includes('tiêu')) return 'Tiêu xay';
  if (lower.includes('giấm')) return 'Giấm gạo';
  if (lower.includes('yến mạch')) return 'Yến mạch';
  if (lower.includes('gạo nếp')) return 'Gạo nếp';
  if (lower.includes('gạo')) return 'Gạo';
  if (lower.includes('xúc xích')) return 'Xúc xích';

  // 14. Generic Cleaning for non-dictionary items:
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
 * Detects whether an ingredient is a common household pantry staple (sugar, salt, fish sauce, cooking oil, etc.)
 * that ordinary families already keep stocked at home in bulk.
 * 
 * Niche and specialty sauces/spices (mắm tôm, dầu hào, dầu mè, ngũ vị hương, sa tế, cà ri, mắm nêm...)
 * and fresh produce (tỏi, ớt tươi, hành tím, gừng, sả...) are NEVER considered common staples and
 * remain visible in the weekly grocery shopping list.
 */
export function isCommonPantryStaple(rawName: string, category?: string): boolean {
  if (!rawName || typeof rawName !== 'string') return false;
  const s = rawName.toLowerCase().trim();

  // Fresh produce / meats / seafood are NEVER pantry staples
  if (category === 'thit-ca' || category === 'rau-cu') {
    return false;
  }

  // 1. Explicit NICHE & SPECIALTY exceptions that must ALWAYS be kept in the grocery list:
  const NICHE_EXCEPTIONS = [
    'mắm tôm', 'mắm tép', 'mắm nêm', 'mắm cá', 'mắm ruốc', 'mắm ba khía', 'mắm chưng',
    'dầu hào', 'dầu mè', 'dầu vừng', 'dầu điều', 'màu điều', 'dầu oliu', 'dầu ô liu', 'dầu ô-liu',
    'sa tế', 'sa-tế', 'tương bần', 'tương hột', 'tương đen', 'sốt tương',
    'ngũ vị hương', 'cà ri', 'cari', 'hoa hồi', 'tai vị', 'quế', 'thảo quả', 'mắc khén', 'hạt dổi',
    'nước cốt dừa', 'sữa đặc', 'bơ lạt', 'bơ', 'mayonnaise', 'sốt me', 'bột nghệ', 'tương cà',
    'chao', 'rượu mai quế lộ', 'mạch nha'
  ];
  for (const niche of NICHE_EXCEPTIONS) {
    if (s.includes(niche)) {
      return false; // Keep in grocery list!
    }
  }

  // 2. Identify common household staples:
  // Đường (sugar)
  if (s.includes('đường') && !s.includes('đường thốt nốt')) return true;
  // Muối & Bột canh (salt)
  if (s.includes('muối') || s === 'bột canh') return true;
  // Nước mắm (fish sauce)
  if (s.includes('nước mắm') || s === 'mắm cá cơm' || s === 'nước mắm ngon') return true;
  // Bột ngọt, mì chính, hạt nêm (bouillon / MSG)
  if (s.includes('hạt nêm') || s.includes('bột ngọt') || s.includes('mì chính') || s.includes('bột nêm')) return true;
  // Tiêu (pepper)
  if (s.includes('tiêu') && !s.includes('tiêu xanh') && !s.includes('sốt tiêu')) return true;
  // Dầu ăn / Mỡ lợn (cooking oil / lard)
  if (s.includes('dầu ăn') || s.includes('dầu thực vật') || s.includes('dầu rán') || s.includes('dầu chiên') || s.includes('mỡ heo') || s.includes('mỡ lợn')) return true;
  // Nước tương / Xì dầu (regular soy sauce)
  if ((s.includes('nước tương') || s.includes('xì dầu')) && !s.includes('tương đen') && !s.includes('tamari')) return true;
  // Tương ớt (hot sauce)
  if (s.includes('tương ớt')) return true;
  // Giấm thường (regular vinegar)
  if (s.includes('giấm') && !s.includes('giấm táo') && !s.includes('giấm balsamic')) return true;
  // Nước màu / Nước hàng (caramel coloring)
  if (s.includes('nước màu') || s.includes('nước hàng')) return true;

  return false;
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

  // 2. Resolve alternative clauses e.g. "Phô mai Parmesan hoặc Bơ lạt", "Cá hú (hoặc cá lóc)", "Cá Tuyết / Basa Phi Lê"
  let resolvedName = rawName;
  if (/\s+hoặc\s+/i.test(resolvedName)) {
    resolvedName = resolvedName.split(/\s+hoặc\s+/i)[0].trim();
  }
  if (/\s*\/\s*/.test(resolvedName) && !/\d+\/\d+/.test(resolvedName)) {
    const slashParts = resolvedName.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
    if (slashParts.length >= 2) {
      resolvedName = slashParts[0];
    }
  }

  return [{
    name: resolvedName,
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
  let rawU = (rawUnit || '').trim();
  let u = rawU.toLowerCase();
  const lowerName = cleanName.toLowerCase();
  const isProduce = Boolean(PRODUCE_UNIT_WEIGHTS[lowerName]);

  // 1. Check for embedded weight/volume in parentheses: e.g. "bó nhỏ (50g)", "bó (300g)", "củ nhỏ (80g)"
  const embeddedMatch = rawU.match(/\((\d+(?:\.\d+)?)\s*(g|kg|ml|l)\)/i) || (rawName && rawName.match(/\((\d+(?:\.\d+)?)\s*(g|kg|ml|l)\)/i));
  if (embeddedMatch) {
    const val = parseFloat(embeddedMatch[1]);
    const unitType = embeddedMatch[2].toLowerCase();
    if (unitType === 'g') {
      return { cleanName, baseAmount: parsedAmt * val, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
    }
    if (unitType === 'kg') {
      return { cleanName, baseAmount: parsedAmt * val * 1000, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
    }
    if (unitType === 'ml') {
      if (isProduce) {
        return { cleanName, baseAmount: parsedAmt * val, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
      }
      return { cleanName, baseAmount: parsedAmt * val, baseUnit: 'ml', family: 'volume', groupKey: `${lowerName}__volume` };
    }
    if (unitType === 'l') {
      if (isProduce) {
        return { cleanName, baseAmount: parsedAmt * val * 1000, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
      }
      return { cleanName, baseAmount: parsedAmt * val * 1000, baseUnit: 'ml', family: 'volume', groupKey: `${lowerName}__volume` };
    }
  }

  // Clean unit string (strip parentheticals for matching against aliases)
  const cleanUnitStr = u.replace(/\s*\([^)]*\)/g, '').trim();

  // Special Eggs handler: always count family, converting grams if needed
  if (lowerName.includes('trứng')) {
    const prod = PRODUCE_UNIT_WEIGHTS[lowerName] || { unit: 'quả', grams: 50 };
    if (['g', 'gram', 'gam'].includes(cleanUnitStr)) {
      const eggs = Math.max(1, Math.round(parsedAmt / prod.grams));
      return { cleanName, baseAmount: eggs, baseUnit: prod.unit, family: 'count', groupKey: `${lowerName}__count` };
    }
    return { cleanName, baseAmount: parsedAmt, baseUnit: prod.unit, family: 'count', groupKey: `${lowerName}__count` };
  }

  // 2. Weight family
  if (['kg', 'kilogram', 'kí', 'ký'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt * 1000, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
  }
  if (['lạng', 'lang'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt * 100, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
  }
  if (['g', 'gram', 'gam', 'gr'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
  }

  // 3. Volume family
  if (['l', 'lít', 'lit'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt * 1000, baseUnit: 'ml', family: 'volume', groupKey: `${lowerName}__volume` };
  }
  if (['ml', 'mililit'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt, baseUnit: 'ml', family: 'volume', groupKey: `${lowerName}__volume` };
  }

  // 4. Solid seasonings unification (Muối, Đường, Tiêu, Hạt nêm, Bột ngọt)
  const isSolidSeasoning = ['muối', 'đường', 'tiêu xay', 'hạt nêm', 'bột ngọt'].includes(lowerName);
  if (isSolidSeasoning) {
    let g = parsedAmt * 5;
    if (['muỗng canh', 'thìa canh', 'tbsp'].includes(cleanUnitStr)) g = parsedAmt * 15;
    else if (['muỗng cà phê', 'thìa cà phê', 'tsp', 'muỗng cafe', 'thìa cafe'].includes(cleanUnitStr)) g = parsedAmt * 5;
    else if (cleanUnitStr === 'nhúm') g = parsedAmt * 2;
    else if (['hộp', 'gói'].includes(cleanUnitStr)) g = parsedAmt * 500;
    else if (['cốc', 'bát con', 'bát'].includes(cleanUnitStr)) g = parsedAmt * 200;
    else if (cleanUnitStr === 'ml') g = parsedAmt * 1;
    return { cleanName, baseAmount: g, baseUnit: 'g', family: 'weight', groupKey: `${lowerName}__weight` };
  }

  // 5. Liquid seasonings unification (Nước mắm, Nước tương, Dầu ăn, Dầu hào, Dầu ô-liu, Giấm gạo)
  const isLiquidSeasoning = ['nước mắm', 'nước tương', 'dầu hào', 'dầu ăn', 'dầu ô-liu', 'giấm gạo'].includes(lowerName);
  if (isLiquidSeasoning) {
    let ml = parsedAmt * 15;
    if (['muỗng canh', 'thìa canh', 'tbsp'].includes(cleanUnitStr)) ml = parsedAmt * 15;
    else if (['muỗng cà phê', 'thìa cà phê', 'tsp'].includes(cleanUnitStr)) ml = parsedAmt * 5;
    return { cleanName, baseAmount: ml, baseUnit: 'ml', family: 'volume', groupKey: `${lowerName}__volume` };
  }

  // 6. Produce Count-to-Weight Equivalence (Check BEFORE generic spoons!)
  const prod = PRODUCE_UNIT_WEIGHTS[lowerName];
  if (prod) {
    let unitG = prod.grams;
    if (cleanUnitStr === prod.unit) unitG = prod.grams;
    else if (prod.alt && prod.alt[cleanUnitStr]) unitG = prod.alt[cleanUnitStr];
    
    return {
      cleanName,
      baseAmount: parsedAmt * unitG,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${lowerName}__weight`,
      isConvertibleProduce: true
    };
  }

  // 7. Generic Spoons for other items
  if (['muỗng canh', 'thìa canh', 'tbsp'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt, baseUnit: 'muỗng canh', family: 'spoon_soup', groupKey: `${lowerName}__spoon_soup` };
  }
  if (['muỗng cà phê', 'thìa cà phê', 'tsp', 'muỗng cafe', 'thìa cafe'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt, baseUnit: 'muỗng cà phê', family: 'spoon_tea', groupKey: `${lowerName}__spoon_tea` };
  }
  if (['muỗng', 'thìa'].includes(cleanUnitStr)) {
    return { cleanName, baseAmount: parsedAmt, baseUnit: 'muỗng', family: 'spoon', groupKey: `${lowerName}__spoon` };
  }

  // 8. Default / Other count units: quả, củ, bó, miếng, tép, nhánh, bát, gói, hộp...
  const safeUnit = cleanUnitStr || 'phần';
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

/**
 * Universal fuzzy matching for grocery item deletion, checkoff, and deduplication.
 * Accurately matches raw names, canonical names, diacritic-stripped forms, and prefix variants
 * while preserving distinct entities (e.g. "Nước mắm" !== "Nước tương").
 */
export function isGroceryItemMatch(target: string, candidate: string): boolean {
  if (!target || !candidate) return false;
  const tRaw = target.toLowerCase().trim();
  const cRaw = candidate.toLowerCase().trim();
  if (tRaw === cRaw) return true;

  const tClean = canonicalizeIngredientName(tRaw).toLowerCase().trim();
  const cClean = canonicalizeIngredientName(cRaw).toLowerCase().trim();
  if (tClean === cClean || tClean === cRaw || tRaw === cClean) return true;

  // Strip prefixes like [Tiệc]
  const tStripped = tRaw.replace(/^\[tiệc\]\s*/i, '').trim();
  const cStripped = cRaw.replace(/^\[tiệc\]\s*/i, '').trim();
  if (tStripped === cStripped) return true;
  if (canonicalizeIngredientName(tStripped).toLowerCase().trim() === cClean) return true;
  if (tClean === canonicalizeIngredientName(cStripped).toLowerCase().trim()) return true;

  // Substring checks (support 2+ characters for Vietnamese words like Cá, Bò, Gà, Mì, Ớt, Sả)
  if (tClean.length >= 2 && cClean.includes(tClean)) return true;
  if (cClean.length >= 2 && tClean.includes(cClean)) return true;
  if (tRaw.length >= 2 && cRaw.includes(tRaw)) return true;
  if (cRaw.length >= 2 && tRaw.includes(cRaw)) return true;

  // Diacritics stripped check (both clean and raw)
  const strip = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  const tNoAcc = strip(tClean);
  const cNoAcc = strip(cClean);
  const tRawNoAcc = strip(tRaw);
  const cRawNoAcc = strip(cRaw);
  if (tNoAcc === cNoAcc || tRawNoAcc === cRawNoAcc || tNoAcc === cRawNoAcc || tRawNoAcc === cNoAcc) return true;
  if (tNoAcc.length >= 2 && (cNoAcc.includes(tNoAcc) || cRawNoAcc.includes(tNoAcc))) return true;
  if (cNoAcc.length >= 2 && (tNoAcc.includes(cNoAcc) || tRawNoAcc.includes(cNoAcc))) return true;
  if (tRawNoAcc.length >= 2 && (cNoAcc.includes(tRawNoAcc) || cRawNoAcc.includes(tRawNoAcc))) return true;
  if (cRawNoAcc.length >= 2 && (tNoAcc.includes(cRawNoAcc) || tRawNoAcc.includes(cRawNoAcc))) return true;

  return false;
}

