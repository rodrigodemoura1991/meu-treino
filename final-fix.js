/* FINAL FIX 2026-08-19 v3 */
(function(){
  const originalSetVal=window.setVal;
  if(typeof originalSetVal==='function'){
    window.setVal=function(k,i,s,kind,v){
      originalSetVal.apply(this,arguments);
      const n=Number(v);
      if(kind==='kg'&&n>0){
        const l=window.data?.logs?.[k];
        if(l&&!l.timerStartedAt){
          l.timerStartedAt=new Date().toISOString();
          l.timerElapsed=Number(l.timerElapsed||0);
          if(typeof window.save==='function')window.save(k);
          if(typeof window.startTimerLoop==='function')window.startTimerLoop();
          const clock=document.getElementById('workoutClock');
          if(clock&&typeof window.workoutTimerState==='function'&&typeof window.fmtDuration==='function')clock.textContent=window.fmtDuration(window.workoutTimerState(l));
        }
      }
      if(kind==='reps'&&n>0)setTimeout(function(){
        const name=window.exFor?(window.exFor(window.current)?.[i]?.[0]):null;
        if(!name)return;
        const seconds=(window.restPreset&&window.restPreset[name])||90;
        const box=document.getElementById('rest-'+i);
        if(!box||typeof window.toggleRest!=='function')return;
        if(window.restIntervals?.[i]){clearInterval(window.restIntervals[i]);delete window.restIntervals[i];box.classList.remove('done')}
        window.toggleRest(i,seconds,name);
      },120);
    };
  }

  // Direct access to the global lexical workout configuration.
  try{
    const w=eval('workouts');
    if(w?.Quarta?.ex){
      const idx=w.Quarta.ex.findIndex(x=>x[0]==='Elevação pélvica');
      if(idx>=0)w.Quarta.ex.splice(idx,1,['Cadeira abdutora',3,'10–15']);
      else if(!w.Quarta.ex.some(x=>x[0]==='Cadeira abdutora'))w.Quarta.ex.splice(2,0,['Cadeira abdutora',3,'10–15']);
    }
    const rp=eval('restPreset');
    if(rp)rp['Cadeira abdutora']=75;
  }catch(e){console.error('workout config fix',e)}

  window.timerCard=function(l,k){
    const elapsed=typeof window.workoutTimerState==='function'?window.workoutTimerState(l):0;
    return '<section class="card workoutTimer"><div style="text-align:center"><span class="timerLabel" style="display:block;font-weight:800;margin-bottom:8px">⏱️ TEMPO DE TREINO</span><strong id="workoutClock" style="display:block;font-size:32px;line-height:1.2">'+(typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):'0:00:00')+'</strong></div></section>';
  };

  window.finishAndSaveWorkout=async function(k){
    const l=window.data?.logs?.[k];if(!l)return;
    if(l.timerStartedAt){
      const elapsed=typeof window.workoutTimerState==='function'?window.workoutTimerState(l):0;
      l.timerElapsed=elapsed;
      l.duration=typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):l.duration;
      delete l.timerStartedAt;
      if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null}
    }
    l.completed=true;
    if(typeof window.save==='function')await window.save(k);
    if(typeof window.render==='function')window.render();
    const el=document.createElement('div');
    el.textContent='✓ Treino salvo';
    el.style.cssText='position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:99999;background:#1f9d55;color:#fff;padding:14px 24px;border-radius:14px;font-weight:800;font-size:18px;box-shadow:0 8px 30px rgba(0,0,0,.2)';
    document.body.appendChild(el);setTimeout(()=>el.remove(),2200);
  };

  function patchSaveButton(){
    document.querySelectorAll('button').forEach(btn=>{
      if((btn.textContent||'').includes('Salvar treino')&&!btn.dataset.finalSavePatched){
        const m=btn.getAttribute('onclick')||'';const match=m.match(/save\('([^']+)'\)/);
        if(match){btn.dataset.finalSavePatched='1';btn.setAttribute('onclick',"finishAndSaveWorkout('"+match[1]+"')")}
      }
    });
  }
  const observer=new MutationObserver(patchSaveButton);observer.observe(document.documentElement,{childList:true,subtree:true});
  patchSaveButton();setTimeout(patchSaveButton,500);
  setTimeout(function(){if(typeof window.render==='function')window.render()},100);
})();