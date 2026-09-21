const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/index-rkZdn8Fd.js', 'utf8');

// Extract D (710 recipes)
const endD = code.indexOf(',O=D.reduce');
const dChunk = code.substring(221702, endD);
const scriptCode = `
let C, w, T, ee, E, te, ne, re, ie, D;
${dChunk};
module.exports = D;
`;
const sandbox = { module: { exports: null }, console };
const context = vm.createContext(sandbox);
vm.runInContext(scriptCode, context);
const rawRecipes = sandbox.module.exports;

// Extract ae (ingredients)
const aeStart = code.indexOf(',ae=[{id:`thit-ba-chi-heo`');
const kPos = code.indexOf('}],k=ae.reduce', aeStart);
const aeChunk = code.substring(aeStart + 4, kPos + 2);

const ingSandbox = { module: { exports: null } };
const ingContext = vm.createContext(ingSandbox);
vm.runInContext(`module.exports = ${aeChunk};`, ingContext);
const rawIngredients = ingSandbox.module.exports;

const ingredientMap = {};
rawIngredients.forEach(i => { ingredientMap[i.id] = i; });

function detectCategory(r) {
  const idLower = (r.id || '').toLowerCase();
  const titleLower = (r.title || '').toLowerCase();
  const tags = r.dietaryTags || [];

  if (tags.includes('chay-thanh-dam') || idLower.includes('chay') || titleLower.includes('chay')) {
    return 'mon-chay';
  }
  if (r.mealTypes && r.mealTypes.includes('snack')) {
    return 'trang-mieng';
  }
  if (titleLower.includes('chè') || titleLower.includes('tráng miệng') || titleLower.includes('hoa quả') || titleLower.includes('sinh tố') || titleLower.includes('sữa chua') || titleLower.includes('thạch')) {
    return 'trang-mieng';
  }
  if (titleLower.includes('canh') || titleLower.includes('lẩu') || titleLower.includes('súp') || titleLower.includes('soup') || idLower.includes('canh') || idLower.includes('lau')) {
    return 'mon-canh';
  }
  if (titleLower.includes('rau ') || titleLower.includes('gỏi') || titleLower.includes('nộm') || titleLower.includes('salad') || titleLower.includes('dưa ') || titleLower.includes('xào rau') || titleLower.includes('luộc')) {
    return 'mon-rau';
  }
  if (r.mealTypes && r.mealTypes.length === 1 && r.mealTypes[0] === 'breakfast') {
    return 'an-sang';
  }
  return 'mon-man';
}

function detectRegion(r) {
  const s = ((r.id || '') + ' ' + (r.title || '')).toLowerCase();
  if (s.includes('bac') || s.includes('hà nội') || s.includes('hanoi') || s.includes('bắc')) return 'bac';
  if (s.includes('trung') || s.includes('huế') || s.includes('hue') || s.includes('đà nẵng') || s.includes('quảng')) return 'trung';
  if (s.includes('nam') || s.includes('sài gòn') || s.includes('sai-gon') || s.includes('miền tây') || s.includes('nam bộ')) return 'nam';
  return 'toan-quoc';
}

