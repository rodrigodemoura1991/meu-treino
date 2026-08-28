const SUPABASE_URL='https://uvujytjdafcyacawcirp.supabase.co';
const SUPABASE_KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
const LOCAL_KEY='meu_treino_reset_v2';
const CLOUD_PREFIX='resetv1|';

const workouts={
 Segunda:{icon:'🟢',title:'Pernas + Peito',ex:[['Abdominal máquina',3,'12–15'],['Pêndulo',4,'6–10'],['Cadeira extensora',3,'10–15'],['Stiff com barra ou halteres',3,'8–10'],['Supino inclinado máquina',4,'8–10'],['Supino reto máquina',3,'8–12'],['Crucifixo máquina',2,'12–15']]},
 Terça:{icon:'🔵',title:'Costas + Bíceps',ex:[['Barra fixa ou puxada neutra',4,'6–10'],['Remada articulada com apoio no peito',4,'8–12'],['Remada unilateral na polia',3,'10–12'],['PULLDOWN',3,'10–15'],['Rosca direta com barra W',3,'8–12'],['Rosca inclinada com halteres',3,'10–12'],['Rosca martelo com halteres',2,'10–12']]},
 Quarta:{icon:'🟠',title:'Pernas + Ombros',ex:[['Abdominal no Cross',3,'12–15'],['Leg press 45°',4,'8–12'],['Cadeira flexora bilateral',4,'8–12'],['Mesa flexora',3,'10–15'],['Desenvolvimento máquina',3,'8–10'],['Elevação lateral na polia',4,'10–15'],['Crucifixo inverso máquina',3,'12–15'],['Panturrilha em pé ou no leg press',4,'10–15']]},
 Quinta:{icon:'🔴',title:'Peito + Tríceps',ex:[['Supino reto com barra',4,'6–10'],['Supino inclinado máquina',3,'8–12'],['Supino reto máquina',3,'8–12'],['Crossover de baixo para cima',2,'12–15'],['Tríceps francês unilateral na polia',3,'10–12'],['Tríceps barra V',3,'8–12'],['Tríceps testa com barra W',2,'10–12']]},
 Sexta:{icon:'🟣',title:'Full Body + Pontos fracos',ex:[['Abdominal máquina',3,'12–15'],['Agachamento Hack',3,'8–12'],['Flexora unilateral',3,'10–12'],['Remada baixa triângulo',3,'8–12'],['Puxada alta pronada',3,'8–12'],['Elevação lateral',3,'12–15'],['Rosca Scott máquina',2,'10–12'],['Tríceps corda',2,'10–15']]},
 Sábado:{icon:'🟣',title:'Opcional • Pontos fracos',ex:[['Elevação lateral',3,'12–15'],['Crucifixo inverso',3,'12–15'],['Rosca martelo',3,'10–12'],['Tríceps corda',3,'10–12'],['Panturrilha sentado',4,'12–15']]},
 Domingo:{icon:'⚪',title:'Recuperação / Cardio',ex:[]}
};
const cardioTypes=['Bicicleta','Esteira / caminhada','Corrida','Elíptico','Outro'];
const restPreset={'Abdominal máquina':60,'Abdominal no Cross':60,'Pêndulo':120,'Cadeira extensora':75,'Stiff com barra ou halteres':120,'Supino inclinado com halteres':120,'Supino reto máquina':90,'Crucifixo máquina':75,'Barra fixa ou puxada neutra':120,'Remada articulada com apoio no peito':120,'Remada unilateral na polia':90,'PULLDOWN':90,'Rosca direta com barra W':75,'Rosca inclinada com halteres':75,'Rosca martelo com halteres':75,'Leg press 45°':120,'Cadeira flexora bilateral':90,'Mesa flexora':90,'Desenvolvimento máquina':90,'Elevação lateral na polia':60,'Crucifixo inverso máquina':60,'Panturrilha em pé ou no leg press':75,'Supino reto com barra':150,'Supino inclinado máquina':120,'Crossover de baixo para cima':75,'Tríceps francês unilateral na polia':75,'Tríceps barra V':75,'Tríceps testa com barra W':75,'Hack squat':120,'Agachamento Hack':120,'Flexora unilateral':90,'Remada baixa triângulo':120,'Puxada alta pronada':90,'Elevação lateral':60,'Rosca Scott máquina':75,'Tríceps corda':75,'Panturrilha':75,'Panturrilha sentado':75,'Crucifixo inverso':60,'Rosca martelo':75};

