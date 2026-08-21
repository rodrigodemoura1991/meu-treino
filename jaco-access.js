// Acesso amigável para o usuário de teste Jaco.
// O login continua sendo validado pelo Supabase Auth; apenas aceitamos "jaco" como apelido do e-mail técnico.
(function(){
  const JACO_EMAIL='jaco@meutreino.app';
  function patch(){
    if(typeof window.signIn!=='function') return false;
    if(window.signIn.__jacoPatched) return true;
    const original=window.signIn;
    const wrapped=async function(){
      const field=document.getElementById('email');
      if(field && field.value.trim().toLowerCase()==='jaco') field.value=JACO_EMAIL;
      return original();
    };
    wrapped.__jacoPatched=true;
    window.signIn=wrapped;
    return true;
  }
  const observer=new MutationObserver(()=>{
    const field=document.getElementById('email');
    if(field){
      field.placeholder='Usuário ou e-mail';
      field.autocomplete='username';
    }
    patch();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  const timer=setInterval(()=>{ if(patch()){clearInterval(timer)} },100);
  setTimeout(()=>clearInterval(timer),15000);
})();
