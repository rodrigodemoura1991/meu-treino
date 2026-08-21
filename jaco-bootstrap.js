// Provisiona uma única vez a conta compartilhável do Jaco no Supabase.
// A função no servidor só cria o usuário se ele ainda não existir; não redefine senha depois.
(function(){
  const url='https://uvujytjdafcyacawcirp.supabase.co/functions/v1/bootstrap-jaco?token=bVEkbd9ie05_YL0jtTggaWGvR7YUf7MCJpmx2ALmJtM';
  fetch(url,{method:'GET',cache:'no-store',credentials:'omit'}).catch(()=>{});
})();