let data=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')||{logs:{}};
let drafts={},current='Segunda',editDate=null,user=null,sb=null,cloudReady=false,saveTimer=null,authBusy=false,restIntervals={},restDebounce={},generalTimer=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const key=(day,date)=>day+'|'+date;
const dateBR=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
const days=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
function activeDate(){return editDate||today()}
function setStatus(text,on=false){const e=$('cloudStatus');if(e){e.textContent=text;e.className='status '+(on?'on':'')}}
function persist(){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(data))}catch(e){}}
function localSave(){persist();setStatus(user&&cloudReady?'☁ Online • salvo':'☁ Offline/local',!!(user&&cloudReady))}
function blankLog(day,date){return{day,date,rows:{},notes:'',duration:'',avgBpm:'',calories:'',effort:'',cardio:{type:'',duration:'',distance:'',calories:'',avgBpm:''},completed:true}}
function clone(v){return JSON.parse(JSON.stringify(v))}
function ensureDraft(day=current,date=activeDate()){const k=key(day,date);if(!drafts[k])drafts[k]=data.logs[k]?clone(data.logs[k]):blankLog(day,date);return drafts[k]}
function activeLog(day=current,date=activeDate()){return drafts[key(day,date)]||data.logs[key(day,date)]||null}
function exFor(day){return workouts[day]?.ex||[]}
function initClient(){try{sb=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);return !!sb}catch(e){console.error(e);return false}}
function loadSupabaseScript(){return new Promise(resolve=>{
  if(window.supabase?.createClient){resolve(true);return}
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js';
  script.crossOrigin='anonymous';
  let done=false;
  const finish=ok=>{if(done)return;done=true;clearTimeout(timer);script.onload=null;script.onerror=null;resolve(ok)};
  const timer=setTimeout(()=>finish(false),1800);
  script.onload=()=>finish(!!window.supabase?.createClient);
  script.onerror=()=>finish(false);
  document.head.appendChild(script);
})}
function enterOfflineMode(reason='☁ Offline • salvo neste aparelho'){
  user={id:'offline-local',offline:true};cloudReady=false;setStatus(reason);render();
}
async function init(){
  try{localStorage.removeItem('meu_treino_reset_v1');['meu_treino_spotify_client_id','meu_treino_spotify_token','spotify_verifier','spotify_state'].forEach(k=>localStorage.removeItem(k))}catch(e){}
  cleanLocalData();
  // Nunca deixe o carregamento do Supabase bloquear o aplicativo. O treino abre localmente mesmo sem internet.
  if(!navigator.onLine){enterOfflineMode();return}
  setStatus('☁ Preparando...',true);
  const loaded=await loadSupabaseScript();
  if(!loaded||!initClient()){enterOfflineMode();return}
  setStatus('☁ Verificando...',true);
  let sessionResult=null;
  try{
    sessionResult=await Promise.race([
      sb.auth.getSession(),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('Supabase session timeout')),2200))
    ]);
    user=sessionResult?.data?.session?.user||null;
  }catch(e){console.warn('Sessão Supabase não respondeu a tempo:',e);enterOfflineMode();return}
  render();
  if(user) await loadCloud(); else setStatus('☁ Pronto para entrar');
}
async function signIn(){if(authBusy)return;const email=$('email')?.value.trim(),password=$('password')?.value||'';if(!email||!password){alert('Preencha e-mail e senha.');return}if(!sb){alert('A conexão ainda carregou. Recarregue a página.');return}authBusy=true;const btn=$('loginBtn');if(btn){btn.disabled=true;btn.textContent='ENTRANDO...'}setStatus('☁ Conectando...',true);try{const {data:r,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;user=r.user;cloudReady=false;render();await loadCloud()}catch(e){console.error(e);setStatus('☁ Pronto para entrar');alert(e?.message||'Não foi possível entrar.')}finally{authBusy=false;if(btn){btn.disabled=false;btn.textContent='ENTRAR'}}}
async function signUp(){const email=$('email')?.value.trim(),password=$('password')?.value||'';if(!email||password.length<6){alert('Informe um e-mail e uma senha com pelo menos 6 caracteres.');return}if(!sb){alert('A conexão ainda não carregou.');return}const {error}=await sb.auth.signUp({email,password});alert(error?error.message:'Conta criada. Confirme o e-mail se solicitado e faça login.')}
async function signOut(){try{await sb?.auth.signOut()}catch(e){}user=null;cloudReady=false;drafts={};editDate=null;current='Segunda';render();setStatus('☁ Pronto para entrar')}
function validSavedLog(l){return !!(l?.date&&l?.completed!==false&&Object.values(l.rows||{}).some(r=>Object.keys(r||{}).some(k=>/^kg\d+$/.test(k)&&Number(r[k])>0)&&Object.keys(r||{}).some(k=>/^reps\d+$/.test(k)&&Number(r[k])>0)))}
function cleanLocalData(){const flag='meu_treino_legacy_cleanup_v4';try{if(localStorage.getItem(flag)==='1')return}catch(e){}let changed=false;Object.keys(data.logs||{}).forEach(k=>{const l=data.logs[k];if(!validSavedLog(l)){delete data.logs[k];changed=true}});if(changed)persist();try{localStorage.setItem(flag,'1')}catch(e){}}
async function loadCloud(){if(!user||user.offline||!sb)return;try{const {data:rows,error}=await sb.from('workout_logs').select('log_key,payload').like('log_key',CLOUD_PREFIX+'%').order('workout_date',{ascending:false});if(error)throw error;cloudReady=true;for(const r of rows||[]){const k=r.log_key.replace(CLOUD_PREFIX,'');if(validSavedLog(r.payload))data.logs[k]=r.payload}cleanLocalData();persist();render();setStatus('☁ Online • salvo',true)}catch(e){console.error('cloud load',e);cloudReady=false;setStatus('⚠ Nuvem indisponível • local salvo')}}
function queueSave(k){clearTimeout(saveTimer);saveTimer=setTimeout(()=>cloudSave(k),250)}
async function cloudSave(k){if(!user||user.offline||!sb||!data.logs[k])return;try{const l=data.logs[k];const {error}=await sb.from('workout_logs').upsert({user_id:user.id,log_key:CLOUD_PREFIX+k,day:l.day,workout_date:l.date,payload:l,updated_at:new Date().toISOString()},{onConflict:'user_id,log_key'});if(error)throw error;cloudReady=true;setStatus('☁ Online • salvo',true)}catch(e){console.error('cloud save',e);cloudReady=false;setStatus('⚠ Salvo neste aparelho')}}
function commitSaved(k){const d=drafts[k];if(!d)return false;if(!validDraft(d)){alert('Preencha pelo menos uma série com carga e repetições antes de salvar.');return false}stopGeneralTimer(false);d.completed=true;d.timerStartedAt=null;d.timerElapsed=elapsedFrom(d);d.duration=d.timerElapsed?fmtDuration(d.timerElapsed):d.duration||'';d.tonnageKg=volumeForLog(d);d.tonnes=d.tonnageKg/1000;data.logs[k]=clone(d);delete drafts[k];editDate=null;persist();queueSave(k);render();return true}
function validDraft(l){return !!Object.values(l?.rows||{}).some(r=>{for(let s=0;s<20;s++)if(Number(r?.['kg'+s])>0&&Number(r?.['reps'+s])>0)return true;return false})}
function autoStartRep(k){const l=drafts[k]||ensureDraft(current,activeDate());startGeneralTimer(k,l)}
function setVal(k,i,s,f,v){const l=drafts[k]||ensureDraft(current,activeDate());l.rows[i]??={};l.rows[i][f+s]=v;localSave();if(f==='reps'&&String(v??'').trim()&&Number(v)>0)startGeneralTimer(k,l);updateWorkoutSummary();refreshExerciseCoach(i)}
function setObs(k,i,v){const l=drafts[k]||ensureDraft(current,activeDate());l.rows[i]??={};l.rows[i].observation=v}
function setMetric(k,f,v){const l=drafts[k]||ensureDraft(current,activeDate());l[f]=v;updateWorkoutSummary()}
function setCardio(k,f,v){const l=drafts[k]||ensureDraft(current,activeDate());l.cardio??={};l.cardio[f]=v}
function setNotes(k,v){const l=drafts[k]||ensureDraft(current,activeDate());l.notes=v}
async function deleteLog(k){if(!data.logs[k]){delete drafts[k];render();return}if(!confirm('Excluir este registro de treino? Esta ação não pode ser desfeita.'))return;delete data.logs[k];delete drafts[k];persist();if(user&&!user.offline&&sb){try{await sb.from('workout_logs').delete().eq('user_id',user.id).eq('log_key',CLOUD_PREFIX+k)}catch(e){console.error(e)}}render()}
function clearDay(){const k=key(current,activeDate());if(drafts[k]){delete drafts[k];stopGeneralTimer();render();return}if(data.logs[k])deleteLog(k);else render()}
function editLog(k){if(!data.logs[k])return;drafts[k]=clone(data.logs[k]);current=data.logs[k].day;editDate=data.logs[k].date;render()}
function dayNav(){return '<div class="daystrip">'+days.map(d=>'<button class="'+(current===d?'active':'')+'" onclick="go(\''+d+'\')">'+workouts[d].icon+'<small>'+d.slice(0,3).toUpperCase()+'</small></button>').join('')+'</div>'}
function topNav(){return '<div class="nav"><button class="'+(days.includes(current)?'active':'')+'" onclick="go(\'Segunda\')">🏋️ Treino</button><button class="'+(current==='Histórico'?'active':'')+'" onclick="go(\'Histórico\')">📈 Histórico</button><button class="'+(current==='Relatórios'?'active':'')+'" onclick="go(\'Relatórios\')">📊 Relatórios</button><button class="'+(current==='Dados'?'active':'')+'" onclick="go(\'Dados\')">💾 Dados</button></div>'}
function inferDone(l){return !!(l&&validDraft(l))}
function elapsedFrom(l){const base=Number(l?.timerElapsed||0);if(l?.timerStartedAt&&!l?.timerPausedAt)return base+Math.floor((Date.now()-Number(l.timerStartedAt))/1000);return base}
function fmtDuration(s){s=Math.max(0,Number(s||0));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
function volumeForLog(l){let v=0;Object.values(l?.rows||{}).forEach(r=>{for(let s=0;s<20;s++)v+=(Number(r?.['kg'+s])||0)*(Number(r?.['reps'+s])||0)});return v}
function startGeneralTimer(k,l){if(l.timerStartedAt)return;l.timerStartedAt=Date.now();l.timerPausedAt=null;generalTimer=setInterval(()=>{updateGeneralClock(k);},1000);updateGeneralClock(k)}
function stopGeneralTimer(save=true){if(generalTimer){clearInterval(generalTimer);generalTimer=null}const l=drafts[key(current,activeDate())];if(save&&l){l.timerElapsed=elapsedFrom(l);l.timerStartedAt=null}}
function pauseGeneralTimer(){const l=drafts[key(current,activeDate())];if(!l||!l.timerStartedAt)return;l.timerElapsed=elapsedFrom(l);l.timerPausedAt=Date.now();clearInterval(generalTimer);generalTimer=null;updateWorkoutSummary()}
function resumeGeneralTimer(){const l=drafts[key(current,activeDate())];if(!l||!l.timerPausedAt)return;l.timerStartedAt=Date.now();l.timerPausedAt=null;generalTimer=setInterval(()=>updateGeneralClock(key(current,activeDate())),1000);updateWorkoutSummary()}
function resetGeneralTimer(){const l=drafts[key(current,activeDate())];if(!l)return;l.timerElapsed=0;l.timerStartedAt=null;l.timerPausedAt=null;stopGeneralTimer(false);updateWorkoutSummary()}
function updateGeneralClock(k){const l=drafts[k]||activeLog(current,activeDate());const el=$('generalClock');if(el&&l){el.textContent=fmtDuration(elapsedFrom(l));}}
function startRest(i,seconds){const keyI=String(i);clearInterval(restIntervals[keyI]);let left=seconds;restIntervals[keyI]=setInterval(()=>{left--;const e=$('rest-'+i);if(e)e.textContent=fmtClock(left);if(left<=0){clearInterval(restIntervals[keyI]);delete restIntervals[keyI]}},1000)}
function fmtClock(s){return Math.max(0,Number(s||0)).toString().padStart(2,'0')+':'+Math.floor(Math.max(0,Number(s||0))/60)}
function fmtRest(sec){const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0')}
function refreshExerciseCoach(i){try{window.refreshExerciseCoach?.(i)}catch(e){}}
function updateWorkoutSummary(){const k=key(current,activeDate()),l=drafts[k]||activeLog(current,activeDate());if(!l)return;const el=$('generalClock');if(el)el.textContent=fmtDuration(elapsedFrom(l));const v=volumeForLog(l);const ve=$('volumeSummary');if(ve)ve.textContent=Math.round(v)+' kg'}
function inputField(k,i,s,field,ph,val,mode){return '<input class="setinput" value="'+esc(val??'')+'" placeholder="'+ph+'" inputmode="'+mode+'" onchange="setVal(\''+k+'\','+i+','+s+',\''+field+'\',this.value)">'}
function renderExercise(k,i,ex,log){const [name,sets,reps]=ex;const guide=(window.EXERCISE_GUIDES||{})[name]||{};const row=log?.rows?.[i]||{};const preset=restPreset[name]||90;let h='<section class="exercise" data-exercise="'+esc(name)+'"><div class="exhead">';h+='<div class="exname">'+(i+1)+'. '+esc(name)+'</div>';h+='<div class="exmeta">'+sets+' séries • '+esc(reps)+' reps</div>';h+='</div>';h+='<div class="exrest" data-rest="'+preset+'"><div class="restlabel">DESCANSO</div><div class="resttime">'+fmtRest(preset)+'</div></div>';h+='<div class="sets">';for(let s=0;s<sets;s++){h+='<div class="setrow"><span class="setno">'+(s+1)+'</span>'+inputField(k,i,s,'kg','kg',row['kg'+s],'decimal')+inputField(k,i,s,'reps','reps',row['reps'+s],'numeric')+'</div>'}h+='</div>';if(guide.tips?.length)h+='<div class="coachbox"><strong>🤖 COACH IA</strong><ul>'+guide.tips.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>';h+='</section>';return h}
function render(){const root=$('app');if(!root)return;const k=key(current,activeDate());if(days.includes(current)){const l=ensureDraft(current,activeDate());root.innerHTML=topNav()+dayNav()+'<div class="hero"><div><small>CRONÔMETRO GERAL</small><b id="generalClock">'+fmtDuration(elapsedFrom(l))+'</b><div class="timerBtns"><button onclick="startGeneralTimer(\''+k+'\',ensureDraft())">INICIAR</button><button onclick="pauseGeneralTimer()">PARAR</button><button onclick="resetGeneralTimer()">ZERAR</button></div></div></div><div class="summary"><div><small>EXERCÍCIOS</small><b>'+exFor(current).length+'</b></div><div><small>SÉRIES</small><b>'+exFor(current).reduce((a,e)=>a+e[1],0)+'</b></div><div><small>VOLUME</small><b id="volumeSummary">'+Math.round(volumeForLog(l))+' kg</b></div></div><div class="grid">'+exFor(current).map((ex,i)=>renderExercise(k,i,ex,l)).join('')+'</div>';}else{root.innerHTML=topNav()+'<div class="panel"><h2>'+esc(current)+'</h2><p>Conteúdo desta seção.</p></div>';}}
function go(day){current=day;render()}
window.go=go;window.setVal=setVal;window.signIn=signIn;window.signUp=signUp;window.signOut=signOut;window.ensureDraft=ensureDraft;window.startGeneralTimer=startGeneralTimer;window.pauseGeneralTimer=pauseGeneralTimer;window.resumeGeneralTimer=resumeGeneralTimer;window.resetGeneralTimer=resetGeneralTimer;window.init=init;
init();