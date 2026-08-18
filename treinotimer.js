/* Cronômetro de treino: início/fim + duração automática */
(function(){
  let timer=null, startedAt=null, elapsedBefore=0;
  const pad=n=>String(n).padStart(2,'0');
  const fmt=s=>`${Math.floor(s/3600)}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`;
  function getDayKey(){const day=window.current||'Segunda';const d=new Date();const y=d.getFullYear(),m=pad(d.getMonth()+1),dd=pad(d.getDate());return day+'|'+y+'-'+m+'-'+dd}
  function log(){return window.data?.logs?.[getDayKey()]||null}
  function saveDuration(v){const l=log();if(!l)return;l.duration=v;try{localStorage.setItem('meu_treino_reset_v1',JSON.stringify(window.data))}catch(e){}if(typeof window.save==='function')window.save(getDayKey())}
  function update(){if(!startedAt)return;const s=elapsedBefore+Math.floor((Date.now()-startedAt)/1000);const out=document.getElementById('treinoClock');if(out)out.textContent=fmt(s)}
  function start(){if(startedAt)return;startedAt=Date.now();timer=setInterval(update,1000);render();}
  function stop(){if(!startedAt)return;elapsedBefore+=Math.floor((Date.now()-startedAt)/1000);startedAt=null;if(timer){clearInterval(timer);timer=null}const duration=fmt(elapsedBefore);saveDuration(duration);render();alert('Treino encerrado. Tempo salvo: '+duration)}
  function reset(){startedAt=null;elapsedBefore=0;if(timer)clearInterval(timer);timer=null;render()}
  function box(){
    if(!window.days?.includes(window.current))return '';
    const l=log();const saved=l?.duration||'';
    return `<section class="card workoutTimer"><div><span class="timerLabel">⏱️ TEMPO DE TREINO</span><strong id="treinoClock">${startedAt?fmt(elapsedBefore+Math.floor((Date.now()-startedAt)/1000)):(saved||'00:00:00')}</strong><small>${startedAt?'Treino em andamento':'Inicie antes da primeira série'}</small></div><div class="timerBtns"><button class="primary" onclick="window._treinoStart()" ${startedAt?'disabled':''}>▶ START</button><button class="danger" onclick="window._treinoStop()" ${startedAt?'':'disabled'}>■ STOP</button></div></section>`;
  }
  window._treinoStart=start;window._treinoStop=stop;window._treinoReset=reset;window.treinoTimerBox=box;
  const css=document.createElement('style');css.textContent='.workoutTimer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:14px 0;background:#fff}.timerLabel{display:block;font-size:10px;font-weight:800;letter-spacing:1px;color:#7b8797}.workoutTimer strong{display:block;font-size:30px;line-height:1.15;margin:3px 0}.workoutTimer small{color:#7b8797}.timerBtns{display:flex;gap:8px}.timerBtns button{min-width:82px}@media(max-width:600px){.workoutTimer{padding:14px}.workoutTimer strong{font-size:25px}.timerBtns{flex-direction:column}}';document.head.appendChild(css);
  setInterval(()=>{if(startedAt)update()},1000);
})();
