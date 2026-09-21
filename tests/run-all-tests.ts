/**
 * MealWise Comprehensive 4-Tier Test Runner
 * Executes all Unit and E2E test suites across all 6 domains.
 */

import { registry } from './helpers/testRunner';

// 1. Unit Test Suites
import './unit/textUtils.test';
import './unit/cateringMath.test';
import './unit/groceryMath.test';
import './unit/nutritionMath.test';
import './unit/recipeScaling.test';
import './unit/apexFastMeal.test';
import './unit/dishImageResolver.test';
import './unit/budgetCompliance.test';
import './unit/weeklyPlanVariation.test';
import './unit/fridgeNavigation.test';
import './unit/inAppDialogs.test';
import './unit/collabGrocery.test';
import './unit/minigames.test';

// 2. 4-Tier E2E Test Suites
import './e2e/tier1-feature-coverage.test';
import './e2e/tier2-boundary-corner.test';
import './e2e/tier3-cross-feature.test';
import './e2e/tier4-scenarios.test';

async function main() {
  console.log('\n\x1b[1m\x1b[36m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m          MEALWISE COMPREHENSIVE 4-TIER AUTOMATED TEST SUITE          \x1b[0m');
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');

  const { total, passed, failed, durationMs, summaries } = await registry.executeAll();

  console.log('\n\x1b[1m\x1b[36m----------------------------------------------------------------------\x1b[0m');
  console.log('\x1b[1mSUITE BREAKDOWN SUMMARY:\x1b[0m');
  console.log('\x1b[1m\x1b[36m----------------------------------------------------------------------\x1b[0m');

  let unitTotal = 0;
  let unitPassed = 0;
  let t1Total = 0;
  let t1Passed = 0;
  let t2Total = 0;
  let t2Passed = 0;
  let t3Total = 0;
  let t3Passed = 0;
  let t4Total = 0;
  let t4Passed = 0;

  for (const s of summaries) {
    const isPass = s.failed === 0;
    const statusIcon = isPass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  [${statusIcon}] ${s.suite.padEnd(65)} (${s.passed}/${s.total})`);

    if (s.suite.startsWith('Unit:')) {
      unitTotal += s.total;
      unitPassed += s.passed;
    } else if (s.suite.startsWith('Tier 1:')) {
      t1Total += s.total;
      t1Passed += s.passed;
    } else if (s.suite.startsWith('Tier 2:')) {
      t2Total += s.total;
      t2Passed += s.passed;
    } else if (s.suite.startsWith('Tier 3:')) {
      t3Total += s.total;
      t3Passed += s.passed;
    } else if (s.suite.startsWith('Tier 4:')) {
      t4Total += s.total;
      t4Passed += s.passed;
    }
  }

  console.log('\n\x1b[1m\x1b[36m======================================================================\x1b[0m');
  console.log('\x1b[1mTIER METRICS & COMPLIANCE SUMMARY:\x1b[0m');
  console.log(`  • \x1b[1mUnit Test Calculations\x1b[0m:         ${unitPassed} / ${unitTotal} passed`);
  console.log(`  • \x1b[1mTier 1 (Feature Coverage)\x1b[0m:       ${t1Passed} / ${t1Total} passed (>= 30 required)`);
  console.log(`  • \x1b[1mTier 2 (Boundary & Corner)\x1b[0m:     ${t2Passed} / ${t2Total} passed (>= 30 required)`);
  console.log(`  • \x1b[1mTier 3 (Cross-Feature Combos)\x1b[0m:  ${t3Passed} / ${t3Total} passed (>= 10 required)`);
  console.log(`  • \x1b[1mTier 4 (Real-World Scenarios)\x1b[0m:  ${t4Passed} / ${t4Total} passed (>= 6 required)`);
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m');

  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  console.log(`\x1b[1mOVERALL RESULTS:\x1b[0m Total: ${total} | Passed: \x1b[32m${passed}\x1b[0m | Failed: ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '0'} | Pass Rate: \x1b[1m\x1b[32m${passRate}%\x1b[0m | Duration: ${(durationMs / 1000).toFixed(2)}s\n`);

  if (failed > 0) {
    console.error(`\x1b[31m[ERROR] ${failed} test(s) failed. See logs above.\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m[SUCCESS] All tests completed successfully with 100% pass rate!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
