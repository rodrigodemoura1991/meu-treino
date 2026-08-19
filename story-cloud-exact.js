/* STORY TEMPLATE DEFINITIVO v1 — usa a imagem fornecida como fundo, sem redesenhar o template. Apenas sobrepõe os dados reais nas áreas livres. */
(function(){
const U='https://uvujytjdafcyacawcirp.supabase.co',K='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE',W=1254,H=1254;
let client,logs={};
const ORANGE='#f45113';
const n=v=>{const x=Number(String(v??'').replace(',','.'));return Number.isFinite(x)?x:0};
const valid=l=>!!l&&(n(l.duration)>0||n(l.calories)>0||n(l?.cardio?.duration)>0||n(l?.cardio?.calories)>0||n(l.avgBpm)>0||Object.values(l.rows||{}).some(r=>Object.keys(r||{}).some(k=>/^kg\d+$/.test(k)&&n(r[k])>0)));
const dateBR=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR');
const weekday=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase();
const title=l=>{for(const v of [l?.title,l?.discipline,l?.treino,l?.workout,l?.workoutName,l?.name,l?.day]){const s=String(v??'').trim();if(s&&!/^(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)$/i.test(s))return s}return 'TREINO'};
function seconds(v){const s=String(v??'').trim();if(/^\d+:\d{1,2}:\d{1,2}$/.test(s)){const [h,m,z]=s.split(':').map(Number);return h*3600+m*60+z}if(/^\d+:\d{1,2}$/.test(s)){const [m,z]=s.split(':').map(Number);return m*60+z}return n(s)}
function duration(v){const x=seconds(v);if(!x)return '—';return String(Math.floor(x/3600)).padStart(2,'0')+':'+String(Math.floor(x%3600/60)).padStart(2,'0')+':'+String(Math.round(x%60)).padStart(2,'0')}
function bpm(l){return n(l?.avgBpm||l?.fcMedia||l?.heartRate||l?.bpm||l?.hrAvg)}
function cardioBpm(l){return n(l?.cardio?.avgBpm||l?.cardio?.fcMedia||l?.cardio?.heartRate||l?.cardio?.bpm||l?.cardio?.hrAvg)}
function volume(l){let t=0;for(const r of Object.values(l?.rows||{}))for(let i=0;i<50;i++){const kg=n(r?.['kg'+i]),rp=n(r?.['reps'+i]);if(kg>0&&rp>0)t+=kg*rp}return t}
function temp(l){const s=String(l?.temperature??'').trim();return s?(s.includes('°')?s:s+' °C'):'—'}
function image(src){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src})}
function txt(c,s,x,y,size,weight='700',color='#fff',align='left'){c.fillStyle=color;c.font=weight+' '+size+'px Arial,sans-serif';c.textAlign=align;c.fillText(String(s),x,y);c.textAlign='left'}
function fit(c,s,maxWidth,size,weight='800',family='Arial,sans-serif'){let z=size;c.font=weight+' '+z+'px '+family;while(c.measureText(String(s)).width>maxWidth&&z>18){z-=1;c.font=weight+' '+z+'px '+family}return z}
async function load(){client=client||window.supabase?.createClient?.(U,K);if(!client)throw Error('Supabase não carregou');const q=await client.from('workout_logs').select('payload,workout_date,updated_at').like('log_key','resetv1|%').order('updated_at',{ascending:false});if(q.error)throw q.error;logs={};for(const r of q.data||[]){const d=r.workout_date||r.payload?.date;if(d&&r.payload&&valid(r.payload)&&!logs[d])logs[d]=r.payload}return logs}
async function make(l){
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const bg=await image('story-template-definitivo.jpg?v=20260819template1');
 if(bg)c.drawImage(bg,0,0,W,H);else{c.fillStyle='#050505';c.fillRect(0,0,W,H)}
 /* Área livre esquerda do template: somente dados, sem caixas ou redesenho do fundo. */
 const left=118,right=660;
 const t=title(l);txt(c,t,left,540,fit(c,t,520,36,'900'),'900','#fff');
 txt(c,dateBR(l.date)+' • '+weekday(l.date),left,570,18,'700','#d9d9d9');
 const x1=145,x2=430;
 txt(c,'◷',x1,625,30,'700',ORANGE);txt(c,'DURAÇÃO',x1+34,624,16,'800','#d9d9d9');txt(c,duration(l.duration),x1+34,670,42,'900','#fff');
 txt(c,'♥',x2,625,30,'700',ORANGE);txt(c,'FC MÉDIA',x2+34,624,16,'800','#d9d9d9');txt(c,bpm(l)?Math.round(bpm(l))+' BPM':'—',x2+34,670,40,'900','#fff');
 const v=volume(l);
 txt(c,'♨',x1,745,30,'700',ORANGE);txt(c,'CALORIAS',x1+34,744,16,'800','#d9d9d9');txt(c,n(l.calories)?Math.round(n(l.calories)).toLocaleString('pt-BR')+' KCAL':'—',x1+34,790,40,'900','#fff');
 txt(c,'◉',x2,745,30,'700',ORANGE);txt(c,'CARGA TOTAL',x2+34,744,16,'800','#d9d9d9');txt(c,v?Math.round(v).toLocaleString('pt-BR')+' KG':'—',x2+34,790,38,'900','#fff');
 txt(c,'CARDIO',left,858,28,'900',ORANGE);c.fillStyle=ORANGE;c.fillRect(left,868,left+0?0:0,0);
 const ct=String(l?.cardio?.type||'BIKE INTERNA').toUpperCase();txt(c,'🚴',left,915,26,'700',ORANGE);txt(c,ct,left+38,912,15,'800','#d9d9d9');txt(c,duration(l?.cardio?.duration),left+38,953,37,'900','#fff');txt(c,'MIN',left+190,953,15,'900',ORANGE);
 txt(c,'♥',left+280,915,26,'700',ORANGE);txt(c,'FC MÉDIA',left+312,912,15,'800','#d9d9d9');txt(c,cardioBpm(l)?Math.round(cardioBpm(l))+' BPM':'—',left+312,953,32,'900','#fff');
 txt(c,'🔥',left+455,915,22,'700',ORANGE);txt(c,'CALORIAS',left+485,912,15,'800','#d9d9d9');txt(c,n(l?.cardio?.calories)?Math.round(n(l.cardio.calories))+' KCAL':'—',left+485,953,28,'900','#fff');
 txt(c,'🌡',left,1015,25,'700',ORANGE);txt(c,'TEMPERATURA',left+34,1013,16,'800','#d9d9d9');txt(c,temp(l),left+34,1052,32,'900','#fff');
 return cv;
}
async function gen(d){if(!logs[d])await load();const l=logs[d];if(!l){alert('Não encontrei o registro salvo na nuvem para '+dateBR(d)+'.');return}const cv=await make(l),blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob){alert('Não foi possível gerar a imagem.');return}const file=new File([blob],'meu-treino-'+d+'.png',{type:'image/png'}),url=URL.createObjectURL(blob);document.getElementById('storyRefModal')?.remove();const m=document.createElement('div');m.id='storyRefModal';m.style.cssText='position:fixed;inset:0;z-index:1000000;background:#050505;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;overflow:hidden';m.innerHTML='<div style="flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center"><img src="'+url+'" style="width:min(94vw,900px);height:min(94vw,900px);max-height:calc(100vh - 90px);object-fit:contain"></div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:8px"><button id="refShare" style="background:#f45113;color:#fff;border:0;padding:13px 24px;font-size:17px;font-weight:900;border-radius:4px">📲 Compartilhar</button><button id="refSave" style="background:#fff;color:#111;border:0;padding:13px 24px;font-size:17px;font-weight:900;border-radius:4px">Salvar imagem</button><button id="refClose" style="background:#333;color:#fff;border:0;padding:13px 24px;font-size:17px;font-weight:900;border-radius:4px">Fechar</button></div>';document.body.appendChild(m);m.querySelector('#refClose').onclick=()=>{URL.revokeObjectURL(url);m.remove()};m.querySelector('#refSave').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=file.name;a.click()};m.querySelector('#refShare').onclick=async()=>{try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',text:'Treino concluído 💪',files:[file]});return}}catch(e){if(e?.name==='AbortError')return}m.querySelector('#refSave').click()}}
async function card(){const app=document.getElementById('app');if(!app||document.getElementById('storyExactCard'))return;try{await load()}catch(e){return}const ds=Object.keys(logs).sort((a,b)=>b.localeCompare(a));if(!ds.length)return;const s=document.createElement('section');s.id='storyExactCard';s.className='card';s.innerHTML='<h2>📸 Story do Instagram</h2><p class="muted">Template definitivo quadrado • fundo original preservado • dados reais do treino selecionado.</p><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><label style="flex:1;min-width:200px;font-size:11px;font-weight:800">DATA DO TREINO<select id="storyExactDate" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:42px;border:1px solid #ccd5dd;border-radius:10px;padding:0 10px;background:#fff">'+ds.map(d=>'<option value="'+d+'">'+dateBR(d)+' — '+title(logs[d])+'</option>').join('')+'</select></label><button id="storyExactBtn" class="primary">📲 Postar no Instagram</button></div>';app.appendChild(s);document.getElementById('storyExactBtn').onclick=()=>gen(document.getElementById('storyExactDate').value)}
window.generateStoryFromCloudExact=async()=>{const d=document.getElementById('storyExactDate')?.value;if(!d)return alert('Selecione uma data do treino.');await gen(d)};
window.addEventListener('load',()=>setTimeout(card,1200));setInterval(card,1000);
})();