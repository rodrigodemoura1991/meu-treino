/* TIMER SAVE FINAL FIX — salva a duração e encerra a sessão visualmente. */
(function(){
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function activeDay(){
    const b=document.querySelector('.daystrip button.active');
    const s=(b?.querySelector('small')?.textContent||b?.textContent||'').trim().toUpperCase();
    return ({SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta',SEX:'Sexta',SÁB:'Sábado',SAB:'Sábado',DOM:'Domingo'})[s]||window.current||'Quinta';
  }
  function finalize(){
    try{
      if(typeof data==='undefined'||typeof key!=='function') return;
      const day=activeDay(), k=key(day,today()), l=data.logs?.[k];
      if(!l?.timerStartedAt) return;
      const elapsed=typeof workoutTimerState==='function'?workoutTimerState(l):Math.max(0,Math.floor((Date.now()-new Date(l.timerStartedAt).getTime())/1000)+Number(l.timerElapsed||0));
      l.timerElapsed=elapsed;
      l.duration=typeof fmtDuration==='function'?fmtDuration(elapsed):String(elapsed);
      delete l.timerStartedAt;
      if(typeof save==='function') save(k);
      if(typeof workoutInterval!=='undefined' && workoutInterval){clearInterval(workoutInterval);workoutInterval=null}
      const clock=document.getElementById('workoutClock'); if(clock) clock.textContent='0:00:00';
      const summary=document.getElementById('summaryDuration'); if(summary) summary.textContent=l.duration;
      /* Re-rendering is intentionally delayed so the original save handler finishes first. */
      setTimeout(()=>{try{if(typeof render==='function')render()}catch(e){}},80);
    }catch(e){console.warn('timer-save-final-fix',e)}
  }
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button'); if(!b)return;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!text.includes('salvar')) return;
    setTimeout(finalize,150);
  },false);
})();
