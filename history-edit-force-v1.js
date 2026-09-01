(()=>{
'use strict';
function findKey(button){
  const row=button.closest('.historyrow');
  const candidates=[button,...(row?[...row.querySelectorAll('button')]:[])];
  for(const b of candidates){
    const attrs=[b.getAttribute('onclick')||'',b.dataset?.key||'',b.dataset?.logKey||'',b.getAttribute('data-key')||'',b.getAttribute('data-log-key')||''];
    for(const a of attrs){
      const m=String(a).match(/(?:deleteLog|editLog|commitSaved)\(\s*['\"]([^'\"]+)['\"]\s*\)/);
      if(m)return m[1];
      if(a && /^.+\|\d{4}-\d{2}-\d{2}$/.test(a))return a;
    }
  }
  if(!row||typeof data==='undefined')return null;
  const text=(row.textContent||'').replace(/\s+/g,' ');
  for(const [k,l] of Object.entries(data.logs||{})){
    if(text.includes(String(l?.date||'')) && text.toLowerCase().includes(String(l?.day||'').split(' — ')[0].toLowerCase()))return k;
  }
  return null;
}
function openFromButton(button){
  const k=findKey(button);
  if(!k){alert('Não consegui identificar este registro. Atualize a página e tente novamente.');return;}
  if(typeof window.editHistoryModal!=='function'){alert('A janela de edição ainda está carregando. Atualize a página e tente novamente.');return;}
  window.editHistoryModal(k);
}
function bind(){
  document.querySelectorAll('.historyrow button').forEach(b=>{
    if(!/editar/i.test(b.textContent||''))return;
    b.type='button';
    b.onclick=(e)=>{e.preventDefault();e.stopPropagation();openFromButton(b);return false};
  });
}
document.addEventListener('click',e=>{
  const b=e.target?.closest?.('.historyrow button');
  if(!b||!/editar/i.test(b.textContent||''))return;
  e.preventDefault();e.stopImmediatePropagation();openFromButton(b);
},true);
new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(bind,100);setTimeout(bind,500);setTimeout(bind,1500);
window.__historyEditForce='v1';
})();
