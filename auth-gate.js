// Bloqueia o aplicativo até que exista uma sessão autenticada.
// O usuário Jaco pode entrar digitando apenas "jaco"; jaco-access.js converte para o e-mail técnico.
(function(){
  const style = document.createElement('style');
  style.textContent = `
    #authGate{position:fixed;inset:0;z-index:99999;background:#090c11;color:#f4f7fb;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Arial,sans-serif}
    #authGate .box{width:min(420px,100%);background:#111720;border:1px solid #263244;border-radius:24px;padding:28px;box-shadow:0 24px 70px rgba(0,0,0,.45)}
    #authGate h1{margin:0 0 6px;font-size:30px;font-weight:800}
    #authGate p{margin:0 0 24px;color:#9eabbc;font-size:15px}
    #authGate label{display:block;margin:14px 0 7px;color:#aeb9c8;font-size:13px;font-weight:700}
    #authGate input{box-sizing:border-box;width:100%;height:52px;border:1px solid #334156;border-radius:14px;background:#0b1017;color:#fff;padding:0 15px;font-size:17px;outline:none}
    #authGate input:focus{border-color:#ff7414}
    #authGate button{width:100%;height:54px;margin-top:20px;border:0;border-radius:14px;background:#ff7414;color:#fff;font-size:17px;font-weight:800}
    #authGate .msg{min-height:20px;margin-top:12px;color:#ff9b68;font-size:13px;text-align:center}
    #authGate .brand{color:#ff7414;font-weight:900;letter-spacing:2px;margin-bottom:18px}
  `;
  document.head.appendChild(style);

  function removeGate(){
    const g=document.getElementById('authGate');
    if(g) g.remove();
    try{ if(typeof window.render==='function') window.render(); }catch(e){}
  }

  function showGate(){
    if(document.getElementById('authGate')) return;
    const g=document.createElement('div');
    g.id='authGate';
    g.innerHTML=`<div class="box">
      <div class="brand">MEU TREINO</div>
      <h1>Entrar</h1>
      <p>Acesse seu treino e mantenha seus registros salvos na nuvem.</p>
      <label for="email">Usuário ou e-mail</label>
      <input id="email" type="text" autocomplete="username" placeholder="Usuário ou e-mail">
      <label for="password">Senha</label>
      <input id="password" type="password" autocomplete="current-password" placeholder="Senha">
      <button id="loginBtn" type="button">ENTRAR</button>
      <div class="msg" id="authMsg"></div>
    </div>`;
    document.body.appendChild(g);
    const email=g.querySelector('#email'), pass=g.querySelector('#password'), btn=g.querySelector('#loginBtn');
    const submit=async()=>{
      if(!email.value.trim()||!pass.value){g.querySelector('#authMsg').textContent='Informe usuário e senha.';return;}
      try{
        if(typeof window.signIn!=='function'){g.querySelector('#authMsg').textContent='Carregando conexão...';return;}
        await window.signIn();
      }catch(e){g.querySelector('#authMsg').textContent=e?.message||'Não foi possível entrar.';}
    };
    btn.onclick=submit;
    pass.addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
    setTimeout(()=>email.focus(),100);
  }

  async function check(){
    try{
      if(!window.supabase || typeof window.supabase.createClient!=='function') return;
      if(typeof window.SUPABASE_URL==='undefined') return;
    }catch(e){return}
  }

  // app.js mantém o cliente Supabase em escopo local; usamos o cliente próprio com as mesmas credenciais.
  const URL='https://uvujytjdafcyacawcirp.supabase.co';
  const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  let client=null;
  try{client=window.supabase?.createClient(URL,KEY)}catch(e){}

  async function sync(){
    if(!client) return;
    try{
      const {data}=await client.auth.getSession();
      if(data?.session) removeGate(); else showGate();
    }catch(e){showGate()}
  }

  if(client){
    client.auth.onAuthStateChange((_event,session)=>{
      if(session) removeGate(); else showGate();
    });
    sync();
  }else{
    setTimeout(sync,500);
  }
})();
