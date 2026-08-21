/* Histórico da última carga E últimas repetições por exercício.
   Mostra os valores como placeholder semi-transparente.
   NÃO preenche automaticamente os campos: ao digitar, o histórico é substituído. */
(function(){
  const KEY='meu_treino_reset_v1';
  const STYLE_ID='last-weight-reps-placeholder-style-v6';
  const KG_CLASS='last-weight-placeholder';
  const REPS_CLASS='last-reps-placeholder';

  function getData(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')||{logs:{}}}
    catch(e){return {logs:{}}}
  }
  function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase()}
  function currentDate(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function exerciseName(card){const el=card?.querySelector('.exname');return normalize((el?.textContent||'').replace(/^\d+\.\s*/,''))}

  function historyMap(){
    const data=getData(),today=currentDate();
    const logs=Object.values(data.logs||{})
      .filter(l=>l&&l.date&&String(l.date)<today&&workouts?.[l.day]?.ex)
      .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const out={};
    for(const log of logs){
      const exercises=workouts[log.day]?.ex||[],rows=log.rows||{};
      exercises.forEach((ex,idx)=>{
        const name=normalize(ex[0]); if(out[name])return;
        const row=rows[idx]; if(!row)return;
        const kgSets=[],repsSets=[]; let lastKg=null,lastReps=null;
        for(let s=0;s<12;s++){
          const kg=Number(row?.['kg'+s]),reps=Number(row?.['reps'+s]);
          if(Number.isFinite(kg)&&kg>0){kgSets[s]=kg;lastKg=kg}
          if(Number.isFinite(reps)&&reps>0){repsSets[s]=reps;lastReps=reps}
        }
        if(lastKg!=null||lastReps!=null)out[name]={kgSets,repsSets,lastKg,lastReps,date:log.date};
      });
    }
    return out;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;
    st.textContent=`input.${KG_CLASS}::placeholder,input.${REPS_CLASS}::placeholder{color:#71808f;opacity:.48;font-weight:600;}`;
    document.head.appendChild(st);
  }

  function render(){
    const cards=[...document.querySelectorAll('.exercise')];if(!cards.length)return;
    installStyle();const map=historyMap();
    cards.forEach(card=>{
      const hist=map[exerciseName(card)];
      const kgInputs=[...card.querySelectorAll('input[data-kind="kg"]')];
      const repsInputs=[...card.querySelectorAll('input[data-kind="reps"]')];
      kgInputs.forEach((input,setIndex)=>{
        input.classList.remove(KG_CLASS);input.removeAttribute('data-last-weight');
        if(String(input.value||'').trim()!=='')return;
        const value=hist?(hist.kgSets[setIndex]??hist.lastKg):null;
        if(value==null){input.placeholder='kg';return}
        input.placeholder='Último: '+String(value).replace('.',',')+' kg';input.classList.add(KG_CLASS);input.dataset.lastWeight=String(value);
      });
      repsInputs.forEach((input,setIndex)=>{
        input.classList.remove(REPS_CLASS);input.removeAttribute('data-last-reps');
        if(String(input.value||'').trim()!=='')return;
        const value=hist?(hist.repsSets[setIndex]??hist.lastReps):null;
        if(value==null){input.placeholder='reps';return}
        input.placeholder='Último: '+String(value)+' reps';input.classList.add(REPS_CLASS);input.dataset.lastReps=String(value);
      });
    });
  }
  let timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(render,150)}
  window.addEventListener('load',schedule);window.addEventListener('resize',schedule,{passive:true});window.addEventListener('storage',schedule);
  const app=document.getElementById('app');if(app){const mo=new MutationObserver(schedule);mo.observe(app,{childList:true,subtree:true})}
  setTimeout(schedule,300);setTimeout(schedule,1000);setTimeout(schedule,2000);setTimeout(schedule,3500);
})();
