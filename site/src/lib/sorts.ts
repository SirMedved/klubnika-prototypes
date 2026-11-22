// Каталог сортов: чтение и проверка src/data/sorts.yaml на сборке.
// Данные проверяются здесь, на границе; дальше по коду типы считаются надёжными.
import YAML from 'yaml';
import raw from '../data/sorts.yaml?raw';
import type { ImageMetadata } from 'astro';

export const CATEGORY_IDS = ['ultra', 'early', 'mid', 'late', 'rem'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Category {
  id: CategoryId;
  /** часть URL: /catalog/<path>/ */
  path: string;
  /** «Ультрараннего срока созревания» (подпись кнопки левой колонки) */
  long: string;
  /** «Ультраранние» (фильтр, хлебные крошки) */
  short: string;
  /** заголовок страницы раздела */
  title: string;
}

export const CATEGORIES: readonly Category[] = [
  { id: 'ultra', path: 'ultrarannie', long: 'Ультрараннего срока созревания', short: 'Ультраранние', title: 'Ультраранние сорта клубники' },
  { id: 'early', path: 'rannie', long: 'Раннего срока созревания', short: 'Ранние', title: 'Ранние сорта клубники' },
  { id: 'mid', path: 'srednie', long: 'Среднего срока созревания', short: 'Средние', title: 'Средние сорта клубники' },
  { id: 'late', path: 'pozdnie', long: 'Позднего срока созревания', short: 'Поздние', title: 'Поздние сорта клубники' },
  { id: 'rem', path: 'remontantnye', long: 'Ремонтантная', short: 'Ремонтантные', title: 'Ремонтантные сорта клубники' },
];

export const categoryById = (id: CategoryId): Category => {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) throw new Error(`unknown category ${id}`);
  return c;
};

const STATUS_IDS = ['available', 'trial', 'season', 'retired'] as const;
export type StatusId = (typeof STATUS_IDS)[number];

export interface Sort {
  name: string;
  slug: string;
  category: CategoryId;
  /** срок созревания словами, как у родителей: «средне-ранняя» */
  term: string;
  type: 'КСД' | 'НСД';
  priceByn: number;
  priceRub: number;
  status: StatusId;
  /** для status = season: когда появится («август») */
  season?: string;
  novelty: boolean;
}

function parseSort(r: Record<string, unknown>, i: number): Sort {
  const fail = (f: string) => { throw new Error(`sorts.yaml #${i} (${String(r.name)}): bad ${f}`); };
  if (typeof r.name !== 'string' || !r.name) fail('name');
  if (typeof r.slug !== 'string' || !/^[a-z0-9-]+$/.test(r.slug)) fail('slug');
  if (!CATEGORY_IDS.includes(r.category as CategoryId)) fail('category');
  if (r.type !== 'КСД' && r.type !== 'НСД') fail('type');
  if (typeof r.price_byn !== 'number' || typeof r.price_rub !== 'number') fail('price');
  if (!STATUS_IDS.includes(r.status as StatusId)) fail('status');
  if (r.status === 'season' && typeof r.season !== 'string') fail('season');
  return {
    name: r.name as string,
    slug: r.slug as string,
    category: r.category as CategoryId,
    term: String(r.term ?? ''),
    type: r.type as Sort['type'],
    priceByn: r.price_byn as number,
    priceRub: r.price_rub as number,
    status: r.status as StatusId,
    season: r.season as string | undefined,
    novelty: r.novelty === true,
  };
}

export const SORTS: readonly Sort[] = (() => {
  const list = (YAML.parse(raw) as Record<string, unknown>[]).map(parseSort);
  const slugs = new Set<string>();
  for (const s of list) {
    if (slugs.has(s.slug)) throw new Error(`duplicate slug ${s.slug}`);
    slugs.add(s.slug);
  }
  return list;
})();

export const sortBySlug = (slug: string): Sort => {
  const s = SORTS.find((x) => x.slug === slug);
  if (!s) throw new Error(`unknown sort ${slug}`);
  return s;
};

export const isOrderable = (s: Sort): boolean => s.status === 'available';

export const statusLabel = (s: Sort): string => {
  switch (s.status) {
    case 'available': return 'в наличии';
    case 'trial': return 'на испытании';
    case 'season': return `появится: ${s.season}`;
    case 'retired': return 'не выращиваем';
  }
};

export const typeLabel = (s: Sort): string =>
  s.type === 'НСД' ? 'ремонтантный (НСД)' : 'однократного плодоношения (КСД)';

export const fmtPrice = (n: number): string => n.toFixed(2).replace('.', ',');

// ---------- описания и фото сортов (есть не у всех) ----------

export interface SortPhoto {
  src: ImageMetadata;
  alt: string;
  credit?: string;
  sourcePage?: string;
}

export interface SortDetails {
  nameOrig?: string;
  breeder?: string;
  origin?: string;
  year?: number;
  ripening?: string;
  berry?: string;
  taste?: string;
  yield?: string;
  plant?: string;
  description: string;
  photos: SortPhoto[];
}

interface DetailsJson {
  name_orig?: string;
  breeder?: string;
  origin_country?: string;
  year?: number;
  ripening?: string;
  berry?: string;
  taste?: string;
  yield?: string;
  plant?: string;
  description_ru: string;
  photos?: { file: string; credit?: string; source_page?: string; what?: string }[];
}

const detailFiles = import.meta.glob<DetailsJson>('../data/sort-details/*.json', { eager: true, import: 'default' });
const photoFiles = import.meta.glob<ImageMetadata>('../assets/sorts/*/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

export const detailsFor = (s: Sort): SortDetails | undefined => {
  const d = detailFiles[`../data/sort-details/${s.slug}.json`];
  if (!d) return undefined;
  const photos: SortPhoto[] = [];
  for (const p of d.photos ?? []) {
    const src = photoFiles[`../assets/sorts/${s.slug}/${p.file}`];
    if (!src) throw new Error(`sort-details/${s.slug}.json: missing photo ${p.file}`);
    photos.push({ src, alt: `Клубника ${s.name}${p.what ? `: ${p.what}` : ''}`, credit: p.credit, sourcePage: p.source_page });
  }
  return {
    nameOrig: d.name_orig, breeder: d.breeder, origin: d.origin_country, year: d.year,
    ripening: d.ripening, berry: d.berry, taste: d.taste, yield: d.yield, plant: d.plant,
    description: d.description_ru, photos,
  };
};

/** Рекомендуемые сорта главной: порядок задаёт питомник. */
export const FEATURED_SLUGS = ['alba', 'clery', 'asia', 'malwina', 'albion', 'san-andreas'] as const;
