// Corrige o login quando a consulta da nuvem fica pendurada.
(function(){
  window.signIn=async function(){
    const e=document.getElementById('email')?.value.trim();
    const p=document.getElementById('password')?.value||'';
    if(!e||!p)return alert('Informe e-mail e senha.');
    if(!sb)return alert('A conexão ainda não carregou. Recarregue a página.');
    const btn=document.querySelector('.loginbtn');
    if(btn){btn.disabled=true;btn.textContent='ENTRANDO...'}
    try{
      const r=await sb.auth.signInWithPassword({email:e,password:p});
      if(r.error){alert(r.error.message);return}
      user=r.data.user;
      if(typeof status==='function')status('☁ Conectando…',true);
      // Mostra o aplicativo imediatamente; a nuvem sincroniza em segundo plano.
      if(typeof render==='function')render();
      const cloudPromise=(typeof cloudLoad==='function')?cloudLoad():Promise.resolve();
      await Promise.race([cloudPromise,new Promise(resolve=>setTimeout(resolve,5000))]);
      if(typeof render==='function')render();
      if(typeof status==='function' && !cloudReady)status('☁ Offline/local',false);
    }catch(err){
      console.error('Erro no login:',err);
      if(typeof render==='function')render();
      alert('Login realizado, mas a sincronização com a nuvem demorou. O treino continua disponível e será sincronizado quando a conexão voltar.');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='ENTRAR'}
    }
  };
})();
