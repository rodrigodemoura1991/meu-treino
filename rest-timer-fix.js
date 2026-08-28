/* MEU TREINO — REST TIMER FINAL FIX 2026-08-28 */
(()=>{
  'use strict';

  const timers=new Map();
  let seq=0;

  function isRepsInput(el){
    if(!el || el.tagName!=='INPUT') return false;
    const hay=[el.placeholder,el.name,el.id,el.getAttribute('aria-label'),el.dataset?.field].filter(Boolean).join(' ').toLowerCase();
    return /rep|reps|repeti/.test(hay);
  }

  function exerciseCard(input){
    let el=input;
    for(let n=0;n<9 && el;n++,el=el.parentElement){
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/DESCANSO\s*\d+\s*:\s*\d{2}/i.test(text) && el.querySelectorAll('input').length>=2) return el;
    }
    return null;
  }

  function exerciseName(card){
    if(!card) return '';
    const h=card.querySelector('h1,h2,h3,h4,h5,strong');
    return (h?.textContent||'').replace(/^\d+\.\s*/,'').trim();
  }

  function durationFor(card){
    const text=(card?.textContent||'').replace(/\s+/g,' ');
    const m=text.match(/DESCANSO\s*(\d+)\s*:\s*(\d{2})/i);
    if(m) return (+m[1])*60+(+m[2]);
    const name=exerciseName(card);
    try{
      if(typeof restPreset!=='undefined' && Number(restPreset[name])>0) return Number(restPreset[name]);
    }catch(e){}
    return 60;
  }

  function restButton(card){
    if(!card) return null;
    return [...card.querySelectorAll('button,[role="button"]')].find(b=>/DESCANSO/i.test(b.textContent||''))||null;
  }

  function label(sec){const s=Math.max(0,Math.ceil(sec));return `DESCANSO ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}

  function toast(name){
    let t=document.getElementById('meu-treino-rest-toast');
    if(!t){
      t=document.createElement('div');t.id='meu-treino-rest-toast';
      t.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;background:rgba(24,32,48,.96);color:#fff;padding:10px 14px;border-radius:10px;font:700 13px/1.3 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateY(6px);transition:.2s;pointer-events:none';
      document.body.appendChild(t);
    }
    t.textContent=`⏱ Descanso finalizado${name?` • ${name}`:''}`;
    requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateY(0)'});
    clearTimeout(t._hide);t._hide=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(6px)'},2200);
    try{navigator.vibrate?.(160)}catch(e){}
  }

  function finish(key,card,name){
    const rec=timers.get(key); if(!rec || rec.id!==key) return;
    timers.delete(key);
    const btn=restButton(card);
    if(btn){btn.textContent=label(rec.total);btn.disabled=false;btn.style.removeProperty('opacity')}
    const old=card?.querySelector('.meu-auto-rest-countdown');
    if(old) old.remove();
    toast(name);
  }

  function start(card){
    if(!card) return;
    const name=exerciseName(card),total=durationFor(card),key=card;
    const previous=timers.get(key);
    if(previous){clearInterval(previous.interval);timers.delete(key)}
    const id=++seq,btn=restButton(card);
    if(btn){btn.disabled=false;btn.textContent=label(total)}
    let badge=card.querySelector('.meu-auto-rest-countdown');
    if(!badge){
      badge=document.createElement('span');badge.className='meu-auto-rest-countdown';
      badge.style.cssText='display:inline-flex;align-items:center;margin-left:6px;padding:2px 7px;border-radius:999px;background:#eef2f7;color:#26364a;font:800 11px/1 system-ui,sans-serif;white-space:nowrap';
      (btn?.parentElement||card).appendChild(badge);
    }
    const started=Date.now(),rec={id,total,interval:null};timers.set(key,rec);
    const tick=()=>{
      const left=Math.max(0,total-(Date.now()-started)/1000);
      if(btn) btn.textContent=label(left);
      if(badge) badge.textContent=`${Math.ceil(left)}s`;
      if(left<=0){clearInterval(rec.interval);finish(key,card,name)}
    };
    tick();rec.interval=setInterval(tick,250);
  }

  function schedule(input){
    if(!isRepsInput(input)) return;
    const value=Number(String(input.value||'').replace(',','.'));
    if(!(value>0)) return;
    const card=exerciseCard(input);if(!card)return;
    clearTimeout(input.__restTimerDebounce);
    input.__restTimerDebounce=setTimeout(()=>start(card),180);
  }

  document.addEventListener('input',e=>schedule(e.target),true);
  document.addEventListener('change',e=>schedule(e.target),true);

  try{
    if(typeof window.autoRest==='function') window.autoRest=(i)=>{
      const card=exerciseCard(document.activeElement);
      if(card) start(card);
    };
  }catch(e){}

  window.MeuTreinoRestTimer={start,stop(card){const r=timers.get(card);if(r){clearInterval(r.interval);timers.delete(card)}},active:()=>timers.size};
})();
