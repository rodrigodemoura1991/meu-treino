/* Meu Treino — atualização da ficha Full Body 5x
   Mantém app.js e todas as funcionalidades existentes, substituindo apenas a ficha oficial.
*/
(function(){
  'use strict';
  var xhr=new XMLHttpRequest();
  xhr.open('GET','app.js?v=20260918v01',false);
  xhr.send(null);
  if(xhr.status<200||xhr.status>=300) throw new Error('Não foi possível carregar app.js');
  var code=xhr.responseText;
  var workouts=`const workouts={
 Segunda:{icon:'🟢',title:'Full Body A • Quadríceps + Peito + Costas',ex:[['Abdominal máquina',3,'10–15'],['Pêndulo',3,'6–10'],['Supino inclinado com halteres',3,'8–12'],['Remada articulada com apoio no peito',3,'8–12'],['Cadeira extensora',2,'10–15'],['Elevação lateral na polia',2,'12–15'],['Tríceps francês unilateral na polia',2,'10–15']]},
 Terça:{icon:'🔵',title:'Full Body B • Costas + Peito + Posterior',ex:[['Puxada alta pronada',3,'8–12'],['Remada articulada com apoio no peito',3,'8–12'],['Supino reto máquina',3,'8–12'],['Cadeira flexora bilateral',2,'10–15'],['Rosca direta com barra W',2,'8–12'],['Elevação lateral na polia',2,'12–15'],['Tríceps barra V',2,'10–15']]},
 Quarta:{icon:'🟠',title:'Full Body C • Superior • Sem pernas',ex:[['Abdominal máquina',3,'10–15'],['Supino inclinado máquina',3,'8–12'],['PULLDOWN',3,'8–12'],['Remada unilateral na polia',3,'8–12'],['Elevação lateral na polia',3,'12–15'],['Rosca inclinada com halteres',2,'10–15'],['Tríceps francês unilateral na polia',2,'10–15']]},
 Quinta:{icon:'🔴',title:'Full Body D • Pernas + Peito',ex:[['Hack squat',3,'6–10'],['Stiff com barra ou halteres',3,'8–12'],['Cadeira extensora',2,'10–15'],['Mesa flexora',2,'10–15'],['Supino inclinado máquina',3,'8–12'],['Elevação lateral na polia',2,'12–15'],['Panturrilha',2,'10–15']]},
 Sexta:{icon:'🟣',title:'Full Body E • Costas + Peito + Pernas',ex:[['Abdominal máquina',3,'10–15'],['Leg press 45°',3,'8–12'],['Puxada alta pronada',3,'8–12'],['Supino reto máquina',3,'8–12'],['Remada articulada com apoio no peito',2,'8–12'],['Flexora unilateral',2,'10–15'],['Rosca martelo com halteres',2,'10–15']]},
 Sábado:{icon:'⚪',title:'Recuperação • Sem treino programado',ex:[]},
 Domingo:{icon:'⚪',title:'Recuperação / Cardio',ex:[]}
};`;
  var start=code.indexOf('const workouts={');
  var end=code.indexOf('\n\n// Estrutura histórica',start);
  if(start<0||end<0) throw new Error('Estrutura da ficha não encontrada em app.js');
  code=code.slice(0,start)+workouts+code.slice(end);
  (0,eval)(code);
  // app-fix-v12.js ainda faz pequenos ajustes históricos. Reaplica a ficha final
  // depois desses patches para garantir que a quarta continue sem pernas e o sábado fique livre.
  setTimeout(function(){
    try{
      workouts.Quarta={icon:'🟠',title:'Full Body C • Superior • Sem pernas',ex:[['Abdominal máquina',3,'10–15'],['Supino inclinado máquina',3,'8–12'],['PULLDOWN',3,'8–12'],['Remada unilateral na polia',3,'8–12'],['Elevação lateral na polia',3,'12–15'],['Rosca inclinada com halteres',2,'10–15'],['Tríceps francês unilateral na polia',2,'10–15']]};
      workouts.Sábado={icon:'⚪',title:'Recuperação • Sem treino programado',ex:[]};
      if(typeof render==='function' && typeof current!=='undefined') render();
    }catch(e){console.error('final workout reset',e)}
  },0);
})();
