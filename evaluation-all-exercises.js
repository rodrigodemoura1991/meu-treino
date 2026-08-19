/* Avaliação de carga: todos os exercícios usam a mesma regra de progressão. */
(function(){
  const originalRecommendation=window.recommendation;
  if(typeof originalRecommendation!=='function') return;
  window.recommendation=function(ex,r){
    const base=originalRecommendation(ex,r);
    if(base) return base;
    const rows=Array.from({length:ex[1]},(_,s)=>({kg:Number(r?.['kg'+s]),reps:Number(r?.['reps'+s])}));
    const filled=rows.filter(x=>x.kg>0&&x.reps>0).length;
    if(!filled) return '<div class="progressTip waiting">📊 <b>AVALIAÇÃO DE CARGA</b><small>Preencha as séries com kg e repetições para avaliar se deve subir, manter ou baixar a carga.</small></div>';
    return '<div class="progressTip partial">📊 <b>AVALIAÇÃO EM ANDAMENTO</b><small>Preencha as '+ex[1]+' séries para definir: subir, manter ou baixar a carga.</small></div>';
  };
  const css=document.createElement('style');
  css.textContent='.progressTip.waiting{border:1px solid #dfe5eb;background:#f7f9fb;color:#465565}.progressTip.waiting b,.progressTip.waiting small{display:block}.progressTip.waiting small{margin-top:3px}.progressTip.partial{display:block}';
  document.head.appendChild(css);
})();
