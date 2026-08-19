/* FINAL UI FIX 2026-08-19
   1) Padroniza avaliação de carga em TODOS os exercícios.
   2) Adiciona botão "📲 Postar no Instagram" em cada treino do Histórico.
   3) Usa os dados do treino selecionado para gerar a arte vertical.
*/
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function getExerciseCards(){
    const ex=typeof window.exFor==='function'?window.exFor(window.current):[];
    const out=[];
    document.querySelectorAll('h1,h2,h3,h4,strong,b').forEach(h=>{
      const m=(h.textContent||'').trim().match(/^(\d+)\.\s+/); if(!m)return;
      const idx=Number(m[1])-1, spec=ex[idx]; if(!spec)return;
      const needed=Number(spec[1])*2; let el=h;
      for(let n=0;n<18 && el;n++,el=el.parentElement){
        const fields=el.querySelectorAll?.('input.field')||[];
        if(fields.length===needed){out.push({el,idx,spec});break}
      }
    });
    return out;
  }

  function evalOne(card){
    const {el,spec}=card, fields=[...el.querySelectorAll('input.field')];
    const kg=fields.filter(x=>x.dataset.kind==='kg'), reps=fields.filter(x=>x.dataset.kind==='reps');
    if(kg.length!==Number(spec[1])||reps.length!==Number(spec[1]))return;
    const m=String(spec[2]).match(/(\d+)\s*[–-]\s*(\d+)/),lo=m?+m[1]:1,hi=m?+m[2]:999;
    const rows=kg.map((x,i)=>({kg:Number(x.value),reps:Number(reps[i]?.value)}));
    let cls='waiting',txt='Preencha todas as séries com kg e repetições para avaliar se deve subir, manter ou baixar a carga.';
    const filled=rows.filter(x=>x.kg>0&&x.reps>0);
    if(filled.length===rows.length){
      const avg=rows.reduce((a,x)=>a+x.reps,0)/rows.length,base=rows.at(-1).kg;
      if(rows.every(x=>x.reps>=hi)){cls='up';txt='⬆ SUBIR CARGA — topo da faixa em todas as séries. Próximo treino: ~'+(Math.round(base*1.025*2)/2).toLocaleString('pt-BR')+' kg.'}
      else if(rows.filter(x=>x.reps<lo).length>=2||avg<lo){cls='down';txt='⬇ BAIXAR CARGA — repetições abaixo da faixa. Próximo treino: ~'+(Math.round(base*.95*2)/2).toLocaleString('pt-BR')+' kg.'}
      else {cls='keep';txt='→ MANTER CARGA — dentro da faixa. Tente chegar ao topo antes de subir.'}
    }else if(filled.length){cls='partial';txt='Preencha todas as '+rows.length+' séries para definir: subir, manter ou baixar a carga.'}
    let box=el.querySelector('.universalEvalFinal');
    if(!box){box=document.createElement('div');box.className='universalEvalFinal';el.appendChild(box)}
    box.className='universalEvalFinal '+cls;
    box.innerHTML='<b>📊 AVALIAÇÃO DE CARGA</b><small>'+esc(txt)+'</small>';
  }

  function patchEvaluations(){
    if(!window.days?.includes?.(window.current) && !['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].includes(window.current))return;
    getExerciseCards().forEach(evalOne);
  }

  async function weather(){
    try{
      let lat=-26.081,lon=-53.053;
      if(navigator.geolocation){
        const p=await new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{timeout:1800,maximumAge:600000}));
        lat=p.coords.latitude;lon=p.coords.longitude;
      }
      const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m&timezone=auto');
      if(!r.ok)throw 0; const j=await r.json(); return Math.round(Number(j.current.temperature_2m))+'°C';
    }catch(e){return '—'}
  }

  function volume(l){let t=0;Object.values(l?.rows||{}).forEach(r=>{for(let s=0;s<20;s++){const k=Number(r?.['kg'+s]),p=Number(r?.['reps'+s]);if(k>0&&p>0)t+=k*p}});return t}

  function draw(l,temp){
    const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,0,1920);g.addColorStop(0,'#111b2a');g.addColorStop(.6,'#263b54');g.addColorStop(1,'#0e131b');x.fillStyle=g;x.fillRect(0,0,1080,1920);
    x.fillStyle='#f26f00';x.fillRect(70,90,940,12);x.fillStyle='#fff';x.font='800 72px Arial';x.fillText('MEU TREINO',70,220);x.font='700 30px Arial';x.fillStyle='#b9c4d0';x.fillText('MUSCULAÇÃO • PROGRESSÃO',72,270);
    const date=new Date(l.date+'T12:00:00').toLocaleDateString('pt-BR');x.fillStyle='#fff';x.font='800 58px Arial';x.fillText(workouts[l.day]?.title||'Treino',70,420);x.font='700 34px Arial';x.fillStyle='#b9c4d0';x.fillText((l.day||'')+' • '+date,72,475);
    const kcal=Number(l.calories||0)+Number(l.cardio?.calories||0);
    const cards=[['⏱','TEMPO DE TREINO',l.duration||'—'],['🔥','CALORIAS GASTAS',kcal?Math.round(kcal)+' kcal':'—'],['🏃','TEMPO DE CARDIO',l.cardio?.duration||'—'],['🏋️','PESO LEVANTADO',Math.round(volume(l)).toLocaleString('pt-BR')+' kg'],['🌡','TEMPERATURA',l.temperature||temp||'—']];
    let y=570;cards.forEach(a=>{x.fillStyle='rgba(255,255,255,.09)';x.roundRect(70,y,940,205,28,28);x.fill();x.fillStyle='#fff';x.font='700 34px Arial';x.fillText(a[0]+'  '+a[1],110,y+62);x.font='800 60px Arial';x.fillText(a[2],110,y+145);y+=225});
    x.fillStyle='#9eacba';x.font='600 27px Arial';x.fillText('Dados deste treino salvo no Histórico',70,1740);x.fillStyle='#fff';x.font='700 28px Arial';x.fillText('#MeuTreino',70,1810);x.fillStyle='#f26f00';x.fillRect(70,1850,180,7);return c;
  }

  async function shareInstagram(k){
    const l=window.data?.logs?.[k];if(!l){alert('Treino não encontrado.');return}
    if(!l.temperature)l.temperature=await weather();
    if(typeof window.localSave==='function')window.localSave();
    const c=draw(l,l.temperature);c.toBlob(async blob=>{
      const file=new File([blob],'meu-treino-'+l.date+'.png',{type:'image/png'});
      try{
        if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino — '+(workouts[l.day]?.title||''),text:'Meu treino de hoje 💪',files:[file]});return}
      }catch(e){if(e?.name==='AbortError')return}
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='meu-treino-'+l.date+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    },'image/png');
  }
  window.postWorkoutInstagram=shareInstagram;
  window.generateStoryForLog=shareInstagram;

  function historyButtons(){
    if(window.current!=='Histórico')return;
    document.querySelectorAll('.historyrow').forEach(row=>{
      const actions=row.querySelector('.historyActions');if(!actions||actions.querySelector('.instagramStoryBtn'))return;
      const b=row.querySelector('.historyhead b');if(!b)return;
      const m=(b.textContent||'').match(/^(.+?)\s+—\s+(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return;
      const k=m[1].trim()+'|'+m[4]+'-'+m[3]+'-'+m[2];
      const btn=document.createElement('button');btn.className='secondary smallbtn instagramStoryBtn';btn.textContent='📲 Postar no Instagram';btn.onclick=()=>postWorkoutInstagram(k);actions.appendChild(btn);
    });
  }

  const css=document.createElement('style');css.textContent='.universalEvalFinal{margin-top:12px;padding:13px;border-radius:12px;border:1px solid #dfe5eb;background:#f7f9fb;color:#465565}.universalEvalFinal b,.universalEvalFinal small{display:block}.universalEvalFinal small{margin-top:4px;line-height:1.35}.universalEvalFinal.up{background:#eaf8ee;border-color:#a8d9b4;color:#176b35}.universalEvalFinal.down{background:#fff0f0;border-color:#efb1b1;color:#a32222}.universalEvalFinal.keep{background:#fff8e9;border-color:#ead39a;color:#735300}.instagramStoryBtn{margin-left:0}@media(max-width:600px){.historyActions{flex-wrap:wrap}.instagramStoryBtn{width:100%;margin-top:4px}}';document.head.appendChild(css);
  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{patchEvaluations();historyButtons()},100);return r};
  document.addEventListener('input',e=>{if(e.target.matches?.('input.field'))setTimeout(patchEvaluations,20)});
  const mo=new MutationObserver(()=>{patchEvaluations();historyButtons()});mo.observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
  setInterval(()=>{patchEvaluations();historyButtons()},500);
})();
