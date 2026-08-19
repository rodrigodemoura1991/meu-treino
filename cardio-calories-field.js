/* CARDIO CALORIES — campo explícito para calorias gastas no cardio */
(function(){
  function install(){
    if(typeof window.setCardio!=='function'||typeof window.key!=='function'||typeof window.today!=='function')return;
    const existing=[...document.querySelectorAll('input')].some(i=>/calor.*cardio|cardio.*calor/i.test((i.closest('label')?.textContent||i.parentElement?.textContent||'').toLowerCase()));
    if(existing)return;
    const headings=[...document.querySelectorAll('h2,h3,h4,strong,b,label,div')].filter(e=>/\bCARDIO\b/i.test((e.textContent||'').trim())&&((e.textContent||'').trim().length<80));
    const head=headings.find(e=>/cardio/i.test(e.textContent||''));
    if(!head)return;
    let container=head.closest('.card,.panel,.section,section')||head.parentElement?.parentElement||head.parentElement;
    if(!container||container.querySelector('.mt-cardio-calories'))return;
    const wrap=document.createElement('div');wrap.className='mt-cardio-calories';wrap.style.cssText='margin-top:12px;padding:10px 0';
    const k=window.key(window.current,window.today());
    const l=typeof window.ensure==='function'?window.ensure(k,window.current,window.today()):null;
    const value=l?.cardio?.calories??'';
    wrap.innerHTML='<label style="display:block;font-size:12px;font-weight:800">🔥 CALORIAS GASTAS NO CARDIO<input id="cardioCaloriesSaved" type="number" min="0" step="1" inputmode="numeric" placeholder="Ex.: 126" value="'+String(value).replace(/"/g,'&quot;')+'" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;height:44px;border:1px solid #ccd5dd;border-radius:10px;padding:0 12px;font-size:17px"></label>';
    container.appendChild(wrap);
    wrap.querySelector('input').addEventListener('input',e=>{try{window.setCardio(k,'calories',e.target.value)}catch(err){console.warn(err)}});
  }
  window.addEventListener('load',()=>setTimeout(install,800));
  setInterval(install,1200);
})();
