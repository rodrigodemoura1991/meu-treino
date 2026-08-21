/* Histórico da última carga E últimas repetições por exercício.
   Mostra os valores como placeholder semi-transparente.
   NÃO preenche automaticamente os campos: ao digitar, o histórico é substituído.
   v7: kg e reps são procurados de forma independente em todos os treinos anteriores. */
(function(){
  const KEY='meu_treino_reset_v1';
  const STYLE_ID='last-weight-reps-placeholder-style-v7';
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
    const data=getData(),today=currentDate(),out={};
    const logs=Object.values(data.logs||{})
      .filter(l=>l&&l.date&&String(l.date)<today&&typeof l.rows==='object')
      .sort((a,b)=>String(b.date).localeCompare(String(a.date)));

    // Procura cada exercício e cada série de forma independente.
    // Assim, se o último treino tiver carga sem reps (ou vice-versa),
    // ainda mostramos o último valor disponível de cada campo.
    for(const log of logs){
      const exercises=workouts?.[log.day]?.ex||[],rows=log.rows||{};
      exercises.forEach((ex,idx)=>{
        const name=normalize(ex[0]);
        if(!out[name])out[name]={kgSets:[],repsSets:[],lastKg:null,lastReps:null,dateKg:null,dateReps:null};
        const row=rows[idx]; if(!row)return;
        for(let s=0;s<12;s++){
          const kg=Number(row?.['kg'+s]),reps=Number(row?.['reps'+s]);
          if(out[name].kgSets[s]==null && Number.isFinite(kg) && kg>0){out[name].kgSets[s]=kg;if(out[name].lastKg==null){out[name].lastKg=kg;out[name].dateKg=log.date}}
          if(out[name].repsSets[s]==null && Number.isFinite(reps) && reps>0){out[name].repsSets[s]=reps;if(out[name].lastReps==null){out[name].lastReps=reps;out[name].dateReps=log.date}}
        }
        // Fallback: se a série específica não existir, o último valor
        // disponível de qualquer série daquele exercício continua válido.
        if(out[name].lastKg==null){for(let s=0;s<12;s++){const kg=Number(row?.['kg'+s]);if(kg>0){out[name].lastKg=kg;out[name].dateKg=log.date;break}}}
        if(out[name].lastReps==null){for(let s=0;s<12;s++){const reps=Number(row?.['reps'+s]);if(reps>0){out[name].lastReps=reps;out[name].dateReps=log.date;break}}}
      });
    }
    return out;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;
    st.textContent=`input.${KG_CLASS}::placeholder,input.${REPS_CLASS}::placeholder{color:#71808f;opacity:.48;font-weight:600;}input.${KG_CLASS},input.${REPS_CLASS}{-webkit-text-fill-color:inherit;}`;
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
        input.placeholder=value==null?'kg':'Último: '+String(value).replace('.',',')+' kg';
        if(value!=null){input.classList.add(KG_CLASS);input.dataset.lastWeight=String(value)}
      });

      repsInputs.forEach((input,setIndex)=>{
        input.classList.remove(REPS_CLASS);input.removeAttribute('data-last-reps');
        if(String(input.value||'').trim()!=='')return;
        const value=hist?(hist.repsSets[setIndex]??hist.lastReps):null;
        input.placeholder=value==null?'reps':'Último: '+String(value)+' reps';
        if(value!=null){input.classList.add(REPS_CLASS);input.dataset.lastReps=String(value)}
      });
    });
  }

  let timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(render,150)}
  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('storage',schedule);
  const app=document.getElementById('app');if(app){const mo=new MutationObserver(schedule);mo.observe(app,{childList:true,subtree:true})}
  // O cloud pode terminar de carregar depois da primeira renderização.
  [300,700,1200,2000,3500,5000,8000].forEach(ms=>setTimeout(schedule,ms));
})();
