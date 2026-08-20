/* DURATION SAVE FIX — garante que o tempo do treino seja finalizado no registro definitivo. */
(function(){
  const DRAFT_KEY='meu_treino_draft_v1';
  const oldExplicit=window.explicitSave;

  function fmt(l,elapsed){
    if(typeof window.fmtDuration==='function') return window.fmtDuration(elapsed);
    const s=Math.max(0,Math.round(elapsed||0));
    return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  }

  function elapsedFor(l){
    if(!l) return 0;
    if(typeof window.workoutTimerState==='function'){
      try{return Math.max(0,Number(window.workoutTimerState(l))||0)}catch(e){}
    }
    const started=l.timerStartedAt?new Date(l.timerStartedAt).getTime():0;
    return started?Math.max(0,Math.floor((Date.now()-started)/1000)+Number(l.timerElapsed||0)):Math.max(0,Number(l.timerElapsed||0));
  }

  function finalize(l){
    if(!l) return false;
    if(!l.timerStartedAt && !(Number(l.timerElapsed)>0 && !l.duration)) return false;
    const elapsed=elapsedFor(l);
    l.timerElapsed=elapsed;
    l.duration=fmt(l,elapsed);
    delete l.timerStartedAt;
    return true;
  }

  function finalizeDraft(k){
    try{
      const drafts=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')||{};
      const d=drafts[k];
      if(d && finalize(d)){
        drafts[k]=d;
        localStorage.setItem(DRAFT_KEY,JSON.stringify(drafts));
      }
    }catch(e){console.warn('duration draft fix',e)}
  }

  window.explicitSave=function(k){
    /* O rascunho é a fonte que o save definitivo copia para data.logs. */
    finalizeDraft(k);
    const live=window.data?.logs?.[k];
    finalize(live);
    if(typeof oldExplicit==='function') return oldExplicit(k);
  };

  /* Fallback robusto: captura o clique mesmo se outra camada tiver reconstruído o onclick. */
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button');
    if(!b)return;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!text.includes('salvar treino') || typeof window.explicitSave!=='function')return;
    if(typeof window.days!=='undefined' && !window.days.includes(window.current))return;
    const k=(typeof window.key==='function'&&typeof window.today==='function')?window.key(window.current,window.today()):null;
    if(!k)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.explicitSave(k);
  },true);
})();
