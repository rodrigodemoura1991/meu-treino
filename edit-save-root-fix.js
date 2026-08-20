/* ROOT FIX: edição do Histórico deve atualizar a mesma fonte de dados e a nuvem imediatamente. */
(function(){
  function val(sel){return document.querySelector(sel)?.value ?? ''}
  function save(){
    const k=window.__editingLogKey;
    const l=window.data?.logs?.[k];
    if(!k||!l)return;
    document.querySelectorAll('#editOverlay [data-edit="kg"],#editOverlay [data-edit="reps"]').forEach(el=>{
      l.rows[el.dataset.i]??={};
      l.rows[el.dataset.i][el.dataset.edit+el.dataset.s]=el.value;
    });
    document.querySelectorAll('#editOverlay [data-edit="obs"]').forEach(el=>{
      l.rows[el.dataset.i]??={}; l.rows[el.dataset.i].observation=el.value;
    });
    document.querySelectorAll('#editOverlay [data-edit="metric"]').forEach(el=>l[el.dataset.f]=el.value);
    l.cardio=l.cardio||{};
    document.querySelectorAll('#editOverlay [data-edit="cardio"]').forEach(el=>l.cardio[el.dataset.f]=el.value);
    const notes=document.querySelector('#editOverlay [data-edit="notes"]'); if(notes)l.notes=notes.value;
    l.updatedAt=new Date().toISOString();
    try{localStorage.setItem(window.LOCAL_KEY||'meu_treino_reset_v1',JSON.stringify(window.data))}catch(e){}
    if(typeof window.closeEditLog==='function')window.closeEditLog();
    window.current='Histórico';
    if(typeof window.render==='function')window.render();
    // Não esperar debounce: edição é uma operação explícita e precisa ir à nuvem agora.
    if(window.user&&window.sb){
      window.sb.from('workout_logs').upsert({
        user_id:window.user.id,
        log_key:(window.CLOUD_PREFIX||'resetv1|')+k,
        day:l.day,
        workout_date:l.date,
        payload:l,
        updated_at:l.updatedAt
      },{onConflict:'user_id,log_key'}).then(({error})=>{
        if(error){console.error('EDIT CLOUD SAVE',error);alert('A alteração ficou salva no aparelho, mas a nuvem recusou o salvamento.');}
        else if(typeof window.setStatus==='function')window.setStatus('☁ Online • salvo',true);
      });
    }
  }
  function install(){
    const old=window.editLog;
    if(typeof old!=='function')return false;
    window.editLog=function(k){window.__editingLogKey=k;return old.apply(this,arguments)};
    window.saveEditedLog=save;
    return true;
  }
  let n=0;const t=setInterval(()=>{if(install()||++n>40)clearInterval(t)},100);
})();
