const fs = require('fs');
const https = require('https');

const extracted = JSON.parse(fs.readFileSync('scripts/extracted_images.json', 'utf-8'));
const urls = extracted.urls.map(u => u.url);

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', (err) => resolve({ url, status: 'ERROR: ' + err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 'EXCEPTION: ' + e.message });
    }
  });
}

async function main() {
  console.log(`Checking ${urls.length} URLs...`);
  const results = [];
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`${res.status === 200 ? '✓' : '✗'} [${res.status}] ${res.url}`);
    results.push(res);
  }
  fs.writeFileSync('scripts/url_health_results.json', JSON.stringify(results, null, 2));
}

main();
