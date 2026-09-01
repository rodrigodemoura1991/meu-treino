(()=>{
'use strict';
// Correção definitiva do salvamento do treino no Supabase.
// Mantém o salvamento local como backup e só exibe "salvo" após o upsert retornar sem erro.
const CLOUD_SYNC_V2_VERSION='20260901.1';
let cloudSyncBusy=false;
function cloudSyncStatus(text,on=false){
  if(typeof setStatus==='function') setStatus(text,on);
}
async function cloudSyncNow(logKey){
  if(cloudSyncBusy) return false;
  cloudSyncBusy=true;
  try{
    if(!window.sb) throw new Error('Cliente Supabase não inicializado.');
    const {data:sessionData,error:sessionError}=await sb.auth.getSession();
    if(sessionError) throw sessionError;
    const session=sessionData?.session;
    if(!session?.user?.id) throw new Error('Sessão não autenticada. Entre novamente no app.');
    window.user=session.user;
    const log=data?.logs?.[logKey];
    if(!log) throw new Error('Treino não encontrado para sincronização.');
    const row={
      user_id:session.user.id,
      log_key:(typeof CLOUD_PREFIX==='string'?CLOUD_PREFIX:'resetv1|')+logKey,
      day:log.day,
      workout_date:log.date,
      payload:log,
      updated_at:new Date().toISOString()
    };
    const {error}=await sb.from('workout_logs').upsert(row,{onConflict:'user_id,log_key'});
    if(error) throw error;
    window.cloudReady=true;
    cloudSyncStatus('☁ Online • treino salvo',true);
    return true;
  }catch(err){
    console.error('[cloud-sync-v2]',err);
    window.cloudReady=false;
    cloudSyncStatus('⚠ Não salvo na nuvem');
    alert('O treino ficou salvo neste aparelho, mas NÃO foi confirmado na nuvem.\n\nMotivo: '+(err?.message||err));
    return false;
  }finally{cloudSyncBusy=false}
}
function install(){
  if(typeof window.commitSaved!=='function'||window.__cloudSyncV2Installed)return;
  window.__cloudSyncV2Installed=true;
  const original=window.commitSaved;
  window.commitSaved=async function(k){
    const result=original(k);
    if(!result)return result;
    // Aguarda a renderização/localização do registro e força um upsert imediato.
    const ok=await cloudSyncNow(k);
    if(!ok) return false;
    return result;
  };
  window.__cloudSyncV2={version:CLOUD_SYNC_V2_VERSION,sync:cloudSyncNow};
  cloudSyncStatus(window.user&&!window.user.offline?'☁ Online • pronto para sincronizar':'☁ Pronto para entrar',!!(window.user&&!window.user.offline));
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
