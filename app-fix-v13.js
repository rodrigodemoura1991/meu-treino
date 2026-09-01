/* MEU TREINO — correção de registro fantasma e dia inicial */
(()=>{
  'use strict';

  const BAD_KEY='Segunda|2026-09-01';
  const LOCAL_KEY_NAME='meu_treino_reset_v2';

  function removeKnownBadRecord(){
    try{
      if(typeof data!=='undefined' && data?.logs?.[BAD_KEY]){
        delete data.logs[BAD_KEY];
        if(typeof persist==='function') persist();
      }
      if(typeof drafts!=='undefined' && drafts?.[BAD_KEY]) delete drafts[BAD_KEY];
    }catch(e){ console.warn('cleanup registro fantasma',e); }
  }

  function weekdayName(){
    const names=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    return names[new Date().getDay()];
  }

  function setInitialDayOnce(){
    if(window.__MEU_TREINO_INITIAL_DAY_V13) return;
    window.__MEU_TREINO_INITIAL_DAY_V13=true;
    const day=weekdayName();
    try{
      if(typeof editDate!=='undefined' && editDate) return;
      if(typeof current!=='undefined' && typeof go==='function'){
        go(day);
      }
    }catch(e){ console.warn('dia inicial',e); }
  }

  /* O registro abaixo foi criado por engano em 01/09/2026 e não corresponde
     ao treino de terça. A remoção é somente local; o registro equivalente
     já foi removido especificamente no Supabase, sem tocar nos demais. */
  removeKnownBadRecord();

  /* Aguarda a primeira renderização para não disputar com o carregamento do Supabase. */
  setTimeout(()=>{
    removeKnownBadRecord();
    setInitialDayOnce();
    if(typeof render==='function') render();
  },700);

  setTimeout(()=>{
    removeKnownBadRecord();
  },1800);
})();
