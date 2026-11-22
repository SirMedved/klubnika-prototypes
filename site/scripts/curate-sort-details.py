# Одноразовый перенос исследования 2026-11-22. Дальше JSON сортов правятся руками.
# Запуск из корня репо: python3 site/scripts/curate-sort-details.py content-research site
# content-research/<slug>/meta.json + фото -> site/src/data/sort-details/<slug>.json + site/src/assets/sorts/<slug>/
import json, pathlib, sys
from PIL import Image
SRC = pathlib.Path(sys.argv[1]); SITE = pathlib.Path(sys.argv[2])
ORDER = {'alba':[3,2,1,4],'albion':[1],'asia':[1,3,2,4],'clery':[2,1,3],'florida-brilliance':[1,2],
         'malwina':[1],'murano':[3,2,1,4],'san-andreas':[1],'syria':[1,2,3],'irma':[]}
# Правки по ТЗ: описания только позитивные (слово папы), без промышленных урожаев и болезней.
OVR = {
 'alba': {'description_ru':'Альба одной из первых открывает клубничный сезон. Ягоды очень крупные, вытянутые, ярко-красные и плотные, и к концу сбора почти не мельчают. Сорт хорошо переносит континентальную зиму и подходит и для открытой грядки, и для теплицы.',
          'taste':'Приятный, сбалансированный.',
          'plant':'Куст средней силы роста, полупрямостоячий. Любит климат с холодной зимой и хорошо дренированные высокие гряды.'},
 'albion': {'berry':'Длинноконическая, тёмно-красная, ровно окрашенная, очень плотная; в среднем около 30 г.',
            'yield':'Высокая: урожай идёт волнами весь сезон, без резкого пика.',
            'plant':'Куст прямостоячий, открытый, ягоды легко собирать. Устойчив к вертициллёзу и фитофторозу корневой шейки.'},
 'asia': {'description_ru':'Азию легко узнать по крупным вытянутым ягодам насыщенного красного цвета с сильным блеском. Вкус отличный, урожай высокий. Сорт хорошо приспособлен к климату с холодной зимой, а ягода хороша и для себя, и на продажу.',
          'plant':'Куст умеренной силы роста. Хорошо приспособлен к климату с холодной зимой: от Центральной до Восточной Европы.'},
 'clery': {'berry':'Правильная коническая, блестящая карминово-красная, кожица прочная; масса по разным источникам от 21 до 35 г.'},
 'florida-brilliance': {'description_ru':'Флорида Бриллианс получила название за глянцевые ягоды, которые буквально блестят на солнце. Ягоды ровные, конические, плотные и сочные, хорошо хранятся после сбора. Сорт рано начинает плодоносить и щедро отдаёт первый урожай, а длинные плодоножки делают сбор удобным.',
          'ripening':'Ранний старт плодоношения, высокий первый урожай.',
          'taste':'Сочная, сладкая, с невысокой кислотностью.',
          'yield':'Высокий ранний урожай (данные Университета Флориды).',
          'plant':'Куст открытый и крепкий, плодоножки длинные, ягоды легко собирать. Хорошо переносит жару.'},
 'malwina': {'ripening':'Очень поздняя: продлевает сезон, когда остальные сорта уже отошли.',
             'plant':'Куст очень сильнорослый, 30-40 см. Зимостойкий, устойчив к вертициллёзу и корневым гнилям; ягоды не трескаются от дождя и не обгорают на солнце.'},
 'san-andreas': {'berry':'Конической симметричной формы, красная, плотная; в среднем около 30 г.',
                 'yield':'Высокая: урожай волнами с начала лета до осени.',
                 'plant':'Куст сильный, мощнее родственных сортов. Хорошо противостоит распространённым болезням листьев и корней.'},
 'syria': {'plant':'Куст сильнорослый, хорошо чувствует себя в климате с холодной зимой.', 'yield': None},
}
KEEP = ['name_orig','breeder','origin_country','year','ripening','berry','taste','yield','plant','description_ru']
for slug, order in ORDER.items():
    m = json.loads((SRC/slug/'meta.json').read_text())
    o = OVR.get(slug, {})
    out = {k: o.get(k, m.get(k)) for k in KEEP}
    out = {k: v for k, v in out.items() if v not in (None, '')}
    byfile = {p['file']: p for p in m.get('photos', [])}
    photos = []
    dst = SITE/'src/assets/sorts'/slug; dst.mkdir(parents=True, exist_ok=True)
    for n in order:
        p = byfile[f'{n}.jpg']
        im = Image.open(SRC/slug/f'{n}.jpg').convert('RGB'); im.thumbnail((1600,1600))
        im.save(dst/f'{n}.jpg', quality=86)
        photos.append({k: p[k] for k in ('file','credit','source_page','what','license') if p.get(k)})
    out['photos'] = photos
    out['facts_sources'] = m.get('facts_sources', [])
    (SITE/'src/data/sort-details'/f'{slug}.json').parent.mkdir(parents=True, exist_ok=True)
    (SITE/'src/data/sort-details'/f'{slug}.json').write_text(json.dumps(out, ensure_ascii=False, indent=2)+'\n')
    print(slug, len(photos))
