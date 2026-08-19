/* 2026-08-19 — navegação manual + vibração longa no fim do descanso */
(function(){
  'use strict';
  const VIB_KEY='meu_treino_vibracao_descanso';
  const isVibrationOn=()=>localStorage.getItem(VIB_KEY)==='1';
  const setVibration=v=>{try{localStorage.setItem(VIB_KEY,v?'1':'0')}catch(e){}};

  // Remove o avanço automático entre campos. O usuário permanece no campo que acabou de preencher.
  window.advanceField=function(){};

  function vibrateLong(){
    if(!isVibrationOn()) return;
    try{
      if(typeof navigator!=='undefined' && typeof navigator.vibrate==='function'){
        navigator.vibrate(900);
      }
    }catch(e){}
  }

  // Detecta a transição do descanso para "concluído" sem depender da implementação interna do cronômetro.
  const seen=new WeakSet();
  function watchRest(){
    document.querySelectorAll('.restbox').forEach(box=>{
      const done=box.classList.contains('done');
      if(done && !seen.has(box)){
        seen.add(box);
        vibrateLong();
      }else if(!done && seen.has(box)){
        seen.delete(box);
      }
    });
  }

  function addSettings(){
    if(typeof current==='undefined' || current!=='Dados') return;
    const app=document.getElementById('app');
    if(!app || app.querySelector('#vibration-setting')) return;
    const card=document.createElement('div');
    card.id='vibration-setting';
    card.style.cssText='margin:16px 0;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 4px 16px rgba(0,0,0,.05)';
    const supported=typeof navigator!=='undefined' && typeof navigator.vibrate==='function';
    const on=isVibrationOn();
    card.innerHTML='<div style="font-weight:800;font-size:18px;margin-bottom:6px">📳 Vibração ao terminar descanso</div>'+
      '<div style="font-size:14px;color:#6b7280;margin-bottom:12px">Vibração longa de 0,9 segundo quando o cronômetro de descanso chegar a zero.</div>'+
      '<label style="display:flex;align-items:center;gap:12px;font-size:16px;font-weight:700;cursor:pointer">'+
      '<input id="vibration-toggle" type="checkbox" '+(on?'checked':'')+' style="width:22px;height:22px"> Ativar vibração'+
      '</label>'+
      '<div id="vibration-support" style="margin-top:9px;font-size:13px;color:'+(supported?'#6b7280':'#b45309')+'">'+
      (supported?'Seu navegador informa suporte à vibração.':'Este navegador pode não permitir vibração em páginas web; a opção ficará salva para quando houver suporte.')+
      '</div>';
    app.prepend(card);
    card.querySelector('#vibration-toggle').addEventListener('change',e=>setVibration(e.target.checked));
  }

  const observer=new MutationObserver(()=>{watchRest();addSettings()});
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(()=>{watchRest();addSettings()},700);
  setTimeout(()=>{watchRest();addSettings()},500);
})();
