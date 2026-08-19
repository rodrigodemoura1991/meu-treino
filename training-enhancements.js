/* Ajustes do treino: quarta + cronômetros automáticos */
(function(){
  if (window.workouts && workouts.Quarta && Array.isArray(workouts.Quarta.ex)) {
    workouts.Quarta.ex = workouts.Quarta.ex.map(ex =>
      ex[0] === 'Elevação pélvica' ? ['Cadeira abdutora',3,'10–15'] : ex
    );
  }
  restPreset['Cadeira abdutora']=75;

  window.__autoRestStart = function(i, seconds, name){
    const box=document.getElementById('rest-'+i);
    if(!box) return;
    if(restIntervals[i]){
      clearInterval(restIntervals[i]);
      delete restIntervals[i];
    }
    const end=Date.now()+Number(seconds)*1000;
    box.classList.remove('done');
    const b=box.querySelector('b'), btn=box.querySelector('button');
    if(b) b.textContent=fmtTime(seconds);
    if(btn) btn.textContent='⏸';
    restIntervals[i]=setInterval(function(){
      const left=Math.max(0,Math.ceil((end-Date.now())/1000));
      if(b) b.textContent=fmtTime(left);
      if(left<=0){
        clearInterval(restIntervals[i]);
        delete restIntervals[i];
        finishRest(i);
      }
    },250);
  };

  function startFromReps(el, delay){
    if(!el || !String(el.value||'').trim()) return;
    const card=el.closest('.exercise');
    if(!card) return;
    const cards=[...document.querySelectorAll('.exercise')], i=cards.indexOf(card);
    if(i<0) return;
    const name=workouts[current]?.ex?.[i]?.[0], seconds=restPreset[name]||90;
    setTimeout(()=>window.__autoRestStart(i,seconds,name),delay||30);
  }

  document.addEventListener('change',function(e){
    const el=e.target;
    if(el?.matches?.('input.field[data-kind="reps"]')) startFromReps(el,30);
  },true);
  document.addEventListener('blur',function(e){
    const el=e.target;
    if(el?.matches?.('input.field[data-kind="reps"]')) startFromReps(el,50);
  },true);

  const oldWorkout=window.workout;
  if(typeof oldWorkout==='function'){
    window.workout=function(){
      let html=oldWorkout.apply(this,arguments);
      html=html.replace('Inicie antes da primeira série','');
      return html;
    };
  }
})();
