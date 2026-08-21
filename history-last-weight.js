/* Histórico do último peso por exercício.
   Mostra a última carga como placeholder semi-transparente.
   O valor NÃO é preenchido automaticamente: ao digitar, o histórico é substituído. */
(function(){
  const KEY='meu_treino_reset_v1';
  const STYLE_ID='last-weight-placeholder-style-v5';
  const CLASS='last-weight-placeholder';

  function getData(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')||{logs:{}}}
    catch(e){return {logs:{}}}
  }

  function normalize(s){
    return String(s||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ').trim().toLowerCase();
  }

  function currentDate(){
    const d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function exerciseName(card){
    const el=card?.querySelector('.exname');
    return normalize((el?.textContent||'').replace(/^\d+\.\s*/,''));
  }

  function historyMap(){
    const data=getData();
    const today=currentDate();
    const logs=Object.values(data.logs||{})
      .filter(l=>l && l.date && String(l.date)<today && workouts?.[l.day]?.ex)
      .sort((a,b)=>String(b.date).localeCompare(String(a.date)));

    const out={};
    for(const log of logs){
      const exercises=workouts[log.day]?.ex||[];
      const rows=log.rows||{};
      exercises.forEach((ex,idx)=>{
        const name=normalize(ex[0]);
        if(out[name])return;
        const row=rows[idx];
        if(!row)return;
        const sets=[];
        let last=null;
        for(let s=0;s<12;s++){
          const n=Number(row?.['kg'+s]);
          if(Number.isFinite(n)&&n>0){sets[s]=n;last=n}
        }
        if(last!=null)out[name]={sets,last,date:log.date};
      });
    }
    return out;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      input.${CLASS}::placeholder{
        color:#71808f;
        opacity:.48;
        font-weight:600;
      }
    `;
    document.head.appendChild(st);
  }

  function render(){
    const cards=[...document.querySelectorAll('.exercise')];
    if(!cards.length)return;
    installStyle();
    const map=historyMap();

    cards.forEach(card=>{
      const hist=map[exerciseName(card)];
      const inputs=[...card.querySelectorAll('input[data-kind="kg"]')];
      inputs.forEach((input,setIndex)=>{
        input.classList.remove(CLASS);
        input.removeAttribute('data-last-weight');
        if(String(input.value||'').trim()!=='')return;
        const original='kg';
        const value=hist ? (hist.sets[setIndex] ?? hist.last) : null;
        if(value==null){input.placeholder=original;return}
        input.placeholder='Último: '+String(value).replace('.',',')+' kg';
        input.classList.add(CLASS);
        input.dataset.lastWeight=String(value);
      });
    });
  }

  let timer=null;
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(render,150);
  }

  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('storage',schedule);

  const app=document.getElementById('app');
  if(app){
    const mo=new MutationObserver(schedule);
    mo.observe(app,{childList:true,subtree:true});
  }

  setTimeout(schedule,300);
  setTimeout(schedule,1000);
  setTimeout(schedule,2000);
})();
