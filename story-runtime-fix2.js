/* STORY RUNTIME FIX 2 — expõe o histórico salvo no aparelho para o gerador do Story. */
(function(){
  const STORAGE='meu_treino_reset_v1';
  function sync(){
    try{
      const raw=localStorage.getItem(STORAGE);
      const parsed=raw?JSON.parse(raw):{logs:{}};
      window.data=parsed && typeof parsed==='object' ? parsed : {logs:{}};
      if(!window.data.logs) window.data.logs={};
      return window.data;
    }catch(e){ window.data={logs:{}}; return window.data; }
  }
  sync();
  document.addEventListener('click',sync,true);
  window.addEventListener('storage',sync);
  window.addEventListener('pageshow',sync);
  window.storySyncData=sync;
})();
