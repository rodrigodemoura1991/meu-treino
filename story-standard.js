/* STORY STANDARD 2026-08-19
   Gera uma arte vertical 1080x1920, estilo musculação, com os dados reais do treino salvo.
   Não inventa métricas: quando um dado não foi registrado, mostra "—".
*/
(function(){
  const W=1080,H=1920;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const dayNames=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];

  function formatDuration(v){
    if(v===null||v===undefined||v==='')return '—';
    if(typeof v==='number'&&isFinite(v)){
      const s=Math.max(0,Math.round(v));
      return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
    }
    const s=String(v).trim();
    if(/^\d+$/.test(s))return formatDuration(Number(s));
    return s;
  }

  function getDuration(l){
    if(Number(l?.timerElapsed)>0)return formatDuration(Number(l.timerElapsed));
    if(l?.duration)return formatDuration(l.duration);
    return '—';
  }

  function getCalories(l){
    const a=Number(l?.calories||0),b=Number(l?.cardio?.calories||0),total=a+b;
    return total>0?Math.round(total).toLocaleString('pt-BR')+' kcal':'—';
  }

  function getVolume(l){
    let total=0;
    Object.values(l?.rows||{}).forEach(r=>{
      for(let s=0;s<30;s++){
        const kg=Number(r?.['kg'+s]),reps=Number(r?.['reps'+s]);
        if(kg>0&&reps>0)total+=kg*reps;
      }
    });
    return total>0?Math.round(total).toLocaleString('pt-BR')+' kg':'—';
  }

  async function getTemperature(l){
    if(l?.temperature)return String(l.temperature).replace(/\s+/g,'');
    try{
      let lat=-26.081,lon=-53.053;
      if(navigator.geolocation){
        const p=await new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{timeout:1800,maximumAge:600000}));
        lat=p.coords.latitude;lon=p.coords.longitude;
      }
      const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m&timezone=auto');
      if(!r.ok)throw 0;
      const j=await r.json();
      return Math.round(Number(j.current.temperature_2m))+'°C';
    }catch(e){return '—'}
  }

  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function card(ctx,y,label,value,accent){
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.095)';roundRect(ctx,64,y,952,215,30);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.13)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=accent||'#ff7615';roundRect(ctx,92,y+42,8,120,4);ctx.fill();
    ctx.fillStyle='#aebdcb';ctx.font='700 27px Arial, sans-serif';ctx.fillText(label.toUpperCase(),125,y+65);
    ctx.fillStyle='#ffffff';ctx.font='800 66px Arial, sans-serif';ctx.fillText(value,125,y+140);
    ctx.restore();
  }

  function drawDumbbell(ctx,cx,cy,scale,alpha){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(cx,cy);ctx.scale(scale,scale);
    ctx.fillStyle='#ffffff';
    // barra
    roundRect(ctx,-250,-15,500,30,15);ctx.fill();
    // discos
    [[-210,75],[-165,55],[210,75],[165,55]].forEach(([x,r])=>{ctx.beginPath();ctx.arc(x,0,r,0,Math.PI*2);ctx.fill()});
    // detalhes vazados para aspecto de equipamento de academia
    ctx.globalAlpha=alpha*.45;ctx.fillStyle='#0e1724';
    [[-210,75],[-165,55],[210,75],[165,55]].forEach(([x,r])=>{ctx.beginPath();ctx.arc(x,0,r*.55,0,Math.PI*2);ctx.fill()});
    ctx.restore();
  }

  function drawStory(l,temp){
    const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
    const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0b1320');bg.addColorStop(.5,'#17283b');bg.addColorStop(1,'#080d14');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // textura geométrica discreta
    ctx.save();ctx.globalAlpha=.08;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;
    for(let i=-H;i<W;i+=150){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke()}ctx.restore();
    drawDumbbell(ctx,540,390,1.15,.075);

    ctx.fillStyle='#ff7414';ctx.fillRect(64,76,952,10);
    ctx.fillStyle='#ffffff';ctx.font='900 62px Arial, sans-serif';ctx.fillText('MEU TREINO',64,190);
    ctx.fillStyle='#aebdcb';ctx.font='700 25px Arial, sans-serif';ctx.fillText('MUSCULAÇÃO  •  PROGRESSÃO',67,230);

    const title=window.workouts?.[l.day]?.title||l.day||'Treino';
    ctx.fillStyle='#ffffff';ctx.font='900 54px Arial, sans-serif';ctx.fillText(title,64,355);
    const date=l.date?new Date(l.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
    ctx.fillStyle='#c4d0db';ctx.font='700 27px Arial, sans-serif';ctx.fillText((l.day||'Treino')+'  •  '+date,67,402);

    const duration=getDuration(l),calories=getCalories(l),volume=getVolume(l),temperature=l.temperature||temp||'—';
    card(ctx,470,'Tempo de treino',duration,'#ff7414');
    card(ctx,705,'Calorias gastas',calories,'#ff8b2d');
    card(ctx,940,'Peso levantado',volume,'#ff7414');
    card(ctx,1175,'Temperatura',temperature,'#ff9d4a');

    // Rodapé com referência visual de musculação
    drawDumbbell(ctx,540,1545,.72,.055);
    ctx.fillStyle='#ffffff';ctx.font='800 34px Arial, sans-serif';ctx.fillText('TREINO CONCLUÍDO',64,1515);
    ctx.fillStyle='#aebdcb';ctx.font='600 25px Arial, sans-serif';ctx.fillText('Dados registrados no seu histórico',67,1560);
    ctx.fillStyle='#ffffff';ctx.font='800 30px Arial, sans-serif';ctx.fillText('#MeuTreino',67,1740);
    ctx.fillStyle='#ff7414';ctx.fillRect(67,1780,210,7);
    ctx.fillStyle='#718294';ctx.font='600 22px Arial, sans-serif';ctx.fillText('MUSCULAÇÃO • PROGRESSÃO',67,1840);
    return c;
  }

  async function shareStory(key){
    const l=window.data?.logs?.[key];
    if(!l){alert('Treino não encontrado.');return}
    const temp=await getTemperature(l);
    if(!l.temperature&&temp!=='—'){
      l.temperature=temp;
      if(typeof window.save==='function')window.save(key);else if(typeof window.localSave==='function')window.localSave();
    }
    const canvas=drawStory(l,temp);
    canvas.toBlob(async blob=>{
      if(!blob){alert('Não foi possível gerar a imagem.');return}
      const file=new File([blob],'meu-treino-story-'+(l.date||'treino')+'.png',{type:'image/png'});
      const url=URL.createObjectURL(blob);
      // Modal de pré-visualização: o usuário vê a arte antes de compartilhar.
      let modal=document.getElementById('storyPreviewModal');
      if(modal)modal.remove();
      modal=document.createElement('div');modal.id='storyPreviewModal';modal.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;box-sizing:border-box';
      modal.innerHTML='<div style="width:min(420px,92vw);max-height:76vh;display:flex;justify-content:center"><img alt="Story Meu Treino" src="'+url+'" style="max-width:100%;max-height:76vh;border-radius:20px;box-shadow:0 15px 60px rgba(0,0,0,.45)"></div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:16px"><button id="storyShare" style="background:#ff7414;color:#fff;border:0;border-radius:13px;padding:13px 20px;font-size:16px;font-weight:800">📲 Compartilhar</button><button id="storyDownload" style="background:#fff;color:#17283b;border:0;border-radius:13px;padding:13px 20px;font-size:16px;font-weight:800">Salvar imagem</button><button id="storyClose" style="background:#333;color:#fff;border:0;border-radius:13px;padding:13px 20px;font-size:16px;font-weight:800">Fechar</button></div>';
      document.body.appendChild(modal);
      modal.querySelector('#storyClose').onclick=()=>{URL.revokeObjectURL(url);modal.remove()};
      modal.querySelector('#storyDownload').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=file.name;a.click()};
      modal.querySelector('#storyShare').onclick=async()=>{
        try{
          if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',text:'Meu treino de hoje 💪',files:[file]});return}
          modal.querySelector('#storyDownload').click();
        }catch(e){if(e?.name!=='AbortError')modal.querySelector('#storyDownload').click()}
      };
    },'image/png');
  }

  window.postWorkoutInstagram=shareStory;
  window.generateStoryForLog=shareStory;

  // Garante o botão em Relatórios mesmo que os scripts anteriores não tenham criado.
  function ensureReportButton(){
    if(window.current!=='Relatórios')return;
    const app=document.getElementById('app');if(!app||app.querySelector('#reportStoryCard'))return;
    const logs=Object.entries(window.data?.logs||{}).filter(([,l])=>l?.date).sort((a,b)=>String(b[1].date).localeCompare(String(a[1].date)));
    if(!logs.length)return;
    const latest=logs[0][1];
    const card=document.createElement('section');card.id='reportStoryCard';card.className='card';
    card.innerHTML='<h2>📸 Story do Instagram</h2><p class="muted">Arte vertical 1080×1920 com visual de musculação e os dados reais do treino.</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"><label style="flex:1;min-width:190px;font-size:11px;font-weight:800;color:#71808f">TREINO<input id="reportStoryDate" type="date" value="'+esc(latest.date)+'" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:40px;border:1px solid #ccd5dd;border-radius:9px;padding:0 10px"></label><button id="reportStoryBtn" class="primary smallbtn">📲 Gerar Story</button></div>';
    app.appendChild(card);
    card.querySelector('#reportStoryBtn').onclick=async()=>{
      const date=card.querySelector('#reportStoryDate').value;
      const found=Object.entries(window.data?.logs||{}).find(([,l])=>l?.date===date);
      if(!found){alert('Não há treino salvo nessa data.');return}
      await shareStory(found[0]);
    };
  }

  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(ensureReportButton,120);return r};
  setInterval(ensureReportButton,800);
})();
