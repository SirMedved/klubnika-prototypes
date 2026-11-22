// Проверки собранного сайта без браузера: каркас, ссылки, данные.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = '/klubnika-prototypes/variant2/';
const htmlFiles = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
});
const pages = htmlFiles(DIST);

test.describe('собранный сайт', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'один прогон достаточно'); });

  test('страниц: главная, каталог, 5 разделов, 100 сортов, 4 служебные', () => {
    expect(pages.length).toBe(111);
  });

  test('на каждой странице ровно одна шапка, меню, колонка, main и футер', () => {
    const shell = (html: string) => {
      const a = html.indexOf('<header class="site-header"');
      const b = html.indexOf('<div class="page"');
      const c = html.indexOf('<footer class="site-footer"');
      const d = html.indexOf('</footer>', c);
      return html.slice(a, b).replace(/ aria-current="page"/g, '') + html.slice(c, d);
    };
    const first = shell(fs.readFileSync(pages[0]!, 'utf8'));
    for (const f of pages) {
      const html = fs.readFileSync(f, 'utf8');
      for (const marker of ['<header class="site-header"', 'class="navribbon"', '<aside class="cats"', '<main', '<footer class="site-footer"']) {
        expect(html.split(marker).length - 1, `${f}: ${marker}`).toBe(1);
      }
      expect(shell(html), `${f}: шапка/футер отличаются`).toBe(first);
    }
  });

  test('все внутренние ссылки и картинки ведут на существующие файлы', () => {
    const broken: string[] = [];
    for (const f of pages) {
      const html = fs.readFileSync(f, 'utf8');
      for (const m of html.matchAll(/(?:href|src)="([^"#?]+)/g)) {
        const u = m[1]!;
        if (!u.startsWith(BASE)) {
          if (u.startsWith('/')) broken.push(`${path.relative(DIST, f)} -> ${u} (без base)`);
          continue;
        }
        let target = path.join(DIST, decodeURIComponent(u.slice(BASE.length)));
        if (u.endsWith('/')) target = path.join(target, 'index.html');
        if (!fs.existsSync(target)) broken.push(`${path.relative(DIST, f)} -> ${u}`);
      }
      for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
        for (const part of m[1]!.split(',')) {
          const u = part.trim().split(/\s+/)[0]!;
          if (!fs.existsSync(path.join(DIST, u.slice(BASE.length)))) broken.push(`${path.relative(DIST, f)} -> ${u}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  test('в разделе «Ремонтантные» только НСД, в остальных только КСД', () => {
    for (const [dir, type] of [['remontantnye', 'НСД'], ['rannie', 'КСД'], ['srednie', 'КСД'], ['pozdnie', 'КСД'], ['ultrarannie', 'КСД']] as const) {
      const html = fs.readFileSync(path.join(DIST, 'catalog', dir, 'index.html'), 'utf8');
      const tbody = html.slice(html.indexOf('<tbody'), html.indexOf('</table>'));
      const types = [...tbody.matchAll(/<span class="note"[^>]*>(КСД|НСД)<\/span>/g)].map((m) => m[1]);
      expect(types.length, dir).toBeGreaterThan(0);
      expect(new Set(types), dir).toEqual(new Set([type]));
    }
  });

  test('страница сорта несёт Product JSON-LD с ценой в BYN', () => {
    const html = fs.readFileSync(path.join(DIST, 'catalog/remontantnye/albion/index.html'), 'utf8');
    const m = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/);
    expect(m).not.toBeNull();
    const ld = JSON.parse(m![1]!);
    expect(ld['@type']).toBe('Product');
    expect(ld.offers.priceCurrency).toBe('BYN');
    expect(ld.offers.price).toBe('3.00');
  });
});
