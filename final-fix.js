/* FINAL FIX 2026-08-20 v5 — finaliza e zera o cronômetro sem perder a duração salva. */
(function(){
  const originalSetVal=window.setVal;
  if(typeof originalSetVal==='function'){
    window.setVal=function(k,i,s,kind,v){
      originalSetVal.apply(this,arguments);
      const n=Number(v);
      if(kind==='kg'&&n>0){
        const l=window.data?.logs?.[k];
        if(l&&!l.timerStartedAt){
          l.timerStartedAt=new Date().toISOString();
          l.timerElapsed=Number(l.timerElapsed||0);
          if(typeof window.save==='function')window.save(k);
          if(typeof window.startTimerLoop==='function')window.startTimerLoop();
          const clock=document.getElementById('workoutClock');
          if(clock&&typeof window.workoutTimerState==='function'&&typeof window.fmtDuration==='function')clock.textContent=window.fmtDuration(window.workoutTimerState(l));
        }
      }
      if(kind==='reps'&&n>0)setTimeout(function(){
        const name=window.exFor?(window.exFor(window.current)?.[i]?.[0]):null;
        if(!name)return;
        const seconds=(window.restPreset&&window.restPreset[name])||90;
        const box=document.getElementById('rest-'+i);
        if(!box||typeof window.toggleRest!=='function')return;
        if(window.restIntervals?.[i]){clearInterval(window.restIntervals[i]);delete window.restIntervals[i];box.classList.remove('done')}
        window.toggleRest(i,seconds,name);
      },120);
    };
  }

  try{
    const w=eval('workouts');
    if(w?.Quarta?.ex){
      const idx=w.Quarta.ex.findIndex(x=>x[0]==='Elevação pélvica');
      if(idx>=0)w.Quarta.ex.splice(idx,1,['Cadeira abdutora',3,'10–15']);
      else if(!w.Quarta.ex.some(x=>x[0]==='Cadeira abdutora'))w.Quarta.ex.splice(2,0,['Cadeira abdutora',3,'10–15']);
    }
    const rp=eval('restPreset');
    if(rp)rp['Cadeira abdutora']=75;
  }catch(e){console.error('workout config fix',e)}

  window.timerCard=function(l,k){
    const elapsed=typeof window.workoutTimerState==='function'?window.workoutTimerState(l):0;
    return '<section class="card workoutTimer"><div style="text-align:center"><span class="timerLabel" style="display:block;font-weight:800;margin-bottom:8px">⏱️ TEMPO DE TREINO</span><strong id="workoutClock" style="display:block;font-size:32px;line-height:1.2">'+(typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):'0:00:00')+'</strong></div></section>';
  };

  window.finishAndSaveWorkout=async function(k){
    const l=window.data?.logs?.[k];if(!l)return;

    // Captura a duração real antes de encerrar e zera somente o contador visual.
    const hadTimer=!!l.timerStartedAt || Number(l.timerElapsed||0)>0;
    if(hadTimer){
      const elapsed=typeof window.workoutTimerState==='function'?window.workoutTimerState(l):Number(l.timerElapsed||0);
      l.duration=typeof window.fmtDuration==='function'?window.fmtDuration(elapsed):l.duration;
    }
    delete l.timerStartedAt;
    l.timerElapsed=0;
    l.completed=true;

    if(window.workoutInterval){clearInterval(window.workoutInterval);window.workoutInterval=null}
    if(typeof window.save==='function')await window.save(k);
    if(typeof window.render==='function')window.render();

    // Garante que qualquer elemento antigo da tela também volte a zero.
    setTimeout(()=>{
      const clock=document.getElementById('workoutClock');
      if(clock)clock.textContent='0:00:00';
    },30);

    const el=document.createElement('div');
    el.textContent='✓ Treino salvo';
    el.style.cssText='position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:99999;background:#1f9d55;color:#fff;padding:14px 24px;border-radius:14px;font-weight:800;font-size:18px;box-shadow:0 8px 30px rgba(0,0,0,.2)';
    document.body.appendChild(el);setTimeout(()=>el.remove(),2200);
  };

  function patchSaveButton(){
    document.querySelectorAll('button').forEach(btn=>{
      if((btn.textContent||'').includes('Salvar treino')&&!btn.dataset.finalSavePatched){
        const m=btn.getAttribute('onclick')||'';const match=m.match(/save\('([^']+)'\)/);
        if(match){btn.dataset.finalSavePatched='1';btn.setAttribute('onclick',"finishAndSaveWorkout('"+match[1]+"')")}
      }
    });
  }
  const observer=new MutationObserver(patchSaveButton);observer.observe(document.documentElement,{childList:true,subtree:true});
  patchSaveButton();setTimeout(patchSaveButton,500);

  // Desativa completamente o avanço automático entre kg/repetições/séries.
  window.advanceField=function(){};

  const VIB_KEY='meu_treino_vibracao_descanso';
  const vibrationOn=()=>localStorage.getItem(VIB_KEY)==='1';
  const vibrateLong=()=>{if(vibrationOn()&&typeof navigator!=='undefined'&&typeof navigator.vibrate==='function'){try{navigator.vibrate(900)}catch(e){}}};
  const restSeen=new WeakSet();
  function watchRest(){
    document.querySelectorAll('.restbox').forEach(box=>{
      const done=box.classList.contains('done');
      if(done&&!restSeen.has(box)){restSeen.add(box);vibrateLong()}
      else if(!done&&restSeen.has(box))restSeen.delete(box);
    });
  }
  function addVibrationSetting(){
    if(typeof current==='undefined'||current!=='Dados')return;
    const app=document.getElementById('app');
    if(!app||app.querySelector('#vibration-setting'))return;
    const card=document.createElement('div');
    card.id='vibration-setting';
    card.style.cssText='margin:16px 0;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 4px 16px rgba(0,0,0,.05)';
    const supported=typeof navigator!=='undefined'&&typeof navigator.vibrate==='function';
    card.innerHTML='<div style="font-weight:800;font-size:18px;margin-bottom:6px">📳 Vibração ao terminar descanso</div><div style="font-size:14px;color:#6b7280;margin-bottom:12px">Vibração longa de 0,9 segundo quando o cronômetro de descanso chegar a zero.</div><label style="display:flex;align-items:center;gap:12px;font-size:16px;font-weight:700;cursor:pointer"><input id="vibration-toggle" type="checkbox" '+(vibrationOn()?'checked':'')+' style="width:22px;height:22px"> Ativar vibração</label><div style="margin-top:9px;font-size:13px;color:'+(supported?'#6b7280':'#b45309')+'">'+(supported?'Seu navegador informa suporte à vibração.':'Este navegador pode não permitir vibração em páginas web; a opção ficará salva para quando houver suporte.')+'</div>';
    app.prepend(card);
    card.querySelector('#vibration-toggle').addEventListener('change',e=>localStorage.setItem(VIB_KEY,e.target.checked?'1':'0'));
  }
  const restObserver=new MutationObserver(()=>{watchRest();addVibrationSetting()});
  restObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(()=>{watchRest();addVibrationSetting()},700);
  setTimeout(()=>{watchRest();addVibrationSetting()},500);
  setTimeout(function(){if(typeof window.render==='function')window.render()},100);
})();
