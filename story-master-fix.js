/* STORY MASTER v2 — único ponto de entrada do botão. Nunca usa geradores antigos. */
(function(){
  function run(){
    try{
      if(typeof window.generateStoryFromCloudExact==='function') return Promise.resolve(window.generateStoryFromCloudExact());
      alert('O Story novo ainda não carregou. Recarregue a página e tente novamente.');
    }catch(err){console.error('STORY MASTER',err);alert('Não foi possível gerar o Story.');}
  }
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button'); if(!b)return;
    const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!t.includes('instagram'))return;
    e.preventDefault(); e.stopImmediatePropagation(); setTimeout(run,0);
  },true);
})();
