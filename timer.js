/* Cronometro de descanso por exercicio - Meu Treino */
(function(){
  const presets={
    'Abdominal máquina':60,
    'Pêndulo':120,
    'Cadeira extensora':75,
    'Stiff com barra ou halteres':120,
    'Supino inclinado com halteres':120,
    'Supino reto máquina':90,
    'Crucifixo máquina':75,
    'Barra fixa ou puxada neutra':120,
    'Remada articulada com apoio no peito':120,
    'Remada unilateral na polia':90,
    'PULLDOWN':90,
    'Rosca direta com barra W':75,
    'Rosca inclinada com halteres':75,
    'Rosca martelo com halteres':75,
    'Leg press 45°':120,
    'Elevação pélvica':120,
    'Cadeira flexora bilateral':90,
    'Mesa flexora':90,
    'Desenvolvimento máquina':90,
    'Elevação lateral na polia':60,
    'Crucifixo inverso máquina':60,
    'Panturrilha em pé ou no leg press':75,
    'Supino reto com barra':150,
    'Supino inclinado máquina':120,
    'Crossover de baixo para cima':75,
    'Tríceps francês unilateral na polia':75,
    'Tríceps barra V':75,
    'Tríceps testa com barra W':75,
    'Hack squat':120,
    'Flexora unilateral':90,
    'Remada baixa triângulo':120,
    'Puxada alta pronada':90,
    'Elevação lateral':60,
    'Rosca Scott máquina':75,
    'Tríceps corda':75,
    'Panturrilha':75,
    'Crucifixo inverso':60,
    'Rosca martelo':75
  };
  let active=null,interval=null,endAt=0;
  const fallback=90;
  const secFor=name=>presets[name]||fallback;
  const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  function stop(){if(interval){clearInterval(interval);interval=null}if(active){active.classList.remove('running')}active=null;endAt=0}
  function tick(){if(!active)return;const left=Math.max(0,Math.ceil((endAt-Date.now())/1000));const out=active.querySelector('.resttime');const btn=active.querySelector('button');if(out)out.textContent=fmt(left);if(btn)btn.textContent=left?'⏸ Pausar':'✓ Concluído';if(!left){if(navigator.vibrate)try{navigator.vibrate([180,80,180])}catch(e){}stop();if(out)out.textContent=fmt(Number(active.dataset.seconds||fallback));const b=active.querySelector('button');if(b)b.textContent='▶ Iniciar'}}
  function start(box){
    if(active===box){stop();const o=box.querySelector('.resttime');if(o)o.textContent=fmt(Number(box.dataset.seconds||fallback));const b=box.querySelector('button');if(b)b.textContent='▶ Iniciar';return}
    stop();active=box;active.classList.add('running');const seconds=Number(box.dataset.seconds||fallback);endAt=Date.now()+seconds*1000;tick();interval=setInterval(tick,250);
  }
  function install(){
    document.querySelectorAll('.exercise').forEach(card=>{
      if(card.querySelector('.resttimer'))return;
      const name=card.querySelector('.exname')?.textContent?.replace(/^\d+\.\s*/,'').trim();
      if(!name)return;
      const seconds=secFor(name);
      const head=card.querySelector('.exhead');
      if(!head)return;
      const box=document.createElement('div');box.className='resttimer';box.dataset.seconds=seconds;
      box.innerHTML='<span class="restlabel">DESCANSO</span><strong class="resttime">'+fmt(seconds)+'</strong><button type="button">▶ Iniciar</button>';
      box.querySelector('button').onclick=()=>start(box);
      head.appendChild(box);
    });
  }
  const css=document.createElement('style');
  css.textContent='.exhead{align-items:flex-start}.resttimer{flex:0 0 auto;min-width:116px;padding:8px 9px;border:1px solid #e3e8ef;border-radius:12px;background:#f7f9fb;text-align:center;display:grid;grid-template-columns:auto auto;gap:2px 7px;align-items:center}.resttimer .restlabel{grid-column:1/-1;font-size:8px;font-weight:800;letter-spacing:1px;color:#7b8797}.resttimer .resttime{font-size:17px;line-height:1.1;color:#182230}.resttimer button{border:0;border-radius:8px;padding:5px 7px;background:#fff;color:#d85f00;font-size:9px;font-weight:800;cursor:pointer}.resttimer.running{border-color:#f28a3a;background:#fff5ec}.resttimer.running .resttime{color:#e66000}@media(max-width:600px){.exhead{gap:8px}.resttimer{min-width:94px;padding:6px}.resttimer .resttime{font-size:15px}.resttimer button{font-size:8px;padding:5px 6px}}';
  document.head.appendChild(css);
  const obs=new MutationObserver(install);
  obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setInterval(install,1000);
})();
