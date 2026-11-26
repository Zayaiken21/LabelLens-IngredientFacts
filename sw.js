const V="ll-v25",FILES=["./","index.html","styles.css","app.js","crop.js","cutout.js","tracker.js","journey.js","ingredients.js","ingredients-extra.js","education.js","facts.js","nutrition.js","online.js","research.js","config.js","ingredient-info.js","facts-more.js","ingredients-more.js","facts-data.js","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* Network first for the app's own files so updates show up immediately; cache is only the offline fallback. */
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||/openfoodfacts\.org/.test(u.hostname))return;
  const own=u.origin===location.origin;
  e.respondWith(fetch(e.request).then(r=>{
    if(r&&r.ok&&(own||/cdn\.jsdelivr\.net|tessdata|tesseract/.test(e.request.url))){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}
    return r;
  }).catch(()=>caches.match(e.request)));
});
