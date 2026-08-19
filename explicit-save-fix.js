/* Regra de histórico: só entra após o botão "Salvar treino". */
(function(){
  const todayIso=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  function hasRealData(l){
    if(!l)return false;
    if([l.notes,l.duration,l.avgBpm,l.calories,l.effort].some(v=>v!==''&&v!=null))return true;
    const c=l.cardio||{};
    if(Object.values(c).some(v=>v!==''&&v!=null))return true;
    return Object.values(l.rows||{}).some(r=>Object.values(r||{}).some(v=>v!==''&&v!=null&&v!==false));
  }
  function migrate(){
    const today=todayIso();
    let changed=false;
    Object.entries(data?.logs||{}).forEach(([k,l])=>{
      if(!l?.date)return;
      if(l.saved===undefined){
        l.saved = l.date < today && hasRealData(l);
        changed=true;
      }
      if(l.saved===false && !hasRealData(l) && l.date===today){
        delete data.logs[k]; changed=true;
        if(user&&sb)sb.from('workout_logs').delete().eq('user_id',user.id).eq('log_key',CLOUD_PREFIX+k).catch(()=>{});
      }
    });
    if(changed)try{localSave()}catch(e){}
  }
  migrate();
  const originalSave=window.save;
  window.save=function(k){
    if(typeof originalSave==='function')originalSave(k);
    const l=data?.logs?.[k];
    if(!l)return;
    l.saved=true;
    try{localSave();}catch(e){}
    try{queueSave(k);}catch(e){}
  };
  function hideDraftHistory(){
    migrate();
    if(current!=='Histórico')return;
    document.querySelectorAll('.historyrow').forEach(row=>{
      const btn=row.querySelector('button[onclick*="deleteLog"]');
      const m=btn?.getAttribute('onclick')?.match(/deleteLog\('([^']+)'\)/);
      if(m&&data.logs[m[1]]?.saved!==true)row.remove();
    });
    const card=document.querySelector('.card .historyrow')?.closest('.card');
    if(card && !card.querySelector('.historyrow')){
      card.innerHTML='<div class="emptyicon">📈</div><h2>Nenhum treino salvo</h2><p>Use “Salvar treino” para colocar o treino no histórico.</p>';
    }
  }
  const previousRender=window.render;
  if(previousRender){
    window.render=function(){migrate();const out=previousRender.apply(this,arguments);setTimeout(hideDraftHistory,0);return out};
  }
})();
