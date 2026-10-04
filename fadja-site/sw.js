const CACHE='fadja-v20261004-4';
const CORE=['./','./index.html','./manifest.webmanifest','./config.js','./app-install.js'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==location.origin)return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
   return;
 }
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone()));return res}).catch(()=>hit)));
});

self.addEventListener('push',event=>{
  let data={title:'FADJA',body:'Nouvelle information FADJA',url:'./'};
  try{data={...data,...(event.data?.json()||{})}}catch(e){}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',data:{url:data.url||'./'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const same=list.find(c=>c.url.includes(location.origin));
    if(same){same.focus();return same.navigate(url)}
    return clients.openWindow(url);
  }));
});
