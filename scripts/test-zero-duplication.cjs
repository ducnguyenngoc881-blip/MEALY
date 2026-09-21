// scripts/test-zero-duplication.cjs
const assert = require('assert');

// Mock localStorage for Node.js
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

// We will test by importing the transpiled or direct logic
// Let's import the case pools directly
const { EXPRESS_POOL_BLUE, EXPRESS_POOL_PURPLE, EXPRESS_POOL_GOLD } = require('../src/data/casePools/expressPool.ts');
const { SNACK_POOL_BLUE, SNACK_POOL_PURPLE, SNACK_POOL_GOLD } = require('../src/data/casePools/snackPool.ts');
const { COMBO_POOL_BLUE, COMBO_POOL_PURPLE, COMBO_POOL_GOLD } = require('../src/data/casePools/comboPool.ts');
const { BIZARRE_POOL_BLUE, BIZARRE_POOL_PURPLE, BIZARRE_POOL_GOLD } = require('../src/data/casePools/bizarrePool.ts');