function pickImage(r) {
  const s = ((r.id || '') + ' ' + (r.title || '') + ' ' + (r.dietaryTags || []).join(' ')).toLowerCase();
  if (s.includes('banh-mi') || s.includes('bánh mì')) {
    return 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('pho') || s.includes('phở') || s.includes('bun') || s.includes('bún') || s.includes('mi-') || s.includes('mì') || s.includes('miến') || s.includes('hủ tiếu')) {
    return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('chao-') || s.includes('cháo')) {
    return 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('lẩu') || s.includes('hotpot') || s.includes('canh') || s.includes('súp')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('bò') || s.includes('steak') || s.includes('thịt bò')) {
    return 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('gà') || s.includes('chicken') || s.includes('vịt')) {
    return 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('cá') || s.includes('tôm') || s.includes('mực') || s.includes('cua') || s.includes('hải sản') || s.includes('seafood')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('rau') || s.includes('gỏi') || s.includes('nộm') || s.includes('salad')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('chay') || s.includes('đậu hũ') || s.includes('nấm')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('chè') || s.includes('trái cây') || s.includes('hoa quả') || s.includes('sữa chua') || s.includes('thạch') || s.includes('snack')) {
    return 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('bbq') || s.includes('nướng')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('pizza') || s.includes('burger') || s.includes('fastfood') || s.includes('khoai tây')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80';
  }
  if (s.includes('cơm') || s.includes('xôi')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
}

function calculateCost(r) {
  let cost = 0;
  if (r.ingredients && Array.isArray(r.ingredients)) {
    for (const ing of r.ingredients) {
      const rawIng = ingredientMap[ing.ingredientId];
      const price = rawIng ? rawIng.unitPrice : 30000;
      const amount = (ing.amountPerServing || 0.1) * 4;
      cost += amount * price;
    }
  }
  if (cost < 20000) cost = 45000;
  return Math.round(cost / 1000) * 1000;
}

function mapIngredients(r) {
  if (!r.ingredients || !Array.isArray(r.ingredients)) return [];
  return r.ingredients.map(ing => {
    const rawIng = ingredientMap[ing.ingredientId];
    let cat = 'khac';
    if (rawIng && rawIng.category) {
      if (rawIng.category.includes('Thịt') || rawIng.category.includes('hải sản')) cat = 'thit-ca';
      else if (rawIng.category.includes('Rau') || rawIng.category.includes('Củ') || rawIng.category.includes('Nấm')) cat = 'rau-cu';
      else if (rawIng.category.includes('Gia vị')) cat = 'gia-vi';
      else if (rawIng.category.includes('Gạo') || rawIng.category.includes('Bún') || rawIng.category.includes('Đồ khô')) cat = 'do-kho';
    }
    const name = rawIng ? rawIng.name : (ing.notes || ing.ingredientId);
    const amount = Number(((ing.amountPerServing || 0.1) * 4).toFixed(2));
    const unit = rawIng ? rawIng.unit : (ing.unit || 'phần');
    return { name, amount, unit, category: cat };
  });
}

function mapInstructions(r) {
  if (!r.instructions || !Array.isArray(r.instructions) || r.instructions.length === 0) {
    return [
      { step: 1, title: 'Chuẩn bị nguyên liệu', content: 'Rửa sạch và sơ chế các nguyên liệu tươi.' },
      { step: 2, title: 'Chế biến', content: 'Nấu chín theo khẩu vị gia đình trên lửa vừa.' },
      { step: 3, title: 'Hoàn thành', content: 'Trình bày ra đĩa và thưởng thức nóng.' }
    ];
  }
  return r.instructions.map((ins, idx) => ({
    step: idx + 1,
    title: `Bước ${idx + 1}`,
    content: typeof ins === 'string' ? ins : (ins.content || ins.title || `Bước ${idx + 1}`)
  }));
}

function mapTags(r) {
  const tags = [];
  if (r.difficulty) tags.push(r.difficulty);
  const cat = detectCategory(r);
  const catNames = {
    'mon-man': 'Món Mặn',
    'mon-canh': 'Món Canh',
    'mon-rau': 'Món Rau',
    'mon-chay': 'Món Chay',
    'an-sang': 'Ăn Sáng',
    'trang-mieng': 'Tráng Miệng'
  };
  if (catNames[cat]) tags.push(catNames[cat]);
  const reg = detectRegion(r);
  const regNames = {
    'bac': 'Miền Bắc',
    'trung': 'Miền Trung',
    'nam': 'Miền Nam',
    'toan-quoc': 'Toàn Quốc'
  };
  if (regNames[reg]) tags.push(regNames[reg]);

  if (r.dietaryTags) {
    const tagMap = {
      'quick-easy': 'Nhanh Gọn',
      'com-nha': 'Cơm Nhà',
      'high-protein': 'Giàu Đạm',
      'budget': 'Tiết Kiệm',
      'giam-can-healthy': 'Healthy',
      'chay-thanh-dam': 'Thanh Tịnh',
      'party': 'Mâm Tiệc',
      'bbq': 'BBQ',
      'hotpot': 'Món Lẩu',
      'kid-friendly': 'Trẻ Em'
    };
    for (const dt of r.dietaryTags) {
      if (tagMap[dt] && !tags.includes(tagMap[dt])) {
        tags.push(tagMap[dt]);
      }
    }
  }
  return tags;
}

const convertedRecipes = rawRecipes.map(r => {
  return {
    id: r.id,
    title: r.title,
    description: r.description || r.subtitle || r.title,
    category: detectCategory(r),
    region: detectRegion(r),
    prepTimeMinutes: r.prepMinutes || 10,
    cookTimeMinutes: r.cookMinutes || 15,
    servings: 4,
    calories: (r.nutrition && r.nutrition.calories) ? r.nutrition.calories : 350,
    estimatedCostVnd: calculateCost(r),
    imageUrl: pickImage(r),
    ingredients: mapIngredients(r),
    instructions: mapInstructions(r),
    tags: mapTags(r)
  };
});

console.log('Successfully converted', convertedRecipes.length, 'recipes');
console.log('Sample [0]:', convertedRecipes[0]);
console.log('Sample [709]:', convertedRecipes[709]);

// Write to src/data/recipesDatabase.ts
const outputTs = `import { Recipe } from '../types';

export const recipesDatabase: Recipe[] = ${JSON.stringify(convertedRecipes, null, 2)};
`;

fs.writeFileSync('src/data/recipesDatabase.ts', outputTs, 'utf8');
console.log('Written to src/data/recipesDatabase.ts, size:', fs.statSync('src/data/recipesDatabase.ts').size);
