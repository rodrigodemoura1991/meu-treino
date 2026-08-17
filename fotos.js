/* Fotos reais dos exercícios — fontes abertas via Wikimedia Commons. */
const EXERCISE_PHOTOS={
  'Abdominal máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Training_Hard.jpg',
  'Pêndulo':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Unilateral_barbell_back_squat_squatting.jpg',
  'Cadeira extensora':'https://commons.wikimedia.org/wiki/Special:Redirect/file/LegExtensionMachineExercise.JPG',
  'Stiff com barra ou halteres':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Unilateral_barbell_back_squat_standing.jpg',
  'Supino inclinado com halteres':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Personal_training_dumbbell_chest_press.jpg',
  'Supino reto máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Girl_doing_chest_press_machine_exercise.jpg',
  'Crucifixo máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
  'Barra fixa ou puxada neutra':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pull_up_down.jpg',
  'Remada articulada com apoio no peito':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Back_Pull_down.jpg',
  'Remada unilateral na polia':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Back_Pull_Down.jpg',
  'PULLDOWN':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Back_Pull_Down.jpg',
  'Rosca direta com barra W':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Wide_grip_standing_biceps_curl_with_barbell_2.svg',
  'Rosca inclinada com halteres':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Young_attractive_man_athlete_doing_exercise_with_the_barbell_in_the_gym.jpg',
  'Rosca martelo com halteres':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Young_attractive_man_athlete_doing_exercise_with_the_barbell_in_the_gym.jpg',
  'Leg press 45°':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Muscle_Strengthening_at_the_Gym_-_Seated_Leg_Press.webm',
  'Elevação pélvica':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Training_Hard.jpg',
  'Cadeira flexora bilateral':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Seated-leg-curl-1.png',
  'Mesa flexora':'https://commons.wikimedia.org/wiki/Special:Redirect/file/LyingLegCurlMachineExercise.JPG',
  'Desenvolvimento máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Training_Hard.jpg',
  'Elevação lateral na polia':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cable-seated-rear-lateral-raise-2.png',
  'Crucifixo inverso máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cable-seated-rear-lateral-raise-2.png',
  'Panturrilha em pé ou no leg press':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Weighted_jump_dumbbells_1.png',
  'Supino reto com barra':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Training_Hard.jpg',
  'Supino inclinado máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chest_Incline.jpg',
  'Crossover de baixo para cima':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
  'Tríceps francês unilateral na polia':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chinap,_Chest,_Back,_Bicep,_tricep_Machine.jpg',
  'Tríceps barra V':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chinap,_Chest,_Back,_Bicep,_tricep_Machine.jpg',
  'Tríceps testa com barra W':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chinap,_Chest,_Back,_Bicep,_tricep_Machine.jpg',
  'Hack squat':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Unilateral_barbell_back_squat_squatting.jpg',
  'Flexora unilateral':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Seated-leg-curl-1.png',
  'Remada baixa triângulo':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Back_Pull_down.jpg',
  'Puxada alta pronada':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Back_Pull_Down.jpg',
  'Elevação lateral':'https://commons.wikimedia.org/wiki/Special:Redirect/file/USMC-08313.jpg',
  'Rosca Scott máquina':'https://commons.wikimedia.org/wiki/Special:Redirect/file/PreacherBenchBicepsCurl.gif',
  'Tríceps corda':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chinap,_Chest,_Back,_Bicep,_tricep_Machine.jpg',
  'Panturrilha':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Weighted_jump_dumbbells_1.png',
  'Elevação lateral':'https://commons.wikimedia.org/wiki/Special:Redirect/file/DumbbellLateralRaise.JPG',
  'Crucifixo inverso':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Lying-rear-lateral-raise-1.png',
  'Rosca martelo':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Young_attractive_man_athlete_doing_exercise_with_the_barbell_in_the_gym.jpg'
};

function photoUrl(name){return EXERCISE_PHOTOS[name]||'https://commons.wikimedia.org/wiki/Special:Redirect/file/Training_Hard.jpg'}

/* Substitui somente a apresentação do exercício; todos os campos, histórico e salvamento continuam usando o código original. */
exerciseCard=function(ex,i,k){
  const r=data.logs[k]?.rows[i]||{};
  let sets='';
  for(let s=0;s<ex[1];s++){
    sets+='<div class="setrow"><div class="setno">'+(s+1)+'</div><input class="field" type="number" step="0.5" placeholder="kg" value="'+esc(r['kg'+s]??'')+'" onchange="setVal(\''+k+'\','+i+','+s+',\'kg\',this.value)"><input class="field" type="number" placeholder="reps" value="'+esc(r['reps'+s]??'')+'" onchange="setVal(\''+k+'\','+i+','+s+',\'reps\',this.value)"></div>';
  }
  const photo=photoUrl(ex[0]);
  return '<article class="exercise"><div class="exhead"><div class="exercise-photo"><img src="'+photo+'" alt="'+esc(ex[0])+'" loading="lazy" onerror="this.closest(\'.exercise-photo\').classList.add(\'photo-error\')"><span>Foto real</span></div><div class="exercise-info"><div class="exname">'+(i+1)+'. '+esc(ex[0])+'</div><div class="meta">'+ex[1]+' séries • faixa '+ex[2]+' reps</div><div class="tag">'+ex[2]+' REPS</div></div></div><div class="sets"><div class="sethead"><span>SÉRIE</span><span>CARGA (KG)</span><span>REPS</span></div>'+sets+'</div><textarea class="obs" rows="2" placeholder="Observação: técnica, falha, dor, execução..." onchange="setObs(\''+k+'\','+i+',this.value)">'+esc(r.observation||'')+'</textarea><div id="s'+i+'" class="suggest"></div><div class="photo-source">Imagem: Wikimedia Commons</div></article>';
};

if(typeof render==='function')render();
