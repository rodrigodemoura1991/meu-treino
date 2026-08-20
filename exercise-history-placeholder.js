/* Histórico visual de carga/reps: referência discreta, sem preencher automaticamente. */
(function(){
  const MAP={
    Segunda:['Abdominal máquina','Pêndulo','Cadeira extensora','Stiff com barra ou halteres','Supino inclinado com halteres','Supino reto máquina','Crucifixo máquina'],
    Terça:['Barra fixa ou puxada neutra','Remada articulada com apoio no peito','Remada unilateral na polia','PULLDOWN','Rosca direta com barra W','Rosca inclinada com halteres','Rosca martelo com halteres'],
    Quarta:['Abdominal máquina','Leg press 45°','Elevação pélvica','Cadeira flexora bilateral','Mesa flexora','Desenvolvimento máquina','Elevação lateral na polia','Crucifixo inverso máquina','Panturrilha em pé ou no leg press'],
    Quinta:['Supino reto com barra','Supino inclinado máquina','Supino reto máquina','Crossover de baixo para cima','Tríceps francês unilateral na polia','Tríceps barra V','Tríceps testa com barra W'],
    Sexta:['Abdominal máquina','Hack squat','Flexora unilateral','Remada baixa triângulo','Puxada alta pronada','Supino inclinado com halteres','Elevação lateral','Rosca Scott máquina','Tríceps corda','Panturrilha'],
    Sábado:['Elevação lateral','Crucifixo inverso','Rosca martelo','Tríceps corda','Panturrilha']
  };
  const STORE='meu_treino_reset_v1';
  function read(){try{return JSON.parse(localStorage.getItem(STORE)||'{"logs":{}}')}catch(e){return {logs:{}}}}
  function historyForExercise(name){
    const logs=Object.values(read().logs||{}),matches=[];
    for(const l of logs){
      if(!l||!l.day||!l.date||l.date===today()) continue;
      const idx=(MAP[l.day]||[]).indexOf(name); if(idx<0) continue;
      const row=l.rows?.[idx]; if(!row) continue;
      const sets=[];
      for(let s=0;s<10;s++){
        const kg=String(row['kg'+s]??'').trim(),reps=String(row['reps'+s]??'').trim();
        if(kg||reps) sets.push({kg,reps});
      }
      if(sets.length) matches.push({date:l.date,sets});
    }
    matches.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    return matches[0]?.sets||[];
  }
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function apply(){
    document.querySelectorAll('.exercise').forEach(card=>{
      const name=(card.querySelector('.exname')?.textContent||'').trim(); if(!name)return;
      const hist=historyForExercise(name); if(!hist.length)return;
      [...card.querySelectorAll('input.field')].forEach((input,i)=>{
        const set=Math.floor(i/2),kind=input.dataset.kind,value=hist[set]?.[kind==='kg'?'kg':'reps'];
        if(value&&!input.value){input.placeholder=value;input.classList.add('has-history-placeholder');input.title='Último registro: '+value}
        if(input.value)input.classList.remove('has-history-placeholder');
      });
    });
  }
  const css=document.createElement('style');css.textContent=`input.field.has-history-placeholder::placeholder{color:currentColor!important;opacity:.27!important;filter:blur(.35px)!important;font-weight:650}input.field.has-history-placeholder:focus::placeholder{opacity:.1!important}`;document.head.appendChild(css);
  document.addEventListener('input',e=>{if(e.target.matches('input.field'))e.target.classList.remove('has-history-placeholder')},true);
  const obs=new MutationObserver(()=>setTimeout(apply,40));obs.observe(document.body,{childList:true,subtree:true});
  setInterval(apply,1200);setTimeout(apply,100);setTimeout(apply,500);
})();
