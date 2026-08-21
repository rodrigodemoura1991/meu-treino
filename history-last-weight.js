/* Último peso por exercício: dica visual semi-transparente sobre o campo, sem preencher o valor real. */
(function(){
  const KEY='meu_treino_reset_v1';
  const STYLE_ID='last-weight-style-v3';
  const BADGE='last-weight-hint-v3';

  function getData(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')||{logs:{}}}
    catch(e){return {logs:{}}}
  }

  function currentDay(){
    const active=document.querySelector('.daystrip button.active');
    const text=active?.innerText?.replace(/[\s\n]+/g,' ').trim()||'';
    const map={SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta',SEX:'Sexta','SÁB':'Sábado',DOM:'Domingo'};
    const m=text.match(/(SEG|TER|QUA|QUI|SEX|SÁB|DOM)/i);
    return m?(map[m[1].toUpperCase()]||'Segunda'):'Segunda';
  }

  function historyMap(day){
    const data=getData();
    const logs=Object.values(data.logs||{})
      .filter(l=>l && l.day===day && l.date)
      .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const out={};
    for(const log of logs){
      const rows=log.rows||{};
      for(const [idx,row] of Object.entries(rows)){
        if(out[idx]!=null) continue;
        let last=null;
        for(let s=0;s<12;s++){
          const n=Number(row?.['kg'+s]);
          if(Number.isFinite(n) && n>0) last=n;
        }
        if(last!=null) out[idx]=last;
      }
    }
    return out;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      .${BADGE}{
        position:fixed;
        z-index:9998;
        pointer-events:none;
        transform:translateY(-50%);
        padding:4px 7px;
        border-radius:7px;
        background:rgba(255,255,255,.52);
        color:rgba(71,85,105,.78);
        border:1px solid rgba(148,163,184,.28);
        font:700 11px/1.15 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:.1px;
        white-space:nowrap;
        box-shadow:0 1px 4px rgba(15,23,42,.08);
        backdrop-filter:blur(2px);
        -webkit-backdrop-filter:blur(2px);
      }
    `;
    document.head.appendChild(st);
  }

  function remove(){document.querySelectorAll('.'+BADGE).forEach(x=>x.remove())}

  function position(badge,input){
    if(!input||!document.body.contains(input)){badge.remove();return}
    if(String(input.value||'').trim()!==''){badge.style.opacity='0';return}
    const r=input.getBoundingClientRect();
    badge.style.left=Math.max(4,r.right-78)+'px';
    badge.style.top=(r.top+r.height/2)+'px';
    badge.style.opacity='1';
  }

  function render(){
    installStyle();
    remove();
    const map=historyMap(currentDay());
    const cards=[...document.querySelectorAll('.exercise')];
    cards.forEach((card,index)=>{
      const last=map[index];
      if(last==null)return;
      const inputs=[...card.querySelectorAll('input[data-kind="kg"]')];
      inputs.forEach(input=>{
        const badge=document.createElement('span');
        badge.className=BADGE;
        badge.textContent='Última: '+String(last).replace('.',',')+' kg';
        document.body.appendChild(badge);
        const update=()=>position(badge,input);
        update();
        input.addEventListener('input',update,{passive:true});
        input.addEventListener('change',update,{passive:true});
      });
    });
  }

  let timer=null;
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(render,180);
  }

  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',()=>{
    document.querySelectorAll('.'+BADGE).forEach(b=>{
      const input=b.__target;
      if(input)position(b,input);
    });
  },{passive:true});
  window.addEventListener('storage',schedule);

  const app=document.getElementById('app');
  if(app){
    const mo=new MutationObserver(schedule);
    mo.observe(app,{childList:true,subtree:true});
  }

  setTimeout(schedule,500);
  setTimeout(schedule,1500);
  setTimeout(schedule,3000);
})();
