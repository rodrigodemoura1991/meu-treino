/* Cronômetro geral — correção robusta
   - START inicia e persiste o instante de início.
   - O relógio é calculado por Date.now(), portanto não depende da frequência do setInterval.
   - Salvar treino encerra o cronômetro antes de persistir o registro.
   - A lógica é a mesma para todos os dias.
*/
(function(){
  const pad=n=>String(n).padStart(2,'0');
  const fmt=s=>Math.floor(s/3600)+':'+pad(Math.floor((s%3600)/60))+':'+pad(s%60);
  const currentKey=()=>key(current,today());
  const currentLog=()=>ensure(currentKey(),current,today());
  function elapsed(l){
    if(!l) return 0;
    const base=Number(l.timerElapsed||0);
    if(!l.timerStartedAt) return base;
    const started=Date.parse(l.timerStartedAt);
    return base+(Number.isFinite(started)?Math.max(0,Math.floor((Date.now()-started)/1000)):0);
  }
  window.startWorkout=function(){
    const k=currentKey(), l=currentLog();
    if(l.timerStartedAt) { startTimerLoop(); return; }
    l.timerElapsed=Number(l.timerElapsed||0);
    l.timerStartedAt=new Date().toISOString();
    localSave();
    queueSave(k);
    render();
    startTimerLoop();
  };
  window.stopWorkout=function(){
    const k=currentKey(), l=currentLog();
    if(!l.timerStartedAt){
      if(workoutInterval){clearInterval(workoutInterval);workoutInterval=null;}
      return false;
    }
    const seconds=elapsed(l);
    l.timerElapsed=seconds;
    l.duration=fmt(seconds);
    delete l.timerStartedAt;
    if(workoutInterval){clearInterval(workoutInterval);workoutInterval=null;}
    localSave();
    queueSave(k);
    render();
    return true;
  };
  window.startTimerLoop=function(){
    if(workoutInterval) clearInterval(workoutInterval);
    workoutInterval=setInterval(function(){
      const l=data.logs[currentKey()];
      const out=document.getElementById('workoutClock');
      if(!l || !l.timerStartedAt){
        clearInterval(workoutInterval); workoutInterval=null; return;
      }
      if(out) out.textContent=fmt(elapsed(l));
    },250);
    const l=data.logs[currentKey()],out=document.getElementById('workoutClock');
    if(out) out.textContent=fmt(elapsed(l));
  };
  window.workoutTimerState=function(l){return elapsed(l)};
  // Captura o clique antes do onclick original do botão. Assim qualquer forma de
  // "Salvar treino" encerra o cronômetro primeiro, sem interferir nos autosaves.
  document.addEventListener('click',function(ev){
    const btn=ev.target.closest?.('button');
    if(!btn) return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(text.includes('salvar treino')) window.stopWorkout();
  },true);
})();
