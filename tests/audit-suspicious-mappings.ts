import { resolveCulinaryCluster } from '../src/utils/dishImageResolver';
import { mockRecipes } from '../src/data/mockRecipes';
import { recipesDatabase } from '../src/data/recipesDatabase';
import { westernDishes500 } from '../src/data/westernDishes500';

const allDishes = [
  ...mockRecipes.map(r => ({ id: r.id, title: r.title, cat: r.category, src: r.imageUrl, origin: 'mockRecipes' })),
  ...recipesDatabase.map(r => ({ id: r.id, title: r.title, cat: r.category, src: r.imageUrl, origin: 'recipesDatabase' })),
  ...westernDishes500.map(r => ({ id: r.id, title: r.title, cat: r.category, src: r.imageUrl, origin: 'westernDishes500' }))
];

const suspiciousMappings: { id: string; title: string; cat: string; cluster: string; reason: string }[] = [];

for (const dish of allDishes) {
  const cluster = resolveCulinaryCluster(dish.title, dish.cat);
  const titleLower = dish.title.toLowerCase();

  // 1. Salad or vegetable mapped to soup or beef or noodles
  if ((dish.cat === 'mon-rau' || titleLower.includes('salad')) && (cluster === 'pho_bo' || cluster === 'pho_ga' || cluster === 'thit_kho_tau')) {
    suspiciousMappings.push({ id: dish.id, title: dish.title, cat: dish.cat, cluster, reason: 'Salad/Veg mapped to meat/noodles' });
  }

  // 2. Western dish mapped to Vietnamese traditional home-cooked
  if (dish.origin === 'westernDishes500') {
    if (['thit_kho_tau', 'ca_kho_to', 'canh_cua_rau_day', 'bun_dau_mam_tom', 'mam_tom_mam_nem'].includes(cluster)) {
      suspiciousMappings.push({ id: dish.id, title: dish.title, cat: dish.cat, cluster, reason: 'Western dish mapped to traditional Vietnamese home-cooked' });
    }
  }

  // 3. Dessert / Drink mapped to savory
  if (['nuoc-uong', 'do-uong', 'trang-mieng'].includes(dish.cat)) {
    if (['thit_kho_tau', 'ca_kho_to', 'pho_bo', 'steak_beef', 'burger'].includes(cluster)) {
      suspiciousMappings.push({ id: dish.id, title: dish.title, cat: dish.cat, cluster, reason: 'Dessert/Drink mapped to savory meat' });
    }
  }
}

console.log(`Audited ${allDishes.length} total dishes. Found ${suspiciousMappings.length} suspicious semantic mappings:`);
suspiciousMappings.forEach(m => {
  console.log(`- [${m.id}] "${m.title}" (${m.cat}) -> ${m.cluster} (${m.reason})`);
});
