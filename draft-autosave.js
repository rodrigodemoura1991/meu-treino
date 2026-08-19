/* Rascunho automático: campos persistem sem criar registro no Histórico. */
(function(){
  const DRAFT_KEY='meu_treino_draft_v1';
  let draftCache={};
  try{draftCache=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')||{}}catch(e){draftCache={}}
  const draftKey=(day,date)=>day+'|'+date;
  const originalEnsure=ensure;
  const originalSave=save;
  const originalRender=render;
  function draftFor(k,day,date){
    if(!draftCache[k]){
      const existing=data.logs[k];
      draftCache[k]=existing?JSON.parse(JSON.stringify(existing)):{day,date,rows:{},notes:'',duration:'',avgBpm:'',calories:'',effort:'',cardio:{type:'',duration:'',distance:'',calories:'',avgBpm:''}};
    }
    const d=draftCache[k];
    d.day=day; d.date=date; d.rows=d.rows||{};
    d.cardio=d.cardio||{type:'',duration:'',distance:'',calories:'',avgBpm:''};
    return d;
  }
  function persist(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(draftCache))}catch(e){}}
  function hasContent(l){if(!l)return false; if(l.notes||l.duration||l.avgBpm||l.calories||l.effort)return true; const c=l.cardio||{};if(Object.values(c).some(v=>v!==''&&v!=null))return true; return Object.values(l.rows||{}).some(r=>Object.values(r||{}).some(v=>v!==''&&v!=null));}
  ensure=function(k,day,date){return draftFor(k,day,date)};
  setVal=function(k,i,s,f,v){const l=draftFor(k,current,today());l.rows[i]??={};l.rows[i][f+s]=v;persist();setStatus(user&&cloudReady?'☁ Rascunho salvo • pronto para salvar':'☁ Rascunho salvo',!!(user&&cloudReady));};
  setObs=function(k,i,v){const l=draftFor(k,current,today());l.rows[i]??={};l.rows[i].observation=v;persist()};
  setMetric=function(k,f,v){const l=draftFor(k,current,today());l[f]=v;persist();updateWorkoutSummary()};
  setCardio=function(k,f,v){const l=draftFor(k,current,today());l.cardio[f]=v;persist()};
  setNotes=function(k,v){const l=draftFor(k,current,today());l.notes=v;persist()};
  save=function(k){const d=draftFor(k,current,today());data.logs[k]=JSON.parse(JSON.stringify(d));localSave();queueSave(k);delete draftCache[k];persist();render();setStatus(user&&cloudReady?'☁ Online • salvo':'☁ Treino salvo neste aparelho',!!(user&&cloudReady));};
  function restoreDraftState(){
    const k=draftKey(current,today());
    const d=draftCache[k];
    if(!d||!hasContent(d))return;
    const active=ensure(k,current,today());
    Object.keys(active).forEach(x=>delete active[x]);
    Object.assign(active,JSON.parse(JSON.stringify(d)));
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify(draftCache))}catch(e){}
  }
  /* Não deixar o rascunho aparecer no Histórico. Ele só entra em data.logs após Salvar. */
  const oldHistory=history;
  history=function(){
    const k=draftKey(current,today()),saved=data.logs[k];
    if(saved && draftCache[k] && JSON.stringify(saved)!==JSON.stringify(draftCache[k])){delete draftCache[k];persist()}
    return oldHistory();
  };
  /* Reaplica o rascunho visual após cada render do treino, sem transformá-lo em registro. */
  render=function(){
    if(days.includes(current)){
      const k=draftKey(current,today());
      if(!data.logs[k] && draftCache[k]){
        data.logs[k]=JSON.parse(JSON.stringify(draftCache[k]));
        originalRender();
        delete data.logs[k];
        return;
      }
    }
    originalRender();
  };
  /* No carregamento inicial, se houver rascunho, mostrar seus campos mas mantê-lo fora do Histórico. */
  const k=draftKey(current,today());
  if(draftCache[k] && !data.logs[k]){
    const tmp=JSON.parse(JSON.stringify(draftCache[k]));
    data.logs[k]=tmp;
    setTimeout(()=>{if(!data.logs[k]||JSON.stringify(data.logs[k])===JSON.stringify(tmp))delete data.logs[k]},0);
  }
  window.addEventListener('beforeunload',persist);
  render();
})();
