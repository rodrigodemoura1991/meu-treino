/* STORY INSTAGRAM — gerador único, usando o histórico real do Meu Treino */
(function(){
  const W=1080,H=1920;
  const BG='story-bg.jpg?v=20260819storybg3';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};

  function durationText(v){
    if(v===null||v===undefined||String(v).trim()==='') return '—';
    const s=String(v).trim();
    if(/^\d+:\d{1,2}$/.test(s)) return s;
    if(/^\d+:\d{1,2}:\d{1,2}$/.test(s)){
      const p=s.split(':'); return p[0]+':'+String(p[1]).padStart(2,'0');
    }
    const n=num(s);
    if(!n) return '—';
    const total=Math.round(n);
    return Math.floor(total/60)+':'+String(total%60).padStart(2,'0');
  }

  function cardioText(v){
    if(v===null||v===undefined||String(v).trim()==='') return '—';
    const s=String(v).trim().toLowerCase().replace(',', '.');
    const clock=s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
    if(clock) return clock[1]+':'+String(clock[2]).padStart(2,'0');
    const h=s.match(/(\d+(?:\.\d+)?)\s*h/), m=s.match(/(\d+(?:\.\d+)?)\s*(?:min|m)\b/);
    if(h||m){
      const mins=Math.round((h?num(h[1])*60:0)+(m?num(m[1]):0));
      return Math.floor(mins/60)+':'+String(mins%60).padStart(2,'0');
    }
    const n=num(s); if(!n) return '—';
    return Math.floor(n/60)+':'+String(Math.round(n%60)).padStart(2,'0');
  }

  function volume(l){
    let total=0;
    Object.values(l?.rows||{}).forEach(r=>{
      for(let s=0;s<40;s++){
        const kg=num(r?.['kg'+s]), reps=num(r?.['reps'+s]);
        if(kg>0&&reps>0) total+=kg*reps;
      }
    });
    return total;
  }

  function calories(l){
    const total=num(l?.calories)+num(l?.cardio?.calories);
    return total>0 ? Math.round(total).toLocaleString('pt-BR')+' kcal' : '—';
  }

  function dateInfo(l){
    const d=l?.date?new Date(l.date+'T12:00:00'):null;
    if(!d||isNaN(d)) return {date:'—',weekday:'',title:l?.day||'Treino'};
    return {
      date:d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}),
      weekday:d.toLocaleDateString('pt-BR',{weekday:'long'}),
      title:window.workouts?.[l.day]?.title||l.day||'Treino'
    };
  }

  async function getTemperature(l){
    if(l?.temperature!==undefined&&l?.temperature!==null&&String(l.temperature)!==''){
      return String(l.temperature).includes('°')?String(l.temperature):String(l.temperature)+' °C';
    }
    try{
      const lat=-26.081; const lon=-53.053;
      const date=l?.date||'';
      const today=new Date().toISOString().slice(0,10);
      let url;
      if(date && date < today){
        url='https://archive-api.open-meteo.com/v1/archive?latitude='+lat+'&longitude='+lon+'&start_date='+date+'&end_date='+date+'&daily=temperature_2m_mean&timezone=America%2FSao_Paulo';
      }else{
        url='https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m&timezone=America%2FSao_Paulo';
      }
      const r=await fetch(url); if(!r.ok) throw new Error('weather');
      const j=await r.json();
      const t=date&&date<today?num(j?.daily?.temperature_2m_mean?.[0]):num(j?.current?.temperature_2m);
      return t?Math.round(t)+' °C':'—';
    }catch(e){return '—'}
  }

  function loadImage(src){
    return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src});
  }

  function drawCover(ctx,img){
    if(img){
      const scale=Math.max(W/img.width,H/img.height),dw=img.width*scale,dh=img.height*scale;
      ctx.drawImage(img,(W-dw)/2,(H-dh)/2,dw,dh);
    }else{
      ctx.fillStyle='#111820';ctx.fillRect(0,0,W,H);
    }
    const g=ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,'rgba(0,0,0,.90)');g.addColorStop(.52,'rgba(0,0,0,.66)');g.addColorStop(1,'rgba(0,0,0,.25)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const b=ctx.createLinearGradient(0,1050,0,H);
    b.addColorStop(0,'rgba(0,0,0,0)');b.addColorStop(1,'rgba(0,0,0,.84)');
    ctx.fillStyle=b;ctx.fillRect(0,1050,W,H-1050);
  }

  function metric(ctx,y,icon,label,value){
    ctx.save();
    ctx.fillStyle='rgba(10,14,18,.78)';ctx.beginPath();ctx.roundRect(58,y,964,190,30);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.17)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#ff7414';ctx.beginPath();ctx.roundRect(82,y+32,8,126,4);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='700 30px Arial,sans-serif';ctx.fillText(icon,112,y+68);
    ctx.fillStyle='#cbd3da';ctx.font='800 24px Arial,sans-serif';ctx.fillText(label,160,y+65);
    ctx.fillStyle='#fff';ctx.font='900 60px Arial,sans-serif';ctx.fillText(value,160,y+133);
    ctx.restore();
  }

  async function buildStory(l){
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');
    const bg=await loadImage(BG);drawCover(ctx,bg);
    const info=dateInfo(l);
    const temp=await getTemperature(l);

    ctx.fillStyle='#ff7414';ctx.fillRect(58,72,964,10);
    ctx.fillStyle='#fff';ctx.font='900 60px Arial,sans-serif';ctx.fillText('MEU TREINO',58,170);
    ctx.fillStyle='#c7d0d8';ctx.font='700 24px Arial,sans-serif';ctx.fillText('MUSCULAÇÃO  •  PROGRESSÃO',61,208);

    ctx.fillStyle='#fff';ctx.font='900 54px Arial,sans-serif';ctx.fillText(info.title,58,330);
    ctx.fillStyle='#ff7414';ctx.font='900 34px Arial,sans-serif';ctx.fillText(info.weekday.toUpperCase(),60,382);
    ctx.fillStyle='#e4e8eb';ctx.font='700 27px Arial,sans-serif';ctx.fillText(info.date,61,425);

    metric(ctx,500,'⏱','TEMPO DE TREINO',durationText(l.duration));
    metric(ctx,710,'🚴','TEMPO DE CARDIO',cardioText(l.cardio?.duration));
    metric(ctx,920,'🔥','CALORIAS GASTAS',calories(l));
    const vol=volume(l);
    metric(ctx,1130,'🏋️','PESO LEVANTADO',vol>0?Math.round(vol).toLocaleString('pt-BR')+' kg':'—');
    metric(ctx,1340,'🌡','TEMPERATURA',temp);

    ctx.fillStyle='#ff7414';ctx.fillRect(58,1655,470,6);
    ctx.fillStyle='#fff';ctx.font='800 29px Arial,sans-serif';ctx.fillText('MEU TREINO  •  PROGRESSÃO',58,1720);
    ctx.fillStyle='#c1c9d0';ctx.font='600 21px Arial,sans-serif';ctx.fillText('Dados reais do histórico deste treino',61,1760);
    ctx.fillStyle='#fff';ctx.font='700 20px Arial,sans-serif';ctx.fillText('#MEUTREINO  #DISCIPLINA  #FOCO',61,1810);
    return canvas;
  }

  async function shareForKey(k){
    const l=window.data?.logs?.[k];
    if(!l){alert('Treino não encontrado no histórico.');return}
    const canvas=await buildStory(l);
    canvas.toBlob(async blob=>{
      if(!blob){alert('Não foi possível gerar o Story.');return}
      const file=new File([blob],'meu-treino-story-'+(l.date||'treino')+'.png',{type:'image/png'});
      const url=URL.createObjectURL(blob);
      let modal=document.getElementById('storyPreviewModal');if(modal)modal.remove();
      modal=document.createElement('div');modal.id='storyPreviewModal';
      modal.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
      modal.innerHTML='<img src="'+url+'" alt="Story Meu Treino" style="max-width:min(430px,94vw);max-height:78vh;border-radius:16px;box-shadow:0 15px 60px rgba(0,0,0,.6)"><div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-top:15px"><button id="storyShare" style="background:#ff7414;color:#fff;border:0;border-radius:12px;padding:13px 19px;font-size:16px;font-weight:800">📲 Compartilhar</button><button id="storyDownload" style="background:#fff;color:#17283b;border:0;border-radius:12px;padding:13px 19px;font-size:16px;font-weight:800">Salvar imagem</button><button id="storyClose" style="background:#333;color:#fff;border:0;border-radius:12px;padding:13px 19px;font-size:16px;font-weight:800">Fechar</button></div>';
      document.body.appendChild(modal);
      modal.querySelector('#storyClose').onclick=()=>{URL.revokeObjectURL(url);modal.remove()};
      modal.querySelector('#storyDownload').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=file.name;a.click()};
      modal.querySelector('#storyShare').onclick=async()=>{try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',text:'Meu treino 💪',files:[file]});return}modal.querySelector('#storyDownload').click()}catch(e){if(e?.name!=='AbortError')modal.querySelector('#storyDownload').click()}};
    },'image/png');
  }

  function keyForDate(date){
    const entries=Object.entries(window.data?.logs||{}).filter(([,l])=>l?.date===date);
    if(!entries.length)return null;
    entries.sort((a,b)=>String(b[1].updated_at||'').localeCompare(String(a[1].updated_at||'')));
    return entries[0][0];
  }

  async function generateSelected(){
    const date=document.getElementById('reportStoryDate')?.value || document.getElementById('periodReportDate')?.value || today();
    const k=keyForDate(date);
    if(!k){alert('Não há treino salvo para a data escolhida.');return}
    await shareForKey(k);
  }

  function patchExistingButton(){
    const b=document.getElementById('storyBtn');
    if(b){b.textContent='📸 Post para Instagram';b.onclick=generateSelected;b.removeAttribute('data-old-story')}
  }

  function ensureStoryCard(){
    if(window.current!=='Relatórios')return;
    patchExistingButton();
    const app=document.getElementById('app');if(!app)return;
    let card=document.getElementById('reportStoryCard');
    if(card)return;
    const entries=Object.entries(window.data?.logs||{}).filter(([,l])=>l?.date).sort((a,b)=>String(b[1].date).localeCompare(String(a[1].date)));
    if(!entries.length)return;
    const dates=[...new Set(entries.map(([,l])=>l.date))];
    const options=dates.map(d=>'<option value="'+esc(d)+'">'+esc(new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}))+'</option>').join('');
    card=document.createElement('section');card.id='reportStoryCard';card.className='card';
    card.innerHTML='<h2>📸 Post para Instagram</h2><p class="muted">Escolha o treino salvo. O fundo é padrão e somente as métricas mudam conforme o histórico.</p><div style="display:flex;gap:9px;flex-wrap:wrap;align-items:end"><label style="flex:1;min-width:210px;font-size:11px;font-weight:800;color:#71808f">TREINO<select id="reportStoryDate" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:42px;border:1px solid #ccd5dd;border-radius:9px;padding:0 10px">'+options+'</select></label><button id="reportStoryBtn" class="primary smallbtn">📸 Post para Instagram</button></div>';
    app.appendChild(card);
    card.querySelector('#reportStoryBtn').onclick=generateSelected;
    card.querySelector('#reportStoryDate').value=dates[0];
  }

  // Substitui os geradores antigos: o botão existente e a função global passam a usar este gerador.
  window.postWorkoutInstagram=shareForKey;
  window.generateStory=generateSelected;
  window.generateStoryForLog=shareForKey;

  const oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(ensureStoryCard,80);return r};
  }
  setTimeout(ensureStoryCard,300);
  setInterval(ensureStoryCard,1000);
})();