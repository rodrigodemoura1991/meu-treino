/* MEU TREINO — REST TIMER FINAL UI 2026-08-28 v2 */
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
      .meu-rest-panel{margin:12px 0 12px;padding:18px 22px;min-height:78px;border-radius:18px;background:linear-gradient(135deg,#111827,#263650);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 12px 28px rgba(17,24,39,.18);border:1px solid rgba(255,255,255,.08);position:relative;overflow:hidden}
      .meu-rest-panel:after{content:"";position:absolute;width:180px;height:180px;right:-75px;top:-85px;border-radius:50%;background:rgba(239,101,0,.22);pointer-events:none}
      .meu-rest-left{display:flex;align-items:center;gap:16px;position:relative;z-index:1;min-width:0}
      .meu-rest-ring{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#ef6500 360deg,rgba(255,255,255,.13) 0deg);flex:0 0 auto;box-shadow:inset 0 0 0 8px rgba(255,255,255,.035),0 5px 16px rgba(0,0,0,.12);position:relative}
      .meu-rest-ring:before{content:"";width:52px;height:52px;border-radius:50%;background:#111827;position:absolute}
      .meu-rest-clock{position:relative;z-index:1;font-size:17px;font-weight:950;color:#fff}
      .meu-rest-label{font-size:11px;letter-spacing:1.9px;font-weight:900;color:#f6b487;text-transform:uppercase}
      .meu-rest-name{font-size:14px;font-weight:850;color:#fff;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px}
      .meu-rest-hint{font-size:10px;color:#aeb9c8;margin-top:5px;letter-spacing:.4px}
      .meu-rest-right{position:relative;z-index:1;text-align:right;min-width:118px}
      .meu-rest-big{font-size:42px;line-height:1;font-weight:950;letter-spacing:-1.5px;font-variant-numeric:tabular-nums}
      .meu-rest-total{font-size:9px;color:#aeb9c8;margin-top:5px;text-transform:uppercase;letter-spacing:1px;font-weight:850}
      @media(max-width:620px){.meu-rest-panel{padding:14px 15px;gap:10px;min-height:66px}.meu-rest-ring{width:58px;height:58px}.meu-rest-ring:before{width:43px;height:43px}.meu-rest-big{font-size:34px}.meu-rest-name{font-size:12px;max-width:180px}.meu-rest-hint{display:none}.meu-rest-right{min-width:92px}}
      @media(max-width:430px){.meu-rest-panel{padding:12px 13px}.meu-rest-ring{width:52px;height:52px}.meu-rest-ring:before{width:38px;height:38px}.meu-rest-big{font-size:30px}.meu-rest-name{max-width:145px}}
    `;
    document.head.appendChild(s);
  }

  function hideLegacy(card){
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
    if(!card)return null;
    let p=card.querySelector('.meu-rest-panel');
    if(p)return p;
    p=document.createElement('div');p.className='meu-rest-panel';
    p.innerHTML='<div class="meu-rest-left"><div class="meu-rest-ring"><span class="meu-rest-clock">⏱</span></div><div><div class="meu-rest-label">DESCANSO</div><div class="meu-rest-name"></div><div class="meu-rest-hint">Começa automaticamente ao informar as repetições</div></div></div><div class="meu-rest-right"><div class="meu-rest-big">0:00</div><div class="meu-rest-total">tempo de descanso</div></div>';
    const sets=card.querySelector('.sets');
    if(sets)sets.parentNode.insertBefore(p,sets);
    else{
      const firstInputs=card.querySelector('input');
      if(firstInputs)firstInputs.parentNode.parentNode.insertBefore(p,firstInputs.parentNode.parentNode.firstChild);
      else card.appendChild(p);
    }
    p.querySelector('.meu-rest-name').textContent=nameOf(card);
    render(card,durationOf(card),durationOf(card));
    return p;
  }

  function render(card,left,total){
    const p=card?.querySelector('.meu-rest-panel')||ensurePanel(card);
    if(!p)return;
    const s=Math.max(0,Math.ceil(left));
    p.querySelector('.meu-rest-big').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    const ring=p.querySelector('.meu-rest-ring');
    const deg=Math.max(0,Math.min(360,(1-left/Math.max(1,total))*360));
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
    injectStyle();hideLegacy(card);ensurePanel(card);stop(card);
    const total=Math.max(1,durationOf(card)),name=nameOf(card),started=Date.now();
    active.set(card,{total,interval:null});render(card,total,total);
    const tick=()=>{
      const left=Math.max(0,total-(Date.now()-started)/1000);render(card,left,total);
      if(left<=0){
        stop(card);render(card,0,total);showFinished(name);
        setTimeout(()=>{const p=card.querySelector('.meu-rest-panel');if(p)render(card,total,total)},1800);
      }
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

  function prepareCards(){
    injectStyle();
    document.querySelectorAll('.exercise').forEach(card=>{
      if(/DESCANSO\s*\d+\s*:\s*\d{2}/i.test(clean(card.textContent))){
        hideLegacy(card);
        ensurePanel(card);
      }
    });
  }

  document.addEventListener('input',e=>schedule(e.target),true);
  document.addEventListener('change',e=>schedule(e.target),true);
  document.addEventListener('blur',e=>schedule(e.target),true);

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
  prepareCards();
  const mo=new MutationObserver(()=>prepareCards());
  mo.observe(document.body,{childList:true,subtree:true});
})();
