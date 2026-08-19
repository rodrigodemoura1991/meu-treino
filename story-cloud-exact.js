/* STORY REFERENCE v3 — template quadrado 1200x1200 + dados reais do registro */
(function(){
const U='https://uvujytjdafcyacawcirp.supabase.co',K='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE',W=1200,H=1200;
let client,logs={};
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
async function load(){
 client=client||window.supabase?.createClient?.(U,K);if(!client)throw Error('Supabase não carregou');
 const q=await client.from('workout_logs').select('payload,workout_date,updated_at').like('log_key','resetv1|%').order('updated_at',{ascending:false});
 if(q.error)throw q.error;logs={};
 for(const r of q.data||[]){const d=r.workout_date||r.payload?.date;if(d&&r.payload&&valid(r.payload)&&!logs[d])logs[d]=r.payload}
 return logs;
}
async function make(l){
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const bg=await image('story-reference-template.svg?v=20260819ref3');
 if(bg)c.drawImage(bg,0,0,W,H);else{c.fillStyle='#050505';c.fillRect(0,0,W,H)}
 c.fillStyle='rgba(0,0,0,.72)';c.fillRect(92,470,590,420);c.fillRect(76,905,1030,190);c.fillRect(78,1098,1030,58);
 txt(c,'TREINO',126,274,94,'900','#f4f4f4');txt(c,'CONCLUÍDO',126,365,72,'900','#f45113');
 c.strokeStyle='#f45113';c.lineWidth=7;c.beginPath();c.moveTo(126,392);c.lineTo(670,392);c.stroke();
 txt(c,title(l),126,445,34,'900','#fff');txt(c,dateBR(l.date)+' • '+weekday(l.date),126,474,18,'700','#ddd');
 txt(c,'◷',190,545,42,'700','#f45113');txt(c,'DURAÇÃO',165,585,19,'700','#ddd');txt(c,duration(l.duration),130,635,49,'900','#fff');txt(c,'HH:MM:SS',160,665,16,'900','#f45113');
 txt(c,'♥',465,545,42,'700','#f45113');txt(c,'FC MÉDIA',440,585,19,'700','#ddd');txt(c,bpm(l)?Math.round(bpm(l)):'—',460,635,49,'900','#fff');txt(c,'BPM',465,665,18,'900','#f45113');
 txt(c,'♨',190,760,42,'700','#f45113');txt(c,'CALORIAS',165,800,19,'700','#ddd');txt(c,n(l.calories)?Math.round(n(l.calories)).toLocaleString('pt-BR'):'—',175,855,50,'900','#fff');txt(c,'KCAL',190,885,18,'900','#f45113');
 txt(c,'◉',475,760,42,'700','#f45113');txt(c,'CARGA TOTAL',430,800,19,'700','#ddd');const v=volume(l);txt(c,v?Math.round(v).toLocaleString('pt-BR'):'—',450,855,50,'900','#fff');txt(c,'KG',485,885,18,'900','#f45113');
 c.fillStyle='#f45113';c.fillRect(80,910,260,55);txt(c,'CARDIO',105,950,34,'900','#080808');
 txt(c,'🚲',125,1030,42,'700','#f45113');txt(c,String(l?.cardio?.type||'BIKE INTERNA').toUpperCase(),195,1025,18,'800','#ddd');txt(c,duration(l?.cardio?.duration),195,1080,48,'900','#fff');txt(c,'MIN',405,1080,18,'900','#f45113');
 txt(c,'♥',565,1030,42,'700','#f45113');txt(c,'FC MÉDIA',610,1025,18,'800','#ddd');txt(c,cardioBpm(l)?Math.round(cardioBpm(l)):'—',610,1080,48,'900','#fff');txt(c,'BPM',760,1080,18,'900','#f45113');
 txt(c,'🔥  CALORIAS DO CARDIO',810,1025,16,'800','#ddd');txt(c,n(l?.cardio?.calories)?Math.round(n(l.cardio.calories)).toLocaleString('pt-BR')+' KCAL':'—',810,1075,28,'900','#fff');
 txt(c,'🌡  TEMPERATURA',95,1137,18,'800','#ddd');txt(c,temp(l),95,1160,27,'900','#f45113');
 return cv;
}
async function gen(d){
 if(!logs[d])await load();const l=logs[d];if(!l){alert('Não encontrei o registro salvo na nuvem para '+dateBR(d)+'.');return}
 const cv=await make(l),blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob){alert('Não foi possível gerar a imagem.');return}
 const file=new File([blob],'meu-treino-'+d+'.png',{type:'image/png'}),url=URL.createObjectURL(blob);document.getElementById('storyRefModal')?.remove();
 const m=document.createElement('div');m.id='storyRefModal';m.style.cssText='position:fixed;inset:0;z-index:1000000;background:#050505;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;overflow:hidden';
 m.innerHTML='<div style="flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center"><img src="'+url+'" style="width:min(94vw,900px);height:min(94vw,900px);max-height:calc(100vh - 90px);object-fit:contain"></div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:8px"><button id="refShare" style="background:#f45113;color:#fff;border:0;padding:13px 24px;font-size:17px;font-weight:900;border-radius:4px">📲 Compartilhar</button><button id="refSave" style="background:#fff;color:#111;border:0;padding:13px 24px;font-size:17px;font-weight:900;border-radius:4px">Salvar imagem</button><button id="refClose" style="background:#333;color:#fff;border:0;padding:13px 24px;font-size:17px;font-weight:900;border-radius:4px">Fechar</button></div>';
 document.body.appendChild(m);m.querySelector('#refClose').onclick=()=>{URL.revokeObjectURL(url);m.remove()};m.querySelector('#refSave').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=file.name;a.click()};m.querySelector('#refShare').onclick=async()=>{try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Meu Treino',text:'Treino concluído 💪',files:[file]});return}}catch(e){if(e?.name==='AbortError')return}m.querySelector('#refSave').click()};
}
async function card(){
 const app=document.getElementById('app');if(!app||document.getElementById('storyExactCard'))return;try{await load()}catch(e){return}const ds=Object.keys(logs).sort((a,b)=>b.localeCompare(a));if(!ds.length)return;
 const s=document.createElement('section');s.id='storyExactCard';s.className='card';s.innerHTML='<h2>📸 Story do Instagram</h2><p class="muted">Template quadrado 1200×1200 • dados reais do treino selecionado.</p><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><label style="flex:1;min-width:200px;font-size:11px;font-weight:800">DATA DO TREINO<select id="storyExactDate" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:42px;border:1px solid #ccd5dd;border-radius:10px;padding:0 10px;background:#fff">'+ds.map(d=>'<option value="'+d+'">'+dateBR(d)+' — '+title(logs[d])+'</option>').join('')+'</select></label><button id="storyExactBtn" class="primary">📲 Postar no Instagram</button></div>';
 app.appendChild(s);document.getElementById('storyExactBtn').onclick=()=>gen(document.getElementById('storyExactDate').value);
}
window.generateStoryFromCloudExact=async()=>{const d=document.getElementById('storyExactDate')?.value;if(!d)return alert('Selecione uma data do treino.');await gen(d)};
window.addEventListener('load',()=>setTimeout(card,1200));setInterval(card,1000);
})();