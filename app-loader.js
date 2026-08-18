/* Loader de recuperação: corrige o erro de sintaxe conhecido do app.js antes de executá-lo. */
(async()=>{
  try{
    const r=await fetch('app.js?v=20260818fix1',{cache:'no-store'});
    if(!r.ok) throw new Error('Não foi possível carregar app.js ('+r.status+')');
    let src=await r.text();
    const bad="headers:{Authorization:'Bearer '+t})";
    const fixed="headers:{Authorization:'Bearer '+t}})";
    if(src.includes(bad)) src=src.replace(bad,fixed);
    const blob=new Blob([src],{type:'text/javascript'});
    const s=document.createElement('script');
    s.src=URL.createObjectURL(blob);
    s.onload=()=>URL.revokeObjectURL(s.src);
    s.onerror=()=>{throw new Error('Falha ao executar o app.js corrigido')};
    document.body.appendChild(s);
  }catch(e){
    console.error('App loader',e);
    const app=document.getElementById('app');
    if(app) app.innerHTML='<section style="max-width:720px;margin:40px auto;padding:28px;background:#fff;border-radius:20px;text-align:center;font-family:system-ui"><h2>⚠️ Falha ao carregar</h2><p>Atualize esta página uma vez. Seus dados locais permanecem preservados.</p><button onclick="location.reload()" style="padding:12px 22px;border:0;border-radius:12px;background:#f47721;color:#fff;font-weight:700">Atualizar</button></section>';
    const st=document.getElementById('cloudStatus');
    if(st) st.textContent='⚠ Erro de carregamento';
  }
})();
