import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const SCREENSHOTS_DIR = 'C:\\Users\\M4\\.gemini\\antigravity-ide\\brain\\9bcaac32-39e2-43f5-844f-a30ada1c254a\\screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function ensureChrome() {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    if (res.ok) return null;
  } catch {}

  console.log('Launching headless Chrome with remote debugging on port 9222...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'C:\\Users\\M4\\AppData\\Local\\Temp\\chrome_cdp_profile';
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--no-sandbox',
  ], { detached: true, stdio: 'ignore' });

  proc.unref();

  // Wait for port 9222 to respond
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        console.log('Chrome CDP is ready on port 9222!');
        return proc;
      }
    } catch {}
  }
  throw new Error('Failed to launch Chrome on port 9222');
}

async function sendCdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function captureScreen({ url, device, width, height, scale, filename, waitMs = 3500, scrollBy = 0 }) {
  console.log(`\n--- Capturing ${filename} (${device} ${width}x${height}) from ${url} ---`);

  // 1. Create a new tab target
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
  const tab = await newTabRes.json();
  const wsUrl = tab.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  // 2. Enable Page, Runtime, DOM
  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'DOM.enable');

  // 3. Set Device Metrics Emulation
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: true,
  });

  // 4. Set User Agent
  const ua = device.includes('iPhone')
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  await sendCdp(ws, 'Emulation.setUserAgentOverride', { userAgent: ua });

  // 5. Navigate
  await sendCdp(ws, 'Page.navigate', { url });

  // 6. Wait for load and hydration
  console.log(`Waiting ${waitMs}ms for rendering...`);
  await new Promise((r) => setTimeout(r, waitMs));

  if (scrollBy) {
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `
        const el = Array.from(document.querySelectorAll('div')).find(d => {
          const s = window.getComputedStyle(d);
          return (s.overflowY === 'auto' || s.overflowY === 'scroll') && d.scrollHeight > d.clientHeight;
        }) || document.scrollingElement || document.body;
        if (el) el.scrollTop += ${scrollBy};
        window.scrollBy(0, ${scrollBy});
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));
  }

  // 7. Capture screenshot
  const result = await sendCdp(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const outPath = path.join(SCREENSHOTS_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(result.data, 'base64'));
  console.log(`✓ Saved screenshot to: ${outPath} (${fs.statSync(outPath).size} bytes)`);

  // Close tab
  await sendCdp(ws, 'Page.close').catch(() => {});
  ws.close();

  return outPath;
}

async function main() {
  try {
    await ensureChrome();

    const verRes = await fetch('http://127.0.0.1:9222/json/version');
    const ver = await verRes.json();
    console.log('Connected to:', ver.Browser);

    const tasks = [
      {
        url: 'http://localhost:8081/',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '01_homepage_iphone_390x844.png',
        waitMs: 6000,
      },
      {
        url: 'http://localhost:8081/',
        device: 'Android Galaxy S23',
        width: 360,
        height: 800,
        scale: 2,
        filename: '02_homepage_android_360x800.png',
        waitMs: 9000,
      },
      {
        url: 'http://localhost:8081/(tabs)/categories',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '03_categories_iphone_390x844.png',
        waitMs: 4000,
      },
      {
        url: 'http://localhost:8081/(tabs)/categories',
        device: 'Android Galaxy S23',
        width: 360,
        height: 800,
        scale: 2,
        filename: '04_categories_android_360x800.png',
        waitMs: 4000,
      },
      {
        url: 'http://localhost:8081/(tabs)/cart',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '05_cart_iphone_390x844.png',
        waitMs: 4000,
      },
      {
        url: 'http://localhost:8081/checkout',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '06_checkout_iphone_390x844.png',
        waitMs: 4000,
      },
      {
        url: 'http://localhost:8081/category/crockry',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '07_category_products_iphone_390x844.png',
        waitMs: 4000,
      },
      {
        url: 'http://localhost:8081/product/6acf1cf9acba0177feebfb5c',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '08_product_details_iphone_390x844.png',
        waitMs: 4000,
      },
      {
        url: 'http://localhost:8081/',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '09_flipkart_style_feed_iphone.png',
        waitMs: 6000,
        scrollBy: 650,
      },
      {
        url: 'http://localhost:8081/',
        device: 'iPhone 15',
        width: 390,
        height: 844,
        scale: 2,
        filename: '10_bestsellers_and_products_iphone.png',
        waitMs: 6000,
        scrollBy: 1100,
      },
    ];

    const filter = process.argv[2];
    const tasksToRun = filter ? tasks.filter(t => t.filename.includes(filter)) : tasks;

    for (const task of tasksToRun) {
      try {
        await captureScreen(task);
      } catch (err) {
        console.error(`Error capturing ${task.filename}:`, err.message);
      }
    }

    console.log('\nAll screenshot captures completed successfully!');
  } catch (err) {
    console.error('Fatal CDP error:', err);
  }
}

main();
