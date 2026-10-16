import fs from 'fs';
import path from 'path';
import { describe, it, expect } from '../helpers/testRunner';
import { theme } from '../../src/theme';

const rootDir = process.cwd();

describe('Unit: Mood Board & Design Language Specification (v4.0)', () => {
  it('verifies centralized 60-30-10 Flat Matte color tokens in src/theme.ts', () => {
    expect(theme.colors.canvas.light).toBe('#F8FAFC');
    expect(theme.colors.canvas.dark).toBe('#12161F');
    expect(theme.colors.card.light).toBe('#FFFFFF');
    expect(theme.colors.card.dark).toBe('#1A202C');
    expect(theme.colors.border.light).toBe('#E2E8F0');
    expect(theme.colors.border.dark).toBe('#2D3748');
    expect(theme.colors.text.headingLight).toBe('#0F172A');
    expect(theme.colors.brand.cobalt).toBe('#1D4ED8');
    expect(theme.colors.brand.cobaltHover).toBe('#2563EB');
    expect(theme.colors.accents.emerald).toBe('#10B981');
    expect(theme.colors.accents.amber).toBe('#EAB308');
    expect(theme.colors.accents.monza).toBe('#DC2626');
    expect(theme.colors.accents.chiliRose).toBe('#E11D48');
    expect(theme.colors.accents.turmericGold).toBe('#D97706');
    expect(theme.colors.accents.clayEarth).toBe('#78350F');
  });

  it('verifies dual-font stack and 7-level mobile typography hierarchy in src/theme.ts', () => {
    expect(theme.typography.fontSans.includes('Be Vietnam Pro')).toBe(true);
    expect(theme.typography.fontMono.includes('JetBrains Mono')).toBe(true);

    const h = theme.typography.hierarchy;
    expect(h.displayHero.size).toBe('24px');
    expect(h.displayHero.weight).toBe(900);
    expect(h.screenTitle.size).toBe('20px');
    expect(h.screenTitle.weight).toBe(900);
    expect(h.cardTitle.size).toBe('17px');
    expect(h.cardTitle.weight).toBe(800);
    expect(h.sectionHeader.size).toBe('14px');
    expect(h.sectionHeader.weight).toBe(800);
    expect(h.bodyStep.size).toBe('13.5px');
    expect(h.bodyStep.weight).toBe(500);
    expect(h.chipPill.size).toBe('12px');
    expect(h.chipPill.weight).toBe(700);
    expect(h.microBadge.size).toBe('10.5px');
    expect(h.microBadge.weight).toBe(800);
  });

  it('verifies 6-tier corner radius (round) scale and concentric nesting math in src/theme.ts', () => {
    expect(theme.radii.xs.px).toBe(8);
    expect(theme.radii.sm.px).toBe(12);
    expect(theme.radii.md.px).toBe(16);
    expect(theme.radii.lg.px).toBe(20);
    expect(theme.radii.xl.px).toBe(24);
    expect(theme.radii.pill.px).toBe(9999);

    // Concentric formula: R_outer (20px) - Padding (8px) = R_inner (12px)
    const paddingPx = 8;
    expect(theme.radii.lg.px - paddingPx).toBe(theme.radii.sm.px);
    expect(theme.radii.md.px - paddingPx).toBe(theme.radii.xs.px);
  });

  it('verifies 4px spacing grid, 24x24 icon blueprint, and 360px-430px thumb zones in src/theme.ts', () => {
    expect(theme.spacing.baseUnitPx).toBe(4);
    expect(theme.spacing.minTapTargetPx).toBe(44);
    expect(theme.iconGrid.sizePx).toBe(24);
    expect(theme.iconGrid.liveAreaPx).toBe(20);
    expect(theme.iconGrid.strokeWidth).toBe(2.0);
    expect(theme.layout.viewportRangePx[0]).toBe(360);
    expect(theme.layout.viewportRangePx[1]).toBe(430);
    const tz = theme.layout.thumbZones;
    expect(tz.stretchTopPercent + tz.naturalReachMidPercent + tz.primaryThumbBottomPercent).toBe(100);
  });

  it('verifies docs/DESIGN_LANGUAGE.md completeness and strict Vietnamese bilingual cleanliness', () => {
    const mdPath = path.join(rootDir, 'docs', 'DESIGN_LANGUAGE.md');
    expect(fs.existsSync(mdPath)).toBe(true);
    const md = fs.readFileSync(mdPath, 'utf8');

    expect(md.includes('## 1. Triết Lý Cốt Lõi')).toBe(true);
    expect(md.includes('## 2. Hệ Thống Bảng Màu Toàn Diện')).toBe(true);
    expect(md.includes('## 3. Hệ Thống Kiểu Chữ, Cách Dùng Font & Phân Cấp Nội Dung')).toBe(true);
    expect(md.includes('## 4. Hệ Thống Bo Góc Đồng Tâm, Khoảng Cách, Đường Viền & Độ Nổi')).toBe(true);
    expect(md.includes('## 5. Hệ Thống Biểu Tượng Ứng Dụng & Lưới Kỹ Thuật 24×24')).toBe(true);
    expect(md.includes('## 6. Công Thái Học Di Động & Quy Tắc Bố Cục Chống Lỗi')).toBe(true);

    // Must not contain parenthetical English explanations on headings or font weight definitions
    expect(md.includes('(Font Uses)')).toBe(false);
    expect(md.includes('(Font Weights)')).toBe(false);
    expect(md.includes('(Regular)')).toBe(false);
    expect(md.includes('(ExtraBold)')).toBe(false);
    expect(md.includes('(Text Hierarchy Scale)')).toBe(false);
    expect(md.includes('(Corner Radius / Round Hierarchy)')).toBe(false);
    expect(md.includes('(Concentric Radius Formula)')).toBe(false);
  });

  it('verifies generated HTML mood board files and PDF artifacts are portable, complete, and responsive', () => {
    const scriptPath = path.join(rootDir, 'scripts', 'generate-moodboard-pdf.cjs');
    const docsHtmlPath = path.join(rootDir, 'docs', 'moodboard-print.html');
    const publicHtmlPath = path.join(rootDir, 'public', 'moodboard.html');
    const rootPdfPath = path.join(rootDir, 'MealWise_Mood_Board.pdf');

    expect(fs.existsSync(scriptPath)).toBe(true);
    expect(fs.existsSync(docsHtmlPath)).toBe(true);
    expect(fs.existsSync(publicHtmlPath)).toBe(true);
    expect(fs.existsSync(rootPdfPath)).toBe(true);

    const scriptSrc = fs.readFileSync(scriptPath, 'utf8');
    // Must not have hardcoded external user paths
    expect(scriptSrc.includes('C:/Users/')).toBe(false);
    expect(scriptSrc.includes('C:\\Users\\')).toBe(false);

    const html = fs.readFileSync(publicHtmlPath, 'utf8');
    // All 6 pages present
    for (let p = 1; p <= 6; p++) {
      expect(html.includes(`id="page-${p}"`)).toBe(true);
      expect(html.includes(`TRANG 0${p} / 06`)).toBe(true);
    }

    // Page 1: All 6 Bento tiles including Tile 06 Corner Rounding & Page 1 6-tier radius strip
    for (let t = 1; t <= 6; t++) {
      expect(html.includes(`Ô 0${t} •`)).toBe(true);
    }
    const page1Section = html.split('id="page-1"')[1]?.split('id="page-2"')[0] || '';
    expect(page1Section.includes('Ô 06 • BO GÓC ĐỒNG TÂM')).toBe(true);
    expect(page1Section.includes('THANG ĐỘ BO GÓC ĐỒNG TÂM 6 CẤP')).toBe(true);
    expect(page1Section.includes('R = 8px')).toBe(true);
    expect(page1Section.includes('R = 12px')).toBe(true);
    expect(page1Section.includes('R = 16px')).toBe(true);
    expect(page1Section.includes('R = 20px')).toBe(true);
    expect(page1Section.includes('R = 24px')).toBe(true);
    expect(page1Section.includes('9999px')).toBe(true);

    // Page 3: All 7 typography levels
    expect(html.includes('01. Tiêu Đề Lớn')).toBe(true);
    expect(html.includes('02. Đầu Màn Hình')).toBe(true);
    expect(html.includes('03. Tên Món Ăn')).toBe(true);
    expect(html.includes('04. Tiêu Đề Khối')).toBe(true);
    expect(html.includes('05. Nội Dung Bước')).toBe(true);
    expect(html.includes('06. Nhãn Viên Thuốc')).toBe(true);
    expect(html.includes('07. Huy Hiệu Nhỏ')).toBe(true);

    // Page 4: All 6 border radius tiers, anatomical SVG corner diagrams, Squircle vs Circle Arc SVG, concentric formula & 6-tier spec table
    const page4Section = html.split('id="page-4"')[1]?.split('id="page-5"')[0] || '';
    expect(page4Section.includes('R = 8px')).toBe(true);
    expect(page4Section.includes('R = 12px')).toBe(true);
    expect(page4Section.includes('R = 16px')).toBe(true);
    expect(page4Section.includes('R = 20px')).toBe(true);
    expect(page4Section.includes('R = 24px')).toBe(true);
    expect(page4Section.includes('9999px')).toBe(true);
    expect(page4Section.includes('R_NGOÀI = R_TRONG + ĐỆM')).toBe(true);
    expect(page4Section.includes('Squircle G2')).toBe(true);
    expect(page4Section.includes('Cung tròn G1')).toBe(true);
    expect(page4Section.includes('|x/a|⁴+|y/b|⁴=1')).toBe(true);
    expect(page4Section.includes('Bán Kính (px / rem)')).toBe(true);
    expect(page4Section.includes('Bán Kính Lồng Trong (R_trong)')).toBe(true);
    expect(page4Section.includes('radius-xs')).toBe(true);
    expect(page4Section.includes('radius-sm')).toBe(true);
    expect(page4Section.includes('radius-md')).toBe(true);
    expect(page4Section.includes('radius-lg')).toBe(true);
    expect(page4Section.includes('radius-xl')).toBe(true);
    expect(page4Section.includes('radius-pill')).toBe(true);
    expect((page4Section.match(/<svg /g) || []).length).toBe(7);

    // Page 5: 4 logo concepts + 3 surface variants
    expect(html.includes('Mâm Cơm &amp; Mầm Xanh')).toBe(true);
    expect(html.includes('Chữ M Đũa Vàng &amp; Bát')).toBe(true);
    expect(html.includes('Khay Thực Đơn 60-30-10')).toBe(true);
    expect(html.includes('Nồi Đất &amp; Khói Bếp Nhà')).toBe(true);
    expect(html.includes('Bản Nền Cobalt')).toBe(true);
    expect(html.includes('Bản Nền Tối')).toBe(true);
    expect(html.includes('Bản Nền Sáng')).toBe(true);

    // Page 6: Button hierarchy & Nutrition macro pills
    expect(html.includes('+ Gán Thực Đơn')).toBe(true);
    expect(html.includes('Đi Chợ Chung 🔒')).toBe(true);
    expect(html.includes('450 kcal')).toBe(true);
    expect(html.includes('32g Đạm')).toBe(true);
    expect(html.includes('45g Bột')).toBe(true);
    expect(html.includes('14g Béo')).toBe(true);

    // Mobile responsive breakpoint & file:// clipboard fallback
    expect(html.includes('@media screen and (max-width: 840px)')).toBe(true);
    expect(html.includes('.arch-60 .mono')).toBe(true);
    expect(html.includes('function fallbackCopyText(text)')).toBe(true);
    expect(html.includes('function setPreviewRadius(px, twClass, roleText)')).toBe(true);

    // PDF size sanity check (> 1MB)
    const pdfStat = fs.statSync(rootPdfPath);
    expect(pdfStat.size > 1_000_000).toBe(true);
  });

  it('executes interactive setPreviewRadius and copyToken JS handlers across all 6 radius tiers', () => {
    const publicHtmlPath = path.join(rootDir, 'public', 'moodboard.html');
    const html = fs.readFileSync(publicHtmlPath, 'utf8');
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(Boolean(scriptMatch)).toBe(true);

    const elements: Record<string, any> = {
      'live-radius-outer': { style: { borderRadius: '20px' } },
      'live-radius-inner': { style: { borderRadius: '12px' } },
      'live-radius-label': { textContent: '' },
      'live-radius-role': { textContent: '' },
      'live-radius-formula': { textContent: '' },
      'copy-toast': {
        textContent: '',
        classes: new Set<string>(),
        classList: {
          add(c: string) { elements['copy-toast'].classes.add(c); },
          remove(c: string) { elements['copy-toast'].classes.delete(c); },
        },
      },
    };

    const chips = [8, 12, 16, 20, 24, 9999].map(r => {
      const classes = new Set<string>(r === 20 ? ['active'] : []);
      return {
        attr: String(r),
        classes,
        getAttribute(name: string) { return name === 'data-radius' ? this.attr : null; },
        classList: {
          add(c: string) { classes.add(c); },
          remove(c: string) { classes.delete(c); },
        },
      };
    });

    let copiedViaExecCommand = false;
    const mockDocument = {
      getElementById(id: string) { return elements[id] || null; },
      querySelectorAll(sel: string) { return sel === '.radius-chip' ? chips : []; },
      createElement() {
        return {
          value: '',
          style: {},
          setAttribute() {},
          select() {},
        };
      },
      body: {
        appendChild() {},
        removeChild() {},
      },
      execCommand(cmd: string) {
        if (cmd === 'copy') copiedViaExecCommand = true;
        return true;
      },
    };

    const mockWindow: Record<string, any> = {};
    const fn = new Function('window', 'document', 'navigator', 'setTimeout', 'clearTimeout', `${scriptMatch![1]}; return { setPreviewRadius, copyToken };`);
    const { setPreviewRadius, copyToken } = fn(mockWindow, mockDocument, {}, () => 1, () => {});

    // Test 8px tier
    setPreviewRadius(8, 'rounded-lg', 'Thẻ con / Huy hiệu nhỏ');
    expect(elements['live-radius-outer'].style.borderRadius).toBe('8px');
    expect(elements['live-radius-inner'].style.borderRadius).toBe('4px');
    expect(elements['live-radius-label'].textContent).toBe('8px • rounded-lg');
    expect(chips[0].classes.has('active')).toBe(true);
    expect(chips[3].classes.has('active')).toBe(false);

    // Test 24px tier (24 - 8 = 16px concentric inner)
    setPreviewRadius(24, 'rounded-3xl', 'Khung trượt đáy / Hộp thoại');
    expect(elements['live-radius-outer'].style.borderRadius).toBe('24px');
    expect(elements['live-radius-inner'].style.borderRadius).toBe('16px');
    expect(elements['live-radius-formula'].textContent.includes('R_trong: 16px')).toBe(true);
    expect(chips[4].classes.has('active')).toBe(true);

    // Test 9999px pill tier
    setPreviewRadius(9999, 'rounded-full', 'Viên thuốc gia vị / Bộ lọc');
    expect(elements['live-radius-outer'].style.borderRadius).toBe('9999px');
    expect(elements['live-radius-inner'].style.borderRadius).toBe('9999px');
    expect(chips[5].classes.has('active')).toBe(true);

    // Test copyToken fallback when navigator.clipboard is unavailable (e.g. file://)
    copyToken('#1D4ED8 — bg-[#1D4ED8]');
    expect(copiedViaExecCommand).toBe(true);
    expect(elements['copy-toast'].textContent).toBe('✓ Đã sao chép: #1D4ED8 — bg-[#1D4ED8]');
    expect(elements['copy-toast'].classes.has('show')).toBe(true);
  });
});
