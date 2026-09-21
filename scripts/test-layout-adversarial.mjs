import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEV_URL = 'http://localhost:5173/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('Eval error: ' + (res.exceptionDetails.text || JSON.stringify(res.exceptionDetails)));
    }
    return res.result?.value;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runAudit() {
  console.log('=== STARTING CHROME CDP ADVERSARIAL LAYOUT AUDIT ===');
  
  // 1. Launch Chrome
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    DEV_URL
  ]);

  await sleep(2000);

  let cdp;
  const results = {
    onboarding: [],
    apexModal: [],
    recipeDetail: [],
    sidebar: []
  };

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('localhost:5173'));
    if (!target) throw new Error('MealWise target not found');
    console.log('Target found:', target.id, target.title);

    cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('CDP Connected.');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await sleep(2500);

    // =========================================================================
    // MISSION TASK 1: OnboardingModal Step 4 under 320px–360px viewport widths
    // =========================================================================
    console.log('\n--- AUDITING MISSION TASK 1: OnboardingModal Step 4 (320px - 360px) ---');
    
    for (const width of [320, 340, 360]) {
      await cdp.setViewport(width, 700);
      await sleep(400);

      // Trigger onboarding modal if needed
      await cdp.eval(`
        window.localStorage.removeItem('mealwise_onboarding');
      `);
      
      const setupResult = await cdp.eval(`
        (() => {
          let nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tiếp Theo') || b.textContent.includes('Hoàn Tất'));
          
          if (!nextBtn) {
            // Find in account tab or reset
            const accBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tài Khoản'));
            if (accBtn) accBtn.click();
            const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Thiết Lập Lại'));
            if (resetBtn) resetBtn.click();
            nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tiếp Theo') || b.textContent.includes('Hoàn Tất'));
          }
          
          // Click Next up to Step 4
          for (let i = 0; i < 5; i++) {
            let curNext = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tiếp Theo') || b.textContent.includes('Hoàn Tất'));
            let h2 = document.querySelector('h2');
            if (h2 && h2.textContent.includes('Bước 4')) {
              break;
            }
            if (curNext) curNext.click();
          }
          
          let h2 = document.querySelector('h2');
          return { opened: true, stepText: h2 ? h2.textContent : '' };
        })()
      `);
      console.log('Viewport ' + width + 'px Setup:', setupResult);

      await sleep(600);

      const metrics = await cdp.eval(`
        (() => {
          const modalDialog = document.querySelector('.fixed.inset-0 > div');
          const footer = modalDialog ? modalDialog.querySelector('.shrink-0.border-t') : null;
          const completeBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('Hoàn Tất')
          );
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('Quay Lại')
          );

          if (!modalDialog || !completeBtn) {
            return { error: 'Modal or complete button not found' };
          }

          const modalRect = modalDialog.getBoundingClientRect();
          const footerRect = footer ? footer.getBoundingClientRect() : null;
          const completeRect = completeBtn.getBoundingClientRect();
          const backRect = backBtn ? backBtn.getBoundingClientRect() : null;

          const horizontalOverflowModal = modalDialog.scrollWidth > modalDialog.clientWidth;
          const horizontalOverflowFooter = footer ? footer.scrollWidth > footer.clientWidth : false;
          
          const btnText = completeBtn.innerText.trim().replace(/\\s+/g, ' ');

          const rightOverflow = completeRect.right - modalRect.right;
          const leftCollision = backRect ? backRect.right - completeRect.left : 0;

          return {
            viewportWidth: window.innerWidth,
            modalWidth: modalRect.width,
            modalScrollWidth: modalDialog.scrollWidth,
            modalClientWidth: modalDialog.clientWidth,
            horizontalOverflowModal,
            horizontalOverflowFooter,
            btnText,
            completeRect: { left: completeRect.left, right: completeRect.right, width: completeRect.width },
            modalRect: { left: modalRect.left, right: modalRect.right, width: modalRect.width },
            backRect: backRect ? { left: backRect.left, right: backRect.right, width: backRect.width } : null,
            rightOverflow: Math.round(rightOverflow * 100) / 100,
            leftCollision: Math.round(leftCollision * 100) / 100,
            containedWithinModal: completeRect.right <= modalRect.right + 0.5,
            noButtonOverlap: backRect ? completeRect.left >= backRect.right : true
          };
        })()
      `);

      console.log('Viewport ' + width + 'px Onboarding Result:', metrics);
      results.onboarding.push(metrics);
    }

    // Close onboarding by completing it
    await cdp.eval(`
      const completeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hoàn Tất'));
      if (completeBtn) completeBtn.click();
    `);
    await sleep(800);

    // =========================================================================
    // MISSION TASK 4: Sidebar at 360px viewport (All 7 tab labels single line)
    // =========================================================================
    console.log('\n--- AUDITING MISSION TASK 4: Sidebar at 360px Viewport (7 Tab Labels) ---');
    await cdp.setViewport(360, 800);
    await sleep(500);

    const sidebarMetrics = await cdp.eval(`
      (() => {
        const nav = document.querySelector('nav[aria-label="Điều hướng chính"]');
        if (!nav) return { error: 'Sidebar nav not found' };

        const buttons = Array.from(nav.querySelectorAll('button'));
        const tabData = [];
        
        for (const btn of buttons) {
          const span = btn.querySelector('span:not(.rounded-full)');
          if (!span) continue;
          const text = span.textContent.trim();
          const rect = span.getBoundingClientRect();
          const style = window.getComputedStyle(span);
          
          const range = document.createRange();
          range.selectNodeContents(span);
          const rangeRects = range.getClientRects();
          const lineCount = rangeRects.length;

          tabData.push({
            text,
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            top: Math.round(rect.top * 10) / 10,
            whiteSpace: style.whiteSpace,
            lineCount,
            isSingleLine: lineCount <= 1
          });
        }

        const regularTabs = tabData.filter(t => t.text !== 'Mở Hòm');
        const tops = regularTabs.map(t => t.top);
        const minTop = Math.min(...tops);
        const maxTop = Math.max(...tops);
        const topDiff = Math.abs(maxTop - minTop);

        return {
          totalTabsFound: tabData.length,
          tabData,
          topDiff,
          zeroStairStepping: topDiff <= 1.0,
          allStrictlySingleLine: tabData.every(t => t.isSingleLine)
        };
      })()
    `);

    console.log('Sidebar 360px Metrics:', JSON.stringify(sidebarMetrics, null, 2));
    results.sidebar.push(sidebarMetrics);

    // =========================================================================
    // MISSION TASK 2: FastMealApexModal across 4 modes and 3 tiers
    // =========================================================================
    console.log('\n--- AUDITING MISSION TASK 2: FastMealApexModal (4 Modes x 3 Tiers) ---');
    await cdp.setViewport(360, 800);
    
    // Open FastMealApexModal
    await cdp.eval(`
      const apexBtn = document.querySelector('button[title*="Mở Hòm Bữa Cơm"]');
      if (apexBtn) apexBtn.click();
    `);
    await sleep(600);

    const modes = ['bizarre-dare', 'snack-genz', 'express-1dish', 'combo'];
    const tiers = ['blue', 'purple', 'gold'];

    for (const mode of modes) {
      await cdp.eval(`
        (() => {
          const changeModeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Đổi Thể Thức') || b.textContent.includes('Quay Lại'));
          if (changeModeBtn) changeModeBtn.click();
        })()
      `);
      await sleep(400);

      const modeSelectRes = await cdp.eval(`
        (() => {
          const cards = Array.from(document.querySelectorAll('button'));
          let targetCard = null;
          if ('${mode}' === 'bizarre-dare') targetCard = cards.find(b => b.textContent.includes('Độc Lạ Thử Thách') || b.textContent.includes('Thử Thách'));
          else if ('${mode}' === 'snack-genz') targetCard = cards.find(b => b.textContent.includes('Gen Z') || b.textContent.includes('Ăn Vặt'));
          else if ('${mode}' === 'express-1dish') targetCard = cards.find(b => b.textContent.includes('Cơm Nhanh 1 Món') || b.textContent.includes('1 Món'));
          else if ('${mode}' === 'combo') targetCard = cards.find(b => b.textContent.includes('Mâm Cơm 3 Món') || b.textContent.includes('3 Món Cơm'));

          if (targetCard) {
            targetCard.click();
            return { selected: true, cardText: targetCard.innerText.slice(0, 30) };
          }
          return { selected: false };
        })()
      `);
      console.log('Selecting mode ' + mode + ':', modeSelectRes);
      await sleep(300);

      await cdp.eval(`
        (() => {
          const launchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tiếp Tục') || b.textContent.includes('Xác Nhận') || b.textContent.includes('Mở Hòm'));
          if (launchBtn) launchBtn.click();
        })()
      `);
      await sleep(1000);

      for (const tier of tiers) {
        await cdp.eval(`
          (() => {
            const podiums = Array.from(document.querySelectorAll('.grid-cols-3 button'));
            let targetPodium = null;
            if ('${tier}' === 'blue') targetPodium = podiums[0];
            else if ('${tier}' === 'purple') targetPodium = podiums[1];
            else if ('${tier}' === 'gold') targetPodium = podiums[2];

            if (targetPodium) {
              targetPodium.click();
            }
          })()
        `);

        await sleep(300);

        const podiumAudit = await cdp.eval(`
          (() => {
            const podiums = Array.from(document.querySelectorAll('.grid-cols-3 button'));
            if (podiums.length < 3) return { error: 'Podium buttons not found', count: podiums.length };

            const items = podiums.map((btn, idx) => {
              const rect = btn.getBoundingClientRect();
              const style = window.getComputedStyle(btn);
              const overflowHidden = style.overflow === 'hidden';

              const titleSpan = btn.querySelector('.text-\\\\[10px\\\\]');
              const priceSpan = btn.querySelector('.text-xs, .text-\\\\[13px\\\\]');
              const subSpan = btn.querySelector('.text-\\\\[9.5px\\\\], .text-\\\\[10px\\\\].text-slate-400');

              const subText = subSpan ? subSpan.textContent.trim() : '';
              const subRect = subSpan ? subSpan.getBoundingClientRect() : null;
              const subStyle = subSpan ? window.getComputedStyle(subSpan) : null;
              
              const titleText = titleSpan ? titleSpan.textContent.trim() : '';
              const titleRect = titleSpan ? titleSpan.getBoundingClientRect() : null;

              let bleedRight = 0;
              if (subRect && subRect.right > rect.right) {
                bleedRight = subRect.right - rect.right;
              }
              if (titleRect && titleRect.right > rect.right) {
                bleedRight = Math.max(bleedRight, titleRect.right - rect.right);
              }

              let subLineCount = 1;
              if (subSpan) {
                const range = document.createRange();
                range.selectNodeContents(subSpan);
                subLineCount = range.getClientRects().length;
              }

              return {
                index: idx,
                titleText,
                subText,
                buttonWidth: Math.round(rect.width * 10) / 10,
                overflowHidden,
                hasTitleAttr: subSpan ? subSpan.hasAttribute('title') : false,
                subTitleAttr: subSpan ? subSpan.getAttribute('title') : null,
                subWhiteSpace: subStyle ? subStyle.whiteSpace : null,
                subLineCount,
                bleedRight: Math.round(bleedRight * 10) / 10,
                noBleed: bleedRight <= 0.5
              };
            });

            const p0 = podiums[0].getBoundingClientRect();
            const p1 = podiums[1].getBoundingClientRect();
            const p2 = podiums[2].getBoundingClientRect();

            const overlap01 = p0.right > p1.left;
            const overlap12 = p1.right > p2.left;

            return {
              mode: '${mode}',
              tier: '${tier}',
              items,
              podiumsOverlap: overlap01 || overlap12,
              allOverflowHidden: items.every(i => i.overflowHidden),
              allNoBleed: items.every(i => i.noBleed),
              allSingleLineSub: items.every(i => i.subLineCount <= 1)
            };
          })()
        `);

        console.log('Mode: ' + mode + ' | Tier: ' + tier + ' ->', {
          allOverflowHidden: podiumAudit.allOverflowHidden,
          allNoBleed: podiumAudit.allNoBleed,
          allSingleLineSub: podiumAudit.allSingleLineSub,
          podiumsOverlap: podiumAudit.podiumsOverlap
        });

        results.apexModal.push(podiumAudit);
      }
    }

    // Close Apex Modal
    await cdp.eval(`
      const closeBtn = document.querySelector('button[aria-label="Đóng"], button[title="Đóng"], .fixed.inset-0 button.w-8.h-8');
      if (closeBtn) closeBtn.click();
    `);
    await sleep(500);

    // =========================================================================
    // MISSION TASK 3: RecipeDetailModal with 20 servings scaling
    // =========================================================================
    console.log('\n--- AUDITING MISSION TASK 3: RecipeDetailModal with 20 Servings Scaling ---');
    
    await cdp.setViewport(360, 800);
    await cdp.eval(`
      const recipeTabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Món Ngon'));
      if (recipeTabBtn) recipeTabBtn.click();
    `);
    await sleep(600);

    const openRecipeRes = await cdp.eval(`
      (() => {
        const recipeCards = Array.from(document.querySelectorAll('div, button')).filter(el => 
          el.textContent.includes('phút') && el.textContent.includes('kcal') && el.querySelector('img')
        );
        if (recipeCards.length > 0) {
          recipeCards[0].click();
          return { opened: true };
        }
        return { opened: false, cardCount: recipeCards.length };
      })()
    `);
    console.log('Open Recipe Detail:', openRecipeRes);
    await sleep(600);

    for (const width of [320, 360]) {
      await cdp.setViewport(width, 800);
      await sleep(400);

      const scaleTo20Res = await cdp.eval(`
        (() => {
          const plusBtn = document.querySelector('button[aria-label="Tăng khẩu phần"]');
          if (!plusBtn) return { error: 'Plus button not found' };
          
          let clicks = 0;
          while (!plusBtn.disabled && clicks < 25) {
            plusBtn.click();
            clicks++;
          }
          
          const servingsText = document.querySelector('.min-w-\\\\[52px\\\\]')?.textContent?.trim();
          return { clicks, servingsText, disabled: plusBtn.disabled };
        })()
      `);
      console.log('Scale to 20 servings at ' + width + 'px:', scaleTo20Res);
      await sleep(400);

      const recipeAudit = await cdp.eval(`
        (() => {
          const sheet = document.querySelector('.fixed.inset-0 .max-w-lg') || document.querySelector('.fixed.inset-0 > div');
          if (!sheet) return { error: 'RecipeDetail sheet not found' };
          const sheetRect = sheet.getBoundingClientRect();

          const headerContainer = document.querySelector('h3')?.parentElement;
          const headerTitle = headerContainer?.querySelector('h3');
          const ratioBadge = Array.from(document.querySelectorAll('span')).find(s => 
            s.textContent.includes('Đã tự động nhân tỉ lệ')
          );

          let ratioBadgeMetrics = null;
          if (ratioBadge) {
            const badgeRect = ratioBadge.getBoundingClientRect();
            const titleRect = headerTitle ? headerTitle.getBoundingClientRect() : null;
            const style = window.getComputedStyle(ratioBadge);
            
            const range = document.createRange();
            range.selectNodeContents(ratioBadge);
            const lineCount = range.getClientRects().length;

            const badgeOverlapsTitle = titleRect ? (badgeRect.left < titleRect.right && badgeRect.top < titleRect.bottom && badgeRect.bottom > titleRect.top) : false;
            const badgeOverflowsSheet = badgeRect.right > sheetRect.right;

            ratioBadgeMetrics = {
              text: ratioBadge.textContent.trim(),
              width: Math.round(badgeRect.width * 10) / 10,
              badgeRect: { left: badgeRect.left, right: badgeRect.right, top: badgeRect.top },
              sheetRight: sheetRect.right,
              lineCount,
              badgeOverlapsTitle,
              badgeOverflowsSheet,
              shrink0: style.flexShrink === '0'
            };
          }

          const ingRows = Array.from(document.querySelectorAll('.p-2\\\\.5.rounded-xl.bg-slate-50, .p-2\\\\.5.rounded-xl'));
          const rowAudits = [];

          for (const row of ingRows) {
            const rowRect = row.getBoundingClientRect();
            const nameSpan = row.querySelector('span:first-child');
            const unitBadge = row.querySelector('span:last-child');
            if (!unitBadge || !nameSpan) continue;

            const unitRect = unitBadge.getBoundingClientRect();
            const nameRect = nameSpan.getBoundingClientRect();
            const badgeStyle = window.getComputedStyle(unitBadge);

            const range = document.createRange();
            range.selectNodeContents(unitBadge);
            const badgeLineCount = range.getClientRects().length;

            const badgeOverflowsRow = unitRect.right > rowRect.right + 0.5;
            const badgeCollidesWithName = nameRect.right > unitRect.left;

            rowAudits.push({
              name: nameSpan.textContent.trim(),
              badgeText: unitBadge.textContent.trim(),
              badgeLineCount,
              badgeOverflowsRow,
              badgeCollidesWithName,
              badgeWhiteSpace: badgeStyle.whiteSpace,
              shrink0: badgeStyle.flexShrink === '0'
            });
          }

          return {
            viewportWidth: window.innerWidth,
            ratioBadgeMetrics,
            totalIngredients: rowAudits.length,
            allBadgesSingleLine: rowAudits.every(r => r.badgeLineCount <= 1),
            allBadgesContained: rowAudits.every(r => !r.badgeOverflowsRow),
            zeroCollisions: rowAudits.every(r => !r.badgeCollidesWithName),
            sampleRows: rowAudits.slice(0, 5)
          };
        })()
      `);

      console.log('Recipe Detail Audit (' + width + 'px):', {
        viewportWidth: recipeAudit.viewportWidth,
        ratioBadge: recipeAudit.ratioBadgeMetrics,
        totalIngredients: recipeAudit.totalIngredients,
        allBadgesSingleLine: recipeAudit.allBadgesSingleLine,
        allBadgesContained: recipeAudit.allBadgesContained,
        zeroCollisions: recipeAudit.zeroCollisions
      });

      results.recipeDetail.push(recipeAudit);
    }

    console.log('\n=== AUDIT COMPLETE ===');

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }

  return results;
}

runAudit();
