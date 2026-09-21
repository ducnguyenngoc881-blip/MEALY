import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEV_URL = 'http://localhost:5173/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function check() {
  const chrome = spawn(CHROME_PATH, ['--headless=new', '--remote-debugging-port=9222', '--disable-gpu', '--no-sandbox', DEV_URL]);
  await sleep(2000);
  try {
    const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
    const t = list.find(x => x.url.includes('localhost:5173'));
    const ws = new WebSocket(t.webSocketDebuggerUrl);
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
      ws.send(JSON.stringify({ id: i, method, params }));
    });

    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
    
    // Set onboarding complete
    await send('Runtime.evaluate', { 
      expression: `window.localStorage.setItem('mealwise_onboarding', JSON.stringify({ completed: true }));` 
    });
    await send('Page.navigate', { url: DEV_URL });
    await sleep(1500);

    // Open Apex modal
    await send('Runtime.evaluate', { 
      expression: `document.querySelector('button[aria-label*="Mở hòm bữa cơm"]').click()` 
    });
    await sleep(600);
    
    // Select bizarre-dare
    await send('Runtime.evaluate', { 
      expression: `Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Độc Lạ Thử Thách')).click()` 
    });
    await sleep(400);
    
    // Click Vào mở hòm
    await send('Runtime.evaluate', { 
      expression: `Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('VÀO MỞ HÒM')).click()` 
    });
    await sleep(1500);
    
    const inspect = await send('Runtime.evaluate', {
      expression: `(() => {
        const subs = Array.from(document.querySelectorAll('.grid.grid-cols-3 button .text-slate-400'));
        return subs.map(s => {
          const range = document.createRange();
          range.selectNodeContents(s);
          const rects = Array.from(range.getClientRects());
          const cs = window.getComputedStyle(s);
          return {
            text: s.textContent,
            whiteSpace: cs.whiteSpace,
            overflow: cs.overflow,
            textOverflow: cs.textOverflow,
            offsetHeight: s.offsetHeight,
            lineHeight: cs.lineHeight,
            fontSize: cs.fontSize,
            scrollWidth: s.scrollWidth,
            clientWidth: s.clientWidth,
            rectCount: rects.length,
            rects: rects.map(r => ({ width: r.width, height: r.height, top: r.top, bottom: r.bottom }))
          };
        });
      })()`,
      returnByValue: true
    });
    
    console.log('SUBTITLE DETAILS:\n', JSON.stringify(inspect.result.value, null, 2));
    ws.close();
  } finally {
    chrome.kill();
  }
}
check();
