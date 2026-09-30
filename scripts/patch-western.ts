import fs from 'fs';
import { westernDishes500 } from '../src/data/westernDishes500';
import { getDishImageUrl, OVERUSED_PLACEHOLDER_IDS } from '../src/utils/dishImageResolver';

console.log(`Auditing and patching ${westernDishes500.length} western dishes...`);

let replacedCount = 0;
const updatedDishes = westernDishes500.map((dish) => {
  const isBad = !dish.imageUrl || OVERUSED_PLACEHOLDER_IDS.some(id => dish.imageUrl.includes(id));
  if (isBad) {
    const newUrl = getDishImageUrl(dish.title, dish.category);
    replacedCount++;
    return {
      ...dish,
      imageUrl: newUrl
    };
  }
  return dish;
});

console.log(`Replaced bad/dead URLs in ${replacedCount} dishes.`);

const fileContent = `import { Recipe } from '../types';\n\nexport const westernDishes500: Recipe[] = ${JSON.stringify(updatedDishes, null, 2)};\n`;

fs.writeFileSync('src/data/westernDishes500.ts', fileContent, 'utf-8');
console.log('Successfully updated src/data/westernDishes500.ts');
