(()=>{
'use strict';
const DAY_NAMES=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
function goTo(target){if(typeof window.go==='function')window.go(target)}
document.addEventListener('click',e=>{
 const b=e.target.closest('button'); if(!b)return;
 const text=(b.textContent||'').trim();
 const day=DAY_NAMES.find(d=>text===d||text.includes(d.slice(0,3).toUpperCase()));
 if(day&&b.closest('.daystrip')){e.preventDefault();e.stopPropagation();goTo(day);return}
 if(text.includes('Histórico')&&b.closest('.nav,.bottomnav')){e.preventDefault();e.stopPropagation();goTo('Histórico');return}
 if(text.includes('Relatórios')&&b.closest('.nav,.bottomnav')){e.preventDefault();e.stopPropagation();goTo('Relatórios');return}
 if(text.includes('Dados')&&b.closest('.nav,.bottomnav')){e.preventDefault();e.stopPropagation();goTo('Dados');return}
 if(text.includes('Treino')&&b.closest('.nav,.bottomnav')){e.preventDefault();e.stopPropagation();goTo('Segunda');return}
},true);
const obs=new MutationObserver(()=>{
 document.querySelectorAll('.daystrip button,.nav button,.bottomnav button').forEach(b=>{b.style.pointerEvents='auto';b.style.cursor='pointer'})
});
obs.observe(document.body,{childList:true,subtree:true});
})();
