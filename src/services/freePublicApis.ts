/**
 * Mealy Free Public APIs Integration Service (freePublicApis.ts)
 *
 * Connects Mealy to 100% free, zero-API-key public endpoints with resilient
 * local caching and instant offline fallbacks:
 * 1. Open-Meteo Free Weather API (https://api.open-meteo.com/v1/forecast)
 *    -> Real-time Vietnamese city temperature/weather -> Smart seasonal meal set suggestions.
 * 2. OpenFoodFacts Free Product & Barcode API (https://world.openfoodfacts.org)
 *    -> Real supermarket barcode & packaged food lookup for Smart Fridge inventory.
 * 3. VietQR Official Free QR Image API (https://img.vietqr.io)
 *    -> Instant bill-splitting QR generation for Collaborative Grocery rooms.
 */

export interface VietnamCityCoord {
  id: string;
  name: string;
  lat: number;
  lon: number;
  defaultRegion: 'bac' | 'trung' | 'nam';
}

export const VIETNAM_CITIES: VietnamCityCoord[] = [
  { id: 'hanoi', name: 'Hà Nội', lat: 21.0285, lon: 105.8542, defaultRegion: 'bac' },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297, defaultRegion: 'nam' },
  { id: 'danang', name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022, defaultRegion: 'trung' },
  { id: 'cantho', name: 'Cần Thơ', lat: 10.0452, lon: 105.7469, defaultRegion: 'nam' },
  { id: 'haiphong', name: 'Hải Phòng', lat: 20.8449, lon: 106.6881, defaultRegion: 'bac' },
  { id: 'dalat', name: 'Đà Lạt', lat: 11.9404, lon: 108.4583, defaultRegion: 'nam' }
];

export interface WeatherMealAdvice {
  cityId: string;
  cityName: string;
  temperatureC: number;
  humidityPercent: number;
  weatherCode: number;
  weatherLabel: string;
  icon: string;
  recommendedTag: string;
  culinaryAdvice: string;
  source: 'open-meteo-live' | 'cached' | 'seasonal-fallback';
  updatedAt: number;
}

export const WEATHER_CACHE_STORAGE_KEY = 'mealwise_weather_cache_v1';
const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Map WMO weather code & temperature to authentic Vietnamese culinary advice
 */
export function buildWeatherMealAdvice(
  city: VietnamCityCoord,
  temperatureC: number,
  humidityPercent: number,
  weatherCode: number,
  source: WeatherMealAdvice['source']
): WeatherMealAdvice {
  const temp = Math.round(temperatureC);
  const isRaining =
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    (weatherCode >= 95 && weatherCode <= 99);

  if (temp <= 21) {
    return {
      cityId: city.id,
      cityName: city.name,
      temperatureC: temp,
      humidityPercent: Math.round(humidityPercent),
      weatherCode,
      weatherLabel: isRaining ? 'Mưa lạnh' : 'Trời se lạnh',
      icon: isRaining ? '🌧️' : '🧣',
      recommendedTag: 'Cay Nồng',
      culinaryAdvice: `${city.name} ${temp}°C se lạnh • Hợp mâm cơm kho tiêu, canh gừng ấm bụng`,
      source,
      updatedAt: Date.now()
    };
  }

  if (isRaining) {
    return {
      cityId: city.id,
      cityName: city.name,
      temperatureC: temp,
      humidityPercent: Math.round(humidityPercent),
      weatherCode,
      weatherLabel: 'Trời có mưa',
      icon: '🌧️',
      recommendedTag: 'Đậm Đà',
      culinaryAdvice: `${city.name} ${temp}°C có mưa • Gợi ý món kho rim đậm đà đưa cơm`,
      source,
      updatedAt: Date.now()
    };
  }

  if (temp >= 32) {
    return {
      cityId: city.id,
      cityName: city.name,
      temperatureC: temp,
      humidityPercent: Math.round(humidityPercent),
      weatherCode,
      weatherLabel: 'Trời nắng nóng',
      icon: '☀️',
      recommendedTag: 'Thanh Tịnh',
      culinaryAdvice: `${city.name} ${temp}°C nắng ấm • Ưu tiên canh chua, rau luộc thanh mát`,
      source,
      updatedAt: Date.now()
    };
  }

  if (temp >= 28) {
    return {
      cityId: city.id,
      cityName: city.name,
      temperatureC: temp,
      humidityPercent: Math.round(humidityPercent),
      weatherCode,
      weatherLabel: 'Nắng dịu',
      icon: '🌤️',
      recommendedTag: 'Eat Clean',
      culinaryAdvice: `${city.name} ${temp}°C nắng đẹp • Hợp mâm cơm ít dầu mỡ, nhiều rau xanh`,
      source,
      updatedAt: Date.now()
    };
  }

  return {
    cityId: city.id,
    cityName: city.name,
    temperatureC: temp,
    humidityPercent: Math.round(humidityPercent),
    weatherCode,
    weatherLabel: 'Thời tiết mát mẻ',
    icon: '⛅',
    recommendedTag: 'Đồng Quê',
    culinaryAdvice: `${city.name} ${temp}°C mát mẻ • Tuyệt vời cho mâm cơm gia đình truyền thống`,
    source,
    updatedAt: Date.now()
  };
}

