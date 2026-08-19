/* STORY RUNTIME FIX — 2026-08-19
   Corrige o acesso ao estado real do app: app.js usa let data/workouts/current,
   então eles não existem como window.data/window.workouts/window.current.
   O story-bridge expõe o estado em window.__meuTreinoState.
*/
(function(){
  const W=1080,H=1920;
  const BG='story-bg.jpg?v=20260819runtime1';
  const DAYS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const state=()=>window.__meuTreinoState||{};
  const getData=()=>state().data||window.data||{logs:{}};
  const getWorkouts=()=>state().workouts||window.workouts||{};
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const isoDate=v=>{const s=String(v??'').trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:''};
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

  function formatDuration(v){
    if(v===undefined||v===null||String(v).trim()==='')return '—';
    const s=String(v).trim();
    if(/^\d+:\d{1,2}$/.test(s)){const p=s.split(':');return p[0]+':'+String(p[1]).padStart(2,'0')}
    if(/^\d+:\d{1,2}:\d{1,2}$/.test(s)){const p=s.split(':');return p[0]+':'+String(p[1]).padStart(2,'0')}
    const n=num(s);if(!n)return '—';return Math.floor(n/60)+':'+String(Math.round(n%60)).padStart(2,'0');
  }
  function formatCardio(v){return formatDuration(v)}
  function volume(l){
    let total=0;
    Object.values(l?.rows||{}).forEach(r=>{for(let s=0;s<60;s++){const kg=num(r?.['kg'+s]),reps=num(r?.['reps'+s]);if(kg>0&&reps>0)total+=kg*reps}});
    return total;
  }
  function calories(l){const x=num(l?.calories)+num(l?.cardio?.calories);return x?Math.round(x).toLocaleString('pt-BR')+' kcal':'—'}
  function loadImage(src){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src})}
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}

  function findLogByDate(date){
    const logs=getData().logs||{};
    const target=isoDate(date);
    const entries=Object.entries(logs).filter(([k,l])=>isoDate(l?.date)===target || isoDate(String(k).split('|').pop())===target);
    entries.sort((a,b)=>String(b[1]?.updated_at||'').localeCompare(String(a[1]?.updated_at||'')));
    return entries[0]||null;
  }

  function selectedDate(){
    const v=document.getElementById('reportStoryDate')?.value||document.getElementById('periodReportDate')?.value||today();
    return isoDate(v)||today();
  }

  async function temperature(l){
    if(l?.temperature!==undefined&&l?.temperature!==null&&String(l.temperature).trim()!==''){
      const s=String(l.temperature).trim();return /°C/i.test(s)?s:s+' °C';
    }
    try{
      const date=isoDate(l?.date);const lat=-26.081,lon=-53.053;
      let url;
      if(date&&date<today()) url='https://archive-api.open-meteo.com/v1/archive?latitude='+lat+'&longitude='+lon+'&start_date='+date+'&end_date='+date+'&daily=temperature_2m_mean&timezone=America%2FSao_Paulo';
      else url='https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m&timezone=America%2FSao_Paulo';
      const r=await fetch(url);if(!r.ok)throw 0;const j=await r.json();
      const t=date&&date<today()?num(j?.daily?.temperature_2m_mean?.[0]):num(j?.current?.temperature_2m);
      return t?Math.round(t)+' °C':'—';
    }catch(e){return '—'}
  }

  function drawMetric(ctx,y,icon,label,value){
    ctx.fillStyle='rgba(10,16,22,.76)';rounded(ctx,54,y,972,184,28);
    ctx.strokeStyle='rgba(255,255,255,.20)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#f26f00';rounded(ctx,78,y+28,8,128,4);
    ctx.fillStyle='#fff';ctx.font='700 30px Arial,sans-serif';ctx.fillText(icon,112,y+65);
    ctx.fillStyle='#d2d9df';ctx.font='800 22px Arial,sans-serif';ctx.fillText(label,158,y+63);
    ctx.fillStyle='#fff';ctx.font='900 55px Arial,sans-serif';ctx.fillText(value,112,y+133);
  }

  async function buildStory(l){
    const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
    const bg=await loadImage(BG);
    if(bg){const s=Math.max(W/bg.width,H/bg.height),dw=bg.width*s,dh=bg.height*s;ctx.drawImage(bg,(W-dw)/2,(H-dh)/2,dw,dh)}
    else{ctx.fillStyle='#101820';ctx.fillRect(0,0,W,H)}
    const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(0,0,0,.66)');shade.addColorStop(.45,'rgba(0,0,0,.34)');shade.addColorStop(1,'rgba(0,0,0,.80)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f26f00';ctx.fillRect(0,0,W,12);

    const workouts=getWorkouts();const date=isoDate(l.date);const d=date?new Date(date+'T12:00:00'):null;
    const weekday=d&&!isNaN(d)?d.toLocaleDateString('pt-BR',{weekday:'long'}):String(l.day||'Treino');
    const dateText=d&&!isNaN(d)?d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}):(l.date||'—');
    const title=workouts[l.day]?.title||l.title||l.day||'Treino';

    ctx.fillStyle='#fff';ctx.font='900 62px Arial,sans-serif';ctx.fillText('MEU TREINO',58,140);
    ctx.fillStyle='#d5dde4';ctx.font='700 24px Arial,sans-serif';ctx.fillText('MUSCULAÇÃO  •  PROGRESSÃO',61,178);
    ctx.fillStyle='#fff';ctx.font='900 48px Arial,sans-serif';ctx.fillText(title,58,315);
    ctx.fillStyle='#f26f00';ctx.font='900 29px Arial,sans-serif';ctx.fillText(weekday.toUpperCase(),60,358);
    ctx.fillStyle='#fff';ctx.font='700 25px Arial,sans-serif';ctx.fillText(dateText,61,398);

    drawMetric(ctx,455,'⏱','TEMPO DE TREINO',formatDuration(l.duration));
    drawMetric(ctx,655,'🔥','CALORIAS GASTAS',calories(l));
    drawMetric(ctx,855,'🚴','TEMPO DE CARDIO',formatCardio(l?.cardio?.duration));
    const vol=volume(l);drawMetric(ctx,1055,'🏋️','PESO LEVANTADO',vol?Math.round(vol).toLocaleString('pt-BR')+' kg':'—');
    drawMetric(ctx,1255,'🌡','TEMPERATURA',await temperature(l));

    ctx.fillStyle='rgba(8,12,16,.64)';rounded(ctx,54,1490,972,142,24);
    ctx.fillStyle='#fff';ctx.font='800 23px Arial,sans-serif';ctx.fillText('DADOS DO TREINO SALVO NO HISTÓRICO',82,1538);
    ctx.fillStyle='#d2d9df';ctx.font='600 20px Arial,sans-serif';ctx.fillText('Métricas calculadas automaticamente pelo Meu Treino',82,1576);
    ctx.fillStyle='#f26f00';ctx.fillRect(58,1782,350,6);
    ctx.fillStyle='#fff';ctx.font='800 23px Arial,sans-serif';ctx.fillText('MEU TREINO  •  PROGRESSÃO',58,1832);
    ctx.fillStyle='#d5dde4';ctx.font='600 18px Arial,sans-serif';ctx.fillText('#MEUTREINO  #TREINO  #DISCIPLINA',58,1870);
    return c;
  }

  async function shareLog(k){
    const logs=getData().logs||{};const l=logs[k];
    if(!l){alert('Treino não encontrado no Histórico.');return}
    const canvas=await buildStory(l);
    canvas.toBlob(async blob=>{
      if(!blob){alert('Não foi possível gerar o Story.');return}
      const file=new File([blob],'meu-treino-story-'+(isoDate(l.date)||'treino')+'.png',{type:'image/png'});
      const url=URL.createObjectURL(blob);
      const old=document.getElementById('runtimeStoryModal');if(old)old.remove();
      const m=document.createElement('div');m.id='runtimeStoryModal';m.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;box-sizing:border-box';
      m.innerHTML='<img src="'+url+'" style="max-width:92vw;max-height:78vh;object-fit:contain;border-radius:14px;box-shadow:0 15px 60px rgba(0,0,0,.7)"><div style="display:flex;gap:9px;margin-top:14px;flex-wrap:wrap;justify-content:center"><button id="runtimeShare" style="background:#f26f00;color:#fff;border:0;border-radius:12px;padding:13px 20px;font-size:16px;font-weight:800">📲 Compartilhar</button><button id="runtimeSave" style="background:#fff;color:#182331;border:0;border-radius:12px;padding:13px 20px;font-size:16px;font-weight:800">Salvar imagem</button><button id="runtimeClose" style="background:#333;color:#fff;border:0;border-radius:12px;padding:13px 20px;font-size:16px;font-weight:800">Fechar</button></div>';
      document.body.appendChild(m);
      m.querySelector('#runtimeClose').onclick=()=>{URL.revokeObjectURL(url);m.remove()};
      m.querySelector('#runtimeSave').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=file.name;a.click()};
      m.querySelector('#runtimeShare').onclick=async()=>{try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',text:'Meu treino 💪',files:[file]});return}}catch(e){if(e?.name==='AbortError')return}m.querySelector('#runtimeSave').click()};
    },'image/png');
  }

  async function generateSelected(){
    const k=findLogByDate(selectedDate());
    if(!k){alert('Não há treino salvo para a data escolhida.');return}
    await shareLog(k[0]);
  }

  function patch(){
    const btn=document.getElementById('reportStoryBtn');
    if(btn){btn.textContent='📸 Post para Instagram';btn.onclick=generateSelected}
    document.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(t.includes('postar no instagram')||t.includes('post para instagram')||t.includes('gerar foto')){
        b.onclick=(e)=>{e.preventDefault();e.stopPropagation();
          const row=b.closest('.historyrow');
          if(row){const text=row.querySelector('.historyhead b')?.textContent||'';const m=text.match(/^(.+?)\s+—\s+(\d{2})\/(\d{2})\/(\d{4})$/);if(m){const k=m[1].trim()+'|'+m[4]+'-'+m[3]+'-'+m[2];shareLog(k);return}}
          generateSelected();
        };
      }
    });
  }

  window.generateStory=generateSelected;
  window.generateStoryForLog=shareLog;
  window.postWorkoutInstagram=shareLog;
  setTimeout(patch,200);
  setInterval(patch,700);
})();
