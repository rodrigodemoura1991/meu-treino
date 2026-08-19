/* UX FIX 2026-08-19 v3 */
(function(){
  function currentKey(){ return window.current || document.querySelector('[data-day-key]')?.dataset.dayKey || null; }

  function clearWorkoutInputs(k){
    const l=window.data?.logs?.[k];
    if(!l) return;
    if(!confirm('Zerar todas as cargas e repetições deste treino?')) return;
    if(Array.isArray(l.kg)) l.kg=l.kg.map(()=>[]);
    if(Array.isArray(l.reps)) l.reps=l.reps.map(()=>[]);
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
    b.textContent='Zerar';
    b.title='Zerar todas as cargas e repetições';
    b.style.cssText='margin-top:12px;border:0;border-radius:12px;padding:10px 18px;font-weight:800;background:#fff0f0;color:#b42318;font-size:15px;cursor:pointer';
    b.onclick=()=>clearWorkoutInputs(k);
    const inner=card.querySelector('div');
    (inner||card).appendChild(b);
  }

  // Remove any previously injected Enter-equivalent buttons.
  function removeEnterButtons(){
    document.querySelectorAll('.enter-next-btn').forEach(b=>b.remove());
    document.querySelectorAll('input[data-enter-patched]').forEach(input=>{
      delete input.dataset.enterPatched;
      input.style.paddingRight='';
    });
  }

  // iOS Safari/WebKit does not expose navigator.vibrate for web pages.
  // Keep the vibration attempt for supported browsers, but provide a reliable
  // visual + audio signal on iPhone instead of pretending haptic is available.
  function restFinishedSignal(){
    try{
      if(typeof navigator.vibrate==='function'){
        navigator.vibrate([180,80,180,80,450]);
        return;
      }
    }catch(e){}
    try{
      const el=document.createElement('div');
      el.textContent='⏱️ DESCANSO FINALIZADO';
      el.style.cssText='position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.82);font-size:28px;font-weight:900;color:#c2410c;text-align:center;pointer-events:none';
      document.body.appendChild(el); setTimeout(()=>el.remove(),900);
      const C=window.AudioContext||window.webkitAudioContext;
      if(C){
        const c=new C();
        const now=c.currentTime;
        [0,0.22,0.44].forEach(t=>{
          const o=c.createOscillator(),g=c.createGain();
          o.frequency.value=880; g.gain.setValueAtTime(.18,now+t); g.gain.exponentialRampToValueAtTime(.001,now+t+.16);
          o.connect(g);g.connect(c.destination);o.start(now+t);o.stop(now+t+.17);
        });
        setTimeout(()=>c.close&&c.close(),900);
      }
    }catch(e){}
  }
  window.longRestHaptic=restFinishedSignal;

  function watchRest(){
    document.querySelectorAll('.restbox').forEach(box=>{
      if(box.classList.contains('done') && box.dataset.signalDone!=='1'){
        box.dataset.signalDone='1';
        restFinishedSignal();
      }else if(!box.classList.contains('done')){
        delete box.dataset.signalDone;
      }
    });
  }

  function observe(){
    addClearButton();
    removeEnterButtons();
    watchRest();
  }
  const mo=new MutationObserver(observe);
  mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(watchRest,250);
  setTimeout(observe,100); setTimeout(observe,500); setTimeout(observe,1200);
})();
