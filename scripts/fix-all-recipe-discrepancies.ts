import * as fs from 'fs';
import * as path from 'path';
import { Recipe, DishCategory } from '../src/types';
import { recipesDatabase } from '../src/data/recipesDatabase';
import { westernDishes500 } from '../src/data/westernDishes500';
import { vietnameseDishesPart1 } from '../src/data/vietnameseDishesPart1';
import { vietnameseDishesPart2 } from '../src/data/vietnameseDishesPart2';
import { getDishImageUrl } from '../src/utils/dishImageResolver';

const CATEGORY_TAG_MAP: Record<DishCategory, string> = {
  'mon-man': 'Món Mặn',
  'mon-canh': 'Món Canh',
  'mon-rau': 'Món Rau',
  'mon-chay': 'Món Chay',
  'trang-mieng': 'Tráng Miệng',
  'an-sang': 'Ăn Sáng',
};

const ALL_CATEGORY_TAGS = new Set(Object.values(CATEGORY_TAG_MAP));

function setRecipeCategory(r: Recipe, newCat: DishCategory): boolean {
  if (r.category === newCat) return false;
  r.category = newCat;
  const newTagLabel = CATEGORY_TAG_MAP[newCat];
  if (Array.isArray(r.tags)) {
    let replaced = false;
    r.tags = r.tags.map(t => {
      if (ALL_CATEGORY_TAGS.has(t)) {
        replaced = true;
        return newTagLabel;
      }
      return t;
    });
    if (!replaced && newTagLabel) {
      r.tags.splice(1, 0, newTagLabel);
    }
  }
  return true;
}

// 1. Fix recipesDatabase.ts
let dbCatFixed = 0;
let dbIngFixed = 0;
let dbImgFixed = 0;

