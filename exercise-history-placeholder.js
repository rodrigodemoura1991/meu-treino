/* Histórico visual de carga/reps: mostra a última informação registrada como referência, sem preencher o campo. */
(function(){
  const STYLE_ID='exercise-history-placeholder-style';
  function historyForExercise(name,currentKey){
    const logs=Object.entries(window.data?.logs||{});
    const matches=[];
    for(const [k,l] of logs){
      if(!l||k===currentKey) continue;
      const exs=window.workouts?.[l.day]?.ex||[];
      const idx=exs.findIndex(x=>x[0]===name);
      if(idx<0) continue;
      const row=l.rows?.[idx];
      if(!row) continue;
      const sets=[];
      for(let s=0;s<10;s++){
        const kg=String(row['kg'+s]??'').trim();
        const reps=String(row['reps'+s]??'').trim();
        if(kg||reps) sets.push({kg,reps});
      }
      if(sets.length) matches.push({date:l.date||'',sets});
    }
    matches.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    return matches[0]?.sets||[];
  }
  function apply(){
    if(!window.current || !window.days?.includes(window.current)) return;
    const k=window.key(window.current,window.today());
    document.querySelectorAll('.exercise').forEach(card=>{
      const name=(card.querySelector('.exname')?.textContent||'').trim();
      if(!name) return;
      const hist=historyForExercise(name,k);
      if(!hist.length) return;
      const inputs=[...card.querySelectorAll('input.field')];
      inputs.forEach((input,i)=>{
        const set=Math.floor(i/2), kind=input.dataset.kind;
        const value=hist[set]?.[kind==='kg'?'kg':'reps'];
        if(value && !input.value){
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
  css.id=STYLE_ID;
  css.textContent=`
    input.field.has-history-placeholder::placeholder{color:currentColor!important;opacity:.26!important;filter:blur(.35px)!important;font-weight:650}
    input.field.has-history-placeholder:focus::placeholder{opacity:.12!important}
  `;
  document.head.appendChild(css);
  const oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(apply,40);setTimeout(apply,220);return r};
  }
  document.addEventListener('input',e=>{if(e.target.matches('input.field')) e.target.classList.remove('has-history-placeholder')},true);
  const obs=new MutationObserver(()=>setTimeout(apply,30));
  obs.observe(document.body,{childList:true,subtree:true});
  setInterval(apply,1500);
})();
