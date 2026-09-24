/* Meu Treino — atualização da ficha Full Body 5x — 22/09/2026
   Mantém app.js e todas as funcionalidades existentes, substituindo apenas a ficha oficial.
   As imagens existentes são preservadas e reutilizadas pelos nomes já cadastrados em exercise-guides.js.
*/
(function(){
  'use strict';
  if(window.EXERCISE_GUIDES && window.EXERCISE_GUIDES['Panturrilha em pé ou no leg press']){
    window.EXERCISE_GUIDES['Panturrilha em pé']=window.EXERCISE_GUIDES['Panturrilha em pé ou no leg press'];
  }
  var xhr=new XMLHttpRequest();
  xhr.open('GET','app.js?v=20260924v01',false);
  xhr.send(null);
  if(xhr.status<200||xhr.status>=300) throw new Error('Não foi possível carregar app.js');
  var code=xhr.responseText;
  var workouts=`const workouts={
 Segunda:{icon:'🟢',title:'Full Body A • Quadríceps + Peito + Costas',ex:[['Abdominal máquina',3,'10–15'],['Pêndulo',3,'6–10'],['Supino inclinado com halteres',3,'8–12'],['Remada articulada com apoio no peito',3,'8–12'],['Cadeira extensora',3,'8–10'],['Elevação lateral na polia',3,'10–12'],['Tríceps francês unilateral na polia',3,'10–12'],['Panturrilha em pé',4,'10–12']]},
 Terça:{icon:'🔵',title:'Full Body B • Costas + Peito + Posterior',ex:[['Barra fixa ou puxada neutra',3,'8–10'],['Remada unilateral na polia',3,'8–10'],['Supino reto máquina',3,'8–10'],['Cadeira flexora bilateral',3,'8–10'],['Rosca direta com barra W',3,'8–12'],['Elevação lateral na polia',3,'8–12'],['Tríceps barra V',3,'8–12']]},
 Quarta:{icon:'🟠',title:'Full Body C • Superior • Sem pernas',ex:[['Abdominal máquina',3,'8–10'],['Supino inclinado máquina',3,'8–10'],['PULLDOWN',3,'8–10'],['Remada unilateral na polia',3,'8–10'],['Desenvolvimento máquina',3,'8–10'],['Rosca inclinada com halteres',3,'8–12'],['Tríceps francês unilateral na polia',3,'8–12']]},
 Quinta:{icon:'🔴',title:'Full Body D • Pernas + Peito',ex:[['Pêndulo',3,'6–10'],['Stiff com barra ou halteres',3,'8–12'],['Cadeira extensora',3,'8–12'],['Cadeira flexora bilateral',3,'8–12'],['Supino inclinado máquina',3,'8–12'],['Elevação lateral na polia',3,'8–12'],['Panturrilha em pé',4,'8–12']]},
 Sexta:{icon:'🟣',title:'Full Body E • Costas + Peito + Pernas',ex:[['Abdominal máquina',3,'10–15'],['Leg press 45°',3,'8–10'],['PULLDOWN',3,'8–12'],['Supino reto máquina',3,'8–12'],['Crucifixo inverso',3,'8–12'],['Cadeira flexora bilateral',3,'8–12'],['Rosca martelo',3,'10–12']]},
 Sábado:{icon:'⚪',title:'Recuperação • Sem treino programado',ex:[]},
 Domingo:{icon:'⚪',title:'Recuperação / Cardio',ex:[]}
};`;
  var start=code.indexOf('const workouts={');
  var end=code.indexOf('\n\n// Estrutura histórica',start);
  if(start<0||end<0) throw new Error('Estrutura da ficha não encontrada em app.js');
  code=code.slice(0,start)+workouts+code.slice(end);
  (0,eval)(code);
  setTimeout(function(){
    try{
      if(window.EXERCISE_GUIDES && window.EXERCISE_GUIDES['Panturrilha em pé ou no leg press']){
        window.EXERCISE_GUIDES['Panturrilha em pé']=window.EXERCISE_GUIDES['Panturrilha em pé ou no leg press'];
      }
      workouts.Segunda={icon:'🟢',title:'Full Body A • Quadríceps + Peito + Costas',ex:[['Abdominal máquina',3,'10–15'],['Pêndulo',3,'6–10'],['Supino inclinado com halteres',3,'8–12'],['Remada articulada com apoio no peito',3,'8–12'],['Cadeira extensora',3,'8–10'],['Elevação lateral na polia',3,'10–12'],['Tríceps francês unilateral na polia',3,'10–12'],['Panturrilha em pé',4,'10–12']]};
      workouts.Terça={icon:'🔵',title:'Full Body B • Costas + Peito + Posterior',ex:[['Barra fixa ou puxada neutra',3,'8–10'],['Remada unilateral na polia',3,'8–10'],['Supino reto máquina',3,'8–10'],['Cadeira flexora bilateral',3,'8–10'],['Rosca direta com barra W',3,'8–12'],['Elevação lateral na polia',3,'8–12'],['Tríceps barra V',3,'8–12']]};
      workouts.Quarta={icon:'🟠',title:'Full Body C • Superior • Sem pernas',ex:[['Abdominal máquina',3,'8–10'],['Supino inclinado máquina',3,'8–10'],['PULLDOWN',3,'8–10'],['Remada unilateral na polia',3,'8–10'],['Desenvolvimento máquina',3,'8–10'],['Rosca inclinada com halteres',3,'8–12'],['Tríceps francês unilateral na polia',3,'8–12']]};
      workouts.Quinta={icon:'🔴',title:'Full Body D • Pernas + Peito',ex:[['Pêndulo',3,'6–10'],['Stiff com barra ou halteres',3,'8–12'],['Cadeira extensora',3,'8–12'],['Cadeira flexora bilateral',3,'8–12'],['Supino inclinado máquina',3,'8–12'],['Elevação lateral na polia',3,'8–12'],['Panturrilha em pé',4,'8–12']]};
      workouts.Sexta={icon:'🟣',title:'Full Body E • Costas + Peito + Pernas',ex:[['Abdominal máquina',3,'10–15'],['Leg press 45°',3,'8–10'],['PULLDOWN',3,'8–12'],['Supino reto máquina',3,'8–12'],['Crucifixo inverso',3,'8–12'],['Cadeira flexora bilateral',3,'8–12'],['Rosca martelo',3,'10–12']]};
      workouts.Sábado={icon:'⚪',title:'Recuperação • Sem treino programado',ex:[]};
      if(typeof render==='function' && typeof current!=='undefined') render();
    }catch(e){console.error('final workout reset',e)}
  },0);
})();