for (const r of recipesDatabase) {
  // Clean bilingual tag in title if present
  if (r.id === 'party-sinh-nhat-ga-ran-pizza') {
    r.title = r.title.replace(/\s*\(Kid Party Feast\)/i, '');
  }

  const t = r.title.toLowerCase();

  // Category fixes
  if (r.id === 'canh-ca-chua-trung-dau-ran' || r.id === 'sup-kem-bi-do-banh-mi-bo') {
    if (setRecipeCategory(r, 'mon-canh')) dbCatFixed++;
  } else if (r.id === 'che-hat-sen-long-nhan' || r.id === 'che-dau-den-nuoc-cot-dua') {
    if (setRecipeCategory(r, 'trang-mieng')) dbCatFixed++;
  } else if (r.id === 'french-fries-lac-pho-mai' || r.id === 'mon-au-fastfood-35-khoai-t-y-c-ng-chi-n-l-c-') {
    if (setRecipeCategory(r, 'mon-rau')) dbCatFixed++;
  } else if (r.category === 'mon-rau' || r.category === 'mon-chay' || r.category === 'trang-mieng') {
    const hasSavoryProtein =
      /(gà|bò|heo|lợn|sườn|cá |cá hồi|cá kèo|cá nục|cá rô|chả cá|tôm|mực|cua|vịt|thịt|xúc xích|lạp xưởng|hải sản|chả lụa|chả giò|xíu mại|pate|ba chỉ|ba rọi|chân giò|ốp la|trứng|hến|lươn|pizza|burger|tokbokki|bít tết|steak)/i.test(t) &&
      !t.includes('nấm đùi gà') &&
      !t.includes('muối tôm') &&
      !t.includes('rau càng cua') &&
      !t.includes('trứng cuốc') &&
      !t.includes('bánh da lợn') &&
      !t.includes('bánh bông lan') &&
      !t.includes('bánh pía') &&
      !t.includes('chay');
    if (hasSavoryProtein) {
      if (setRecipeCategory(r, 'mon-man')) dbCatFixed++;
    }
  }

  // Ingredient & chefTip fixes for recipesDatabase
  if (r.id === 'banh-mi-11-xuc-xich-nuong---trung-long--ao') {
    r.ingredients = [
      { name: 'Bánh mì ổ giòn nóng', amount: 4, unit: 'ổ', category: 'khac' },
      { name: 'Xúc xích Đức xông khói', amount: 4, unit: 'cây', category: 'thit-hai-san' },
      { name: 'Trứng gà tươi', amount: 4, unit: 'quả', category: 'trung-sua' },
      { name: 'Dưa leo & rau mùi tươi', amount: 150, unit: 'g', category: 'rau-cu' },
      { name: 'Tương ớt & sốt mayonnaise', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
    ];
    dbIngFixed++;
  } else if (r.id === 'chao-59-long-ga-nau-nam-huong') {
    r.ingredients = [
      { name: 'Lòng mề gà & tim gà tươi sạch', amount: 350, unit: 'g', category: 'thit-hai-san' },
      { name: 'Gạo tẻ thơm & gạo nếp', amount: 200, unit: 'g', category: 'khac' },
      { name: 'Nấm hương khô ngâm nở', amount: 60, unit: 'g', category: 'rau-cu' },
      { name: 'Gừng tươi thái chỉ & hành lá', amount: 50, unit: 'g', category: 'rau-cu' },
      { name: 'Nước mắm ngon & hạt tiêu xay', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
    ];
    r.chefTip = 'Bí quyết đầu bếp: Bóp kỹ lòng mề gà với muối hạt và chanh tươi để khử sạch mùi, xào săn cùng gừng và nấm hương trước khi cho vào nồi cháo sánh mịn.';
    dbIngFixed++;
  } else if (r.id.startsWith('mon-au-fastfood-') && r.ingredients.some(i => i.name.includes('Thăn Bò'))) {
    // Only replace if the dish is NOT actually a beef dish!
    const isBeefDish = t.includes('bò') || t.includes('bít tết') || t.includes('steak');
    if (isBeefDish) {
      // Check if it also needs sausage (e.g. Bánh Mì Chảo Bò Băm Xúc Xích)
      if (t.includes('xúc xích') && !r.ingredients.some(i => i.name.toLowerCase().includes('xúc xích'))) {
        r.ingredients.splice(1, 0, { name: 'Xúc xích Đức xông khói', amount: 200, unit: 'g', category: 'thit-hai-san' });
        dbIngFixed++;
      }
    } else if (t.includes('đùi gà') || t.includes('gà cay') || t.includes('burger gà') || t.includes('gà viên') || t.includes('gà xé') || t.includes('thịt gà')) {
      const chickenCut = t.includes('đùi gà')
        ? 'Đùi gà tỏi tươi'
        : t.includes('gà viên') || t.includes('burger gà') || t.includes('gà cay')
        ? 'Thịt ức gà hoặc phi lê đùi gà tươi'
        : 'Thịt ức gà tươi xé sợi';
      r.ingredients = [
        { name: chickenCut, amount: 500, unit: 'g', category: 'thit-hai-san' },
        ...(t.includes('bánh mì') || t.includes('burger')
          ? [{ name: 'Bánh mì burger / bánh mì bơ tỏi', amount: 4, unit: 'phần', category: 'khac' as const }]
          : t.includes('pizza')
          ? [{ name: 'Đế bánh Tortilla & nấm mỡ tươi', amount: 4, unit: 'chiếc', category: 'khac' as const }]
          : t.includes('súp bí đỏ')
          ? [
              { name: 'Bí đỏ hồ lô gọt vỏ', amount: 400, unit: 'g', category: 'rau-cu' as const },
              { name: 'Kem tươi (Whipping Cream) & sữa tươi', amount: 200, unit: 'ml', category: 'trung-sua' as const },
            ]
          : []),
        ...(t.includes('phô mai')
          ? [{ name: 'Phô mai Mozzarella / bột phô mai', amount: 150, unit: 'g', category: 'trung-sua' as const }]
          : []),
        ...(t.includes('nước dừa')
          ? [{ name: 'Nước dừa xiêm tươi', amount: 300, unit: 'ml', category: 'khac' as const }]
          : []),
        ...(t.includes('khoai tây')
          ? [{ name: 'Khoai tây cọng chiên giòn', amount: 300, unit: 'g', category: 'rau-cu' as const }]
          : []),
        { name: 'Bơ lạt, tỏi băm & gia vị ướp chuẩn vị', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Thấm khô bề mặt thịt gà trước khi ướp gia vị giúp lớp vỏ ngoài chín vàng óng, giữ trọn độ mềm mọng ngọt thịt bên trong.';
      dbIngFixed++;
    } else if (t.includes('sườn nướng')) {
      r.ingredients = [
        { name: 'Sườn non heo tươi chặt dải', amount: 600, unit: 'g', category: 'thit-hai-san' },
        { name: 'Khoai tây cọng đông lạnh', amount: 300, unit: 'g', category: 'rau-cu' },
        { name: 'Sốt nướng BBQ khói & mật ong rừng', amount: 5, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Bơ lạt Anchor tự nhiên', amount: 40, unit: 'g', category: 'trung-sua' },
        { name: 'Tỏi băm & lá hương thảo', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Hầm hoặc hấp sơ sườn non 15 phút trước khi phết sốt BBQ nướng giúp dải sườn mềm rục róc xương mà mặt ngoài bóng đẹp.';
      dbIngFixed++;
    } else if (t.includes('thịt heo') || t.includes('thịt ba chỉ')) {
      r.ingredients = [
        { name: 'Thịt ba chỉ heo tươi thái lát', amount: 500, unit: 'g', category: 'thit-hai-san' },
        ...(t.includes('cà ri')
          ? [
              { name: 'Khoai tây & cà rốt cắt khối', amount: 300, unit: 'g', category: 'rau-cu' as const },
              { name: 'Viên súp cà ri Nhật & trứng gà', amount: 4, unit: 'phần', category: 'gia-vi' as const },
            ]
          : [
              { name: 'Kim chi cải thảo chua cay', amount: 250, unit: 'g', category: 'rau-cu' as const },
              { name: 'Xà lách tươi hoặc trứng gà cuộn', amount: 200, unit: 'g', category: 'rau-cu' as const },
            ]),
        { name: 'Cơm trắng dẻo nóng hoặc sốt BBQ Hàn Quốc', amount: 4, unit: 'phần', category: 'khac' },
        { name: 'Hành tỏi băm, dầu mè & hạt tiêu', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Áp chảo thịt heo trên lửa vừa cho xém cạnh tươm mỡ thơm phức trước khi kết hợp cùng sốt để món ăn đậm vị không ngấy.';
      dbIngFixed++;
    } else if (t.includes('cá hồi')) {
      r.ingredients = [
        { name: 'Cá hồi Nauy phi lê tươi', amount: 500, unit: 'g', category: 'thit-hai-san' },
        { name: 'Bơ lạt Anchor tự nhiên', amount: 40, unit: 'g', category: 'trung-sua' },
        { name: 'Lá hương thảo tươi (Rosemary) & tỏi tép', amount: 20, unit: 'g', category: 'rau-cu' },
        { name: 'Xà lách, cà chua bi & dưa leo trộn salad', amount: 250, unit: 'g', category: 'rau-cu' },
        { name: 'Muối hồng, tiêu đen & chanh vàng', amount: 2, unit: 'muỗng cà phê', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Thấm thật khô mặt da cá hồi, áp chảo phần da trước trên chảo nóng già để da giòn rụm như bánh quy rồi mới rưới bơ tỏi hương thảo.';
      dbIngFixed++;
    } else if (t.includes('hải sản')) {
      r.ingredients = [
        { name: 'Mì Udon tươi Nhật Bản', amount: 600, unit: 'g', category: 'khac' },
        { name: 'Tôm sú tươi bóc nõn & mực ống cắt khoanh', amount: 400, unit: 'g', category: 'thit-hai-san' },
        { name: 'Bắp cải, cà rốt & ớt chuông thái sợi', amount: 250, unit: 'g', category: 'rau-cu' },
        { name: 'Sốt xào Nhật Bản & dầu hào', amount: 4, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Mè trắng rang thơm & hành lá', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Xào nhanh tôm mực trên lửa thật lớn cho vừa chín tới giòn ngọt, trụng sơ mì Udon qua nước sôi rồi mới đảo cùng sốt mè rang.';
      dbIngFixed++;
    } else if (t.includes('xúc xích')) {
      r.ingredients = [
        { name: 'Xúc xích Đức xông khói', amount: 350, unit: 'g', category: 'thit-hai-san' },
        ...(t.includes('tokbokki')
          ? [{ name: 'Bánh gạo Hàn Quốc (Tokbokki) & chả cá', amount: 400, unit: 'g', category: 'khac' as const }]
          : t.includes('mì ý')
          ? [{ name: 'Mì Ý Spaghetti & bắp Mỹ ngọt', amount: 400, unit: 'g', category: 'khac' as const }]
          : t.includes('cơm chiên')
          ? [{ name: 'Cơm trắng hạt dẻo, kim chi & trứng gà', amount: 500, unit: 'g', category: 'khac' as const }]
          : [{ name: 'Đế bánh Pizza / Bánh mì giòn & xà lách', amount: 4, unit: 'phần', category: 'khac' as const }]),
        { name: 'Phô mai Mozzarella bào sợi hoặc bơ tỏi', amount: 150, unit: 'g', category: 'trung-sua' },
        { name: 'Sốt cà chua / tương ớt Hàn Quốc', amount: 4, unit: 'muỗng canh', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Khứa nhẹ đường chéo trên thân xúc xích Đức rồi áp chảo với bơ tỏi để xúc xích nở hoa vàng giòn và dậy mùi khói đặc trưng.';
      dbIngFixed++;
    } else if (t.includes('khoai tây cọng')) {
      r.ingredients = [
        { name: 'Khoai tây cọng đông lạnh', amount: 500, unit: 'g', category: 'rau-cu' },
        { name: 'Bắp Mỹ ngọt tách hạt', amount: 150, unit: 'g', category: 'rau-cu' },
        { name: 'Bơ lạt Anchor tự nhiên', amount: 50, unit: 'g', category: 'trung-sua' },
        { name: 'Tỏi băm phi vàng & bột phô mai', amount: 3, unit: 'muỗng canh', category: 'gia-vi' },
        { name: 'Dầu ăn chiên giòn', amount: 200, unit: 'ml', category: 'gia-vi' },
      ];
      r.chefTip = 'Bí quyết đầu bếp: Chiên khoai tây 2 lửa để vỏ ngoài giòn rụm lâu mềm, sau đó xóc nhanh với bơ lạt đun chảy, tỏi phi và ngô ngọt.';
      dbIngFixed++;
    }
  }

  const newImg = getDishImageUrl(r.title, r.category);
  if (r.imageUrl !== newImg) {
    r.imageUrl = newImg;
    dbImgFixed++;
  }
}

// 2. Fix westernDishes500.ts
let westCatFixed = 0;
let westIngFixed = 0;
let westImgFixed = 0;

for (const r of westernDishes500) {
  const t = r.title.toLowerCase();
  const ingStr = r.ingredients.map(i => i.name.toLowerCase()).join(' | ');

  if (r.category === 'mon-rau' && (t.includes('cá ngừ') || t.includes('trứng luộc'))) {
    if (setRecipeCategory(r, 'mon-man')) westCatFixed++;
  }

  if (t.includes('tôm hải sản') && !ingStr.includes('tôm')) {
    r.ingredients.unshift({ name: 'Tôm sú tươi bóc nõn & mực ống', amount: 300, unit: 'g', category: 'thit-hai-san' });
    westIngFixed++;
  } else if (t.includes('cá hồi') && !ingStr.includes('cá hồi')) {
    r.ingredients.unshift({
      name: t.includes('xông khói') ? 'Cá hồi xông khói thái lát' : 'Cá hồi Nauy phi lê tươi cắt miếng',
      amount: 250,
      unit: 'g',
      category: 'thit-hai-san',
    });
    westIngFixed++;
  } else if (t.includes('gà xé sợi') && !ingStr.includes('gà')) {
    r.ingredients.unshift({ name: 'Thịt ức gà tươi luộc xé sợi', amount: 250, unit: 'g', category: 'thit-hai-san' });
    westIngFixed++;
  } else if (t.includes('tôm mực tươi') && !ingStr.includes('tôm')) {
    r.ingredients.unshift({ name: 'Tôm tươi bóc nõn & mực tươi thái hạt lựu', amount: 250, unit: 'g', category: 'thit-hai-san' });
    westIngFixed++;
  } else if (t.includes('cá ngừ') && !ingStr.includes('cá ngừ')) {
    r.ingredients.unshift({ name: 'Cá ngừ ngâm dầu đóng hộp', amount: 200, unit: 'g', category: 'thit-hai-san' });
    westIngFixed++;
  } else if (t.includes('thịt bò nướng') && !ingStr.includes('bò')) {
    r.ingredients.unshift({ name: 'Thăn bò nướng thái lát mềm', amount: 200, unit: 'g', category: 'thit-hai-san' });
    westIngFixed++;
  }

  const newImg = getDishImageUrl(r.title, r.category);
  if (r.imageUrl !== newImg) {
    r.imageUrl = newImg;
    westImgFixed++;
  }
}

// 3. Fix vietnameseDishesPart1.ts & vietnameseDishesPart2.ts
function fixVietnamesePart(list: Recipe[]) {
  let catFixed = 0;
  let ingFixed = 0;
  let imgFixed = 0;

  for (const r of list) {
    const t = r.title.toLowerCase();
    const ingStr = r.ingredients.map(i => i.name.toLowerCase()).join(' | ');

    if (
      r.category === 'mon-rau' &&
      (t.includes('tôm thịt') ||
        t.includes('tai heo') ||
        t.includes('bò khô') ||
        t.includes('tép đồng') ||
        t.includes('trứng gà lòng đào') ||
        t.includes('mắm tôm'))
    ) {
      if (t.includes('tôm thịt') || t.includes('tai heo') || t.includes('bò khô') || t.includes('tép đồng')) {
        if (setRecipeCategory(r, 'mon-man')) catFixed++;
      }
    }

    if (t.includes('kho quẹt tôm thịt') && !ingStr.includes('tôm')) {
      r.ingredients.splice(1, 0, { name: 'Tôm khô & thịt ba chỉ heo làm kho quẹt', amount: 200, unit: 'g', category: 'thit-hai-san' });
      ingFixed++;
    } else if (t.includes('tôm thịt') && !ingStr.includes('tôm')) {
      r.ingredients.splice(1, 0, { name: 'Tôm tươi luộc & thịt ba chỉ heo thái mỏng', amount: 250, unit: 'g', category: 'thit-hai-san' });
      ingFixed++;
    } else if (t.includes('tai heo') && !ingStr.includes('tai heo')) {
      r.ingredients.splice(1, 0, { name: 'Tai heo luộc giòn thái lát mỏng', amount: 250, unit: 'g', category: 'thit-hai-san' });
      ingFixed++;
    } else if (t.includes('bò khô') && !ingStr.includes('bò khô')) {
      r.ingredients.splice(1, 0, { name: 'Thịt bò khô xé sợi đậm vị', amount: 150, unit: 'g', category: 'thit-hai-san' });
      ingFixed++;
    } else if (t.includes('tép đồng') && !ingStr.includes('tép')) {
      r.ingredients.splice(1, 0, { name: 'Tép đồng tươi rang giòn', amount: 180, unit: 'g', category: 'thit-hai-san' });
      ingFixed++;
    }

    const newImg = getDishImageUrl(r.title, r.category);
    if (r.imageUrl !== newImg) {
      r.imageUrl = newImg;
      imgFixed++;
    }
  }
  return { catFixed, ingFixed, imgFixed };
}

const vn1Stats = fixVietnamesePart(vietnameseDishesPart1);
const vn2Stats = fixVietnamesePart(vietnameseDishesPart2);

function writeDataset(filePath: string, exportName: string, list: Recipe[]) {
  const content = `import { Recipe } from '../types';\n\nexport const ${exportName}: Recipe[] = ${JSON.stringify(list, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
}

const dataDir = path.resolve('d:/New folder/Remotion/src/data');
writeDataset(path.join(dataDir, 'recipesDatabase.ts'), 'recipesDatabase', recipesDatabase);
writeDataset(path.join(dataDir, 'westernDishes500.ts'), 'westernDishes500', westernDishes500);
writeDataset(path.join(dataDir, 'vietnameseDishesPart1.ts'), 'vietnameseDishesPart1', vietnameseDishesPart1);
writeDataset(path.join(dataDir, 'vietnameseDishesPart2.ts'), 'vietnameseDishesPart2', vietnameseDishesPart2);

console.log('=== SANITIZATION SUMMARY ===');
console.log(`recipesDatabase.ts: catFixed=${dbCatFixed}, ingFixed=${dbIngFixed}, imgFixed=${dbImgFixed}`);
console.log(`westernDishes500.ts: catFixed=${westCatFixed}, ingFixed=${westIngFixed}, imgFixed=${westImgFixed}`);
console.log(`vietnameseDishesPart1.ts: catFixed=${vn1Stats.catFixed}, ingFixed=${vn1Stats.ingFixed}, imgFixed=${vn1Stats.imgFixed}`);
console.log(`vietnameseDishesPart2.ts: catFixed=${vn2Stats.catFixed}, ingFixed=${vn2Stats.ingFixed}, imgFixed=${vn2Stats.imgFixed}`);
