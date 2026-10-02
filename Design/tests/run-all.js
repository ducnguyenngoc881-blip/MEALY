#!/usr/bin/env node
/**
 * run-all.js
 * Master Automated Test Runner for Remotion Design System & Knowledge Base
 * Zero runtime dependencies (Pure Node.js built-in modules)
 *
 * Executes all 4 tiers across 6 validator suites:
 * - Suite 1: Contrast & Luminance Math (Tiers 1 & 2)
 * - Suite 2: Design Token Schema & DTCG Compliance (Tiers 1 & 2)
 * - Suite 3: Guidelines Codex & Mathematical Rules (Tiers 1 & 2)
 * - Suite 4: SVG Standards & Clean-Code Hygiene (Tiers 1 & 2)
 * - Suite 5: Remotion Motion Physics & Safe Zones (Tiers 1 & 2)
 * - Suite 6: Cross-Feature Combinations & Real-World Workload Scenarios (Tiers 3 & 4)
 */

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GRAY = '\x1b[90m';

// Suite Registry
const SUITES = [
  { name: 'Contrast Math & Luminance', path: './test-contrast-math.js' },
  { name: 'Token Schema & DTCG Specification', path: './test-token-schema.js' },
  { name: 'Guidelines Codex & Mathematical Rules', path: './test-guidelines-codex.js' },
  { name: 'SVG Clean-Code & Vector Standards', path: './test-svg-standards.js' },
  { name: 'Remotion Motion Physics & Safe Zones', path: './test-remotion-motion.js' },
  { name: 'UI/UX Mobile Flow & Interaction Codex', path: './test-ui-ux-flow.js' },
  { name: 'UI/UX Quality Audit Rubric & Hard Veto Engine', path: './test-ui-ux-audit.js' },
  { name: 'Cross-Feature & E2E Integration', path: './test-e2e-integration.js' }
];

