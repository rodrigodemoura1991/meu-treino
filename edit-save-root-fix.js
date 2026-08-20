/* ROOT FIX: edição do Histórico deve atualizar a mesma fonte de dados e a nuvem imediatamente. */
(function(){
  function save(){
    const k=window.__editingLogKey;
    const l=data?.logs?.[k];
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
    localSave();
    if(typeof closeEditLog==='function')closeEditLog();
    current='Histórico';
    if(typeof render==='function')render();
    // Edição explícita: grava imediatamente na mesma chave do registro, sem debounce.
    if(user&&sb){
      sb.from('workout_logs').upsert({
        user_id:user.id,
        log_key:CLOUD_PREFIX+k,
        day:l.day,
        workout_date:l.date,
        payload:l,
        updated_at:l.updatedAt
      },{onConflict:'user_id,log_key'}).then(({error})=>{
        if(error){console.error('EDIT CLOUD SAVE',error);alert('A alteração ficou salva no aparelho, mas a nuvem recusou o salvamento.');}
        else setStatus('☁ Online • salvo',true);
      });
    }
  }
  function install(){
    if(typeof editLog!=='function')return false;
    const original=editLog;
    editLog=function(k){window.__editingLogKey=k;return original.apply(this,arguments)};
    window.saveEditedLog=save;
    return true;
  }
  let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},100);
})();
