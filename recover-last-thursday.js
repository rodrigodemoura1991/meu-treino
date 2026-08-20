/* Recuperação do último registro de quinta-feira.
   Busca o último treino salvo na nuvem e recoloca no treino atual sem alterar o histórico. */
(function(){
  async function recover(){
    try{
      if(typeof window.sb==='undefined'||!window.sb) return;
      const session=await window.sb.auth.getSession();
      const user=session?.data?.session?.user;
      if(!user)return;
      const {data:rows,error}=await window.sb.from('workout_logs')
        .select('log_key,payload,workout_date')
        .like('log_key','resetv1|Quinta|%')
        .order('workout_date',{ascending:false})
        .limit(1);
      if(error||!rows?.length||!rows[0].payload)return;
      const item=rows[0];
      window.data.logs[item.log_key.replace('resetv1|','')]=item.payload;
      try{localStorage.setItem('meu_treino_reset_v1',JSON.stringify(window.data))}catch(e){}
      window.current='Quinta';
      if(typeof window.render==='function')window.render();
    }catch(e){console.error('recover Thursday',e)}
  }
  setTimeout(recover,1800);
  setTimeout(recover,5000);
})();
