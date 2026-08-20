/* Preview visual dark — pode ser removido sem afetar dados */
(function(){
  const css=document.createElement('style');
  css.id='dark-mode-preview';
  css.textContent=`
    :root{color-scheme:dark;--bg:#0d1117;--panel:#151b23;--line:#293241;--text:#f1f5f9;--muted:#9aa7b5;--accent:#ff7412;--accent-soft:#3a2112;--good:#4ade80;--danger:#f87171}
    html,body{background:var(--bg)!important;color:var(--text)!important}
    .top{background:rgba(13,17,23,.96)!important;border-bottom-color:var(--line)!important}
    .brand small,.meta,.historyhead small,.historyhead>span,.muted,.hero p,.stat span,.metrics label,.noteslabel,.sethead,.barvalue,.barcol small{color:var(--muted)!important}
    .status{background:#3a2112!important;color:#ff9b55!important}
    .nav button,.daystrip button,.secondary{background:#1b232e!important;color:#cbd5e1!important;border-color:var(--line)!important;box-shadow:none!important}
    .nav button.active,.daystrip button.active,.primary{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}
    .hero,.stat,.exercise,.card{background:var(--panel)!important;border-color:var(--line)!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important}
    .field,.metrics input,.metrics select,.auth input{background:#0f151d!important;color:var(--text)!important;border-color:#344050!important}
    .obs,.notes{background:#101720!important;color:var(--text)!important;border-color:#344050!important}
    .setno,.chips span,.cloudbox{background:#202936!important;color:#cbd5e1!important}
    .tag{background:var(--accent-soft)!important;color:#ff9b55!important}
    .historyrow,.summaryrow,.chart{border-color:var(--line)!important}
    .danger{background:#32191b!important;color:#ff8b8b!important}
    .bottomnav{background:rgba(13,17,23,.98)!important;border-top-color:var(--line)!important;box-shadow:0 -8px 20px rgba(0,0,0,.3)!important}
    .bottomnav button{color:#9aa7b5!important}.bottomnav button.active{color:var(--accent)!important}
    .bar{background:var(--accent)!important}
  `;
  document.head.appendChild(css);
})();
