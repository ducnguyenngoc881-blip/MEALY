const fs = require('fs');

const western = JSON.parse(fs.readFileSync('src/data/westernDishes500.ts', 'utf-8').replace('export const westernDishes500 = ', '').replace(/;\s*$/, ''));
console.log(`Western Dishes: ${western.length}`);

const catCounts = {};
western.forEach(d => {
  catCounts[d.category] = (catCounts[d.category] || 0) + 1;
});
console.log('Categories:', catCounts);

// Check breakfast dishes
const breakfasts = western.filter(d => d.category === 'an-sang');
console.log(`Breakfast dishes: ${breakfasts.length}`);
console.log('Sample breakfasts:', breakfasts.slice(0, 5).map(b => ({ id: b.id, title: b.title, img: b.imageUrl })));
