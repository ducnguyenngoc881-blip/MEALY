import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEV_URL = 'http://localhost:5173/';
const TEMP_PROFILE = path.join(os.tmpdir(), 'mw_chrome_test_' + Date.now());

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTask3Test() {
  console.log('=== TESTING RECIPE DETAIL MODAL WITH 20 SERVINGS SCALING ===');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${TEMP_PROFILE}`,
    DEV_URL
  ]);
  await sleep(2500);

  let ws;
  try {
    const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
    const t = list.find(x => x.url.includes('localhost:5173'));
    if (!t) throw new Error('Target not found in list: ' + JSON.stringify(list));
    ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((res, rej) => {
      const i = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === i) {
          ws.removeEventListener('message', handler);
          res(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    // 1. Bypass onboarding
    await send('Runtime.evaluate', { 
      expression: `window.localStorage.setItem('mealwise_onboarding', JSON.stringify({ completed: true }));` 
    });
    await send('Page.navigate', { url: DEV_URL });
    await sleep(1500);

    // 2. Navigate to 'recipes' tab (Món Ngon)
    const tabClicked = await send('Runtime.evaluate', {
      expression: `(() => {
        const recipeTab = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Món Ngon'));
        if (recipeTab) {
          recipeTab.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log('Clicked Món Ngon Tab:', tabClicked.value);
    await sleep(800);

    // 3. Click first recipe card in RecipeCatalog
    const cardClicked = await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.glass-card');
        if (card) {
          card.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log('Clicked Recipe Card:', cardClicked.value);
    await sleep(800);

    // Test across viewports: 320px, 340px, 360px
    for (const width of [320, 340, 360]) {
      console.log(`\n--- Auditing RecipeDetailModal at Viewport: ${width}px ---`);
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 800,
        deviceScaleFactor: 2,
        mobile: true
      });
      await sleep(400);

      // Increase servings to 20
      const scaleRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const plusBtn = document.querySelector('button[aria-label="Tăng khẩu phần"]');
          if (!plusBtn) return { error: 'Plus button not found' };

          let clicks = 0;
          while (!plusBtn.disabled && clicks < 25) {
            plusBtn.click();
            clicks++;
          }

          const servingsSpan = document.querySelector('.min-w-\\\\[52px\\\\]');
          return {
            clicks,
            disabled: plusBtn.disabled,
            servingsText: servingsSpan ? servingsSpan.textContent.trim() : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Scaled to 20 servings:', scaleRes.value);
      await sleep(400);

      // Measure layout:
      // 1. Ratio badge: "Đã tự động nhân tỉ lệ (20/...)"
      // 2. Ingredient units (no awkward wrapping, badge shrink-0 whitespace-nowrap, inside card)
      const audit = await send('Runtime.evaluate', {
        expression: `(() => {
          const modalSheet = document.querySelector('.fixed.inset-0 .max-w-lg') || document.querySelector('.fixed.inset-0 > div');
          if (!modalSheet) return { error: 'Modal sheet not found' };
          const sheetRect = modalSheet.getBoundingClientRect();

          // 1. Section Header & Ratio Badge
          const headerContainer = Array.from(document.querySelectorAll('div')).find(d => 
            d.querySelector('h3') && d.textContent.includes('Nguyên Liệu Cần Chuẩn Bị')
          );
          const ratioBadge = headerContainer ? headerContainer.querySelector('span') : null;
          const headerTitle = headerContainer ? headerContainer.querySelector('h3') : null;

          let badgeAudit = null;
          if (ratioBadge && headerTitle) {
            const bRect = ratioBadge.getBoundingClientRect();
            const tRect = headerTitle.getBoundingClientRect();
            const bStyle = window.getComputedStyle(ratioBadge);

            const badgeOverlapsTitle = bRect.left < tRect.right && bRect.top < tRect.bottom && bRect.bottom > tRect.top;
            const badgeOverflowsSheet = bRect.right > sheetRect.right + 0.5;

            badgeAudit = {
              text: ratioBadge.textContent.trim(),
              badgeWidth: Math.round(bRect.width * 10) / 10,
              badgeOverlapsTitle,
              badgeOverflowsSheet,
              shrink0: bStyle.flexShrink === '0',
              wrapContainer: window.getComputedStyle(headerContainer).flexWrap === 'wrap'
            };
          }

          // 2. Ingredient Items
          const rows = Array.from(document.querySelectorAll('.p-2\\\\.5.rounded-xl.bg-slate-50, .p-2\\\\.5.rounded-xl'));
          const rowAudits = [];

          for (const row of rows) {
            const nameSpan = row.querySelector('span:first-child');
            const unitBadge = row.querySelector('span:last-child');
            if (!nameSpan || !unitBadge || !unitBadge.textContent.match(/\\d/)) continue;

            const rowRect = row.getBoundingClientRect();
            const nameRect = nameSpan.getBoundingClientRect();
            const badgeRect = unitBadge.getBoundingClientRect();
            const badgeStyle = window.getComputedStyle(unitBadge);

            const overflowsRow = badgeRect.right > rowRect.right + 0.5;
            const collidesWithName = nameRect.right > badgeRect.left;
            const isSingleLine = badgeRect.height <= 32; // Normal single line badge height is ~24-28px; 2 lines would be >=40px

            rowAudits.push({
              name: nameSpan.textContent.trim(),
              badgeText: unitBadge.textContent.trim(),
              badgeWidth: Math.round(badgeRect.width * 10) / 10,
              badgeHeight: Math.round(badgeRect.height * 10) / 10,
              isSingleLine,
              whiteSpace: badgeStyle.whiteSpace,
              shrink0: badgeStyle.flexShrink === '0',
              overflowsRow,
              collidesWithName
            });
          }

          return {
            viewportWidth: window.innerWidth,
            sheetWidth: Math.round(sheetRect.width * 10) / 10,
            badgeAudit,
            totalIngredientsAudited: rowAudits.length,
            allBadgesSingleLine: rowAudits.every(r => r.isSingleLine),
            allBadgesWhitespaceNowrap: rowAudits.every(r => r.whiteSpace === 'nowrap'),
            allBadgesContainedInRow: rowAudits.every(r => !r.overflowsRow),
            zeroNameCollisions: rowAudits.every(r => !r.collidesWithName),
            sampleRows: rowAudits.slice(0, 6)
          };
        })()`,
        returnByValue: true
      });

      console.log('Audit Results:', JSON.stringify(audit.value, null, 2));
    }

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chrome.kill();
  }
}

runTask3Test();
