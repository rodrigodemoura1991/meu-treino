/* STATE ROOT FIX — separa treino em andamento do Histórico.
   Histórico = somente treino explicitamente salvo.
   Treino atual = rascunho independente. */
(function(){
  const DRAFT_KEY='meu_treino_current_v2';
  const OLD_DRAFT='meu_treino_draft_v1';
  let drafts={};
  try{localStorage.removeItem(OLD_DRAFT);drafts=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')||{}}catch(e){drafts={}}
  const blank=(day,date)=>({day,date,rows:{},notes:'',duration:'',avgBpm:'',calories:'',effort:'',cardio:{type:'',duration:'',distance:'',calories:'',avgBpm:''},timerElapsed:0});
  const dkey=(day,date)=>day+'|'+date;
  function getDraft(k,day,date){if(!drafts[k])drafts[k]=blank(day,date);const d=drafts[k];d.day=day;d.date=date;d.rows=d.rows||{};d.cardio=d.cardio||{type:'',duration:'',distance:'',calories:'',avgBpm:''};return d}
  function persist(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(drafts))}catch(e){}}

  window.ensure=function(k,day,date){return getDraft(k,day,date)};
  window.setVal=function(k,i,s,f,v){const l=getDraft(dkey(current,today()),current,today());l.rows[i]??={};l.rows[i][f+s]=v;persist();setStatus(user&&cloudReady?'☁ Rascunho salvo • pronto para salvar':'☁ Rascunho salvo',!!(user&&cloudReady));if(typeof updateWorkoutSummary==='function')updateWorkoutSummary()};
  window.setObs=function(k,i,v){const l=getDraft(dkey(current,today()),current,today());l.rows[i]??={};l.rows[i].observation=v;persist()};
  window.setMetric=function(k,f,v){const l=getDraft(dkey(current,today()),current,today());l[f]=v;persist();if(typeof updateWorkoutSummary==='function')updateWorkoutSummary()};
  window.setCardio=function(k,f,v){const l=getDraft(dkey(current,today()),current,today());l.cardio[f]=v;persist()};
  window.setNotes=function(k,v){const l=getDraft(dkey(current,today()),current,today());l.notes=v;persist()};

  const originalWorkout=window.workout;
  window.workout=function(){const k=dkey(current,today()),old=data.logs[k],draft=getDraft(k,current,today());data.logs[k]=draft;try{return originalWorkout.apply(this,arguments)}finally{if(old)data.logs[k]=old;else delete data.logs[k]}};

  // Bloqueia o antigo draft-autosave de reintroduzir dados antigos durante o render.
  const originalRender=window.render;
  window.render=function(){
    if(days.includes(current)){
      const k=dkey(current,today()),old=data.logs[k],draft=getDraft(k,current,today());
      data.logs[k]=draft;
      try{return originalRender.apply(this,arguments)}finally{if(old)data.logs[k]=old;else delete data.logs[k]}
    }
    return originalRender.apply(this,arguments);
  };

  window.save=async function(k){
    if(!days.includes(current))return;
    const dk=dkey(current,today()),draft=getDraft(dk,current,today());
    const snapshot=JSON.parse(JSON.stringify(draft));
    snapshot.day=current;snapshot.date=today();snapshot.updatedAt=new Date().toISOString();
    delete snapshot.timerStartedAt;snapshot.timerElapsed=0;snapshot.completed=true;
    data.logs[dk]=snapshot;
    localSave();
    if(user&&sb){try{const {error}=await sb.from('workout_logs').upsert({user_id:user.id,log_key:CLOUD_PREFIX+dk,day:snapshot.day,workout_date:snapshot.date,payload:snapshot,updated_at:snapshot.updatedAt},{onConflict:'user_id,log_key'});if(error)throw error;cloudReady=true;setStatus('☁ Online • salvo',true)}catch(e){console.error('root save',e);setStatus('⚠ Salvo neste aparelho')}}
    delete drafts[dk];persist();
    if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null}
    setTimeout(()=>{if(typeof render==='function')render()},0);
  };

  window.startWorkout=function(){const k=dkey(current,today()),l=getDraft(k,current,today());if(l.timerStartedAt)return;l.timerStartedAt=new Date().toISOString();l.timerElapsed=Number(l.timerElapsed||0);persist();render();window.startTimerLoop()};
  window.stopWorkout=function(){const k=dkey(current,today()),l=getDraft(k,current,today());if(!l.timerStartedAt)return;const elapsed=workoutTimerState(l);l.timerElapsed=elapsed;l.duration=fmtDuration(elapsed);delete l.timerStartedAt;persist();if(workoutInterval){clearInterval(workoutInterval);workoutInterval=null}render()};
  window.startTimerLoop=function(){if(workoutInterval)clearInterval(workoutInterval);workoutInterval=setInterval(()=>{const k=dkey(current,today()),l=drafts[k];if(!l?.timerStartedAt){clearInterval(workoutInterval);workoutInterval=null;return}const out=$('workoutClock');if(out)out.textContent=fmtDuration(workoutTimerState(l))},1000)};

  window.resetCurrentWorkout=function(){const k=dkey(current,today());drafts[k]=blank(current,today());persist();if(workoutInterval){clearInterval(workoutInterval);workoutInterval=null}render();setTimeout(()=>{const c=$('workoutClock');if(c)c.textContent='0:00:00'},20)};

  function patchButtons(){document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t==='zerar'||t.includes('zerar cronômetro')||t.includes('zerar cronometro')){b.onclick=window.resetCurrentWorkout;b.removeAttribute('disabled')}if(t.includes('salvar treino')){if(!b.dataset.stateRoot){b.dataset.stateRoot='1';b.onclick=()=>window.save(dkey(current,today()))}}})}
  const mo=new MutationObserver(patchButtons);mo.observe(document.documentElement,{childList:true,subtree:true});patchButtons();setInterval(patchButtons,700);

  try{localStorage.removeItem(OLD_DRAFT)}catch(e){}
  persist();
})();
