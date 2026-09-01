(()=>{
'use strict';
function getKey(el){
  const row=el.closest?.('.historyrow')||el.parentElement?.closest?.('.historyrow');
  const nodes=[el,...(row?[...row.querySelectorAll('button,a,[role="button"]')]:[])];
  for(const n of nodes){
    const vals=[n.getAttribute?.('onclick')||'',n.dataset?.key||'',n.dataset?.logKey||'',n.getAttribute?.('data-key')||'',n.getAttribute?.('data-log-key')||''];
    for(const v of vals){
      const m=String(v).match(/(?:editLog|deleteLog|editHistoryModal|commitSaved)\(\s*['\"]([^'\"]+)['\"]\s*\)/);
      if(m)return m[1];
      if(/^.+\|\d{4}-\d{2}-\d{2}$/.test(String(v)))return String(v);
    }
  }
  if(typeof data==='undefined')return null;
  const text=(row?.textContent||'').replace(/\s+/g,' ').toLowerCase();
  for(const [k,l] of Object.entries(data.logs||{})){
    const date=String(l?.date||'').toLowerCase();
    const day=String(l?.day||'').split(' — ')[0].toLowerCase();
    if(date&&text.includes(date)&&text.includes(day))return k;
  }
  return null;
}
function go(el){
  if(typeof window.editHistoryModal!=='function')return;
  const k=getKey(el);
  if(!k){alert('Não consegui identificar este treino. Atualize a página e tente novamente.');return;}
  window.editHistoryModal(k);
}
function capture(e){
  const el=e.target?.closest?.('button,a,[role="button"]');
  if(!el||!/editar/i.test(el.textContent||''))return;
  e.preventDefault();e.stopImmediatePropagation();
  go(el);
}
/* Window capture acontece antes de qualquer listener do document ou do próprio botão. */
window.addEventListener('click',capture,true);
window.addEventListener('pointerup',e=>{
  const el=e.target?.closest?.('button,a,[role="button"]');
  if(!el||!/editar/i.test(el.textContent||''))return;
  e.preventDefault();e.stopImmediatePropagation();
},true);
function install(){
  if(typeof window.editHistoryModal==='function'){
    /* Não depende da substituição da declaração global editLog. */
    document.querySelectorAll('button,a,[role="button"]').forEach(el=>{
      if(!/editar/i.test(el.textContent||'')||el.dataset.popupV3)return;
      el.dataset.popupV3='1';
      el.removeAttribute('href');
      el.removeAttribute('onclick');
      el.type='button';
      el.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(el)},true);
    });
  }
}
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(install,50);setTimeout(install,300);setTimeout(install,1000);setTimeout(install,2500);
})();
