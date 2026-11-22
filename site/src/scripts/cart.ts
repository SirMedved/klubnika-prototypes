// Корзина: хранится в localStorage браузера покупателя, сервер не нужен.
// Данные из localStorage считаются внешними и проверяются при чтении.

export interface CartItem {
  slug: string;
  name: string;
  /** адрес страницы сорта */
  href: string;
  type: string;
  price: number;
  qty: number;
}

const KEY = 'km-cart-v2';
const listeners = new Set<() => void>();

function isCartItem(x: unknown): x is CartItem {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.slug === 'string' && typeof o.name === 'string' && typeof o.href === 'string' && typeof o.type === 'string'
    && typeof o.price === 'number' && Number.isFinite(o.price)
    && typeof o.qty === 'number' && Number.isInteger(o.qty) && o.qty > 0;
}

export function getCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* приватный режим: корзина живёт до перезагрузки */ }
  listeners.forEach((fn) => fn());
}

export const onCartChange = (fn: () => void): void => { listeners.add(fn); };

export function add(item: Omit<CartItem, 'qty'>, qty = 1): void {
  const items = getCart();
  const found = items.find((i) => i.slug === item.slug);
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  save(items);
}

export function setQty(slug: string, qty: number): void {
  const items = getCart();
  const next = qty < 1 ? items.filter((i) => i.slug !== slug) : items.map((i) => (i.slug === slug ? { ...i, qty } : i));
  save(next);
}

export const remove = (slug: string): void => setQty(slug, 0);
export const clear = (): void => save([]);

export const count = (items = getCart()): number => items.reduce((s, i) => s + i.qty, 0);
export const total = (items = getCart()): number => items.reduce((s, i) => s + i.qty * i.price, 0);
export const qtyOf = (slug: string, items = getCart()): number => items.find((i) => i.slug === slug)?.qty ?? 0;

export const fmt = (n: number): string => n.toFixed(2).replace('.', ',');

// синхронизация между вкладками
window.addEventListener('storage', (e) => { if (e.key === KEY) listeners.forEach((fn) => fn()); });
