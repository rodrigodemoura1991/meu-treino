/* Última carga por exercício: dica visual sobreposta, sem preencher o campo real. */
(function(){
  const KEY='meu_treino_reset_v1';
  const STYLE_ID='last-weight-style';
  const BADGE='last-weight-hint';
  function getData(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||{logs:{}}}catch(e){return {logs:{}}}}
  function currentDay(){
    const active=document.querySelector('.daystrip button.active');
    const t=active?.innerText?.replace(/[\s\n]+/g,' ').trim()||'';
    const map={SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta,SEX':'Sexta','SÁB':'Sábado','DOM':'Domingo'};
    const m=t.match(/(SEG|TER|QUA|QUI|SEX|SÁB|DOM)/i); return m?(map[m[1].toUpperCase()]||'Segunda'):'Segunda';
  }
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function historyMap(day){
    const d=getData(), out={};
    Object.values(d.logs||{}).forEach(l=>{
      if(!l || l.day!==day) return;
      Object.entries(l.rows||{}).forEach(([idx,r])=>{
        let max=0;
        for(let s=0;s<12;s++){const v=Number(r?.['kg'+s]); if(v>0) max=Math.max(max,v)}
        if(max>0) out[idx]=max;
      });
    });
    return out;
  }
  function exercises(day){
    try{return window.workouts?.[day]?.ex||[]}catch(e){return []}
  }
  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      .${BADGE}{position:fixed;z-index:9998;pointer-events:none;transform:translateY(-50%);padding:3px 7px;border-radius:7px;background:rgba(255,255,255,.48);color:rgba(15,23,42,.72);font:600 11px/1.2 system-ui,-apple-system,sans-serif;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);box-shadow:0 1px 4px rgba(0,0,0,.10);white-space:nowrap;transition:opacity .12s}
      input.last-weight-target{position:relative}
    `;document.head.appendChild(st);
  }
  function remove(){document.querySelectorAll('.'+BADGE).forEach(x=>x.remove())}
  function findCard(name, index){
    const target=norm(name);
    const candidates=[...document.querySelectorAll('h1,h2,h3,h4,strong,b,label,div')];
    let heading=candidates.find(e=>norm(e.textContent)===target);
    if(!heading) return null;
    let el=heading;
    for(let i=0;i<7&&el;i++,el=el.parentElement){
      const kg=el.querySelector?.('input[data-kind="kg"],input[placeholder*="kg" i],input[name*="kg" i]');
      if(kg)return kg;
    }
    return null;
  }
  function position(badge,input){
    if(!input||!document.body.contains(input)){badge.style.opacity='0';return}
    if(input.value){badge.style.opacity='0';return}
    const r=input.getBoundingClientRect();
    badge.style.left=Math.max(4,r.right-82)+'px';
    badge.style.top=(r.top+r.height/2)+'px';
    badge.style.opacity='1';
  }
  function render(){
    installStyle(); remove();
    const day=currentDay(), ex=exercises(day), map=historyMap(day);
    ex.forEach((e,i)=>{
      const last=map[i]; if(!last)return;
      const input=findCard(e[0],i); if(!input)return;
      input.classList.add('last-weight-target');
      const b=document.createElement('span');b.className=BADGE;b.textContent='Última: '+String(last).replace('.',',')+' kg';document.body.appendChild(b);
      const update=()=>position(b,input); update();
      input.addEventListener('input',update); input.addEventListener('change',update);
      window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    });
  }
  let timer;
  function schedule(){clearTimeout(timer);timer=setTimeout(render,120)}
  window.addEventListener('load',schedule);
  const mo=new MutationObserver(schedule);mo.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('storage',schedule);
  setTimeout(schedule,500);setTimeout(schedule,1500);setTimeout(schedule,3000);
})();
