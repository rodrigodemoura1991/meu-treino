(async()=>{
  try{
    const r=await fetch('app.js?v=20260901corev9',{cache:'no-store'});
    let code=await r.text();
    code=code.replace("['Crucifixo inverso',3,'12–15']","['Crucifixo inverso na polia',3,'12–15']");
    code=code.replace("['Panturrilha sentado',4,'12–15']","['Panturrilha sentado',4,'12–15'],['Panturrilha no leg horizontal',4,'12–15']");
    code=code.replace("'Crucifixo inverso':60","'Crucifixo inverso':60,'Crucifixo inverso na polia':75,'Panturrilha no leg horizontal':75");
    (0,eval)(code);
    const scripts=['final-clean-fix.js','coach-live.js','coach-openai.js','session-state-fix.js','history-edit-modal.js','rest-timer-fix.js','exercise-images-fix.js','save-handler-v7.js','extra-exercises-v9.js'];
    for(const name of scripts){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=name+'?v=20260901savev9';s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
  }catch(e){console.error('[app-bootstrap-v9]',e);document.body.innerHTML='<div style="padding:30px;font-family:system-ui">Não foi possível carregar o MEU TREINO. Recarregue a página.</div>'}
})();
