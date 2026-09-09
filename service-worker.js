const CACHE='radpose-v8';
const STATIC=['./','./index.html','./css/style.css','./js/app.js','./manifest.json','./data/positions.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.endsWith('/data/positions.json')){e.respondWith(caches.open(CACHE).then(async c=>{const cached=await c.match(e.request);const fresh=fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>cached);return cached||fresh}));return}if(e.request.method==='GET')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const copy=n.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return n}).catch(()=>caches.match('./index.html'))))});
