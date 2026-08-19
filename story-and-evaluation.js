/* Avaliação consistente em todos os exercícios + card para Story do Instagram */
(function(){
  // Corrige definitivamente o exercício 3 da quarta-feira.
  try{
    if(typeof workouts!=='undefined' && workouts.Quarta && workouts.Quarta.ex){
      workouts.Quarta.ex[2]=['Cadeira abdutora',3,'10–15'];
    }
    if(typeof restPreset!=='undefined') restPreset['Cadeira abdutora']=75;
  }catch(e){console.warn('workout patch',e)}

  const escHtml=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function exerciseCards(){
    const out=[];
    document.querySelectorAll('h1,h2,h3,h4,b,strong').forEach(h=>{
      const text=(h.textContent||'').trim();
      if(!/^\d+\.\s+/.test(text)) return;
      let el=h;
      for(let n=0;n<7 && el;n++,el=el.parentElement){
        const inputs=el.querySelectorAll('input.field');
        if(inputs.length>=2){ if(!out.includes(el)) out.push(el); break; }
      }
    });
    return out;
  }

  function evaluationHtml(card){
    const inputs=[...card.querySelectorAll('input.field')];
    const kg=inputs.filter(x=>x.dataset.kind==='kg'), reps=inputs.filter(x=>x.dataset.kind==='reps');
    const pairs=Math.min(kg.length,reps.length);
    const rows=[];
    for(let i=0;i<pairs;i++){
      const k=Number(kg[i].value), r=Number(reps[i].value);
      if(k>0 && r>0) rows.push({k,r});
    }
    const range=(card.querySelector('.repRange')?.textContent||card.textContent||'').match(/(\d+)\s*[–-]\s*(\d+)\s*$/m);
    const title=(card.textContent||'').match(/^\s*\d+\.\s*([^\n]+)/m)?.[1]?.trim()||'';
    let lo=10,hi=15;
    if(range){lo=Number(range[1]);hi=Number(range[2])}
    let body='Preencha todas as séries com kg e repetições para avaliar se deve subir, manter ou baixar a carga.';
    let cls='waiting';
    if(rows.length===pairs && pairs>0){
      const avg=rows.reduce((a,x)=>a+x.r,0)/rows.length;
      const base=rows[rows.length-1].k;
      if(rows.every(x=>x.r>=hi)){cls='up';body='⬆ SUBIR CARGA — topo da faixa em todas as séries. Próximo treino: ~'+(Math.round(base*1.025*2)/2).toLocaleString('pt-BR')+' kg.'}
      else if(rows.filter(x=>x.r<lo).length>=2 || avg<lo){cls='down';body='⬇ BAIXAR CARGA — repetições abaixo da faixa. Próximo treino: ~'+(Math.round(base*.95*2)/2).toLocaleString('pt-BR')+' kg.'}
      else {cls='keep';body='→ MANTER CARGA — dentro da faixa. Tente chegar ao topo antes de subir.'}
    } else if(rows.length){ cls='partial'; body='Preencha as '+pairs+' séries com kg e repetições para definir: subir, manter ou baixar.' }
    return '<div class="universalEval '+cls+'"><b>📊 AVALIAÇÃO DE CARGA</b><small>'+escHtml(body)+'</small></div>';
  }

  function patchEvaluations(){
    exerciseCards().forEach(card=>{
      let box=card.querySelector(':scope > .universalEval');
      if(!box){
        box=document.createElement('div');
        box.className='universalEval';
        card.appendChild(box);
      }
      box.outerHTML=evaluationHtml(card);
    });
  }

  function patchWednesday(){
    if(typeof current==='undefined' || current!=='Quarta') return;
    document.querySelectorAll('h1,h2,h3,h4,b,strong').forEach(h=>{
      if((h.textContent||'').includes('3. Elevação pélvica')) h.textContent=h.textContent.replace('Elevação pélvica','Cadeira abdutora');
    });
  }

  function latestWorkoutForDate(date){
    const arr=Object.values(data?.logs||{}).filter(l=>l?.date===date && l?.day && Object.keys(l.rows||{}).length);
    return arr.sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')))[0]||null;
  }
  async function temperature(){
    try{
      let lat= -26.081; let lon=-53.053; let place='Francisco Beltrão';
      if(navigator.geolocation){
        const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:2500,maximumAge:600000}));
        lat=pos.coords.latitude;lon=pos.coords.longitude;place='Local atual';
      }
      const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lon)+'&current=temperature_2m&timezone=auto';
      const r=await fetch(url); if(!r.ok) throw new Error('weather');
      const j=await r.json(); return {value:Math.round(Number(j.current?.temperature_2m)),unit:j.current_units?.temperature_2m||'°C',place};
    }catch(e){return {value:null,unit:'°C',place:'Temperatura indisponível'}}
  }

  function fmtMetric(v,fallback='—'){return v!==undefined&&v!==null&&String(v)!==''?String(v):fallback}
  function storyCanvas(l,temp){
    const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
    const grad=x.createLinearGradient(0,0,1080,1920);grad.addColorStop(0,'#111b2a');grad.addColorStop(.55,'#263b54');grad.addColorStop(1,'#0e131b');x.fillStyle=grad;x.fillRect(0,0,c.width,c.height);
    x.fillStyle='#f26f00';x.roundRect(70,90,940,12,6);x.fill();
    x.fillStyle='#fff';x.font='800 72px Arial';x.fillText('MEU TREINO',70,220);
    x.font='700 30px Arial';x.fillStyle='#b9c4d0';x.fillText('MUSCULAÇÃO • PROGRESSÃO',72,270);
    x.fillStyle='#fff';x.font='800 58px Arial';x.fillText(l.day+' • '+new Date(l.date+'T12:00:00').toLocaleDateString('pt-BR'),70,420);
    x.font='700 38px Arial';x.fillStyle='#f26f00';x.fillText(workouts[l.day]?.title||'Treino',72,475);
    const cards=[['⏱','TEMPO DE TREINO',fmtMetric(l.duration)],['🔥','CALORIAS',fmtMetric(l.calories,'—')+' kcal'],['🏋️','PESO LEVANTADO',Math.round(volumeForLog(l)).toLocaleString('pt-BR')+' kg'],['🌡','TEMPERATURA',temp.value===null?'—':temp.value+temp.unit]];
    let y=590;
    cards.forEach((a,i)=>{x.fillStyle='rgba(255,255,255,.09)';x.roundRect(70,y,940,210,30,30);x.fill();x.fillStyle='#fff';x.font='700 38px Arial';x.fillText(a[0]+'  '+a[1],110,y+65);x.font='800 62px Arial';x.fillStyle='#fff';x.fillText(a[2],110,y+145);y+=240});
    x.fillStyle='#9eacba';x.font='600 28px Arial';x.fillText('Volume calculado por carga × repetições',70,1600);
    x.fillStyle='#fff';x.font='700 30px Arial';x.fillText('#MeuTreino',70,1770);x.fillStyle='#f26f00';x.fillRect(70,1810,180,7);
    return c;
  }
  window.generateStory=async function(){
    const date=document.getElementById('periodReportDate')?.value || today();
    const l=latestWorkoutForDate(date);
    if(!l){alert('Não encontrei um treino salvo para a data escolhida.');return}
    const temp=await temperature(); const canvas=storyCanvas(l,temp);
    canvas.toBlob(async blob=>{
      const file=new File([blob],'meu-treino-story.png',{type:'image/png'});
      try{
        if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',files:[file]});return}
      }catch(e){if(e?.name==='AbortError')return}
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='meu-treino-story-'+l.date+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    },'image/png');
  };

  function addStoryButton(){
    if(typeof current==='undefined' || current!=='Relatórios') return;
    const box=document.querySelector('.reportButtons'); if(!box || box.querySelector('#storyBtn')) return;
    const b=document.createElement('button');b.id='storyBtn';b.className='primary smallbtn';b.textContent='📸 Story Instagram';b.onclick=generateStory;box.appendChild(b);
  }

  const style=document.createElement('style');style.textContent='.universalEval{margin-top:12px;padding:12px;border-radius:12px;border:1px solid #dfe5eb;background:#f7f9fb;color:#465565}.universalEval b{display:block;font-size:14px}.universalEval small{display:block;margin-top:4px;font-size:12px;line-height:1.35}.universalEval.up{background:#eaf8ee;border-color:#a8d9b4;color:#176b35}.universalEval.down{background:#fff0f0;border-color:#efb1b1;color:#a32222}.universalEval.keep{background:#fff8e9;border-color:#ead39a;color:#735300}.universalEval.partial{background:#f5f7fb}.universalEval.waiting{background:#f7f9fb}#storyBtn{margin-left:auto}@media(max-width:600px){#storyBtn{margin-left:0}}';document.head.appendChild(style);

  const oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{patchWednesday();patchEvaluations();addStoryButton()},30);return r};
  }
  // Inputs alteram a avaliação sem precisar renderizar a página inteira.
  document.addEventListener('input',e=>{if(e.target.matches('input.field'))setTimeout(patchEvaluations,30)});
  setTimeout(()=>{patchWednesday();patchEvaluations();addStoryButton()},250);
})();
