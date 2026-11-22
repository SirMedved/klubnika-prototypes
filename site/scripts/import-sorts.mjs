// Одноразовый импорт: analysis/sorts.yaml (сырая выгрузка Тильды) + принадлежность к 5 таблицам
// Тильды (analysis/tilda-tables.json) -> src/data/sorts.yaml (канонический контент сайта).
// Категория берётся из таблицы, а не из старого variant2/sorts-data.js: там 2-я таблица КСД
// ошибочно размечена как ремонтантная.
// После импорта источник правды src/data/sorts.yaml; скрипт перезапускать не нужно.
// Запуск: node scripts/import-sorts.mjs <analysis/sorts.yaml> <analysis/tilda-tables.json>
import fs from 'node:fs';
import YAML from 'yaml';

const [rawPath, tablesPath] = process.argv.slice(2);
const raw = YAML.parse(fs.readFileSync(rawPath, 'utf8'));
const tables = JSON.parse(fs.readFileSync(tablesPath, 'utf8'));
// таблицы Тильды по порядку: КСД (ультра+ранние), КСД (ранние), средние, поздние, НСД
const rows = tables.flatMap((t, ti) => t.rows.map((r) => ({ ti, name: r.split(';')[0].replace(/\s*\(Новинка!?\)/i, '').trim(), term: t.header.includes('Срок') ? r.split(';')[1].trim() : '' })));
if (raw.length !== rows.length) throw new Error(`count mismatch ${raw.length} vs ${rows.length}`);
const categoryOf = ({ ti, term }) => {
  if (ti === 4) return 'rem';
  if (ti === 3) return 'late';
  if (ti === 2) return 'mid';
  return term === 'ультраранняя' ? 'ultra' : 'early';
};

const RENAME = { 'Санд Андреас': 'Сан-Андреас' }; // опечатки Тильды (ТЗ, план миграции п.4)
const TERM = { 'pанняя': 'ранняя', 'ср.-ранняя': 'средне-ранняя' }; // латинская p, сокращение
const SLUG = {
  'Альбион': 'albion', 'Сан-Андреас': 'san-andreas', 'Альба': 'alba', 'Клери': 'clery',
  'Азия': 'asia', 'Сирия': 'syria', 'Мальвина': 'malwina', 'Флорида Бриллианс': 'florida-brilliance',
  'Мурано': 'murano', 'Ирма': 'irma', 'Флёр': 'fler-ultra', 'Флер': 'fler',
};
const TR = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
const translit = (s) => s.toLowerCase().split('').map((c) => TR[c] ?? c).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const STATUS = { 'есть': 'available', 'на испытании': 'trial', 'отказались от выращивания': 'retired' };

const seen = new Set();
const out = raw.map((r, i) => {
  if (rows[i].name !== r.name) throw new Error(`order mismatch at ${i}: ${r.name} vs ${rows[i].name}`);
  const name = RENAME[r.name] ?? r.name;
  const slug = SLUG[name] ?? translit(name);
  if (seen.has(slug)) throw new Error(`duplicate slug ${slug}`);
  seen.add(slug);
  const rec = {
    name, slug,
    category: categoryOf(rows[i]),
    term: TERM[r.term] ?? r.term,
    type: rows[i].ti === 4 ? 'НСД' : 'КСД',
    price_byn: r.price_byn,
    price_rub: r.price_rub,
  };
  if (STATUS[r.status]) rec.status = STATUS[r.status];
  else { rec.status = 'season'; rec.season = r.status; } // напр. «август»
  if (r.novelty) rec.novelty = true;
  return rec;
});

const header = `# Сорта питомника: канонический контент сайта (импорт из выгрузки Тильды 2026-11-01).
# Правится руками или из админки. Поля:
#   category: ultra | early | mid | late | rem   (5 разделов каталога)
#   status:   available (есть) | trial (на испытании) | season (появится, см. season) | retired (не выращиваем)
#   novelty:  true, если новинка
`;
fs.writeFileSync('src/data/sorts.yaml', header + YAML.stringify(out, { lineWidth: 0 }));
console.log('sorts:', out.length, 'by category:', JSON.stringify(out.reduce((a, s) => (a[s.category] = (a[s.category] || 0) + 1, a), {})));
