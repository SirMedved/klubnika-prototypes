// Общие данные сайта: контакты, меню, адреса страниц. Единственный источник для шапки и футера.

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Ссылка внутри сайта с учётом base: url('catalog/') -> /klubnika-prototypes/variant2/catalog/ */
export const url = (path = ''): string => BASE + path.replace(/^\//, '');

export const CONTACTS = {
  orders: { phone: '+375 29 180 32 82', tel: '+375291803282', who: 'Рита', role: 'приём заказов' },
  consult: { phone: '+375 29 640 92 98', tel: '+375296409298', who: 'Владимир', role: 'консультация' },
  email: 'klubnika.minsk.v@gmail.com',
  instagram: 'https://www.instagram.com/klubnika_minsk/',
  telegram: 'https://t.me/klubnika_minsk',
  viber: 'viber://chat?number=%2B375291803282',
} as const;

export const DELIVERY = {
  minsk: { title: 'Минск, метро Каменная Горка', when: 'понедельник и четверг, 18:00-19:00', min: 75 },
  market: { title: 'Рынок в Дзержинске', when: 'пятница, суббота, воскресенье' },
  post: { title: 'Почта по Беларуси', when: 'отправляем по всей Беларуси', min: 75 },
} as const;

export const MIN_ORDER_BYN = 75;

export type NavId = 'home' | 'catalog' | 'order' | 'faq' | 'about' | 'cart';

export const NAV: readonly { id: NavId; label: string; path: string }[] = [
  { id: 'home', label: 'Главная', path: '' },
  { id: 'catalog', label: 'Каталог', path: 'catalog/' },
  { id: 'order', label: 'Доставка', path: 'order/' },
  { id: 'faq', label: 'Вопросы', path: 'faq/' },
  { id: 'about', label: 'О нас', path: 'about/' },
  { id: 'cart', label: 'Корзина', path: 'cart/' },
];

export const SITE_NAME = 'Клубника-Минск';
