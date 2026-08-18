/* Avaliação automática de carga baseada na faixa de repetições do treino. */
(function(){
  function parseRange(range){
    const m=String(range||'').match(/(\d+)\s*[–-]\s*(\d+)/);
    return m ? {lo:+m[1],hi:+m[2]} : null;
  }
  function roundLoad(v){
    if(!isFinite(v)||v<=0) return '';
    return (Math.round(v*2)/2).toLocaleString('pt-BR',{maximumFractionDigits:1});
  }
  function recommendation(ex,r){
    const rg=parseRange(ex[2]);
    if(!rg) return null;
    const sets=[];
    for(let s=0;s<ex[1];s++){
      const kg=Number(r['kg'+s]);
      const reps=Number(r['reps'+s]);
      if(Number.isFinite(kg)&&kg>0&&Number.isFinite(reps)&&reps>0) sets.push({kg,reps});
    }
    if(!sets.length) return null;
    if(sets.length<ex[1]) return {type:'partial',text:'↳ Preencha todas as séries para eu avaliar a carga.'};
    const allTop=sets.every(x=>x.reps>=rg.hi);
    const below=sets.filter(x=>x.reps<rg.lo).length;
    const avg=sets.reduce((a,x)=>a+x.reps,0)/sets.length;
    const base=sets[sets.length-1].kg || sets.reduce((a,x)=>a+x.kg,0)/sets.length;
    if(allTop){
      const next=roundLoad(base*1.025);
      return {type:'up',text:'⬆ SUBIR CARGA',detail:'Você bateu o topo da faixa em todas as séries. Próximo treino: ~'+next+' kg.'};
    }
    if(below>=2 || avg<rg.lo){
      const next=roundLoad(base*0.95);
      return {type:'down',text:'⬇ BAIXAR CARGA',detail:'Você ficou abaixo da faixa em várias séries. Próximo treino: ~'+next+' kg.'};
    }
    return {type:'keep',text:'→ MANTER CARGA',detail:'Desempenho dentro da faixa. Tente aproximar-se do topo antes de subir.'};
  }
  window.suggest=function(i){
    const el=document.getElementById('sg'+i);
    if(!el) return;
    const ex=(window.W && window.W[window.day]?.e || window.SAT || [])[i];
    if(!ex){el.innerHTML='';return;}
    const r=window.log ? window.log().rows[i]||{} : {};
    const rec=recommendation(ex,r);
    if(!rec){el.innerHTML='';return;}
    if(rec.type==='partial'){
      el.innerHTML='<span class="keep">'+rec.text+'</span>';
      return;
    }
    el.innerHTML='<span class="'+rec.type+'"><b>'+rec.text+'</b><small>'+rec.detail+'</small></span>';
  };
  const css=document.createElement('style');
  css.textContent='.suggest{margin-top:10px;font-size:14px}.suggest span{display:block;padding:10px 12px;border-radius:10px}.suggest small{display:block;margin-top:4px;font-size:12px;font-weight:500}.suggest .up{background:#e8f7ec;color:#18743b}.suggest .down{background:#fff0f0;color:#b42318}.suggest .keep{background:#fff7e8;color:#9a5a00}.suggest b{font-size:14px}';
  document.head.appendChild(css);
})();
