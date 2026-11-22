# Прототип сайта питомника клубники (klubnika-minsk.by)

Живой показ: https://sirmedved.github.io/klubnika-prototypes/variant2/

## Что где лежит

| Путь | Что это |
| --- | --- |
| `site/` | Актуальный сайт (вариант 2) на Astro. Публикуется в `/variant2/`. Из него же вырастет прод. |
| `site/src/data/sorts.yaml` | Каталог: 100 сортов, цены, наличие, категории. Главный файл контента. |
| `site/src/data/sort-details/<slug>.json` | Описания и характеристики сортов (пока для части сортов). |
| `site/src/assets/sorts/<slug>/` | Фото сортов. Источник каждого фото записан в JSON сорта. |
| `site/src/data/faq.ts` | Вопросы и ответы (главная и страница «Вопросы»). |
| `site/src/lib/site.ts` | Контакты, меню, условия доставки: шапка и футер берут их отсюда. |
| `site/tests/` | Playwright-тесты: каркас и ссылки всех страниц, каталог, полный путь заказа. |
| `*.html` в корне, `img/`, `fonts/` | Прототип-1 (минимализм, отклонён 2026-10-25). Архив, не развивать. |
| `analysis/` | Снапшоты Super Klubnika, выгрузка Тильды, сырые данные сортов. |
| `content-research/` | Сырьё сбора фото и описаний сортов (в git не входит). |

## Как работать

```sh
cd site
npm ci
npm run dev        # локально: http://localhost:4321/klubnika-prototypes/variant2/
npm run build      # сборка в site/dist
npx astro check    # типы
npx playwright test
node scripts/shots.mjs /tmp/shots   # скриншоты 3 ширин (нужен запущенный preview)
```

Пуш в `main` запускает `.github/workflows/pages.yml`: проверка типов, сборка, тесты, публикация.
Если тесты упали, сайт не обновляется.

## Правила

- Шапка, меню, левая колонка и футер живут только в `site/src/layouts/Layout.astro` и
  `site/src/components/`. Страница отдаёт лишь содержимое `<main>`.
- Палитра утверждена Владимиром (переменные в `site/src/styles/global.css`). Новые цвета согласовывать.
- Ссылки внутри сайта только через `url()` из `site/src/lib/site.ts`: сайт живёт не в корне домена.
- Статус и решения проекта: заметка в ваулте «Проект сайта питомника клубники (klubnika-minsk.by) - ТЗ и решения».
