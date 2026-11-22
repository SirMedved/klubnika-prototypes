// Сценарии покупателя в браузере (десктоп и телефон).
import { test, expect, type Page } from '@playwright/test';

const KEY_PAGES = ['', 'catalog/', 'catalog/rannie/', 'catalog/remontantnye/albion/', 'cart/', 'order/', 'faq/', 'about/'];

const openMenuIfMobile = async (page: Page) => {
  const burger = page.locator('.burger');
  if (await burger.isVisible()) await burger.click();
};

test('ключевые страницы открываются без ошибок в консоли', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  for (const p of KEY_PAGES) {
    const res = await page.goto(p);
    expect(res?.status(), p).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('меню ведёт на все разделы', async ({ page }) => {
  await page.goto('');
  for (const label of ['Каталог', 'Доставка', 'Вопросы', 'О нас', 'Корзина']) {
    await openMenuIfMobile(page);
    await page.locator('nav.main a', { hasText: label }).click();
    await expect(page.locator('nav.main a[aria-current="page"]')).toContainText(label);
  }
});

test('каталог: поиск, фильтр наличия, переключение вида', async ({ page }) => {
  await page.goto('catalog/');
  const rows = page.locator('[data-pane="table"] tr[data-item]:visible');
  const all = await rows.count();
  expect(all).toBe(100);
  await page.getByRole('button', { name: 'Только в наличии' }).click();
  const avail = await rows.count();
  expect(avail).toBeLessThan(all);
  expect(avail).toBeGreaterThan(50);
  await page.getByLabel('Поиск сорта').fill('альб');
  await expect(rows).toHaveCount(2); // Альба, Альбион
  await page.getByRole('button', { name: 'Плитки' }).click();
  await expect(page.locator('[data-pane="tiles"] .pcard:visible')).toHaveCount(2);
  await page.getByLabel('Поиск сорта').fill('несуществующий');
  await expect(page.locator('[data-empty]')).toBeVisible();
});

test('заказ: от каталога до текста заявки', async ({ page }) => {
  await page.goto('catalog/remontantnye/albion/');
  await page.getByLabel('Количество').fill('20');
  await page.getByRole('button', { name: 'Добавить в корзину' }).click();
  await expect(page.locator('#toast')).toContainText('Альбион, 20 шт');
  await page.goto('catalog/ultrarannie/');
  await page.locator('tr', { hasText: 'Альба' }).getByRole('button', { name: 'В корзину' }).click();
  await expect(page.locator('[data-cart-count]').first()).toHaveText('21');

  await page.goto('cart/');
  await expect(page.locator('.cart-row')).toHaveCount(2);
  await expect(page.locator('#cartTotal')).toHaveText('62,50');
  await expect(page.locator('#minWarn')).toBeVisible();
  await page.locator('.cart-row', { hasText: 'Альба' }).getByRole('button', { name: 'Больше' }).click();
  await page.locator('.cart-row', { hasText: 'Альба' }).getByRole('button', { name: 'Больше' }).click();
  await page.locator('.cart-row', { hasText: 'Альба' }).getByRole('button', { name: 'Больше' }).click();
  await page.locator('.cart-row', { hasText: 'Альба' }).getByRole('button', { name: 'Больше' }).click();
  await page.locator('.cart-row', { hasText: 'Альба' }).getByRole('button', { name: 'Больше' }).click();
  await expect(page.locator('#cartTotal')).toHaveText('75,00');
  await expect(page.locator('#minWarn')).toBeHidden();

  await page.getByRole('button', { name: 'Сформировать текст заявки' }).click();
  await expect(page.locator('#fName')).toBeFocused();
  await page.getByLabel('Имя').fill('Ольга');
  await page.getByLabel('Телефон').fill('+375 29 111-45-67');
  await page.locator('#orderForm').getByText('Почта по Беларуси').click();
  await page.getByLabel('Город, посёлок').fill('Борисов');
  await page.getByRole('button', { name: 'Сформировать текст заявки' }).click();

  await expect(page.locator('#orderNum')).toHaveText('Ваш номер заказа: №4567');
  const text = await page.locator('#orderText').inputValue();
  expect(text).toContain('Заказ №4567');
  expect(text).toContain('Получение: почта по Беларуси');
  expect(text).toContain('Адрес: Борисов');
  expect(text).toContain('Альбион: 20 шт × 3,00 = 60,00 руб');
  expect(text).toContain('Альба: 6 шт × 2,50 = 15,00 руб');
  expect(text).toContain('Всего: 26 шт на 75,00 руб');

  await page.locator('.cart-row', { hasText: 'Альба' }).getByRole('button', { name: 'Убрать из корзины' }).click();
  await expect(page.locator('.cart-row')).toHaveCount(1);
  await expect(page.locator('#orderResult')).toBeHidden();
});

test('не продающийся сорт нельзя положить в корзину', async ({ page }) => {
  await page.goto('catalog/remontantnye/');
  const row = page.locator('tr[data-item]', { hasText: 'Ания' });
  await expect(row.getByRole('button', { name: 'Нет в продаже' })).toBeDisabled();
});

test('пустая корзина подсказывает путь в каталог', async ({ page }) => {
  await page.goto('cart/');
  await expect(page.locator('[data-cart-empty]')).toBeVisible();
  await expect(page.locator('[data-cart-full]')).toBeHidden();
});
