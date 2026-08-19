/* Bridge para o gerador de Story acessar o estado do app sem duplicar dados. */
(function(){
  try{
    Object.defineProperty(window,'__meuTreinoState',{configurable:true,get:()=>({data,current,workouts})});
  }catch(e){console.error('story bridge',e)}
})();
