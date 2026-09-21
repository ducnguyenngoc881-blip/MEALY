/**
 * test-e2e-integration.js
 * E2E Test Suite: Cross-Feature Combinations & Real-World Workload Scenarios
 * Covers: Tier 3 (Cross-Feature Combinations) and Tier 4 (Real-World Workloads)
 */

const assert = require('node:assert');
const { getContrastRatio, evaluateWcagCompliance } = require('./test-contrast-math');
const { CANONICAL_TOKENS } = require('./test-token-schema');
const { validateSvgContent } = require('./test-svg-standards');
const { calculateDampingRatio, simulateSpring, getSafeZones, isInsideSafeZone, validateReadingBudget } = require('./test-remotion-motion');

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

  console.log('\n--- Running Suite: Cross-Feature & E2E Real-World Integration ---');

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (Pairwise Interactions)
  // =========================================================================

  report('Tier 3: Tokens in SVG: Vector graphic fills/strokes strictly use design token values', 'Tier 3', () => {
    const brandColor = CANONICAL_TOKENS.color.brand['600'].$value; // #4f46e5
    const strokeWidth = CANONICAL_TOKENS.spacing['1'].px;          // 4px
    const cornerRadius = CANONICAL_TOKENS.radii.md.px;             // 8px

    const tokenizedSvg = `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="40" height="40" rx="${cornerRadius}" stroke="${brandColor}" stroke-width="${strokeWidth}" />
      </svg>
    `.trim();

    const validation = validateSvgContent(tokenizedSvg);
    assert.strictEqual(validation.valid, true);
    assert(tokenizedSvg.includes(`rx="8"`), 'SVG must use radii.md (8px)');
    assert(tokenizedSvg.includes(`stroke="#4f46e5"`), 'SVG must use brand[600] token');
    assert(tokenizedSvg.includes(`stroke-width="4"`), 'SVG must use spacing[1] token');
  });

  report('Tier 3: Remotion Springs on Typography Scales: Smooth interpolation without text overflow', 'Tier 3', () => {
    const startSize = CANONICAL_TOKENS.typography.scale.base.px; // 16px
    const targetSize = CANONICAL_TOKENS.typography.scale['2xl'].px; // 24px
    const startLh = parseInt(CANONICAL_TOKENS.typography.scale.base.lineHeight, 10); // 24px
    const targetLh = parseInt(CANONICAL_TOKENS.typography.scale['2xl'].lineHeight, 10); // 32px

    const springConfig = CANONICAL_TOKENS.motion.spring.springSnappy;
    const simulation = simulateSpring({
      mass: springConfig.mass,
      damping: springConfig.damping,
      stiffness: springConfig.stiffness,
      fps: 30,
      durationFrames: 30
    });

    // Verify interpolated font sizes stay bounded and line-height keeps positive clearance
    for (const step of simulation.history) {
      const currentFontSize = startSize + (targetSize - startSize) * step.x;
      const currentLineHeight = startLh + (targetLh - startLh) * step.x;
      // Optical rule: Line height must always equal or exceed font size
      assert(
        currentLineHeight >= currentFontSize - 0.1,
        `Line height clipping at frame ${step.frame}: fontSize=${currentFontSize}, lineHeight=${currentLineHeight}`
      );
    }
  });

  report('Tier 3: Safe Zones across Multi-Aspect Ratios (16:9, 9:16, 1:1) for standard UI overlays', 'Tier 3', () => {
    const formats = [
      { name: '16:9', width: 1920, height: 1080 },
      { name: '9:16', width: 1080, height: 1920 },
      { name: '1:1',  width: 1080, height: 1080 }
    ];

    // Card UI overlay component of 400x200px placed in lower third
    for (const fmt of formats) {
      const zones = getSafeZones(fmt.width, fmt.height);
      // Place element at bottom center within title safe zone
      const cardWidth = 400;
      const cardHeight = 160;
      const cardX = (fmt.width - cardWidth) / 2;
      const cardY = zones.titleSafe.y + zones.titleSafe.height - cardHeight - 20;

      const cardRect = { x: cardX, y: cardY, width: cardWidth, height: cardHeight };
      const insideTitle = isInsideSafeZone(cardRect, zones.titleSafe);
      assert.strictEqual(
        insideTitle,
        true,
        `Card overlay must remain inside Title Safe zone for aspect ratio ${fmt.name}`
      );
    }
  });

  report('Tier 3: Gestalt Proximity with 8pt Spacing Tokens: Enforcing group hierarchy via tokens', 'Tier 3', () => {
    const internalGap = CANONICAL_TOKENS.spacing['2'].px; // 8px
    const externalGap = CANONICAL_TOKENS.spacing['6'].px; // 24px

    // S_internal <= 0.5 * S_external
    assert(
      internalGap <= 0.5 * externalGap,
      `Token spacing violates Gestalt proximity: ${internalGap}px > 0.5 * ${externalGap}px`
    );
  });

  report('Tier 3: Surface Contrast with Elevation Shadows: Elevated card readability verification', 'Tier 3', () => {
    const canvasBg = CANONICAL_TOKENS.color.slate['50'].$value;       // #f8fafc
    const cardBg = '#ffffff';
    const textPrimary = CANONICAL_TOKENS.color.slate['900'].$value;   // #0f172a
    const textSecondary = CANONICAL_TOKENS.color.slate['600'].$value; // #475569

    // Card on canvas contrast (figure-ground)
    const cardVsCanvas = getContrastRatio(cardBg, canvasBg);
    assert(cardVsCanvas >= 1.04, 'Card surface has subtle boundary contrast');

    // Text on card surface
    const crPrimary = getContrastRatio(textPrimary, cardBg);
    assert(crPrimary >= 7.0, `Primary text on elevated card must be AAA, got ${crPrimary.toFixed(2)}:1`);

    const crSecondary = getContrastRatio(textSecondary, cardBg);
    assert(crSecondary >= 4.5, `Secondary text on elevated card must be AA, got ${crSecondary.toFixed(2)}:1`);
  });

  // =========================================================================
  // TIER 4: REAL-WORLD WORKLOAD SCENARIOS (>=3 comprehensive scenarios)
  // =========================================================================

  report('Tier 4: Scenario 1 - Comprehensive 100-Point Audit of E-Commerce Product Card', 'Tier 4', () => {
    // Component architecture:
    const productCard = {
      container: { width: 320, padding: 16, borderRadius: 12, bg: '#ffffff' }, // 320 % 8 == 0, 16 % 8 == 0
      image: { width: 288, height: 192, borderRadius: 8 },                     // 288 % 8 == 0, 192 % 8 == 0
      badge: {
        type: 'success',
        text: 'In Stock',
        textColor: CANONICAL_TOKENS.color.semantic.success.text.$value, // #064e3b
        bgColor: CANONICAL_TOKENS.color.semantic.success.background.$value // #ecfdf5
      },
      title: { text: 'Wireless Pro Studio Headphones', fontSize: 18, lineHeight: 28, color: '#0f172a' },
      price: { text: '$249.00', fontSize: 24, lineHeight: 32, color: '#4338ca' }, // indigo-700
      ctaButton: {
        text: 'Add to Cart',
        fontSize: 16,
        bg: '#4f46e5', // indigo-600
        textColor: '#ffffff',
        height: 48,
        borderRadius: 8
      },
      iconSvg: `
        <svg viewBox="0 0 20 20" fill="none">
          <g id="check-icon">
            <path d="M4 10L8 14L16 6" stroke="#064e3b" stroke-width="2" stroke-linecap="round"/>
          </g>
        </svg>
      `.trim()
    };

    let dimension1Score = 0; // Layout & Grid (20 pts)
    let dimension2Score = 0; // Visual Hierarchy (20 pts)
    let dimension3Score = 0; // Typography (20 pts)
    let dimension4Score = 0; // Color & WCAG (20 pts)
    let dimension5Score = 0; // Asset Engineering (20 pts)

    // D1.1: 8pt/4pt grid alignment
    if (
      productCard.container.width % 8 === 0 &&
      productCard.container.padding % 4 === 0 &&
      productCard.ctaButton.height % 8 === 0
    ) {
      dimension1Score += 20;
    }

    // D2: Visual Hierarchy (Focal Dominance & Proximity)
    const focalPriceArea = 24 * 32;
    const bodyArea = 18 * 28;
    if (focalPriceArea / bodyArea >= 1.2 && productCard.container.borderRadius === 12) {
      dimension2Score += 20;
    }

    // D3: Typography Scale compliance
    const validSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60];
    if (
      validSizes.includes(productCard.title.fontSize) &&
      validSizes.includes(productCard.price.fontSize) &&
      validSizes.includes(productCard.ctaButton.fontSize)
    ) {
      dimension3Score += 20;
    }

    // D4: Color & WCAG Contrast (HARD GATE)
    const badgeContrast = getContrastRatio(productCard.badge.textColor, productCard.badge.bgColor);
    const titleContrast = getContrastRatio(productCard.title.color, productCard.container.bg);
    const ctaContrast = getContrastRatio(productCard.ctaButton.textColor, productCard.ctaButton.bg);

    assert(badgeContrast >= 7.0, `Badge contrast must be AAA: ${badgeContrast}`);
    assert(titleContrast >= 7.0, `Title contrast must be AAA: ${titleContrast}`);
    assert(ctaContrast >= 4.5, `CTA button contrast must be AA: ${ctaContrast}`);

    dimension4Score += 20;

    // D5: Asset Engineering (SVG Cleanliness)
    const svgAudit = validateSvgContent(productCard.iconSvg);
    if (svgAudit.valid && svgAudit.semanticGroups >= 1) {
      dimension5Score += 20;
    }

    const totalScore = dimension1Score + dimension2Score + dimension3Score + dimension4Score + dimension5Score;
    assert.strictEqual(totalScore, 100, `Product card must achieve 100/100 exemplary score, got ${totalScore}`);
  });

  report('Tier 4: Scenario 2 - Video Ad Title Sequence Choreography & Multi-Aspect Layout', 'Tier 4', () => {
    // 5-second video ad composition @ 30fps = 150 frames
    const composition = {
      fps: 30,
      durationInFrames: 150,
      title: 'Build Modern Visual Systems',
      subtitle: 'Design Tokens & Kinetic Motion',
      phases: {
        entrance: { start: 0, end: 20, preset: 'springSnappy' },
        hold:     { start: 20, end: 120 },
        exit:     { start: 120, end: 140, easing: 'easeIn' }
      }
    };

    // 1. Reading budget verification
    const wordCount = (composition.title + ' ' + composition.subtitle).split(/\s+/).length;
    const holdFrames = composition.phases.hold.end - composition.phases.hold.start;
    const reading = validateReadingBudget({ wordCount, holdFrames, fps: composition.fps });
    assert(reading.isWithinBudget, `Reading speed ${reading.wpm} WPM must be within 250 WPM budget`);

    // 2. Spring entrance convergence
    const spring = CANONICAL_TOKENS.motion.spring[composition.phases.entrance.preset];
    const sim = simulateSpring({
      mass: spring.mass,
      damping: spring.damping,
      stiffness: spring.stiffness,
      fps: composition.fps,
      durationFrames: composition.phases.entrance.end
    });
    assert(sim.settleFrame <= composition.phases.entrance.end, 'Title animation must settle before hold phase begins');

    // 3. Multi-aspect ratio title safe zone boundary verification
    const formats = [
      { name: '16:9 Landscape', width: 1920, height: 1080 },
      { name: '9:16 Vertical Reel', width: 1080, height: 1920 }
    ];

    for (const fmt of formats) {
      const zones = getSafeZones(fmt.width, fmt.height);
      const titleBox = {
        x: (fmt.width - 800) / 2,
        y: (fmt.height - 200) / 2,
        width: 800,
        height: 200
      };
      assert.strictEqual(
        isInsideSafeZone(titleBox, zones.titleSafe),
        true,
        `Title box must be inside Title Safe zone in ${fmt.name}`
      );
    }
  });

  report('Tier 4: Scenario 3 - Dynamic Brand Token Switch & Theme Migration Audit', 'Tier 4', () => {
    // Test dynamic switching across Light, Dark, and High-Contrast Themes
    const themes = {
      light: {
        canvas: '#ffffff',
        surface: '#f8fafc',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        brand: '#4f46e5'
      },
      dark: {
        canvas: '#020617',
        surface: '#0f172a',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        brand: '#818cf8'
      },
      highContrast: {
        canvas: '#000000',
        surface: '#121212',
        textPrimary: '#ffffff',
        textSecondary: '#e2e8f0',
        brand: '#a5b4fc'
      }
    };

    for (const [themeName, theme] of Object.entries(themes)) {
      // Primary text on canvas must be AAA (>= 7.0:1)
      const crCanvas = getContrastRatio(theme.textPrimary, theme.canvas);
      assert(
        crCanvas >= 7.0,
        `Theme ${themeName}: Primary text on canvas must be >= 7:1, got ${crCanvas.toFixed(2)}`
      );

      // Primary text on surface must be AAA (>= 7.0:1)
      const crSurface = getContrastRatio(theme.textPrimary, theme.surface);
      assert(
        crSurface >= 7.0,
        `Theme ${themeName}: Primary text on surface must be >= 7:1, got ${crSurface.toFixed(2)}`
      );

      // Secondary text on canvas must be AA (>= 4.5:1)
      const crSec = getContrastRatio(theme.textSecondary, theme.canvas);
      assert(
        crSec >= 4.5,
        `Theme ${themeName}: Secondary text on canvas must be >= 4.5:1, got ${crSec.toFixed(2)}`
      );

      // Brand on canvas for large text / UI must be >= 3.0:1
      const crBrand = getContrastRatio(theme.brand, theme.canvas);
      assert(
        crBrand >= 3.0,
        `Theme ${themeName}: Brand on canvas must be >= 3.0:1, got ${crBrand.toFixed(2)}`
      );
    }
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run
};
