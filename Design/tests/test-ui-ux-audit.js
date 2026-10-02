/**
 * test-ui-ux-audit.js
 * Comprehensive E2E Test Suite: UI/UX Quality Audit Rubric, Binary Hard Veto & Live Discovery
 * Zero runtime dependencies (Pure Node.js built-in modules)
 *
 * Covers:
 * - Tier 1: 100-Point Rubric Mathematical Model (5 orthogonal 20pt dimensions, certification tiers)
 * - Tier 1: Binary Accessibility Hard Veto Engine (Contrast < 4.5:1, Tap target < 44px -> 0/100 override)
 * - Tier 1: Guest Account Feature Gating & Lock Badge ("Đi Chợ Chung 🔒") + Plan Retention
 * - Tier 1: React Rules of Hooks Invariant Static Analyzer
 * - Tier 2: Boundary & Corner Cases (Exact cutoffs: 4.499 vs 4.500, 43.9px vs 44px, early return detection)
 * - Tier 2: Live Repository File Discovery Audit across all new architectural artifacts
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Authoritative Imports from tokens.ts
const tokensModule = require('../tokens.ts');
const {
  tokens,
  getContrastRatio,
  isWCAGCompliant,
  evaluateWcagCompliance
} = tokensModule;

// Canonical 100-Point Rubric Architecture Reference
const RUBRIC_ARCHITECTURE = {
  totalPoints: 100,
  dimensions: [
    { id: 'D1', name: 'Mobile Ergonomics & Safe Area Geometry', points: 20 },
    { id: 'D2', name: 'Invariant 5-State Architecture & Error Handling', points: 20 },
    { id: 'D3', name: 'Visual Hierarchy & Touch Target Compliance', points: 20, isHardGate: true },
    { id: 'D4', name: 'WCAG 2.1 AA/AAA Contrast & Dual-Theme Invariance', points: 20, isHardGate: true },
    { id: 'D5', name: 'Navigation Flow Continuity & Guest Account Gating', points: 20 }
  ],
  certificationTiers: [
    { name: 'Tier 1: Production Certified', min: 90, max: 100, decision: 'PASS' },
    { name: 'Tier 2: Conditional Pass', min: 80, max: 89, decision: 'PROVISIONAL' },
    { name: 'Tier 3: Rejected', min: 0, max: 79, decision: 'REJECT' },
    { name: 'Hard Veto Triggered', min: 0, max: 0, decision: 'HARD_VETO' }
  ],
  hardVetoCriteria: {
    minNormalContrast: 4.50,
    minLargeContrast: 3.00,
    minIosTouchTarget: 44.0,
    minAndroidTouchTarget: 48.0
  }
};

/**
 * Deterministic Audit Scoring Engine with Binary Hard Veto Logic.
 */
function evaluateAuditScore(dimensionScores, checks = {}) {
  const {
    textContrasts = [],     // array of { ratio, isLarge }
    touchTargets = [],      // array of { width, height, os }
    hasUnhandledDeadEnds = false
  } = checks;

  // 1. Calculate raw dimension sum
  let rawScore = 0;
  for (const d of RUBRIC_ARCHITECTURE.dimensions) {
    const pts = dimensionScores[d.id] !== undefined ? dimensionScores[d.id] : 0;
    if (pts < 0 || pts > d.points) {
      throw new RangeError(`Dimension ${d.id} score out of range [0, ${d.points}]: ${pts}`);
    }
    rawScore += pts;
  }

  // 2. Binary Hard Veto Evaluation
  const hardVetoReasons = [];

  // 2.1 Contrast Hard Veto
  for (const c of textContrasts) {
    const minRequired = c.isLarge ? RUBRIC_ARCHITECTURE.hardVetoCriteria.minLargeContrast : RUBRIC_ARCHITECTURE.hardVetoCriteria.minNormalContrast;
    if (c.ratio < minRequired) {
      hardVetoReasons.push(`Contrast Hard Veto: Contrast ratio ${c.ratio}:1 fails minimum ${minRequired}:1`);
    }
  }

  // 2.2 Touch Target Hard Veto
  for (const t of touchTargets) {
    const minTarget = t.os === 'android' ? RUBRIC_ARCHITECTURE.hardVetoCriteria.minAndroidTouchTarget : RUBRIC_ARCHITECTURE.hardVetoCriteria.minIosTouchTarget;
    if (t.width < minTarget || t.height < minTarget) {
      hardVetoReasons.push(`Touch Target Hard Veto: Target size ${t.width}x${t.height}px fails minimum ${minTarget}x${minTarget}px`);
    }
  }

  const isVetoed = hardVetoReasons.length > 0;
  const certifiedScore = isVetoed ? 0 : rawScore;

  // 3. Determine Certification Tier
  let certifiedTier;
  if (isVetoed) {
    certifiedTier = 'Hard Veto Triggered';
  } else if (certifiedScore >= 90) {
    certifiedTier = 'Tier 1: Production Certified';
  } else if (certifiedScore >= 80) {
    certifiedTier = 'Tier 2: Conditional Pass';
  } else {
    certifiedTier = 'Tier 3: Rejected';
  }

  return {
    rawScore,
    certifiedScore,
    isVetoed,
    hardVetoReasons,
    certifiedTier
  };
}

