// Скриншоты ключевых страниц на трёх ширинах: node scripts/shots.mjs <outDir> [baseUrl]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const out = process.argv[2] ?? 'shots';
const base = process.argv[3] ?? 'http://127.0.0.1:4321/klubnika-prototypes/variant2/';
const pages = process.env.PAGES?.split(',') ?? ['', 'catalog/', 'catalog/remontantnye/', 'catalog/remontantnye/albion/', 'catalog/rannie/avrora-munira/', 'cart/', 'order/', 'faq/', 'about/'];
const widths = { d: 1440, t: 900, m: 390 };
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [k, w] of Object.entries(widths)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (process.env.CART) {
    await page.goto(base);
    await page.evaluate((c) => localStorage.setItem('km-cart-v2', c), process.env.CART);
  }
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const name = `${k}-${(p || 'home').replace(/\/$/, '').replace(/\//g, '_')}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: true });
  }
  if (errors.length) console.log(k, 'ERRORS:', errors);
  await ctx.close();
}
await browser.close();
console.log('done', out);
