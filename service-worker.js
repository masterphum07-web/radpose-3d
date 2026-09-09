const CACHE='radpose-v7';const ASSETS=['./','./index.html','./css/style.css','./js/app.js','./data/positions.json','./data/additional-positions.json','./manifest.json','./assets/images/chest-pa-positioning.jpg'];self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const copy=n.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return n}).catch(()=>caches.match('./index.html')))));






