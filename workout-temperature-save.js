/* WORKOUT TEMPERATURE SAVE — 2026-08-19
   Captura a temperatura real no início do treino e grava no próprio registro.
   Usa geolocalização do aparelho quando autorizada; fallback: Francisco Beltrão/PR.
*/
(function(){
  const FALLBACK={lat:-26.081,lon:-53.053};
  const cache={};
  let originalStart=null;
  let originalSetVal=null;
  let originalSave=null;

  function keyToday(){
    if(typeof current==='undefined'||typeof today!=='function'||typeof key!=='function')return null;
    return key(current,today());
  }
  function getLog(){
    try{const k=keyToday();return k&&typeof data!=='undefined'?data.logs?.[k]:null}catch(e){return null}
  }
  function location(){
    return new Promise(resolve=>{
      if(!navigator.geolocation)return resolve(FALLBACK);
      navigator.geolocation.getCurrentPosition(
        p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude}),
        ()=>resolve(FALLBACK),
        {enableHighAccuracy:false,timeout:5000,maximumAge:300000}
      );
    });
  }
  async function fetchTemperature(){
    const now=new Date();
    const slot=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+'T'+String(now.getHours()).padStart(2,'0');
    if(cache[slot])return cache[slot];
    const pos=await location();
    const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(pos.lat)+'&longitude='+encodeURIComponent(pos.lon)+'&current=temperature_2m&timezone=auto';
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok)throw new Error('Falha ao consultar temperatura');
    const json=await res.json();
    const temp=Number(json?.current?.temperature_2m);
    if(!Number.isFinite(temp))throw new Error('Temperatura indisponível');
    const value=Math.round(temp*10)/10;
    cache[slot]=value;
    return value;
  }
  async function capture(force){
    const l=getLog();
    if(!l)return;
    if(l.temperature!=null && String(l.temperature).trim()!=='' && !force)return l.temperature;
    try{
      const value=await fetchTemperature();
      l.temperature=value+' °C';
      l.temperatureAt=new Date().toISOString();
      if(typeof localSave==='function')localSave();
      if(typeof queueSave==='function')queueSave(keyToday());
      if(typeof updateWorkoutSummary==='function')updateWorkoutSummary();
      return l.temperature;
    }catch(e){console.warn('Temperatura do treino:',e);return null}
  }

  function install(){
    if(typeof window.startWorkout==='function'&&!originalStart){
      originalStart=window.startWorkout;
      window.startWorkout=function(){
        const result=originalStart.apply(this,arguments);
        setTimeout(()=>capture(false),80);
        return result;
      };
    }
    if(typeof window.setVal==='function'&&!originalSetVal){
      originalSetVal=window.setVal;
      window.setVal=function(){
        const result=originalSetVal.apply(this,arguments);
        const l=getLog();
        if(l&&!l.temperature) setTimeout(()=>capture(false),80);
        return result;
      };
    }
    if(typeof window.save==='function'&&!originalSave){
      originalSave=window.save;
      window.save=function(k){
        const result=originalSave.apply(this,arguments);
        if(k&&typeof today==='function'&&k.endsWith('|'+today())){
          const l=typeof data!=='undefined'?data.logs?.[k]:null;
          if(l&&!l.temperature)setTimeout(()=>capture(false),80);
        }
        return result;
      };
    }
  }
  install();
  setTimeout(install,500);
  setTimeout(install,1500);
  window.captureWorkoutTemperature=capture;
})();
