(()=>{
'use strict';
const V='20260901.3';
let running=false;
function status(t,on=false){try{setStatus(t,on)}catch(e){}}
function load(src,timeout=10000){return new Promise(resolve=>{if(window.supabase?.createClient)return resolve(true);const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';let done=false;const timer=setTimeout(()=>finish(false),timeout);function finish(ok){if(done)return;done=true;clearTimeout(timer);s.onload=null;s.onerror=null;resolve(ok)}s.onload=()=>finish(!!window.supabase?.createClient);s.onerror=()=>finish(false);document.head.appendChild(s)})}
async function connect(){
 if(running)return;
 if(!navigator.onLine){status('☁ Offline • salvo neste aparelho');return}
 running=true;status('☁ Conectando...',true);
 try{
  let ok=!!window.supabase?.createClient;
  if(!ok) ok=await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js',10000);
  if(!ok) ok=await load('https://unpkg.com/@supabase/supabase-js@2.110.0/dist/umd/supabase.js',10000);
  if(!ok) throw new Error('Não foi possível carregar o cliente Supabase.');
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const r=await Promise.race([sb.auth.getSession(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('Tempo esgotado ao verificar a sessão.')),8000))]);
  user=r?.data?.session?.user||null;
  if(user){cloudReady=false;render();await loadCloud();}
  else {cloudReady=false;render();status('☁ Pronto para entrar');}
 }catch(e){console.error('[cloud-reconnect-v3]',e);cloudReady=false;status('⚠ Nuvem indisponível • local salvo')}
 finally{running=false}
}
async function forceCloudSave(k){
 if(!user||user.offline||!sb||!data?.logs?.[k]){status('⚠ Não salvo na nuvem');return false}
 try{
  const l=data.logs[k];
  const {error}=await sb.from('workout_logs').upsert({user_id:user.id,log_key:CLOUD_PREFIX+k,day:l.day,workout_date:l.date,payload:l,updated_at:new Date().toISOString()},{onConflict:'user_id,log_key'});
  if(error)throw error;
  cloudReady=true;status('☁ Online • treino salvo',true);return true;
 }catch(e){console.error('[cloud-save-v3]',e);cloudReady=false;status('⚠ Não salvo na nuvem');alert('O treino ficou salvo neste aparelho, mas não foi confirmado na nuvem.\n\n'+(e?.message||e));return false}
}
function install(){
 if(window.__cloudReconnectV3)return;
 window.__cloudReconnectV3={version:V,connect,save:forceCloudSave};
 const originalQueue=queueSave;
 queueSave=function(k){ clearTimeout(saveTimer); forceCloudSave(k); };
 window.addEventListener('online',connect);
 if(user?.offline||!sb||!cloudReady) setTimeout(connect,300);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();connect()},{once:true});else{install();connect()}
})();
