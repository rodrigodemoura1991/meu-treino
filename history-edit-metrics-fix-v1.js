/* MEU TREINO — correção visual das métricas do popup de edição */
(()=>{
  'use strict';
  const id='historyEditMetricsFixV1';
  function install(){
    if(document.getElementById(id)) return;
    const style=document.createElement('style');
    style.id=id;
    style.textContent=`
      #historyEditModal .history-edit-metrics,
      #historyEditModal .history-edit-cardio{
        display:grid!important;
        gap:12px!important;
        align-items:end!important;
      }
      #historyEditModal .history-edit-metrics{
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        margin-top:8px!important;
      }
      #historyEditModal .history-edit-cardio{
        grid-template-columns:repeat(5,minmax(0,1fr))!important;
        margin-top:8px!important;
      }
      #historyEditModal .history-edit-metrics label,
      #historyEditModal .history-edit-cardio label{
        display:flex!important;
        flex-direction:column!important;
        gap:6px!important;
        min-width:0!important;
        font-size:12px!important;
        font-weight:800!important;
        color:#4b5563!important;
      }
      #historyEditModal .history-edit-metrics input,
      #historyEditModal .history-edit-metrics select,
      #historyEditModal .history-edit-cardio input,
      #historyEditModal .history-edit-cardio select{
        width:100%!important;
        min-width:0!important;
        height:40px!important;
        box-sizing:border-box!important;
        border:1px solid #ccd5dd!important;
        border-radius:9px!important;
        padding:0 10px!important;
        background:#fff!important;
        color:#18222d!important;
      }
      #historyEditModal #editNotes{
        width:100%!important;
        min-height:70px!important;
        box-sizing:border-box!important;
        margin-top:14px!important;
        border:1px solid #ccd5dd!important;
        border-radius:9px!important;
        padding:10px!important;
      }
      #historyEditModal .history-edit-subtitle{
        margin:18px 0 4px!important;
      }
      @media(max-width:760px){
        #historyEditModal .history-edit-metrics{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
        }
        #historyEditModal .history-edit-cardio{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
        }
      }
      @media(max-width:430px){
        #historyEditModal .history-edit-metrics,
        #historyEditModal .history-edit-cardio{
          grid-template-columns:1fr!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
})();
