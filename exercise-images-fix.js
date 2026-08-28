/* MEU TREINO — Exercise image + rest timer compatibility */
(()=>{
  'use strict';

  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const titleOf=card=>{
    const el=card?.querySelector('.exname,h1,h2,h3,h4,h5,strong');
    return clean(el?.textContent||'').replace(/^\d+\.\s*/,'');
  };

  const addImage=card=>{
    if(!card || card.querySelector('.meu-exercise-thumb')) return;
    const name=titleOf(card);
    const guide=(window.EXERCISE_GUIDES||{})[name];
    if(!guide?.image) return;

    const head=card.querySelector('.exhead')||card.firstElementChild;
    if(!head) return;

    const wrap=document.createElement('div');
    wrap.className='meu-exercise-thumb';
    wrap.setAttribute('aria-label',`Imagem de ${name}`);
    wrap.style.cssText='width:64px;height:64px;min-width:64px;border:1px solid #e1e7ed;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-right:10px;flex:0 0 auto;';

    const img=document.createElement('img');
    img.src=guide.image;
    img.alt=name;
    img.loading='lazy';
    img.decoding='async';
    img.style.cssText='width:100%;height:100%;object-fit:contain;display:block;padding:3px;';
    img.onerror=()=>wrap.remove();
    wrap.appendChild(img);

    const originalStyle=head.getAttribute('style')||'';
    if(!head.classList.contains('meu-exhead-with-image')){
      head.classList.add('meu-exhead-with-image');
      head.style.display='flex';
      head.style.alignItems='flex-start';
    }
    const titleBlock=document.createElement('div');
    titleBlock.className='meu-exhead-titleblock';
    titleBlock.style.cssText='min-width:0;flex:1;';
    while(head.firstChild) titleBlock.appendChild(head.firstChild);
    head.appendChild(wrap);
    head.appendChild(titleBlock);
  };

  const scan=()=>document.querySelectorAll('.exercise').forEach(addImage);
  scan();
  const mo=new MutationObserver(scan);
  mo.observe(document.body,{childList:true,subtree:true});
})();
