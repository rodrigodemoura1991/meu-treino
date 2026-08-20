/* TIMER HARD FIX — 2026-08-20
   Corrige definitivamente finalizar/zerar sem apagar a duração salva. */
(function(){
  function currentKey(){return typeof window.key==='function'&&typeof window.current!=='undefined'&&typeof window.today==='function'?window.key(window.current,window.today()):null}
  function getLog(k){return k&&window.data?.logs?.[k]}
  function hardStop(){
    const k=currentKey(), l=getLog(k); if(!l)return;
    let elapsed=0;
    if(typeof window.workoutTimerState==='function') elapsed=window.workoutTimerState(l);
    else if(l.timerStartedAt) elapsed=Math.max(0,Math.floor((Date.now()-new Date(l.timerStartedAt).getTime())/1000)+Number(l.timerElapsed||0));
    else elapsed=Number(l.timerElapsed||0);
    if(elapsed>0 && typeof window.fmtDuration==='function') l.duration=window.fmtDuration(elapsed);
    delete l.timerStartedAt;
    l.timerElapsed=0;
    l.completed=true;
    if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null}
    if(typeof window.localSave==='function')window.localSave();
    if(typeof window.queueSave==='function')window.queueSave(k);
    else if(typeof window.save==='function')window.save(k);
    const clock=document.getElementById('workoutClock');if(clock)clock.textContent='0:00:00';
    return false;
  }
  function patch(){
    window.stopWorkout=hardStop;
    document.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if((t.includes('zerar')||t.includes('resetar'))&&!b.dataset.timerHardFix){
        b.dataset.timerHardFix='1';b.onclick=hardStop;b.removeAttribute('disabled');
      }
      if(t.includes('salvar treino')&&!b.dataset.timerHardSave){
        b.dataset.timerHardSave='1';b.addEventListener('click',hardStop,true);
      }
    });
  }
  const mo=new MutationObserver(patch);mo.observe(document.documentElement,{childList:true,subtree:true});
  patch();setInterval(patch,500);
})();
