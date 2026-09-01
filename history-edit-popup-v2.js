/* MEU TREINO — EDITAR SEMPRE EM POPUP */
(function(){
  'use strict';
  function forcePopupEdit(){
    if(typeof window.editHistoryModal !== 'function') return false;
    window.editLog = function(k){
      try{
        if(window.data?.logs && !window.data.logs[k]) return;
        window.editHistoryModal(k);
      }catch(e){
        console.error('Falha ao abrir edição em popup:',e);
        alert('Não foi possível abrir a edição deste treino.');
      }
    };
    return true;
  }
  /* Substitui também handlers inline já criados pelo render do histórico. */
  function bind(){
    if(!forcePopupEdit()) return;
    document.querySelectorAll('button').forEach(btn=>{
      const text=(btn.textContent||'').trim();
      if(!/editar/i.test(text)) return;
      if(btn.dataset.popupEditV2==='1') return;
      const onclick=btn.getAttribute('onclick')||'';
      const match=onclick.match(/(?:editLog|editHistoryModal)\(['"]([^'"]+)['"]\)/);
      if(!match) return;
      const k=match[1];
      btn.dataset.popupEditV2='1';
      btn.removeAttribute('onclick');
      btn.type='button';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        window.editHistoryModal(k);
      },true);
    });
  }
  let tries=0;
  const timer=setInterval(()=>{
    bind();
    if(++tries>30) clearInterval(timer);
  },100);
  new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(bind,50);
})();
