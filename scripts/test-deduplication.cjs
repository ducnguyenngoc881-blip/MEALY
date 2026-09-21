// scripts/test-deduplication.cjs
// Automated test verifying account-level non-duplication across all 4 modes and 3 tiers

// Mock localStorage for Node.js test environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

const { 
  pickNonDuplicateDish, 
  getModeCollectionStats, 
  getAccountCaseState, 
  resetAccountCaseCollection 
} = require('../src/utils/caseDeduplication.ts'); // Note: we'll test via ts-node or transpiled version
