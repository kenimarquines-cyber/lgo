// Service worker de Electrotask: deja la app (y Firebase/fuentes) disponibles sin internet.
// Debe estar en la MISMA carpeta que el HTML y servirse por HTTPS (o localhost).
const V = 'electrotask-v1';
self.addEventListener('install', e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(['./'])).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{
  const r = e.request; if(r.method!=='GET') return;
  const u = new URL(r.url);
  // Datos en vivo: nunca se interceptan (Firestore guarda su propio caché offline)
  if(/firestore\.googleapis\.com|identitytoolkit|securetoken|api\.emailjs\.com|recaptcha/.test(u.host+u.pathname)) return;
  if(r.mode==='navigate'){
    e.respondWith(
      Promise.race([fetch(r), new Promise((_,ko)=>setTimeout(ko,4000))])
        .then(res=>{ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); return res; })
        .catch(()=>caches.match(r).then(m=>m||caches.match('./')))
    );
    return;
  }
  // Scripts, fuentes y demás: primero caché, se actualiza en segundo plano
  e.respondWith(caches.match(r).then(m=>{
    const net = fetch(r).then(res=>{ if(res && (res.ok||res.type==='opaque')) caches.open(V).then(c=>c.put(r,res.clone())); return res; }).catch(()=>m);
    return m || net;
  }));
});
