(()=>{
'use strict';
const VERSION='20260901.save-v8';
const SUPABASE_URL='https://uvujytjdafcyacawcirp.supabase.co';
const SUPABASE_KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
const LOCAL_KEY='meu_treino_reset_v2';
const CLOUD_PREFIX='resetv1|';
const CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js';
const originalSave=window.commitSaved;
let busy=false;
function toast(message,ok=true){
 let el=document.getElementById('saveV8Toast');
 if(!el){el=document.createElement('div');el.id='saveV8Toast';Object.assign(el.style,{position:'fixed',left:'50%',bottom:'105px',transform:'translateX(-50%)',zIndex:'2147483647',padding:'16px 22px',borderRadius:'16px',fontWeight:'800',fontSize:'18px',color:'#fff',boxShadow:'0 8px 30px rgba(0,0,0,.28)',maxWidth:'88vw',textAlign:'center',fontFamily:'system-ui,-apple-system,sans-serif'});document.body.appendChild(el)}
 el.textContent=message;el.style.background=ok?'#16803c':'#b42318';el.style.opacity='1';clearTimeout(el.__timer);el.__timer=setTimeout(()=>el.style.opacity='0',4500);
}
function setCloud(text,on=false){const el=document.getElementById('cloudStatus');if(el){el.textContent=text;el.className='status '+(on?'on':'')}}
async function supabaseClient(){
 if(window.supabase?.createClient)return window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=CDN;s.crossOrigin='anonymous';s.onload=()=>window.supabase?.createClient?resolve():reject(new Error('Biblioteca Supabase não carregou.'));s.onerror=()=>reject(new Error('Não foi possível carregar o Supabase.'));document.head.appendChild(s)});
 return window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
}
function localSaved(key){const state=JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}');const payload=state?.logs?.[key];if(!payload)throw new Error('O treino não foi registrado localmente.');return payload}
async function cloudCommit(key,payload){
 const sb=await supabaseClient();
 const {data:session,error:sessionError}=await sb.auth.getSession();if(sessionError)throw sessionError;
 const uid=session?.session?.user?.id;if(!uid)throw new Error('Sua sessão não está ativa. Entre novamente em Dados.');
 const logKey=CLOUD_PREFIX+key;
 const row={user_id:uid,log_key:logKey,day:payload.day,workout_date:payload.date,payload,updated_at:new Date().toISOString()};
 const {error}=await sb.from('workout_logs').upsert(row,{onConflict:'user_id,log_key'});if(error)throw error;
 const {data:check,error:checkError}=await sb.from('workout_logs').select('log_key,payload').eq('user_id',uid).eq('log_key',logKey).maybeSingle();
 if(checkError)throw checkError;if(!check?.payload)throw new Error('O Supabase não confirmou o treino.');return true;
}
async function runSave(key){
 if(busy)return false;busy=true;
 try{
  setCloud('☁ Salvando...',true);
  if(typeof originalSave!=='function')throw new Error('A rotina principal de salvamento não foi carregada.');
  const result=await originalSave(key);
  if(result===false)throw new Error('A rotina principal recusou o salvamento.');
  const payload=localSaved(key);
  await cloudCommit(key,payload);
  setCloud('☁ Online • salvo',true);toast('✅ Treino salvo com sucesso!',true);return true;
 }catch(error){console.error('[save-v8]',error);setCloud('⚠ Erro ao salvar');toast('❌ Não foi possível salvar o treino.',false);alert('Não foi possível salvar o treino.\n\n'+(error?.message||String(error)));return false}
 finally{busy=false}
}
window.commitSaved=runSave;
// Garante que o botão funcione mesmo se a página perdeu o onclick durante a atualização do GitHub Pages.
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('button');if(!b||!/^\s*[✓✔]?\s*Salvar treino\s*$/i.test((b.textContent||'').trim()))return;
 const attr=b.getAttribute('onclick')||'';const m=attr.match(/commitSaved\(\s*['\"]([^'\"]+)['\"]\s*\)/);
 if(m){e.preventDefault();e.stopImmediatePropagation();runSave(m[1]);}
},true);
window.__saveV8={version:VERSION};
})();
