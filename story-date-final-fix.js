/* STORY DATE FINAL FIX — 2026-08-19
   O botão do Story deve usar o campo de data que está dentro do próprio card,
   sem depender de IDs criados por scripts anteriores.
*/
(function(){
  function state(){
    try{
      if(typeof data!=='undefined' && data && data.logs) return data;
    }catch(e){}
    try{
      const raw=localStorage.getItem('meu_treino_reset_v1');
      const d=raw?JSON.parse(raw):null;
      if(d&&d.logs)return d;
    }catch(e){}
    return {logs:{}};
  }
  function findLog(date){
    const logs=state().logs||{};
    const found=Object.entries(logs).filter(([,l])=>l&&l.date===date);
    found.sort((a,b)=>String(b[1].updated_at||'').localeCompare(String(a[1].updated_at||'')));
    return found[0]||null;
  }
  function isoFromDateInput(v){
    if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;
    const m=String(v||'').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return m?m[3]+'-'+m[2]+'-'+m[1]:null;
  }
  function dateFromStoryButton(btn){
    const card=btn.closest('#reportStoryCard,section.card')||btn.parentElement;
    const inputs=[...(card?.querySelectorAll?.('input[type="date"]')||[])];
    const withValue=inputs.find(x=>x.value);
    if(withValue)return isoFromDateInput(withValue.value);
    const all=[...document.querySelectorAll('input[type="date"]')];
    const v=all.find(x=>x.value);
    return v?isoFromDateInput(v.value):null;
  }
  async function open(date){
    const k=findLog(date);
    if(!k){alert('Não há treino salvo para a data escolhida: '+String(date).split('-').reverse().join('/')+'.');return}
    if(typeof window.generateStoryForLog==='function'){
      await window.generateStoryForLog(k[0]);
      return;
    }
    if(typeof window.postWorkoutInstagram==='function'){
      await window.postWorkoutInstagram(k[0]);
      return;
    }
    alert('O gerador do Story ainda não carregou.');
  }
  function handle(e){
    const btn=e.target?.closest?.('button');
    if(!btn)return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!text.includes('instagram'))return;
    const card=btn.closest('#reportStoryCard,section.card');
    if(!card)return;
    const date=dateFromStoryButton(btn);
    if(!date){e.preventDefault();e.stopImmediatePropagation();alert('Selecione uma data do treino.');return}
    e.preventDefault();e.stopImmediatePropagation();
    open(date);
  }
  document.addEventListener('click',handle,true);
  window.storyDateFinalFix=handle;
})();
