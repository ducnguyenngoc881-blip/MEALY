import fs from 'fs';
import { recipesDatabase } from '../src/data/recipesDatabase';
import { getDishImageUrl, OVERUSED_PLACEHOLDER_IDS } from '../src/utils/dishImageResolver';

console.log(`Auditing and patching ${recipesDatabase.length} recipes in recipesDatabase...`);

let replacedCount = 0;
const updatedDishes = recipesDatabase.map((dish) => {
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

console.log(`Replaced bad/overused URLs in ${replacedCount} recipes.`);

const fileContent = `import { Recipe } from '../types';\n\nexport const recipesDatabase: Recipe[] = ${JSON.stringify(updatedDishes, null, 2)};\n`;

fs.writeFileSync('src/data/recipesDatabase.ts', fileContent, 'utf-8');
console.log('Successfully updated src/data/recipesDatabase.ts');
