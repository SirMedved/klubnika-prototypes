(function(){
  // ---------- Единый блок «Что обсуждаем» ----------
  var QA_HTML='<div class="wrap"><h2>Что обсуждаем</h2><ol>'+
    '<li><b>Главная:</b> листай сверху вниз: шаги для новичков, популярные сорта, сезонная полоса, счётчики, тизеры. Что зашло, что лишнее, чего не хватает?</li>'+
    '<li><b>Каталог:</b> переключатель «Плитки с фото» и «Прайс-таблица», потыкай оба. Какой вид главный? Категории и фильтр «в наличии» сверху удобны? Хватает ли колонок прайса?</li>'+
    '<li><b>Корзина и заказ:</b> потыкай весь путь: добавить сорта, выбрать где получить (Минск Каменка / рынок Дзержинск / почта), поля, галка консультации, текст заявки. Понятно ли? Что в тексте заявки лишнее или не хватает?</li>'+
    '<li><b>Минимум 75 руб:</b> касается только почты или и Минска, и рынка? Покажем это везде, где человек оформляет заказ.</li>'+
    '<li><b>Карточка сорта:</b> каких характеристик не хватает? Что покупатели чаще всего спрашивают про сорт по телефону?</li>'+
    '<li><b>Вопросы (ЗКС):</b> понятно ли объяснение про стаканчик? Какие ещё вопросы покупатели задают постоянно? Формулировки ответов согласуем с папой.</li>'+
    '<li><b>О нас:</b> что дополнить своими снимками? Дожинки: нужны фото и видео.</li>'+
    '<li><b>Общее:</b> навигация и названия вкладок понятны? Шрифт читается легко? Цены видны хорошо? Чего не хватает и что убрать?</li>'+
    '</ol><p class="hint">Все фото настоящие, с текущего сайта. Сорта и характеристики: заглушки, реальный список приедет с Тильды. Цены реальные: 2,5 руб КСД / 3 руб НСД. Панель открыта на каждой странице, отвечать можно по номерам.</p></div>';
  var qa=document.getElementById('qa');
  if(qa&&!qa.innerHTML.trim()){qa.innerHTML=QA_HTML;}
  var t=document.getElementById('qaToggle');
  if(t){t.addEventListener('click',function(){document.getElementById('qa').classList.toggle('hidden');});}

  // ---------- Навигация: активная страница ----------
  var page=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav nav a').forEach(function(a){
    var href=a.getAttribute('href').split('?')[0];
    if(href===page){a.classList.add('on');}
  });

  // ---------- Корзина (персистентна на сессию, sessionStorage) ----------
  var CART_KEY='km-cart';
  function getCart(){try{return JSON.parse(sessionStorage.getItem(CART_KEY))||[];}catch(e){return[];}}
  function setCart(c){sessionStorage.setItem(CART_KEY,JSON.stringify(c));updateCartCount();}
  function cartCount(){return getCart().reduce(function(s,i){return s+i.qty;},0);}
  function updateCartCount(){
    var n=cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(function(el){el.textContent=n;});
  }
  function addToCart(name,type,price,btn){
    var c=getCart();
    var it=null;for(var i=0;i<c.length;i++){if(c[i].name===name){it=c[i];break;}}
    if(it){it.qty++;}else{c.push({name:name,type:type,price:price,qty:1});}
    setCart(c);
    if(btn){
      var old=btn.textContent;btn.textContent='Добавлено ✓';btn.disabled=true;
      setTimeout(function(){btn.textContent=old;btn.disabled=false;},900);
    }
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-add]');
    if(b){addToCart(b.getAttribute('data-add'),b.getAttribute('data-type'),parseFloat(b.getAttribute('data-price')),b);}
  });
  updateCartCount();

  // ---------- Каталог: вид (плитки/прайс) ----------
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

  // ---------- Каталог: фильтры (категория + только в наличии) ----------
  var catFilter='all', availOnly=false;
  function applyFilters(){
    document.querySelectorAll('[data-cat-item]').forEach(function(el){
      var okCat=catFilter==='all'||el.getAttribute('data-cat-item')===catFilter;
      var okAvail=!availOnly||el.getAttribute('data-avail')==='yes';
      el.classList.toggle('hidden',!(okCat&&okAvail));
    });
  }
  document.querySelectorAll('.cats .cat[data-cat]').forEach(function(c){
    c.addEventListener('click',function(){
      document.querySelectorAll('.cats .cat[data-cat]').forEach(function(x){x.classList.remove('on');});
      c.classList.add('on');
      catFilter=c.getAttribute('data-cat');
      applyFilters();
    });
  });
  var availBtn=document.getElementById('availFilter');
  if(availBtn){
    availBtn.addEventListener('click',function(){
      availOnly=!availOnly;
      availBtn.classList.toggle('on',availOnly);
      applyFilters();
    });
  }

  // ---------- Страница корзины ----------
  var listEl=document.getElementById('cart-items');
  if(listEl){renderCart();}
  function renderCart(){
    var cart=getCart();
    var total=0;cart.forEach(function(i){total+=i.price*i.qty;});
    var totalEl=document.getElementById('cart-total');
    if(totalEl){totalEl.textContent=fmt(total)+' руб';}
    if(!cart.length){
      listEl.innerHTML='<p class="note">Корзина пуста. Сорта добавляются с <a href="catalog.html">страницы каталога</a> или карточки сорта.</p>';
      var form=document.getElementById('order-form');if(form){form.style.display='none';}
      return;
    }
    var html='';
    cart.forEach(function(i,idx){
      total+=0;
      html+='<div class="crow" data-idx="'+idx+'">'+
        '<div class="cname"><b>'+i.name+'</b> <span class="badge">'+i.type+'</span></div>'+
        '<div class="cprice">'+fmt(i.price)+' руб</div>'+
        '<div class="cqty"><button class="qbtn" data-dec="'+idx+'">−</button><span>'+i.qty+'</span><button class="qbtn" data-inc="'+idx+'">+</button></div>'+
        '<div class="csum">'+fmt(i.price*i.qty)+' руб</div>'+
        '<button class="qbtn del" data-del="'+idx+'" title="убрать">×</button>'+
        '</div>';
    });
    listEl.innerHTML=html;
  }
  function fmt(n){return n.toFixed(2).replace('.',',');}
  document.addEventListener('click',function(e){
    if(!listEl){return;}
    var inc=e.target.closest('[data-inc]'),dec=e.target.closest('[data-dec]'),del=e.target.closest('[data-del]');
    var c=getCart();
    if(inc){c[+inc.getAttribute('data-inc')].qty++;setCart(c);renderCart();}
    if(dec){var i2=+dec.getAttribute('data-dec');c[i2].qty--;if(c[i2].qty<1){c.splice(i2,1);}setCart(c);renderCart();}
    if(del){c.splice(+del.getAttribute('data-del'),1);setCart(c);renderCart();}
  });
  var clearBtn=document.getElementById('cart-clear');
  if(clearBtn){clearBtn.addEventListener('click',function(){setCart([]);renderCart();});}

  // ---------- Способ получения: разные поля ----------
  var del=document.querySelectorAll('input[name="delivery"]');
  function syncDelivery(){
    var v='minsk';
    del.forEach(function(r){if(r.checked){v=r.value;}});
    document.querySelectorAll('[data-delivery]').forEach(function(el){
      el.classList.toggle('hidden',el.getAttribute('data-delivery')!==v);
    });
    document.querySelectorAll('.deliv label').forEach(function(l){
      var r=l.querySelector('input');
      l.classList.toggle('on',r&&r.checked);
    });
    var warn=document.getElementById('min-warn');
    if(warn){warn.classList.toggle('hidden',v!=='post');}
  }
  del.forEach(function(r){r.addEventListener('change',syncDelivery);});
  if(del.length){syncDelivery();}

  // ---------- Текст заказа ----------
  var genBtn=document.getElementById('gen-order');
  if(genBtn){genBtn.addEventListener('click',genOrder);}
  function genOrder(){
    var cart=getCart();
    if(!cart.length){return;}
    var name=(document.getElementById('f-name')||{}).value||'';
    var phone=(document.getElementById('f-phone')||{}).value||'';
    var digits=phone.replace(/\D/g,'');
    if(digits.length<4){
      var pn=document.getElementById('phone-note');if(pn){pn.classList.remove('hidden');}
      return;
    }
    var pn2=document.getElementById('phone-note');if(pn2){pn2.classList.add('hidden');}
    var num=digits.slice(-4);
    var total=0;cart.forEach(function(i){total+=i.price*i.qty;});
    var delLabel='Минск, метро Каменная Горка';
    var extra='';
    if(document.getElementById('d-minsk')&&document.getElementById('d-minsk').checked){
      delLabel='Минск, метро Каменная Горка';
      extra='Удобный день выдачи: '+(document.getElementById('f-day-minsk')||{}).value||'';
    }else if(document.getElementById('d-market')&&document.getElementById('d-market').checked){
      delLabel='Рынок в Дзержинске';
      extra='Удобный день рынка: '+((document.getElementById('f-day-market')||{}).value||'');
    }else{
      delLabel='Почта по РБ';
      extra='Адрес: '+[(document.getElementById('f-index')||{}).value,(document.getElementById('f-city')||{}).value,(document.getElementById('f-address')||{}).value,(document.getElementById('f-receiver')||{}).value].filter(Boolean).join(', ');
    }
    var needConsult=document.getElementById('f-consult')&&document.getElementById('f-consult').checked;
    var consultText='';
    if(needConsult){
      var ct=(document.getElementById('f-consult-text')||{}).value||'';
      consultText='Консультация: нужна'+(ct?' ('+ct+')':'');
    }
    var lines=[];
    lines.push('Заказ №'+num);
    lines.push('Имя: '+name);
    lines.push('Телефон: '+phone);
    lines.push('Получение: '+delLabel+(extra?', '+extra:''));
    lines.push('Сорта:');
    cart.forEach(function(i){
      lines.push('- '+i.name+' ('+i.type+') — '+i.qty+' шт × '+fmt(i.price)+' руб = '+fmt(i.price*i.qty)+' руб');
    });
    lines.push('Итого: '+fmt(total)+' руб');
    if(consultText){lines.push(consultText);}
    var text=lines.join('\n');
    var out=document.getElementById('order-text');
    if(out){out.value=text;}
    var numEl=document.getElementById('order-num');
    if(numEl){numEl.textContent='Ваш номер заказа: №'+num;}
    var result=document.getElementById('order-result');
    if(result){result.classList.remove('hidden');result.scrollIntoView({behavior:'smooth',block:'nearest'});}
  }
  var copyBtn=document.getElementById('copy-order');
  if(copyBtn){copyBtn.addEventListener('click',function(){
    var out=document.getElementById('order-text');
    out.select();
    try{document.execCommand('copy');copyBtn.textContent='Скопировано ✓';}catch(e){}
    setTimeout(function(){copyBtn.textContent='Скопировать текст';},1200);
  });}
  var consult=document.getElementById('f-consult');
  if(consult){consult.addEventListener('change',function(){
    document.getElementById('consult-wrap').classList.toggle('hidden',!consult.checked);
  });}
})();