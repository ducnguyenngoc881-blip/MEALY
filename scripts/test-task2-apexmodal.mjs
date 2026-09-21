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

async function runTask2Test() {
  console.log('=== TESTING FASTMEALAPEXMODAL ACROSS 4 MODES AND 3 TIERS ===');
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
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('localhost:5173'));
    if (!target) throw new Error('MealWise target not found');

    cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // Standard 360px mobile viewport
    await cdp.setViewport(360, 800);

    // Bypass onboarding so modal can be tested cleanly
    await cdp.eval(`
      window.localStorage.setItem('mealwise_onboarding', JSON.stringify({ completed: true, regionPreference: 'bac', familySize: 4, budgetLevel: 'vua-phai', specialNeeds: [] }));
    `);
    await cdp.send('Page.navigate', { url: DEV_URL });
    await sleep(1500);

    // Open FastMealApexModal via centerpiece button
    const openRes = await cdp.eval(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Mở hòm bữa cơm"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Opened Apex Modal:', openRes);
    await sleep(600);

    const modes = [
      { id: 'bizarre-dare', label: 'Độc Lạ Thử Thách' },
      { id: 'snack-genz', label: 'Ăn Vặt Gen Z' },
      { id: 'express-1dish', label: 'Ăn Nhanh 1 Món' },
      { id: 'combo', label: 'Mâm Cơm 3 Món' }
    ];
    const tiers = ['blue', 'purple', 'gold'];

    const summaryReport = [];

    for (const mode of modes) {
      console.log(`\n================ Testing Mode: ${mode.id} (${mode.label}) ================`);

      // Ensure we are on preference screen or switch to it via 'Đổi gu' button
      await cdp.eval(`
        (() => {
          const doiGuBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('Đổi gu')
          );
          if (doiGuBtn) doiGuBtn.click();
        })()
      `);
      await sleep(400);

      // Select mode card
      const cardSelected = await cdp.eval(`
        (() => {
          const cards = Array.from(document.querySelectorAll('button')).filter(b => 
            b.textContent.includes('${mode.label}')
          );
          if (cards.length > 0) {
            cards[0].click();
            return true;
          }
          return false;
        })()
      `);
      console.log(`Mode card '${mode.label}' selected:`, cardSelected);
      await sleep(300);

      // Click "VÀO MỞ HÒM"
      const continueClicked = await cdp.eval(`
        (() => {
          const launchBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('VÀO MỞ HÒM')
          );
          if (launchBtn) {
            launchBtn.click();
            return true;
          }
          return false;
        })()
      `);
      console.log(`Launch 'VÀO MỞ HÒM' button clicked:`, continueClicked);
      
      // Wait for 800ms transition animation to complete
      await sleep(1400);

      // Verify we are now on opener screen
      const openerReady = await cdp.eval(`
        (() => {
          const podiums = document.querySelectorAll('.grid.grid-cols-3 button');
          return podiums.length === 3;
        })()
      `);
      console.log('Opener screen ready (3 podium buttons present):', openerReady);

      // Now test each of the 3 tiers
      for (const tier of tiers) {
        // Select tier
        await cdp.eval(`
          (() => {
            const podiums = Array.from(document.querySelectorAll('.grid.grid-cols-3 button'));
            const idx = '${tier}' === 'blue' ? 0 : '${tier}' === 'purple' ? 1 : 2;
            if (podiums[idx]) podiums[idx].click();
          })()
        `);
        await sleep(300);

        // Audit podium buttons for bleed, clip, overflow, bounding box
        const audit = await cdp.eval(`
          (() => {
            const podiums = Array.from(document.querySelectorAll('.grid.grid-cols-3 button'));
            if (podiums.length !== 3) return { error: 'Podiums missing', count: podiums.length };

            const details = podiums.map((btn, i) => {
              const bRect = btn.getBoundingClientRect();
              const bStyle = window.getComputedStyle(btn);

              const titleEl = btn.querySelector('.text-\\\\[10px\\\\]');
              const priceEl = btn.querySelector('.text-xs, .text-\\\\[13px\\\\]');
              const subEl = btn.querySelector('.text-\\\\[9\\\\.5px\\\\], .text-\\\\[10px\\\\].text-slate-400');

              const subText = subEl ? subEl.textContent.trim() : '';
              const titleText = titleEl ? titleEl.textContent.trim() : '';
              const priceText = priceEl ? priceEl.textContent.trim() : '';

              const subRect = subEl ? subEl.getBoundingClientRect() : null;
              const subStyle = subEl ? window.getComputedStyle(subEl) : null;

              // Check if subtitle or title bleeds outside button boundary
              const rightBleed = subRect ? Math.max(0, subRect.right - bRect.right) : 0;
              const leftBleed = subRect ? Math.max(0, bRect.left - subRect.left) : 0;

              // Check line count of subtitle
              let subLines = 1;
              if (subEl) {
                const range = document.createRange();
                range.selectNodeContents(subEl);
                subLines = range.getClientRects().length;
              }

              return {
                index: i,
                titleText,
                priceText,
                subText,
                hasTitleTooltip: subEl ? (subEl.hasAttribute('title') && subEl.getAttribute('title') === subText) : false,
                overflowHidden: bStyle.overflow === 'hidden',
                subWhiteSpace: subStyle ? subStyle.whiteSpace : null,
                subLines,
                buttonWidth: Math.round(bRect.width * 10) / 10,
                rightBleed: Math.round(rightBleed * 10) / 10,
                leftBleed: Math.round(leftBleed * 10) / 10,
                noBleed: rightBleed <= 0.5 && leftBleed <= 0.5
              };
            });

            // Check neighbor button spacing (no overlap)
            const r0 = podiums[0].getBoundingClientRect();
            const r1 = podiums[1].getBoundingClientRect();
            const r2 = podiums[2].getBoundingClientRect();

            const gap01 = r1.left - r0.right;
            const gap12 = r2.left - r1.right;

            return {
              mode: '${mode.id}',
              tier: '${tier}',
              podiums: details,
              gap01: Math.round(gap01 * 10) / 10,
              gap12: Math.round(gap12 * 10) / 10,
              allOverflowHidden: details.every(d => d.overflowHidden),
              allNoBleed: details.every(d => d.noBleed),
              allSingleLineSub: details.every(d => d.subLines <= 1),
              allHaveTooltips: details.every(d => d.hasTitleTooltip),
              noButtonOverlap: gap01 >= 0 && gap12 >= 0
            };
          })()
        `);

        console.log(`Tier ${tier.toUpperCase()}:`, {
          allOverflowHidden: audit.allOverflowHidden,
          allNoBleed: audit.allNoBleed,
          allSingleLineSub: audit.allSingleLineSub,
          allHaveTooltips: audit.allHaveTooltips,
          noButtonOverlap: audit.noButtonOverlap,
          gap01: audit.gap01,
          gap12: audit.gap12,
          labels: audit.podiums ? audit.podiums.map(p => `${p.titleText} | ${p.subText} | bleed: ${p.rightBleed}`) : []
        });

        summaryReport.push(audit);
      }
    }

    console.log('\n=== TASK 2 SUMMARY ===');
    console.log(`Total mode x tier combinations tested: ${summaryReport.length} / 12`);
    const allPass = summaryReport.every(s => 
      s.allOverflowHidden && s.allNoBleed && s.allSingleLineSub && s.noButtonOverlap
    );
    console.log(`ALL 12 COMBINATIONS PASS: ${allPass}`);

  } catch (err) {
    console.error('Error in Task 2 test:', err);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }
}

runTask2Test();