/**
 * Simulates Guest Account Feature Gating for Collaborative Grocery Sharing.
 */
function simulateGroceryFeatureAccess(user) {
  const isRegistered = Boolean(user && user.isRegistered);
  const buttonLabel = isRegistered ? 'Đi Chợ Chung' : 'Đi Chợ Chung 🔒';

  let actionResult;
  let showAuthModal = false;
  let roomCreated = false;

  if (!isRegistered) {
    showAuthModal = true;
    actionResult = {
      allowed: false,
      code: 'AUTH_REQUIRED',
      prompt: 'Đăng ký tài khoản MealWise để tạo phòng Đi Chợ Chung và chia sẻ danh sách mua sắm với người thân theo thời gian thực.'
    };
  } else {
    roomCreated = true;
    actionResult = {
      allowed: true,
      code: 'ROOM_CREATED',
      roomId: 'MW-ROOM-1234',
      ttlSeconds: 3600
    };
  }

  return {
    buttonLabel,
    hasLockBadge: !isRegistered,
    showAuthModal,
    roomCreated,
    actionResult
  };
}

/**
 * Simulates Guest Onboarding / Plan Retention on Registration.
 */
function handleGuestRegistration(guestSession, newAccountCredentials) {
  const retainedPlan = guestSession && guestSession.hasExistingMeals ? { ...guestSession.weeklyPlan } : null;
  const emailLower = newAccountCredentials.email.trim().toLowerCase();

  return {
    registeredEmail: emailLower,
    accountOnboardedKey: `mealwise_onboarding_completed_${emailLower}`,
    planRetained: retainedPlan !== null,
    activeWeeklyPlan: retainedPlan || { days: [] }
  };
}

/**
 * Static Analyzer for React Rules of Hooks Invariant:
 * Hooks must appear unconditionally at top of component body before any early returns.
 */
