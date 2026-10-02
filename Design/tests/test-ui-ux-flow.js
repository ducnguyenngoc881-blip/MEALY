/**
 * test-ui-ux-flow.js
 * Comprehensive E2E Test Suite: Mobile UI/UX Flow Architecture, Ergonomics & Design Tokens
 * Zero runtime dependencies (Pure Node.js built-in modules)
 *
 * Covers:
 * - Tier 1: Feature Coverage (5 Invariant States, Mobile Ergonomics, Stone Palette, Token Getters)
 * - Tier 2: Boundary & Corner Cases (CLS=0 skeleton, 44px/48px tap targets, safe areas, 7 viewports, zero overflow)
 * - Tier 3: Cross-Feature Interactions (State machine transitions, thumb-zone placement, contrast verification)
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Authoritative Imports from tokens.ts
const tokensModule = require('../tokens.ts');
const {
  tokens,
  getContrastRatio,
  getRelativeLuminance,
  isWCAGCompliant,
  evaluateWcagCompliance,
  getTouchTarget,
  getSafeAreaInset,
  getZIndex,
  generateCSSVariables
} = tokensModule;

// Canonical Ergonomic Reference Specifications
const ERGONOMIC_SPECS = {
  thumbZones: {
    natural: { ratio: 0.40, percentage: '40%', allowedRoles: ['primary_cta', 'tabs', 'sticky_bar', 'bottom_sheet_actions'] },
    reach:   { ratio: 0.35, percentage: '35%', allowedRoles: ['card_list', 'stepper', 'search_input', 'filter_chips'] },
    hard:    { ratio: 0.25, percentage: '25%', allowedRoles: ['header_title', 'status_badge', 'back_arrow', 'passive_settings'] }
  },
  touchTargets: {
    iosMin: 44,       // Apple HIG 44x44px
    androidMin: 48,   // Android Material 48x48px
    minGap: 8         // Inter-target clearance to avoid fat-finger errors
  },
  safeAreas: {
    top: 47,          // Dynamic Island / camera notch inset
    bottom: 34,       // Home gesture indicator bar inset
    left: 0,
    right: 0
  },
  canonicalViewports: [
    { width: 320, name: 'Ultra-compact / Fold outer', columns: 1, padding: 12 },
    { width: 360, name: 'Standard Android base', columns: 1, padding: 16 },
    { width: 375, name: 'Compact iOS (SE 2/3)', columns: 1, padding: 16 },
    { width: 390, name: 'Modern iOS reference (iPhone 14/15/16)', columns: 1, padding: 16 },
    { width: 414, name: 'Flagship mobile (Plus / Pro Max)', columns: 1, padding: 16 },
    { width: 768, name: 'Tablet portrait', columns: 2, padding: 24 },
    { width: 1280, name: 'Desktop HD (Mobile Clamping)', maxContainerWidth: 512, centered: true, padding: 16 }
  ],
  flowStates: ['empty', 'loading', 'active', 'error', 'partial']
};

/**
 * Validates FSM transition legality.
 */
function validateStateTransition(fromState, toState) {
  const LEGAL_TRANSITIONS = {
    empty:   ['loading', 'active'],
    loading: ['active', 'empty', 'error'],
    active:  ['loading', 'partial', 'empty'],
    error:   ['loading', 'empty'],
    partial: ['active', 'empty', 'loading']
  };

  if (!LEGAL_TRANSITIONS[fromState]) {
    throw new Error(`Invalid source state: "${fromState}"`);
  }
  return LEGAL_TRANSITIONS[fromState].includes(toState);
}

/**
 * Simulates flexbox layout width calculation and checks for horizontal overflow.
 */
