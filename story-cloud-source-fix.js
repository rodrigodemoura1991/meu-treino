/* STORY CLOUD SOURCE FIX — 2026-08-19
   Fonte oficial do Story: workout_logs no Supabase.
   Não grava nada no histórico/localStorage; injeta somente o payload em memória
   e entrega ao gerador visual já existente.
*/
(function(){
  const URL='https://uvujytjdafcyacawcirp.supabase.co';
  const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  let client=null;
  function getClient(){
    try{ if(!client && window.supabase?.createClient) client=window.supabase.createClient(URL,KEY); }catch(e){ console.error(e); }
    return client;
  }
  function selectedDate(){
    for(const id of ['storyDate2','reportStoryDate','periodReportDate']){
      const el=document.getElementById(id);
      if(el?.value) return String(el.value).slice(0,10);
    }
    return null;
  }
  async function cloudLog(date){
    const c=getClient();
    if(!c||!date) return null;
    const {data:rows,error}=await c.from('workout_logs')
      .select('log_key,payload,workout_date,updated_at')
      .eq('workout_date',date)
      .order('updated_at',{ascending:false})
      .limit(1);
    if(error){console.error('Story cloud query:',error);return null;}
    const row=rows?.[0];
    return row?.payload?.date===date ? row : null;
  }
  async function generateFromCloud(){
    const date=selectedDate();
    if(!date){alert('Selecione uma data do treino.');return;}
    const row=await cloudLog(date);
    if(!row){
      alert('Não encontrei o treino salvo na nuvem para '+date.split('-').reverse().join('/')+'.');
      return;
    }
    try{
      const tempKey='__story_cloud__'+date;
      if(typeof data==='undefined'||!data.logs) throw new Error('Dados do app ainda não carregaram.');
      data.logs[tempKey]=row.payload;
      if(typeof window.generateStoryForLog==='function'){
        await window.generateStoryForLog(tempKey);
      }else if(typeof window.realInstagramStory==='function'){
        await window.realInstagramStory();
      }else{
        throw new Error('Gerador visual não carregou.');
      }
      delete data.logs[tempKey];
    }catch(e){
      console.error('Story cloud source:',e);
      try{delete data.logs['__story_cloud__'+date]}catch(_){ }
      alert('Não foi possível montar o Story com o registro da nuvem.');
    }
  }
  window.generateStory=generateFromCloud;
  window.realInstagramStory=generateFromCloud;
})();
