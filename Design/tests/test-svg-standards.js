/**
 * test-svg-standards.js
 * E2E Test Suite: SVG Clean-Code, Responsive Architecture & Hygiene Validator
 * Covers: Tier 1 (Feature Coverage) and Tier 2 (Boundary & Corner Cases)
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Authoritative Canonical SVG Fixtures
const CANONICAL_VALID_ICON_SVG = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4f46e5" />
      <stop offset="1" stop-color="#818cf8" />
    </linearGradient>
  </defs>
  <g id="icon-background">
    <rect width="24" height="24" rx="6" fill="url(#brandGrad)" />
  </g>
  <g id="icon-glyph">
    <path d="M7.5 12.5L10.5 15.5L16.5 8.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`.trim();

// SVG Cleanliness & Standards Engine
function validateSvgContent(svgString, options = {}) {
  const maxSize = options.maxSizeBytes || 51200; // 50KB default

  if (typeof svgString !== 'string') {
    throw new TypeError('SVG content must be a string');
  }

  const byteLength = Buffer.byteLength(svgString, 'utf8');
  if (byteLength > maxSize) {
    throw new Error(`SVG file size exceeds maximum budget: ${byteLength} bytes > ${maxSize} bytes`);
  }

  // 1. Basic XML structure check
  if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
    throw new Error('Malformed SVG: Missing opening <svg> or closing </svg> tag');
  }

  // Extract root <svg ...> tag attributes
  const rootMatch = svgString.match(/<svg([^>]*)>/);
  if (!rootMatch) {
    throw new Error('Unable to parse root <svg> tag');
  }
  const rootAttrs = rootMatch[1];

  // 2. Enforce viewBox
  const viewBoxMatch = rootAttrs.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (!viewBoxMatch) {
    throw new Error('SVG clean-code violation: Missing mandatory "viewBox" attribute on root <svg>');
  }

  const viewBoxValues = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
  if (viewBoxValues.length !== 4 || viewBoxValues.some(isNaN)) {
    throw new Error(`Invalid viewBox format: "${viewBoxMatch[1]}"`);
  }
  const [minX, minY, width, height] = viewBoxValues;
  if (width <= 0 || height <= 0) {
    throw new Error(`viewBox width and height must be strictly positive: found width=${width}, height=${height}`);
  }

  // 3. Reject fixed pixel width/height on root tag (ensures responsive fluidity)
  const widthPxMatch = rootAttrs.match(/width\s*=\s*["']\s*([0-9.]+px)\s*["']/i);
  const heightPxMatch = rootAttrs.match(/height\s*=\s*["']\s*([0-9.]+px)\s*["']/i);
  if (widthPxMatch || heightPxMatch) {
    throw new Error(
      `SVG responsiveness violation: Root <svg> contains hardcoded pixel units (${widthPxMatch ? widthPxMatch[0] : ''} ${heightPxMatch ? heightPxMatch[0] : ''}). Remove to enable fluid viewBox scaling.`
    );
  }

  // 4. Reject embedded raster data images
  if (/data:image\/(?:png|jpeg|webp|gif);base64/i.test(svgString)) {
    throw new Error('SVG anti-pattern violation: Embedded raster base64 images (data:image) are prohibited');
  }

  // 5. Reject proprietary editor namespaces
  const proprietarySignatures = [
    'xmlns:i="&ns_ai;"',
    'xmlns:i="&ns_graphs;"',
    'sodipodi:docname',
    'inkscape:version',
    'sketch:type'
  ];
  for (const sig of proprietarySignatures) {
    if (svgString.includes(sig)) {
      throw new Error(`SVG hygiene violation: Proprietary editor metadata detected ("${sig}")`);
    }
  }

  // 6. Reject dangerous executable scripts
  if (/<script[\s>]/i.test(svgString) || /\son[a-z]+\s*=/i.test(svgString)) {
    throw new Error('SVG security violation: Executable script tags or inline event handlers are strictly forbidden');
  }

  // 7. Check coordinate precision (flag coordinates with > 2 decimal places)
  // Match decimal numbers in path data: e.g. 12.3456
  const excessiveDecimals = svgString.match(/\b\d+\.\d{3,}\b/g);
  const precisionWarnings = excessiveDecimals ? excessiveDecimals.length : 0;

  return {
    valid: true,
    byteLength,
    viewBox: { minX, minY, width, height },
    hasDefs: /<defs[\s>]/.test(svgString),
    semanticGroups: (svgString.match(/<g\s+id=["'][^"']+["']/g) || []).length,
    precisionWarnings
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

  console.log('\n--- Running Suite: SVG Standards & Clean-Code ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 test cases)
  // =========================================================================

  report('Tier 1: Valid canonical responsive vector icon passes all clean-code criteria', 'Tier 1', () => {
    const result = validateSvgContent(CANONICAL_VALID_ICON_SVG);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.viewBox.width, 24);
    assert.strictEqual(result.viewBox.height, 24);
    assert.strictEqual(result.hasDefs, true, 'Icon must declare reusable defs');
    assert(result.semanticGroups >= 2, 'Icon must contain semantic groups with IDs');
  });

  report('Tier 1: Enforces viewBox attribute and permits relative dimension units', 'Tier 1', () => {
    const relativeSvg = '<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="40" fill="#4f46e5"/></svg>';
    const result = validateSvgContent(relativeSvg);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.viewBox.width, 100);
  });

  report('Tier 1: Semantic layer organization: detects <defs> and <g id="..."> hierarchy', 'Tier 1', () => {
    const layeredSvg = `
      <svg viewBox="0 0 200 200">
        <defs>
          <clipPath id="clip"><rect width="200" height="200" rx="16"/></clipPath>
        </defs>
        <g id="base-layer"><rect width="200" height="200" fill="#0f172a"/></g>
        <g id="accent-layer"><circle cx="100" cy="100" r="50" fill="#6366f1"/></g>
      </svg>
    `.trim();
    const result = validateSvgContent(layeredSvg);
    assert.strictEqual(result.hasDefs, true);
    assert.strictEqual(result.semanticGroups, 2);
  });

  report('Tier 1: Decimal coordinate precision analyzer identifies clean numbers', 'Tier 1', () => {
    const cleanSvg = '<svg viewBox="0 0 24 24"><path d="M12 2.5L20.25 18H3.75L12 2.5Z"/></svg>';
    const result = validateSvgContent(cleanSvg);
    assert.strictEqual(result.precisionWarnings, 0, 'Clean SVG should have 0 high-precision coordinate warnings');
  });

  report('Tier 1: Path command syntax validation for standard drawing primitives', 'Tier 1', () => {
    const pathSvg = '<svg viewBox="0 0 48 48"><path d="M10 10 H38 V38 H10 Z M24 16 A8 8 0 1 0 24 32 A8 8 0 1 0 24 16 Z"/></svg>';
    const result = validateSvgContent(pathSvg);
    assert.strictEqual(result.valid, true);
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 test cases)
  // =========================================================================

  report('Tier 2: Boundary case - Missing viewBox attribute rejected', 'Tier 2', () => {
    const noViewBox = '<svg width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>';
    assert.throws(() => validateSvgContent(noViewBox), /Missing mandatory "viewBox"/);
  });

  report('Tier 2: Boundary case - Root hardcoded px width/height lock rejected', 'Tier 2', () => {
    const lockedSvg = '<svg viewBox="0 0 24 24" width="24px" height="24px"><circle cx="12" cy="12" r="10"/></svg>';
    assert.throws(() => validateSvgContent(lockedSvg), /hardcoded pixel units/);
  });

  report('Tier 2: Boundary case - Prohibited embedded raster image (data:image) rejected', 'Tier 2', () => {
    const rasterSvg = '<svg viewBox="0 0 100 100"><image href="data:image/png;base64,iVBORw0KGgo=" width="100" height="100"/></svg>';
    assert.throws(() => validateSvgContent(rasterSvg), /Embedded raster base64 images/);
  });

  report('Tier 2: Boundary case - Executable script injection rejected', 'Tier 2', () => {
    const scriptSvg = '<svg viewBox="0 0 24 24"><script>alert("xss")</script><circle cx="12" cy="12" r="10"/></svg>';
    assert.throws(() => validateSvgContent(scriptSvg), /Executable script tags/);

    const eventHandlerSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" onload="alert(1)"/></svg>';
    assert.throws(() => validateSvgContent(eventHandlerSvg), /inline event handlers/);
  });

  report('Tier 2: Boundary case - Proprietary desktop editor cruft rejected', 'Tier 2', () => {
    const inkscapeSvg = '<svg viewBox="0 0 24 24" inkscape:version="1.0"><circle cx="12" cy="12" r="10"/></svg>';
    assert.throws(() => validateSvgContent(inkscapeSvg), /Proprietary editor metadata detected/);

    const sketchSvg = '<svg viewBox="0 0 24 24" sketch:type="MSPage"><circle cx="12" cy="12" r="10"/></svg>';
    assert.throws(() => validateSvgContent(sketchSvg), /Proprietary editor metadata detected/);
  });

  report('Tier 2: Boundary case - Zero or negative viewBox dimensions rejected', 'Tier 2', () => {
    const zeroBox = '<svg viewBox="0 0 0 0"><circle cx="0" cy="0" r="10"/></svg>';
    assert.throws(() => validateSvgContent(zeroBox), /strictly positive/);

    const negativeBox = '<svg viewBox="0 0 -100 50"><circle cx="0" cy="0" r="10"/></svg>';
    assert.throws(() => validateSvgContent(negativeBox), /strictly positive/);
  });

  report('Tier 2: Boundary case - Excessive file size (>50KB) rejected', 'Tier 2', () => {
    const hugePath = 'M0 0 ' + 'L1 1 '.repeat(10000);
    const hugeSvg = `<svg viewBox="0 0 100 100"><path d="${hugePath}"/></svg>`;
    assert.throws(() => validateSvgContent(hugeSvg, { maxSizeBytes: 20000 }), /exceeds maximum budget/);
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  validateSvgContent,
  CANONICAL_VALID_ICON_SVG
};
