(()=>{if(window.__FADJA_INSTALL__)return;window.__FADJA_INSTALL__=1;
const css=document.createElement('style');css.textContent=`
.fadja-install-modal{position:fixed;inset:0;background:#050b20cc;z-index:99999;display:none;place-items:center;padding:20px}
.fadja-install-modal.on{display:grid}.fadja-install-card{width:min(760px,100%);max-height:92vh;overflow:auto;background:var(--bg,#fff);color:var(--ink,#101a38);border:1px solid var(--line,#dfe5f2);border-radius:22px;padding:26px;box-shadow:0 30px 80px #0008}
.fadja-install-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.fadja-install-head h2{margin:0}.fadja-install-x{all:unset;cursor:pointer;font-size:28px;line-height:1;padding:4px 8px}
.fadja-install-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:18px}.fadja-install-item{border:1px solid var(--line,#dfe5f2);border-radius:14px;padding:16px}
.fadja-install-item b{display:block;margin-bottom:5px}.fadja-install-item p{font-size:13px;color:var(--mut,#64708f);margin:0 0 12px}.fadja-install-item button{width:100%}
.fadja-install-note{margin-top:16px;padding:12px 14px;background:var(--soft,#f3f6fd);border-radius:12px;color:var(--mut,#64708f);font-size:12px}
.fadja-install-native{margin-top:12px;padding:12px 14px;border:1px dashed var(--line,#dfe5f2);border-radius:12px;font-size:12px;color:var(--mut,#64708f)}
`;document.head.appendChild(css);
if(!document.querySelector('link[rel="manifest"]')){const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l)}
[['theme-color','#0A1A4F'],['apple-mobile-web-app-capable','yes'],['apple-mobile-web-app-status-bar-style','black-translucent'],['apple-mobile-web-app-title','FADJA']].forEach(([n,c])=>{if(!document.querySelector('meta[name="'+n+'"]')){const m=document.createElement('meta');m.name=n;m.content=c;document.head.appendChild(m)}});
let deferred=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;window.dispatchEvent(new Event('fadja-install-ready'))});
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),android=/android/i.test(navigator.userAgent),standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function modal(){let m=document.getElementById('fadja-install-modal');if(m)return m;m=document.createElement('div');m.id='fadja-install-modal';m.className='fadja-install-modal';m.innerHTML=`<div class="fadja-install-card"><div class="fadja-install-head"><div><h2>Installer l’application FADJA</h2><p class="lead">Une seule application web installable sur téléphone, tablette et ordinateur.</p></div><button class="fadja-install-x" aria-label="Fermer">×</button></div>
<div class="fadja-install-grid">
<div class="fadja-install-item"><b>Android</b><p>Installation directe de FADJA comme application depuis Chrome.</p><button class="btn" data-install>Installer sur Android</button></div>
<div class="fadja-install-item"><b>iPhone / iPad</b><p>Installation directe comme app web depuis Safari.</p><button class="btn" data-ios>Installer sur iPhone / iPad</button></div>
<div class="fadja-install-item"><b>Windows / macOS / Linux</b><p>Installation comme application depuis Chrome ou Edge.</p><button class="btn" data-install>Installer sur ordinateur</button></div>
<div class="fadja-install-item"><b>Android / installation app</b><p>La version installable FADJA fonctionne directement depuis le navigateur. Elle ne nécessite pas de fichier APK.</p><button class="btn o" data-install-now>Installer FADJA</button></div>
</div><div class="fadja-install-native">Version Android PWA : installation immédiate depuis le navigateur. Un vrai APK natif pourra être branché ici dès qu’un fichier APK signé est fourni. Aucun faux lien APK n’est créé.</div><div class="fadja-install-note" id="fadja-install-status">Choisissez votre appareil pour lancer l’installation.</div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.fadja-install-x'))m.classList.remove('on')});m.querySelectorAll('[data-install]').forEach(b=>b.onclick=install);m.querySelector('[data-ios]').onclick=iosHelp;return m}
async function install(){const m=modal(),s=m.querySelector('#fadja-install-status');m.classList.add('on');if(standalone()){s.textContent='FADJA est déjà installée sur cet appareil.';return}if(deferred){deferred.prompt();const r=await deferred.userChoice;s.textContent=r.outcome==='accepted'?'Installation lancée.':'Installation annulée.';deferred=null;return}if(ios){iosHelp();return}if(android)s.innerHTML='<b>Android :</b> Chrome doit afficher l’option d’installation. Si elle n’apparaît pas, ouvrez le menu ⋮ puis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b>.';else s.innerHTML='<b>Ordinateur :</b> Chrome/Edge → icône <b>Installer</b> dans la barre d’adresse, ou menu du navigateur → <b>Installer FADJA</b>.'}
function iosHelp(){const m=modal(),s=m.querySelector('#fadja-install-status');m.classList.add('on');s.innerHTML='<b>iPhone / iPad :</b> ouvrez FADJA dans <b>Safari</b> → <b>Partager</b> → <b>Sur l’écran d’accueil</b> → <b>Ajouter</b>.'}
function open(){modal().classList.add('on');}
function bind(){document.querySelectorAll('#inst,[data-install-app],a,button').forEach(el=>{if(el.dataset.fadjaInstallBound)return;const t=(el.textContent||'').toLowerCase();if(el.id==='inst'||el.hasAttribute('data-install-app')||t.includes("installer l'app")||t.includes("installer l’application")||t.includes("télécharger l’application")){el.dataset.fadjaInstallBound='1';el.addEventListener('click',e=>{e.preventDefault();if(el.hasAttribute('data-fadja-ios'))iosHelp();else open()},{capture:true})}})}
bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});window.addEventListener('fadja-install-ready',bind);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js?v=20261003-3',{updateViaCache:'none'}).catch(()=>{});

/* FADJA UI repair layer — animations, image lightbox and button reliability */
(function(){
  if(window.__FADJA_UI_REPAIR__) return;
  window.__FADJA_UI_REPAIR__=true;

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const style=document.createElement('style');
  style.textContent=`
    @keyframes fadjaImgFloat{
      0%,100%{transform:scale(1.035) translate3d(0,0,0)}
      50%{transform:scale(1.075) translate3d(0,-5px,0)}
    }
    .fadja-img-animated{animation:fadjaImgFloat 7s ease-in-out infinite;will-change:transform}
    .car .s.on .fadja-img-animated{animation-duration:7s}
    .pc img.fadja-img-animated{animation-duration:6s}
    .bento img.fadja-img-animated{animation-duration:8s}
    .activity-img img.fadja-img-animated{animation-duration:8s}
    .fadja-ripple{position:relative;overflow:hidden}
    .fadja-ripple:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle,rgba(255,255,255,.28) 10%,transparent 11%);transform:scale(10);opacity:0;transition:transform .45s,opacity .6s}
    .fadja-ripple.fadja-click:after{transform:scale(0);opacity:1;transition:0s}
    @media(prefers-reduced-motion:reduce){.fadja-img-animated{animation:none!important}}
  `;
  document.head.appendChild(style);

  function animateImages(root=document){
    qa('.car .s img,.pc img,.bento img,.activity-img img',root).forEach(img=>{
      img.classList.add('fadja-img-animated');
      img.loading=img.loading||'lazy';
    });
  }

  function imageFallback(img){
    if(!(img instanceof HTMLImageElement)) return;
    const src=img.getAttribute('src')||'';
    if(!src || src.startsWith('data:') || src.includes('raw.githubusercontent.com')) return;
    const m=src.match(/(?:^|\\/)assets\\/([^/?#]+)\\.(jpg|jpeg|png|webp|svg)(?:[?#].*)?$/i);
    if(!m) return;
    const raw='https://raw.githubusercontent.com/INFOTELCOM/FADJA-OFFICIEL/main/fadja-site/assets/'+m[1]+'.'+m[2];
    if(img.dataset.fadjaFallback) return;
    img.dataset.fadjaFallback='1';
    img.src=raw;
  }
  qa('img').forEach(img=>img.addEventListener('error',()=>imageFallback(img),{once:true}));

  function bindLightbox(){
    const lb=q('#lb'), lbImg=lb&&q('img',lb);
    if(!lb||!lbImg) return;
    qa('.pc img,.bento img,.car .s img,.activity-img img').forEach(img=>{
      if(img.dataset.fadjaLightbox) return;
      img.dataset.fadjaLightbox='1';
      img.style.cursor='zoom-in';
      img.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        lbImg.src=img.currentSrc||img.src;
        lb.classList.add('on');
      });
    });
  }

  function closeLightbox(){
    const lb=q('#lb');
    if(lb) lb.classList.remove('on');
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});
  document.addEventListener('click',e=>{
    const lb=q('#lb');
    if(lb && (e.target===lb || e.target.closest('#lb img')===null && e.target.closest('#lb'))) closeLightbox();
  });

  function bindCoreButtons(){
    const bg=q('#bg'), nv=q('#nv');
    if(bg && !bg.dataset.repairBound){
      bg.dataset.repairBound='1';
      bg.addEventListener('click',()=>nv&&nv.classList.toggle('open'));
    }
    if(nv && !nv.dataset.repairBound){
      nv.dataset.repairBound='1';
      nv.addEventListener('click',e=>{
        const a=e.target.closest('a');
        if(a && a.getAttribute('href') && a.getAttribute('href').startsWith('#')) nv.classList.remove('open');
      });
    }

    const notif=q('#notifBtn');
    if(notif && !notif.dataset.repairBound){
      notif.dataset.repairBound='1';
      notif.addEventListener('click',()=>{
        const panel=q('#notifPanel');
        if(panel){panel.classList.toggle('on'); if(typeof window.loadPublicNotifications==='function') window.loadPublicNotifications();}
      });
    }

    const theme=q('#th');
    if(theme && !theme.dataset.repairBound){
      theme.dataset.repairBound='1';
      theme.addEventListener('click',()=>{
        const rt=document.documentElement;
        const current=rt.dataset.theme;
        const dark=current ? current==='dark' : matchMedia('(prefers-color-scheme:dark)').matches;
        const next=dark?'light':'dark';
        rt.dataset.theme=next;
        try{localStorage.setItem('fadja_th',JSON.stringify(next))}catch(e){}
      });
    }

    const installNow=q('#installNow');
    if(installNow && !installNow.dataset.repairBound){
      installNow.dataset.repairBound='1';
      installNow.addEventListener('click',()=>typeof window.installFadja==='function'&&window.installFadja());
    }
    const installClose=q('#installClose');
    if(installClose && !installClose.dataset.repairBound){
      installClose.dataset.repairBound='1';
      installClose.addEventListener('click',()=>q('#modal')?.classList.remove('on'));
    }

    qa('[data-fadja-ios]').forEach(b=>{
      if(b.dataset.repairBound) return;
      b.dataset.repairBound='1';
      b.addEventListener('click',e=>{e.preventDefault();iosHelp();},{capture:true});
    });
  }

  function repairLinks(){
    qa('a[href^="#"]').forEach(a=>{
      if(a.dataset.repairScroll) return;
      const href=a.getAttribute('href');
      if(!href || href==='#') return;
      const target=q(href);
      if(!target) return;
      a.dataset.repairScroll='1';
      a.addEventListener('click',e=>{
        if(a.hasAttribute('onclick')) return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  }

  function addButtonFeedback(){
    qa('button,.btn').forEach(b=>{
      if(b.dataset.fadjaFeedback) return;
      b.dataset.fadjaFeedback='1';
      b.addEventListener('pointerdown',()=>{b.classList.add('fadja-click');setTimeout(()=>b.classList.remove('fadja-click'),90)},{passive:true});
    });
  }

  function repair(){
    animateImages();
    bindLightbox();
    bindCoreButtons();
    repairLinks();
    addButtonFeedback();
  }

  repair();
  new MutationObserver(repair).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',repair,{once:true});

  /* Re-run image motion after the original carousel replaces its fallback markup. */
  [120,700,1800,3500].forEach(ms=>setTimeout(repair,ms));

  /* Keep the PWA cache version synchronized with the current site. */
  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    navigator.serviceWorker.register('sw.js?v=20261004-6',{updateViaCache:'none'}).catch(()=>{});
  }
})();
