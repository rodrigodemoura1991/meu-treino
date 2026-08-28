/* MEU TREINO — REST TIMER FINAL UI 2026-08-28 */
(()=>{
  'use strict';

  const active=new WeakMap();
  let toastTimer=0;
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const isRepsInput=el=>{
    if(!el || el.nodeType!==1 || el.tagName!=='INPUT') return false;
    const hay=[el.name,el.id,el.placeholder,el.getAttribute('aria-label'),el.dataset?.field].filter(Boolean).join(' ').toLowerCase();
    return /(^|[^a-z])reps?([^a-z]|$)|repeti/.test(hay);
  };

  function findCard(input){
    let el=input;
    for(let n=0;el&&n<40;n++,el=el.parentElement){
      const text=clean(el.textContent);
      if(/DESCANSO\s*\d+\s*:\s*\d{2}/i.test(text)&&el.querySelectorAll('input').length>=2)return el;
    }
    return null;
  }
  function nameOf(card){
    const h=[...card.querySelectorAll('h1,h2,h3,h4,h5,strong,.exname')].find(x=>/\S/.test(clean(x.textContent)));
    return clean(h?.textContent||'').replace(/^\d+\.\s*/,'');
  }
  function durationOf(card){
    const name=nameOf(card);
    try{if(typeof restPreset!=='undefined'&&Number(restPreset[name])>0)return Number(restPreset[name]);}catch(e){}
    const m=clean(card.textContent).match(/DESCANSO\s*(\d+)\s*:\s*(\d{2})/i);
    return m?(+m[1])*60+(+m[2]):60;
  }

  function injectStyle(){
    if(document.getElementById('meu-rest-final-style'))return;
    const s=document.createElement('style');s.id='meu-rest-final-style';
    s.textContent=`
      .meu-rest-legacy-hidden{display:none!important}
      .meu-rest-panel{margin:12px 0 10px;padding:14px 18px;border-radius:16px;background:linear-gradient(135deg,#111827,#202d43);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 10px 24px rgba(17,24,39,.16);border:1px solid rgba(255,255,255,.06);position:relative;overflow:hidden}
      .meu-rest-panel:after{content:"";position:absolute;width:150px;height:150px;right:-65px;top:-70px;border-radius:50%;background:rgba(239,101,0,.20)}
      .meu-rest-left{display:flex;align-items:center;gap:13px;position:relative;z-index:1;min-width:0}
      .meu-rest-ring{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#ef6500 0deg,#ef6500 0deg,rgba(255,255,255,.13) 0deg);flex:0 0 auto;box-shadow:inset 0 0 0 7px rgba(255,255,255,.03)}
      .meu-rest-ring:before{content:"";width:42px;height:42px;border-radius:50%;background:#111827;position:absolute}
      .meu-rest-clock{position:relative;z-index:1;font-size:13px;font-weight:950;color:#fff}
      .meu-rest-label{font-size:10px;letter-spacing:1.7px;font-weight:900;color:#f6b487;text-transform:uppercase}
      .meu-rest-name{font-size:12px;font-weight:850;color:#fff;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px}
      .meu-rest-right{position:relative;z-index:1;text-align:right;min-width:88px}
      .meu-rest-big{font-size:32px;line-height:1;font-weight:950;letter-spacing:-1px;font-variant-numeric:tabular-nums}
      .meu-rest-total{font-size:9px;color:#aeb9c8;margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-weight:850}
      @media(max-width:430px){.meu-rest-panel{padding:12px 13px;gap:8px}.meu-rest-ring{width:52px;height:52px}.meu-rest-ring:before{width:38px;height:38px}.meu-rest-big{font-size:28px}.meu-rest-name{max-width:150px}}
    `;
    document.head.appendChild(s);
  }

  function hideLegacy(card){
    // The old implementation renders a DESCANSO label with a ▶ button.
    // Hide only that small legacy control; the new panel below is independent.
    [...card.querySelectorAll('button,[role="button"]')].forEach(btn=>{
      const txt=clean(btn.textContent)+' '+clean(btn.getAttribute('aria-label'));
      if(/[▶▷⏵]/.test(txt)||/descanso/i.test(txt)){
        let p=btn.parentElement;
        if(p && /DESCANSO/i.test(clean(p.textContent)))p.classList.add('meu-rest-legacy-hidden');
        else btn.classList.add('meu-rest-legacy-hidden');
      }
    });
    [...card.children].forEach(ch=>{
      if(ch.classList.contains('meu-rest-panel'))return;
      if(/DESCANSO\s*\d+\s*:\s*\d{2}/i.test(clean(ch.textContent))&&!ch.querySelector('input'))ch.classList.add('meu-rest-legacy-hidden');
    });
  }

  function ensurePanel(card){
    let p=card.querySelector('.meu-rest-panel');
    if(p)return p;
    p=document.createElement('div');p.className='meu-rest-panel';
    p.innerHTML='<div class="meu-rest-left"><div class="meu-rest-ring"><span class="meu-rest-clock">⏱</span></div><div><div class="meu-rest-label">DESCANSO</div><div class="meu-rest-name"></div></div></div><div class="meu-rest-right"><div class="meu-rest-big">0:00</div><div class="meu-rest-total">tempo de descanso</div></div>';
    const sets=card.querySelector('.sets');
    if(sets)sets.parentNode.insertBefore(p,sets);
    else card.appendChild(p);
    p.querySelector('.meu-rest-name').textContent=nameOf(card);
    return p;
  }

  function render(card,left,total){
    const p=ensurePanel(card),s=Math.max(0,Math.ceil(left));
    p.querySelector('.meu-rest-big').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    const ring=p.querySelector('.meu-rest-ring');
    const deg=Math.max(0,Math.min(360,(1-left/total)*360));
    ring.style.background=`conic-gradient(#ef6500 ${deg}deg,rgba(255,255,255,.13) ${deg}deg 360deg)`;
  }

  function showFinished(name){
    let t=document.getElementById('meu-treino-rest-toast');
    if(!t){t=document.createElement('div');t.id='meu-treino-rest-toast';t.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;background:rgba(24,32,48,.96);color:#fff;padding:11px 15px;border-radius:11px;font:800 13px/1.3 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateY(6px);transition:.2s;pointer-events:none';document.body.appendChild(t)}
    t.textContent=`⏱ Descanso finalizado${name?` • ${name}`:''}`;
    requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateY(0)'});
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(6px)'},2200);
    try{navigator.vibrate?.(160)}catch(e){}
  }

  function stop(card){const old=active.get(card);if(old){clearInterval(old.interval);active.delete(card)}}
  function start(card){
    if(!card)return false;
    injectStyle();hideLegacy(card);stop(card);
    const total=Math.max(1,durationOf(card)),name=nameOf(card),started=Date.now();
    active.set(card,{total,interval:null});render(card,total,total);
    const tick=()=>{
      const left=Math.max(0,total-(Date.now()-started)/1000);render(card,left,total);
      if(left<=0){stop(card);render(card,0,total);showFinished(name);setTimeout(()=>card.querySelector('.meu-rest-panel')?.remove(),1800)}
    };
    tick();
    active.get(card).interval=setInterval(tick,250);
    return true;
  }

  function schedule(input){
    if(!isRepsInput(input))return;
    const value=Number(String(input.value??'').replace(',','.'));
    if(!(value>0))return;
    const card=findCard(input);if(!card)return;
    clearTimeout(input.__meuRestDebounce);input.__meuRestDebounce=setTimeout(()=>start(card),120);
  }

  document.addEventListener('input',e=>schedule(e.target),true);
  document.addEventListener('change',e=>schedule(e.target),true);
  document.addEventListener('blur',e=>schedule(e.target),true);

  // Keep compatibility with the app's existing hook, but always use this timer.
  window.autoRest=function(index){
    try{
      const unique=[...new Set([...document.querySelectorAll('input')].map(findCard).filter(Boolean))];
      const n=Number(index);
      const card=Number.isInteger(n)?unique[n]:findCard(document.activeElement);
      return card?start(card):false;
    }catch(e){console.warn('autoRest',e);return false}
  };
  window.MeuTreinoRestTimer={start,stop,active:()=>[...document.querySelectorAll('.meu-rest-panel')].length};

  injectStyle();
  // Reapply after the app renders/re-renders its cards.
  const mo=new MutationObserver(()=>{
    document.querySelectorAll('.exercise').forEach(card=>{if(/DESCANSO/i.test(clean(card.textContent))){hideLegacy(card)}});
  });
  mo.observe(document.body,{childList:true,subtree:true});
})();
