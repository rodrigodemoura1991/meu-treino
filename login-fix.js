// Login robusto: evita ficar preso em ENTRANDO quando a rede/Supabase demora.
(function(){
  window.signIn=async function(){
    const e=document.getElementById('email')?.value.trim();
    const p=document.getElementById('password')?.value||'';
    if(!e||!p)return alert('Informe e-mail e senha.');
    if(!window.supabase || !sb)return alert('A conexão online ainda não carregou. Recarregue a página e tente novamente.');
    const btn=document.querySelector('.loginbtn');
    if(btn){btn.disabled=true;btn.textContent='CONECTANDO...'}
    const timeout=(ms)=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('TIMEOUT')),ms));
    try{
      const r=await Promise.race([sb.auth.signInWithPassword({email:e,password:p}),timeout(10000)]);
      if(r?.error){alert(r.error.message||'Não foi possível entrar.');return}
      user=r.data.user;
      if(typeof status==='function')status('☁ Conectando…',true);
      if(typeof render==='function')render();
      if(typeof cloudLoad==='function'){
        Promise.race([cloudLoad(),timeout(8000)]).then(()=>{
          if(typeof render==='function')render();
          if(typeof status==='function'&&!cloudReady)status('☁ Offline/local',false);
        }).catch(()=>{
          if(typeof render==='function')render();
          if(typeof status==='function')status('☁ Online • login OK / nuvem aguardando',true);
        });
      }
    }catch(err){
      console.error('Erro no login:',err);
      if(err?.message==='TIMEOUT')alert('A conexão com a nuvem demorou mais que o esperado. Verifique sua internet e tente novamente.');
      else alert('Não foi possível concluir o login. Verifique o e-mail e a senha.');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='ENTRAR'}
    }
  };
})();
