// Мини-сервер для тестов: отдаёт dist/ по адресу /klubnika-prototypes/variant2/ (как GitHub Pages).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const BASE = '/klubnika-prototypes/variant2/';
const ROOT = path.resolve('dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.json': 'application/json' };
http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  if (!u.startsWith(BASE)) { res.writeHead(404).end('not found'); return; }
  let f = path.join(ROOT, u.slice(BASE.length));
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(Number(process.env.PORT ?? 4322), '127.0.0.1');
