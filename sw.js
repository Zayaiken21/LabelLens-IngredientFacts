const V="ll-v6",FILES=["./","index.html","styles.css","app.js","crop.js","cutout.js","tracker.js","journey.js","ingredients.js","ingredients-extra.js","education.js","facts.js","facts-more.js","ingredients-more.js","facts-data.js","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok&&(r.type==="basic"||e.request.url.includes("cdn.jsdelivr")||e.request.url.includes("tessdata")||e.request.url.includes("tesseract"))){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
