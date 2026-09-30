const fs = require('fs');

function inspectFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(filePath, 'does not exist');
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /imageUrl['"]?:\s*['"](https:\/\/[^'"]+)['"]/g;
  let match;
  const urls = [];
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  const unique = [...new Set(urls)];
  console.log(`=== ${filePath} ===`);
  console.log(`Total imageUrl occurrences: ${urls.length}`);
  console.log(`Unique URLs: ${unique.length}`);
  unique.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
}

inspectFile('src/data/mockRecipes.ts');
inspectFile('src/data/recipesDatabase.ts');
inspectFile('src/data/westernDishes500.ts');
inspectFile('src/data/mockMealSets.ts');
