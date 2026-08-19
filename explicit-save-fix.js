/* Histórico + cronômetro automático: rascunho só vira treino ao tocar em Salvar treino. */
(function(){
  const originalSave=window.save;
  const originalWorkout=window.workout;
  const originalRender=window.render;

  function showSavedToast(){
    let t=document.getElementById('savedWorkoutToast');
    if(!t){
      t=document.createElement('div');
      t.id='savedWorkoutToast';
      t.textContent='✓ Treino salvo';
      Object.assign(t.style,{position:'fixed',left:'50%',bottom:'92px',transform:'translateX(-50%)',zIndex:'99999',background:'#198754',color:'#fff',padding:'14px 22px',borderRadius:'14px',fontWeight:'800',fontSize:'18px',boxShadow:'0 8px 24px rgba(0,0,0,.18)',opacity:'0',transition:'opacity .18s ease'});
      document.body.appendChild(t);
    }
    t.style.opacity='1';
    clearTimeout(window.__savedWorkoutToastTimer);
    window.__savedWorkoutToastTimer=setTimeout(()=>{t.style.opacity='0'},1800);
  }

  function finalizeTimer(k){
    const l=data?.logs?.[k];
    if(!l?.timerStartedAt)return;
    const elapsed=typeof workoutTimerState==='function'?workoutTimerState(l):Math.max(0,Math.floor((Date.now()-new Date(l.timerStartedAt).getTime())/1000)+Number(l.timerElapsed||0));
    l.timerElapsed=elapsed;
    l.duration=typeof fmtDuration==='function'?fmtDuration(elapsed):String(elapsed)+'s';
    delete l.timerStartedAt;
    if(typeof workoutInterval!=='undefined'&&workoutInterval){clearInterval(workoutInterval);workoutInterval=null}
  }

  window.explicitSave=function(k){
    finalizeTimer(k);
    if(typeof originalSave==='function')originalSave(k);
    const l=data?.logs?.[k];
    if(!l)return;
    l.explicitSaved=true;
    l.saved=true;
    try{localSave()}catch(e){}
    try{queueSave(k)}catch(e){}
    showSavedToast();
    setTimeout(()=>{try{render()}catch(e){}},0);
  };

  if(typeof originalWorkout==='function'){
    window.workout=function(){
      let html=originalWorkout.apply(this,arguments);
      html=html.replace(/onclick="save\('([^']+)'\);alert\('Treino salvo\.'\)"/g,'onclick="explicitSave(\'$1\')"');
      return html;
    };
  }

  function startOnFirstCharge(el){
    if(!el||el.dataset.kind!=='kg'||!String(el.value||'').trim())return;
    if(typeof days!=='undefined'&&!days.includes(current))return;
    const k=key(current,today());
    const l=ensure(k,current,today());
    if(l.explicitSaved===true||l.saved===true||l.timerStartedAt)return;
    if(typeof startWorkout==='function')startWorkout();
  }

  document.addEventListener('input',e=>{
    const el=e.target;
    if(el?.matches?.('input.field[data-kind="kg"]'))startOnFirstCharge(el);
  },true);

  function hideDraftHistory(){
    if(current!=='Histórico')return;
    document.querySelectorAll('.historyrow').forEach(row=>{
      const btn=row.querySelector('button[onclick*="deleteLog"]');
      const m=btn?.getAttribute('onclick')?.match(/deleteLog\('([^']+)'\)/);
      if(m&&data.logs[m[1]]?.explicitSaved!==true)row.remove();
    });
    const card=document.querySelector('.card .historyrow')?.closest('.card');
    if(card&&!card.querySelector('.historyrow'))card.innerHTML='<div class="emptyicon">📈</div><h2>Nenhum treino salvo</h2><p>Use “Salvar treino” para colocar o treino no histórico.</p>';
  }

  if(typeof originalRender==='function'){
    window.render=function(){
      const out=originalRender.apply(this,arguments);
      setTimeout(hideDraftHistory,0);
      return out;
    };
  }
})();
