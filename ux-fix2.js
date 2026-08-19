/* UX FIX 2026-08-19 v2
   - Clear all kg/reps for current workout
   - Explicit next-field button (Enter equivalent)
   - Rest-end haptic where supported + visual/audio fallback
*/
(function(){
  const VERSION='20260819ux2';

  function currentKey(){ return window.current || document.querySelector('[data-day-key]')?.dataset.dayKey || null; }

  function clearWorkoutInputs(k){
    const l=window.data?.logs?.[k];
    if(!l) return;
    if(!confirm('Zerar todas as cargas e repetições deste treino?')) return;
    if(Array.isArray(l.kg)) l.kg=l.kg.map(()=>[]);
    if(Array.isArray(l.reps)) l.reps=l.reps.map(()=>[]);
    // Also clear alternate per-exercise series structures if present.
    if(Array.isArray(l.sets)) l.sets=l.sets.map(ex=>Array.isArray(ex)?ex.map(s=>({...s,kg:'',reps:''})):ex);
    l.completed=false;
    if(typeof window.save==='function') window.save(k);
    if(typeof window.render==='function') window.render();
  }
  window.clearWorkoutInputs=clearWorkoutInputs;

  function addClearButton(){
    const card=document.querySelector('.workoutTimer');
    if(!card || card.querySelector('.clear-workout-btn')) return;
    const k=currentKey();
    const b=document.createElement('button');
    b.className='clear-workout-btn';
    b.type='button';
    b.textContent='🗑️ Zerar cargas e reps';
    b.style.cssText='margin-top:12px;border:0;border-radius:12px;padding:10px 14px;font-weight:800;background:#fff0f0;color:#b42318;font-size:14px;cursor:pointer';
    b.onclick=()=>clearWorkoutInputs(k);
    const inner=card.querySelector('div');
    (inner||card).appendChild(b);
  }

  function nextInput(el){
    const fields=[...document.querySelectorAll('input')].filter(x=>!x.disabled && x.offsetParent!==null);
    const idx=fields.indexOf(el);
    const next=fields[idx+1];
    if(next){next.focus(); if(next.select) next.select();}
  }
  window.nextWorkoutInput=nextInput;

  function addEnterButtons(){
    // Native iOS numeric keyboard cannot have its backspace key replaced by a webpage.
    // Provide a visible Enter-equivalent beside each kg/reps pair, while preserving backspace.
    document.querySelectorAll('input').forEach((input)=>{
      if(input.dataset.enterPatched) return;
      const ph=(input.getAttribute('placeholder')||'').toLowerCase();
      if(ph!=='kg' && ph!=='reps') return;
      input.dataset.enterPatched='1';
      input.addEventListener('keydown',(e)=>{
        if(e.key==='Enter'){e.preventDefault();nextInput(input);}
      });
      const wrap=input.parentElement;
      if(!wrap || wrap.querySelector('.enter-next-btn')) return;
      const b=document.createElement('button');
      b.type='button'; b.className='enter-next-btn'; b.textContent='↵'; b.title='Próximo campo';
      b.style.cssText='position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;border-radius:9px;background:#eef5ff;color:#1261a0;font-size:18px;font-weight:900;width:34px;height:34px;z-index:2';
      const pos=getComputedStyle(wrap).position; if(pos==='static') wrap.style.position='relative';
      wrap.appendChild(b);
      input.style.paddingRight='48px';
      b.onclick=()=>nextInput(input);
    });
  }

  function longHaptic(){
    // Vibration API is not exposed by iOS Safari/WebKit. Use it where supported.
    try{
      if(typeof navigator.vibrate==='function'){
        navigator.vibrate([180,80,180,80,400]);
        return true;
      }
    }catch(e){}
    // iPhone fallback: visible flash + short alert tone when Web Audio is available.
    try{
      const el=document.createElement('div');
      el.textContent='⏱️ DESCANSO FINALIZADO';
      el.style.cssText='position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.82);font-size:28px;font-weight:900;color:#c2410c;text-align:center;pointer-events:none';
      document.body.appendChild(el); setTimeout(()=>el.remove(),900);
      const C=window.AudioContext||window.webkitAudioContext;
      if(C){const c=new C(); const o=c.createOscillator(); const g=c.createGain(); o.frequency.value=880; g.gain.value=.18; o.connect(g);g.connect(c.destination);o.start();setTimeout(()=>{o.stop();c.close&&c.close()},500)}
    }catch(e){}
    return false;
  }
  window.longRestHaptic=longHaptic;

  function patchRestFinish(){
    if(window.__uxRestPatched) return;
    window.__uxRestPatched=true;
    const original=window.toggleRest;
    if(typeof original!=='function'){window.__uxRestPatched=false;return;}
    // Patch only via interval completion watcher so existing timer logic remains intact.
    setInterval(()=>{
      const intervals=window.restIntervals||{};
      Object.keys(intervals).forEach(i=>{
        const box=document.getElementById('rest-'+i);
        if(box && box.classList.contains('done') && !box.dataset.hapticDone){
          box.dataset.hapticDone='1'; longHaptic();
        }
        if(box && !box.classList.contains('done')) delete box.dataset.hapticDone;
      });
    },250);
  }

  function observe(){
    addClearButton(); addEnterButtons(); patchRestFinish();
  }
  const mo=new MutationObserver(observe); mo.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(observe,100); setTimeout(observe,500); setTimeout(observe,1200);
})();
