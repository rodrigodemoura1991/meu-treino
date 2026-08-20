/* HISTÓRICO DE CARGA/REPS v3 — última informação real do exercício, em qualquer dia. */
(function(){
  const STORE='meu_treino_reset_v1';
  function read(){try{return JSON.parse(localStorage.getItem(STORE)||'{"logs":{}}')}catch(e){return {logs:{}}}}
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function exerciseIndex(day,name){
    try{
      const list=window.workouts?.[day]?.ex||[];
      return list.findIndex(ex=>String(ex?.[0]||'').trim()===name);
    }catch(e){return -1}
  }
  function historyForExercise(name){
    const logs=Object.values(read().logs||{}),matches=[];
    for(const l of logs){
      if(!l||!l.day||!l.date||l.date===today())continue;
      const idx=exerciseIndex(l.day,name);if(idx<0)continue;
      const row=l.rows?.[idx];if(!row)continue;
      const sets=[];
      for(let s=0;s<10;s++){
        const kg=String(row['kg'+s]??'').trim();
        const reps=String(row['reps'+s]??'').trim();
        if(kg||reps)sets.push({kg,reps});
      }
      if(sets.length)matches.push({date:l.date,sets});
    }
    matches.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    return matches[0]?.sets||[];
  }
  function apply(){
    document.querySelectorAll('.exercise').forEach(card=>{
      const name=(card.querySelector('.exname')?.textContent||'').replace(/^\d+\.\s*/,'').trim();
      if(!name)return;
      const hist=historyForExercise(name);if(!hist.length)return;
      [...card.querySelectorAll('input.field')].forEach((input,i)=>{
        const set=Math.floor(i/2);
        const kind=input.dataset.kind;
        const value=hist[set]?.[kind==='kg'?'kg':'reps'];
        if(value&&!input.value){
          input.placeholder=value;
          input.classList.add('has-history-placeholder');
          input.title='Último registro: '+value;
        }else if(input.value){
          input.classList.remove('has-history-placeholder');
        }
      });
    });
  }
  const css=document.createElement('style');
  css.textContent='input.field.has-history-placeholder::placeholder{color:#f1f5f9!important;opacity:.30!important;filter:blur(.35px)!important;font-weight:650}input.field.has-history-placeholder:focus::placeholder{opacity:.10!important}';
  document.head.appendChild(css);
  document.addEventListener('input',e=>{if(e.target.matches('input.field'))e.target.classList.remove('has-history-placeholder')},true);
  const obs=new MutationObserver(()=>setTimeout(apply,40));
  obs.observe(document.body,{childList:true,subtree:true});
  setInterval(apply,1200);setTimeout(apply,100);setTimeout(apply,500);
})();
