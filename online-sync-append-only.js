/*
 * Sincronização online segura do Meu Treino.
 * - Faz merge entre localStorage e nuvem sem substituir o histórico inteiro.
 * - Guarda snapshots antes de merges/updates.
 * - Envia automaticamente imagens selecionadas (ex.: prints do Apple Fitness)
 *   para o Storage privado do usuário.
 * - Nunca apaga anexos nem registros durante a sincronização.
 */
(function(){
'use strict';
const URL='https://uvujytjdafcyacawcirp.supabase.co';
const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
const LOCAL_KEY='meu_treino_reset_v1';
const PREFIX='resetv1|';
const BUCKET='workout-attachments';
const SYNC_EVERY=30000;
let client=null,busy=false;
const meaningful=v=>{
  if(v===null||v===undefined)return false;
  if(typeof v==='string')return v.trim()!=='';
  if(typeof v==='number')return Number.isFinite(v);
  if(Array.isArray(v))return v.length>0;
  if(typeof v==='object')return Object.keys(v).length>0;
  return true;
};
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
function merge(a,b){
  if(!a||typeof a!=='object'||Array.isArray(a))return meaningful(a)?clone(a):clone(b);
  if(!b||typeof b!=='object'||Array.isArray(b))return meaningful(b)?clone(b):clone(a);
  const out=clone(a);
  for(const k of Object.keys(b)){
    const av=out[k],bv=b[k];
    if(av&&bv&&typeof av==='object'&&typeof bv==='object'&&!Array.isArray(av)&&!Array.isArray(bv))out[k]=merge(av,bv);
    else if(!meaningful(av)&&meaningful(bv))out[k]=clone(bv);
    else if(meaningful(av)&&meaningful(bv)&&JSON.stringify(av)!==JSON.stringify(bv))out[k]=clone(bv);
  }
  return out;
}
function readLocal(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')||{logs:{}}}catch(e){return{logs:{}}}}
function writeLocal(d){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(d))}catch(e){}}
function dateFromLog(l,key){return l?.date||l?.workout_date||(String(key).split('|')[1]||null)}
function dayFromDate(d){if(!d)return'';return ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][new Date(d+'T12:00:00').getDay()]||''}
async function getClient(){if(client)return client;if(!window.supabase?.createClient)return null;client=window.supabase.createClient(URL,KEY);return client}
async function getUser(){const c=await getClient();if(!c)return null;try{const r=await c.auth.getSession();return r?.data?.session?.user||null}catch(e){return null}}
async function snapshot(c,u,key,payload,source){if(!payload)return;try{await c.from('workout_sync_snapshots').upsert({user_id:u.id,log_key:key,payload,source},{onConflict:'user_id,log_key,payload_hash'})}catch(e){console.warn('sync snapshot',e)}}
async function syncLogs(){
  if(busy)return;
  const c=await getClient(),u=await getUser();if(!c||!u)return;
  busy=true;
  try{
    const local=readLocal(),logs=local.logs||{};
    const q=await c.from('workout_logs').select('id,log_key,payload,day,workout_date,updated_at,archived_at').like('log_key',PREFIX+'%').order('updated_at',{ascending:true});
    if(q.error)throw q.error;
    const cloud={};for(const r of q.data||[])if(r.log_key)cloud[r.log_key.replace(PREFIX,'')]=r;
    const keys=new Set([...Object.keys(logs),...Object.keys(cloud)]);
    for(const k of keys){
      const ll=logs[k],cr=cloud[k],cp=cr?.payload;
      if(ll&&!cr){
        await snapshot(c,u,k,ll,'local_before_upload');
        const r=await c.from('workout_logs').insert({user_id:u.id,log_key:PREFIX+k,day:ll.day||dayFromDate(dateFromLog(ll,k)),workout_date:dateFromLog(ll,k),payload:ll,updated_at:new Date().toISOString()});
        if(r.error&&r.error.code!=='23505')throw r.error;
      }else if(!ll&&cr){logs[k]=clone(cp)}
      else if(ll&&cp&&JSON.stringify(ll)!==JSON.stringify(cp)){
        await snapshot(c,u,k,ll,'local_before_merge');
        await snapshot(c,u,k,cp,'cloud_before_merge');
        const merged=merge(cp,ll);
        const r=await c.from('workout_logs').update({payload:merged,day:merged.day||cr.day||dayFromDate(dateFromLog(merged,k)),workout_date:dateFromLog(merged,k),updated_at:new Date().toISOString()}).eq('user_id',u.id).eq('log_key',PREFIX+k);
        if(r.error)throw r.error;
        logs[k]=merged;
      }
    }
    local.logs=logs;writeLocal(local);
    document.dispatchEvent(new CustomEvent('meu-treino-cloud-sync',{detail:{logs:Object.keys(logs).length}}));
  }catch(e){console.warn('cloud sync',e)}finally{busy=false}
}
function inferDate(input){
  const explicit=input.dataset.workoutDate||input.getAttribute('data-workout-date');if(explicit)return explicit;
  const d=document.querySelector('input[type="date"]');if(d?.value)return d.value;
  const local=readLocal(),keys=Object.keys(local.logs||{}),today=new Date();
  const td=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  return keys.find(k=>String(k).endsWith('|'+td))?td:(keys.map(k=>dateFromLog(local.logs[k],k)).filter(Boolean).sort().pop()||td);
}
async function uploadFile(file,input){
  const c=await getClient(),u=await getUser();if(!c||!u||!file||!/^image\//i.test(file.type))return false;
  const date=inferDate(input),day=dayFromDate(date),safe=(file.name||'apple-fitness.jpg').replace(/[^a-zA-Z0-9._-]+/g,'_');
  const path=u.id+'/'+date+'/'+Date.now()+'-'+safe;
  const up=await c.storage.from(BUCKET).upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});
  if(up.error){console.warn('attachment upload',up.error);return false}
  const ins=await c.from('workout_attachments').insert({user_id:u.id,log_key:day&&date?day+'|'+date:null,workout_date:date,filename:file.name||safe,mime_type:file.type||null,size_bytes:file.size||null,kind:'apple_fitness',path});
  if(ins.error){console.warn('attachment record',ins.error);return false}
  return true;
}
function hookFileInputs(){
  document.addEventListener('change',async e=>{
    const input=e.target;if(!(input instanceof HTMLInputElement)||input.type!=='file'||!input.files?.length)return;
    const files=[...input.files].filter(f=>/^image\//i.test(f.type));if(!files.length)return;
    const c=await getClient(),u=await getUser();if(!c||!u)return;
    for(const f of files)await uploadFile(f,input);
    await syncLogs();
  },true);
}
function boot(){hookFileInputs();document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncLogs()});window.addEventListener('online',syncLogs);syncLogs();setInterval(syncLogs,SYNC_EVERY)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
