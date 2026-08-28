/* MEU TREINO — Exercise image compatibility FINAL */
(()=>{
  'use strict';
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const titleOf=card=>clean(card?.querySelector('.exname,h1,h2,h3,h4,h5,strong')?.textContent||'').replace(/^\d+\.\s*/,'');
  const styleImage=img=>{
    if(!img)return;
    img.style.width='100%';
    img.style.height='100%';
    img.style.objectFit='contain';
    img.style.display='block';
    img.style.padding='4px';
    img.loading='lazy';
    img.decoding='async';
  };
  const addOrFix=card=>{
    if(!card)return;
    const name=titleOf(card);
    const guide=(window.EXERCISE_GUIDES||{})[name];
    const head=card.querySelector('.exhead')||card.firstElementChild;
    if(!head)return;

    // The app already renders the exercise image. Keep ONE image only.
    const imgs=[...head.querySelectorAll('img')];
    if(imgs.length){
      imgs.forEach(styleImage);
      imgs.slice(1).forEach(img=>{
        const wrap=img.closest('.meu-exercise-thumb,.ex-title-wrap,.exercise-image,.eximg,.thumb');
        if(wrap && wrap!==head) wrap.remove(); else img.remove();
      });
    } else if(guide?.image){
      const wrap=document.createElement('div');
      wrap.className='meu-exercise-thumb';
      wrap.style.cssText='width:78px;height:78px;min-width:78px;border:1px solid #e1e7ed;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-right:12px;flex:0 0 auto;box-shadow:0 2px 7px rgba(24,34,45,.05);';
      const img=document.createElement('img');
      img.src=guide.image;img.alt=name;styleImage(img);img.onerror=()=>wrap.remove();wrap.appendChild(img);
      const titleBlock=document.createElement('div');
      titleBlock.className='meu-exhead-titleblock';
      titleBlock.style.cssText='min-width:0;flex:1;';
      while(head.firstChild)titleBlock.appendChild(head.firstChild);
      head.insertBefore(wrap,head.firstChild);
      head.appendChild(titleBlock);
    }

    head.style.display='flex';
    head.style.alignItems='flex-start';
    head.style.gap='10px';

    const remainingImg=head.querySelector('img');
    if(remainingImg){
      const wrap=remainingImg.closest('.meu-exercise-thumb,.ex-title-wrap,.exercise-image,.eximg,.thumb');
      if(wrap){wrap.style.width='78px';wrap.style.height='78px';wrap.style.minWidth='78px';wrap.style.flex='0 0 78px';wrap.style.borderRadius='14px';wrap.style.overflow='hidden';wrap.style.display='flex';wrap.style.alignItems='center';wrap.style.justifyContent='center';wrap.style.background='#fff';wrap.style.border='1px solid #e1e7ed';wrap.style.marginRight='2px';}
    }
  };
  const scan=()=>document.querySelectorAll('.exercise').forEach(addOrFix);
  scan();
  const mo=new MutationObserver(scan);
  mo.observe(document.body,{childList:true,subtree:true});
})();