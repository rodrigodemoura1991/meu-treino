/* MEU TREINO — base fix v12 */
(function(){
'use strict';
/* Ajustes do treino principal */
try{
  if(typeof workouts!=='undefined'){
    if(workouts.Sábado?.ex?.length) workouts.Sábado.ex[1]=['Crucifixo inverso na polia',3,'12–15'];
    if(workouts.Quarta?.ex && !workouts.Quarta.ex.some(x=>x[0]==='Panturrilha no leg horizontal')) workouts.Quarta.ex.push(['Panturrilha no leg horizontal',4,'12–15']);
  }
}catch(e){console.error('workout patch v12',e)}
/* Nunca deixa uma exceção de um módulo auxiliar travar a navegação. */
window.__MEU_TREINO_V12=true;
/* Expande o seletor de exercício extra com TODOS os exercícios dos treinos principais. */
function expandExtraPicker(){
  const select=document.getElementById('extraSelect');
  if(!select || typeof workouts==='undefined') return;
  const existing=new Set([...select.options].map(o=>o.textContent.split(' — ')[0].trim().toLowerCase()));
  const all=[];
  Object.keys(workouts).forEach(day=>{
    (workouts[day]?.ex||[]).forEach(x=>{if(x?.[0])all.push(x)});
  });
  all.forEach(x=>{
    const name=String(x[0]);
    if(existing.has(name.toLowerCase()))return;
    const o=document.createElement('option');
    o.value='custom:'+encodeURIComponent(name);
    o.textContent=name+' — '+(x[1]||3)+' séries • '+(x[2]||'8–12')+' reps';
    select.appendChild(o);
    existing.add(name.toLowerCase());
  });
  /* O módulo extra-v9 entende índices do banco; para opções novas, adicionamos diretamente. */
  select.addEventListener('change',function(){
    const v=select.value;
    if(!v.startsWith('custom:'))return;
    const name=decodeURIComponent(v.slice(7));
    select.dataset.customName=name;
  });
  const add=document.getElementById('extraAdd');
  if(add && !add.dataset.v12){
    add.dataset.v12='1';
    add.addEventListener('click',function(){
      const name=select.dataset.customName;
      if(!name)return;
      const input=document.getElementById('extraName');
      if(input && !input.value.trim()) input.value=name;
      select.dataset.customName='';
    },true);
  }
}
const mo=new MutationObserver(expandExtraPicker);
mo.observe(document.body,{childList:true,subtree:true});
setTimeout(expandExtraPicker,300);
setTimeout(expandExtraPicker,1000);
})();
