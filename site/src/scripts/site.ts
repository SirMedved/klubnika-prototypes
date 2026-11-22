// Общее поведение всех страниц: меню, бейдж корзины, кнопки «В корзину», матрица ягод.
import { add, count, getCart, onCartChange, qtyOf } from './cart';

// ---------- бургер ----------
const burger = document.querySelector<HTMLButtonElement>('.burger');
const nav = document.getElementById('mainnav');
burger?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  burger.setAttribute('aria-expanded', String(open));
});

// ---------- бейдж корзины и «в корзине: N шт» ----------
function renderCartMarks(): void {
  const items = getCart();
  const n = count(items);
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll<HTMLElement>('[data-incart-for]').forEach((el) => {
    const q = qtyOf(el.dataset.incartFor ?? '', items);
    el.textContent = q ? `в корзине: ${q} шт` : '';
  });
}
onCartChange(renderCartMarks);
renderCartMarks();

// ---------- всплывашка «добавлено» ----------
let toastTimer = 0;
function toast(text: string): void {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:20;background:#1C1B1A;color:#fff;padding:12px 18px;border-radius:10px;font-size:16px;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:calc(100% - 24px)';
    document.body.append(el);
  }
  const cartHref = document.querySelector<HTMLAnchorElement>('nav.main a[href$="cart/"]')?.href ?? '#';
  el.innerHTML = '';
  el.append(document.createTextNode(text + ' '));
  const a = document.createElement('a');
  a.href = cartHref;
  a.textContent = 'Перейти в корзину';
  a.style.cssText = 'color:#E8F04D;font-weight:600';
  el.append(a);
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { if (el) el.hidden = true; }, 3500);
}

// ---------- кнопки «В корзину» ----------
document.addEventListener('click', (e) => {
  const btn = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-add]') : null;
  if (!btn) return;
  e.preventDefault();
  const { slug, name, type, price, href, qtyFrom } = btn.dataset;
  if (!slug || !name || !type || !price || !href) return;
  const qtyInput = qtyFrom ? document.getElementById(qtyFrom) : null;
  const qty = qtyInput instanceof HTMLInputElement ? Math.max(1, Math.floor(Number(qtyInput.value) || 1)) : 1;
  add({ slug, name, type, href, price: Number(price) }, qty);
  toast(`Добавлено: ${name}, ${qty} шт.`);
});

// ---------- матрица падающих ягод ----------
// Прототип: системная настройка «уменьшить движение» сознательно игнорируется (решение Владимира).
// TODO прод: уважать prefers-reduced-motion.
function berryField(): void {
  const c = document.getElementById('berryField');
  if (!(c instanceof HTMLCanvasElement)) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const mobile = window.matchMedia('(max-width:700px)').matches;
  const img = new Image();
  img.src = c.dataset.sprite ?? '';
  const COUNT = mobile ? 14 : 34;
  const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 2);
  let W = 0; let H = 0; let raf = 0; let last = 0;
  interface Berry { x: number; y: number; s: number; v: number; r: number; vr: number; sway: number }
  const make = (init: boolean): Berry => ({
    x: Math.random() * W, y: init ? Math.random() * H : -40,
    s: mobile ? 14 + Math.random() * 14 : 26 + Math.random() * 30,
    v: 12 + Math.random() * 22, r: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.8, sway: Math.random() * Math.PI * 2,
  });
  const resize = () => {
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * DPR; c.height = H * DPR; c.style.width = `${W}px`; c.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  resize();
  const berries = Array.from({ length: COUNT }, () => make(true));
  const loop = (t: number) => {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    ctx.clearRect(0, 0, W, H);
    berries.forEach((b, i) => {
      b.y += b.v * dt; b.sway += dt * 0.7; b.x += Math.sin(b.sway) * 0.3; b.r += b.vr * dt;
      if (b.y > H + 50) berries[i] = make(false);
      if (img.complete && img.naturalWidth) {
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.drawImage(img, -b.s / 2, -b.s / 2, b.s, b.s); ctx.restore();
      }
    });
    raf = requestAnimationFrame(loop);
  };
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = 0; raf = requestAnimationFrame(loop); }
  });
  raf = requestAnimationFrame(loop);
}
berryField();
