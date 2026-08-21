/* Histórico de carga por exercício — apenas visual, sem alterar os registros. */
(function(){
  const KEY='meu_treino_reset_v1';
  const DAYS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const EX={
    Segunda:['Abdominal máquina','Pêndulo','Cadeira extensora','Stiff com barra ou halteres','Supino inclinado com halteres','Supino reto máquina','Crucifixo máquina'],
    Terça:['Barra fixa ou puxada neutra','Remada articulada com apoio no peito','Remada unilateral na polia','PULLDOWN','Rosca direta com barra W','Rosca inclinada com halteres','Rosca martelo com halteres'],
    Quarta:['Abdominal máquina','Leg press 45°','Elevação pélvica','Cadeira flexora bilateral','Mesa flexora','Desenvolvimento máquina','Elevação lateral na polia','Crucifixo inverso máquina','Panturrilha em pé ou no leg press'],
    Quinta:['Supino reto com barra','Supino inclinado máquina','Supino reto máquina','Crossover de baixo para cima','Tríceps francês unilateral na polia','Tríceps barra V','Tríceps testa com barra W'],
    Sexta:['Abdominal máquina','Hack squat','Flexora unilateral','Remada baixa triângulo','Puxada alta pronada','Supino inclinado com halteres','Elevação lateral','Rosca Scott máquina','Tríceps corda','Panturrilha'],
    Sábado:['Elevação lateral','Crucifixo inverso','Rosca martelo','Tríceps corda','Panturrilha']
  };
  const css=`
    .history-load-wrap{position:relative!important;overflow:visible!important}
    .history-load-badge{position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:5;pointer-events:none;font-size:11px;font-weight:800;letter-spacing:.1px;color:#fff;opacity:.34;text-shadow:0 1px 2px #000;white-space:nowrap}
    .history-load-badge::before{content:'↻ ';font-size:10px}
    .field.history-has-load{padding-right:48px!important}
  `;
  function addStyle(){if(document.getElementById('history-load-style'))return;const s=document.createElement('style');s.id='history-load-style';s.textContent=css;document.head.appendChild(s)}
  function logs(){try{return JSON.parse(localStorage.getItem(KEY)||'{}').logs||{}}catch(e){return {}}}
  function latestWeight(day,exercise,currentDate){
    const all=logs(), candidates=[];
    Object.keys(all).forEach(k=>{const l=all[k];if(!l||l.day!==day||l.date===currentDate)return;const idx=EX[day]?.indexOf(exercise);if(idx<0)return;const r=l.rows?.[idx];if(!r)return;let last=0;for(let s=0;s<10;s++){const v=Number(r['kg'+s]);if(v>0)last=v}if(last>0)candidates.push({date:l.date,kg:last})});
    candidates.sort((a,b)=>String(b.date).localeCompare(String(a.date)));return candidates[0]?.kg||0;
  }
  function decorate(){
    addStyle();
    const day=window.current;
    if(!EX[day])return;
    const date=(typeof window.today==='function'?window.today():new Date().toISOString().slice(0,10));
    const inputs=[...document.querySelectorAll('input.field[data-kind="kg"]')];
    inputs.forEach((input,i)=>{
      const exercise=EX[day][i];if(!exercise)return;
      const kg=latestWeight(day,exercise,date);if(!kg)return;
      const wrap=input.parentElement;if(!wrap)return;
      wrap.classList.add('history-load-wrap');
      let badge=wrap.querySelector('.history-load-badge');
      if(!badge){badge=document.createElement('span');badge.className='history-load-badge';wrap.appendChild(badge)}
      badge.textContent=String(kg).replace('.',',')+' kg';
      input.classList.add('history-has-load');
      input.title='Última carga registrada: '+kg+' kg';
    });
  }
  const boot=()=>{decorate();setTimeout(decorate,250);setTimeout(decorate,800)};
  new MutationObserver(boot).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',boot);
  setInterval(decorate,1500);
})();
