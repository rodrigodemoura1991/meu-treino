// Login robusto fix6: recria o cliente Supabase com lock local e evita travamentos do auth.
(function(){
  const URL='https://uvujytjdafcyacawcirp.supabase.co';
  const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  function init(){
    if(!window.supabase || typeof window.supabase.createClient!=='function') return setTimeout(init,100);
    try{
      sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:async function(_name,_timeout,fn){return await fn();}}});
      status('☁ Conexão pronta',true);
    }catch(e){console.error(e);status('⚠ Falha na conexão',false);}
  }
  window.signIn=async function(){
    const e=document.getElementById('email')?.value.trim(),p=document.getElementById('password')?.value||'';
    if(!e||!p)return alert('Informe e-mail e senha.');
    if(!sb)return alert('A conexão ainda não carregou. Atualize a página.');
    const btn=document.querySelector('.loginbtn');if(btn){btn.disabled=true;btn.textContent='CONECTANDO...'}
    try{
      const r=await Promise.race([sb.auth.signInWithPassword({email:e,password:p}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('TIMEOUT')),12000))]);
      if(r?.error)throw r.error;
      user=r.data.user;status('☁ Online • login OK',true);render();
      try{await Promise.race([cloudLoad(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('LOAD_TIMEOUT')),10000))]);status('☁ Online • salvo',true);render();}
      catch(err){console.warn(err);status('☁ Online • login OK',true);render();}
    }catch(err){console.error('Login fix6:',err);alert(err?.message==='TIMEOUT'?'A autenticação demorou mais de 12 segundos. O servidor está acessível, mas o navegador não concluiu a resposta.':'Não foi possível entrar: '+(err?.message||'erro desconhecido'));}
    finally{if(btn){btn.disabled=false;btn.textContent='ENTRAR'}}
  };
  init();
})();