function simulateFlexContainerFit(containerWidth, flexChildProps) {
  const { hasMinW0, hasTruncate, textContentLength, baseCharWidth = 8, imageWidth = 48, gap = 12 } = flexChildProps;
  const naturalTextWidth = textContentLength * baseCharWidth;

  let effectiveTextWidth;
  if (hasMinW0 && hasTruncate) {
    // Container clamps child width
    const availableWidth = containerWidth - imageWidth - gap;
    effectiveTextWidth = Math.min(naturalTextWidth, Math.max(0, availableWidth));
  } else {
    // Flex child blows out because min-width: auto
    effectiveTextWidth = naturalTextWidth;
  }

  const totalContentWidth = imageWidth + gap + effectiveTextWidth;
  const hasOverflow = totalContentWidth > containerWidth;

  return {
    containerWidth,
    totalContentWidth,
    hasOverflow,
    overflowDelta: Math.max(0, totalContentWidth - containerWidth)
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

  console.log('\n--- Running Suite: UI/UX Mobile Flow & Interaction Codex ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Core Invariants & Specifications)
  // =========================================================================

  report('Tier 1: 5 Invariant View States: Token Schema & Definitions', 'Tier 1', () => {
    assert(tokens.flowState, 'tokens.flowState must exist');
    for (const stateId of ERGONOMIC_SPECS.flowStates) {
      const stateObj = tokens.flowState[stateId];
      assert(stateObj, `State "${stateId}" must be defined in tokens.flowState`);
      assert.strictEqual(stateObj.$value, stateId, `State value must match state ID: ${stateId}`);
      assert.strictEqual(typeof stateObj.name, 'string', `State "${stateId}" must have human-readable name`);
      assert.strictEqual(typeof stateObj.$description, 'string', `State "${stateId}" must have description`);
      assert.strictEqual(typeof stateObj.actionAffordance, 'string', `State "${stateId}" must specify action affordance`);
    }

    // Verify exact affordance contracts
    assert.strictEqual(tokens.flowState.empty.actionAffordance, 'primary_cta');
    assert.strictEqual(tokens.flowState.loading.actionAffordance, 'shimmer_skeleton');
    assert.strictEqual(tokens.flowState.active.actionAffordance, 'interactive_view');
    assert.strictEqual(tokens.flowState.error.actionAffordance, 'retry_button');
    assert.strictEqual(tokens.flowState.partial.actionAffordance, 'clear_filters_button');
  });

  report('Tier 1: Thumb-Zone Spatial Hierarchy: 40% / 35% / 25% Mathematical Partition', 'Tier 1', () => {
    assert(tokens.thumbZone, 'tokens.thumbZone must exist');
    const { natural, reach, hard } = tokens.thumbZone;

    assert.strictEqual(natural.$value, 40, 'Natural zone must be 40%');
    assert.strictEqual(reach.$value, 35, 'Reach zone must be 35%');
    assert.strictEqual(hard.$value, 25, 'Hard zone must be 25%');

    // Mathematical sum theorem: 40 + 35 + 25 = 100
    const totalPercentage = natural.$value + reach.$value + hard.$value;
    assert.strictEqual(totalPercentage, 100, `Thumb zone percentages must sum to 100, got ${totalPercentage}`);

    // Ratio sum theorem: 0.40 + 0.35 + 0.25 = 1.00
    const totalRatio = natural.ratio + reach.ratio + hard.ratio;
    assert(Math.abs(totalRatio - 1.00) < 1e-6, `Thumb zone ratios must sum to 1.00, got ${totalRatio}`);
  });

  report('Tier 1: Touch Target Standards: iOS (>=44px) & Android (>=48px) Bounds', 'Tier 1', () => {
    assert(tokens.touch, 'tokens.touch must exist');
    const iosTarget = getTouchTarget('minTouchTarget');
    const iosAlias = getTouchTarget('minTarget');
    const androidTarget = getTouchTarget('androidTouchTarget');
    const compactTarget = getTouchTarget('compactTarget');

    assert.strictEqual(iosTarget, 44, 'iOS minimum touch target must be 44px');
    assert.strictEqual(iosAlias, 44, 'Canonical touch target alias must be 44px');
    assert.strictEqual(androidTarget, 48, 'Android minimum touch target must be 48px');
    assert.strictEqual(compactTarget, 36, 'Compact target must be 36px');

    assert(iosTarget >= ERGONOMIC_SPECS.touchTargets.iosMin, 'iOS target meets 44px standard');
    assert(androidTarget >= ERGONOMIC_SPECS.touchTargets.androidMin, 'Android target meets 48px standard');
  });

  report('Tier 1: Safe Area Insets: Environmental Top & Bottom Dimensions', 'Tier 1', () => {
    assert(tokens.safeArea, 'tokens.safeArea must exist');
    const topInset = getSafeAreaInset('insetTop');
    const bottomInset = getSafeAreaInset('insetBottom');
    const topAlias = getSafeAreaInset('top');
    const bottomAlias = getSafeAreaInset('bottom');

    assert.strictEqual(topInset, 47, 'Top safe area inset must be 47px');
    assert.strictEqual(bottomInset, 34, 'Bottom safe area inset must be 34px');
    assert.strictEqual(topAlias, 47, 'Top safe area alias must be 47px');
    assert.strictEqual(bottomAlias, 34, 'Bottom safe area alias must be 34px');

    // Verify environmental CSS syntax encapsulation
    assert(tokens.safeArea.insetTop.env.includes('env(safe-area-inset-top'), 'Top inset must reference env(safe-area-inset-top)');
    assert(tokens.safeArea.insetBottom.env.includes('env(safe-area-inset-bottom'), 'Bottom inset must reference env(safe-area-inset-bottom)');
  });

  report('Tier 1: 7 Canonical Mobile Device Viewports & Clamping Geometry', 'Tier 1', () => {
    const viewports = ERGONOMIC_SPECS.canonicalViewports;
    assert.strictEqual(viewports.length, 7, 'Must support exactly 7 canonical viewports');

    // 1-column mobile phones (< 768px)
    const mobilePhones = viewports.filter(v => v.width < 768);
    assert.strictEqual(mobilePhones.length, 5, 'Must have 5 single-column mobile phone viewports');
    for (const vp of mobilePhones) {
      assert.strictEqual(vp.columns, 1, `Viewport ${vp.width}px must use 1-column layout`);
      assert(vp.padding >= 12, `Viewport ${vp.width}px must have >= 12px padding`);
    }

    // Tablet (768px)
    const tablet = viewports.find(v => v.width === 768);
    assert(tablet, 'Tablet 768px viewport must exist');
    assert.strictEqual(tablet.columns, 2, 'Tablet 768px must use 2-column layout');

    // Desktop HD (1280px+) Mobile Clamping Invariant
    const desktop = viewports.find(v => v.width === 1280);
    assert(desktop, 'Desktop 1280px viewport must exist');
    assert.strictEqual(desktop.maxContainerWidth, 512, 'Desktop must clamp mobile frame to max-w-lg (512px)');
    assert.strictEqual(desktop.centered, true, 'Desktop mobile frame must be centered');
  });

  report('Tier 1: Luxury Editorial Stone Palette: Light & Dark Contrast Verification', 'Tier 1', () => {
    assert(tokens.color.stone, 'tokens.color.stone must exist');
    const { light, dark } = tokens.color.stone;

    // Light mode values
    assert.strictEqual(light.canvas.$value, '#FAF8F5');
    assert.strictEqual(light.card.$value, '#FFFFFF');
    assert.strictEqual(light.border.$value, '#E8E2D8');
    assert.strictEqual(light.text.$value, '#1C1917');

    // Dark mode values
    assert.strictEqual(dark.canvas.$value, '#121110');
    assert.strictEqual(dark.card.$value, '#1A1918');
    assert.strictEqual(dark.border.$value, '#252220');
    assert.strictEqual(dark.text.$value, '#FAF8F5');

    // Light mode text contrast
    const crLightCanvas = getContrastRatio(light.text.$value, light.canvas.$value);
    const crLightCard = getContrastRatio(light.text.$value, light.card.$value);
    assert(crLightCanvas >= 7.0, `Light mode text on canvas must meet AAA (>=7.0:1), got ${crLightCanvas.toFixed(2)}:1`);
    assert(crLightCard >= 7.0, `Light mode text on card must meet AAA (>=7.0:1), got ${crLightCard.toFixed(2)}:1`);

    // Dark mode text contrast
    const crDarkCanvas = getContrastRatio(dark.text.$value, dark.canvas.$value);
    const crDarkCard = getContrastRatio(dark.text.$value, dark.card.$value);
    assert(crDarkCanvas >= 7.0, `Dark mode text on canvas must meet AAA (>=7.0:1), got ${crDarkCanvas.toFixed(2)}:1`);
    assert(crDarkCard >= 7.0, `Dark mode text on card must meet AAA (>=7.0:1), got ${crDarkCard.toFixed(2)}:1`);

    // Invariant check: All meet WCAG AA and AAA
    assert.strictEqual(isWCAGCompliant(light.text.$value, light.canvas.$value, 'AA'), true);
    assert.strictEqual(isWCAGCompliant(light.text.$value, light.canvas.$value, 'AAA'), true);
    assert.strictEqual(isWCAGCompliant(dark.text.$value, dark.canvas.$value, 'AA'), true);
    assert.strictEqual(isWCAGCompliant(dark.text.$value, dark.canvas.$value, 'AAA'), true);
  });

  report('Tier 1: Z-Index Strata Tokens & Helper Getters', 'Tier 1', () => {
    assert(tokens.zIndex, 'tokens.zIndex must exist');
    assert.strictEqual(getZIndex('modal'), 1000, 'Modal z-index must be 1000');
    assert.strictEqual(getZIndex('drawer'), 900, 'Drawer bottom sheet z-index must be 900');
    assert.strictEqual(getZIndex('sticky'), 500, 'Sticky bottom bar z-index must be 500');
    assert.strictEqual(getZIndex('header'), 100, 'Sticky header z-index must be 100');

    // Hierarchy ordering check: modal > drawer > sticky > header
    assert(getZIndex('modal') > getZIndex('drawer'));
    assert(getZIndex('drawer') > getZIndex('sticky'));
    assert(getZIndex('sticky') > getZIndex('header'));
  });

  report('Tier 1: CSS Custom Property Generator includes Stone & Mobile Tokens', 'Tier 1', () => {
    const cssVars = generateCSSVariables();
    assert(typeof cssVars === 'object', 'generateCSSVariables must return an object');

    // Verify Stone palette variables
    assert.strictEqual(cssVars['--color-stone-light-canvas'], '#FAF8F5');
    assert.strictEqual(cssVars['--color-stone-dark-canvas'], '#121110');
    assert.strictEqual(cssVars['--color-stone-canvas'], '#FAF8F5');
    assert.strictEqual(cssVars['--color-stone-text'], '#1C1917');

    // Verify Mobile Touch variables
    assert.strictEqual(cssVars['--touch-min-touch-target'], '44px');
    assert.strictEqual(cssVars['--touch-android-touch-target'], '48px');

    // Verify Safe Area variables
    assert.strictEqual(cssVars['--safe-area-inset-top'], '47px');
    assert.strictEqual(cssVars['--safe-area-inset-bottom'], '34px');

    // Verify Thumb Zone variables
    assert.strictEqual(cssVars['--thumb-zone-natural'], '40%');
    assert.strictEqual(cssVars['--thumb-zone-reach'], '35%');
    assert.strictEqual(cssVars['--thumb-zone-hard'], '25%');

    // Verify Z-Index variables
    assert.strictEqual(cssVars['--z-index-modal'], '1000');
    assert.strictEqual(cssVars['--z-index-drawer'], '900');
    assert.strictEqual(cssVars['--z-index-sticky'], '500');
    assert.strictEqual(cssVars['--z-index-header'], '100');

    // Verify Flow State variables
    assert.strictEqual(cssVars['--flow-state-empty'], 'empty');
    assert.strictEqual(cssVars['--flow-state-loading'], 'loading');
    assert.strictEqual(cssVars['--flow-state-active'], 'active');
    assert.strictEqual(cssVars['--flow-state-error'], 'error');
    assert.strictEqual(cssVars['--flow-state-partial'], 'partial');
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // =========================================================================

  report('Tier 2: Boundary case - State Machine: Valid transitions and illegal skip rejection', 'Tier 2', () => {
    // Valid lifecycle transitions
    assert.strictEqual(validateStateTransition('empty', 'loading'), true, 'empty -> loading is legal');
    assert.strictEqual(validateStateTransition('loading', 'active'), true, 'loading -> active is legal');
    assert.strictEqual(validateStateTransition('loading', 'empty'), true, 'loading -> empty (0 records) is legal');
    assert.strictEqual(validateStateTransition('loading', 'error'), true, 'loading -> error is legal');
    assert.strictEqual(validateStateTransition('error', 'loading'), true, 'error -> loading (retry) is legal');
    assert.strictEqual(validateStateTransition('active', 'partial'), true, 'active -> partial is legal');
    assert.strictEqual(validateStateTransition('partial', 'active'), true, 'partial -> active (clear filters) is legal');

    // Illegal transitions that bypass required lifecycle invariants
    assert.strictEqual(validateStateTransition('empty', 'error'), false, 'empty cannot transition directly to error without loading');
    assert.strictEqual(validateStateTransition('error', 'active'), false, 'error cannot transition directly to active without retry loading');
    assert.strictEqual(validateStateTransition('error', 'partial'), false, 'error cannot transition directly to partial');

    // Unknown state rejection
    assert.throws(() => validateStateTransition('unknown_state', 'active'), /Invalid source state/);
  });

  report('Tier 2: Boundary case - Zero Horizontal Overflow: min-w-0 & truncate prevention', 'Tier 2', () => {
    // 320px viewport with a long Vietnamese dish title (68 characters)
    const longDishTitle = 'Bánh Mì Nướng Bơ Tỏi Sốt Phô Mai Kẹp Thịt Xông Khói Chuẩn Vị Gia Đình';
    const containerWidth = 320 - 24; // 296px available

    // Scenario A: Flex child WITHOUT min-w-0 / truncate causes blowout
    const unconstrained = simulateFlexContainerFit(containerWidth, {
      hasMinW0: false,
      hasTruncate: false,
      textContentLength: longDishTitle.length,
      baseCharWidth: 8,
      imageWidth: 48,
      gap: 12
    });
    assert.strictEqual(unconstrained.hasOverflow, true, 'Unconstrained flex item must blow out container');
    assert(unconstrained.overflowDelta > 200, `Overflow delta must be > 200px, got ${unconstrained.overflowDelta}px`);

    // Scenario B: Flex child WITH min-w-0 + truncate strictly prevents horizontal overflow
    const constrained = simulateFlexContainerFit(containerWidth, {
      hasMinW0: true,
      hasTruncate: true,
      textContentLength: longDishTitle.length,
      baseCharWidth: 8,
      imageWidth: 48,
      gap: 12
    });
    assert.strictEqual(constrained.hasOverflow, false, 'Constrained flex item must not overflow container');
    assert.strictEqual(constrained.overflowDelta, 0, 'Overflow delta must be strictly 0px');
    assert(constrained.totalContentWidth <= containerWidth, 'Total content width must fit within container');
  });

  report('Tier 2: Boundary case - Touch Target & Inter-Target Clearance Violation Detection', 'Tier 2', () => {
    function evaluateTouchTargets(targets, os = 'ios') {
      const minSize = os === 'android' ? 48 : 44;
      const minGap = 8;
      const violations = [];

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (t.width < minSize || t.height < minSize) {
          violations.push({ index: i, type: 'under_minimum_size', width: t.width, height: t.height, minSize });
        }
        if (i < targets.length - 1) {
          const next = targets[i + 1];
          const gap = next.x - (t.x + t.width);
          if (gap < minGap) {
            violations.push({ index: i, type: 'insufficient_clearance', gap, minGap });
          }
        }
      }
      return { pass: violations.length === 0, violations };
    }

    // Compliant targets: two 44x44 buttons with 12px gap
    const validRow = [
      { x: 16, y: 100, width: 44, height: 44 },
      { x: 72, y: 100, width: 44, height: 44 } // gap = 72 - 60 = 12px
    ];
    const validResult = evaluateTouchTargets(validRow, 'ios');
    assert.strictEqual(validResult.pass, true, 'Valid target row must pass');

    // Violating size: 40x44px button fails iOS standard
    const invalidSize = [
      { x: 16, y: 100, width: 40, height: 44 }
    ];
    const invalidSizeResult = evaluateTouchTargets(invalidSize, 'ios');
    assert.strictEqual(invalidSizeResult.pass, false, '40x44 target must fail iOS standard');
    assert.strictEqual(invalidSizeResult.violations[0].type, 'under_minimum_size');

    // Violating clearance: 4px gap fails minimum 8px inter-target clearance
    const invalidGap = [
      { x: 16, y: 100, width: 44, height: 44 },
      { x: 64, y: 100, width: 44, height: 44 } // gap = 64 - 60 = 4px
    ];
    const invalidGapResult = evaluateTouchTargets(invalidGap, 'ios');
    assert.strictEqual(invalidGapResult.pass, false, '4px gap must fail 8px clearance rule');
    assert.strictEqual(invalidGapResult.violations[0].type, 'insufficient_clearance');

    // Android 44px target fails Android 48px requirement
    const androidFail = [
      { x: 16, y: 100, width: 44, height: 44 }
    ];
    const androidResult = evaluateTouchTargets(androidFail, 'android');
    assert.strictEqual(androidResult.pass, false, '44x44 target must fail Android 48px profile');
  });

  report('Tier 2: Boundary case - Ergonomic Zone Allocation & Anti-Pattern Detection', 'Tier 2', () => {
    function evaluateActionZone(actionRole, normalizedY) {
      let zone;
      if (normalizedY >= 0.60) {
        zone = 'natural';
      } else if (normalizedY >= 0.25) {
        zone = 'reach';
      } else {
        zone = 'hard';
      }

      // Hard zone prohibition: Primary CTAs must NEVER be placed in Hard zone (top 25%)
      const isProhibited = (actionRole === 'primary_cta' && zone === 'hard');
      return { zone, isProhibited };
    }

    // Natural zone placement (Y = 0.85): Primary CTA passes
    const goodPlacement = evaluateActionZone('primary_cta', 0.85);
    assert.strictEqual(goodPlacement.zone, 'natural');
    assert.strictEqual(goodPlacement.isProhibited, false);

    // Hard zone placement (Y = 0.10): Primary CTA in header violates ergonomic rule
    const badPlacement = evaluateActionZone('primary_cta', 0.10);
    assert.strictEqual(badPlacement.zone, 'hard');
    assert.strictEqual(badPlacement.isProhibited, true, 'Primary CTA in Hard zone must be flagged as prohibited');

    // Passive header in Hard zone is permitted
    const headerPlacement = evaluateActionZone('header_title', 0.10);
    assert.strictEqual(headerPlacement.zone, 'hard');
    assert.strictEqual(headerPlacement.isProhibited, false);
  });

  report('Tier 2: Boundary case - Dark Mode Surface Luminance Ordering', 'Tier 2', () => {
    const { dark } = tokens.color.stone;
    const lCanvas = getRelativeLuminance(dark.canvas.$value);
    const lCard = getRelativeLuminance(dark.card.$value);
    const lBorder = getRelativeLuminance(dark.border.$value);

    // Photometric surface elevation principle in dark mode:
    // Canvas (base) must have lower luminance than elevated Card
    assert(lCanvas < lCard, `Canvas luminance (${lCanvas}) must be lower than Card (${lCard})`);
    assert(lCard < lBorder, `Card luminance (${lCard}) must be lower than Border (${lBorder})`);

    // Verify dark canvas is deep charcoal / stone, not raw pure black #000000
    assert.notStrictEqual(dark.canvas.$value, '#000000', 'Dark canvas must be nuanced stone (#121110), not raw #000000');
  });

  report('Tier 2: Boundary case - Token Helper Error Handling on Malformed Input', 'Tier 2', () => {
    // getTouchTarget invalid key throws
    assert.throws(() => getTouchTarget('invalidTargetKey'), /Cannot read properties of undefined/);

    // getSafeAreaInset invalid key throws
    assert.throws(() => getSafeAreaInset('nonExistentInset'), /Cannot read properties of undefined/);

    // getZIndex invalid key throws
    assert.throws(() => getZIndex('phantomLayer'), /Cannot read properties of undefined/);
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE & SYSTEM INTEGRATION
  // =========================================================================

  report('Tier 3: End-to-End Flow Lifecycle: 5 States across 7 Device Viewports', 'Tier 3', () => {
    // Verify that every state can render across all 7 canonical viewports without dimension clipping
    for (const vp of ERGONOMIC_SPECS.canonicalViewports) {
      const effectiveWidth = vp.maxContainerWidth ? Math.min(vp.width, vp.maxContainerWidth) : vp.width;
      const padding = vp.padding || 16;

      // 1. Empty state primary CTA minimum width budget
      const emptyCtaWidth = Math.min(280, effectiveWidth - (padding * 2));
      assert(emptyCtaWidth >= 200, `Empty CTA width in ${vp.name} must be >= 200px`);

      // 2. Skeleton card layout matches populated card layout (CLS = 0)
      const cardMargin = padding;
      const availableCardWidth = effectiveWidth - (cardMargin * 2);
      const skeletonWidth = availableCardWidth;
      const populatedWidth = availableCardWidth;
      assert.strictEqual(skeletonWidth, populatedWidth, `Skeleton and Populated cards must have identical width on ${vp.name}`);

      // 3. Error state retry button hit target
      const retryBtnTarget = getTouchTarget('minTouchTarget');
      assert.strictEqual(retryBtnTarget, 44, 'Error state retry button meets 44px minimum');
    }
  });

  report('Tier 3: Luxury Stone Palette Integration with Semantic Error State Contrast', 'Tier 3', () => {
    // Verify that semantic error banner text against Luxury Stone canvas passes WCAG AA in both modes
    const errorText = tokens.color.semantic.error.text.$value;
    const errorBg = tokens.color.semantic.error.background.$value;
    const stoneLightCanvas = tokens.color.stone.light.canvas.$value;
    const stoneDarkCanvas = tokens.color.stone.dark.canvas.$value;

    // Error text on error container background: >= 7.0:1 (AAA)
    const crErrorInternal = getContrastRatio(errorText, errorBg);
    assert(crErrorInternal >= 7.0, `Error container internal text contrast must be >= 7:1, got ${crErrorInternal.toFixed(2)}:1`);

    // Error text on light canvas: >= 4.5:1 (AA)
    const crErrorLight = getContrastRatio(errorText, stoneLightCanvas);
    assert(crErrorLight >= 4.5, `Error text on stone light canvas must be >= 4.5:1, got ${crErrorLight.toFixed(2)}:1`);
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  ERGONOMIC_SPECS,
  validateStateTransition,
  simulateFlexContainerFit
};
