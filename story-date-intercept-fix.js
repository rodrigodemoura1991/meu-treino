/* STORY DATE INTERCEPT FIX — 2026-08-19
   Corrige o card "Story do Instagram" criado pelo absolute-ux-fix2.
   Esse card usa #storyDate2, enquanto os geradores antigos procuravam
   somente #reportStoryDate/periodReportDate.
*/
(function(){
  function appData(){
    try{ if(typeof data!=='undefined' && data && data.logs) return data; }catch(e){}
    try{
      const raw=localStorage.getItem('meu_treino_reset_v1');
      const d=raw?JSON.parse(raw):null;
      if(d&&d.logs) return d;
    }catch(e){}
    return window.data&&window.data.logs?window.data:{logs:{}};
  }

  function selectedDate(btn){
    const card=btn.closest('#absoluteStoryCard2,#reportStoryCard,section.card')||btn.parentElement;
    const inputs=[...(card?.querySelectorAll?.('input[type="date"],input[type="datetime-local"]')||[])];
    const chosen=inputs.find(x=>x.value);
    if(chosen){
      const v=String(chosen.value||'');
      if(/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0,10);
    }
    const named=['storyDate2','reportStoryDate','periodReportDate'];
    for(const id of named){
      const el=document.getElementById(id);
      if(el?.value && /^\d{4}-\d{2}-\d{2}/.test(el.value)) return el.value.slice(0,10);
    }
    return null;
  }

  function findKey(date){
    const logs=appData().logs||{};
    const entries=Object.entries(logs).filter(([,l])=>l&&l.date===date);
    entries.sort((a,b)=>String(b[1]?.updated_at||'').localeCompare(String(a[1]?.updated_at||'')));
    return entries[0]?.[0]||null;
  }

  function handle(e){
    const b=e.target?.closest?.('button');
    if(!b)return;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!text.includes('instagram'))return;
    const card=b.closest('#absoluteStoryCard2,#reportStoryCard,section.card');
    if(!card)return;
    const date=selectedDate(b);
    if(!date){
      e.preventDefault();e.stopImmediatePropagation();
      alert('Selecione uma data do treino.');
      return;
    }
    const key=findKey(date);
    if(!key){
      e.preventDefault();e.stopImmediatePropagation();
      alert('Não há treino salvo para a data escolhida: '+date.split('-').reverse().join('/')+'.');
      return;
    }
    e.preventDefault();e.stopImmediatePropagation();
    if(typeof window.generateStoryForLog==='function'){
      Promise.resolve(window.generateStoryForLog(key)).catch(err=>console.error('Story:',err));
    }else if(typeof window.postWorkoutInstagram==='function'){
      Promise.resolve(window.postWorkoutInstagram(key)).catch(err=>console.error('Story:',err));
    }else{
      alert('O gerador do Story ainda não carregou.');
    }
  }

  document.addEventListener('click',handle,true);
})();