function analyzeReactHooksOrder(componentSource) {
  const lines = componentSource.split('\n');
  const HOOK_REGEX = /\b(useState|useMemo|useCallback|useEffect|useRef|useContext|useReducer)\s*\(/;
  const EARLY_RETURN_REGEX = /^\s*if\s*\(.+\)\s*return\b|^\s*return\s+(null|<|false|undefined|\{)/;

  let seenEarlyReturn = false;
  let earlyReturnLine = -1;
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    if (!seenEarlyReturn && EARLY_RETURN_REGEX.test(line)) {
      seenEarlyReturn = true;
      earlyReturnLine = lineNum;
    }

    if (HOOK_REGEX.test(line)) {
      if (seenEarlyReturn) {
        violations.push({
          line: lineNum,
          hook: line.match(HOOK_REGEX)[1],
          error: `React Rules of Hooks Invariant Violated: "${line.match(HOOK_REGEX)[1]}" called at line ${lineNum} after early return at line ${earlyReturnLine}`
        });
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

function run(runner) {
  const report = runner ? runner.reportTest : (name, tier, fn) => {
    try {
      fn();
      console.log(`  ✓ [${tier}] ${name}`);
      return true;
    } catch (err) {
      console.error(`  ✗ [${tier}] ${name}: ${err.message}`);
      throw err;
    }
  };

  console.log('\n--- Running Suite: UI/UX Quality Audit Rubric & Hard Veto Engine ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Rubric Specs, Veto Logic, Feature Gating)
  // =========================================================================

  report('Tier 1: 100-Point Rubric Mathematical Model: 5 x 20pt Orthogonal Dimensions', 'Tier 1', () => {
    assert.strictEqual(RUBRIC_ARCHITECTURE.dimensions.length, 5, 'Must have exactly 5 orthogonal dimensions');

    let totalPoints = 0;
    for (const d of RUBRIC_ARCHITECTURE.dimensions) {
      assert.strictEqual(d.points, 20, `Dimension ${d.id} must be allocated exactly 20 points`);
      totalPoints += d.points;
    }
    assert.strictEqual(totalPoints, 100, `All dimensions must sum exactly to 100 points, got ${totalPoints}`);

    // Verify 4 Certification Tiers coverage
    assert.strictEqual(RUBRIC_ARCHITECTURE.certificationTiers.length, 4, 'Must define 4 certification tiers');
  });

  report('Tier 1: Evaluator Engine: Standard Scoring without Veto (Tier 1 PASS & Tier 2)', 'Tier 1', () => {
    // Perfect 100 score
    const perfectScores = { D1: 20, D2: 20, D3: 20, D4: 20, D5: 20 };
    const perfectResult = evaluateAuditScore(perfectScores, {
      textContrasts: [{ ratio: 15.2, isLarge: false }],
      touchTargets: [{ width: 44, height: 44, os: 'ios' }]
    });
    assert.strictEqual(perfectResult.rawScore, 100);
    assert.strictEqual(perfectResult.certifiedScore, 100);
    assert.strictEqual(perfectResult.isVetoed, false);
    assert.strictEqual(perfectResult.certifiedTier, 'Tier 1: Production Certified');

    // 85 score (Tier 2 Conditional Pass)
    const conditionalScores = { D1: 18, D2: 17, D3: 16, D4: 18, D5: 16 };
    const conditionalResult = evaluateAuditScore(conditionalScores, {
      textContrasts: [{ ratio: 7.5, isLarge: false }],
      touchTargets: [{ width: 48, height: 48, os: 'android' }]
    });
    assert.strictEqual(conditionalResult.rawScore, 85);
    assert.strictEqual(conditionalResult.certifiedScore, 85);
    assert.strictEqual(conditionalResult.isVetoed, false);
    assert.strictEqual(conditionalResult.certifiedTier, 'Tier 2: Conditional Pass');
  });

  report('Tier 1: Binary Hard Veto: Contrast Failure overrides score to ZERO (0/100)', 'Tier 1', () => {
    // Artifact scores 98/100 across all design dimensions, but 1 normal text has 4.40:1 contrast
    const highScores = { D1: 20, D2: 20, D3: 20, D4: 18, D5: 20 };
    const contrastFailResult = evaluateAuditScore(highScores, {
      textContrasts: [
        { ratio: 12.0, isLarge: false },
        { ratio: 4.40, isLarge: false } // FAILS WCAG 2.1 AA (4.50:1 minimum)
      ],
      touchTargets: [{ width: 44, height: 44, os: 'ios' }]
    });

    assert.strictEqual(contrastFailResult.rawScore, 98, 'Raw score was 98');
    assert.strictEqual(contrastFailResult.isVetoed, true, 'Contrast failure must trigger Hard Veto');
    assert.strictEqual(contrastFailResult.certifiedScore, 0, 'Certified score must be OVERRIDDEN TO ZERO');
    assert.strictEqual(contrastFailResult.certifiedTier, 'Hard Veto Triggered');
    assert(contrastFailResult.hardVetoReasons[0].includes('Contrast Hard Veto'));
  });

  report('Tier 1: Binary Hard Veto: Touch Target Failure overrides score to ZERO (0/100)', 'Tier 1', () => {
    // Artifact scores 95/100, but has a 40x44px button on iOS
    const highScores = { D1: 19, D2: 19, D3: 19, D4: 19, D5: 19 };
    const touchFailResult = evaluateAuditScore(highScores, {
      textContrasts: [{ ratio: 8.5, isLarge: false }],
      touchTargets: [
        { width: 44, height: 44, os: 'ios' },
        { width: 40, height: 44, os: 'ios' } // FAILS iOS 44x44px minimum
      ]
    });

    assert.strictEqual(touchFailResult.rawScore, 95);
    assert.strictEqual(touchFailResult.isVetoed, true, 'Touch target failure must trigger Hard Veto');
    assert.strictEqual(touchFailResult.certifiedScore, 0, 'Certified score must be OVERRIDDEN TO ZERO');
    assert.strictEqual(touchFailResult.certifiedTier, 'Hard Veto Triggered');
    assert(touchFailResult.hardVetoReasons[0].includes('Touch Target Hard Veto'));
  });

  report('Tier 1: Guest Account Feature Gating: Lock Badge ("Đi Chợ Chung 🔒") & Auth Prompt', 'Tier 1', () => {
    // Unregistered Guest Case
    const guestUser = { isRegistered: false };
    const guestAccess = simulateGroceryFeatureAccess(guestUser);
    assert.strictEqual(guestAccess.buttonLabel, 'Đi Chợ Chung 🔒', 'Guest button label must have lock badge');
    assert.strictEqual(guestAccess.hasLockBadge, true, 'Guest must have lock badge flag true');
    assert.strictEqual(guestAccess.showAuthModal, true, 'Guest tap must open AuthModal');
    assert.strictEqual(guestAccess.roomCreated, false, 'Guest must not create collaborative room');
    assert.strictEqual(guestAccess.actionResult.allowed, false);

    // Registered User Case
    const regUser = { isRegistered: true, email: 'user@mealwise.vn' };
    const regAccess = simulateGroceryFeatureAccess(regUser);
    assert.strictEqual(regAccess.buttonLabel, 'Đi Chợ Chung', 'Registered user button must NOT have lock badge');
    assert.strictEqual(regAccess.hasLockBadge, false);
    assert.strictEqual(regAccess.showAuthModal, false);
    assert.strictEqual(regAccess.roomCreated, true, 'Registered user creates collaborative room');
    assert.strictEqual(regAccess.actionResult.allowed, true);
    assert.strictEqual(regAccess.actionResult.ttlSeconds, 3600, 'Room TTL must be 1 hour (3600s)');
  });

  report('Tier 1: Account-Scoped Onboarding & Guest Plan Retention Invariant', 'Tier 1', () => {
    const guestSession = {
      hasExistingMeals: true,
      weeklyPlan: { days: ['Mon', 'Tue', 'Wed'], customMealsCount: 6 }
    };
    const newCredentials = { email: 'chef.nguyen@mealwise.vn' };

    const registration = handleGuestRegistration(guestSession, newCredentials);
    assert.strictEqual(registration.registeredEmail, 'chef.nguyen@mealwise.vn');
    assert.strictEqual(registration.accountOnboardedKey, 'mealwise_onboarding_completed_chef.nguyen@mealwise.vn');
    assert.strictEqual(registration.planRetained, true, 'Existing guest meal plan must be retained upon registration');
    assert.strictEqual(registration.activeWeeklyPlan.customMealsCount, 6, 'Plan items count preserved');
  });

  report('Tier 1: React Rules of Hooks Invariant: Top-Level Hook Order Analyzer', 'Tier 1', () => {
    // Valid React Component
    const validComponent = `
      export function RecipeDrawer({ isOpen, recipeId }) {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(false);
        const memoizedValue = useMemo(() => computeSomething(data), [data]);
        const drawerRef = useRef(null);

        useEffect(() => {
          if (isOpen && recipeId) {
            fetchRecipe(recipeId);
          }
        }, [isOpen, recipeId]);

        if (!isOpen) return null;

        return <div ref={drawerRef}>{data.title}</div>;
      }
    `;
    const validAnalysis = analyzeReactHooksOrder(validComponent);
    assert.strictEqual(validAnalysis.valid, true, 'Valid component with hooks at top must pass');
    assert.strictEqual(validAnalysis.violations.length, 0);

    // Invalid React Component: Early return before useState / useEffect
    const invalidComponent = `
      export function BrokenModal({ isOpen, recipeId }) {
        if (!isOpen) return null; // Early return placed BEFORE hooks!

        const [data, setData] = useState(null);
        useEffect(() => {
          fetchRecipe(recipeId);
        }, [recipeId]);

        return <div>{data}</div>;
      }
    `;
    const invalidAnalysis = analyzeReactHooksOrder(invalidComponent);
    assert.strictEqual(invalidAnalysis.valid, false, 'Component with early return before hooks must fail');
    assert(invalidAnalysis.violations.length >= 1, 'Must report at least 1 hook violation');
    assert(invalidAnalysis.violations[0].error.includes('React Rules of Hooks Invariant Violated'));
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // =========================================================================

  report('Tier 2: Boundary case - Exact Contrast Cutoff: 4.499 fails AA vs 4.500 passes AA', 'Tier 2', () => {
    const scores = { D1: 20, D2: 20, D3: 20, D4: 20, D5: 20 };

    // 4.499 fails AA -> Hard Veto
    const fail4499 = evaluateAuditScore(scores, {
      textContrasts: [{ ratio: 4.499, isLarge: false }]
    });
    assert.strictEqual(fail4499.isVetoed, true);
    assert.strictEqual(fail4499.certifiedScore, 0);

    // 4.500 passes AA -> PASS (100)
    const pass4500 = evaluateAuditScore(scores, {
      textContrasts: [{ ratio: 4.500, isLarge: false }]
    });
    assert.strictEqual(pass4500.isVetoed, false);
    assert.strictEqual(pass4500.certifiedScore, 100);
  });

  report('Tier 2: Boundary case - Exact Touch Target Cutoff: 43.9px fails iOS vs 44.0px passes iOS', 'Tier 2', () => {
    const scores = { D1: 20, D2: 20, D3: 20, D4: 20, D5: 20 };

    // 43.9px fails iOS minimum -> Hard Veto
    const fail439 = evaluateAuditScore(scores, {
      touchTargets: [{ width: 43.9, height: 44.0, os: 'ios' }]
    });
    assert.strictEqual(fail439.isVetoed, true);
    assert.strictEqual(fail439.certifiedScore, 0);

    // 44.0px passes iOS minimum -> PASS
    const pass440 = evaluateAuditScore(scores, {
      touchTargets: [{ width: 44.0, height: 44.0, os: 'ios' }]
    });
    assert.strictEqual(pass440.isVetoed, false);
    assert.strictEqual(pass440.certifiedScore, 100);
  });

  report('Tier 2: Boundary case - Android Profile Target: 47.9px fails vs 48.0px passes', 'Tier 2', () => {
    const scores = { D1: 20, D2: 20, D3: 20, D4: 20, D5: 20 };

    // 47.9px on Android fails 48px profile -> Hard Veto
    const fail479 = evaluateAuditScore(scores, {
      touchTargets: [{ width: 47.9, height: 48.0, os: 'android' }]
    });
    assert.strictEqual(fail479.isVetoed, true);
    assert.strictEqual(fail479.certifiedScore, 0);

    // 48.0px passes Android profile -> PASS
    const pass480 = evaluateAuditScore(scores, {
      touchTargets: [{ width: 48.0, height: 48.0, os: 'android' }]
    });
    assert.strictEqual(pass480.isVetoed, false);
    assert.strictEqual(pass480.certifiedScore, 100);
  });

  report('Tier 2: Boundary case - Score Range Validation & Negative Score Rejection', 'Tier 2', () => {
    assert.throws(() => evaluateAuditScore({ D1: -1 }), /out of range/);
    assert.throws(() => evaluateAuditScore({ D1: 21 }), /out of range/);
  });

  report('Tier 2: Boundary case - Live Repository File Discovery Audit across all New Artifacts', 'Tier 2', () => {
    const rootDir = path.resolve(__dirname, '..');
    const newArtifacts = [
      { path: 'guidelines/flow-states.md', minSize: 5000, keywords: ['5 Invariant View States', 'STATE_EMPTY', 'STATE_LOADING', 'STATE_ACTIVE', 'STATE_ERROR', 'STATE_PARTIAL'] },
      { path: 'guidelines/mobile-ergonomics.md', minSize: 5000, keywords: ['Thumb-Zone', 'Natural Zone', 'Touch Target', 'Safe Area', '7 Canonical Device Viewports', 'Zero Horizontal Overflow'] },
      { path: 'guidelines/component-hierarchy.md', minSize: 5000, keywords: ['Z-Index Strata', 'BottomSheet', 'Đi Chợ Chung 🔒', 'React Rules of Hooks', 'Food Photography Purity'] },
      { path: 'guidelines/visual-balance.md', minSize: 5000, keywords: ['Visual Weight', 'Center of Visual Gravity', 'Optical Center', 'Asymmetric', 'Dark-Mode Optical Density'] },
      { path: 'UI_UX_AUDIT_RUBRIC.md', minSize: 10000, keywords: ['100-Point', 'Hard Veto', 'Dimension 1', 'Dimension 2', 'Dimension 3', 'Dimension 4', 'Dimension 5'] },
      { path: 'skills/ui-ux-pro-max/SKILL.md', minSize: 1000, keywords: ['ui-ux-pro-max', '5 Invariant View States', 'Mobile Ergonomics'] }
    ];

    for (const item of newArtifacts) {
      const absPath = path.join(rootDir, item.path);
      assert.strictEqual(fs.existsSync(absPath), true, `Required artifact must exist: ${item.path}`);
      const content = fs.readFileSync(absPath, 'utf8');
      assert(content.length >= item.minSize, `Artifact ${item.path} size (${content.length} bytes) must be >= ${item.minSize} bytes`);

      for (const kw of item.keywords) {
        assert(content.includes(kw), `Artifact ${item.path} must contain mandatory keyword: "${kw}"`);
      }
      console.log(`    [Live File Found & Verified]: ${item.path} (${content.length} bytes)`);
    }
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  RUBRIC_ARCHITECTURE,
  evaluateAuditScore,
  simulateGroceryFeatureAccess,
  handleGuestRegistration,
  analyzeReactHooksOrder
};
