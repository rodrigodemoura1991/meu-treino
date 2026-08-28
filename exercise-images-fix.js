/* MEU TREINO — Exercise image compatibility FINAL */
(()=>{
  'use strict';
  const style=()=>{
    document.querySelectorAll('.exercise').forEach(card=>{
      // This app already renders the exercise image through exercise-guides.js.
      // Remove only the duplicate image wrapper created by older compatibility fixes.
      card.querySelectorAll('.meu-exercise-thumb').forEach(el=>el.remove());

      const wrap=card.querySelector('.ex-title-wrap');
      if(!wrap)return;
      const btn=wrap.querySelector('.exercise-guide-thumb');
      if(!btn)return;

      wrap.style.display='flex';
      wrap.style.alignItems='center';
      wrap.style.gap='0';
      wrap.style.minWidth='0';
      wrap.style.flex='1';

      btn.style.width='88px';
      btn.style.height='72px';
      btn.style.minWidth='88px';
      btn.style.flex='0 0 88px';
      btn.style.margin='0 12px 0 0';
      btn.style.padding='0';
      btn.style.border='1px solid #e1e7ed';
      btn.style.borderRadius='14px';
      btn.style.background='#fff';
      btn.style.display='flex';
      btn.style.alignItems='center';
      btn.style.justifyContent='center';
      btn.style.overflow='hidden';
      btn.style.boxShadow='0 3px 10px rgba(24,34,45,.05)';

      const img=btn.querySelector('img');
      if(img){
        img.style.width='100%';
        img.style.height='100%';
        img.style.objectFit='contain';
        img.style.display='block';
        img.style.padding='4px';
        img.loading='lazy';
        img.decoding='async';
      }

      const title=wrap.querySelector(':scope > div');
      if(title){
        title.style.minWidth='0';
        title.style.flex='1';
      }
    });
  };
  style();
  new MutationObserver(style).observe(document.body,{childList:true,subtree:true});
})();
