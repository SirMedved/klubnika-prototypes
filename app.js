(function(){
  // Единый блок «Что обсуждаем» для всех страниц
  var QA_HTML='<div class="wrap"><h2>Что обсуждаем</h2><ol>'+
    '<li><b>Главная:</b> листай сверху вниз: шаги для новичков, популярные сорта, сезонная полоса, счётчики, тизеры. Что зашло, что лишнее, чего не хватает?</li>'+
    '<li><b>Каталог:</b> там переключатель «Плитки с фото» и «Прайс-таблица», потыкай оба. Какой вид главный? Категории сверху удобны? Хватает ли колонок прайса (сорт, категория, тип, цена, статус)?</li>'+
    '<li><b>Карточка сорта:</b> фото, таблица характеристик, цена, кнопка заказа. Каких характеристик не хватает? Что покупатели чаще всего спрашивают про сорт по телефону?</li>'+
    '<li><b>Вопросы (ЗКС):</b> понятно ли объяснение про стаканчик? Какие ещё вопросы покупатели задают постоянно, чтобы положить ответы на сайт? Формулировки ответов согласуем с папой.</li>'+
    '<li><b>О нас:</b> рассказ с фото (плантация, коробки, рынок). Что дополнить своими снимками? Дожинки: нужны фото и видео.</li>'+
    '<li><b>Как заказать:</b> схема «корзина даёт готовый текст заявки и номер заказа, отправляете нам в Telegram/Viber». Понятно ли? Что просить в заявке (какие поля)? Нужна ли страница об оплате?</li>'+
    '<li><b>Общее:</b> навигация и названия вкладок понятны? Шрифт читается легко? Цены видны хорошо? Чего не хватает и что убрать?</li>'+
    '</ol><p class="hint">Все фото настоящие, с текущего сайта. Сорта и характеристики: заглушки, реальный список приедет с Тильды. Цены реальные: 2,5 руб КСД / 3 руб НСД. Список вопросов вверху каждой страницы, отвечать можно по номерам.</p></div>';
  var qa=document.getElementById('qa');
  if(qa&&!qa.innerHTML.trim()){qa.innerHTML=QA_HTML;}
  // «Что обсуждаем»
  var t=document.getElementById('qaToggle');
  if(t){t.addEventListener('click',function(){document.getElementById('qa').classList.toggle('hidden');});}
  // Подсветка активного пункта навигации
  var page=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav nav a').forEach(function(a){
    var href=a.getAttribute('href').split('?')[0];
    if(href===page){a.classList.add('on');}
  });
  // Переключатель вида каталога (?view=tiles|table)
  var params=new URLSearchParams(location.search);
  var view=params.get('view')||'tiles';
  var tiles=document.getElementById('view-tiles'), table=document.getElementById('view-table');
  if(tiles&&table){
    function setView(v){
      view=v;
      tiles.classList.toggle('on',v==='tiles');
      table.classList.toggle('on',v==='table');
      document.querySelectorAll('[data-view]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-view')===v);});
      params.set('view',v);
      history.replaceState(null,'',location.pathname+'?'+params.toString());
    }
    document.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){setView(b.getAttribute('data-view'));});});
    setView(view);
  }
  // Категории: реальный фильтр по data-cat
  document.querySelectorAll('.cats .cat').forEach(function(c){
    c.addEventListener('click',function(){
      document.querySelectorAll('.cats .cat').forEach(function(x){x.classList.remove('on');});
      c.classList.add('on');
      var v=c.getAttribute('data-cat')||'all';
      document.querySelectorAll('[data-cat-item]').forEach(function(el){
        el.classList.toggle('hidden', v!=='all' && el.getAttribute('data-cat-item')!==v);
      });
    });
  });
})();