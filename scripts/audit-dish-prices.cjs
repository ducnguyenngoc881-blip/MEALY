#!/usr/bin/env node
/**
 * scripts/audit-dish-prices.cjs
 * Comprehensive Automated Price Auditing Script for MealWise
 *
 * Verifies authentic Vietnamese market pricing, strict tier boundary compliance,
 * 1,000₫ integer increments, and reports distribution statistics.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const workspaceRoot = path.resolve(__dirname, '..');

const POOL_CONFIGS = [
  { file: 'src/data/casePools/comboPool.ts', name: 'Combo Pool (3-Dish Meals)', isCasePool: true },
  { file: 'src/data/casePools/expressPool.ts', name: 'Express Pool (Quick 1-Dish)', isCasePool: true },
  { file: 'src/data/casePools/snackPool.ts', name: 'Snack Pool (Gen Z Finger Food)', isCasePool: true },
  { file: 'src/data/casePools/bizarrePool.ts', name: 'Bizarre Pool (Dares & Challenges)', isCasePool: true },
  { file: 'src/data/fastMealData.ts', name: 'Fast Meal Fallbacks, Sides & Drinks', isCasePool: false }
];

const TIER_BOUNDS = {
  blue: { min: 18000, max: 35000, label: '18,000₫ – 35,000₫ (Tiết Kiệm / Nhanh Rẻ / Thử Nghiệm)' },
  purple: { min: 35000, max: 65000, label: '35,000₫ – 65,000₫ (Bình Dân / Vừa Vặn / Cay Đắng)' },
  gold: { min: 65000, max: 150000, label: '65,000₫ – 120,000₫+ (Ăn Sang / Đặc Biệt / Liều Mạng)' }
};

const ADDON_BOUNDS = {
  side: { min: 3000, max: 35000, label: '3,000₫ – 35,000₫ (Món ăn kèm / Salad / Súp)' },
  drink: { min: 3000, max: 45000, label: '3,000₫ – 45,000₫ (Đồ uống / Trà sữa / Nước ép)' }
};

function formatVnd(val) {
  return typeof val === 'number' && !isNaN(val) ? val.toLocaleString('vi-VN') + '₫' : String(val);
}

function calcStats(numbers) {
  if (!numbers || numbers.length === 0) return { min: 0, max: 0, avg: 0, median: 0, stdDev: 0 };
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / sorted.length);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / sorted.length;
  const stdDev = Math.round(Math.sqrt(variance));
  return { min: sorted[0], max: sorted[sorted.length - 1], avg, median, stdDev };
}

function parseDishesFromTs(relPath) {
  const fullPath = path.join(workspaceRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const sourceCode = fs.readFileSync(fullPath, 'utf8');
  const sourceFile = ts.createSourceFile(path.basename(relPath), sourceCode, ts.ScriptTarget.Latest, true);
  const items = [];

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const obj = {};
      for (const prop of node.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const key = prop.name.getText(sourceFile).replace(/['"]/g, '');
          if (ts.isNumericLiteral(prop.initializer)) {
            obj[key] = Number(prop.initializer.getText(sourceFile));
          } else if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
            obj[key] = prop.initializer.text;
          } else {
            obj[key] = prop.initializer.getText(sourceFile).replace(/^['"]|['"]$/g, '');
          }
        }
      }
      if (obj.id && obj.title && obj.estimatedCostVnd !== undefined) {
        let tier = obj.tier;
        if (!tier) {
          if (obj.id.includes('blue')) tier = 'blue';
          else if (obj.id.includes('purple') || obj.id.includes('pur')) tier = 'purple';
          else if (obj.id.includes('gold')) tier = 'gold';
          else tier = 'unknown';
        }
        const isMain = Boolean(obj.description);
        let category = 'main';
        if (!isMain) {
          if (obj.officeBuff || obj.id.includes('drink') || obj.id.includes('tra') || obj.id.includes('nuoc') || obj.id.includes('sua') || obj.id.includes('coldbrew') || obj.id.includes('sinh-to')) {
            category = 'drink';
          } else {
            category = 'side';
          }
        }

        items.push({
          relPath,
          id: obj.id,
          title: obj.title,
          tier,
          category,
          estimatedCostVnd: Number(obj.estimatedCostVnd),
          calories: Number(obj.calories) || 0
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return items;
}

function runPriceAudit() {
  console.log('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m                 MEALWISE AUTOMATED DISH PRICE INTEGRITY AUDIT                          \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================================\x1b[0m\n');

  let totalDishes = 0;
  const allDishes = [];
  const violations = [];

  for (const config of POOL_CONFIGS) {
    const dishes = parseDishesFromTs(config.file);
    totalDishes += dishes.length;
    allDishes.push(...dishes);

    const prices = dishes.map(d => d.estimatedCostVnd);
    const stats = calcStats(prices);

    console.log(`\x1b[1m📁 ${config.name}\x1b[0m (${config.file})`);
    console.log(`   Count: \x1b[33m${String(dishes.length).padEnd(4)}\x1b[0m | Min: \x1b[32m${formatVnd(stats.min).padEnd(9)}\x1b[0m | Max: \x1b[32m${formatVnd(stats.max).padEnd(10)}\x1b[0m | Avg: \x1b[36m${formatVnd(stats.avg).padEnd(9)}\x1b[0m | Med: ${formatVnd(stats.median).padEnd(9)} | StdDev: ${formatVnd(stats.stdDev)}`);

    for (const d of dishes) {
      const p = d.estimatedCostVnd;
      // 1. NaN check
      if (typeof p !== 'number' || isNaN(p)) {
        violations.push({ ...d, type: 'NaN', message: `Price is NaN or not a number: ${p}` });
        continue;
      }
      // 2. Non-positive check
      if (p <= 0) {
        violations.push({ ...d, type: 'NEGATIVE_OR_ZERO', message: `Price must be > 0: ${formatVnd(p)}` });
        continue;
      }
      // 3. Multiples of 1,000₫ check
      if (p % 1000 !== 0) {
        violations.push({ ...d, type: 'NON_MULTIPLE_1K', message: `Price ${formatVnd(p)} is not a clean multiple of 1,000₫ (modulo: ${p % 1000})` });
      }
      // 4. Tier bounds check for mains and case pool items
      if (config.isCasePool || d.category === 'main') {
        const bound = TIER_BOUNDS[d.tier];
        if (bound) {
          if (p < bound.min || p > bound.max) {
            violations.push({
              ...d,
              type: 'TIER_BOUND_VIOLATION',
              message: `Price ${formatVnd(p)} is outside ${d.tier.toUpperCase()} tier limits (${bound.label})`
            });
          }
        }
        // 5. Outlier check (< 18,000₫ for meal/snack/bizarre/combo)
        if (p < 18000) {
          violations.push({
            ...d,
            type: 'UNDERPRICED_OUTLIER',
            message: `Meal price ${formatVnd(p)} is underpriced (< 18,000₫ minimum meal cost)`
          });
        }
      } else {
        // Sides & Drinks add-on bounds
        const bound = ADDON_BOUNDS[d.category];
        if (bound && (p < bound.min || p > bound.max)) {
          violations.push({
            ...d,
            type: 'ADDON_BOUND_VIOLATION',
            message: `Component price ${formatVnd(p)} is outside ${d.category} bounds (${bound.label})`
          });
        }
      }
      // 6. Absolute upper outlier check (> 150,000₫)
      if (p > 150000) {
        violations.push({
          ...d,
          type: 'OVERPRICED_OUTLIER',
          message: `Price ${formatVnd(p)} exceeds maximum allowable limit of 150,000₫`
        });
      }
    }
  }

  // Cross-Pool Tier Statistics Breakdown
  console.log('\n\x1b[1m\x1b[36m----------------------------------------------------------------------------------------\x1b[0m');
  console.log('\x1b[1mCROSS-POOL TIER PRICE DISTRIBUTION SUMMARY (MAIN DISHES & CASE POOLS):\x1b[0m');
  console.log('\x1b[1m\x1b[36m----------------------------------------------------------------------------------------\x1b[0m');

  for (const tier of ['blue', 'purple', 'gold']) {
    const tierDishes = allDishes.filter(d => d.tier === tier && d.category === 'main');
    const stats = calcStats(tierDishes.map(d => d.estimatedCostVnd));
    const bound = TIER_BOUNDS[tier];
    const inBoundsCount = tierDishes.filter(d => d.estimatedCostVnd >= bound.min && d.estimatedCostVnd <= bound.max).length;
    const compliancePct = ((inBoundsCount / (tierDishes.length || 1)) * 100).toFixed(1);

    console.log(`  • \x1b[1m${tier.toUpperCase().padEnd(6)}\x1b[0m: ${String(tierDishes.length).padStart(3)} items | Target: ${bound.label}`);
    console.log(`             Min: \x1b[32m${formatVnd(stats.min).padEnd(9)}\x1b[0m | Max: \x1b[32m${formatVnd(stats.max).padEnd(10)}\x1b[0m | Avg: \x1b[36m${formatVnd(stats.avg).padEnd(9)}\x1b[0m | Med: ${formatVnd(stats.median).padEnd(9)} | StdDev: ${formatVnd(stats.stdDev).padEnd(8)} | Compliance: \x1b[1m\x1b[32m${compliancePct}%\x1b[0m`);
  }

  // Sides and Drinks Breakdown
  console.log('\n\x1b[1m\x1b[36m----------------------------------------------------------------------------------------\x1b[0m');
  console.log('\x1b[1mADD-ON SIDES & DRINKS DISTRIBUTION SUMMARY (FAST MEAL DATA):\x1b[0m');
  console.log('\x1b[1m\x1b[36m----------------------------------------------------------------------------------------\x1b[0m');
  for (const cat of ['side', 'drink']) {
    const catDishes = allDishes.filter(d => d.category === cat);
    const stats = calcStats(catDishes.map(d => d.estimatedCostVnd));
    const bound = ADDON_BOUNDS[cat];
    const inBoundsCount = catDishes.filter(d => d.estimatedCostVnd >= bound.min && d.estimatedCostVnd <= bound.max).length;
    const compliancePct = ((inBoundsCount / (catDishes.length || 1)) * 100).toFixed(1);
    console.log(`  • \x1b[1m${cat.toUpperCase().padEnd(6)}\x1b[0m: ${String(catDishes.length).padStart(3)} items | Target: ${bound.label}`);
    console.log(`             Min: \x1b[32m${formatVnd(stats.min).padEnd(9)}\x1b[0m | Max: \x1b[32m${formatVnd(stats.max).padEnd(10)}\x1b[0m | Avg: \x1b[36m${formatVnd(stats.avg).padEnd(9)}\x1b[0m | Med: ${formatVnd(stats.median).padEnd(9)} | StdDev: ${formatVnd(stats.stdDev).padEnd(8)} | Compliance: \x1b[1m\x1b[32m${compliancePct}%\x1b[0m`);
  }

  // Final Verdict
  console.log('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
  console.log(`\x1b[1mAUDIT RESULT:\x1b[0m Total Dish Corpus: \x1b[1m${totalDishes}\x1b[0m | Violations: ${violations.length > 0 ? `\x1b[31m${violations.length}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log('\x1b[1m\x1b[36m========================================================================================\x1b[0m\n');

  if (violations.length > 0) {
    console.error(`\x1b[31m[FAILED] Found ${violations.length} price violations across pools:\x1b[0m\n`);
    violations.slice(0, 30).forEach((v, idx) => {
      console.error(`  ${idx + 1}. [${v.relPath}] (${v.tier.toUpperCase()} ${v.category}) ${v.id}: "${v.title}" -> ${v.message}`);
    });
    if (violations.length > 30) {
      console.error(`  ... and ${violations.length - 30} more violations.`);
    }
    console.error('\n\x1b[31mPlease calibrate dish prices to multiples of 1,000₫ and adhere to tier limits.\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32m[SUCCESS] 100% of dishes comply with authentic Vietnamese market pricing and tier bounds!\x1b[0m');
    console.log('\x1b[32m[SUCCESS] Zero fractional prices, zero underpriced meals (<18k), zero overpriced meals (>150k).\x1b[0m\n');
    process.exit(0);
  }
}

runPriceAudit();