/**
 * Get instant fallback weather advice when offline or before API resolves
 */
export function getFallbackWeatherAdvice(cityId = 'hanoi'): WeatherMealAdvice {
  const city = VIETNAM_CITIES.find(c => c.id === cityId) || VIETNAM_CITIES[0];
  const defaultTemp =
    city.id === 'dalat' ? 19 : city.id === 'hcm' || city.id === 'cantho' ? 32 : city.id === 'danang' ? 29 : 25;
  return buildWeatherMealAdvice(city, defaultTemp, 72, 1, 'seasonal-fallback');
}

/**
 * Fetch live weather from Open-Meteo Free API (no API key required)
 */
export async function fetchLiveWeatherMealAdvice(
  cityId = 'hanoi',
  forceRefresh = false
): Promise<WeatherMealAdvice> {
  const city = VIETNAM_CITIES.find(c => c.id === cityId) || VIETNAM_CITIES[0];

  // Check local cache first
  if (!forceRefresh && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_STORAGE_KEY);
      if (raw) {
        const cacheMap: Record<string, WeatherMealAdvice> = JSON.parse(raw);
        const cached = cacheMap[city.id];
        if (cached && Date.now() - cached.updatedAt < WEATHER_CACHE_TTL_MS) {
          return { ...cached, source: 'cached' };
        }
      }
    } catch {}
  }

  if (typeof fetch !== 'function') {
    return getFallbackWeatherAdvice(city.id);
  }

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4500) : null;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FHo_Chi_Minh`;
    const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const temp = Number(data?.current?.temperature_2m ?? 26);
      const humidity = Number(data?.current?.relative_humidity_2m ?? 70);
      const code = Number(data?.current?.weather_code ?? 1);

      const advice = buildWeatherMealAdvice(city, temp, humidity, code, 'open-meteo-live');

      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(WEATHER_CACHE_STORAGE_KEY);
          const cacheMap: Record<string, WeatherMealAdvice> = raw ? JSON.parse(raw) : {};
          cacheMap[city.id] = advice;
          localStorage.setItem(WEATHER_CACHE_STORAGE_KEY, JSON.stringify(cacheMap));
        } catch {}
      }

      return advice;
    }
  } catch {}

  return getFallbackWeatherAdvice(city.id);
}

// ============================================================================
// 2. OPENFOODFACTS FREE BARCODE & PACKAGED FOOD API + VIETNAMESE CATALOG
// ============================================================================

export interface BarcodeFoodItem {
  barcode: string;
  name: string;
  brand: string;
  category: 'Thịt / Hải sản' | 'Rau củ quả' | 'Trứng & Đậu' | 'Đồ khô & Gia vị' | 'Đồ uống' | 'Đồ ăn thừa' | 'Khác';
  compartment: 'freezer' | 'fridge' | 'crisper';
  quantity: string;
  daysLeft: number;
  caloriesPer100g?: number;
  estimatedDiscountVnd: number;
  note: string;
  source: 'vietnam-catalog' | 'openfoodfacts-api';
}

export const VIETNAMESE_SUPERMARKET_BARCODES: BarcodeFoodItem[] = [
  {
    barcode: '8934673100113',
    name: 'Sữa tươi tiệt trùng Vinamilk 100%',
    brand: 'Vinamilk',
    category: 'Đồ uống',
    compartment: 'fridge',
    quantity: '1 lốc (4 hộp)',
    daysLeft: 14,
    caloriesPer100g: 62,
    estimatedDiscountVnd: 32000,
    note: 'Dùng uống sáng hoặc làm bánh flan, súp kem',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8935049500544',
    name: 'Sữa tươi sạch TH True Milk ít đường',
    brand: 'TH True Milk',
    category: 'Đồ uống',
    compartment: 'fridge',
    quantity: '1 hộp 1L',
    daysLeft: 7,
    caloriesPer100g: 60,
    estimatedDiscountVnd: 38000,
    note: 'Bảo quản ngăn mát 4°C sau khi mở nắp',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8936136160015',
    name: 'Thịt ba rọi heo mát MEATDeli',
    brand: 'MEATDeli',
    category: 'Thịt / Hải sản',
    compartment: 'fridge',
    quantity: '350 g',
    daysLeft: 3,
    caloriesPer100g: 290,
    estimatedDiscountVnd: 65000,
    note: 'Công nghệ Oxy-Fresh ủ mát chuẩn châu Âu, kho tàu hoặc rang cháy cạnh',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8934588012119',
    name: 'Trứng gà tươi CP vỉ 10 quả',
    brand: 'C.P. Việt Nam',
    category: 'Trứng & Đậu',
    compartment: 'fridge',
    quantity: '10 quả',
    daysLeft: 10,
    caloriesPer100g: 155,
    estimatedDiscountVnd: 35000,
    note: 'Ốp la bữa sáng, chiên thịt băm hoặc kho thịt tàu',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8935001711025',
    name: 'Đậu hũ non Ichiban hộp 300g',
    brand: 'Ichiban',
    category: 'Trứng & Đậu',
    compartment: 'fridge',
    quantity: '1 hộp (300 g)',
    daysLeft: 4,
    caloriesPer100g: 55,
    estimatedDiscountVnd: 16000,
    note: 'Nấu canh rong biển thịt băm hoặc sốt cà chua mềm mịn',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8938505977012',
    name: 'Kim chi cải thảo cắt lát Ông Kim',
    brand: 'CJ Cầu Tre',
    category: 'Rau củ quả',
    compartment: 'fridge',
    quantity: '300 g',
    daysLeft: 15,
    caloriesPer100g: 32,
    estimatedDiscountVnd: 32000,
    note: 'Ăn kèm đồ nướng, nấu canh kim chi đậu phụ hoặc rang cơm',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8936036020118',
    name: 'Giò lụa truyền thống Vissan',
    brand: 'Vissan',
    category: 'Thịt / Hải sản',
    compartment: 'fridge',
    quantity: '250 g',
    daysLeft: 5,
    caloriesPer100g: 210,
    estimatedDiscountVnd: 42000,
    note: 'Thái khoanh chấm mắm tiêu hoặc kho rim mặn ngọt',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8934563138165',
    name: 'Mì Hảo Hảo tôm chua cay',
    brand: 'Acecook',
    category: 'Đồ khô & Gia vị',
    compartment: 'fridge',
    quantity: '5 gói',
    daysLeft: 90,
    caloriesPer100g: 350,
    estimatedDiscountVnd: 22000,
    note: 'Xào bò rau cải hoặc nấu bữa sáng nhanh gọn',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8936017361018',
    name: 'Nước mắm Nam Ngư Phú Quốc',
    brand: 'Masan',
    category: 'Đồ khô & Gia vị',
    compartment: 'fridge',
    quantity: '1 chai 500ml',
    daysLeft: 120,
    caloriesPer100g: 45,
    estimatedDiscountVnd: 35000,
    note: 'Gia vị cốt lõi pha nước chấm và kho cá thịt',
    source: 'vietnam-catalog'
  },
  {
    barcode: '8934673501026',
    name: 'Sữa chua ăn Vinamilk có đường',
    brand: 'Vinamilk',
    category: 'Đồ uống',
    compartment: 'fridge',
    quantity: '1 lốc (4 hộp)',
    daysLeft: 12,
    caloriesPer100g: 95,
    estimatedDiscountVnd: 26000,
    note: 'Tráng miệng tốt cho tiêu hóa sau bữa tối',
    source: 'vietnam-catalog'
  }
];

/**
 * Infer Vietnamese pantry category & compartment from OpenFoodFacts tags/name
 */
function inferCategoryFromOpenFoodFacts(name: string, categoriesRaw = ''): {
  category: BarcodeFoodItem['category'];
  compartment: BarcodeFoodItem['compartment'];
  daysLeft: number;
} {
  const combined = `${name} ${categoriesRaw}`.toLowerCase();
  if (/sữa|milk|yogurt|nước|drink|beverage|juice|trà|cà phê/.test(combined)) {
    return { category: 'Đồ uống', compartment: 'fridge', daysLeft: 10 };
  }
  if (/thịt|meat|pork|beef|chicken|fish|cá|tôm|shrimp|sausage|xúc xích|giò|chả/.test(combined)) {
    return { category: 'Thịt / Hải sản', compartment: 'fridge', daysLeft: 3 };
  }
  if (/trứng|egg|tofu|đậu phụ|đậu hũ|cheese|phô mai/.test(combined)) {
    return { category: 'Trứng & Đậu', compartment: 'fridge', daysLeft: 5 };
  }
  if (/rau|vegetable|fruit|trái cây|kim chi|kimchi|nấm|salad/.test(combined)) {
    return { category: 'Rau củ quả', compartment: 'crisper', daysLeft: 4 };
  }
  if (/đông lạnh|frozen|ice cream|kem/.test(combined)) {
    return { category: 'Thịt / Hải sản', compartment: 'freezer', daysLeft: 30 };
  }
  return { category: 'Đồ khô & Gia vị', compartment: 'fridge', daysLeft: 30 };
}

/**
 * Lookup packaged food by barcode or product name using OpenFoodFacts Free API
 * with instant local Vietnamese catalog fallback.
 */
export async function lookupProductByBarcodeOrName(query: string): Promise<BarcodeFoodItem | null> {
  const clean = (query || '').trim();
  if (!clean) return null;

  const digitsOnly = clean.replace(/\D/g, '');
  const lower = clean.toLowerCase();

  // 1. Check built-in Vietnamese Supermarket Catalog first (instant <1ms match)
  const localMatch = VIETNAMESE_SUPERMARKET_BARCODES.find(
    item =>
      (digitsOnly.length >= 6 && item.barcode.includes(digitsOnly)) ||
      item.name.toLowerCase().includes(lower) ||
      item.brand.toLowerCase().includes(lower)
  );
  if (localMatch) {
    return localMatch;
  }

  // 2. Query OpenFoodFacts Free Public API when online
  if (typeof fetch === 'function') {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4500) : null;

      if (digitsOnly.length >= 8) {
        // Direct Barcode Lookup endpoint
        const res = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(digitsOnly)}.json?fields=product_name,product_name_vi,brands,quantity,categories,nutriments`,
          controller ? { signal: controller.signal } : undefined
        );
        if (timeoutId) clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const prod = data?.product;
          const prodName = prod?.product_name_vi || prod?.product_name;
          if (prod && prodName) {
            const inferred = inferCategoryFromOpenFoodFacts(prodName, prod.categories || '');
            return {
              barcode: digitsOnly,
              name: String(prodName).trim(),
              brand: String(prod.brands || 'Chính hãng').split(',')[0].trim(),
              category: inferred.category,
              compartment: inferred.compartment,
              quantity: String(prod.quantity || '1 gói/hộp').trim(),
              daysLeft: inferred.daysLeft,
              caloriesPer100g: Number(prod?.nutriments?.['energy-kcal_100g'] || 120),
              estimatedDiscountVnd: 30000,
              note: `Tra cứu từ cơ sở dữ liệu OpenFoodFacts (${prod.brands || 'Mã vạch ' + digitsOnly})`,
              source: 'openfoodfacts-api'
            };
          }
        }
      } else {
        // Text Search endpoint
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(clean)}&search_simple=1&action=process&json=1&page_size=3`,
          controller ? { signal: controller.signal } : undefined
        );
        if (timeoutId) clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const first = Array.isArray(data?.products) ? data.products.find((p: any) => p?.product_name_vi || p?.product_name) : null;
          if (first) {
            const prodName = first.product_name_vi || first.product_name;
            const inferred = inferCategoryFromOpenFoodFacts(prodName, first.categories || '');
            return {
              barcode: String(first.code || '8930000000000'),
              name: String(prodName).trim(),
              brand: String(first.brands || 'Siêu thị').split(',')[0].trim(),
              category: inferred.category,
              compartment: inferred.compartment,
              quantity: String(first.quantity || '1 phần').trim(),
              daysLeft: inferred.daysLeft,
              caloriesPer100g: Number(first?.nutriments?.['energy-kcal_100g'] || 120),
              estimatedDiscountVnd: 30000,
              note: `Tra cứu trực tiếp qua OpenFoodFacts`,
              source: 'openfoodfacts-api'
            };
          }
        }
      }
    } catch {}
  }

  return null;
}

// ============================================================================
// 3. VIETQR FREE BANK TRANSFER QR API FOR COLLAB GROCERY BILL SPLITTING
// ============================================================================

export interface VietQrBankInfo {
  id: string;
  bin: string;
  shortName: string;
  fullName: string;
}

export const VIETQR_SUPPORTED_BANKS: VietQrBankInfo[] = [
  { id: 'vcb', bin: '970436', shortName: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
  { id: 'tcb', bin: '970407', shortName: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  { id: 'mb', bin: '970422', shortName: 'MBBank', fullName: 'Ngân hàng TMCP Quân Đội' },
  { id: 'bidv', bin: '970418', shortName: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { id: 'icb', bin: '970415', shortName: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam' },
  { id: 'acb', bin: '970416', shortName: 'ACB', fullName: 'Ngân hàng TMCP Á Châu' },
  { id: 'tpb', bin: '970423', shortName: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong' },
  { id: 'vpb', bin: '970432', shortName: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' }
];

/**
 * Generate a scannable VietQR payment image URL (100% free public endpoint)
 */
export function generateVietQrBillUrl(params: {
  bankBin: string;
  accountNo: string;
  accountName?: string;
  totalAmountVnd: number;
  splitCount: number;
  roomId?: string;
}): {
  qrImageUrl: string;
  perPersonAmountVnd: number;
  transferMemo: string;
} {
  const safeSplit = Math.max(1, Math.min(20, Math.floor(params.splitCount || 2)));
  const total = Math.max(0, Math.round(params.totalAmountVnd || 0));
  // Round per-person amount to nearest 1,000 VND for clean bank transfers
  const perPersonAmountVnd = total > 0 ? Math.ceil(total / safeSplit / 1000) * 1000 : 0;
  const cleanAccountNo = (params.accountNo || '').replace(/[^a-zA-Z0-9]/g, '').trim() || '0123456789';
  const cleanBin = (params.bankBin || '970436').trim();
  const transferMemo = `MEALY DI CHO ${params.roomId || ''}`.trim();
  const accountNameParam = params.accountName
    ? `&accountName=${encodeURIComponent(params.accountName.trim().toUpperCase())}`
    : '';

  const qrImageUrl = `https://img.vietqr.io/image/${cleanBin}-${cleanAccountNo}-compact2.png?amount=${perPersonAmountVnd}&addInfo=${encodeURIComponent(transferMemo)}${accountNameParam}`;

  return {
    qrImageUrl,
    perPersonAmountVnd,
    transferMemo
  };
}
