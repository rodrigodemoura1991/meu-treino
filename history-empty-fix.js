/* Correção: registros vazios nunca entram no Histórico/Relatórios.
   IMPORTANTE: a limpeza local NÃO apaga registros da nuvem.
   O histórico online é preservado conforme a sincronização append-only. */
(function(){
  function hasRealData(l){
    if(!l) return false;
    if([l.notes,l.duration,l.avgBpm,l.calories,l.effort].some(v=>v!==''&&v!=null)) return true;
    const c=l.cardio||{};
    if(Object.values(c).some(v=>v!==''&&v!=null)) return true;
    return Object.values(l.rows||{}).some(r=>Object.values(r||{}).some(v=>v!==''&&v!=null&&v!==false));
  }
  function cleanEmptyLogs(){
    const removed=[];
    Object.entries(data?.logs||{}).forEach(([k,l])=>{
      if(l?.date && !hasRealData(l)){ removed.push(k); delete data.logs[k]; }
    });
    if(removed.length){
      try{ localSave(); }catch(e){}
      /* Não executar DELETE no Supabase.
         Registros online vazios/antigos devem permanecer preservados. */
    }
    return removed.length;
  }
  window.cleanEmptyWorkoutLogs=cleanEmptyLogs;
  const oldRender=window.render;
  if(oldRender) window.render=function(){ cleanEmptyLogs(); return oldRender(); };
  cleanEmptyLogs();
})();
