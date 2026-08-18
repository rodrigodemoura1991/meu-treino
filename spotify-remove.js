/* Remove a integração do Spotify da interface sem alterar os registros de treino. */
(function(){
  function removeSpotify(){
    document.querySelectorAll('.spotifyCard').forEach(el=>el.remove());
    document.querySelectorAll('#app section.card').forEach(section=>{
      const h=section.querySelector('h2');
      if(h&&/spotify/i.test(h.textContent||''))section.remove();
    });
  }
  try{
    localStorage.removeItem('meu_treino_spotify_client_id');
    localStorage.removeItem('meu_treino_spotify_token');
    localStorage.removeItem('spotify_verifier');
    localStorage.removeItem('spotify_state');
  }catch(e){}
  removeSpotify();
  new MutationObserver(removeSpotify).observe(document.documentElement,{childList:true,subtree:true});
})();
