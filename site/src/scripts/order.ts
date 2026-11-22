// Текст заявки: чистая функция, без DOM. Номер заказа: последние 4 цифры телефона (решение родителей).
import { fmt, total, type CartItem } from './cart';

export type Delivery = 'minsk' | 'market' | 'post';

export interface OrderInput {
  items: readonly CartItem[];
  name: string;
  phone: string;
  delivery: Delivery;
  day?: string;
  address?: string;
  comment?: string;
  consult: boolean;
}

const DELIVERY_LABEL: Record<Delivery, string> = {
  minsk: 'Минск, метро Каменная Горка',
  market: 'рынок в Дзержинске',
  post: 'почта по Беларуси',
};

export function buildOrder(o: OrderInput): { number: string; text: string } {
  const number = o.phone.replace(/\D/g, '').slice(-4);
  const lines = [
    `Заказ №${number}`,
    `Имя: ${o.name}`,
    `Телефон: ${o.phone}`,
    `Получение: ${DELIVERY_LABEL[o.delivery]}${o.day ? `, ${o.day}` : ''}`,
  ];
  if (o.address) lines.push(`Адрес: ${o.address}`);
  lines.push('', 'Сорта:');
  o.items.forEach((i, k) => lines.push(`${k + 1}. ${i.name}: ${i.qty} шт × ${fmt(i.price)} = ${fmt(i.qty * i.price)} руб`));
  lines.push('', `Всего: ${o.items.reduce((s, i) => s + i.qty, 0)} шт на ${fmt(total([...o.items]))} руб`);
  if (o.comment) lines.push(`Комментарий: ${o.comment}`);
  if (o.consult) lines.push('Нужна консультация');
  return { number, text: lines.join('\n') };
}
