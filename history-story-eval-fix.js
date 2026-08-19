/* Histórico: gerar Story a partir do treino salvo + avaliação universal de carga. */
(function(){
  const escH=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function logVolume(l){
    let total=0;
    Object.values(l?.rows||{}).forEach(r=>{
      for(let s=0;s<20;s++){
        const kg=Number(r?.['kg'+s]), reps=Number(r?.['reps'+s]);
        if(kg>0&&reps>0) total+=kg*reps;
      }
    });
    return total;
  }

  async function getTemp(){
    try{
      let lat=-26.081,lon=-53.053,place='Francisco Beltrão';
      if(navigator.geolocation){
        const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:2500,maximumAge:600000}));
        lat=p.coords.latitude;lon=p.coords.longitude;place='Local atual';
      }
      const u='https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m&timezone=auto';
      const r=await fetch(u); if(!r.ok) throw 0;
      const j=await r.json();
      return {v:Math.round(Number(j.current.temperature_2m)),unit:j.current_units?.temperature_2m||'°C',place};
    }catch(e){return {v:null,unit:'°C',place:'Temperatura indisponível'}}
  }

  function drawStory(l,temp){
    const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#111b2a');g.addColorStop(.55,'#263b54');g.addColorStop(1,'#0e131b');x.fillStyle=g;x.fillRect(0,0,1080,1920);
    x.fillStyle='#f26f00';x.fillRect(70,90,940,12);
    x.fillStyle='#fff';x.font='800 72px Arial';x.fillText('MEU TREINO',70,220);x.font='700 30px Arial';x.fillStyle='#b9c4d0';x.fillText('MUSCULAÇÃO • PROGRESSÃO',72,270);
    const date=new Date(l.date+'T12:00:00').toLocaleDateString('pt-BR');
    x.fillStyle='#fff';x.font='800 58px Arial';x.fillText((workouts[l.day]?.title||'Treino'),70,420);x.font='700 34px Arial';x.fillStyle='#b9c4d0';x.fillText((l.day||'')+' • '+date,72,475);
    const workoutKcal=Number(l.calories||0), cardioKcal=Number(l.cardio?.calories||0), totalKcal=workoutKcal+cardioKcal;
    const cards=[['⏱','TEMPO DE TREINO',l.duration||'—'],['🔥','CALORIAS GASTAS',totalKcal?Math.round(totalKcal)+' kcal':'—'],['🏃','TEMPO DE CARDIO',l.cardio?.duration||'—'],['🏋️','PESO LEVANTADO',Math.round(logVolume(l)).toLocaleString('pt-BR')+' kg'],['🌡','TEMPERATURA',temp.v===null?'—':temp.v+temp.unit]];
    let y=570;
    cards.forEach(a=>{x.fillStyle='rgba(255,255,255,.09)';x.roundRect(70,y,940,205,28,28);x.fill();x.fillStyle='#fff';x.font='700 34px Arial';x.fillText(a[0]+'  '+a[1],110,y+62);x.font='800 60px Arial';x.fillText(a[2],110,y+145);y+=225});
    x.fillStyle='#9eacba';x.font='600 27px Arial';x.fillText('Dados do treino salvo no Histórico',70,1740);x.fillStyle='#fff';x.font='700 28px Arial';x.fillText('#MeuTreino',70,1810);x.fillStyle='#f26f00';x.fillRect(70,1850,180,7);
    return c;
  }

  window.generateStoryForLog=async function(k){
    const l=data?.logs?.[k];
    if(!l){alert('Treino não encontrado.');return}
    const temp=await getTemp(); const canvas=drawStory(l,temp);
    canvas.toBlob(async blob=>{
      const file=new File([blob],'meu-treino-'+l.date+'.png',{type:'image/png'});
      try{
        if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',files:[file]});return}
      }catch(e){if(e?.name==='AbortError')return}
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='meu-treino-'+l.date+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    },'image/png');
  };

  function removeReportStory(){document.querySelector('#storyBtn')?.remove()}

  function historyStoryButtons(){
    if(current!=='Histórico') return;
    document.querySelectorAll('.historyrow').forEach(row=>{
      if(row.querySelector('.historyStoryBtn')) return;
      const head=row.querySelector('.historyActions'); if(!head) return;
      const text=row.querySelector('.historyhead b')?.textContent||'';
      const m=text.match(/^(.+?)\s+—\s+(\d{2}\/\d{2}\/\d{4})$/);
      if(!m) return;
      const day=m[1].trim(); const parts=m[2].split('/'); const date=parts[2]+'-'+parts[1]+'-'+parts[0];
      const k=key(day,date);
      const b=document.createElement('button');b.className='secondary smallbtn historyStoryBtn';b.textContent='📸 Gerar foto';b.onclick=()=>generateStoryForLog(k);head.appendChild(b);
    });
  }

  function exerciseCardFromInput(input){
    let el=input;
    for(let i=0;i<9 && el;i++,el=el.parentElement){
      const fields=el.querySelectorAll?.('input.field')||[];
      if(fields.length>=2){
        const heading=[...el.querySelectorAll('h1,h2,h3,h4,b,strong')].find(h=>/^\s*\d+\.\s+/.test(h.textContent||''));
        if(heading) return el;
      }
    }
    return null;
  }

  function evalBox(card){
    const fields=[...card.querySelectorAll('input.field')];
    const kg=fields.filter(f=>f.dataset.kind==='kg'), reps=fields.filter(f=>f.dataset.kind==='reps');
    if(!kg.length||kg.length!==reps.length)return;
    const heading=[...card.querySelectorAll('h1,h2,h3,h4,b,strong')].find(h=>/^\s*\d+\.\s+/.test(h.textContent||''));
    if(!heading)return;
    const title=heading.textContent.trim();
    const match=(card.textContent||'').match(/(\d+)\s*[–-]\s*(\d+)\s*reps/);let lo=10,hi=15;if(match){lo=+match[1];hi=+match[2]}
    const rows=kg.map((f,i)=>({k:Number(f.value),r:Number(reps[i]?.value)})).filter(x=>x.k>0&&x.r>0);
    let cls='waiting',body='Preencha todas as séries com kg e repetições para avaliar se deve subir, manter ou baixar a carga.';
    if(rows.length===kg.length){const avg=rows.reduce((a,x)=>a+x.r,0)/rows.length,base=rows.at(-1).k;if(rows.every(x=>x.r>=hi)){cls='up';body='⬆ SUBIR CARGA — topo da faixa em todas as séries. Próximo treino: ~'+(Math.round(base*1.025*2)/2).toLocaleString('pt-BR')+' kg.'}else if(rows.filter(x=>x.r<lo).length>=2||avg<lo){cls='down';body='⬇ BAIXAR CARGA — repetições abaixo da faixa. Próximo treino: ~'+(Math.round(base*.95*2)/2).toLocaleString('pt-BR')+' kg.'}else{cls='keep';body='→ MANTER CARGA — dentro da faixa. Tente chegar ao topo antes de subir.'}}
    else if(rows.length){cls='partial';body='Preencha todas as '+kg.length+' séries para definir: subir, manter ou baixar a carga.'}
    let box=card.querySelector('.universalEval');if(!box){box=document.createElement('div');box.className='universalEval';card.appendChild(box)}
    box.className='universalEval '+cls;box.innerHTML='<b>📊 AVALIAÇÃO DE CARGA</b><small>'+escH(body)+'</small>';
  }

  function patchAllEvaluations(){
    if(!Array.isArray(exFor(current))||!exFor(current).length)return;
    const seen=new Set();document.querySelectorAll('input.field').forEach(inp=>{const card=exerciseCardFromInput(inp);if(card&&!seen.has(card)){seen.add(card);evalBox(card)}});
  }

  const css=document.createElement('style');css.textContent='.historyStoryBtn{margin-left:0}.universalEval{margin-top:12px;padding:12px;border-radius:12px;border:1px solid #dfe5eb;background:#f7f9fb;color:#465565}.universalEval b,.universalEval small{display:block}.universalEval small{margin-top:4px;line-height:1.35}.universalEval.up{background:#eaf8ee;border-color:#a8d9b4;color:#176b35}.universalEval.down{background:#fff0f0;border-color:#efb1b1;color:#a32222}.universalEval.keep{background:#fff8e9;border-color:#ead39a;color:#735300}.universalEval.partial{background:#f5f7fb}@media(max-width:600px){.historyStoryBtn{font-size:12px}}';document.head.appendChild(css);

  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{removeReportStory();historyStoryButtons();patchAllEvaluations()},80);return r};
  document.addEventListener('input',e=>{if(e.target.matches('input.field'))setTimeout(()=>{patchAllEvaluations()},20)});
  setInterval(()=>{removeReportStory();historyStoryButtons();patchAllEvaluations()},700);
})();
