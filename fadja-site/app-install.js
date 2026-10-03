(()=>{if(window.__FADJA_INSTALL__)return;window.__FADJA_INSTALL__=1;
const A=document.createElement('style');A.textContent=`
.fadja-install-modal{position:fixed;inset:0;background:#050b20cc;z-index:99999;display:none;place-items:center;padding:20px}
.fadja-install-modal.on{display:grid}.fadja-install-card{width:min(720px,100%);max-height:90vh;overflow:auto;background:var(--bg,#fff);color:var(--ink,#101a38);border:1px solid var(--line,#dfe5f2);border-radius:22px;padding:26px;box-shadow:0 30px 80px #0008}
.fadja-install-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.fadja-install-head h2{margin:0}.fadja-install-x{all:unset;cursor:pointer;font-size:28px;line-height:1;padding:4px 8px}.fadja-install-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:18px}
.fadja-install-item{border:1px solid var(--line,#dfe5f2);border-radius:14px;padding:16px}.fadja-install-item b{display:block;margin-bottom:5px}.fadja-install-item p{font-size:13px;color:var(--mut,#64708f);margin:0 0 10px}.fadja-install-item button,.fadja-install-item a{display:inline-block;width:100%;text-align:center;text-decoration:none}
.fadja-install-note{margin-top:16px;padding:12px 14px;background:var(--soft,#f3f6fd);border-radius:12px;color:var(--mut,#64708f);font-size:12px}
`;document.head.appendChild(A);
if(!document.querySelector('link[rel="manifest"]')){const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l)}
[['meta','theme-color','#0A1A4F'],['meta','apple-mobile-web-app-capable','yes'],['meta','apple-mobile-web-app-status-bar-style','black-translucent'],['meta','apple-mobile-web-app-title','FADJA']].forEach(([tag,n,c])=>{if(!document.querySelector('meta[name="'+n+'"]')){const m=document.createElement(tag);m.name=n;m.content=c;document.head.appendChild(m)}})
let deferred=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;window.dispatchEvent(new Event('fadja-install-ready'))});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent),isStandalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function modal(){let m=document.getElementById('fadja-install-modal');if(m)return m;m=document.createElement('div');m.id='fadja-install-modal';m.className='fadja-install-modal';m.innerHTML=`<div class="fadja-install-card"><div class="fadja-install-head"><div><h2>Installer l’application FADJA</h2><p class="lead">Utilisez FADJA comme une application sur votre téléphone ou votre ordinateur.</p></div><button class="fadja-install-x" aria-label="Fermer">×</button></div><div class="fadja-install-grid">
<div class="fadja-install-item"><b>Android</b><p>Chrome peut installer directement l’application FADJA sur l’écran d’accueil.</p><button class="btn" data-install-now>Installer maintenant</button></div>
<div class="fadja-install-item"><b>iPhone / iPad</b><p>Safari permet d’ajouter FADJA à l’écran d’accueil et de l’ouvrir comme une app.</p><button class="btn" data-ios-help>Voir les étapes</button></div>
<div class="fadja-install-item"><b>Windows / macOS / Linux</b><p>Sur un navigateur compatible, utilisez l’installation de l’application depuis la barre d’adresse.</p><button class="btn" data-install-now>Installer maintenant</button></div>
<div class="fadja-install-item"><b>APK Android</b><p>Une vraie APK signée nécessite une distribution Android dédiée. Le site installe déjà la version PWA sans téléchargement manuel.</p><button class="btn o" data-install-now>Installer la version web-app</button></div>
</div><div class="fadja-install-note" id="fadja-install-status"></div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.fadja-install-x'))m.classList.remove('on')});m.querySelectorAll('[data-install-now]').forEach(b=>b.onclick=install);m.querySelector('[data-ios-help]').onclick=iosHelp;return m}
async function install(){const m=modal(),status=m.querySelector('#fadja-install-status');if(isStandalone){status.textContent='FADJA est déjà installée sur cet appareil.';return}
if(deferred){deferred.prompt();const r=await deferred.userChoice;status.textContent=r.outcome==='accepted'?'Installation lancée.':'Installation annulée.';deferred=null;return}
if(isIOS){iosHelp();return}
status.textContent='Si le navigateur ne propose pas automatiquement l’installation, ouvrez le menu du navigateur puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».';
}
function iosHelp(){const m=modal(),status=m.querySelector('#fadja-install-status');m.classList.add('on');status.innerHTML='Sur iPhone/iPad : ouvrez FADJA dans <b>Safari</b> → <b>Partager</b> → <b>Sur l’écran d’accueil</b> → activez <b>Ouvrir comme app web</b> → <b>Ajouter</b>.'}
function open(){const m=modal();m.classList.add('on');if(deferred)m.querySelectorAll('[data-install-now]').forEach(b=>b.textContent='Installer maintenant')}
function bind(){const nodes=[...document.querySelectorAll('#inst,a,button')];nodes.forEach(el=>{if(el.dataset.fadjaInstallBound)return;const t=(el.textContent||'').toLowerCase();if(el.id==='inst'||t.includes("installer l'app")||t.includes('installer l’application')||t.includes('télécharger l’application')||t.includes('telecharger l application')){el.dataset.fadjaInstallBound='1';el.addEventListener('click',e=>{e.preventDefault();open()},{capture:true})}})}
bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});window.addEventListener('fadja-install-ready',bind);
})();