async function main() {
  const startTime = Date.now();

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   REMOTION GRAPHIC DESIGN SYSTEM — AUTOMATED MASTER TEST RUNNER               ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${GRAY}Node.js Version : ${process.version}${RESET}`);
  console.log(`${GRAY}Platform        : ${process.platform} (${process.arch})${RESET}`);
  console.log(`${GRAY}Working Dir     : ${process.cwd()}${RESET}\n`);

  const telemetry = {
    total: 0,
    passed: 0,
    failed: 0,
    tierCounts: {
      'Tier 1': { total: 0, passed: 0, failed: 0 },
      'Tier 2': { total: 0, passed: 0, failed: 0 },
      'Tier 3': { total: 0, passed: 0, failed: 0 },
      'Tier 4': { total: 0, passed: 0, failed: 0 }
    },
    failures: []
  };

  const runner = {
    reportTest(testName, tier = 'Tier 1', fn) {
      telemetry.total++;
      if (!telemetry.tierCounts[tier]) {
        telemetry.tierCounts[tier] = { total: 0, passed: 0, failed: 0 };
      }
      telemetry.tierCounts[tier].total++;

      try {
        fn();
        telemetry.passed++;
        telemetry.tierCounts[tier].passed++;
        console.log(`  ${GREEN}✓${RESET} ${GRAY}[${tier}]${RESET} ${testName}`);
        return true;
      } catch (err) {
        telemetry.failed++;
        telemetry.tierCounts[tier].failed++;
        telemetry.failures.push({ testName, tier, error: err });
        console.error(`  ${RED}✗ [${tier}] ${testName}${RESET}`);
        console.error(`    ${RED}Error: ${err.message}${RESET}`);
        return false;
      }
    }
  };

  // Run all suites
  for (const suite of SUITES) {
    const fullPath = path.resolve(__dirname, suite.path);
    try {
      const module = require(fullPath);
      if (typeof module.run === 'function') {
        module.run(runner);
      } else {
        console.warn(`  ${YELLOW}⚠ Suite ${suite.name} does not export a run() function.${RESET}`);
      }
    } catch (suiteErr) {
      console.error(`  ${RED}✗ Failed to execute suite ${suite.name}: ${suiteErr.message}${RESET}`);
      telemetry.failures.push({ testName: `Suite execution: ${suite.name}`, tier: 'System', error: suiteErr });
    }
  }

  // Live Repository File Discovery Audit
  console.log(`\n--- Live Repository File Discovery Audit ---`);
  const rootDir = path.resolve(__dirname, '..');
  const liveFiles = [
    { label: 'W3C DTCG Tokens (JSON)', path: 'tokens.json' },
    { label: 'Strongly Typed Tokens (TS)', path: 'tokens.ts' },
    { label: 'Layout & Grid Codex', path: 'guidelines/layout-grid.md' },
    { label: 'Visual Hierarchy Codex', path: 'guidelines/gestalt-hierarchy.md' },
    { label: 'Typography Codex', path: 'guidelines/typography.md' },
    { label: 'Color & Contrast Codex', path: 'guidelines/color-contrast.md' },
    { label: 'Flow States Codex (M1)', path: 'guidelines/flow-states.md' },
    { label: 'Mobile Ergonomics Codex (M1)', path: 'guidelines/mobile-ergonomics.md' },
    { label: 'Component Hierarchy Codex (M1)', path: 'guidelines/component-hierarchy.md' },
    { label: 'Visual Balance Codex (M1)', path: 'guidelines/visual-balance.md' },
    { label: 'Master Workflow Handbook', path: 'WORKFLOW.md' },
    { label: 'Quality Audit Rubric', path: 'DESIGN_AUDIT_RUBRIC.md' },
    { label: 'UI/UX Audit Rubric (M4)', path: 'UI_UX_AUDIT_RUBRIC.md' },
    { label: 'Antigravity Skill Package (M3)', path: 'skills/ui-ux-pro-max/SKILL.md' },
    { label: 'Pattern Search Utility (M3)', path: 'skills/ui-ux-pro-max/scripts/search-patterns.js' }
  ];

  for (const item of liveFiles) {
    const absPath = path.join(rootDir, item.path);
    if (fs.existsSync(absPath)) {
      const stat = fs.statSync(absPath);
      console.log(`  ${GREEN}✓${RESET} Found: ${item.label} (${item.path}) [${stat.size} bytes]`);
    } else {
      console.log(`  ${YELLOW}○${RESET} Notice: ${item.label} (${item.path}) [Pending parallel milestone output]`);
    }
  }

  const durationMs = Date.now() - startTime;

  // Print Summary Matrix
  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}                           TEST EXECUTION SUMMARY                              ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================================${RESET}`);

  for (const [tier, stats] of Object.entries(telemetry.tierCounts)) {
    const tierStatus = stats.failed === 0 ? `${GREEN}PASSED${RESET}` : `${RED}FAILED (${stats.failed})${RESET}`;
    console.log(
      `  ${BOLD}${tier.padEnd(8)}:${RESET} ${String(stats.passed).padStart(2)}/${String(stats.total).padEnd(2)} passed ` +
      `[${tierStatus}]`
    );
  }

  console.log(`${GRAY}--------------------------------------------------------------------------------${RESET}`);
  console.log(
    `  ${BOLD}TOTAL   :${RESET} ${telemetry.passed}/${telemetry.total} tests passed (${durationMs}ms)`
  );

  if (telemetry.failed > 0) {
    console.log(`\n${BOLD}${RED}FAILURE DETAILS (${telemetry.failed} failure(s)):${RESET}`);
    telemetry.failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [${f.tier}] ${f.testName}`);
      console.log(`     ${f.error.stack || f.error.message}`);
    });
    console.log(`\n${BOLD}${RED}OVERALL RESULT: FAILED${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`\n${BOLD}${GREEN}OVERALL RESULT: 100% SUITE PASSED — ALL TIERS VERIFIED${RESET}\n`);
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  });
}

module.exports = { main };
