/* Histórico do último peso por exercício.
   Mostra a última carga registrada como uma dica semi-transparente no próprio campo.
   A dica NÃO preenche o input: ao digitar, ela é naturalmente substituída pelo valor novo. */
(function(){
  const KEY='meu_treino_reset_v1';
  const STYLE_ID='last-weight-inline-style-v4';
  const HINT_CLASS='last-weight-inline-hint';

  function getData(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')||{logs:{}}}
    catch(e){return {logs:{}}}
  }

  function normalize(s){
    return String(s||'')
      .normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
      .replace(/\\s+/g,' ').trim().toLowerCase();
  }

  function currentDay(){
    const small=document.querySelector('.daystrip button.active small');
    const code=normalize(small?.textContent||'');
    const map={seg:'Segunda',ter:'Terça',qua:'Quarta',qui:'Quinta',sex:'Sexta','sab':'Sábado','dom':'Domingo'};
    return map[code]||'Segunda';
  }

  function currentDate(){
    const d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function exerciseName(card){
    const el=card?.querySelector('.exname');
    return normalize((el?.textContent||'').replace(/^\\d+\\.\\s*/,''));
  }

  /*
     Retorna, por nome de exercício, a última execução anterior a hoje.
     Cada execução guarda a carga por série para que o histórico apareça
     no campo correspondente. Se uma série antiga não existir, usamos a
     última carga disponível daquele exercício como fallback.
  */
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
      .weight-field-wrap{
        position:relative;
        min-width:0;
      }
      .weight-field-wrap .field{
        position:relative;
        z-index:1;
      }
      .${HINT_CLASS}{
        position:absolute;
        z-index:2;
        left:11px;
        top:50%;
        transform:translateY(-50%);
        pointer-events:none;
        color:rgba(113,128,143,.55);
        font:600 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        white-space:nowrap;
        transition:opacity .12s ease;
      }
      .weight-field-wrap .field:focus + .${HINT_CLASS},
      .weight-field-wrap .field.filled + .${HINT_CLASS}{
        opacity:0;
      }
      @media(max-width:430px){
        .${HINT_CLASS}{left:9px;font-size:11px}
      }
    `;
    document.head.appendChild(st);
  }

  function clearHints(){
    document.querySelectorAll('.'+HINT_CLASS).forEach(x=>x.remove());
    document.querySelectorAll('.weight-field-wrap').forEach(w=>{
      const input=w.querySelector('input.field');
      if(input)w.replaceWith(input);
    });
  }

  function addHint(input,value){
    if(!input||value==null)return;
    const wrap=document.createElement('span');
    wrap.className='weight-field-wrap';
    input.parentNode.insertBefore(wrap,input);
    wrap.appendChild(input);

    const hint=document.createElement('span');
    hint.className=HINT_CLASS;
    hint.textContent='Último: '+String(value).replace('.',',')+' kg';
    wrap.appendChild(hint);

    const sync=()=>{
      const hasValue=String(input.value||'').trim()!=='';
      hint.style.opacity=hasValue?'0':'';
    };
    input.addEventListener('input',sync,{passive:true});
    input.addEventListener('change',sync,{passive:true});
    input.addEventListener('focus',sync,{passive:true});
    sync();
  }

  function render(){
    if(!document.querySelector('.exercise'))return;
    installStyle();
    clearHints();
    const map=historyMap();
    document.querySelectorAll('.exercise').forEach(card=>{
      const hist=map[exerciseName(card)];
      if(!hist)return;
      const inputs=[...card.querySelectorAll('input[data-kind="kg"]')];
      inputs.forEach((input,setIndex)=>{
        const value=hist.sets[setIndex] ?? hist.last;
        if(value!=null && String(input.value||'').trim()==='')addHint(input,value);
      });
    });
  }

  let timer=null;
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(render,120);
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
