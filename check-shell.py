#!/usr/bin/env python3
"""Проверка: shell (mhead..navribbon, footer..scripts) идентичен на всех страницах variant2.
Запуск: python3 check-shell.py (из корня репо)."""
import pathlib, re, sys
D = pathlib.Path('variant2')
def shell(f):
    s = (D/f).read_text(encoding='utf-8')
    i = s.index('<header class="mhead">')
    m = re.search(r'</nav>\s*</div>', s[i:])
    j = i + m.end()
    k = s.index('<footer class="site">')
    l = s.index('</body>')
    return s[i:j] + s[k:l].replace(' class="on"', '')
pages = ['index.html','catalog.html','cart.html','order.html','faq.html','about.html','sort.html']
base = shell(pages[0])
bad = [f for f in pages[1:] if shell(f) != base]
if bad:
    print('ШЭЛЛ РАЗЛИЧАЕТСЯ на:', ', '.join(bad)); sys.exit(1)
print('OK: shell идентичен на', len(pages), 'страницах')
