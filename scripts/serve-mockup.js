import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 4567;
const DIR = 'd:/New folder/Remotion/screenshots';

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let fileName = 'iphone_mockup_magenta.html';
  if (urlPath === '/green') {
    fileName = 'iphone_mockup_green.html';
  } else if (urlPath === '/magenta') {
    fileName = 'iphone_mockup_magenta.html';
  }

  const filePath = path.join(DIR, fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Mockup server running at http://localhost:${PORT}`);
});
