/* TIMER ROOT FIX — fonte única para finalizar/zerar o cronômetro.
   O registro mantém `duration` para o Histórico, mas `timerElapsed` volta a 0
   para que a tela não reapresente o último treino como cronômetro ativo. */
(function(){
  const originalSave = window.save;

  function activeDay(){
    const b=document.querySelector('.daystrip button.active');
    const s=(b?.querySelector('small')?.textContent||'').trim().toUpperCase();
    return ({SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta',SEX:'Sexta',SÁB:'Sábado',SAB:'Sábado',DOM:'Domingo'})[s] || window.current || 'Segunda';
  }
  function currentLog(){
    const day=activeDay();
    const k=window.key(day,window.today());
    return {day,k,l:window.data?.logs?.[k]};
  }
  function elapsedOf(l){
    if(!l)return 0;
    if(typeof window.workoutTimerState==='function') return window.workoutTimerState(l);
    return l.timerStartedAt ? Math.max(0,Math.floor((Date.now()-new Date(l.timerStartedAt).getTime())/1000)+Number(l.timerElapsed||0)) : Number(l.timerElapsed||0);
  }
  function persist(k){
    if(typeof originalSave==='function') originalSave(k);
    else if(typeof window.localSave==='function') window.localSave();
    if(typeof window.queueSave==='function') window.queueSave(k);
  }
  function resetTimerOnly(){
    const {k,l}=currentLog(); if(!l)return;
    const elapsed=elapsedOf(l);
    if(elapsed>0 && !l.duration) l.duration=typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):String(elapsed);
    delete l.timerStartedAt;
    l.timerElapsed=0;
    if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null;}
    persist(k);
    const clock=document.getElementById('workoutClock');if(clock)clock.textContent='0:00:00';
    if(typeof window.render==='function') window.render();
  }
  function finishAndSave(){
    const {k,l}=currentLog(); if(!l)return;
    const elapsed=elapsedOf(l);
    if(elapsed>0) l.duration=typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):String(elapsed);
    delete l.timerStartedAt;
    l.timerElapsed=0;
    l.completed=true;
    if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null;}
    persist(k);
    if(typeof window.render==='function') window.render();
  }
  function patchButtons(){
    document.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(t.includes('salvar treino')){
        b.onclick=finishAndSave;
        b.removeAttribute('disabled');
      } else if(t==='zerar' || t.includes('zerar cronômetro') || t.includes('zerar cronometro')){
        b.onclick=resetTimerOnly;
        b.removeAttribute('disabled');
      }
    });
  }
  const observer=new MutationObserver(patchButtons);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  patchButtons();
})();
