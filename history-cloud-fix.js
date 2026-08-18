/* Sincronização robusta do histórico/relatórios com a nuvem */
(function(){
  const URL='https://uvujytjdafcyacawcirp.supabase.co';
  const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  const PREFIX='resetv1|';
  let syncing=false,lastSync=0;
  async function sync(){
    if(syncing||Date.now()-lastSync<1500)return false;
    syncing=true;
    try{
      const client=window.supabase?.createClient(URL,KEY);
      if(!client)return false;
      const session=await client.auth.getSession();
      if(!session?.data?.session?.user)return false;
      const q=await client.from('workout_logs').select('log_key,payload').like('log_key',PREFIX+'%').order('workout_date',{ascending:false});
      if(q.error)throw q.error;
      const local=JSON.parse(localStorage.getItem('meu_treino_reset_v1')||'{"logs":{}}');
      local.logs=local.logs||{};
      (q.data||[]).forEach(r=>{if(r.payload&&r.log_key)local.logs[r.log_key.replace(PREFIX,'')]=r.payload});
      localStorage.setItem('meu_treino_reset_v1',JSON.stringify(local));
      if(typeof data!=='undefined'){
        const before=Object.keys(data.logs||{}).length;
        data.logs=local.logs;
        if(typeof setStatus==='function')setStatus('☁ Online • salvo',true);
        lastSync=Date.now();
        return Object.keys(data.logs||{}).length!==before;
      }
      lastSync=Date.now();
      return false;
    }catch(e){console.error('history cloud sync',e);return false}
    finally{syncing=false}
  }
  const oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){
      oldRender();
      const active=document.querySelector('.nav button.active')?.textContent||'';
      if(/Histórico|Relatórios/.test(active)){
        sync().then(changed=>{if(changed)oldRender()});
      }
    };
  }
  window.syncWorkoutHistory=sync;
})();
