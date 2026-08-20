/* DURATION SAVE FIX v2 — Salvar treino finaliza o cronômetro antes do save real. */
(function(){
  function currentDay(){
    const active=document.querySelector('.daystrip button.active');
    const s=active?.querySelector('small')?.textContent?.trim().toUpperCase();
    return ({SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta',SEX:'Sexta',SÁB:'Sábado',SAB:'Sábado',DOM:'Domingo'})[s]||null;
  }
  function finishBeforeSave(){
    try{if(typeof window.stopWorkout==='function') window.stopWorkout();}
    catch(e){console.warn('duration-save-fix',e)}
  }
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button'); if(!b)return;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!text.includes('salvar treino')||!currentDay())return;
    finishBeforeSave();
    /* Let the original app click continue and execute its normal save(). */
  },true);
})();
