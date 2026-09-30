const https = require('https');

const candidates = {
  // Omelettes & Breakfast Eggs
  omelette_breakfast: [
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80', // delicious omelette / skillet eggs
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', // breakfast eggs & toast
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', // breakfast wrap / egg
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80', // breakfast spread with eggs
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', // egg breakfast
  ],
  // Pancakes & French Toast
  pancakes_french_toast: [
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', // pancakes
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80', // french toast
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', // bakery bread / toast
  ],
  // Beefsteak
  beefsteak: [
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80', // steak on cutting board / plate
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', // grilled meat / ribs
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // gourmet steak plate
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80', // grilled beef
  ],
  // Italian Pasta & Spaghetti
  pasta: [
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80', // spaghetti bolognese
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', // pasta dish
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281744?auto=format&fit=crop&w=800&q=80', // test
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', // pasta
  ],
  // Western Soups (Pumpkin, Mushroom, Chowder, Tomato)
  western_soups: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', // soup bowl
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80', // pumpkin cream soup
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80', // soup pot
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80', // noodle soup
  ],
  // Salad (Caesar, Greek, Greens)
  salads: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', // salad bowl
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', // vibrant salad
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // poke / greens bowl
  ],
  // Western Seafood (Salmon, Shrimp, Cod)
  western_seafood: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', // salmon steak plate
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', // seafood
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', // cooked salmon with veggies
  ],
  // Western Sides (Mashed Potato, Potato Wedges, Garlic Bread)
  western_sides: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80', // potato dish / wedges
    'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80', // french fries / potato
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', // crispy fries
  ]
};

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', (err) => resolve({ url, status: 'ERROR: ' + err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 'EXCEPTION: ' + e.message });
    }
  });
}

async function main() {
  console.log('Testing Unsplash candidate URLs...');
  for (const [category, urls] of Object.entries(candidates)) {
    console.log(`\n--- ${category} ---`);
    for (const url of urls) {
      const res = await checkUrl(url);
      console.log(`  ${res.status === 200 ? '✓ [200]' : '✗ [' + res.status + ']'} ${res.url}`);
    }
  }
}

main();
