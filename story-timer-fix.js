/* STORY + TIMER FIX 2026-08-19
   - Adds Story Instagram controls directly to Relatórios.
   - Guarantees explicit "Salvar treino" finalizes and freezes the general timer.
   - Leaving the workout screen also freezes any running timer for that day.
*/
(function(){
  const DAY_NAMES=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const isoToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const logKey=(day,date)=>day+'|'+date;

  function stopTimerForLog(k){
    const l=window.data?.logs?.[k];
    if(!l?.timerStartedAt)return false;
    const elapsed=typeof window.workoutTimerState==='function'?window.workoutTimerState(l):Number(l.timerElapsed||0);
    l.timerElapsed=elapsed;
    l.duration=typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):l.duration;
    delete l.timerStartedAt;
    if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null}
    if(typeof window.save==='function')window.save(k);else if(typeof window.localSave==='function')window.localSave();
    return true;
  }

  window.finalizeCurrentWorkoutTimer=function(k){
    const done=stopTimerForLog(k);
    const clock=document.getElementById('workoutClock');
    const l=window.data?.logs?.[k];
    if(clock&&l&&typeof window.workoutTimerState==='function'&&typeof window.fmtDuration==='function')clock.textContent=window.fmtDuration(window.workoutTimerState(l));
    return done;
  };

  // Intercept the actual button click, independently of inline onclick patches.
  document.addEventListener('click',function(e){
    const btn=e.target?.closest?.('button');
    if(!btn)return;
    if((btn.textContent||'').replace(/\s+/g,' ').trim().includes('Salvar treino')){
      const k=logKey(window.current,isoToday());
      e.preventDefault();e.stopImmediatePropagation();
      const l=window.data?.logs?.[k];
      if(l){
        stopTimerForLog(k);
        l.completed=true;
        if(typeof window.save==='function')window.save(k);else if(typeof window.localSave==='function')window.localSave();
      }
      if(typeof window.render==='function')window.render();
      const toast=document.createElement('div');toast.textContent='✓ Treino salvo';toast.style.cssText='position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:99999;background:#1f9d55;color:#fff;padding:14px 24px;border-radius:14px;font-weight:800;font-size:18px;box-shadow:0 8px 30px rgba(0,0,0,.2)';document.body.appendChild(toast);setTimeout(()=>toast.remove(),2200);
    }
  },true);

  // If the user navigates away from the workout, don't keep its clock running in the background.
  const oldGo=window.go;
  if(typeof oldGo==='function')window.go=function(next){
    if(window.current&&DAY_NAMES.includes(window.current)&&next!==window.current){stopTimerForLog(logKey(window.current,isoToday()))}
    return oldGo.apply(this,arguments);
  };

  // Build Story controls in Relatórios. The selected date uses the saved workout for that day.
  function addReportStory(){
    if(window.current!=='Relatórios')return;
    const app=document.getElementById('app');if(!app)return;
    if(app.querySelector('#reportStoryCard'))return;
    const logs=Object.values(window.data?.logs||{}).filter(l=>l?.date).sort((a,b)=>b.date.localeCompare(a.date));
    if(!logs.length)return;
    const latest=logs[0];
    const card=document.createElement('section');card.id='reportStoryCard';card.className='card';
    card.innerHTML='<h2>📸 Story do Instagram</h2><p class="muted">Gere uma arte vertical 1080×1920 com tempo, calorias, peso levantado e temperatura.</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"><label style="flex:1;min-width:190px;font-size:11px;font-weight:800;color:#71808f">TREINO<input id="reportStoryDate" type="date" value="'+latest.date+'" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:40px;border:1px solid #ccd5dd;border-radius:9px;padding:0 10px"></label><button id="reportStoryBtn" class="primary smallbtn">📲 Postar no Instagram</button></div><div id="reportStoryHint" class="muted" style="margin-top:8px;font-size:12px">Seleciona a data do treino salvo e toque no botão.</div>';
    app.appendChild(card);
    card.querySelector('#reportStoryBtn').onclick=async()=>{
      const date=card.querySelector('#reportStoryDate').value;
      const found=Object.entries(window.data?.logs||{}).find(([k,l])=>l?.date===date);
      if(!found){alert('Não há treino salvo nessa data.');return}
      if(typeof window.generateStoryForLog==='function')await window.generateStoryForLog(found[0]);
      else if(typeof window.postWorkoutInstagram==='function')await window.postWorkoutInstagram(found[0]);
      else alert('Gerador de Story ainda não carregou. Recarregue a página.');
    };
  }

  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(addReportStory,100);return r};
  setInterval(addReportStory,700);
})();
