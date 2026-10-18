// Home Nader: white header text (on a dark bar) while the header is sticky.
// Append to the END of Lofty's global custom script. Uses the selectors already used there
// (.md-header, .menu-container, .header-bg, .social-container, .head-account).
(()=>{
  var SEL_TEXT='.menu-container .menu-item>a,.menu-container .menu-item>span,.head-account span,.head-account a,.social-container a,.social-container span';
  var SEL_BG='.menu-container .header-bg,.social-container';
  var DARK='rgba(15,23,42,.95)',saved=new WeakMap(),on=false;
  function put(e,prop,val){
    var s=saved.get(e)||{};
    if(!(prop in s)){s[prop]=[e.style.getPropertyValue(prop),e.style.getPropertyPriority(prop)];saved.set(e,s)}
    e.style.setProperty(prop,val,'important');
  }
  function restore(e){
    var s=saved.get(e);if(!s)return;
    for(var p in s){if(s[p][0])e.style.setProperty(p,s[p][0],s[p][1]);else e.style.removeProperty(p)}
    saved.delete(e);
  }
  function apply(){
    var h=document.querySelector('.md-header');if(!h)return;
    var now=window.scrollY>40;
    if(now===on&&!now)return;
    on=now;
    h.querySelectorAll(SEL_TEXT).forEach(e=>on?put(e,'color','#fff'):restore(e));
    h.querySelectorAll(SEL_BG).forEach(e=>{if(on){put(e,'background-color',DARK);put(e,'background-image','none')}else restore(e)});
  }
  addEventListener('scroll',apply,{passive:true});
  setInterval(()=>{if(on)apply()},1000); // re-apply if Lofty re-renders the header
  apply();
})();
