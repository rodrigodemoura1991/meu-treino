(()=>{
'use strict';

/*
 * CORREÇÃO DEFINITIVA DO EDITAR DO HISTÓRICO
 * Não altera nem apaga registros do Supabase.
 * O editor antigo tentava abrir uma seção no final da página.
 * Aqui substituímos a entrada editLog pelo editor modal e também
 * interceptamos cliques gerados por HTML/handlers antigos.
 */

function installModalCss(){
  if(document.getElementById('historyEditModalCss')) return;
  const css=document.createElement('style');
  css.id='historyEditModalCss';
  css.textContent=`
    #historyEditModal{position:fixed!important;inset:0!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;background:rgba(15,23,42,.62)!important;overflow:auto!important}
    #historyEditModal .history-edit-backdrop{position:fixed!important;inset:0!important;background:transparent!important}
    #historyEditModal .history-edit-modal{position:relative!important;z-index:2!important;width:min(900px,calc(100vw - 36px))!important;max-height:calc(100vh - 36px)!important;overflow:auto!important;background:#fff!important;border-radius:22px!important;box-shadow:0 25px 80px rgba(0,0,0,.35)!important;color:#18222d!important}
    #historyEditModal .history-edit-head{position:sticky!important;top:0!important;z-index:5!important;display:flex!important;justify-content:space-between!important;align-items:center!important;gap:15px!important;padding:18px 20px!important;background:#fff!important;border-bottom:1px solid #e5e7eb!important}
    #historyEditModal .history-edit-head span{display:block!important;font-size:11px!important;font-weight:950!important;letter-spacing:2px!important;color:#ef6500!important}
    #historyEditModal .history-edit-head h2{margin:5px 0 2px!important;font-size:24px!important}
    #historyEditModal .history-edit-head small{color:#71808f!important}
    #historyEditModal .history-edit-body{padding:18px 20px!important}
    #historyEditModal .history-edit-actions{position:sticky!important;bottom:0!important;z-index:5!important;display:flex!important;justify-content:flex-end!important;gap:9px!important;padding:14px 20px!important;background:rgba(255,255,255,.98)!important;border-top:1px solid #e5e7eb!important}
    #historyEditModal .history-edit-ex{margin:0 0 12px!important;padding:14px!important;border:1px solid #dfe5eb!important;border-radius:15px!important;background:#fff!important}
    #historyEditModal .history-edit-ex h3{margin:0 0 8px!important;font-size:16px!important}
    #historyEditModal .history-edit-set{display:grid!important;grid-template-columns:32px 1fr 1fr!important;gap:7px!important;margin:6px 0!important;align-items:center!important}
    #historyEditModal .history-edit-set input{width:100%!important;height:40px!important;border:1px solid #ccd5dd!important;border-radius:9px!important;padding:0 9px!important;box-sizing:border-box!important}
    #historyEditModal .history-edit-ex textarea{width:100%!important;min-height:52px!important;box-sizing:border-box!important;border:1px solid #d2d9e0!important;border-radius:9px!important;padding:9px!important;margin-top:7px!important}
    @media(max-width:600px){
      #historyEditModal{padding:8px!important}
      #historyEditModal .history-edit-modal{width:calc(100vw - 16px)!important;max-height:calc(100vh - 16px)!important;border-radius:17px!important}
      #historyEditModal .history-edit-head,#historyEditModal .history-edit-body{padding:14px!important}
      #historyEditModal .history-edit-actions{padding:12px 14px!important}
      #historyEditModal .history-edit-actions button{flex:1!important}
    }
  `;
  document.head.appendChild(css);
}

function findKey(button){
  const row=button?.closest?.('.historyrow');
  const candidates=[button,...(row?[...row.querySelectorAll('button')]:[])];
  for(const b of candidates){
    const attrs=[b.getAttribute?.('onclick')||'',b.dataset?.key||'',b.dataset?.logKey||'',b.getAttribute?.('data-key')||'',b.getAttribute?.('data-log-key')||''];
    for(const a of attrs){
      const m=String(a).match(/(?:deleteLog|editLog|commitSaved)\(\s*['\"]([^'\"]+)['\"]\s*\)/);
      if(m)return m[1];
      if(a && /^.+\|\d{4}-\d{2}-\d{2}$/.test(a))return a;
    }
  }
  if(!row||typeof data==='undefined')return null;
  const text=(row.textContent||'').replace(/\s+/g,' ').toLowerCase();
  for(const [k,l] of Object.entries(data.logs||{})){
    const date=String(l?.date||'').toLowerCase();
    const day=String(l?.day||'').split(' — ')[0].toLowerCase();
    if(date && text.includes(date) && (!day || text.includes(day)))return k;
  }
  return null;
}

function openFromButton(button){
  const k=findKey(button);
  if(!k){alert('Não consegui identificar este registro. Atualize a página e tente novamente.');return false;}
  if(typeof window.editHistoryModal!=='function'){
    alert('A janela de edição ainda está carregando. Atualize a página e tente novamente.');
    return false;
  }
  window.editHistoryModal(k);
  return false;
}

function install(){
  installModalCss();

  /* O ponto mais importante: qualquer chamada antiga a editLog agora abre popup. */
  if(typeof window.editHistoryModal==='function'){
    window.editLog=function(k){ window.editHistoryModal(k); return false; };
  }

  document.querySelectorAll('button,a,[role="button"]').forEach(el=>{
    if(!/editar/i.test(el.textContent||''))return;
    if(el.dataset.historyPopupBound==='1')return;
    el.dataset.historyPopupBound='1';
    el.setAttribute('type','button');
    el.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      openFromButton(el);
    },true);
  });
}

/* Captura antes dos handlers antigos. */
document.addEventListener('click',e=>{
  const el=e.target?.closest?.('button,a,[role="button"]');
  if(!el||!/editar/i.test(el.textContent||''))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openFromButton(el);
},true);

new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(install,50);
setTimeout(install,300);
setTimeout(install,1000);
setTimeout(install,2500);
window.__historyEditForce='v2';
})();
