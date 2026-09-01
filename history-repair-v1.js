/* MEU TREINO — reparo seguro do Histórico
   Não apaga nem altera registros do Supabase. Apenas corrige a apresentação.
*/
(()=>{
'use strict';
const BAD_KEYS=new Set(['Segunda|2026-09-01','Sábado|2026-09-01']);
const hasSeries=l=>Object.values(l?.rows||{}).some(r=>{
  for(let s=0;s<20;s++) if(Number(r?.['kg'+s])>0 && Number(r?.['reps'+s])>0) return true;
  return false;
});
const valid=l=>!!(l?.date && l?.completed!==false && hasSeries(l));
const escH=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function exerciseCount(l){return Object.values(l?.rows||{}).filter(hasSeries).length+(Array.isArray(l?.extraExercises)?l.extraExercises.length:0)}
function metrics(l){
 const out=[];
 out.push('🏋️ '+exerciseCount(l)+' exercícios');
 if(Number(l?.tonnageKg)>0) out.push('🏋️ '+Number(l.tonnageKg).toLocaleString('pt-BR')+' kg');
 if(String(l?.calories||'').trim()) out.push('🔥 '+escH(l.calories)+' kcal');
 if(String(l?.avgBpm||'').trim()) out.push('❤️ '+escH(l.avgBpm)+' bpm');
 if(String(l?.duration||'').trim()) out.push('⏱️ '+escH(l.duration));
 if(String(l?.effort||'').trim()) out.push('💪 RPE '+escH(l.effort));
 const c=l?.cardio||{};
 if(c.type && (c.duration||c.distance)) out.push('🏃 '+escH(c.type)+' · '+escH(c.duration||c.distance));
 return out.map(x=>'<span style="display:inline-block;background:#f1f4f7;border-radius:999px;padding:5px 9px;margin:3px 4px 0 0;color:#526071;font-size:12px">'+x+'</span>').join('');
}
function rebuildHistory(){
 if(typeof current==='undefined' || current!=='Histórico') return;
 const app=document.getElementById('app'); if(!app || typeof data==='undefined') return;
 const logs=Object.entries(data.logs||{})
   .filter(([k,l])=>!BAD_KEYS.has(k) && valid(l))
   .sort((a,b)=>String(b[1].date).localeCompare(String(a[1].date)) || String(b[0]).localeCompare(String(a[0])));
 let html=typeof topNav==='function'?topNav():'';
 html+='<section class="panel"><div class="eyebrow">HISTÓRICO</div><h1>Seus registros</h1><p class="muted">Somente treinos salvos pelo botão “Salvar treino”.</p><button id="addHistoricalWorkout" class="primary" style="margin-top:14px">＋ Adicionar treino</button></section>';
 html+='<section class="panel" style="margin-top:18px"><div id="historyRepairList">';
 if(!logs.length){html+='<p class="muted">Nenhum treino salvo encontrado.</p>'}
 for(const [k,l] of logs){
   const safeK=JSON.stringify(k).replace(/</g,'\\u003c');
   const day=escH(l.day||k.split('|')[0]);
   const date=escH(l.date);
   const title=escH((typeof workouts!=='undefined'&&workouts[l.day]?.title)||l.title||'Treino');
   html+='<article style="padding:16px 0;border-bottom:1px solid #e4e8ee">';
   html+='<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">';
   html+='<div><strong style="font-size:15px">'+day+' — '+escH(new Date(l.date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}))+'</strong><div class="muted" style="margin-top:4px">'+title+'</div></div>';
   html+='<div style="display:flex;gap:6px"><button class="secondary" onclick="editLog('+safeK+')">✏️ Editar</button><button class="danger" onclick="deleteLog('+safeK+')">Excluir</button></div>';
   html+='</div><div style="margin-top:9px">'+metrics(l)+'</div></article>';
 }
 html+='</div></section>';
 app.innerHTML=html;
 const add=document.getElementById('addHistoricalWorkout');
 if(add){add.onclick=()=>{if(typeof openModal==='function')openModal();else if(typeof openHistoryAdd==='function')openHistoryAdd()}};
}
function hook(){
 if(typeof window.__MEU_TREINO_HISTORY_REPAIR_HOOKED==='undefined'){
   window.__MEU_TREINO_HISTORY_REPAIR_HOOKED=true;
   if(typeof render==='function'){
     const original=render;
     window.render=function(){const r=original.apply(this,arguments);setTimeout(rebuildHistory,0);return r};
   }
 }
 setTimeout(rebuildHistory,1200);
}
hook();
})();
