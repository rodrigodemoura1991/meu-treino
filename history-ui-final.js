/* HISTÓRICO UI FINAL — volume total + ações compactas + remoção do card Instagram */
(function(){
  function addVolume(){
    if(typeof current==='undefined' || current!=='Histórico') return;
    document.querySelectorAll('.historyrow').forEach(row=>{
      const info=row.querySelector('.historyhead > div');
      const title=row.querySelector('.historyhead b');
      if(!info||!title||typeof volumeForLog!=='function'||typeof key!=='function') return;
      let volumeLine=info.querySelector('.historyVolume');
      const text=(title.textContent||'').trim();
      const m=text.match(/^(.+?)\s+—\s+(.+?)$/);
      if(!m) return;
      const day=m[1].trim();
      const dateText=m[2].trim();
      const parts=dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if(!parts) return;
      const k=key(day,parts[3]+'-'+parts[2]+'-'+parts[1]);
      const l=data?.logs?.[k];
      const volume=Math.round(Number(volumeForLog(l)||0));
      if(!volume) return;
      const nextText='🏋️ '+volume.toLocaleString('pt-BR')+' kg levantados';
      if(!volumeLine){
        volumeLine=document.createElement('small');
        volumeLine.className='historyVolume';
        info.appendChild(volumeLine);
      }
      if(volumeLine.textContent!==nextText) volumeLine.textContent=nextText;
    });
  }

  function compactActions(){
    if(typeof current==='undefined' || current!=='Histórico') return;
    document.querySelectorAll('.historyActions .smallbtn').forEach(btn=>{
      const t=(btn.textContent||'').trim().toLowerCase();
      if(t.includes('editar')){btn.textContent='✏️';btn.setAttribute('aria-label','Editar treino');btn.title='Editar treino';}
      else if(t.includes('excluir')){btn.textContent='🗑️';btn.setAttribute('aria-label','Excluir treino');btn.title='Excluir treino';}
    });
  }

  function removeInstagram(){
    document.getElementById('storyExactCard')?.remove();
    document.querySelectorAll('section.card').forEach(card=>{
      const h=card.querySelector('h2');
      if(h && /story do instagram/i.test(h.textContent||'')) card.remove();
    });
  }

  function apply(){
    removeInstagram();
    addVolume();
    compactActions();
  }

  const css=document.createElement('style');
  css.textContent=`
    .historyhead{align-items:flex-start;gap:12px}
    .historyhead>div:first-child{min-width:0;flex:1}
    .historyActions{display:flex;gap:6px;align-items:center;justify-content:flex-end;flex:0 0 auto}
    .historyActions .smallbtn{width:36px;height:36px;min-width:36px;padding:0!important;border-radius:10px!important;display:inline-flex;align-items:center;justify-content:center;font-size:16px!important;line-height:1;border:1px solid #dfe5eb}
    .historyActions .danger.smallbtn{background:#fff3f3;color:#c62828}
    .historyActions .secondary.smallbtn{background:#f1f5f8;color:#344455}
    .historyVolume{display:block!important;margin-top:4px;color:#536474!important;font-weight:700;font-size:12px!important;line-height:1.25}
    @media(max-width:600px){
      .historyActions{gap:5px}
      .historyActions .smallbtn{width:34px;height:34px;min-width:34px;font-size:15px!important;border-radius:9px!important}
      .historyVolume{font-size:11px!important}
    }
  `;
  document.head.appendChild(css);

  const oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(apply,30);setTimeout(apply,180);return r};
  }
  const observer=new MutationObserver(()=>{if(typeof current!=='undefined'&&current==='Histórico') apply()});
  observer.observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{if(typeof current!=='undefined'&&current==='Histórico')apply()},1200);
})();
