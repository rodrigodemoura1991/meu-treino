(async()=>{
  try{
    const r=await fetch('app.js?v=20260901corev9',{cache:'no-store'});
    let code=await r.text();
    code=code.replace("['Crucifixo inverso',3,'12–15']","['Crucifixo inverso na polia',3,'12–15']");
    code=code.replace("['Panturrilha sentado',4,'12–15']","['Panturrilha sentado',4,'12–15'],['Panturrilha no leg horizontal',4,'12–15']");
    code=code.replace("'Crucifixo inverso':60","'Crucifixo inverso':60,'Crucifixo inverso na polia':75,'Panturrilha no leg horizontal':75");
    (0,eval)(code);
  }catch(e){console.error('[app-bootstrap-v9]',e);document.body.innerHTML='<div style="padding:30px;font-family:system-ui">Não foi possível carregar o MEU TREINO. Recarregue a página.</div>'}
})();
