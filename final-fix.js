/* FINAL FIX 2026-08-19
   - Removes manual START/STOP UI for the general workout timer.
   - General timer starts on first KG entry and stops on explicit Save workout.
   - Wednesday: replace Hip Thrust with Hip Abductor 3x10-15.
   - Rest timer starts automatically when reps are completed for each set.
*/
(function(){
  const originalSetVal = window.setVal;
  if (typeof originalSetVal === 'function') {
    window.setVal = function(k,i,s,kind,v){
      originalSetVal.apply(this,arguments);
      const n = Number(v);
      if (kind === 'kg' && n > 0) {
        const l = window.data?.logs?.[k];
        if (l && !l.timerStartedAt) {
          l.timerStartedAt = new Date().toISOString();
          l.timerElapsed = Number(l.timerElapsed || 0);
          if (typeof window.save === 'function') window.save(k);
          if (typeof window.startTimerLoop === 'function') window.startTimerLoop();
          if (typeof window.renderWorkoutOnly === 'function') window.renderWorkoutOnly();
        }
      }
      if (kind === 'reps' && n > 0) {
        setTimeout(function(){
          const name = window.exFor ? (window.exFor(window.current)?.[i]?.[0]) : null;
          if (!name || typeof window.restPreset === 'undefined') return;
          const seconds = window.restPreset[name] || 90;
          if (typeof window.toggleRest === 'function') window.toggleRest(i, seconds, name);
        }, 120);
      }
    };
  }

  // Ensure Wednesday's exercise list is correct even if an older script has already loaded.
  if (window.workouts?.Quarta) {
    const ex = window.workouts.Quarta.ex || [];
    const idx = ex.findIndex(x => x[0] === 'Elevação pélvica');
    if (idx >= 0) ex.splice(idx,1,['Cadeira abdutora',3,'10–15']);
    else if (!ex.some(x => x[0] === 'Cadeira abdutora')) {
      const legIdx = ex.findIndex(x => x[0] === 'Leg press 45°');
      ex.splice(Math.max(0,legIdx+1),0,['Cadeira abdutora',3,'10–15']);
    }
  }

  function patchTimerCard(){
    if (typeof window.timerCard !== 'function') return;
    const old = window.timerCard;
    window.timerCard = function(l,k){
      const running = !!l.timerStartedAt;
      return '<section class="card workoutTimer"><div><span class="timerLabel">⏱️ TEMPO DE TREINO</span><strong id="workoutClock">'+(typeof window.fmtDuration==='function'?window.fmtDuration(window.workoutTimerState(l)):'0:00:00')+'</strong><small>'+(running?'Treino em andamento':'Começa ao preencher a primeira carga')+'</small></div></section>';
    };
  }
  patchTimerCard();

  // Replace save action with an explicit finalization, including timer stop and confirmation.
  window.finishAndSaveWorkout = async function(k){
    const l = window.data?.logs?.[k];
    if (!l) return;
    if (l.timerStartedAt) {
      const elapsed = typeof window.workoutTimerState==='function' ? window.workoutTimerState(l) : 0;
      l.timerElapsed = elapsed;
      l.duration = typeof window.fmtDuration==='function' ? window.fmtDuration(elapsed) : l.duration;
      delete l.timerStartedAt;
      if (window.workoutInterval) { clearInterval(window.workoutInterval); window.workoutInterval=null; }
    }
    l.completed = true;
    if (typeof window.save === 'function') await window.save(k);
    if (typeof window.render === 'function') window.render();
    const el=document.createElement('div');
    el.textContent='✓ Treino salvo';
    el.style.cssText='position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:99999;background:#1f9d55;color:#fff;padding:14px 24px;border-radius:14px;font-weight:800;font-size:18px;box-shadow:0 8px 30px rgba(0,0,0,.2)';
    document.body.appendChild(el); setTimeout(()=>el.remove(),2200);
  };

  function patchSaveButton(){
    document.querySelectorAll('button').forEach(btn=>{
      if ((btn.textContent||'').includes('Salvar treino') && !btn.dataset.finalSavePatched) {
        const m=btn.getAttribute('onclick')||'';
        const match=m.match(/save\('([^']+)'\)/);
        if(match){ btn.dataset.finalSavePatched='1'; btn.setAttribute('onclick',"finishAndSaveWorkout('"+match[1]+"')"); }
      }
    });
  }
  const observer=new MutationObserver(patchSaveButton);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  patchSaveButton();
  setTimeout(patchSaveButton,500);
})();
