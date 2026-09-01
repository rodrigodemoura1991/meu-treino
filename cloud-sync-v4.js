(()=>{
'use strict';
const V='20260901.4';
let installed=false,syncing=false,pending=new Set();
const status=(t,on=false)=>{try{setStatus(t,on)}catch(e){}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function online(){return navigator.onLine!==false}
async function ensureClient(){
  if(sb?.auth?.getSession)return true;
  if(!window.supabase?.createClient) return false;
  try{sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return true}catch(e){console.error('[cloud-v4] client',e);return false}
}
async function session(){
  if(!await ensureClient())return null;
  try{const r=await sb.auth.getSession();return r?.data?.session||null}catch(e){console.error('[cloud-v4] session',e);return null}
}
function addPending(k){if(k)pending.add(k)}
async function saveOne(k,quiet=false){
  if(!data?.logs?.[k]){pending.delete(k);return false}
  if(!online())return false;
  const s=await session();
  if(!s?.user?.id){return false}
  const l=data.logs[k];
  try{
    const {error}=await sb.from('workout_logs').upsert({user_id:s.user.id,log_key:(CLOUD_PREFIX||'resetv1|')+k,day:l.day,workout_date:l.date,payload:l,updated_at:new Date().toISOString()},{onConflict:'user_id,log_key'});
    if(error)throw error;
    pending.delete(k);cloudReady=true;
    if(!quiet)status('☁ Online • treino salvo',true);
    return true;
  }catch(e){
    console.error('[cloud-v4] upsert',e);
    cloudReady=false;
    if(!quiet)status('⚠ Não salvo na nuvem');
    return false;
  }
}
async function syncPending(){
  if(syncing||!online())return;
  syncing=true;
  try{
    const s=await session();
    if(!s?.user?.id)return;
    Object.keys(data?.logs||{}).forEach(k=>pending.add(k));
    let failed=false;
    for(const k of [...pending]){if(!(await saveOne(k,true)))failed=true;}
    if(!failed&&pending.size===0){cloudReady=true;status('☁ Online • sincronizado',true)}
    else if(failed)status('⚠ Nuvem indisponível • local salvo');
  }finally{syncing=false}
}
function install(){
  if(installed)return;installed=true;
  const oldQueue=window.queueSave;
  window.queueSave=function(k){addPending(k);clearTimeout(saveTimer);saveOne(k).then(ok=>{if(!ok)setTimeout(()=>syncPending(),1500)});};
  const oldCommit=window.commitSaved;
  if(typeof oldCommit==='function'){
    window.commitSaved=async function(k){
      const result=oldCommit(k);
      if(result){addPending(k);await wait(50);const ok=await saveOne(k);if(!ok)setTimeout(syncPending,2000);}
      return result;
    };
  }
  window.__cloudSyncV4={version:V,sync:syncPending,save:saveOne};
  window.addEventListener('online',()=>{setTimeout(syncPending,500)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(syncPending,300)});
  setTimeout(syncPending,1000);
}
function boot(){install();setTimeout(syncPending,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
