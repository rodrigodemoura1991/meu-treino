/* Relatórios: inclui tempo e calorias do cardio nos PDFs. */
(function(){
  function cardioMinutes(v){
    const s=String(v??'').trim().toLowerCase().replace(',', '.');
    if(!s)return 0;
    const clock=s.match(/^(\d+)\s*:\s*(\d+)(?::(\d+))?$/);
    if(clock)return Number(clock[1])*60+Number(clock[2])+Number(clock[3]||0)/60;
    const h=s.match(/(\d+(?:\.\d+)?)\s*h/);
    const m=s.match(/(\d+(?:\.\d+)?)\s*(?:min|m)(?:\b|$)/);
    if(h||m)return (h?Number(h[1])*60:0)+(m?Number(m[1]):0);
    const n=Number(s);
    return Number.isFinite(n)?n:0;
  }
  function fmtCardioMinutes(v){
    const total=Math.round(Number(v)||0);
    if(total<=0)return '0 min';
    const h=Math.floor(total/60),m=total%60;
    return h?(h+'h'+(m?' '+m+'min':'')):total+' min';
  }
  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function buildPeriodPdf(start,end,title,file){
    const J=window.jspdf?.jsPDF;
    if(!J){alert('O gerador de PDF ainda está carregando.');return}
    const logs=Object.values(window.data?.logs||{}).filter(l=>l.date&&l.date>=start&&l.date<=end).sort((a,b)=>a.date.localeCompare(b.date));
    const doc=new J({unit:'mm',format:'a4'});
    doc.setFillColor(242,111,0);doc.roundedRect(12,10,186,22,4,4,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text('MEU TREINO',20,23);
    doc.setTextColor(25,35,48);doc.setFontSize(16);doc.text(title,14,43);
    doc.setFontSize(10);doc.setFont('helvetica','normal');doc.text(start+' a '+end,14,50);
    const vol=logs.reduce((a,l)=>a+(window.volumeForLog?window.volumeForLog(l):0),0);
    const cardioMin=logs.reduce((a,l)=>a+cardioMinutes(l.cardio?.duration),0);
    const cardioKcal=logs.reduce((a,l)=>a+n(l.cardio?.calories),0);
    const workoutKcal=logs.reduce((a,l)=>a+n(l.calories),0);
    const totalKcal=workoutKcal+cardioKcal;
    const bpms=logs.map(l=>n(l.avgBpm)).filter(Boolean);
    const avgBpm=bpms.length?Math.round(bpms.reduce((a,b)=>a+b,0)/bpms.length):'—';
    let y=62;
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);
    doc.text('Treinos: '+logs.length,14,y);
    doc.text('Volume: '+Math.round(vol).toLocaleString('pt-BR')+' kg',62,y);
    doc.text('Calorias totais: '+Math.round(totalKcal).toLocaleString('pt-BR')+' kcal',124,y);
    y+=7;
    doc.setFontSize(9.5);
    doc.text('Cardio: '+fmtCardioMinutes(cardioMin),14,y);
    doc.text('Calorias cardio: '+Math.round(cardioKcal).toLocaleString('pt-BR')+' kcal',62,y);
    doc.text('BPM médio: '+avgBpm,124,y);
    y+=11;
    logs.forEach(l=>{
      if(y>270){doc.addPage();y=18}
      doc.setFont('helvetica','bold');doc.setFontSize(10);
      doc.text(l.date+' — '+(l.day||'Treino')+' — '+(window.workouts?.[l.day]?.title||'Treino opcional'),14,y);
      y+=5;
      doc.setFont('helvetica','normal');doc.setFontSize(8.2);
      const c=l.cardio||{};
      const line='Volume '+Math.round(window.volumeForLog?window.volumeForLog(l):0).toLocaleString('pt-BR')+' kg | Cal. treino '+(l.calories||'—')+' kcal | Cardio '+(c.duration||'—')+(c.type?' ('+c.type+')':'')+' | Cal. cardio '+(c.calories||'—')+' kcal | '+(l.avgBpm||'—')+' bpm | '+(l.duration||'—')+' | RPE '+(l.effort||'—');
      const chunks=doc.splitTextToSize(line,170);
      doc.text(chunks,18,y);
      y+=Math.max(7,chunks.length*4.2);
    });
    doc.save(file);
  }
  window.weeklyReport=function(date){
    const d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7,s0=new Date(d);s0.setDate(d.getDate()-day);const e0=new Date(s0);e0.setDate(s0.getDate()+6);
    const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
    const s=iso(s0),e=iso(e0);buildPeriodPdf(s,e,'Relatório semanal','meu-treino-semanal-'+s+'.pdf');
  };
  window.monthlyReport=function(date){
    const d=new Date(date+'T12:00:00'),y=d.getFullYear(),m=d.getMonth(),s=y+'-'+String(m+1).padStart(2,'0')+'-01',last=new Date(y,m+1,0).getDate(),e=y+'-'+String(m+1).padStart(2,'0')+'-'+String(last);
    buildPeriodPdf(s,e,'Relatório mensal','meu-treino-mensal-'+s.slice(0,7)+'.pdf');
  };
  window.yearlyReport=function(date){
    const y=new Date(date+'T12:00:00').getFullYear();buildPeriodPdf(y+'-01-01',y+'-12-31','Relatório anual','meu-treino-anual-'+y+'.pdf');
  };
})();
