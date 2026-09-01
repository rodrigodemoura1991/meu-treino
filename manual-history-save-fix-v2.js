(()=>{
'use strict';
// Permite registrar manualmente um treino que ocorreu em uma data passada.
// Para treinos de hoje, a validação normal continua intacta.
const ORIGINAL_COMMIT_SAVED=window.commitSaved;
const LOCAL_KEY_MANUAL='meu_treino_reset_v2';
const isoToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
const readState=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY_MANUAL)||'{}')}catch(e){return {}}};
function manualPayload(k){
 const parts=String(k||'').split('|'),day=parts[0],date=parts[1];
 if(!day||!date||date===isoToday())return null;
 const rows={};
 document.querySelectorAll('.exercise').forEach((card,i)=>{
  const row={};
  card.querySelectorAll('.setrow').forEach((set,s)=>{
   const kg=num(set.querySelector('input[data-kind="kg"]')?.value);
   const reps=num(set.querySelector('input[data-kind="reps"]')?.value);
   if(kg>0)row['kg'+s]=kg;
   if(reps>0)row['reps'+s]=reps;
  });
  const obs=card.querySelector('.obs')?.value||'';
  if(obs)row.observation=obs;
  if(Object.keys(row).length)rows[i]=row;
 });
 const get=sel=>document.querySelector(sel)?.value||'';
 const selects=[...document.querySelectorAll('.cardioCard select')];
 const inputs=[...document.querySelectorAll('.cardioCard input')];
 const cardio={type:selects[0]?.value||'',duration:inputs[0]?.value||'',distance:inputs[1]?.value||'',calories:inputs[2]?.value||'',avgBpm:inputs[3]?.value||''};
 const metricInputs=[...document.querySelectorAll('.metricsCard .metrics input')];
 const effort=document.querySelector('.metricsCard .metrics select')?.value||'';
 const notes=document.querySelector('.metricsCard textarea.notes')?.value||'';
 let duration=metricInputs[0]?.value||'';
 const avgBpm=metricInputs[1]?.value||'';
 const calories=metricInputs[2]?.value||'';
 const hasSets=Object.values(rows).some(r=>Object.keys(r).some(x=>/^kg\d+$/.test(x)&&num(r[x])>0)&&Object.keys(r).some(x=>/^reps\d+$/.test(x)&&num(r[x])>0));
 const hasCardio=!!(cardio.type||cardio.duration||cardio.distance||cardio.calories||cardio.avgBpm);
 const hasOther=!!(duration||avgBpm||calories||effort||notes);
 if(!hasSets&&!hasCardio&&!hasOther){alert('Preencha os dados do treino antes de salvar.');return null}
 const payload={day,date,rows,notes,duration,avgBpm,calories,effort,cardio,completed:true};
 let total=0;Object.values(rows).forEach(r=>{for(let s=0;s<20;s++)total+=num(r['kg'+s])*num(r['reps'+s])});payload.tonnageKg=total;payload.tonnes=total/1000;
 return payload;
}
window.commitSaved=function(k){
 const date=String(k||'').split('|')[1]||'';
 if(date===isoToday()||!date)return ORIGINAL_COMMIT_SAVED?.(k);
 const payload=manualPayload(k);if(!payload)return false;
 const state=readState();state.logs??={};state.logs[k]=payload;
 try{localStorage.setItem(LOCAL_KEY_MANUAL,JSON.stringify(state))}catch(e){alert('Não foi possível registrar o treino localmente.');return false}
 return true;
};
window.__manualHistoryFix='v2';
})();
