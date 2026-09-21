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

async function runTask1Test() {
  console.log('=== TESTING ONBOARDING MODAL STEP 4 AT 320PX-360PX ===');
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

    for (const width of [320, 340, 360]) {
      console.log(`\n--- Viewport Width: ${width}px ---`);
      await cdp.setViewport(width, 700);

      // Clear onboarding and reload page to start fresh
      await cdp.eval(`window.localStorage.removeItem('mealwise_onboarding');`);
      await cdp.send('Page.navigate', { url: DEV_URL });
      await sleep(1500);

      // Verify Step 1 is open
      const step1Text = await cdp.eval(`document.querySelector('h2')?.textContent`);
      console.log('Initial Step:', step1Text);

      // Navigate to Step 4 by clicking Next 3 times
      for (let s = 1; s <= 3; s++) {
        const clicked = await cdp.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const nextBtn = btns.find(b => b.textContent.includes('Tiếp Theo'));
            if (nextBtn) {
              nextBtn.click();
              return true;
            }
            return false;
          })()
        `);
        console.log(`Clicked Next on Step ${s}:`, clicked);
        await sleep(400);
      }

      const curStep = await cdp.eval(`document.querySelector('h2')?.textContent`);
      console.log('Reached Step:', curStep);

      // Inspect Step 4 footer and completion button
      const audit = await cdp.eval(`
        (() => {
          const modal = document.querySelector('.fixed.inset-0 > div');
          const footer = modal ? modal.querySelector('.shrink-0.border-t') : null;
          const completeBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('Hoàn Tất')
          );
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('Quay Lại')
          );

          if (!modal || !completeBtn || !footer) {
            return { error: 'Modal elements not found', modal: !!modal, completeBtn: !!completeBtn, footer: !!footer };
          }

          const modalRect = modal.getBoundingClientRect();
          const footerRect = footer.getBoundingClientRect();
          const completeRect = completeBtn.getBoundingClientRect();
          const backRect = backBtn ? backBtn.getBoundingClientRect() : null;

          const smHiddenSpan = completeBtn.querySelector('.sm\\\\:hidden');
          const smInlineSpan = completeBtn.querySelector('.hidden.sm\\\\:inline');

          const smHiddenDisplay = smHiddenSpan ? window.getComputedStyle(smHiddenSpan).display : null;
          const smInlineDisplay = smInlineSpan ? window.getComputedStyle(smInlineSpan).display : null;

          const visibleText = completeBtn.innerText.trim();

          const rightOverflow = completeRect.right - modalRect.right;
          const footerOverflow = footer.scrollWidth - footer.clientWidth;
          const modalOverflow = modal.scrollWidth - modal.clientWidth;

          return {
            viewportWidth: window.innerWidth,
            modalRect: { left: modalRect.left, right: modalRect.right, width: modalRect.width },
            footerRect: { left: footerRect.left, right: footerRect.right, width: footerRect.width },
            completeRect: { left: completeRect.left, right: completeRect.right, width: completeRect.width },
            backRect: backRect ? { left: backRect.left, right: backRect.right, width: backRect.width } : null,
            visibleText,
            smHiddenDisplay,
            smInlineDisplay,
            rightOverflow: Math.round(rightOverflow * 100) / 100,
            footerOverflow,
            modalOverflow,
            containedWithinModal: completeRect.right <= modalRect.right + 0.5,
            containedWithinFooter: completeRect.right <= footerRect.right + 0.5,
            noHorizontalOverflow: footerOverflow <= 0 && modalOverflow <= 0,
            noButtonOverlap: backRect ? completeRect.left >= backRect.right : true
          };
        })()
      `);

      console.log(`Audit Results at ${width}px:`, audit);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }
}

runTask1Test();
