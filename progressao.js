/* Avaliação automática de carga conforme a faixa de repetições do treino. */
(function(){
  function parseRange(range){const m=String(range||'').match(/(\d+)\s*[–-]\s*(\d+)/);return m?{lo:+m[1],hi:+m[2]}:null}
  function roundLoad(v){return isFinite(v)&&v>0?(Math.round(v*2)/2).toLocaleString('pt-BR',{maximumFractionDigits:1}):''}
  function readCard(card){
    const range=parseRange(card.querySelector('.tag')?.textContent);if(!range)return null;
    const rows=[...card.querySelectorAll('.setrow')];
    const sets=rows.map(row=>{const inputs=row.querySelectorAll('input.field');return {kg:Number(inputs[0]?.value),reps:Number(inputs[1]?.value)}});
    const filled=sets.filter(x=>x.kg>0&&x.reps>0);
    return {range,sets,filled,total:rows.length};
  }
  function recommendation(data){
    if(!data||!data.filled.length)return null;
    if(data.filled.length<data.total)return {type:'partial',text:'↳ Preencha todas as séries para avaliar a carga.'};
    const {lo,hi}=data.range,sets=data.filled;
    const allTop=sets.every(x=>x.reps>=hi);
    const below=sets.filter(x=>x.reps<lo).length;
    const avg=sets.reduce((a,x)=>a+x.reps,0)/sets.length;
    const base=sets[sets.length-1].kg||sets.reduce((a,x)=>a+x.kg,0)/sets.length;
    if(allTop)return {type:'up',text:'⬆ SUBIR CARGA',detail:'Você bateu o topo da faixa em todas as séries. Próximo treino: ~'+roundLoad(base*1.025)+' kg.'};
    if(below>=2||avg<lo)return {type:'down',text:'⬇ BAIXAR CARGA',detail:'As repetições ficaram abaixo da faixa. Próximo treino: ~'+roundLoad(base*0.95)+' kg.'};
    return {type:'keep',text:'→ MANTER CARGA',detail:'Carga adequada. Tente aumentar as repetições até o topo da faixa antes de subir o peso.'};
  }
  function update(card){
    let el=card.querySelector('.suggest');
    if(!el){el=document.createElement('div');el.className='suggest';card.querySelector('.sets')?.after(el)}
    const rec=recommendation(readCard(card));
    const html=rec?'<span class="'+rec.type+'">'+(rec.type==='partial'?rec.text:'<b>'+rec.text+'</b><small>'+rec.detail+'</small>')+'</span>':'';
    if(el.innerHTML!==html)el.innerHTML=html;
  }
  function scan(){document.querySelectorAll('.exercise').forEach(update)}
  const css=document.createElement('style');css.textContent='.suggest{margin:10px 0 2px;font-size:14px}.suggest span{display:block;padding:11px 13px;border-radius:12px;font-weight:600}.suggest small{display:block;margin-top:4px;font-size:12px;font-weight:500;line-height:1.35}.suggest .up{background:#e8f7ec;color:#18743b}.suggest .down{background:#fff0f0;color:#b42318}.suggest .keep{background:#fff7e8;color:#9a5a00}.suggest .partial{background:#eef4ff;color:#315b9a}';document.head.appendChild(css);

  // Evita observar as próprias caixas de recomendação. A versão anterior
  // criava um loop de MutationObserver que podia travar os campos de carga/reps.
  let scheduled=false;
  const scheduleScan=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan()})};
  const observer=new MutationObserver(mutations=>{
    const relevant=mutations.some(m=>{
      if(m.type!=='childList')return false;
      if(m.target.closest?.('.suggest'))return false;
      return [...m.addedNodes,...m.removedNodes].some(n=>{
        if(n.nodeType!==1)return false;
        return !n.classList.contains('suggest') && !n.closest('.suggest');
      });
    });
    if(relevant)scheduleScan();
  });
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  document.addEventListener('input',e=>{if(e.target.matches('.exercise input.field'))scheduleScan()},true);
  document.addEventListener('change',e=>{if(e.target.matches('.exercise input.field'))scheduleScan()},true);
  setTimeout(scan,150);
})();
