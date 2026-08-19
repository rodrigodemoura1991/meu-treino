/* Histórico: rascunho não entra. Só o botão Salvar treino conclui o registro. */
(function(){
  const todayIso=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const today=todayIso();
  const originalSave=window.save;
  const originalWorkout=window.workout;
  const originalRender=window.render;

  function removeTodayDrafts(){
    let changed=false;
    Object.entries(data?.logs||{}).forEach(([k,l])=>{
      if(l?.date===today && l.explicitSaved!==true){
        delete data.logs[k];
        changed=true;
        if(user&&sb){
          sb.from('workout_logs').delete().eq('user_id',user.id).eq('log_key',CLOUD_PREFIX+k).catch(()=>{});
        }
      }
    });
    if(changed)try{localSave()}catch(e){}
  }

  // O autosave original continua funcionando, mas NÃO marca o treino como concluído.
  // O registro de hoje só fica no histórico quando explicitSave() for chamado.
  window.explicitSave=function(k){
    if(typeof originalSave==='function')originalSave(k);
    const l=data?.logs?.[k];
    if(!l)return;
    l.explicitSaved=true;
    l.saved=true;
    try{localSave()}catch(e){}
    try{queueSave(k)}catch(e){}
    setTimeout(()=>{try{localSave()}catch(e){}},50);
  };

  // Troca apenas o botão visível "Salvar treino"; os autosaves continuam usando save().
  if(typeof originalWorkout==='function'){
    window.workout=function(){
      let html=originalWorkout.apply(this,arguments);
      html=html.replace(/onclick="save\('([^']+)'\);alert\('Treino salvo\.'\)"/g,'onclick="explicitSave(\'$1\');alert(\'Treino salvo.\')"');
      return html;
    };
  }

  // Remove imediatamente o registro de hoje que já foi criado pelas versões anteriores.
  removeTodayDrafts();

  // Depois do carregamento da nuvem, a tela é renderizada novamente; limpamos drafts antes disso.
  if(typeof originalRender==='function'){
    window.render=function(){
      removeTodayDrafts();
      return originalRender.apply(this,arguments);
    };
  }

  // Segunda limpeza após o render para casos em que a nuvem terminou de carregar de forma assíncrona.
  setTimeout(()=>{
    removeTodayDrafts();
    try{if(typeof originalRender==='function')originalRender()}catch(e){}
  },800);
  setTimeout(()=>removeTodayDrafts(),2500);
})();
