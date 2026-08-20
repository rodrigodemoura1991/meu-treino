/* Fix: edição dos registros do Histórico, inclusive Quinta-feira */
(function(){
  function isoFromBR(text){
    const m=String(text||'').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return m ? m[3]+'-'+m[2]+'-'+m[1] : '';
  }
  document.addEventListener('click',function(ev){
    const btn=ev.target.closest('.historyActions button');
    if(!btn || typeof editLog!=='function' || typeof key!=='function') return;
    const article=btn.closest('.historyrow');
    const title=article?.querySelector('.historyhead b')?.textContent||'';
    const m=title.match(/^(.+?)\s+—\s+(.+)$/);
    if(!m) return;
    const day=m[1].trim(), date=isoFromBR(m[2]);
    if(!date)return;
    if(btn.getAttribute('aria-label')==='Editar treino' || /editar/i.test(btn.title||btn.textContent||'')){
      ev.preventDefault();ev.stopImmediatePropagation();editLog(key(day,date));
    }
  },true);
})();
