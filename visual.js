/* Visual claro + fotos reais dos exercícios. Camada independente do sistema de treino. */
(function(){
  const P={
    'Abdominal máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/Training_Hard.jpg',
    'Pêndulo':'https://commons.wikimedia.org/wiki/Special:FilePath/Unilateral_barbell_back_squat_squatting.jpg',
    'Cadeira extensora':'https://commons.wikimedia.org/wiki/Special:FilePath/LegExtensionMachineExercise.JPG',
    'Stiff com barra ou halteres':'https://commons.wikimedia.org/wiki/Special:FilePath/Unilateral_barbell_back_squat_standing.jpg',
    'Supino inclinado com halteres':'https://commons.wikimedia.org/wiki/Special:FilePath/Personal_training_dumbbell_chest_press.jpg',
    'Supino reto máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/Girl_doing_chest_press_machine_exercise.jpg',
    'Crucifixo máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
    'Barra fixa ou puxada neutra':'https://commons.wikimedia.org/wiki/Special:FilePath/Pull_up_down.jpg',
    'Remada articulada com apoio no peito':'https://commons.wikimedia.org/wiki/Special:FilePath/Back_Pull_down.jpg',
    'Remada unilateral na polia':'https://commons.wikimedia.org/wiki/Special:FilePath/Back_Pull_Down.jpg',
    'PULLDOWN':'https://commons.wikimedia.org/wiki/Special:FilePath/Back_Pull_Down.jpg',
    'Rosca direta com barra W':'https://commons.wikimedia.org/wiki/Special:FilePath/Wide_grip_standing_biceps_curl_with_barbell_2.svg',
    'Rosca inclinada com halteres':'https://commons.wikimedia.org/wiki/Special:FilePath/Young_attractive_man_athlete_doing_exercise_with_the_barbell_in_the_gym.jpg',
    'Rosca martelo com halteres':'https://commons.wikimedia.org/wiki/Special:FilePath/Young_attractive_man_athlete_doing_exercise_with_the_barbell_in_the_gym.jpg',
    'Leg press 45°':'https://commons.wikimedia.org/wiki/Special:FilePath/Leg_press.jpg',
    'Elevação pélvica':'https://commons.wikimedia.org/wiki/Special:FilePath/Hip_thrust.jpg',
    'Cadeira flexora bilateral':'https://commons.wikimedia.org/wiki/Special:FilePath/Seated-leg-curl-1.png',
    'Mesa flexora':'https://commons.wikimedia.org/wiki/Special:FilePath/LyingLegCurlMachineExercise.JPG',
    'Desenvolvimento máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_press_machine.jpg',
    'Elevação lateral na polia':'https://commons.wikimedia.org/wiki/Special:FilePath/Cable-seated-rear-lateral-raise-2.png',
    'Crucifixo inverso máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/Cable-seated-rear-lateral-raise-2.png',
    'Panturrilha em pé ou no leg press':'https://commons.wikimedia.org/wiki/Special:FilePath/Standing_calf_raise.jpg',
    'Supino reto com barra':'https://commons.wikimedia.org/wiki/Special:FilePath/Bench_press.jpg',
    'Supino inclinado máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/Chest_Incline.jpg',
    'Crossover de baixo para cima':'https://commons.wikimedia.org/wiki/Special:FilePath/Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
    'Tríceps francês unilateral na polia':'https://commons.wikimedia.org/wiki/Special:FilePath/Triceps_pushdown.jpg',
    'Tríceps barra V':'https://commons.wikimedia.org/wiki/Special:FilePath/Triceps_pushdown.jpg',
    'Tríceps testa com barra W':'https://commons.wikimedia.org/wiki/Special:FilePath/Skullcrusher.jpg',
    'Hack squat':'https://commons.wikimedia.org/wiki/Special:FilePath/Hack_squat.jpg',
    'Flexora unilateral':'https://commons.wikimedia.org/wiki/Special:FilePath/Seated-leg-curl-1.png',
    'Remada baixa triângulo':'https://commons.wikimedia.org/wiki/Special:FilePath/Seated_cable_row.jpg',
    'Puxada alta pronada':'https://commons.wikimedia.org/wiki/Special:FilePath/Lat_pulldown.jpg',
    'Elevação lateral':'https://commons.wikimedia.org/wiki/Special:FilePath/DumbbellLateralRaise.JPG',
    'Rosca Scott máquina':'https://commons.wikimedia.org/wiki/Special:FilePath/PreacherBenchBicepsCurl.gif',
    'Tríceps corda':'https://commons.wikimedia.org/wiki/Special:FilePath/Triceps_pushdown.jpg',
    'Panturrilha':'https://commons.wikimedia.org/wiki/Special:FilePath/Standing_calf_raise.jpg',
    'Crucifixo inverso':'https://commons.wikimedia.org/wiki/Special:FilePath/Lying-rear-lateral-raise-1.png',
    'Rosca martelo':'https://commons.wikimedia.org/wiki/Special:FilePath/Young_attractive_man_athlete_doing_exercise_with_the_barbell_in_the_gym.jpg'
  };
  const css=`
    :root{--bg:#f4f6f8!important;--panel:#fff!important;--panel2:#f9fafb!important;--line:#dfe4ea!important;--text:#17212b!important;--muted:#66717d!important;--accent:#e85d04!important;--accent2:#ff7a22!important}
    html,body{background:#f4f6f8!important;color:#17212b!important}
    body{background:linear-gradient(180deg,#eef2f5 0,#fff 55%,#f2f4f6 100%)!important}
    .top{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #dfe4ea!important;box-shadow:0 2px 12px rgba(20,30,40,.07)!important}
    .status{background:#fff1e8!important;color:#b84d00!important}.status.on{background:#eaf8ef!important;color:#15803d!important}
    .hero,.card,.exercise,.stat{background:#fff!important;border-color:#dfe4ea!important;box-shadow:0 4px 16px rgba(20,30,40,.05)!important}
    .exercise{padding:12px!important}
    .exhead{align-items:center!important;justify-content:flex-start!important}
    .exercise-photo{display:flex!important;flex:0 0 104px!important;width:104px!important;height:86px!important;border-radius:12px!important;overflow:hidden!important;background:#e9edf2!important;border:1px solid #d7dde4!important;position:relative!important}
    .exercise-photo img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
    .exercise-info{min-width:0!important;flex:1!important}.exname{color:#17212b!important}.meta{color:#66717d!important}
    .tag{background:#fff1e8!important;color:#b84d00!important}
    .setno{background:#eef1f4!important;color:#64707c!important}.field,.metrics input,.metrics select,.select{background:#fff!important;color:#17212b!important;border-color:#cfd6de!important}
    .obs,.notes{background:#fbfcfd!important;color:#17212b!important;border-color:#d7dde4!important}
    .secondary{background:#eef1f4!important;color:#374151!important}.footnav{background:rgba(255,255,255,.98)!important;border-color:#dfe4ea!important}
    .visual-photo-fallback{display:grid!important;place-items:center!important;width:100%;height:100%;font-size:28px;background:#e9edf2}
    @media(max-width:430px){.exercise-photo{flex-basis:88px!important;width:88px!important;height:76px!important}.exname{font-size:15px!important}}
  `;
  const style=document.createElement('style');style.id='visual-theme';style.textContent=css;document.head.appendChild(style);
  function enhance(){
    document.querySelectorAll('.exercise').forEach(card=>{
      if(card.querySelector('.exercise-photo'))return;
      const title=card.querySelector('.exname');if(!title)return;
      const name=title.textContent.replace(/^\d+\.\s*/,'').trim();
      const url=P[name];
      const photo=document.createElement('div');photo.className='exercise-photo';
      const img=document.createElement('img');img.alt='Foto real de '+name;img.loading='lazy';
      img.src=url||P['Abdominal máquina'];
      img.onerror=function(){photo.innerHTML='<div class="visual-photo-fallback">🏋️</div>'};
      photo.appendChild(img);
      const info=document.createElement('div');info.className='exercise-info';
      const old=title.parentElement;
      info.appendChild(title);Array.from(old.children).slice(0).forEach(el=>{if(el!==title)info.appendChild(el)});
      const head=card.querySelector('.exhead');head.innerHTML='';head.append(photo,info);
    });
  }
  const obs=new MutationObserver(enhance);obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();
