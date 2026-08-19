/* FINAL FIX 2026-08-19 v2
   General timer: first KG starts; explicit Save stops.
   Wednesday: Hip Abductor 3x10-15.
   Rest: completing REPS automatically starts/restarts rest for that exercise.
*/
(function(){
  const originalSetVal = window.setVal;
  if (typeof originalSetVal === 'function') {
    window.setVal = function(k,i,s,kind,v){
      originalSetVal.apply(this,arguments);
      const n=Number(v);
      if(kind==='kg' && n>0){
        const l=window.data?.logs?.[k];
        if(l && !l.timerStartedAt){
          l.timerStartedAt=new Date().toISOString();
          l.timerElapsed=Number(l.timerElapsed||0);
          if(typeof window.save==='function') window.save(k);
          if(typeof window.startTimerLoop==='function') window.startTimerLoop();
          const clock=document.getElementById('workoutClock');
          if(clock && typeof window.workoutTimerState==='function' && typeof window.fmtDuration==='function') clock.textContent=window.fmtDuration(window.workoutTimerState(l));
          const hint=clock?.parentElement?.querySelector('small');
          if(hint) hint.textContent='Treino em andamento';
        }
      }
      if(kind==='reps' && n>0){
        setTimeout(function(){
          const name=window.exFor ? (window.exFor(window.current)?.[i]?.[0]) : null;
          if(!name) return;
          const seconds=(window.restPreset && window.restPreset[name]) || 90;
          const box=document.getElementById('rest-'+i);
          if(!box || typeof window.toggleRest!=='function') return;
          // Always RESTART the rest timer when a set's reps are completed.
          if(window.restIntervals?.[i]){
            clearInterval(window.restIntervals[i]);
            delete window.restIntervals[i];
            box.classList.remove('done');
            const b=box.querySelector('b'), btn=box.querySelector('button');
            if(b)b.textContent=window.fmtTime(seconds);
            if(btn)btn.textContent='▶';
          }
          window.toggleRest(i,seconds,name);
        },120);
      }
    };
  }

  if(window.workouts?.Quarta){
    const ex=window.workouts.Quarta.ex||[];
    const idx=ex.findIndex(x=>x[0]==='Elevação pélvica');
    if(idx>=0) ex.splice(idx,1,['Cadeira abdutora',3,'10–15']);
    else if(!ex.some(x=>x[0]==='Cadeira abdutora')){
      const legIdx=ex.findIndex(x=>x[0]==='Leg press 45°');
      ex.splice(Math.max(0,legIdx+1),0,['Cadeira abdutora',3,'10–15']);
    }
  }

  window.timerCard=function(l,k){
    const running=!!l.timerStartedAt;
    const elapsed=(typeof window.workoutTimerState==='function')?window.workoutTimerState(l):0;
    return '<section class="card workoutTimer"><div><span class="timerLabel">⏱️ TEMPO DE TREINO</span><strong id="workoutClock">'+(typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):'0:00:00')+'</strong><small>'+(running?'Treino em andamento':'Começa ao preencher a primeira carga')+'</small></div></section>';
  };

  window.finishAndSaveWorkout=async function(k){
    const l=window.data?.logs?.[k]; if(!l)return;
    if(l.timerStartedAt){
      const elapsed=typeof window.workoutTimerState==='function'?window.workoutTimerState(l):0;
      l.timerElapsed=elapsed;
      l.duration=typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):l.duration;
      delete l.timerStartedAt;
      if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null;}
    }
    l.completed=true;
    if(typeof window.save==='function') await window.save(k);
    if(typeof window.render==='function') window.render();
    const el=document.createElement('div');
    el.textContent='✓ Treino salvo';
    el.style.cssText='position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:99999;background:#1f9d55;color:#fff;padding:14px 24px;border-radius:14px;font-weight:800;font-size:18px;box-shadow:0 8px 30px rgba(0,0,0,.2)';
    document.body.appendChild(el);setTimeout(()=>el.remove(),2200);
  };

  function patchSaveButton(){
    document.querySelectorAll('button').forEach(btn=>{
      if((btn.textContent||'').includes('Salvar treino')&&!btn.dataset.finalSavePatched){
        const m=btn.getAttribute('onclick')||'';const match=m.match(/save\('([^']+)'\)/);
        if(match){btn.dataset.finalSavePatched='1';btn.setAttribute('onclick',"finishAndSaveWorkout('"+match[1]+"')");}
      }
    });
  }
  const observer=new MutationObserver(patchSaveButton);observer.observe(document.documentElement,{childList:true,subtree:true});patchSaveButton();setTimeout(patchSaveButton,500);
})();
