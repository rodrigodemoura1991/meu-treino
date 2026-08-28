/* MEU TREINO — REST TIMER DEFINITIVE FIX 2026-08-28 */
(()=>{
  'use strict';

  // This timer is deliberately independent from the general workout stopwatch.
  // It listens directly to the reps fields and starts after a valid reps value.
  const active=new WeakMap();
  let toastTimer=0;

  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const isRepsInput=el=>{
    if(!el || el.nodeType!==1 || el.tagName!=='INPUT') return false;
    const hay=[el.name,el.id,el.placeholder,el.getAttribute('aria-label'),el.dataset?.field].filter(Boolean).join(' ').toLowerCase();
    return /(^|[^a-z])reps?([^a-z]|$)|repeti/.test(hay);
  };

  function findCard(input){
    // Do not depend on a fixed number of parent levels: the app's markup has
    // changed several times. The exercise card is the first ancestor that
    // contains the REST label and at least two editable inputs.
    let el=input;
    for(let n=0;el && n<40;n++,el=el.parentElement){
      const text=clean(el.textContent);
      if(/DESCANSO\s*\d+\s*:\s*\d{2}/i.test(text) && el.querySelectorAll('input').length>=2) return el;
    }
    return null;
  }

  function nameOf(card){
    if(!card) return '';
    const h=[...card.querySelectorAll('h1,h2,h3,h4,h5,strong')].find(x=>/\S/.test(clean(x.textContent)));
    return clean(h?.textContent||'').replace(/^\d+\.\s*/,'');
  }

  function durationOf(card){
    const text=clean(card?.textContent);
    const m=text.match(/DESCANSO\s*(\d+)\s*:\s*(\d{2})/i);
    if(m) return (+m[1])*60+(+m[2]);
    const name=nameOf(card);
    try{
      const preset=(typeof restPreset!=='undefined')?restPreset:null;
      if(preset && Number(preset[name])>0) return Number(preset[name]);
    }catch(e){}
    return 60;
  }

  function restPlayButton(card){
    if(!card) return null;
    // In the current UI the REST label is text and the play control is a
    // separate button containing ▶. Find that control near the REST label.
    const buttons=[...card.querySelectorAll('button,[role="button"]')];
    return buttons.find(b=>/DESCANSO/i.test(clean(b.textContent))) ||
           buttons.find(b=>/[▶▷⏵]/.test(clean(b.textContent))) ||
           buttons.find(b=>b.getAttribute('aria-label')?.toLowerCase().includes('descanso')) ||
           null;
  }

  function ensureBadge(card){
    let b=card.querySelector('.meu-auto-rest-countdown');
    if(!b){
      b=document.createElement('span');
      b.className='meu-auto-rest-countdown';
      b.style.cssText='display:inline-flex;align-items:center;margin-left:6px;padding:3px 8px;border-radius:999px;background:#eef2f7;color:#26364a;font:800 11px/1 system-ui,sans-serif;white-space:nowrap;';
      const btn=restPlayButton(card);
      if(btn?.parentElement) btn.parentElement.appendChild(b);
      else card.querySelector('button')?.parentElement?.appendChild(b);
    }
    return b;
  }

  function setRestText(card,seconds){
    const s=Math.max(0,Math.ceil(seconds));
    const label=`DESCANSO ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    const btn=restPlayButton(card);
    if(btn){
      btn.title=label;
      btn.setAttribute('aria-label',label);
    }
    const badge=ensureBadge(card);
    if(badge) badge.textContent=`⏱ ${label}`;
  }

  function showFinished(name){
    let t=document.getElementById('meu-treino-rest-toast');
    if(!t){
      t=document.createElement('div');
      t.id='meu-treino-rest-toast';
      t.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;background:rgba(24,32,48,.96);color:#fff;padding:10px 14px;border-radius:10px;font:700 13px/1.3 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateY(6px);transition:.2s;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent=`⏱ Descanso finalizado${name?` • ${name}`:''}`;
    requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateY(0)'});
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(6px)'},2200);
    try{navigator.vibrate?.(160)}catch(e){}
  }

  function stop(card){
    const old=active.get(card);
    if(old){clearInterval(old.interval);active.delete(card)}
  }

  function start(card){
    if(!card) return false;
    stop(card);
    const total=Math.max(1,durationOf(card));
    const name=nameOf(card);
    const started=Date.now();
    const rec={total,interval:null};
    active.set(card,rec);
    setRestText(card,total);

    const tick=()=>{
      // Date.now makes the countdown reliable even when the browser throttles
      // background timers: we calculate the real elapsed time every tick.
      const left=Math.max(0,total-(Date.now()-started)/1000);
      setRestText(card,left);
      if(left<=0){
        stop(card);
        const b=card.querySelector('.meu-auto-rest-countdown');
        if(b) b.textContent='⏱ Descanso finalizado';
        showFinished(name);
        setTimeout(()=>card.querySelector('.meu-auto-rest-countdown')?.remove(),1400);
      }
    };
    tick();
    rec.interval=setInterval(tick,250);
    return true;
  }

  function schedule(input){
    if(!isRepsInput(input)) return;
    const value=Number(String(input.value??'').replace(',','.'));
    if(!(value>0)) return;
    const card=findCard(input);
    if(!card) return;
    clearTimeout(input.__meuRestDebounce);
    input.__meuRestDebounce=setTimeout(()=>start(card),120);
  }

  // Capture phase guarantees this listener sees inline onchange/oninput
  // handlers and the app's setVal override as well.
  document.addEventListener('input',e=>schedule(e.target),true);
  document.addEventListener('change',e=>schedule(e.target),true);
  document.addEventListener('blur',e=>schedule(e.target),true);

  // Compatibility with the existing app hook. The hook now receives the
  // exercise index, so locate that exercise's first reps field directly.
  window.autoRest=function(index){
    try{
      const cards=[...document.querySelectorAll('input')].map(findCard).filter(Boolean);
      const unique=[...new Set(cards)];
      if(Number.isInteger(Number(index))){
        const card=unique[Number(index)];
        if(card) return start(card);
      }
      const card=findCard(document.activeElement);
      if(card) return start(card);
    }catch(e){console.warn('autoRest',e)}
    return false;
  };

  window.MeuTreinoRestTimer={start,stop,active:()=>{let n=0;document.querySelectorAll('.meu-auto-rest-countdown').forEach(()=>n++);return n}};
})();
