(function(){
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