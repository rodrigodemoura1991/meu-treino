/* STORY RUNTIME FIX 3 — usa a mesma variável `data` do app, além do localStorage. */
(function(){
  function sync(){
    try{
      // app.js declara `let data` no escopo global do script.
      // Scripts carregados depois conseguem ler essa binding mesmo ela não
      // sendo uma propriedade de window. Esta é a fonte mais confiável.
      if(typeof data !== 'undefined' && data && typeof data === 'object'){
        window.data = data;
        if(!window.data.logs) window.data.logs = {};
        return window.data;
      }
    }catch(e){}

    try{
      const raw=localStorage.getItem('meu_treino_reset_v1');
      const parsed=raw?JSON.parse(raw):{logs:{}};
      window.data=parsed && typeof parsed==='object' ? parsed : {logs:{}};
      if(!window.data.logs) window.data.logs={};
    }catch(e){
      window.data={logs:{}};
    }
    return window.data;
  }

  sync();
  window.storySyncData=sync;
  document.addEventListener('click',sync,true);
  window.addEventListener('pageshow',sync);
  window.addEventListener('focus',sync);

  // Reaplica o vínculo pouco antes do clique do gerador.
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('#storyBtn,#reportStoryBtn');
    if(b) sync();
  },true);
})();
