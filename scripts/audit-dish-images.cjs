const fs = require('fs');
const https = require('https');
const http = require('http');

function extractRecipes(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  // Match each recipe object block: "id": "...", "title": "...", ... "imageUrl": "..."
  const regex = /"id":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"[\s\S]*?"imageUrl":\s*"([^"]+)"/g;
  let match;
  const list = [];
  while ((match = regex.exec(text)) !== null) {
    list.push({
      id: match[1],
      title: match[2],
      category: match[3],
      imageUrl: match[4],
      file: filePath
    });
  }
  return list;
}

const mock = extractRecipes('src/data/mockRecipes.ts');
const db = extractRecipes('src/data/recipesDatabase.ts');
const western = extractRecipes('src/data/westernDishes500.ts');

const allRecipes = [...mock, ...db, ...western];
console.log(`Extracted ${allRecipes.length} recipes (${mock.length} mock, ${db.length} db, ${western.length} western)`);

// Collect unique URLs
const uniqueUrls = new Map();
for (const r of allRecipes) {
  if (!uniqueUrls.has(r.imageUrl)) {
    uniqueUrls.set(r.imageUrl, []);
  }
  uniqueUrls.get(r.imageUrl).push(r);
}

console.log(`Total unique image URLs: ${uniqueUrls.size}`);

// Write list to JSON for quick inspection
fs.writeFileSync('scripts/extracted_images.json', JSON.stringify({
  totalRecipes: allRecipes.length,
  totalUniqueUrls: uniqueUrls.size,
  urls: Array.from(uniqueUrls.entries()).map(([url, recipes]) => ({
    url,
    count: recipes.length,
    sampleTitles: recipes.slice(0, 3).map(r => r.title)
  }))
}, null, 2));

console.log('Saved summary to scripts/extracted_images.json');
