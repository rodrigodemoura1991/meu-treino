(()=>{
'use strict';

const CLOUD_V5='20260901.5';
const SUPABASE_CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js';

function toast(message, ok=true){
  let el=document.getElementById('saveToast');
  if(!el){
    el=document.createElement('div');el.id='saveToast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);
    const style=document.createElement('style');style.textContent='#saveToast{position:fixed;left:50%;bottom:92px;transform:translate(-50%,20px);z-index:99999;opacity:0;pointer-events:none;background:#172033;color:#fff;padding:15px 22px;border-radius:14px;font-weight:800;font-size:16px;box-shadow:0 8px 30px rgba(0,0,0,.22);transition:.22s ease;max-width:90vw;text-align:center}#saveToast.show{opacity:1;transform:translate(-50%,0)}#saveToast.error{background:#b42318}';document.head.appendChild(style);
  }
  el.textContent=message;el.classList.toggle('error',!ok);el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(window.__saveToastTimer);window.__saveToastTimer=setTimeout(()=>el.classList.remove('show'),3200);
}
function setCloud(text,on=false){try{if(typeof setStatus==='function')setStatus(text,on)}catch(e){}}
function loadClient(){return new Promise((resolve,reject)=>{if(window.supabase?.createClient){resolve(true);return}const s=document.createElement('script');s.src=SUPABASE_CDN;s.crossOrigin='anonymous';s.onload=()=>window.supabase?.createClient?resolve(true):reject(new Error('Cliente Supabase não carregou.'));s.onerror=()=>reject(new Error('Não foi possível carregar o cliente Supabase.'));document.head.appendChild(s)})}
async function ensureCloud(){if(!navigator.onLine)throw new Error('Sem conexão com a internet.');await loadClient();if(!sb)sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const {data:r,error}=await sb.auth.getSession();if(error)throw error;user=r?.session?.user||null;if(!user)throw new Error('Sua sessão não está ativa. Entre novamente em Dados.');user.offline=false;return user}
async function loadAllCloud(){try{await ensureCloud();const {data:rows,error}=await sb.from('workout_logs').select('log_key,payload').eq('user_id',user.id).like('log_key',CLOUD_PREFIX+'%').order('workout_date',{ascending:false});if(error)throw error;for(const r of rows||[]){const k=String(r.log_key).slice(CLOUD_PREFIX.length);if(typeof validSavedLog!=='function'||validSavedLog(r.payload))data.logs[k]=r.payload}if(typeof persist==='function')persist();cloudReady=true;setCloud('☁ Online • sincronizado',true);if(typeof render==='function')render();return true}catch(e){console.error('[cloud-save-v5] load',e);cloudReady=false;setCloud('⚠ Nuvem indisponível');return false}}

async function upsertAndVerify(k,payload){
  await ensureCloud();
  const row={user_id:user.id,log_key:CLOUD_PREFIX+k,day:payload.day,workout_date:payload.date,payload,updated_at:new Date().toISOString()};
  const {error}=await sb.from('workout_logs').upsert(row,{onConflict:'user_id,log_key'});
  if(error)throw error;
  const verify=await sb.from('workout_logs').select('log_key,payload').eq('user_id',user.id).eq('log_key',CLOUD_PREFIX+k).maybeSingle();
  if(verify.error)throw verify.error;
  if(!verify.data||!verify.data.payload)throw new Error('O Supabase não confirmou o treino após o salvamento.');
  return verify.data;
}

async function saveWorkout(k){
  const d=drafts?.[k];if(!d)return false;
  if(typeof validDraft==='function'&&!validDraft(d)){alert('Preencha pelo menos uma série com carga e repetições antes de salvar.');return false}
  if(typeof stopGeneralTimer==='function')stopGeneralTimer(false);
  d.completed=true;d.timerStartedAt=null;if(typeof elapsedFrom==='function')d.timerElapsed=elapsedFrom(d);if(typeof fmtDuration==='function')d.duration=d.timerElapsed?fmtDuration(d.timerElapsed):d.duration||'';if(typeof volumeForLog==='function'){d.tonnageKg=volumeForLog(d);d.tonnes=(Number(d.tonnageKg)||0)/1000}
  const snapshot=clone(d),oldData=data.logs[k],oldDraft=drafts[k];
  const btns=[...document.querySelectorAll('.actions button')].filter(b=>/Salvar treino/i.test(b.textContent));btns.forEach(b=>{b.disabled=true;b.dataset.oldText=b.textContent;b.textContent='SALVANDO...'});setCloud('☁ Salvando...',true);
  try{
    await upsertAndVerify(k,snapshot);
    data.logs[k]=clone(snapshot);delete drafts[k];if(typeof persist==='function')persist();editDate=null;cloudReady=true;setCloud('☁ Online • treino salvo',true);if(typeof render==='function')render();toast('✅ Treino salvo com sucesso!',true);return true;
  }catch(e){
    console.error('[cloud-save-v5] save',e);data.logs[k]=oldData;if(oldDraft)drafts[k]=oldDraft;else drafts[k]=snapshot;cloudReady=false;setCloud('⚠ Não salvo na nuvem');toast('❌ O treino NÃO foi salvo na nuvem.',false);alert('Não foi possível salvar o treino na nuvem.\n\n'+(e?.message||String(e)));return false;
  }finally{btns.forEach(b=>{b.disabled=false;b.textContent=b.dataset.oldText||'✓ Salvar treino';delete b.dataset.oldText})}
}

async function saveExistingLog(k){
  const payload=data.logs?.[k];if(!payload)return false;setCloud('☁ Salvando...',true);
  try{await upsertAndVerify(k,payload);cloudReady=true;setCloud('☁ Online • treino salvo',true);toast('✅ Alterações salvas com sucesso!',true);return true}
  catch(e){console.error('[cloud-save-v5] edit',e);cloudReady=false;setCloud('⚠ Não salvo na nuvem');toast('❌ Alterações NÃO foram salvas na nuvem.',false);alert('Não foi possível salvar as alterações na nuvem.\n\n'+(e?.message||String(e)));return false}
}

async function loginV5(){const email=document.getElementById('email')?.value.trim(),password=document.getElementById('password')?.value||'';if(!email||!password){alert('Preencha e-mail e senha.');return}try{await loadClient();if(!sb)sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const btn=document.getElementById('loginBtn');if(btn){btn.disabled=true;btn.textContent='ENTRANDO...'}setCloud('☁ Entrando...',true);const {data:r,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;user=r.user;cloudReady=false;if(typeof render==='function')render();await loadAllCloud()}catch(e){console.error('[cloud-save-v5] login',e);setCloud('☁ Pronto para entrar');alert(e?.message||'Não foi possível entrar.')}finally{const btn=document.getElementById('loginBtn');if(btn){btn.disabled=false;btn.textContent='ENTRAR'}}}

async function bootV5(){try{await ensureCloud();await loadAllCloud()}catch(e){user=null;cloudReady=false;setCloud('☁ Pronto para entrar');if(typeof render==='function')render()}}

window.commitSaved=saveWorkout;
window.cloudSave=saveExistingLog;
window.signIn=loginV5;
window.__cloudSaveV5={version:CLOUD_V5,save:saveWorkout,edit:saveExistingLog,boot:bootV5};
setTimeout(bootV5,0);
})();
