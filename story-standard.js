/* STORY PADRÃO — fundo fixo + métricas reais do histórico */
(function(){
  const W=1080,H=1920;
  const BG='story-bg.jpg?v=20260819storybg1';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function fmtDuration(v){
    if(v===null||v===undefined||v==='') return '—';
    if(typeof v==='number'&&isFinite(v)){
      const s=Math.max(0,Math.round(v));
      return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
    }
    const s=String(v).trim();
    if(!s) return '—';
    if(/^\d+$/.test(s)){
      const n=Number(s);
      // Cardio é registrado em minutos; timer geral normalmente vem em segundos.
      return n>=360 ? fmtDuration(n) : n+':00';
    }
    return s;
  }

  function workoutDuration(l){
    if(Number(l?.timerElapsed)>0) return fmtDuration(Number(l.timerElapsed));
    if(l?.duration) return fmtDuration(l.duration);
    return '—';
  }

  function cardioDuration(l){
    const v=l?.cardio?.duration;
    if(v===null||v===undefined||v==='') return '—';
    return fmtDuration(v);
  }

  function calories(l){
    const a=Number(l?.calories||0), b=Number(l?.cardio?.calories||0), total=a+b;
    return total>0 ? Math.round(total).toLocaleString('pt-BR')+' kcal' : '—';
  }

  function volume(l){
    let total=0;
    Object.values(l?.rows||{}).forEach(r=>{
      for(let s=0;s<30;s++){
        const kg=Number(r?.['kg'+s]), reps=Number(r?.['reps'+s]);
        if(kg>0&&reps>0) total+=kg*reps;
      }
    });
    return total>0 ? Math.round(total).toLocaleString('pt-BR')+' kg' : '—';
  }

  function temperature(l){
    return l?.temperature ? String(l.temperature).replace(/\s+/g,'') : '—';
  }

  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}

  function card(ctx,y,label,value,icon){
    ctx.save();
    ctx.fillStyle='rgba(8,10,13,.78)';
    roundRect(ctx,58,y,964,190,28);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#ff7414';
    roundRect(ctx,82,y+35,7,120,4);ctx.fill();
    ctx.fillStyle='#ff7414';ctx.font='700 34px Arial,sans-serif';ctx.fillText(icon,112,y+78);
    ctx.fillStyle='#c9d1d8';ctx.font='700 24px Arial,sans-serif';ctx.fillText(label.toUpperCase(),164,y+62);
    ctx.fillStyle='#fff';ctx.font='900 58px Arial,sans-serif';ctx.fillText(value,164,y+128);
    ctx.restore();
  }

  async function loadBackground(){
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>resolve(null);
      img.src=BG;
    });
  }

  function drawBackground(ctx,img){
    if(img){
      const scale=Math.max(W/img.width,H/img.height);
      const dw=img.width*scale, dh=img.height*scale;
      ctx.drawImage(img,(W-dw)/2,(H-dh)/2,dw,dh);
    }else{
      const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#07090c');g.addColorStop(.5,'#20242a');g.addColorStop(1,'#050608');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    }
    const overlay=ctx.createLinearGradient(0,0,W,0);
    overlay.addColorStop(0,'rgba(0,0,0,.92)');
    overlay.addColorStop(.48,'rgba(0,0,0,.68)');
    overlay.addColorStop(1,'rgba(0,0,0,.28)');
    ctx.fillStyle=overlay;ctx.fillRect(0,0,W,H);
    const bottom=ctx.createLinearGradient(0,1300,0,H);bottom.addColorStop(0,'rgba(0,0,0,0)');bottom.addColorStop(1,'rgba(0,0,0,.78)');ctx.fillStyle=bottom;ctx.fillRect(0,1300,W,H-1300);
  }

  async function drawStory(l){
    const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
    const bg=await loadBackground();
    drawBackground(ctx,bg);

    ctx.fillStyle='#ff7414';ctx.fillRect(58,72,964,9);
    ctx.fillStyle='#fff';ctx.font='900 58px Arial,sans-serif';ctx.fillText('MEU TREINO',58,170);
    ctx.fillStyle='#c7d0d8';ctx.font='700 23px Arial,sans-serif';ctx.fillText('MUSCULAÇÃO  •  PROGRESSÃO',61,208);

    const title=window.workouts?.[l.day]?.title||l.day||'Treino';
    const date=l.date?new Date(l.date+'T12:00:00'):null;
    const dateText=date&&!isNaN(date)?date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
    const weekday=date&&!isNaN(date)?date.toLocaleDateString('pt-BR',{weekday:'long'}):'';

    ctx.fillStyle='#fff';ctx.font='900 62px Arial,sans-serif';ctx.fillText('TREINO',58,350);
    ctx.fillStyle='#ff7414';ctx.font='900 62px Arial,sans-serif';ctx.fillText('CONCLUÍDO',58,422);
    ctx.fillStyle='#e4e7ea';ctx.font='700 25px Arial,sans-serif';ctx.fillText('FOCO  •  DISCIPLINA  •  RESULTADOS',61,470);

    ctx.fillStyle='#ff7414';ctx.font='700 23px Arial,sans-serif';ctx.fillText('DATA',62,535);
    ctx.fillStyle='#fff';ctx.font='900 40px Arial,sans-serif';ctx.fillText(dateText,62,585);
    ctx.fillStyle='#bfc8d0';ctx.font='700 21px Arial,sans-serif';ctx.fillText((weekday||'').toUpperCase()+'  •  '+title.toUpperCase(),64,620);

    card(ctx,675,'Tempo de treino',workoutDuration(l),'◷');
    card(ctx,885,'Tempo de cardio',cardioDuration(l),'♥');
    card(ctx,1095,'Calorias gastas',calories(l),'🔥');
    card(ctx,1305,'Peso levantado',volume(l),'⚖');
    card(ctx,1515,'Temperatura',temperature(l),'°');

    ctx.fillStyle='#ff7414';ctx.fillRect(58,1740,470,5);
    ctx.fillStyle='#fff';ctx.font='800 28px Arial,sans-serif';ctx.fillText('MEU TREINO',58,1800);
    ctx.fillStyle='#b7c0c8';ctx.font='600 21px Arial,sans-serif';ctx.fillText('Dados reais registrados no histórico',61,1838);
    ctx.fillStyle='#7d8790';ctx.font='700 19px Arial,sans-serif';ctx.fillText('#DISCIPLINA  #FOCO  #CONSTÂNCIA',61,1880);
    return c;
  }

  async function shareStory(key){
    const l=window.data?.logs?.[key];
    if(!l){alert('Treino não encontrado.');return;}
    const canvas=await drawStory(l);
    canvas.toBlob(async blob=>{
      if(!blob){alert('Não foi possível gerar a imagem.');return}
      const file=new File([blob],'meu-treino-story-'+(l.date||'treino')+'.png',{type:'image/png'});
      const url=URL.createObjectURL(blob);
      let modal=document.getElementById('storyPreviewModal');if(modal)modal.remove();
      modal=document.createElement('div');modal.id='storyPreviewModal';modal.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;box-sizing:border-box';
      modal.innerHTML='<div style="width:min(420px,92vw);max-height:76vh;display:flex;justify-content:center"><img alt="Story Meu Treino" src="'+url+'" style="max-width:100%;max-height:76vh;border-radius:18px;box-shadow:0 15px 60px rgba(0,0,0,.5)"></div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:16px"><button id="storyShare" style="background:#ff7414;color:#fff;border:0;border-radius:13px;padding:13px 20px;font-size:16px;font-weight:800">📲 Compartilhar</button><button id="storyDownload" style="background:#fff;color:#17283b;border:0;border-radius:13px;padding:13px 20px;font-size:16px;font-weight:800">Salvar imagem</button><button id="storyClose" style="background:#333;color:#fff;border:0;border-radius:13px;padding:13px 20px;font-size:16px;font-weight:800">Fechar</button></div>';
      document.body.appendChild(modal);
      modal.querySelector('#storyClose').onclick=()=>{URL.revokeObjectURL(url);modal.remove()};
      modal.querySelector('#storyDownload').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=file.name;a.click()};
      modal.querySelector('#storyShare').onclick=async()=>{try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',text:'Meu treino 💪',files:[file]});return}modal.querySelector('#storyDownload').click()}catch(e){if(e?.name!=='AbortError')modal.querySelector('#storyDownload').click()}};
    },'image/png');
  }

  window.postWorkoutInstagram=shareStory;
  window.generateStoryForLog=shareStory;

  function ensureReportCard(){
    if(window.current!=='Relatórios')return;
    const app=document.getElementById('app');if(!app||app.querySelector('#reportStoryCard'))return;
    const logs=Object.entries(window.data?.logs||{}).filter(([,l])=>l?.date).sort((a,b)=>String(b[1].date).localeCompare(String(a[1].date)));
    if(!logs.length)return;
    const latest=logs[0][1];
    const dates=[...new Set(logs.map(([,l])=>l.date))];
    const options=dates.map(d=>'<option value="'+esc(d)+'">'+esc(new Date(d+'T12:00:00').toLocaleDateString('pt-BR'))+'</option>').join('');
    const card=document.createElement('section');card.id='reportStoryCard';card.className='card';
    card.innerHTML='<h2>📸 Post para Instagram</h2><p class="muted">Fundo padrão do Meu Treino. Ao escolher a data, somente os dados do treino salvo são atualizados.</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"><label style="flex:1;min-width:190px;font-size:11px;font-weight:800;color:#71808f">DATA DO TREINO<select id="reportStoryDate" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:40px;border:1px solid #ccd5dd;border-radius:9px;padding:0 10px">'+options+'</select></label><button id="reportStoryBtn" class="primary smallbtn">📲 Gerar Story</button></div>';
    app.appendChild(card);
    card.querySelector('#reportStoryDate').value=latest.date;
    card.querySelector('#reportStoryBtn').onclick=async()=>{
      const date=card.querySelector('#reportStoryDate').value;
      const found=Object.entries(window.data?.logs||{}).find(([,l])=>l?.date===date);
      if(!found){alert('Não há treino salvo nessa data.');return}
      await shareStory(found[0]);
    };
  }

  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(ensureReportCard,120);return r};
  setInterval(ensureReportCard,800);
})();