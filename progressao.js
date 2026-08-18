/* Avaliação automática de carga baseada na faixa de repetições do treino. */
(function(){
  function parseRange(range){const m=String(range||'').match(/(\d+)\s*[–-]\s*(\d+)/);return m?{lo:+m[1],hi:+m[2]}:null}
  function roundLoad(v){return isFinite(v)&&v>0?(Math.round(v*2)/2).toLocaleString('pt-BR',{maximumFractionDigits:1}):''}
  function readCard(i){
    const cards=document.querySelectorAll('.exercise'),card=cards[i];
    if(!card)return null;
    const range=parseRange(card.querySelector('.tag')?.textContent);
    if(!range)return null;
    const fields=card.querySelectorAll('.setrow');
    const sets=[];
    fields.forEach(row=>{const inputs=row.querySelectorAll('input');const kg=Number(inputs[0]?.value),reps=Number(inputs[1]?.value);if(kg>0&&reps>0)sets.push({kg,reps})});
    return {range,sets,total:fields.length}
  }
  function recommendation(data){
    if(!data||!data.sets.length)return null;
    if(data.sets.length<data.total)return {type:'partial',text:'↳ Preencha todas as séries para avaliar a carga.'};
    const {lo,hi}=data.range,sets=data.sets;
    const allTop=sets.every(x=>x.reps>=hi),below=sets.filter(x=>x.reps<lo).length,avg=sets.reduce((a,x)=>a+x.reps,0)/sets.length;
    const base=sets[sets.length-1].kg||sets.reduce((a,x)=>a+x.kg,0)/sets.length;
    if(allTop)return {type:'up',text:'⬆ SUBIR CARGA',detail:'Topo da faixa em todas as séries. Próximo treino: ~'+roundLoad(base*1.025)+' kg.'};
    if(below>=2||avg<lo)return {type:'down',text:'⬇ BAIXAR CARGA',detail:'Abaixo da faixa em várias séries. Próximo treino: ~'+roundLoad(base*0.95)+' kg.'};
    return {type:'keep',text:'→ MANTER CARGA',detail:'Desempenho dentro da faixa. Busque chegar ao topo antes de aumentar.'};
  }
  window.suggest=function(i){
    const el=document.getElementById('sg'+i);if(!el)return;
    const rec=recommendation(readCard(i));if(!rec){el.innerHTML='';return}
    el.innerHTML='<span class="'+rec.type+'">'+(rec.type==='partial'?rec.text:'<b>'+rec.text+'</b><small>'+rec.detail+'</small>')+'</span>';
  };
  const css=document.createElement('style');css.textContent='.suggest{margin-top:10px;font-size:14px}.suggest span{display:block;padding:10px 12px;border-radius:10px}.suggest small{display:block;margin-top:4px;font-size:12px;font-weight:500}.suggest .up{background:#e8f7ec;color:#18743b}.suggest .down{background:#fff0f0;color:#b42318}.suggest .keep{background:#fff7e8;color:#9a5a00}.suggest b{font-size:14px}';document.head.appendChild(css);
})();
