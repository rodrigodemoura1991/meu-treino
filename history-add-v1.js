(()=>{
'use strict';
const DAY_ORDER=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const isoDate=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const offsetIso=n=>{const d=new Date();d.setDate(d.getDate()+n);return isoDate(d)};
const weekdayFor=iso=>DAY_ORDER[new Date(iso+'T12:00:00').getDay()];
function addButton(){
 if(current!=='Histórico')return;
 const h=[...document.querySelectorAll('h1,h2,h3')].find(e=>(e.textContent||'').trim()==='Seus registros');
 if(!h||document.getElementById('addHistoricalWorkout'))return;
 const btn=document.createElement('button');btn.id='addHistoricalWorkout';btn.textContent='＋ Adicionar treino';
 btn.style.cssText='margin:14px 0 4px;background:#f26a00;color:#fff;border:0;border-radius:12px;padding:13px 20px;font-weight:800;font-size:16px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.08)';
 btn.onclick=openModal;h.parentElement.appendChild(btn);
}
function modal(){
 let m=document.getElementById('historicalWorkoutModal');if(m)return m;
 m=document.createElement('div');m.id='historicalWorkoutModal';m.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.48);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px';
 m.innerHTML='<div style="width:min(520px,100%);background:#fff;border-radius:22px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:system-ui,sans-serif"><div style="font-size:13px;font-weight:900;letter-spacing:2px;color:#f26a00">REGISTRO MANUAL</div><h2 style="margin:7px 0 6px;font-size:28px;color:#172033">Adicionar treino</h2><p style="margin:0 0 18px;color:#718096">Registre um treino que aconteceu em outro dia, escolhendo a data correta.</p><label style="display:block;font-weight:800;margin:10px 0 6px">Data do treino</label><input id="histDate" type="date" style="width:100%;box-sizing:border-box;padding:14px;border:2px solid #d7dee8;border-radius:12px;font-size:17px"><label style="display:block;font-weight:800;margin:16px 0 6px">Treino</label><select id="histDay" style="width:100%;box-sizing:border-box;padding:14px;border:2px solid #d7dee8;border-radius:12px;font-size:17px"></select><div style="display:flex;gap:10px;margin-top:22px"><button id="histCancel" style="flex:1;padding:14px;border:0;border-radius:12px;background:#eef1f5;color:#344054;font-weight:800;font-size:16px">Cancelar</button><button id="histStart" style="flex:1;padding:14px;border:0;border-radius:12px;background:#f26a00;color:white;font-weight:800;font-size:16px">Adicionar treino</button></div></div>';
 document.body.appendChild(m);const sel=m.querySelector('#histDay');days.forEach(d=>{const o=document.createElement('option');o.value=d;o.textContent=d+' — '+workouts[d].title;sel.appendChild(o)});
 m.querySelector('#histDate').addEventListener('change',()=>sel.value=weekdayFor(m.querySelector('#histDate').value));m.querySelector('#histCancel').onclick=()=>m.style.display='none';m.querySelector('#histStart').onclick=startHistorical;return m;
}
function openModal(){const m=modal(),date=offsetIso(-1);m.querySelector('#histDate').value=date;m.querySelector('#histDay').value=weekdayFor(date);m.style.display='flex'}
function startHistorical(){const m=document.getElementById('historicalWorkoutModal'),date=m.querySelector('#histDate').value,day=m.querySelector('#histDay').value;if(!date)return alert('Escolha a data do treino.');const k=key(day,date);if(data.logs[k]&&!confirm('Já existe um treino salvo nessa data. Deseja abrir esse registro para editar?'))return;editDate=date;current=day;drafts[k]=data.logs[k]?clone(data.logs[k]):blankLog(day,date);m.style.display='none';render();window.scrollTo({top:0,behavior:'smooth'})}
new MutationObserver(addButton).observe(document.body,{childList:true,subtree:true});setTimeout(addButton,300);
})();
