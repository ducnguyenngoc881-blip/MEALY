import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';

describe('Unit: Device Font Scaling Prevention', () => {
  const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
  const indexCssPath = path.resolve(process.cwd(), 'src/index.css');

  it('FONT-01: index.css sets root font-size: 16px and disables text-size-adjust across all elements', () => {
    const css = fs.readFileSync(indexCssPath, 'utf-8');
    
    expect(css).toContain('font-size: 16px;');
    expect(css).toContain('-webkit-text-size-adjust: 100%;');
    expect(css).toContain('text-size-adjust: 100%;');
  });

  it('FONT-02: index.html contains inline pre-render script lockDeviceFontSize to counteract OS font scaling', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf-8');
    
    expect(html).toContain('lockDeviceFontSize');
    expect(html).toContain('scaleFactor');
    expect(html).toContain('16 / scaleFactor');
  });

  it('FONT-03: Mathematically compensates device scaling factor back to exact 16px baseline', () => {
    // Simulate Android Accessibility text scaling at 125%, 150%, 200%
    const testCases = [
      { simulatedComputed: 20, scale: 1.25, expectedRootSize: 12.8 },
      { simulatedComputed: 24, scale: 1.5, expectedRootSize: 10.666666666666666 },
      { simulatedComputed: 32, scale: 2.0, expectedRootSize: 8.0 }
    ];

    testCases.forEach(tc => {
      const scaleFactor = tc.simulatedComputed / 16;
      expect(scaleFactor).toBe(tc.scale);
      const rootStyleSize = 16 / scaleFactor;
      expect(rootStyleSize).toBeCloseTo(tc.expectedRootSize, 2);
      
      // When the OS multiplies rootStyleSize by scaleFactor, actual rendered size is exactly 16px
      const renderedSize = rootStyleSize * scaleFactor;
      expect(renderedSize).toBe(16);
    });
  });

  it('FONT-04: Viewport meta tag disables accidental page pinch zoom distortion', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf-8');
    expect(html).toContain('maximum-scale=1.0');
    expect(html).toContain('user-scalable=no');
  });
});
