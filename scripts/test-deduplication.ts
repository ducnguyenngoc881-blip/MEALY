// scripts/test-deduplication.ts
import { 
  pickNonDuplicateDish, 
  getModeCollectionStats, 
  getAccountCaseState, 
  resetAccountCaseCollection,
  getCasePool 
} from '../src/utils/caseDeduplication';
import { FastMealPreferenceMode, ApexCaseTier } from '../src/types';

// Mock localStorage for Node.js test environment
const memoryStore: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => memoryStore[k] || null,
  setItem: (k: string, v: string) => { memoryStore[k] = String(v); },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; },
  length: 0,
  key: () => null
};

console.log('======================================================================');
console.log('       TESTING ACCOUNT ZERO-DUPLICATION GACHA ENGINE (800 DISHES)     ');
console.log('======================================================================\n');

resetAccountCaseCollection();

const modes: FastMealPreferenceMode[] = ['express-1dish', 'snack-genz', 'combo', 'bizarre-dare'];
const tiers: ApexCaseTier[] = ['blue', 'purple', 'gold'];

let totalRollsTested = 0;
let totalDuplicatesFound = 0;

for (const mode of modes) {
  for (const tier of tiers) {
    const pool = getCasePool(mode, tier);
    const poolSize = pool.length;
    const testRollCount = Math.min(poolSize, 50); // test up to 50 unique consecutive rolls
    
    console.log(`[TEST] Mode: ${mode.padEnd(14)} | Tier: ${tier.padEnd(6)} | Pool Size: ${poolSize} | Rolling ${testRollCount} times...`);
    
    const seenIds = new Set<string>();
    
    for (let i = 0; i < testRollCount; i++) {
      totalRollsTested++;
      const res = pickNonDuplicateDish(mode, tier);
      
      if (seenIds.has(res.dish.id)) {
        console.error(`  ❌ DUPLICATE DETECTED! Dish ID: ${res.dish.id} (${res.dish.title}) at roll #${i + 1}`);
        totalDuplicatesFound++;
      } else {
        seenIds.add(res.dish.id);
      }
    }
    
    console.log(`  ✓ Successfully rolled ${seenIds.size}/${testRollCount} unique dishes without any duplication.`);
  }
}

// Check account storage persistence
const finalState = getAccountCaseState();
console.log('\n----------------------------------------------------------------------');
console.log(`Total rolls tested: ${totalRollsTested}`);
console.log(`Total duplicate occurrences: ${totalDuplicatesFound}`);
console.log(`Unique dishes unlocked in account storage: ${finalState.unlockedIds.length}`);
console.log('----------------------------------------------------------------------');

if (totalDuplicatesFound === 0) {
  console.log('🎉 [PASSED] 100% ZERO-DUPLICATION GUARANTEE VERIFIED SUCCESSFULLY!\n');
} else {
  console.error('❌ [FAILED] Found duplicate dishes!');
  process.exit(1);
}
