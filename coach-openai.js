(()=>{
'use strict';
const FN='https://uvujytjdafcyacawcirp.supabase.co/functions/v1/coach-ai';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
function dayKey(day){return String(day||'').split(' — ')[0].trim()}
function buildExercises(log){
  const day=dayKey(log?.day), plan=window.workouts?.[day]?.ex||[];
  return plan.map((e,i)=>{
    const r=log?.rows?.[i]||{};
    const sets=[];
    for(let s=0;s<20;s++){
      const kg=num(r['kg'+s]), reps=num(r['reps'+s]);
      if(kg>0||reps>0) sets.push({set:s+1,kg,reps});
    }
    return {name:String(e?.[0]||'Exercício'),target_sets:Number(e?.[1])||0,target_reps:String(e?.[2]||''),sets,observation:String(r.observation||'')};
  });
}
function allLogs(){
  try{return Object.values(window.data?.logs||{}).filter(l=>l&&l.date&&!l.draft&&l.completed!==false)}catch(e){return[]}
}
function payload(){
  const logs=allLogs().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const latest=logs[0]||{};
  return {day:dayKey(latest.day),title:'Análise do treino',log:{...latest,exercises:buildExercises(latest)},history:logs.slice(0,12).map(l=>({...l,exercises:buildExercises(l)}))};
}
async function analyze(btn,out){
  btn.disabled=true;btn.textContent='ANALISANDO COM IA...';
  out.innerHTML='<p class="openai-loading">🤖 Comparando seus exercícios com os treinos anteriores...</p>';
  try{
    const client=window.sb;if(!client)throw new Error('Conexão com o Supabase não está disponível. Entre na conta primeiro.');
    const session=(await client.auth.getSession())?.data?.session;
    if(!session?.access_token)throw new Error('Entre na conta para usar o Coach IA.');
    const body=payload();
    if(!body.log?.date||!body.log?.exercises?.length)throw new Error('Salve pelo menos um treino completo antes de usar o Coach IA.');
    const r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify(body)});
    const p=await r.json();
    if(!r.ok||p.error)throw new Error(p.error||'Não foi possível obter a análise da IA.');
    const list=a=>(a||[]).map(x=>`<li>${esc(x)}</li>`).join('');
    out.innerHTML=`<div class="openai-result"><div class="openai-score"><strong>${Number(p.score||0).toFixed(1)}</strong><div><b>${esc(p.headline||'Análise do treino')}</b><small>avaliação do Coach IA</small></div></div><p>${esc(p.summary||'')}</p><div class="openai-cols"><div><b>💪 Pontos fortes</b><ul>${list(p.highlights)}</ul></div><div><b>⚠️ Atenção</b><ul>${list(p.attention)}</ul></div></div><div class="openai-next"><b>🎯 Recomendações</b><ul>${list(p.recommendations)}</ul><p><b>Próximo treino:</b> ${esc(p.next_workout||'')}</p></div></div>`;
    btn.textContent='ATUALIZAR ANÁLISE';
  }catch(e){console.error('Coach OpenAI',e);out.innerHTML=`<p class="openai-error">${esc(e.message)}</p>`;btn.textContent='TENTAR NOVAMENTE';}
  finally{btn.disabled=false;}
}
function wire(){
  const card=document.querySelector('.coachReportCard');if(!card)return false;
  const old=card.querySelector('#coachAnalyzeNow');
  if(!old||old.dataset.openai==='1')return true;
  old.dataset.openai='1';
  let out=card.querySelector('#coachOpenAIOut');
  if(!out){out=document.createElement('div');out.id='coachOpenAIOut';old.parentNode?.appendChild(out)}
  old.onclick=()=>analyze(old,out);
  return true;
}
const style=document.createElement('style');style.textContent='.openai-loading{color:#667085}.openai-result{margin-top:12px}.openai-score{display:flex;gap:12px;align-items:center}.openai-score strong{font-size:30px;color:#e86f22}.openai-score b,.openai-score small{display:block}.openai-score small{color:#718096;margin-top:2px}.openai-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.openai-cols>div,.openai-next{padding:12px;border-radius:12px;background:#f7f8fa}.openai-cols ul,.openai-next ul{margin:7px 0 0;padding-left:20px}.openai-next{margin-top:10px}.openai-error{color:#b42318;background:#fff1f0;border:1px solid #f5c2c0;padding:10px;border-radius:10px}@media(max-width:700px){.openai-cols{grid-template-columns:1fr}}';document.head.appendChild(style);
const obs=new MutationObserver(()=>wire());obs.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',()=>setTimeout(wire,500));setInterval(wire,1000);
})();
