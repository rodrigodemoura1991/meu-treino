/* STORY MASTER FIX — 2026-08-19
   Este listener é carregado ANTES dos demais scripts para impedir que
   handlers antigos cancelem o clique do botão do Instagram.
*/
(function(){
  function run(){
    try{
      if(typeof window.generateStory==='function') return Promise.resolve(window.generateStory());
      if(typeof window.realInstagramStory==='function') return Promise.resolve(window.realInstagramStory());
      if(typeof window.postWorkoutInstagram==='function'){
        const input=document.querySelector('#storyDate2,#reportStoryDate,#periodReportDate');
        const date=input?.value?.slice(0,10);
        let d=null;
        try{ if(typeof data!=='undefined'&&data?.logs)d=data; }catch(e){}
        if(!d?.logs){try{d=JSON.parse(localStorage.getItem('meu_treino_reset_v1')||'{"logs":{}}')}catch(e){d={logs:{}}}}
        const found=Object.entries(d.logs||{}).find(([,l])=>l?.date===date);
        if(found) return Promise.resolve(window.postWorkoutInstagram(found[0]));
      }
      alert('O gerador do Story não carregou. Recarregue a página e tente novamente.');
    }catch(err){
      console.error('STORY MASTER FIX',err);
      alert('Não foi possível gerar o Story. Tente novamente.');
    }
  }
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button');
    if(!b)return;
    const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!t.includes('instagram'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    setTimeout(run,0);
  },true);
})();
