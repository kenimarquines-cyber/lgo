/* ==========================================================================
   ====   ENVÍO REAL DE CORREOS (EmailJS) — CONFIGURA AQUÍ  =================
   Para que los códigos y las invitaciones lleguen de VERDAD al correo de las
   personas (no simulado), esta app usa EmailJS (https://www.emailjs.com),
   un servicio gratuito que envía correos reales directo desde el navegador
   sin necesitar un servidor propio ni exponer contraseñas de correo.

   PASOS (tardan ~5 minutos, se hacen una sola vez):
   1. Crea una cuenta gratis en https://www.emailjs.com
   2. En "Email Services" conecta tu Gmail/Outlook (o el que uses) y copia el
      "Service ID".
   3. En "Email Templates" crea una plantilla con al menos estas variables:
      {{to_email}}, {{to_name}}, {{subject}}, {{message}}  — y copia el
      "Template ID".
   4. En "Account" copia tu "Public Key".
   5. Pega esos 3 valores abajo. Mientras dejes los valores de ejemplo,
      la app funcionará en modo de PRUEBA: mostrará el código en un aviso
      en pantalla en vez de enviarlo, para que puedas seguir probando.
   ========================================================================== */
const EMAILJS_CONFIG = {
  publicKey:  "ihJm8DFrHujIUIFhm",
  serviceId:  "service_bxb8nue",
  templateId: "template_m8zevno"
};
const EMAILJS_READY = EMAILJS_CONFIG.publicKey!=="TU_PUBLIC_KEY" && EMAILJS_CONFIG.serviceId!=="TU_SERVICE_ID" && EMAILJS_CONFIG.templateId!=="TU_TEMPLATE_ID";
let EMAIL_LOADING=null;
async function ensureEmailJS(){
  if(window.emailjs && EMAIL_LOADING) { await EMAIL_LOADING; return true; }
  if(!EMAILJS_READY) return false;
  try{
    EMAIL_LOADING = EMAIL_LOADING || loadScript("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js").then(()=>emailjs.init({publicKey: EMAILJS_CONFIG.publicKey}));
    await EMAIL_LOADING; return true;
  }catch(e){ EMAIL_LOADING=null; return false; }
}

async function sendRealEmail(toEmail, toName, subject, message, silent=false, fromQueue=false){
  if(!fromQueue && !isOnline()){ queueOp({type:'email', to:toEmail, name:toName, subject, message}); return false; }
  if(!EMAILJS_READY || !(await ensureEmailJS())){
    // Modo de prueba: sin credenciales de EmailJS no se puede enviar de verdad.
    if(!silent) toast(`(Modo de prueba, configura EmailJS) Correo a ${toEmail}: ${message}`, "info");
    console.log(`[CORREO NO ENVIADO — falta configurar EmailJS] Para: ${toEmail} | ${subject} | ${message}`);
    return false;
  }
  try{
    await withRetry(()=> emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
      to_email: toEmail, to_name: toName || toEmail, subject, message
    }), 2, 900);
    return true;
  }catch(e){
    console.error("Error enviando correo real:", e);
    if(!fromQueue && e && e.status===0){ queueOp({type:'email', to:toEmail, name:toName, subject, message}); return false; }
    if(!silent) toast(`No se pudo enviar el correo a ${toEmail}. Revisa tu configuración de EmailJS.`, "err");
    return false;
  }
}

/* ==========================================================================
   ====   PERSONALIZACIÓN DE ICONOS Y COLORES — EDITA AQUÍ  ================
   Pon aquí la URL o ruta de tus imágenes (png/svg/jpg). Si dejas la cadena
   vacía "" se usará un ícono de línea por defecto.
   ========================================================================== */
const LOGO_DATA_URL = ""; // opcional: URL liviana (svg/webp <10KB). Vacío = rayo SVG integrado (0 KB de red)
/* ★ MARCA ★ — aplica el logo y la imagen de fondo definidos en window.APP_BRAND (bloque al inicio del HTML, en <head>) */
function applyBrand(){
  const b = window.APP_BRAND || {}, r = document.documentElement.style;
  const px = (v,d)=> ((+v)||d)+'px', dim = v=> (+v) ? (+v)+'px' : 'auto';
  r.setProperty('--logo-w', px(b.logoSidebar && b.logoSidebar.w, 44)); r.setProperty('--logo-h', px(b.logoSidebar && b.logoSidebar.h, 44));
  r.setProperty('--logo-auth-w', px(b.logoAuth && b.logoAuth.w, 96)); r.setProperty('--logo-auth-h', px(b.logoAuth && b.logoAuth.h, 96));
  r.setProperty('--bgf-url', b.bgUrl ? 'url("'+String(b.bgUrl).replace(/"/g,'%22')+'")' : 'none');
  const d = b.bgDesktop || {}, m = b.bgMobile || {};
  r.setProperty('--bgf-w', dim(d.w)); r.setProperty('--bgf-h', dim(d.h)); r.setProperty('--bgf-opacity', d.opacity==null ? .3 : d.opacity); r.setProperty('--bgf-pos', (d.x||'50%')+' '+(d.y||'50%'));
  r.setProperty('--bgm-w', dim(m.w)); r.setProperty('--bgm-h', dim(m.h)); r.setProperty('--bgm-opacity', m.opacity==null ? .25 : m.opacity); r.setProperty('--bgm-pos', (m.x||'50%')+' '+(m.y||'50%'));
  document.querySelectorAll('.brand-mark[data-icon-slot="logo"]').forEach(el=>{
    const svg = ()=>{ el.classList.remove('has-logo'); el.innerHTML = ICONS_SVG.logo; };
    if(b.logoUrl){
      el.classList.add('has-logo'); el.innerHTML = '';
      const img = new Image(); img.alt = 'Electrotask'; img.decoding = 'async';
      img.onerror = svg; img.src = b.logoUrl; el.appendChild(img);
    } else svg();
  });
}
const CUSTOM_ICON_URLS = {
  logo:LOGO_DATA_URL, user:"", leader:"", participant:"", individual:"", bell:"", plus:"",
  camera:"", logout:"", menu:"", "chevron-left":"", "chevron-right":"", dot:"",
  close:"", lock:"", check:"", edit:"", trash:""
};
const THEME_DEFAULTS = {accent:"#F4FBFF", text:"#F2F4FC", bg:"#0A0E1C"};

const ICONS_SVG = {
  logo:'<svg viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  leader:'<svg viewBox="0 0 24 24"><path d="M12 2l2.5 5 5.5.8-4 4 1 5.5L12 15l-5 2.3 1-5.5-4-4L9.5 7z"/></svg>',
  participant:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2 21c0-3.6 3-6.5 7-6.5s7 2.9 7 6.5"/><path d="M16 4.5a3.2 3.2 0 1 1 0 6.4"/><path d="M17 14.3c2.5.5 4.5 2.5 5 6.7"/></svg>',
  individual:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M9 8l2 2 4-4" stroke="currentColor"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  camera:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
  logout:'<svg viewBox="0 0 24 24"><path d="M9 4H5v16h4"/><path d="M15 12H4"/><path d="M12 8l4 4-4 4"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  "chevron-left":'<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  "chevron-right":'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  dot:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check:'<svg viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>',
  edit:'<svg viewBox="0 0 24 24"><path d="M4 20l1-4 12-12 3 3-12 12z"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'
};
function iconHTML(name){
  const url = CUSTOM_ICON_URLS[name];
  if(url) return `<img src="${url}" alt="">`;
  return ICONS_SVG[name] || ICONS_SVG.dot;
}
function mountIcons(root){
  (root||document).querySelectorAll('[data-icon-slot]').forEach(el=>{
    if(el.dataset.mounted) return;
    el.classList.add('icon');
    el.innerHTML = iconHTML(el.dataset.iconSlot);
    el.dataset.mounted="1";
  });
}

/* ==========================================================================
   ALMACENAMIENTO — base de datos real en la nube (Firebase Firestore),
   con respaldo a localStorage si no la configuras.

   IMPORTANTE: localStorage vive SOLO dentro del navegador donde lo abriste.
   Por eso, si el líder crea el grupo en su PC y el participante entra desde
   su celular, cada quien tenía "su propia base de datos" y nunca se veían
   entre sí. Para que de verdad se compartan grupos, tareas y notificaciones
   entre dispositivos y cuentas distintas, se necesita un servidor real.

   Firebase (de Google) tiene un plan gratuito pensado justo para esto y se
   conecta directo desde el navegador, sin backend propio. Configúralo así
   (~5 minutos, una sola vez):
   1. Ve a https://console.firebase.google.com y crea un proyecto gratis.
   2. Dentro del proyecto entra a "Compilación" → "Firestore Database" →
      "Crear base de datos" → modo de producción (cualquier región).
   3. En "Reglas" de Firestore pega esto y publica (ver nota de seguridad
      abajo):
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} { allow read, write: if true; }
          }
        }
   4. Ve a ⚙️ "Configuración del proyecto" → baja hasta "Tus apps" → crea una
      "App web" (ícono </>) → copia el objeto de configuración que te da.
   5. Pega esos valores en FIREBASE_CONFIG abajo.

   NOTA DE SEGURIDAD: esas reglas dejan la base de datos abierta a quien
   tenga tu configuración (igual que cualquier app 100% del lado del
   navegador sin servidor propio). Es aceptable para probar o para un grupo
   cerrado de confianza, pero NO uses contraseñas reales importantes: la
   app ya guarda las contraseñas con una ofuscación simple, no cifrado
   real. Para algo con seguridad de verdad se necesitaría un backend con
   autenticación de servidor.

   Mientras dejes los valores de ejemplo, la app sigue funcionando pero
   SOLO en el navegador donde la abras (modo local, como antes).
   ========================================================================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyADHlRZAI9QnpdxpgznXkKvym7Mz_CW7QM",
  authDomain: "electrowork-e2322.firebaseapp.com",
  projectId: "electrowork-e2322",
  storageBucket: "electrowork-e2322.firebasestorage.app",
  messagingSenderId: "173476365406",
  appId: "1:173476365406:web:c20045dd309cbb6070e0cf"
};
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "TU_API_KEY" && !!window.firebase;
let PERSIST_OK = true;
let fireDb = null;
if(FIREBASE_READY){
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    fireDb = firebase.firestore();
    // Redes móviles y algunos proxies bloquean el canal en tiempo real de Firestore: eso causa
    // escrituras que no terminan, "Sincronizando…" eterno y recargas. Con esto cae solo a long-polling.
    try{ fireDb.settings({experimentalAutoDetectLongPolling:true, ignoreUndefinedProperties:true}); }catch(e){ console.warn('settings', e); }
    // Caché offline: si la conexión se corta un momento, Firestore sigue
    // sirviendo datos desde el caché local y encola tus cambios para
    // enviarlos en cuanto vuelva la señal, en vez de fallar de golpe.
    fireDb.enablePersistence({synchronizeTabs:true}).catch(err=>{
      PERSIST_OK = false; // se respalda con la cola propia (outbox)
      console.warn("No se pudo activar el caché offline de Firestore:", err.code);
    });
  }catch(e){ console.error("No se pudo inicializar Firebase:", e); }
}
/* ==========================================================================
   MODO OFFLINE
   - Tareas, listas, perfil, grupos: Firestore los guarda en el dispositivo (IndexedDB)
     y los sube solo al volver internet.
   - Invitaciones, notificaciones, correos y respuestas a invitaciones tocan datos de
     OTRAS personas: se guardan en una cola (outbox) y se ejecutan en orden al reconectar.
   ========================================================================== */
const OUTBOX_KEY = 'electrotask::outbox';
let PENDING_WRITES = 0, PENDING_SINCE = 0, FLUSHING = false, OFFLINE_WORK = false;
const isOnline = ()=> navigator.onLine !== false;
function obLoad(){ try{ return JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]'); }catch(e){ return []; } }
function obSave(a){ try{ localStorage.setItem(OUTBOX_KEY, JSON.stringify(a)); }catch(e){ console.error('outbox lleno', e); } updateNetBadge(); }
function obRemove(id){ obSave(obLoad().filter(o=>o.id!==id)); }
function obUpdate(op){ obSave(obLoad().map(o=>o.id===op.id?op:o)); }
function queueOp(op){
  op.id = uid('op'); op.ts = Date.now(); op.user = CURRENT_USER ? CURRENT_USER.email : null;
  const a = obLoad(); a.push(op); obSave(a); OFFLINE_WORK = true;
}
function needOnline(){
  if(isOnline()) return true;
  toast("Esta acción modifica datos de otras personas y necesita conexión. Inténtalo cuando vuelva internet.", "warn");
  return false;
}
function trackWrite(p){
  if(!isOnline()) OFFLINE_WORK = true;
  if(PENDING_WRITES===0) PENDING_SINCE = Date.now();
  PENDING_WRITES++; updateNetBadge(); setTimeout(updateNetBadge, 1700);
  const done = (e)=>{ if(e) console.error('escritura rechazada', e); PENDING_WRITES = Math.max(0, PENDING_WRITES-1); updateNetBadge(); };
  p.then(()=>done(), done);
}
async function fsRead(q){
  if(!isOnline()) return await q.get({source:'cache'});
  try{
    return await Promise.race([withRetry(()=>q.get()), new Promise((_,ko)=>setTimeout(()=>ko({code:'timeout'}),8000))]);
  }catch(e){
    if(e && (e.code==='timeout' || e.code==='unavailable')) return await q.get({source:'cache'});
    throw e;
  }
}
function updateNetBadge(){
  const el = document.getElementById('net-badge'); if(!el) return;
  const pend = PENDING_WRITES + obLoad().length;
  let txt = '', cls = '';
  if(!isOnline()){ txt = pend ? `Sin conexión · ${pend} cambio(s) guardado(s) en tu dispositivo` : 'Sin conexión · modo offline'; cls = 'off'; }
  else if(FLUSHING || obLoad().length || (PENDING_WRITES>0 && Date.now()-PENDING_SINCE>1500)){ txt = 'Sincronizando…'; cls = 'sync'; }
  el.className = 'net-badge '+cls; el.textContent = txt; el.style.display = txt ? 'block' : 'none';
}
async function runOp(op){
  if(op.type==='raw') return void await DB.set(op.key, op.value);
  if(op.type==='rawdel') return void await DB.del(op.key);
  if(op.type==='notify') return void await pushNotification(op.email, op.notif, true);
  if(op.type==='email'){
    const ok = await sendRealEmail(op.to, op.name, op.subject, op.message, true, true);
    if(!ok && !isOnline()) throw new Error('sin red');
    return;
  }
  if(op.type==='invite'){ const g = await loadGroup(op.code); if(g) await inviteEmailsToGroup(g, op.emails, true); return; }
  if(op.type==='respond') return void await respondToInviteRequest(op.notif, op.accept, true);
}
async function resyncView(){
  invalidateTasksCache(); LISTS_CACHE={key:null,lists:null}; Object.keys(GROUP_CACHE).forEach(k=>delete GROUP_CACHE[k]);
  if(CURRENT_USER && document.getElementById('screen-dashboard').classList.contains('active')) await renderView();
}
async function flushOutbox(){
  if(FLUSHING || !isOnline() || !CURRENT_USER) return;
  FLUSHING = true; updateNetBadge();
  try{
    for(const op of obLoad().filter(o=>!o.user || o.user===CURRENT_USER.email)){
      try{ await runOp(op); obRemove(op.id); }
      catch(e){
        if(!isOnline()) break;
        op.tries = (op.tries||0)+1; console.error('tarea pendiente falló', op, e);
        if(op.tries>=5) obRemove(op.id); else obUpdate(op);
      }
    }
    if(fireDb){ try{ await Promise.race([fireDb.waitForPendingWrites(), new Promise(r=>setTimeout(r,15000))]); }catch(e){} }
  } finally { FLUSHING = false; updateNetBadge(); }
  if(OFFLINE_WORK && isOnline() && !obLoad().length){
    OFFLINE_WORK = false;
    toast("Todo sincronizado ✓ Tus cambios sin conexión ya están en la nube.", "ok");
    await resyncView();
  }
}
let OFFLINE_T = null, OFFLINE_SHOWN = false;
window.addEventListener('offline', ()=>{
  updateNetBadge(); clearTimeout(OFFLINE_T);
  OFFLINE_T = setTimeout(()=>{ if(!isOnline()){ OFFLINE_SHOWN = true; toast("Sin conexión. Puedes seguir trabajando: todo se guarda en tu dispositivo y se sube al volver internet.", "warn"); } }, 2500); // ignora microcortes del celular
});
window.addEventListener('online', ()=>{
  clearTimeout(OFFLINE_T); updateNetBadge();
  if(OFFLINE_SHOWN){ OFFLINE_SHOWN = false; toast("Conexión recuperada. Sincronizando tus cambios…", "ok"); }
  flushOutbox();
});
setInterval(()=>{
  if(isOnline() && (obLoad().length || OFFLINE_WORK)) flushOutbox();
  // Vigilante: si hay internet pero una escritura lleva >20 s sin confirmarse, reinicia el canal de Firestore
  if(fireDb && isOnline() && PENDING_WRITES>0 && Date.now()-PENDING_SINCE>20000){
    PENDING_SINCE = Date.now();
    fireDb.disableNetwork().then(()=>fireDb.enableNetwork()).catch(()=>{});
  }
}, 15000);
updateNetBadge();
if(FIREBASE_CONFIG.apiKey!=="TU_API_KEY" && !window.firebase) setTimeout(()=>toast("No se pudo cargar Firebase. Conéctate a internet una vez para activar el modo offline.", "err"), 1200);
if(!/^https?:$/.test(location.protocol)){
  try{ if(!sessionStorage.getItem('et_local_warn')){ sessionStorage.setItem('et_local_warn','1');
    setTimeout(()=>toast("Estás usando una copia del archivo (WhatsApp/Archivos). En el celular puede perder la sesión y fallar la conexión. Publícala en Firebase Hosting (HTTPS) para que sea estable.", "warn"), 3500); } }catch(e){}
}
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(()=>{});

const LS_PREFIX = "electrotask::";
const LOCAL_DB = {
  async get(key){
    try{ const raw = localStorage.getItem(LS_PREFIX+key); return raw ? JSON.parse(raw) : null; }
    catch(e){ console.error("storage get failed", key, e); return null; }
  },
  async set(key, value){
    try{ localStorage.setItem(LS_PREFIX+key, JSON.stringify(value)); return true; }
    catch(e){ console.error("storage set failed", key, e); toast("No se pudo guardar (¿memoria local llena?)", "err"); return false; }
  },
  async del(key){ try{ localStorage.removeItem(LS_PREFIX+key); }catch(e){} },
  async list(prefix){
    try{
      const out = [];
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && k.startsWith(LS_PREFIX+prefix)) out.push(k.slice(LS_PREFIX.length));
      }
      return out;
    }catch(e){ return []; }
  },
  // Igual que list(), pero devuelve el valor ya leído (en local no cambia nada,
  // pero mantiene la misma forma que CLOUD_DB.listValues para que el resto del
  // código funcione igual en ambos modos).
  async listValues(prefix){
    const keys = await this.list(prefix);
    const out = [];
    for(const k of keys){ const v = await this.get(k); if(v!==null) out.push(v); }
    return out;
  },
  async byField(prefix, field, val){ return (await this.listValues(prefix)).filter(v=>v && v[field]===val); },
  async listEntries(prefix){
    const keys = await this.list(prefix);
    const out = [];
    for(const k of keys){ const v = await this.get(k); if(v!==null) out.push({key:k, value:v}); }
    return out;
  }
};
// Reintenta una operación de red hasta 3 veces con una pequeña espera entre
// intentos — para que un corte breve de wifi/datos no se sienta como una
// "caída" de la app, sino como un pequeño instante de espera.
async function withRetry(fn, tries=2, delayMs=500){
  let lastErr;
  for(let i=0;i<tries;i++){
    try{ return await fn(); }
    catch(e){
      lastErr = e;
      if(e && (e.code==='permission-denied' || e.code==='invalid-argument')) break; // no sirve reintentar esto
      if(i<tries-1) await new Promise(r=>setTimeout(r, delayMs*(i+1)));
    }
  }
  throw lastErr;
}
const CLOUD_DB = {
  col(){ return fireDb.collection('electrotask_store'); },
  async get(key){
    try{ const snap = await fsRead(this.col().doc(key)); return snap.exists ? snap.data().value : null; }
    catch(e){ console.error("firestore get failed", key, e); return null; }
  },
  async set(key, value){
    try{
      if(!PERSIST_OK && !isOnline()) queueOp({type:'raw', key, value});
      const p = this.col().doc(key).set({key, value});
      trackWrite(p);
      if(!isOnline()) return true; // Firestore lo guarda en el dispositivo y lo sube solo al volver internet
      await Promise.race([p, new Promise(r=>setTimeout(r,4000))]); // si tarda, queda en cola sin bloquear la app
      return true;
    }
    catch(e){
      console.error("firestore set failed", key, e);
      const approxSize = JSON.stringify(value).length;
      if(approxSize > 900000){
        toast("No se pudo guardar: ese dato pesa demasiado (límite de Firestore: 1MB por documento). Si era una foto, prueba con una más liviana.", "err");
      } else if(!navigator.onLine){
        toast("Sin conexión a internet. Se reintentará automáticamente cuando vuelva la señal.", "warn");
      } else if(e && e.code==='permission-denied'){
        toast("Firebase rechazó el guardado por permisos. Revisa que publicaste las reglas de Firestore (allow read, write: if true).", "err");
      } else if(e && e.code==='resource-exhausted'){
        toast("Se alcanzó el límite gratuito de Firebase por hoy. Vuelve a intentar más tarde o revisa la cuota en tu consola de Firebase.", "err");
      } else {
        const code = e && e.code ? ` (código: ${e.code})` : "";
        toast(`No se pudo guardar en la nube${code}. Puede ser un corte breve de conexión — reintentando solo no funcionó, prueba de nuevo en un momento.`, "err");
      }
      return false;
    }
  },
  async del(key){
    try{
      const p = this.col().doc(key).delete(); trackWrite(p);
      if(!isOnline()){ if(!PERSIST_OK) queueOp({type:'rawdel', key}); return; }
      await Promise.race([p, new Promise(r=>setTimeout(r,4000))]);
    }catch(e){ console.error("firestore del failed", key, e); }
  },
  async list(prefix){
    try{
      const snap = await fsRead(this.col().where('key','>=',prefix).where('key','<',prefix+'\uf8ff'));
      return snap.docs.map(d=>d.data().key);
    }catch(e){ console.error("firestore list failed", prefix, e); return []; }
  },
  // CLAVE PARA EL RENDIMIENTO: una consulta ya trae los documentos completos
  // (clave Y valor). Antes se pedía la lista de claves y LUEGO se pedía cada
  // documento uno por uno (1 + N viajes de red) — eso era la causa principal
  // del retraso al abrir un grupo o crear tareas. Ahora es un solo viaje.
  async listValues(prefix){
    try{
      const snap = await fsRead(this.col().where('key','>=',prefix).where('key','<',prefix+'\uf8ff'));
      return snap.docs.map(d=>d.data().value).filter(v=>v!==undefined && v!==null);
    }catch(e){ console.error("firestore listValues failed", prefix, e); return []; }
  },
  // Consulta filtrada EN EL SERVIDOR (un solo campo, sin índice compuesto):
  // solo baja los documentos de TU espacio, no los de todos los usuarios.
  async byField(prefix, field, val){
    try{
      const snap = await fsRead(this.col().where('value.'+field,'==',val));
      return snap.docs.filter(d=>d.id.startsWith(prefix)).map(d=>d.data().value).filter(v=>v!==undefined && v!==null);
    }catch(e){ console.error("firestore byField failed", prefix, field, e); return []; }
  },
  async listEntries(prefix){
    try{
      const snap = await fsRead(this.col().where('key','>=',prefix).where('key','<',prefix+'\uf8ff'));
      return snap.docs.map(d=>({key:d.id, value:d.data().value})).filter(e=>e.value!==undefined && e.value!==null);
    }catch(e){ console.error("firestore listEntries failed", prefix, e); return []; }
  }
};
// Sesión (quién está logueado en ESTE navegador) siempre queda local a cada
// dispositivo — eso es normal y correcto: cada quien inicia sesión por su lado.
const DB = FIREBASE_READY ? CLOUD_DB : LOCAL_DB;
const SESSION_DB = LOCAL_DB;

/* (Se eliminó el envío por SMS/teléfono: ahora los avisos van por notificaciones push web y correo.) */

/* ---------------- utilidades ---------------- */
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function loadScript(src){ return new Promise((ok,ko)=>{ const el=document.createElement('script'); el.src=src; el.onload=ok; el.onerror=ko; document.head.appendChild(el); }); }
function setPerf(){ document.documentElement.dataset.perf = 'full'; if(typeof dripKick==='function') dripKick(); }
function uid(prefix){ return prefix+"_"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4); }
function randomCode(){ const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=c[Math.floor(Math.random()*c.length)]; return s; }
function random6digits(){ return String(Math.floor(100000+Math.random()*900000)); }
function simpleHash(str){ // ofuscación simple, NO es criptografía real
  let h=0; for(let i=0;i<str.length;i++){ h=(h<<5)-h+str.charCodeAt(i); h|=0; }
  return "h"+Math.abs(h).toString(36)+btoa(unescape(encodeURIComponent(str))).slice(0,12);
}
function initials(name){ return (name||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
function pad(n){ return String(n).padStart(2,"0"); }
function toISODate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fmtDateLong(iso){
  const d = new Date(iso+"T00:00:00");
  return d.toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long'});
}
function toast(msg, type="info"){
  if(type==="err") playSound('error');
  const box = document.createElement('div');
  const colors = {info:"var(--blue)", ok:"var(--ok)", warn:"var(--orange)", err:"var(--red)"};
  box.className = "toast glass";
  box.style.borderLeft = `4px solid ${colors[type]||colors.info}`;
  box.innerHTML = `<span class="icon" style="color:${colors[type]||colors.info}">${iconHTML(type==='ok'?'check':type==='err'?'close':'bell')}</span><p>${esc(msg)}</p>`;
  document.getElementById('toast-container').appendChild(box);
  const duration = (type==='warn'||type==='err') ? 9000 : 4200;
  setTimeout(()=>{ box.style.transition="opacity .3s"; box.style.opacity="0"; setTimeout(()=>box.remove(),300); }, duration);
}
function simulateSend(channel, destination, message){
  // No hay backend real de correo/SMS disponible en este entorno.
  // Esto simula el envío y dispone el contenido en consola + bandeja interna.
  console.log(`[SIMULADO ${channel.toUpperCase()} -> ${destination}] ${message}`);
}

/* ---------------- estado en memoria ---------------- */
let CURRENT_USER = null;       // objeto usuario completo
let CURRENT_SPACE = {type:'individual', groupCode:null}; // vista activa
let CAL_VIEW = new Date();     // mes visible
let SELECTED_DATE = toISODate(new Date());
let ALL_USERS_CACHE = {};      // email -> user (para mostrar nombre/foto sin exponer datos sensibles)
let PENDING_PHOTO_DATA = null;

/* ==================== PERSISTENCIA: helpers de modelo ==================== */
async function saveUser(user){ await DB.set('users:'+user.email, user); ALL_USERS_CACHE[user.email]=user; }
async function loadUser(email){ const u = await DB.get('users:'+email); if(u) ALL_USERS_CACHE[email]=u; return u; }
const GROUP_CACHE = {};
async function saveGroup(group){ await DB.set('groups:'+group.code, group); GROUP_CACHE[group.code]=group; }
async function loadGroup(code){
  const g = await DB.get('groups:'+code);
  if(g) GROUP_CACHE[code]=g; else delete GROUP_CACHE[code];
  return g;
}
// Versión rápida para lecturas de UI que toleran datos de hace unos
// segundos (evita golpear la red muchas veces seguidas para lo mismo).
async function loadGroupCached(code){
  if(GROUP_CACHE[code]) return GROUP_CACHE[code];
  return await loadGroup(code);
}
async function saveTask(task){ await DB.set('tasks:'+task.id, task); invalidateTasksCache(); }
async function loadTask(id){ return await DB.get('tasks:'+id); }
async function deleteTaskDb(id){ await DB.del('tasks:'+id); invalidateTasksCache(); }

/* -------- Listas personalizadas (agrupación de tareas) -------- */
let LISTS_CACHE = {key:null, lists:null};
async function saveList(list){ await DB.set('lists:'+list.id, list); LISTS_CACHE={key:null,lists:null}; }
async function deleteListDb(id){ await DB.del('lists:'+id); LISTS_CACHE={key:null,lists:null}; }
async function getListsForSpace(force){
  const key = currentSpaceKey();
  if(!force && LISTS_CACHE.key===key && LISTS_CACHE.lists) return LISTS_CACHE.lists;
  const all = CURRENT_SPACE.type==='individual' ? await DB.byField('lists:','ownerEmail',CURRENT_USER.email) : await DB.byField('lists:','groupCode',CURRENT_SPACE.groupCode);
  const lists = all.filter(l=>{
    if(!l) return false;
    if(CURRENT_SPACE.type==='individual') return l.scope==='individual' && l.ownerEmail===CURRENT_USER.email;
    return l.scope==='group' && l.groupCode===CURRENT_SPACE.groupCode;
  });
  LISTS_CACHE = {key, lists};
  return lists;
}
function notificationEmailSubject(type){
  const subjects = {
    invite_request:"Te invitaron a un grupo — Electrotask",
    join:"Nuevo integrante en tu grupo — Electrotask",
    decision:"Respuesta a tu invitación — Electrotask",
    proposal:"Nueva tarea propuesta — Electrotask",
    done:"Tarea completada — Electrotask",
    reschedule:"Tarea reprogramada — Electrotask",
    group_deleted:"Un grupo fue eliminado — Electrotask",
    member_removed:"Fuiste eliminado de un grupo — Electrotask",
    role:"Cambio de rol en tu grupo — Electrotask",
    member_left:"Un integrante salió de tu grupo — Electrotask",
    creation:"Nueva tarea asignada — Electrotask",
    modification:"Una tarea fue modificada — Electrotask",
    deletion:"Una tarea fue eliminada — Electrotask"
  };
  return subjects[type] || "Notificación de Electrotask";
}
async function pushNotification(email, notif, fromQueue){
  notif.createdAt = notif.createdAt || Date.now();
  if(!fromQueue && !isOnline()){ queueOp({type:'notify', email, notif}); return; }
  const key = 'notifs:'+email;
  const list = (await DB.get(key)) || [];
  notif.id = uid('n'); notif.read=false;
  list.unshift(notif);
  await DB.set(key, pruneNotifs(list).slice(0,200)); // se conserva el historial (máx. 30 días)
  const recipient = await findUserByEmail(email);
  sendRealEmail(email, recipient? recipient.name : "", notificationEmailSubject(notif.type), notif.text, true).catch(()=>{}); // sin await: no bloquea la UI
}
const NOTIF_MAX_AGE = 30*24*60*60*1000; // 30 días
const pruneNotifs = list => (list||[]).filter(n=>n && (!n.createdAt || Date.now()-n.createdAt < NOTIF_MAX_AGE));
async function getNotifications(email){ return pruneNotifs((await DB.get('notifs:'+email)) || []); }

async function findUserByEmail(email){
  if(ALL_USERS_CACHE[email]) return ALL_USERS_CACHE[email];
  return await loadUser(email);
}

/* ==================== SESIÓN ==================== */
async function persistSession(email){ await SESSION_DB.set('session', {email}); }
async function clearSession(){ await SESSION_DB.del('session'); }
async function getSession(){ return await SESSION_DB.get('session'); }

/* ==================== NAVEGACIÓN DE PANTALLAS ==================== */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  mountIcons();
  dripResize(); dripKick();
}
function openModal(id){ document.getElementById(id).classList.add('active'); mountIcons(); }
function closeModal(id){ document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('active'); }));

/* ==================== ANIMACIÓN DE GOTEO ==================== */
const DRIPS = [], DRIP_COLORS = ["#3D6BFF","#FF3B5C","#FF8A3D","#C6FF3D","#9B5CFF"];
let dripRaf = 0, dripLast = 0, dripTick = 0;
function startDrip(canvasId){
  const c = document.getElementById(canvasId); if(!c) return;
  DRIPS.push({c, ctx:c.getContext('2d'), drops:[], w:0, h:0});
}
function dripOn(d){ return d.c.parentElement.classList.contains('active'); }
function dripResize(){ DRIPS.forEach(d=>{ if(dripOn(d)){ d.w=d.c.width=d.c.parentElement.clientWidth; d.h=d.c.height=d.c.parentElement.clientHeight; } }); }
function dripKick(){ if(!dripRaf && !document.hidden) dripRaf = requestAnimationFrame(dripLoop); }
function dripLoop(ts){
  dripRaf = 0;
  const act = DRIPS.filter(dripOn);
  if(!act.length || document.hidden) return; // se detiene solo; showScreen/visibilitychange lo reactivan
  if(document.documentElement.dataset.perf==='lite' || matchMedia('(prefers-reduced-motion:reduce)').matches){
    act.forEach(d=>d.ctx.clearRect(0,0,d.w,d.h)); return;
  }
  dripRaf = requestAnimationFrame(dripLoop);
  if(ts-dripLast < 33) return; dripLast = ts; dripTick++;
  act.forEach(d=>{
    const ctx = d.ctx, floorY = d.h*0.94;
    ctx.clearRect(0,0,d.w,d.h);
    if(dripTick%9===0 && d.drops.length<22) d.drops.push({x:Math.random()*d.w,y:-20,len:14+Math.random()*26,speed:4+Math.random()*7,color:DRIP_COLORS[Math.floor(Math.random()*5)],w:2+Math.random()*2.5,splash:false,splashR:0,opacity:1});
    d.drops.forEach(p=>{
      if(!p.splash){
        p.y += p.speed;
        ctx.strokeStyle=p.color; ctx.globalAlpha=.75; ctx.lineWidth=p.w; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,p.y+p.len); ctx.stroke();
        if(p.y+p.len>=floorY) p.splash=true;
      } else {
        p.splashR += 4.4; p.opacity -= 0.09;
        ctx.strokeStyle=p.color; ctx.globalAlpha=Math.max(p.opacity,0); ctx.lineWidth=2;
        ctx.beginPath(); ctx.ellipse(p.x,floorY,p.splashR,p.splashR*0.32,0,0,Math.PI*2); ctx.stroke();
      }
    });
    ctx.globalAlpha=1;
    d.drops = d.drops.filter(p=>!(p.splash && p.opacity<=0));
  });
}
let dripResizeT; window.addEventListener('resize', ()=>{ clearTimeout(dripResizeT); dripResizeT=setTimeout(dripResize,150); });
/* ==================== AUTENTICACIÓN ==================== */
document.querySelectorAll('[data-auth-tab]').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('[data-auth-tab]').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('form-login').classList.toggle('active', tab.dataset.authTab==='login');
    document.getElementById('form-register').classList.toggle('active', tab.dataset.authTab==='register');
  });
});

document.getElementById('form-register').addEventListener('submit', async e=>{
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass = document.getElementById('reg-password').value;
  const pass2 = document.getElementById('reg-password2').value;
  const err = document.getElementById('register-error'); err.textContent="";
  if(pass.length<6){ err.textContent="La contraseña debe tener al menos 6 caracteres."; return; }
  if(pass!==pass2){ err.textContent="Las contraseñas no coinciden."; return; }
  const existing = await loadUser(email);
  if(existing){ err.textContent="Ya existe una cuenta con ese correo."; return; }
  const user = {
    email, name, passwordHash: simpleHash(pass), phone:"", photo:"",
    theme:{accent:"#3D6BFF", text:"#F2F4FC", bg:"#0A0E1C"},
    groups:[], individualTasks:[], createdAt: Date.now()
  };
  await saveUser(user);
  // invitaciones hechas antes de registrarse: se convierten en solicitudes
  // que la persona debe aceptar o rechazar (no se agregan automáticamente).
  const pendingInvites = (await DB.get('pending_invites:'+email)) || [];
  for(const code of pendingInvites){
    const group = await loadGroup(code);
    if(group && !group.members.includes(email)){
      const inviter = await loadUser(CURRENT_USER.email);
      group.pendingInvites = group.pendingInvites || [];
      if(!group.pendingInvites.includes(email)) group.pendingInvites.push(email);
      await saveGroup(group);
      await pushNotification(email, {
        type:'invite_request',
        text:`${inviter? inviter.name : 'El líder'} te invitó al grupo "${group.name}". ¿Aceptas unirte?`,
        groupCode: group.code, groupName: group.name, inviterEmail: CURRENT_USER.email
      });
    }
  }
  await DB.del('pending_invites:'+email);
  toast("Cuenta creada. Ahora inicia sesión con tu correo y contraseña.", "ok");
  document.getElementById('form-register').reset();
  document.querySelector('[data-auth-tab="login"]').click();
  document.getElementById('login-email').value = email;
});

document.getElementById('form-login').addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;
  const err = document.getElementById('login-error'); err.textContent="";
  const user = await loadUser(email);
  if(!user || user.passwordHash !== simpleHash(pass)){ err.textContent="Correo o contraseña incorrectos."; return; }
  await loginAs(email);
});

async function loginAs(email){
  CURRENT_USER = await loadUser(email);
  if(!CURRENT_USER){
    toast("No se pudo cargar tu cuenta. Intenta de nuevo.", "err");
    return;
  }
  await persistSession(email);
  document.getElementById('login-email').value="";
  document.getElementById('login-password').value="";
  if(!CURRENT_USER.onboarded && CURRENT_USER.groups.length===0){
    showScreen('screen-role');
  } else {
    CURRENT_SPACE = await resolveInitialSpace(CURRENT_USER);
    await enterDashboard();
  }
}

// Decide qué espacio mostrar al entrar: el último que se usó si sigue siendo
// válido, si no el primer grupo disponible, y si no tiene ninguno, individual.
async function resolveInitialSpace(user){
  if(user.lastSpace){
    if(user.lastSpace.type==='individual') return {type:'individual', groupCode:null};
    if(user.lastSpace.type==='group' && user.groups.includes(user.lastSpace.groupCode)){
      const g = await loadGroup(user.lastSpace.groupCode);
      if(g) return {type:'group', groupCode:user.lastSpace.groupCode};
    }
  }
  if(user.groups.length) return {type:'group', groupCode:user.groups[0]};
  return {type:'individual', groupCode:null};
}

// Cambia de espacio activo (barra lateral) y lo recuerda para la próxima vez.
async function setActiveSpace(space){
  CURRENT_SPACE = space;
  CURRENT_USER.lastSpace = space;
  saveUser(CURRENT_USER); // sin await: cambiar de espacio ya no espera a la red
  await renderSidebar();
  await renderView();
  closeMobileSidebar();
}

async function doLogout(){
  if(NOTIF_UNSUB){ try{ NOTIF_UNSUB(); }catch(e){} NOTIF_UNSUB = null; }
  await clearSession();
  CURRENT_USER=null;
  showScreen('screen-auth');
  toast("Sesión cerrada", "info");
}


/* ---------- recuperar contraseña ---------- */
document.getElementById('go-forgot').addEventListener('click', ()=> showScreen('screen-forgot'));
document.getElementById('back-to-login-1').addEventListener('click', ()=> showScreen('screen-auth'));
document.getElementById('back-to-login-2').addEventListener('click', ()=> showScreen('screen-auth'));

document.getElementById('form-forgot-step1').addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const err = document.getElementById('forgot-error1'); err.textContent="";
  const user = await loadUser(email);
  if(!user){ err.textContent="No existe una cuenta con ese correo."; return; }
  const code = random6digits();
  user.resetCode = code; user.resetExpires = Date.now()+15*60*1000;
  await saveUser(user);
  const sent = await sendRealEmail(email, user.name, "Tu código de recuperación de Electrotask",
    `Hola ${user.name}, tu código para recuperar tu contraseña es ${code}. Vence en 15 minutos. Si no fuiste tú, ignora este correo.`);
  if(sent) toast("Te enviamos un código a tu correo. Revisa tu bandeja de entrada (y spam).", "ok");
  document.getElementById('forgot-sub').textContent = "Ingresa el código y tu nueva contraseña";
  document.getElementById('form-forgot-step1').classList.remove('active');
  document.getElementById('form-forgot-step2').classList.add('active');
  document.getElementById('form-forgot-step2').dataset.email = email;
});

document.getElementById('form-forgot-step2').addEventListener('submit', async e=>{
  e.preventDefault();
  const email = e.target.dataset.email;
  const code = document.getElementById('forgot-code').value.trim();
  const p1 = document.getElementById('forgot-newpass').value;
  const p2 = document.getElementById('forgot-newpass2').value;
  const err = document.getElementById('forgot-error2'); err.textContent="";
  const user = await loadUser(email);
  if(!user || user.resetCode!==code || Date.now()>user.resetExpires){ err.textContent="Código inválido o expirado."; return; }
  if(p1.length<6){ err.textContent="La contraseña debe tener al menos 6 caracteres."; return; }
  if(p1!==p2){ err.textContent="Las contraseñas no coinciden."; return; }
  user.passwordHash = simpleHash(p1); delete user.resetCode; delete user.resetExpires;
  await saveUser(user);
  toast("Contraseña actualizada. Ya puedes iniciar sesión.", "ok");
  document.getElementById('form-forgot-step2').classList.remove('active');
  document.getElementById('form-forgot-step1').classList.add('active');
  document.getElementById('forgot-sub').textContent = "Te enviaremos un código de verificación a tu correo";
  showScreen('screen-auth');
});

/* ==================== SELECCIÓN DE ROL / ESPACIOS ==================== */
document.getElementById('role-leader').addEventListener('click', ()=> showScreen('screen-create-group'));
document.getElementById('role-participant').addEventListener('click', ()=> showScreen('screen-join-group'));
document.getElementById('role-individual').addEventListener('click', async ()=>{
  CURRENT_USER.onboarded = true;
  CURRENT_USER.lastSpace = {type:'individual', groupCode:null};
  await saveUser(CURRENT_USER);
  CURRENT_SPACE = {type:'individual', groupCode:null};
  await enterDashboard();
});
document.getElementById('back-role-1').addEventListener('click', ()=> showScreen('screen-role'));
document.getElementById('back-role-2').addEventListener('click', ()=> showScreen('screen-role'));

let BUSY_CREATE_GROUP = false;
document.getElementById('btn-create-group').addEventListener('click', async ()=>{
  if(BUSY_CREATE_GROUP) return;
  const btn = document.getElementById('btn-create-group');
  const name = document.getElementById('group-name').value.trim();
  const emailsRaw = document.getElementById('group-emails').value.trim();
  const err = document.getElementById('create-group-error'); err.textContent="";
  if(!name){ err.textContent="Ponle un nombre a tu grupo."; return; }
  BUSY_CREATE_GROUP = true;
  const originalLabel = btn.textContent;
  btn.disabled = true; btn.textContent = "Creando...";
  try{
    const leaderOwned = await countGroupsLedBy(CURRENT_USER.email);
    if(leaderOwned>=10){ err.textContent="Ya tienes 10 grupos creados (el máximo permitido)."; return; }
    let code = randomCode();
    while(await loadGroup(code)) code = randomCode();
    const group = { code, name, leaderEmail: CURRENT_USER.email, members:[CURRENT_USER.email], joined:{[CURRENT_USER.email]: toISODate(new Date())}, createdAt: Date.now() };
    await saveGroup(group);
    CURRENT_USER.groups.push(code);
    CURRENT_USER.onboarded = true;
    CURRENT_USER.lastSpace = {type:'group', groupCode:code};
    await saveUser(CURRENT_USER);

    if(emailsRaw){
      await inviteEmailsToGroup(group, emailsRaw);
    }

    document.getElementById('group-name').value=""; document.getElementById('group-emails').value="";
    toast("Grupo creado con éxito.", "ok");
    CURRENT_SPACE = {type:'group', groupCode: code};
    await enterDashboard();
    showGroupCodeInfo(group);
  } finally {
    BUSY_CREATE_GROUP = false;
    btn.disabled = false; btn.textContent = originalLabel;
  }
});

async function countGroupsLedBy(email){
  const groups = await DB.byField('groups:','leaderEmail',email);
  return groups.filter(g=>g && g.leaderEmail===email).length;
}
function showGroupCodeInfo(group){
  toast(`Código de invitación de "${group.name}": ${group.code}`, "info");
}

// Reutilizable: invita participantes (por correo) a un grupo ya existente.
// Ya NO los agrega directo: les llega una notificación para ACEPTAR o
// RECHAZAR, y solo quedan dentro del grupo si aceptan.
async function inviteEmailsToGroup(group, emailsRaw, fromQueue){
  if(!fromQueue && !isOnline()){
    queueOp({type:'invite', code: group.code, emails: emailsRaw});
    toast("Sin conexión: las invitaciones y correos se enviarán solos cuando vuelva internet.", "warn");
    return;
  }
  const emails = emailsRaw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  group.pendingInvites = group.pendingInvites || [];
  let sentCount = 0, skipped = 0;
  for(const em of emails){
    if(em===group.leaderEmail || group.members.includes(em) || group.pendingInvites.includes(em)){ skipped++; continue; }
    const existing = await loadUser(em);
    if(existing){
      group.pendingInvites.push(em);
      await pushNotification(em, {
        type:'invite_request',
        text:`${CURRENT_USER.name} te invitó al grupo "${group.name}". ¿Aceptas unirte?`,
        groupCode: group.code, groupName: group.name, inviterEmail: CURRENT_USER.email
      });
      sentCount++;
    } else {
      const pend = (await DB.get('pending_invites:'+em)) || [];
      if(!pend.includes(group.code)) pend.push(group.code);
      await DB.set('pending_invites:'+em, pend);
      await sendRealEmail(em, "", `Te invitaron al grupo "${group.name}" en Electrotask`,
        `${CURRENT_USER.name} te invitó al grupo "${group.name}" en Electrotask. Regístrate con este mismo correo (${em}) para ver la invitación y aceptarla, o usa el código ${group.code} para unirte directo.`, true);
      sentCount++;
    }
  }
  await saveGroup(group);
  if(sentCount) toast(`Invitación enviada a ${sentCount} persona(s). Aparecerá en sus notificaciones para aceptar o rechazar.`, "ok");
  if(skipped) toast(`${skipped} correo(s) ya son miembros o ya tienen una invitación pendiente.`, "info");
}

// El invitado acepta o rechaza una invitación a grupo desde sus notificaciones.
async function respondToInviteRequest(notif, accept, fromQueue){
  if(!fromQueue && !isOnline()){
    if(!obLoad().some(o=>o.type==='respond' && o.notif && o.notif.id===notif.id)) queueOp({type:'respond', notif, accept});
    toast("Sin conexión: tu respuesta se enviará automáticamente cuando vuelva internet.", "warn");
    return;
  }
  const group = await loadGroup(notif.groupCode);
  if(!group){ toast("Ese grupo ya no existe.", "err"); return; }
  group.pendingInvites = (group.pendingInvites||[]).filter(e=>e!==CURRENT_USER.email);
  if(accept){
    if(!group.members.includes(CURRENT_USER.email)){ group.members.push(CURRENT_USER.email); group.joined = group.joined||{}; group.joined[CURRENT_USER.email] = toISODate(new Date()); }
    if(!CURRENT_USER.groups.includes(group.code)) CURRENT_USER.groups.push(group.code);
    CURRENT_USER.onboarded = true;
    await saveUser(CURRENT_USER);
    await notifyLeaders(group, {type:'join', text:`${CURRENT_USER.name} aceptó tu invitación y se unió a "${group.name}".`});
    toast(`Te uniste a "${group.name}"`, "ok");
  } else {
    await notifyLeaders(group, {type:'decision', text:`${CURRENT_USER.name} rechazó tu invitación al grupo "${group.name}".`});
    toast("Invitación rechazada.", "info");
  }
  await saveGroup(group);
  const list = await getNotifications(CURRENT_USER.email);
  await DB.set('notifs:'+CURRENT_USER.email, list.filter(n=>n.id!==notif.id));
  await renderSidebar(); await renderView();
  openNotifModal();
}


let BUSY_JOIN_GROUP = false;
document.getElementById('btn-join-group').addEventListener('click', async ()=>{
  if(BUSY_JOIN_GROUP) return;
  const btn = document.getElementById('btn-join-group');
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  const err = document.getElementById('join-group-error'); err.textContent="";
  if(!code){ err.textContent="Escribe el código del grupo."; return; }
  if(!isOnline()){ err.textContent="Para unirte a un grupo necesitas conexión a internet."; return; }
  BUSY_JOIN_GROUP = true; const originalLabel = btn.textContent;
  btn.disabled = true; btn.textContent = "Uniendo...";
  try{
    const group = await loadGroup(code);
    if(!group){ err.textContent="No existe un grupo con ese código."; return; }
    if(!group.members.includes(CURRENT_USER.email)){ group.members.push(CURRENT_USER.email); group.joined = group.joined||{}; group.joined[CURRENT_USER.email] = toISODate(new Date()); }
    await saveGroup(group);
    if(!CURRENT_USER.groups.includes(code)) CURRENT_USER.groups.push(code);
    CURRENT_USER.onboarded = true;
    CURRENT_USER.lastSpace = {type:'group', groupCode:code};
    await saveUser(CURRENT_USER);
    await notifyLeaders(group, {type:'join', text:`${CURRENT_USER.name} se unió al grupo "${group.name}".`});
    document.getElementById('join-code').value="";
    toast(`Te uniste a "${group.name}"`, "ok");
    CURRENT_SPACE = {type:'group', groupCode: code};
    await enterDashboard();
  } finally {
    BUSY_JOIN_GROUP = false;
    btn.disabled = false; btn.textContent = originalLabel;
  }
});

document.getElementById('btn-invite-participants').addEventListener('click', async ()=>{
  const code = document.getElementById('btn-invite-participants').dataset.groupCode;
  document.getElementById('invite-group-code').textContent = code;
  document.getElementById('invite-emails').value="";
  document.getElementById('invite-error').textContent="";
  openModal('modal-invite');
});
let BUSY_SEND_INVITE = false;
document.getElementById('btn-send-invite').addEventListener('click', async ()=>{
  if(BUSY_SEND_INVITE) return;
  const btn = document.getElementById('btn-send-invite');
  const code = document.getElementById('btn-invite-participants').dataset.groupCode;
  const err = document.getElementById('invite-error'); err.textContent="";
  const emailsRaw = document.getElementById('invite-emails').value.trim();
  if(!emailsRaw){ err.textContent="Escribe al menos un correo."; return; }
  BUSY_SEND_INVITE = true; const originalLabel = btn.textContent;
  btn.disabled = true; btn.textContent = "Enviando...";
  try{
    const group = await loadGroup(code);
    if(!group){ err.textContent="Este grupo ya no existe."; return; }
    await inviteEmailsToGroup(group, emailsRaw);
    closeModal('modal-invite');
  } finally {
    BUSY_SEND_INVITE = false;
    btn.disabled = false; btn.textContent = originalLabel;
  }
});

document.getElementById('btn-add-space').addEventListener('click', ()=> openModal('modal-space'));
document.getElementById('space-create-group').addEventListener('click', ()=>{ closeModal('modal-space'); showScreen('screen-create-group'); });
document.getElementById('space-join-group').addEventListener('click', ()=>{ closeModal('modal-space'); showScreen('screen-join-group'); });

/* ==================== DASHBOARD: entrada y navegación lateral ==================== */
async function enterDashboard(){
  flushOutbox();
  startNotifListener();
  purgeOldNotifications();
  warmReminderIndex().then(checkReminders).catch(()=>{});
  if(CURRENT_USER && CURRENT_USER.pushEnabled) registerFCM();
  showScreen('screen-dashboard');
  applyTheme(CURRENT_USER.theme);
  await renderSidebar();
  await renderView();
}

function applyTheme(theme){
  if(!theme) return;
  setPerf();
  const tx = theme.text||THEME_DEFAULTS.text;
  document.documentElement.style.setProperty('--text', tx);
  document.documentElement.style.setProperty('--text-dim', hexA(tx,.62));
  document.documentElement.style.setProperty('--accent', THEME_DEFAULTS.accent);
  document.documentElement.style.setProperty('--user-text', theme.text||THEME_DEFAULTS.text);
  const bg = theme.bg||THEME_DEFAULTS.bg;
  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--bg-2', lightenHex(bg, 6));
}
// Aclara/oscurece un color hex en un porcentaje dado, para derivar --bg-2 a partir de --bg
function hexA(hex, a){
  hex = (hex||'#F2F4FC').replace('#',''); if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const n = parseInt(hex,16);
  return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;
}
function lightenHex(hex, percent){
  hex = (hex||'#0A0E1C').replace('#','');
  if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex,16);
  let r = (num>>16)+Math.round(255*percent/100);
  let g = ((num>>8)&0xff)+Math.round(255*percent/100);
  let b = (num&0xff)+Math.round(255*percent/100);
  r = Math.min(255,Math.max(0,r)); g = Math.min(255,Math.max(0,g)); b = Math.min(255,Math.max(0,b));
  return '#'+(r<<16|g<<8|b).toString(16).padStart(6,'0');
}

async function renderSidebar(){
  document.getElementById('sidebar-avatar').src = CURRENT_USER.photo || avatarFallbackURL(CURRENT_USER.name);
  document.getElementById('sidebar-avatar').onerror = ()=>{};
  document.getElementById('sidebar-name').textContent = CURRENT_USER.name;
  document.getElementById('sidebar-role').textContent = CURRENT_USER.email;

  const nav = document.getElementById('nav-scroll');
  nav.innerHTML = "";
  const indivItem = navItemHTML('individual', null, 'Mi espacio individual', 'lime');
  nav.appendChild(indivItem);

  if(CURRENT_USER.groups.length){
    const label = document.createElement('div'); label.className="sidebar-section-label"; label.textContent="Mis grupos";
    nav.appendChild(label);
    const groups = await Promise.all(CURRENT_USER.groups.map(code=>loadGroupCached(code)));
    groups.forEach((g, i)=>{
      if(!g) return;
      const code = CURRENT_USER.groups[i];
      const isLeader = g.leaderEmail===CURRENT_USER.email;
      const isCo = (g.coLeaders||[]).includes(CURRENT_USER.email);
      nav.appendChild(navItemHTML('group', code, g.name + (isLeader? " · líder" : isCo? " · subLíder" : ""), (isLeader||isCo)? 'blue':'orange', isLeader));
    });
  }
  nav.querySelectorAll('.nav-item').forEach(el=>{
    el.classList.toggle('active', (el.dataset.type===CURRENT_SPACE.type) && (el.dataset.code===(CURRENT_SPACE.groupCode||"")));
    el.addEventListener('click', async ()=>{
      await setActiveSpace({ type: el.dataset.type, groupCode: el.dataset.code||null });
    });
  });
  nav.querySelectorAll('.nav-item-delete').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.stopPropagation();
      await confirmDeleteGroup(btn.dataset.code, btn.dataset.name);
    });
  });
  mountIcons();
}
function navItemHTML(type, code, label, color, showDelete){
  const el = document.createElement('div');
  el.className="nav-item"; el.dataset.type=type; el.dataset.code=code||"";
  const dotColor = {lime:'var(--lime)', blue:'var(--blue)', orange:'var(--orange)'}[color]||'var(--blue)';
  el.innerHTML = `<span class="dot" style="background:${dotColor}"></span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${esc(label)}</span>`;
  if(showDelete){
    el.innerHTML += `<button type="button" class="nav-item-delete" data-code="${code}" data-name="${label.replace(/"/g,'&quot;')}" title="Eliminar grupo"><span class="icon" style="width:15px;height:15px">${iconHTML('trash')}</span></button>`;
  }
  return el;
}
document.getElementById('btn-manage-groups').addEventListener('click', openManageGroupsModal);
async function openManageGroupsModal(){
  closeMobileSidebar();
  const list = document.getElementById('manage-groups-list');
  list.innerHTML = `<div class="empty-state"><p>Cargando...</p></div>`;
  openModal('modal-manage-groups');
  const groups = await Promise.all(CURRENT_USER.groups.map(code=>loadGroup(code)));
  const led = groups.filter(g=>g && g.leaderEmail===CURRENT_USER.email);
  document.getElementById('manage-groups-count').textContent = led.length;
  if(!led.length){
    list.innerHTML = `<div class="empty-state"><p>Todavía no has creado ningún grupo. Usa "Nuevo grupo / unirme" en la barra lateral.</p></div>`;
    return;
  }
  list.innerHTML = "";
  led.forEach(g=>{
    const row = document.createElement('div'); row.className = "task-item";
    row.innerHTML = `
      <div class="task-body">
        <div class="task-title">${esc(g.name)}</div>
        <div class="task-meta">
          <span class="chip">Código: ${g.code}</span>
          <span class="chip">${g.members.length} participante${g.members.length===1?'':'s'}</span>
          ${(g.pendingInvites&&g.pendingInvites.length)? `<span class="chip status-pending">${g.pendingInvites.length} invitación(es) pendiente(s)</span>`:''}
        </div>
        <div class="task-actions"></div>
      </div>`;
    const actions = row.querySelector('.task-actions');
    actions.appendChild(mkBtn('Invitar','participant', ()=>{ closeModal('modal-manage-groups'); openInviteModalForGroup(g.code); }, 'btn-soft'));
    actions.appendChild(mkBtn('Eliminar','trash', async ()=>{
      if(!confirm(`¿Eliminar el grupo "${g.name}"? Se borrará para todos los participantes junto con sus tareas. Esta acción no se puede deshacer.`)) return;
      await deleteGroupCascade(g.code);
      toast(`Grupo "${g.name}" eliminado.`, "ok");
      if(CURRENT_SPACE.groupCode===g.code) CURRENT_SPACE = {type:'individual', groupCode:null};
      await renderSidebar(); await renderView();
      openManageGroupsModal();
    }, 'btn-accent'));
    list.appendChild(row);
  });
  mountIcons(list);
}
/* ==================== LISTAS PERSONALIZADAS ==================== */
document.getElementById('btn-manage-lists').addEventListener('click', openListsModal);
async function openListsModal(){
  closeMobileSidebar();
  document.getElementById('new-list-name').value="";
  document.getElementById('new-list-color').value="#3D6BFF";
  document.getElementById('lists-error').textContent="";
  openModal('modal-lists');
  await renderListsManageList();
}
async function renderListsManageList(){
  const box = document.getElementById('lists-manage-list');
  box.innerHTML = `<div class="empty-state"><p>Cargando...</p></div>`;
  const lists = await getListsForSpace();
  if(!lists.length){
    box.innerHTML = `<div class="empty-state"><p>Todavía no tienes listas en este espacio. Crea una arriba para empezar a organizar tus tareas.</p></div>`;
    return;
  }
  box.innerHTML="";
  lists.forEach(l=>{
    const row = document.createElement('div'); row.className="task-item"; row.style.alignItems="center";
    row.innerHTML = `
      <span class="dot" style="background:${l.color};width:14px;height:14px"></span>
      <div class="task-body"><div class="task-title">${esc(l.name)}</div></div>
      <div class="task-actions" style="margin-top:0"></div>`;
    const canDelete = l.createdBy===CURRENT_USER.email || (CURRENT_SPACE.type==='group' && isGroupLeader(GROUP_CACHE[CURRENT_SPACE.groupCode]));
    if(canDelete){
      row.querySelector('.task-actions').appendChild(mkBtn('Eliminar','trash', async ()=>{
        if(!confirm(`¿Eliminar la lista "${l.name}"? Las tareas que la usaban quedarán sin lista.`)) return;
        await deleteListDb(l.id);
        const usingTasks = (await getTasksForSpace(true)).filter(t=>t.listId===l.id);
        await Promise.all(usingTasks.map(async t=>{ t.listId=null; await saveTask(t); }));
        toast("Lista eliminada", "ok");
        await renderListsManageList();
        await refreshListOptions();
        await renderTaskListForSelectedDate(); await renderCalendar();
      }, 'btn-accent'));
    }
    box.appendChild(row);
  });
  mountIcons(box);
}
document.getElementById('btn-create-list').addEventListener('click', async ()=>{
  const err = document.getElementById('lists-error'); err.textContent="";
  const name = document.getElementById('new-list-name').value.trim();
  if(!name){ err.textContent="Ponle un nombre a la lista."; return; }
  const color = document.getElementById('new-list-color').value;
  const list = {
    id: uid('l'), name, color, createdBy: CURRENT_USER.email,
    scope: CURRENT_SPACE.type,
    ownerEmail: CURRENT_SPACE.type==='individual' ? CURRENT_USER.email : null,
    groupCode: CURRENT_SPACE.type==='group' ? CURRENT_SPACE.groupCode : null
  };
  await saveList(list);
  document.getElementById('new-list-name').value="";
  toast("Lista creada", "ok");
  await renderListsManageList();
  await refreshListOptions();
});

function openInviteModalForGroup(code){
  document.getElementById('invite-group-code').textContent = code;
  document.getElementById('invite-emails').value="";
  document.getElementById('invite-error').textContent="";
  document.getElementById('btn-invite-participants').dataset.groupCode = code;
  openModal('modal-invite');
}

async function confirmDeleteGroup(code, name){
  if(!confirm(`¿Eliminar el grupo "${name}"? Se borrará para todos los participantes junto con sus tareas. Esta acción no se puede deshacer.`)) return;
  await deleteGroupCascade(code);
  toast(`Grupo "${name}" eliminado.`, "ok");
  if(CURRENT_SPACE.groupCode===code) CURRENT_SPACE = {type:'individual', groupCode:null};
  await renderSidebar(); await renderView();
}
async function deleteGroupCascade(code){
  if(!needOnline()) return;
  const group = await loadGroup(code);
  if(!group) return;
  // sacar el grupo de la lista de cada miembro
  const members = await Promise.all(group.members.map(em=>loadUser(em)));
  await Promise.all(members.map(async u=>{
    if(!u) return;
    u.groups = u.groups.filter(c=>c!==code);
    if(u.lastSpace && u.lastSpace.type==='group' && u.lastSpace.groupCode===code) u.lastSpace = {type:'individual', groupCode:null};
    await saveUser(u);
    if(u.email!==CURRENT_USER.email){
      await pushNotification(u.email, {type:'group_deleted', text:`El grupo "${group.name}" fue eliminado por su líder.`});
    }
  }));
  // borrar todas las tareas del grupo
  const groupTaskKeys = (await DB.byField('tasks:','groupCode',code)).map(t=>'tasks:'+t.id);
  await Promise.all(groupTaskKeys.map(k=>DB.del(k)));
  await DB.del('groups:'+code);
  delete GROUP_CACHE[code];
  invalidateTasksCache();
}
function avatarFallbackURL(name){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' rx='18' fill='%233D6BFF'/><text x='50%' y='56%' font-family='Sora,sans-serif' font-size='30' fill='white' text-anchor='middle'>${initials(name)}</text></svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}

/* ==================== VISTA PRINCIPAL: calendario + tareas ==================== */
async function renderView(){
  const inviteBtn = document.getElementById('btn-invite-participants');
  const membersBtn = document.getElementById('btn-view-members');
  try{
    if(CURRENT_SPACE.type==='group'){
      const g = await loadGroup(CURRENT_SPACE.groupCode);
      document.getElementById('view-title').textContent = g?.name || 'Grupo';
      const isLeader = isGroupLeader(g);
      inviteBtn.classList.toggle('hidden', !isLeader);
      inviteBtn.dataset.groupCode = CURRENT_SPACE.groupCode;
      membersBtn.classList.remove('hidden');
      membersBtn.dataset.groupCode = CURRENT_SPACE.groupCode;
    } else {
      document.getElementById('view-title').textContent = 'Mi espacio individual';
      inviteBtn.classList.add('hidden');
      membersBtn.classList.add('hidden');
    }
    await refreshAssigneeOptions();
    await renderCalendar();
    await renderTaskListForSelectedDate();
    await renderApprovals();
    await refreshBell();
  }catch(e){
    console.error("Error cargando la vista:", e);
    toast("Hubo un problema cargando tus datos. Verifica tu conexión e intenta de nuevo.", "err");
  }
}

document.getElementById('btn-view-members').addEventListener('click', openMembersModal);
async function openMembersModal(){
  const code = document.getElementById('btn-view-members').dataset.groupCode;
  const list = document.getElementById('members-list');
  list.innerHTML = `<div class="empty-state"><p>Cargando...</p></div>`;
  openModal('modal-members');
  const group = await loadGroup(code);
  if(!group){ list.innerHTML = `<div class="empty-state"><p>Este grupo ya no existe.</p></div>`; return; }
  document.getElementById('members-modal-title').textContent = `Integrantes de "${group.name}" (${group.members.length})`;
  const isLeader = isGroupLeader(group);
  const members = await Promise.all(group.members.map(em=>findUserByEmail(em)));
  list.innerHTML = "";
  members.forEach((u, i)=>{
    const em = group.members[i];
    if(!u) return;
    const row = document.createElement('div');
    row.className = "member-row";
    const isThatLeader = em===group.leaderEmail;
    const isThatCo = (group.coLeaders||[]).includes(em);
    const iAmMain = group.leaderEmail===CURRENT_USER.email;
    row.innerHTML = `
      <img class="avatar" src="${u.photo || avatarFallbackURL(u.name)}" alt="" style="width:38px;height:38px;">
      <div class="member-name">${esc(u.name)}${isThatLeader? ' <span class="chip" style="margin-left:6px">Líder</span>': isThatCo? ' <span class="chip" style="margin-left:6px">SubLíder</span>':''}</div>
      <div class="member-actions"></div>`;
    if(iAmMain && !isThatLeader){
      row.querySelector('.member-actions').appendChild(
        isThatCo ? mkBtn('Quitar subLíder','close', ()=>setCoLeader(code, em, false), 'btn-soft')
                 : mkBtn('Hacer subLíder','leader', ()=>setCoLeader(code, em, true), 'btn-lime'));
    }
    if(isLeader && !isThatLeader && (iAmMain || !isThatCo)){
      row.querySelector('.member-actions').appendChild(
        mkBtn('Eliminar','trash', ()=>confirmRemoveMember(code, em, u.name, group.name), 'btn-accent')
      );
    }
    list.appendChild(row);
  });
  if(group.leaderEmail!==CURRENT_USER.email && group.members.includes(CURRENT_USER.email)){
    const foot = document.createElement('div'); foot.style.cssText = "margin-top:14px;display:flex;justify-content:center;";
    foot.appendChild(mkBtn('Salir del grupo','logout', ()=>leaveGroup(code), 'btn-accent'));
    list.appendChild(foot);
  }
  mountIcons(list);
}
// Un integrante (no líder) sale por su cuenta del grupo y se le avisa al líder.
async function leaveGroup(groupCode){
  if(!needOnline()) return;
  const group = await loadGroup(groupCode);
  if(!group){ toast("Este grupo ya no existe.", "err"); return; }
  if(group.leaderEmail===CURRENT_USER.email){
    toast("Eres el líder: para cerrar el grupo debes eliminarlo desde \"Mis grupos\".", "warn"); return;
  }
  if(!confirm(`¿Salir del grupo "${group.name}"? Dejarás de ver sus tareas y el líder será notificado.`)) return;
  group.members = group.members.filter(e=>e!==CURRENT_USER.email);
  group.coLeaders = (group.coLeaders||[]).filter(e=>e!==CURRENT_USER.email);
  await saveGroup(group);
  CURRENT_USER.groups = (CURRENT_USER.groups||[]).filter(c=>c!==groupCode);
  if(CURRENT_USER.lastSpace && CURRENT_USER.lastSpace.type==='group' && CURRENT_USER.lastSpace.groupCode===groupCode){
    CURRENT_USER.lastSpace = {type:'individual', groupCode:null};
  }
  await saveUser(CURRENT_USER);
  await notifyLeaders(group, {type:'member_left', text:`${CURRENT_USER.name} salió del grupo "${group.name}".`});
  delete GROUP_CACHE[groupCode];
  invalidateTasksCache(); LISTS_CACHE = {key:null, lists:null};
  if(CURRENT_SPACE.type==='group' && CURRENT_SPACE.groupCode===groupCode) CURRENT_SPACE = {type:'individual', groupCode:null};
  closeModal('modal-members');
  toast(`Saliste del grupo "${group.name}".`, "ok");
  await renderSidebar(); await renderView();
}
async function confirmRemoveMember(groupCode, memberEmail, memberName, groupName){
  if(!confirm(`¿Eliminar a ${memberName} del grupo "${groupName}"? Dejará de ver este grupo y sus tareas.`)) return;
  await removeMemberFromGroup(groupCode, memberEmail, groupName);
  toast(`${memberName} fue eliminado del grupo.`, "ok");
  await openMembersModal();
  await renderSidebar();
}
async function removeMemberFromGroup(groupCode, memberEmail, groupName){
  if(!needOnline()) return;
  const group = await loadGroup(groupCode);
  if(!group) return;
  group.members = group.members.filter(e=>e!==memberEmail);
  group.coLeaders = (group.coLeaders||[]).filter(e=>e!==memberEmail);
  await saveGroup(group);
  const member = await loadUser(memberEmail);
  if(member){
    member.groups = (member.groups||[]).filter(c=>c!==groupCode);
    if(member.lastSpace && member.lastSpace.type==='group' && member.lastSpace.groupCode===groupCode){
      member.lastSpace = {type:'individual', groupCode:null};
    }
    await saveUser(member);
    await pushNotification(memberEmail, {type:'member_removed', text:`El líder te eliminó del grupo "${groupName}".`});
  }
  invalidateTasksCache();
}

let TASKS_CACHE = { spaceKey: null, tasks: null };
function currentSpaceKey(){ return CURRENT_SPACE.type + ':' + (CURRENT_SPACE.groupCode||''); }
function invalidateTasksCache(){ TASKS_CACHE = { spaceKey: null, tasks: null }; }
async function getTasksForSpace(forceRefresh=false){
  const key = currentSpaceKey();
  if(!forceRefresh && TASKS_CACHE.spaceKey===key && TASKS_CACHE.tasks) return TASKS_CACHE.tasks;
  const all = CURRENT_SPACE.type==='individual' ? await DB.byField('tasks:','ownerEmail',CURRENT_USER.email) : await DB.byField('tasks:','groupCode',CURRENT_SPACE.groupCode);
  const tasks = all.filter(t=>{
    if(!t) return false;
    if(CURRENT_SPACE.type==='individual') return t.scope==='individual' && t.ownerEmail===CURRENT_USER.email;
    return t.scope==='group' && t.groupCode===CURRENT_SPACE.groupCode;
  });
  TASKS_CACHE = { spaceKey: key, tasks };
  return tasks;
}

// Una tarea grupal marcada como "individual" solo la ve la persona asignada,
// quien la creó, y el líder — así cada quien ve nada más lo que le toca en
// vez de que le aparezcan las tareas de todo el equipo.
function isTaskVisible(t, isLeader){
  if(t.scope!=='group' || !t.assignedTo) return true;
  return t.assignedTo===CURRENT_USER.email || t.createdBy===CURRENT_USER.email || isLeader;
}
// Tarea grupal = asignada a "Todo el grupo" (sin persona concreta).
// Cada integrante hace su propio check; queda completada cuando TODOS lo hicieron.
function isCollective(t){ return t.scope==='group' && !t.assignedTo; }
// Un integrante solo debe tareas grupales de la fecha en que ingresó en adelante.
function memberExpected(group, email, iso){ const j = (group.joined||{})[email]; return !j || iso >= j; }
function collectiveDone(t, group, iso){
  if(!group) return false;
  const d = iso || SELECTED_DATE, c = occRead(t, d).completions || {};
  const exp = group.members.filter(m=>memberExpected(group, m, d));
  return exp.length>0 && exp.every(m=>c[m]);
}
/* ---------- Estado por OCURRENCIA ----------
   En tareas que se repiten, cada día tiene su propio check (t.occ[fecha]).
   Los datos antiguos (check global) solo cuentan para el día en que se marcó. */
const RECURRING = ['daily','weekly','monthly','month_start','month_end'];
const isRecurring = t=> RECURRING.includes(t.repeat);
function occRead(t, iso){
  if(!isRecurring(t)) return t;
  if(t.occ && t.occ[iso]) return t.occ[iso];
  if(!t.occ && t.done){
    const d = t.completedAt ? toISODate(new Date(t.completedAt)) : t.date;
    if(iso===d) return {done:true, completions:t.completions||{}, completionNote:t.completionNote||'', completedAt:t.completedAt};
  }
  return {done:false, completions:{}};
}
function occWrite(t, iso){
  if(!isRecurring(t)) return t;
  if(!t.occ){
    t.occ = {};
    if(t.done){ const d = t.completedAt ? toISODate(new Date(t.completedAt)) : t.date; t.occ[d] = {done:true, completions:t.completions||{}, completionNote:t.completionNote||'', completedAt:t.completedAt}; }
    t.done = false; t.completions = {}; t.completionNote = '';
  }
  return t.occ[iso] = t.occ[iso] || {done:false, completions:{}};
}
const occISO = t=> t.repeat==='none' ? t.date : SELECTED_DATE; // fecha de la ocurrencia que se está viendo
function isOverdue(t, iso){
  const now = new Date(), today = toISODate(now);
  if(t.repeat==='span') return today > (t.dueDate||t.date);
  if(iso < today) return true;
  if(iso===today && !t.allDay && t.time) return now.getTime() > new Date(iso+'T'+t.time+':00').getTime();
  return false;
}
function taskState(t, iso, group){
  const O = occRead(t, iso);
  // En tareas grupales, "hecha" es PERSONAL: si ya diste tu check, para ti está completada aunque falten otros.
  const done = isCollective(t) ? !!(O.completions||{})[CURRENT_USER.email] : !!O.done;
  if(t.scope==='group' && t.status==='pending') return 'approval';
  if(t.scope==='group' && t.status==='rejected') return 'rejected';
  if(done) return 'done';
  if(isOverdue(t, iso)) return 'overdue';
  return t.repeat==='span' ? 'span' : 'todo';
}
const STATE_COLOR = {todo:'var(--blue)', overdue:'var(--red)', done:'var(--ok)', approval:'var(--orange)', span:'var(--purple)', rejected:'var(--text-dim)'};
function lateText(t, iso){
  const today = toISODate(new Date()), d = t.repeat==='span' ? (t.dueDate||t.date) : iso;
  const n = Math.round((new Date(today+'T00:00:00') - new Date(d+'T00:00:00'))/86400000);
  return n>0 ? `Retrasada · ${n} día${n>1?'s':''}` : 'Retrasada · vencida hoy';
}
function occursOnDate(task, isoDate){
  if(task.scope==='group' && !task.assignedTo && task.groupCode && CURRENT_USER){
    const g = GROUP_CACHE[task.groupCode];
    if(g && !memberExpected(g, CURRENT_USER.email, isoDate)) return false; // no le exigen tareas de antes de ingresar
  }
  const start = task.date;
  if(task.repeat==='span'){ // varios días: pendiente cada día hasta completarla
    if(isoDate < start) return false;
    const due = task.dueDate || start, today = toISODate(new Date());
    if(!task.done) return isoDate <= (due > today ? due : today);
    return isoDate <= (task.completedAt ? toISODate(new Date(task.completedAt)) : due);
  }
  if(task.repeat==='none') return start===isoDate;
  if(isoDate < start) return false;
  const d = new Date(isoDate+"T00:00:00");
  if(task.repeat==='daily') return true;
  if(task.repeat==='weekly'){
    if(task.weekdays && task.weekdays.length) return task.weekdays.includes(d.getDay());
    return new Date(start+"T00:00:00").getDay()===d.getDay();
  }
  if(task.repeat==='monthly'){
    return new Date(start+"T00:00:00").getDate()===d.getDate();
  }
  if(task.repeat==='month_start') return d.getDate()===1;
  if(task.repeat==='month_end') return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()===d.getDate();
  return false;
}

async function renderCalendar(){
  const label = document.getElementById('cal-month-label');
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  label.textContent = `${monthNames[CAL_VIEW.getMonth()]} ${CAL_VIEW.getFullYear()}`;

  const dowRow = document.getElementById('cal-dow-row'); dowRow.innerHTML="";
  ["D","L","M","M","J","V","S"].forEach(d=>{ const el=document.createElement('div'); el.className="cal-dow"; el.textContent=d; dowRow.appendChild(el); });

  const grid = document.getElementById('cal-grid'); grid.innerHTML="";
  const year = CAL_VIEW.getFullYear(), month = CAL_VIEW.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayISO = toISODate(new Date());

  let group = CURRENT_SPACE.type==='group' ? await loadGroupCached(CURRENT_SPACE.groupCode) : null;
  const isLeader = isGroupLeader(group);
  const listFilter = document.getElementById('task-list-filter').value;
  let tasks = (await getTasksForSpace()).filter(t=>isTaskVisible(t, isLeader));
  const visibleAll = tasks;
  if(listFilter) tasks = tasks.filter(t=>t.listId===listFilter);
  const cells = [];
  for(let i=startOffset-1;i>=0;i--) cells.push({day:daysInPrevMonth-i, other:true, month:month-1});
  for(let d=1; d<=daysInMonth; d++) cells.push({day:d, other:false, month});
  while(cells.length%7!==0) cells.push({day:cells.length - (startOffset+daysInMonth) + 1, other:true, month:month+1});

  cells.forEach(c=>{
    const dt = new Date(year, c.month, c.day);
    const iso = toISODate(dt);
    const el = document.createElement('div');
    el.className = "cal-day"+(c.other?" other-month":"")+(iso===todayISO?" today":"")+(iso===SELECTED_DATE?" selected":"");
    const dayTasks = tasks.filter(t=>occursOnDate(t, iso));
    let dots = "";
    dayTasks.slice(0,4).forEach(t=>{
      const color = STATE_COLOR[taskState(t, iso, group)];
      dots += `<span style="background:${color}"></span>`;
    });
    el.innerHTML = `${c.day}<div class="cal-dots">${dots}</div>`;
    el.addEventListener('click', ()=>{ SELECTED_DATE = iso; renderCalendar(); renderTaskListForSelectedDate(); });
    grid.appendChild(el);
  });
  updateOverdueAlert(visibleAll, group);
}
document.getElementById('cal-prev').addEventListener('click', ()=>{ CAL_VIEW.setMonth(CAL_VIEW.getMonth()-1); renderCalendar(); });
document.getElementById('cal-next').addEventListener('click', ()=>{ CAL_VIEW.setMonth(CAL_VIEW.getMonth()+1); renderCalendar(); });
document.getElementById('cal-today').addEventListener('click', ()=>{ CAL_VIEW=new Date(); SELECTED_DATE=toISODate(new Date()); renderCalendar(); renderTaskListForSelectedDate(); });

async function renderTaskListForSelectedDate(){
  document.getElementById('task-list-date').textContent = fmtDateLong(SELECTED_DATE);
  const list = document.getElementById('task-list');
  let group = CURRENT_SPACE.type==='group' ? await loadGroupCached(CURRENT_SPACE.groupCode) : null;
  const isLeader = isGroupLeader(group);
  const listFilter = document.getElementById('task-list-filter').value;
  const todayISO = toISODate(new Date());
  let tasks = (await getTasksForSpace()).filter(t=>occursOnDate(t, SELECTED_DATE)).filter(t=>isTaskVisible(t, isLeader));
  if(listFilter) tasks = tasks.filter(t=>t.listId===listFilter);
  const stOf = new Map(tasks.map(t=>[t, taskState(t, occISO(t), group)]));
  const rank = {overdue:0, todo:1, span:1, approval:1, rejected:2, done:3};
  const timeKey = t=> t.allDay ? '00:00' : (t.time||'23:59');
  // 1) retrasadas (la más atrasada primero)  2) pendientes de la más cercana a la más lejana  3) completadas del día
  tasks.sort((a,b)=> (rank[stOf.get(a)]-rank[stOf.get(b)]) || (occISO(a)+timeKey(a)).localeCompare(occISO(b)+timeKey(b)));
  document.getElementById('task-list-title').textContent = SELECTED_DATE===toISODate(new Date()) ? "Tareas de hoy" : "Tareas del día";
  if(!tasks.length){
    list.innerHTML = `<div class="empty-state">${'<span class="icon" data-icon-slot="dot"></span>'}<p>No hay tareas para este día. Usa el botón + para crear una.</p></div>`;
    mountIcons(list); return;
  }
  list.innerHTML="";

  const assignees = await Promise.all(tasks.map(t=> t.assignedTo ? findUserByEmail(t.assignedTo) : Promise.resolve(null)));
  const allLists = await getListsForSpace();
  await Promise.all([...new Set(tasks.flatMap(t=>Object.keys(t.completions||{})))].map(findUserByEmail));
  const listById = Object.fromEntries(allLists.map(l=>[l.id,l]));

  let doneLabel = false;
  tasks.forEach((t, idx)=>{
    const assignee = assignees[idx];
    const taskList = t.listId ? listById[t.listId] : null;
    const el = document.createElement('div');
    const st = stOf.get(t), iso0 = occISO(t), O = occRead(t, iso0), coll = isCollective(t), comp = O.completions||{}, expectedM = group ? group.members.filter(m=>memberExpected(group,m,iso0)) : [], total = expectedM.length;
    const allDone = st==='done';
    const groupAll = coll && collectiveDone(t, group, iso0); // ¿ya la hicieron todos?
    const myDone = coll ? !!comp[CURRENT_USER.email] : !!O.done;
    el.className = "task-item"+(allDone?" done collapsed":"")+(st==="overdue"?" overdue":"");
    el.dataset.taskId = t.id;
    const canToggle = coll ? !!(group && group.members.includes(CURRENT_USER.email)) : (t.scope==='individual' || t.assignedTo===CURRENT_USER.email || isLeader);
    let collBlock = '';
    if(coll){
      const nm = em=> esc((ALL_USERS_CACHE[em]||{}).name||em);
      const did = Object.keys(comp).filter(em=>group && group.members.includes(em));
      const missing = expectedM.filter(em=>!comp[em]);
      collBlock = `<div class="task-meta"><span class="chip status-${groupAll?'accepted':'pending'}">${groupAll?'✅ Completada por todos':did.length+'/'+total+' han hecho check'}</span>${did.map(em=>`<span class="chip status-accepted">✔ ${nm(em)}</span>`).join('')}</div>`
        + did.filter(em=>comp[em].note).map(em=>`<div class="hint" style="margin-top:4px">💬 ${nm(em)}: ${esc(comp[em].note)}</div>`).join('')
        + (!groupAll && missing.length ? `<div class="hint" style="margin-top:4px">Faltan: ${missing.map(nm).join(', ')}</div>` : '');
    }
    el.innerHTML = `
      <div class="task-check ${myDone?'checked':''}" data-toggle="${t.id}" style="${canToggle?'cursor:pointer':'opacity:.5'}">${myDone?iconHTML('check'):''}</div>
      <div class="task-body">
        <div class="task-head"><div class="task-title ${allDone?'strike':''}">${esc(t.title)}</div>${st==='overdue'?`<span class="chip chip-alert">⚠ ${lateText(t, iso0)}</span>`:''}${allDone?CHEV_SVG:''}</div>
        ${coll && allDone ? `<div class="task-sub">${groupAll?'✅ Completada por todos':'Faltan algunos integrantes'}</div>` : ''}
        <div class="task-details">
        ${t.desc?`<div class="hint">${esc(t.desc)}</div>`:''}
        <div class="task-meta">
          ${t.allDay? `<span class="chip">Todo el día</span>` : t.time? `<span class="chip">${t.time}</span>` : ''}
          ${t.repeat!=='none'? `<span class="chip">🔁 ${ {daily:'Diario',weekly:'Semanal',monthly:'Mensual',month_start:'Inicio de mes',month_end:'Fin de mes',span:'Varios días'}[t.repeat] }</span>` : ''}
          ${t.repeat==='span' && t.dueDate? `<span class="chip">📅 hasta ${esc(t.dueDate)}</span>` : ''}
          ${assignee? `<span class="chip">${esc(assignee.name)}</span>` : ''}
          ${t.scope==='group' && t.assignedTo? `<span class="chip">🔒 Individual</span>` : ''}
          ${taskList? `<span class="chip" style="color:${taskList.color};border-color:${taskList.color}66">${esc(taskList.name)}</span>` : ''}
          ${t.scope==='group'? `<span class="chip status-${t.status}">${ {pending:'Pendiente de aprobación',accepted:'Aprobada',rejected:'Rechazada',rescheduled:'Reprogramada'}[t.status] }</span>` : ''}
        </div>
        ${coll ? collBlock : ''}${!coll && O.done && O.completionNote? `<div class="hint" style="margin-top:6px">💬 ${esc(O.completionNote)}</div>` : ''}
        <div class="task-actions"></div>
        </div>
      </div>`;
    const actions = el.querySelector('.task-actions');
    if(allDone) el.querySelector('.task-head').addEventListener('click', ()=>el.classList.toggle('collapsed'));

    if(canToggle){
      el.querySelector('[data-toggle]').addEventListener('click', ()=> toggleTaskDone(t));
    }
    // edición / eliminar: dueño o líder
    if(t.createdBy===CURRENT_USER.email || isLeader){
      const editBtn = mkBtn('Editar','edit', ()=>openTaskModal(t));
      actions.appendChild(editBtn);
    }
    // aprobación (solo líder, tareas propuestas por participantes)
    if(isLeader && t.scope==='group' && t.status==='pending' && t.createdBy!==CURRENT_USER.email){
      actions.appendChild(mkBtn('Aceptar','check', ()=> decideTask(t,'accepted'), 'btn-lime'));
      actions.appendChild(mkBtn('Reprogramar','edit', ()=> openTaskModal(t,true), 'btn-soft'));
      actions.appendChild(mkBtn('Rechazar','close', ()=> decideTask(t,'rejected'), 'btn-soft'));
    }
    if(allDone && !doneLabel){ doneLabel = true; const sep = document.createElement('div'); sep.className='task-section-label'; sep.textContent='Completadas'; list.appendChild(sep); }
    list.appendChild(el);
  });
  mountIcons(list);
}
function mkBtn(text, icon, onClick, cls="btn-soft"){
  const b = document.createElement('button');
  b.className = "btn btn-sm "+cls; b.type="button";
  b.innerHTML = `<span class="icon" style="width:14px;height:14px">${iconHTML(icon)}</span> ${text}`;
  b.addEventListener('click', onClick);
  return b;
}

let PENDING_COMPLETE_TASK = null, PENDING_COMPLETE_ISO = null;
async function toggleTaskDone(t){
  const iso = occISO(t), me = CURRENT_USER.email, O = occRead(t, iso);
  if(isCollective(t) && O.completions && O.completions[me]){
    const W = occWrite(t, iso); delete W.completions[me]; W.done = false;
    await saveTask(t);
    toast("Quitaste tu check de esta tarea", "ok");
    await renderTaskListForSelectedDate(); await renderCalendar();
    return;
  }
  if(!O.done || isCollective(t)){
    // Al marcarla como hecha se pide un comentario/observación opcional
    PENDING_COMPLETE_TASK = t; PENDING_COMPLETE_ISO = iso;
    document.getElementById('complete-task-title').textContent = `"${t.title}"`;
    document.getElementById('complete-task-comment').value = "";
    openModal('modal-complete-task');
    return;
  }
  // Desmarcar no necesita comentario (solo ese día)
  const W = occWrite(t, iso); W.done = false; W.completionNote = "";
  await saveTask(t);
  toast("Tarea marcada como pendiente", "ok");
  await renderTaskListForSelectedDate(); await renderCalendar();
}
document.getElementById('btn-confirm-complete-task').addEventListener('click', async ()=>{
  const t = PENDING_COMPLETE_TASK;
  if(!t) return;
  const comment = document.getElementById('complete-task-comment').value.trim();
  const grp = t.scope==='group' ? await loadGroup(t.groupCode) : null;
  const iso = PENDING_COMPLETE_ISO || occISO(t), W = occWrite(t, iso);
  if(isCollective(t)){
    W.completions = W.completions || {};
    W.completions[CURRENT_USER.email] = {at: Date.now(), note: comment};
    W.done = collectiveDone(t, grp, iso);
    if(W.done) W.completedAt = Date.now();
    await saveTask(t);
    if(grp){
      const n = grp.members.filter(m=>W.completions[m]).length;
      await notifyLeaders(grp, {type:'done', text:`${CURRENT_USER.name} completó la tarea "${t.title}" (${n}/${grp.members.length}).${W.done?' Ya la completó todo el grupo.':''}${comment? ' Observación: '+comment : ''}`});
    }
  } else {
    W.done = true;
    W.completionNote = comment;
    W.completedAt = Date.now();
    W.completedBy = CURRENT_USER.email;
    await saveTask(t);
    if(grp){
      await notifyLeaders(grp, {type:'done', text:`${CURRENT_USER.name} completó la tarea "${t.title}".${comment? ' Observación: '+comment : ''}`});
    }
  }
  playSound('check'); if(W.done) setTimeout(()=>playSound('done'), 200);
  toast("Tarea marcada como completada", "ok");
  closeModal('modal-complete-task');
  PENDING_COMPLETE_TASK = null;
  await renderTaskListForSelectedDate(); await renderCalendar();
});

async function decideTask(t, decision){
  t.status = decision;
  await saveTask(t);
  const owner = await findUserByEmail(t.createdBy);
  if(owner){
    const msg = decision==='accepted' ? `Tu tarea "${t.title}" fue aceptada por el líder.` : `Tu tarea "${t.title}" fue rechazada por el líder.`;
    await pushNotification(owner.email, {type:'decision', text: msg});
  }
  toast("Decisión guardada", "ok");
  await renderTaskListForSelectedDate(); await renderCalendar(); await renderApprovals();
}

async function renderApprovals(){
  const box = document.getElementById('approvals-section');
  box.innerHTML="";
  if(CURRENT_SPACE.type!=='group') return;
  const group = await loadGroupCached(CURRENT_SPACE.groupCode);
  if(!group || !isGroupLeader(group)) return;
  const allTasks = await getTasksForSpace();
  const pendings = allTasks.filter(t=>t.status==='pending' && t.createdBy!==CURRENT_USER.email);
  if(!pendings.length) return;
  const card = document.createElement('div'); card.className="glass"; card.style.padding="18px";
  card.innerHTML = `<h3 style="margin-bottom:12px;font-size:15px">Pendientes de tu aprobación (${pendings.length})</h3><div id="approvals-list"></div>`;
  box.appendChild(card);
  const list = card.querySelector('#approvals-list');
  const proposers = await Promise.all(pendings.map(t=>findUserByEmail(t.createdBy)));
  pendings.forEach((t, idx)=>{
    const proposer = proposers[idx];
    const row = document.createElement('div'); row.className="task-item";
    row.innerHTML = `<div class="task-body"><div class="task-title">${esc(t.title)}</div><div class="hint">Propuesta por ${proposer?esc(proposer.name):'—'} · ${t.date}${t.time?' · '+t.time:''}</div><div class="task-actions"></div></div>`;
    const actions = row.querySelector('.task-actions');
    actions.appendChild(mkBtn('Aceptar','check', ()=>decideTask(t,'accepted'), 'btn-lime'));
    actions.appendChild(mkBtn('Reprogramar','edit', ()=>openTaskModal(t,true), 'btn-soft'));
    actions.appendChild(mkBtn('Rechazar','close', ()=>decideTask(t,'rejected'), 'btn-soft'));
    list.appendChild(row);
  });
  mountIcons(box);
}

/* ==================== MODAL TAREA ==================== */
document.getElementById('btn-fab-add').addEventListener('click', ()=>openTaskModal());
document.getElementById('task-allday').addEventListener('change', e=>{
  document.getElementById('task-time-wrap').style.display = e.target.checked ? 'none' : 'block';
  document.getElementById('task-multi-wrap').classList.toggle('hidden', !e.target.checked);
});
document.getElementById('task-repeat').addEventListener('change', e=>{
  document.getElementById('task-weekdays-wrap').classList.toggle('hidden', e.target.value!=='weekly');
  document.getElementById('task-due-wrap').classList.toggle('hidden', e.target.value!=='span');
});
document.querySelectorAll('.weekday-btn').forEach(b=>b.addEventListener('click', ()=>b.classList.toggle('selected')));

async function refreshAssigneeOptions(){
  const wrap = document.getElementById('task-assignee-wrap');
  const sel = document.getElementById('task-assignee');
  sel.innerHTML="";
  if(CURRENT_SPACE.type==='individual'){ wrap.classList.add('hidden'); await refreshListOptions(); return; }
  wrap.classList.remove('hidden');
  const group = await loadGroupCached(CURRENT_SPACE.groupCode);
  const isLeader = isGroupLeader(group);
  if(isLeader){
    const optAll = document.createElement('option'); optAll.value=""; optAll.textContent="Todo el grupo (tarea grupal)"; sel.appendChild(optAll);
    const members = await Promise.all(group.members.map(em=>findUserByEmail(em)));
    group.members.forEach((em, i)=>{
      const u = members[i];
      const opt = document.createElement('option'); opt.value=em; opt.textContent = u? u.name+(em===group.leaderEmail?' (líder)':(group.coLeaders||[]).includes(em)?' (subLíder)':'') : em;
      sel.appendChild(opt);
    });
  } else {
    wrap.classList.add('hidden'); // participantes proponen tareas para sí mismos
  }
  await refreshListOptions();
}
async function refreshListOptions(){
  const sel = document.getElementById('task-listid');
  const filterSel = document.getElementById('task-list-filter');
  const lists = await getListsForSpace();
  const prevTaskListValue = sel.value;
  const prevFilterValue = filterSel.value;
  sel.innerHTML = `<option value="">Sin lista</option>`;
  filterSel.innerHTML = `<option value="">Todas las listas</option>`;
  lists.forEach(l=>{
    const o1 = document.createElement('option'); o1.value=l.id; o1.textContent=l.name; sel.appendChild(o1);
    const o2 = document.createElement('option'); o2.value=l.id; o2.textContent=l.name; filterSel.appendChild(o2);
  });
  if(lists.some(l=>l.id===prevTaskListValue)) sel.value = prevTaskListValue;
  if(lists.some(l=>l.id===prevFilterValue)) filterSel.value = prevFilterValue;
}
document.getElementById('task-list-filter').addEventListener('change', async ()=>{ await renderTaskListForSelectedDate(); await renderCalendar(); });

function openTaskModal(task=null, forceReschedule=false){
  document.getElementById('form-task').reset();
  document.getElementById('form-task').dataset.newId = uid('t'); // id fijo por formulario: dos toques = una sola tarea
  document.querySelectorAll('.weekday-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('task-weekdays-wrap').classList.add('hidden');
  document.getElementById('task-due-wrap').classList.add('hidden'); document.getElementById('task-due').value='';
  document.getElementById('task-time-wrap').style.display='block';
  document.getElementById('task-multi-wrap').classList.add('hidden');
  document.getElementById('btn-delete-task').classList.toggle('hidden', !task);
  document.getElementById('task-modal-title').textContent = task ? (forceReschedule? "Reprogramar tarea" : "Editar tarea") : "Nueva tarea";
  document.getElementById('task-id').value = task? task.id : "";
  document.getElementById('task-date').min = toISODate(new Date());

  if(task){
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.desc||"";
    document.getElementById('task-date').value = task.date;
    document.getElementById('task-time').value = task.time||"";
    document.getElementById('task-allday').checked = !!task.allDay;
    if(task.allDay){
      document.getElementById('task-time-wrap').style.display='none';
      document.getElementById('task-multi-wrap').classList.remove('hidden');
      document.getElementById('task-repeat-every').value = String(task.repeatEvery||0);
      document.getElementById('task-repeat-from').value = task.repeatFrom||'08:00';
      document.getElementById('task-repeat-to').value = task.repeatTo||'20:00';
    }
    document.getElementById('task-repeat').value = task.repeat||'none';
    document.getElementById('task-weekdays-wrap').classList.toggle('hidden', task.repeat!=='weekly');
    document.getElementById('task-due-wrap').classList.toggle('hidden', task.repeat!=='span'); document.getElementById('task-due').value = task.dueDate||'';
    (task.weekdays||[]).forEach(d=>{ const b=document.querySelector(`.weekday-btn[data-day="${d}"]`); if(b) b.classList.add('selected'); });
    document.getElementById('task-reminder').value = task.reminderMinutes||0;
    document.getElementById('notify-email').checked = (task.notifyVia||['email']).includes('email');
    document.getElementById('notify-push').checked = (task.notifyVia||[]).some(v=>v==='push'||v==='phone');
    if(document.getElementById('task-assignee-wrap').classList.contains('hidden')===false){
      document.getElementById('task-assignee').value = task.assignedTo||"";
    }
    document.getElementById('task-listid').value = task.listId||"";
  } else {
    document.getElementById('task-date').value = SELECTED_DATE;
  }
  document.getElementById('task-error').textContent="";
  document.getElementById('form-task').dataset.forceReschedule = forceReschedule? "1":"0";
  openModal('modal-task');
}

document.getElementById('btn-delete-task').addEventListener('click', async ()=>{
  const id = document.getElementById('task-id').value;
  if(!id) return;
  const task = await loadTask(id);
  playSound('delete');
  await deleteTaskDb(id);
  closeModal('modal-task');
  toast("Tarea eliminada", "ok");
  if(task && task.scope==='group'){
    const group = await loadGroupCached(task.groupCode);
    if(group){
      const isLeader = isGroupLeader(group);
      if(isLeader && task.assignedTo && task.assignedTo!==CURRENT_USER.email){
        await pushNotification(task.assignedTo, {type:'deletion', text:`${CURRENT_USER.name} eliminó la tarea "${task.title}".`});
      } else if(!isLeader){
        await notifyLeaders(group, {type:'deletion', text:`${CURRENT_USER.name} eliminó la tarea "${task.title}".`});
      }
    }
  }
  await renderTaskListForSelectedDate(); await renderCalendar(); await renderApprovals();
});

let BUSY_SAVE_TASK = false;
document.getElementById('form-task').addEventListener('submit', async e=>{
  e.preventDefault();
  if(BUSY_SAVE_TASK) return;
  BUSY_SAVE_TASK = true;
  const btn = e.target.querySelector('[type=submit]'); if(btn) btn.disabled = true;
  try{ await saveTaskForm(e); }
  finally{ BUSY_SAVE_TASK = false; if(btn) btn.disabled = false; }
});
async function saveTaskForm(e){
  const err = document.getElementById('task-error'); err.textContent="";
  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value.trim();
  if(!title){ err.textContent="Ponle un título a la tarea."; return; }
  const allDay = document.getElementById('task-allday').checked;
  const repeat = document.getElementById('task-repeat').value;
  if(repeat==='span' && document.getElementById('task-due').value && document.getElementById('task-due').value < document.getElementById('task-date').value){ err.textContent="La fecha límite no puede ser anterior al inicio."; return; }
  const weekdays = repeat==='weekly' ? [...document.querySelectorAll('.weekday-btn.selected')].map(b=>+b.dataset.day) : [];
  const notifyVia = [];
  if(document.getElementById('notify-email').checked) notifyVia.push('email');
  if(document.getElementById('notify-push').checked) notifyVia.push('push');
  const forceReschedule = document.getElementById('form-task').dataset.forceReschedule==="1";

  let task = id ? await loadTask(id) : {
    id: document.getElementById('form-task').dataset.newId || uid('t'),
    scope: CURRENT_SPACE.type,
    groupCode: CURRENT_SPACE.type==='group' ? CURRENT_SPACE.groupCode : null,
    ownerEmail: CURRENT_USER.email,
    createdBy: CURRENT_USER.email,
    done:false,
    status: 'accepted'
  };

  task.title = title;
  task.desc = document.getElementById('task-desc').value.trim();
  task.date = document.getElementById('task-date').value;
  task.time = allDay ? "" : document.getElementById('task-time').value;
  task.allDay = allDay;
  task.repeat = repeat;
  task.weekdays = weekdays;
  task.dueDate = repeat==='span' ? (document.getElementById('task-due').value || document.getElementById('task-date').value) : '';
  task.reminderMinutes = +document.getElementById('task-reminder').value;
  task.repeatEvery = allDay ? (+document.getElementById('task-repeat-every').value||0) : 0;
  task.repeatFrom = document.getElementById('task-repeat-from').value || '08:00';
  task.repeatTo = document.getElementById('task-repeat-to').value || '20:00';
  if(task.repeatEvery>0 && task.repeatFrom>=task.repeatTo){ err.textContent="En \"Recordar varias veces\", la hora inicial debe ser menor que la final."; return; }
  task.notifyVia = notifyVia;
  task.listId = document.getElementById('task-listid').value || null;
  const wasAssignedTo = task.assignedTo || null;

  if(task.scope==='group'){
    const group = await loadGroup(task.groupCode);
    const isLeader = isGroupLeader(group);
    if(isLeader){
      task.assignedTo = document.getElementById('task-assignee').value || null;
      task.visibility = task.assignedTo ? 'individual' : 'group'; // lo decide "Asignar a"
      if(!id) task.status='accepted';
      if(forceReschedule) task.status='rescheduled';
    } else {
      task.assignedTo = CURRENT_USER.email;
      task.visibility = 'individual'; // las tareas propuestas por un participante solo las ve él y el líder
      if(!id) task.status='pending';
      if(!id){
        await notifyLeaders(group, {type:'proposal', text:`${CURRENT_USER.name} propuso una nueva tarea: "${title}".`});
      }
    }
    if(forceReschedule && isLeader){
      const proposer = await findUserByEmail(task.createdBy);
      if(proposer) await pushNotification(proposer.email, {type:'reschedule', text:`Tu líder reprogramó la tarea "${title}" para ${task.date}${task.time?' '+task.time:''}.`});
    }
    // Notificaciones de creación/modificación entre líder ↔ persona asignada
    if(isLeader){
      if(!id && task.assignedTo && task.assignedTo!==CURRENT_USER.email){
        await pushNotification(task.assignedTo, {type:'creation', text:`${CURRENT_USER.name} te asignó una nueva tarea: "${title}" (${task.date}${task.time?' '+task.time:''}).`});
      } else if(id && task.assignedTo && task.assignedTo!==CURRENT_USER.email && !forceReschedule){
        await pushNotification(task.assignedTo, {type:'modification', text:`${CURRENT_USER.name} modificó tu tarea "${title}".`});
      }
    } else if(id && !isLeader){
      await notifyLeaders(group, {type:'modification', text:`${CURRENT_USER.name} modificó la tarea "${title}".`});
    }
  } else {
    task.assignedTo = CURRENT_USER.email;
    task.visibility = 'individual';
  }

  await saveTask(task);
  rearmReminders(task); // arregla: al EDITAR una tarea sus recordatorios se vuelven a programar
  if(!id) playSound('create');
  closeModal('modal-task');
  toast(id? "Tarea actualizada" : "Tarea creada", "ok");
  await renderTaskListForSelectedDate(); await renderCalendar(); await renderApprovals();
}

/* ==================== NOTIFICACIONES ==================== */
document.getElementById('btn-notifs').addEventListener('click', openNotifModal);
function renderNotifItems(box, items, emptyMsg){
  box.innerHTML = items.length ? "" : `<div class="empty-state"><p>${emptyMsg}</p></div>`;
  items.forEach(n=>{
    const el = document.createElement('div'); el.className="notif-item";
    el.innerHTML = `<div class="icon-wrap" style="background:rgba(61,107,255,.18)"><span class="icon" style="color:var(--blue)">${iconHTML(n.type==='invite_request'?'participant':'bell')}</span></div>
      <div style="flex:1"><p>${esc(n.text)}</p><span>${new Date(n.createdAt).toLocaleString('es-ES')}</span><div class="task-actions" style="margin-top:8px"></div></div>`;
    if(n.type==='invite_request'){
      const actions = el.querySelector('.task-actions');
      actions.appendChild(mkBtn('Aceptar','check', ()=>respondToInviteRequest(n, true), 'btn-lime'));
      actions.appendChild(mkBtn('Rechazar','close', ()=>respondToInviteRequest(n, false), 'btn-soft'));
    }
    box.appendChild(el);
  });
  mountIcons(box);
}
async function openNotifModal(){
  const list = await getNotifications(CURRENT_USER.email);
  renderNotifItems(document.getElementById('notif-list'), list.filter(n=>!n.read), 'No tienes notificaciones nuevas. Las anteriores están en el historial.');
  await DB.set('notifs:'+CURRENT_USER.email, list.map(n=>({...n, read:true}))); // pasan al historial
  document.getElementById('bell-dot').classList.add('hidden');
  openModal('modal-notifs');
}
async function openNotifHistory(){
  const list = await getNotifications(CURRENT_USER.email);
  renderNotifItems(document.getElementById('notif-history-list'), list, 'Aún no hay notificaciones guardadas.');
  closeMobileSidebar && closeMobileSidebar();
  openModal('modal-notif-history');
}
document.getElementById('btn-notif-history').addEventListener('click', openNotifHistory);
document.getElementById('btn-open-history-from-bell').addEventListener('click', ()=>{ closeModal('modal-notifs'); openNotifHistory(); });
document.getElementById('btn-clear-notif-history').addEventListener('click', async ()=>{
  if(!confirm('¿Vaciar todo el historial de notificaciones?')) return;
  await DB.set('notifs:'+CURRENT_USER.email, []);
  await openNotifHistory(); document.getElementById('bell-dot').classList.add('hidden');
});
async function refreshBell(){
  const list = await getNotifications(CURRENT_USER.email);
  document.getElementById('bell-dot').classList.toggle('hidden', !list.some(n=>!n.read));
}

/* ==================== PERFIL ==================== */
document.getElementById('btn-profile-top').addEventListener('click', async ()=>{
  document.getElementById('profile-avatar-preview').src = CURRENT_USER.photo || avatarFallbackURL(CURRENT_USER.name);
  document.getElementById('profile-name').value = CURRENT_USER.name;
  document.getElementById('profile-email').value = CURRENT_USER.email;
  document.getElementById('sound-enabled').checked = soundOn();
  updatePushStatus();
  const theme = Object.assign({}, THEME_DEFAULTS, CURRENT_USER.theme||{});
  document.getElementById('theme-text-custom').value = theme.text;
  document.getElementById('theme-bg-custom').value = theme.bg;
  updateHexLabels();
  document.getElementById('profile-pass-change').classList.add('hidden');
  document.getElementById('profile-error').textContent="";
  PENDING_PHOTO_DATA=null;
  openModal('modal-profile');
});
function updateHexLabels(){
  ['text','bg'].forEach(k=>{ document.getElementById('hex-'+k).textContent = document.getElementById('theme-'+k+'-custom').value.toUpperCase(); });
}
['text','bg'].forEach(k=>document.getElementById('theme-'+k+'-custom').addEventListener('input', updateHexLabels));
document.getElementById('btn-enable-push').addEventListener('click', togglePush);

// Redimensiona y comprime la imagen en el propio navegador antes de guardarla.
// Una foto de celular sin comprimir puede pesar varios MB en base64, y
// Firestore rechaza cualquier documento de más de 1MB — eso es lo que
// causaba el error "No se pudo guardar en la nube" al poner una foto
// (no es un problema de la región del servidor).
function resizeImageFile(file, maxSize=320, quality=0.72){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=> reject(new Error("No se pudo leer la imagen."));
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = ()=> reject(new Error("No se pudo procesar la imagen."));
      img.onload = ()=>{
        let {width, height} = img;
        if(width>height){ if(width>maxSize){ height=Math.round(height*maxSize/width); width=maxSize; } }
        else { if(height>maxSize){ width=Math.round(width*maxSize/height); height=maxSize; } }
        const canvas = document.createElement('canvas');
        canvas.width=width; canvas.height=height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
document.getElementById('btn-change-photo').addEventListener('click', ()=> document.getElementById('profile-photo-input').click());
document.getElementById('profile-photo-input').addEventListener('change', async e=>{
  const file = e.target.files[0]; if(!file) return;
  try{
    const dataUrl = await resizeImageFile(file);
    if(dataUrl.length > 700000){
      toast("Esa imagen sigue siendo muy pesada incluso comprimida. Prueba con otra foto.", "err");
      return;
    }
    PENDING_PHOTO_DATA = dataUrl;
    document.getElementById('profile-avatar-preview').src = dataUrl;
  }catch(err){
    console.error(err);
    toast("No se pudo procesar esa imagen. Prueba con otra.", "err");
  }
});
document.getElementById('btn-save-profile').addEventListener('click', async ()=>{
  const name = document.getElementById('profile-name').value.trim();
  const err = document.getElementById('profile-error'); err.textContent="";
  if(!name){ err.textContent="El nombre no puede estar vacío."; return; }
  CURRENT_USER.name = name;
  if(PENDING_PHOTO_DATA) CURRENT_USER.photo = PENDING_PHOTO_DATA;
  const accent = THEME_DEFAULTS.accent;
  const text = document.getElementById('theme-text-custom').value;
  const bg = document.getElementById('theme-bg-custom').value;
  CURRENT_USER.theme = {accent, text, bg};
  await saveUser(CURRENT_USER);
  applyTheme(CURRENT_USER.theme);
  await renderSidebar();
  toast("Perfil actualizado", "ok");
  closeModal('modal-profile');
});
document.getElementById('btn-theme-reset').addEventListener('click', ()=>{
  document.getElementById('theme-text-custom').value = THEME_DEFAULTS.text;
  document.getElementById('theme-bg-custom').value = THEME_DEFAULTS.bg;
  updateHexLabels();
  toast("Colores restaurados. Pulsa \"Guardar cambios\" para confirmar.", "info");
});
document.getElementById('btn-change-pass').addEventListener('click', async ()=>{
  const code = random6digits();
  CURRENT_USER.resetCode = code; CURRENT_USER.resetExpires = Date.now()+15*60*1000;
  await saveUser(CURRENT_USER);
  const sent = await sendRealEmail(CURRENT_USER.email, CURRENT_USER.name, "Código para cambiar tu contraseña — Electrotask",
    `Hola ${CURRENT_USER.name}, tu código para cambiar tu contraseña es ${code}. Vence en 15 minutos.`);
  if(sent) toast("Te enviamos un código a tu correo.", "ok");
  document.getElementById('profile-pass-change').classList.remove('hidden');
});
document.getElementById('btn-confirm-pass-change').addEventListener('click', async ()=>{
  const err = document.getElementById('profile-pass-error'); err.textContent="";
  const code = document.getElementById('profile-pass-code').value.trim();
  const p1 = document.getElementById('profile-pass-new').value;
  const p2 = document.getElementById('profile-pass-new2').value;
  if(CURRENT_USER.resetCode!==code || Date.now()>CURRENT_USER.resetExpires){ err.textContent="Código inválido o expirado."; return; }
  if(p1.length<6){ err.textContent="Mínimo 6 caracteres."; return; }
  if(p1!==p2){ err.textContent="No coinciden."; return; }
  CURRENT_USER.passwordHash = simpleHash(p1);
  delete CURRENT_USER.resetCode; delete CURRENT_USER.resetExpires;
  await saveUser(CURRENT_USER);
  toast("Contraseña actualizada", "ok");
  document.getElementById('profile-pass-change').classList.add('hidden');
  document.getElementById('profile-pass-code').value="";
  document.getElementById('profile-pass-new').value="";
  document.getElementById('profile-pass-new2').value="";
});

/* ==================== RESPONSIVE: menú lateral en celular/tablet ==================== */
function setupResponsiveSidebar(){
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggleBtn = document.getElementById('btn-menu-toggle');
  toggleBtn.addEventListener('click', ()=>{
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('open', sidebar.classList.contains('open'));
  });
  backdrop.addEventListener('click', closeMobileSidebar);
}
function closeMobileSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('open');
}

/* ==================== INICIO ==================== */
window.addEventListener('DOMContentLoaded', async ()=>{
  setPerf();
  mountIcons();
  applyBrand();
  startDrip('dripCanvas');
  startDrip('dripCanvas2');
  setupResponsiveSidebar();
  setTimeout(()=>{
    if(FIREBASE_READY){
      toast("Conectado a la nube: tus grupos y tareas se comparten entre todos tus dispositivos.", "ok");
    } else {
      toast("Modo local: aún no configuraste Firebase, así que los grupos/códigos creados en este dispositivo NO se verán en otros (PC, celular, etc). Revisa las instrucciones en FIREBASE_CONFIG dentro del código.", "warn");
    }
  }, 600);
  const session = await getSession();
  if(session && session.email){
    const user = await loadUser(session.email);
    if(user){
      CURRENT_USER = user;
      if(user.onboarded || user.groups.length){
        CURRENT_SPACE = await resolveInitialSpace(user);
        await enterDashboard();
        return;
      } else {
        showScreen('screen-role');
        return;
      }
    }
  }
  showScreen('screen-auth');
});
/* ==================== SUBLÍDERES (máx. 3 por grupo) ==================== */
function groupLeaders(g){ return [g.leaderEmail, ...(g.coLeaders||[])]; }
function isGroupLeader(g, email){ return !!g && groupLeaders(g).includes(email || CURRENT_USER.email); }
async function notifyLeaders(g, notif){ // avisa al líder y a los subLíderes (menos a quien hizo la acción)
  for(const em of groupLeaders(g)){ if(em!==CURRENT_USER.email) await pushNotification(em, {...notif}); }
}
async function setCoLeader(groupCode, email, make){
  if(!needOnline()) return;
  const g = await loadGroup(groupCode); if(!g) return;
  if(g.leaderEmail!==CURRENT_USER.email){ toast("Solo el líder principal puede asignar subLíderes.", "warn"); return; }
  g.coLeaders = g.coLeaders || [];
  if(make){
    if(g.coLeaders.length>=3){ toast("Máximo 3 subLíderes por grupo.", "warn"); return; }
    if(!g.members.includes(email) || g.coLeaders.includes(email)) return;
    g.coLeaders.push(email);
  } else g.coLeaders = g.coLeaders.filter(e=>e!==email);
  await saveGroup(g);
  await pushNotification(email, {type:'role', text: make
    ? `${CURRENT_USER.name} te nombró subLíder del grupo "${g.name}". Ya puedes aprobar, editar y eliminar tareas.`
    : `Ya no eres subLíder del grupo "${g.name}".`});
  toast(make? "SubLíder asignado." : "SubLíder quitado.", "ok");
  await openMembersModal(); await renderSidebar();
}

/* ==================== PUSH WEB ====================
   - Mientras la app esté abierta (aunque en segundo plano) un único listener del documento
     de notificaciones del usuario muestra el aviso en el momento.
   - Con la app cerrada: pon tu clave Web Push en FCM_VAPID_KEY y despliega functions-index.js
     (Cloud Function que envía el push con Firebase Cloud Messaging). */
const FCM_VAPID_KEY = ""; // Firebase > Configuración > Cloud Messaging > Certificados Web Push
let NOTIF_UNSUB = null, NOTIF_SEEN = new Set(), NOTIF_FIRST = true;
const PUSH_ICON = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#3D6BFF"/><path d="M36 8L16 36h14l-2 20 20-28H34z" fill="#fff"/></svg>');
const pushSupported = ()=> 'Notification' in window;
function updatePushStatus(){
  const b = document.getElementById('btn-enable-push'), st = document.getElementById('push-status'); if(!b) return;
  if(!pushSupported()){ b.disabled = true; st.textContent = 'Este navegador no soporta notificaciones.'; return; }
  const on = !!(CURRENT_USER && CURRENT_USER.pushEnabled && Notification.permission==='granted');
  b.textContent = on ? 'Desactivar notificaciones' : 'Activar notificaciones';
  st.textContent = Notification.permission==='denied' ? 'Bloqueadas: actívalas en los permisos del sitio.' : (on ? '✓ Activas en este dispositivo' : '');
}
async function togglePush(){
  if(!pushSupported()) return;
  if(CURRENT_USER.pushEnabled && Notification.permission==='granted'){
    CURRENT_USER.pushEnabled = false; await saveUser(CURRENT_USER); updatePushStatus(); toast("Notificaciones push desactivadas.", "ok"); return;
  }
  const perm = await Notification.requestPermission();
  if(perm!=='granted'){ updatePushStatus(); toast("No se otorgó el permiso de notificaciones.", "warn"); return; }
  CURRENT_USER.pushEnabled = true; await saveUser(CURRENT_USER); updatePushStatus();
  registerFCM();
  showPush({id:'test_'+Date.now(), text:'Las notificaciones de Electrotask están activas ✓'}, true);
}
async function registerFCM(){
  if(!FCM_VAPID_KEY || !FIREBASE_READY || !('serviceWorker' in navigator)) return;
  try{
    await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
    const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('sw.js'));
    const token = await firebase.messaging().getToken({vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: reg});
    if(!token) return;
    const doc = (await DB.get('push:'+CURRENT_USER.email)) || {tokens:[]};
    if(!doc.tokens.includes(token)){ doc.tokens = [...doc.tokens, token].slice(-5); await DB.set('push:'+CURRENT_USER.email, doc); }
  }catch(e){ console.warn('FCM', e); }
}
async function showPush(n, force){
  if(!CURRENT_USER || !pushSupported() || Notification.permission!=='granted' || (!CURRENT_USER.pushEnabled && !force)) return;
  if(!force && document.visibilityState==='visible'){ toast(n.text, "ok"); return; } // con la app a la vista: aviso interno
  const opts = {body:n.text, icon:PUSH_ICON, badge:PUSH_ICON, tag:n.id, data:{url:location.href}};
  try{
    const reg = ('serviceWorker' in navigator) ? await navigator.serviceWorker.getRegistration() : null;
    if(reg) await reg.showNotification('Electrotask', opts); else new Notification('Electrotask', opts);
  }catch(e){ try{ new Notification('Electrotask', opts); }catch(_){} }
}
function startNotifListener(){
  if(!FIREBASE_READY || !CURRENT_USER) return;
  if(NOTIF_UNSUB){ try{ NOTIF_UNSUB(); }catch(e){} NOTIF_UNSUB = null; }
  const email = CURRENT_USER.email; NOTIF_SEEN = new Set(); NOTIF_FIRST = true;
  NOTIF_UNSUB = CLOUD_DB.col().doc('notifs:'+email).onSnapshot(snap=>{
    if(!CURRENT_USER || CURRENT_USER.email!==email){ if(NOTIF_UNSUB){ NOTIF_UNSUB(); NOTIF_UNSUB = null; } return; }
    const list = (snap.exists && snap.data().value) || [];
    if(!snap.metadata.hasPendingWrites){
      list.forEach(n=>{ if(!NOTIF_SEEN.has(n.id)){ NOTIF_SEEN.add(n.id); if(!NOTIF_FIRST && !n.read){ playSound('notify'); showPush(n); if(['creation','modification','reschedule'].includes(n.type)) warmReminderIndex().then(checkReminders).catch(()=>{}); } } });
      if(NOTIF_FIRST && !snap.metadata.fromCache) NOTIF_FIRST = false;
    }
    document.getElementById('bell-dot').classList.toggle('hidden', !list.some(n=>!n.read));
  }, e=>console.warn('listener de notificaciones', e));
}

/* ==================== RECORDATORIOS ====================
   Usa la fecha y hora REALES del dispositivo (zona horaria local). Mientras la app esté abierta
   (aunque en segundo plano) revisa cada 30 s y, a la hora exacta (hora de la tarea - minutos elegidos),
   envía el correo y/o la notificación push web que marcaste en la tarea. Una sola vez por ocurrencia. */
const CHEV_SVG = '<span class="task-chev"><svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg></span>';
const REM_KEY = 'electrotask::reminded';
let REM_INDEX = {};
function remLoad(){ try{ return JSON.parse(localStorage.getItem(REM_KEY)||'{}'); }catch(e){ return {}; } }
function remSave(o){
  const lim = Date.now() - 4*86400000; Object.keys(o).forEach(k=>{ if(o[k]<lim) delete o[k]; });
  try{ localStorage.setItem(REM_KEY, JSON.stringify(o)); }catch(e){}
}
const remEligible = t=> !!t && ((t.reminderMinutes>0 && t.time && !t.allDay) || (t.allDay && t.repeatEvery>0));
function indexForReminders(list){
  (list||[]).forEach(t=>{ if(remEligible(t)) REM_INDEX[t.id] = t; else if(t) delete REM_INDEX[t.id]; });
}
async function warmReminderIndex(){
  if(!CURRENT_USER) return;
  const fresh = {};
  const add = list=>(list||[]).forEach(t=>{ if(remEligible(t)) fresh[t.id]=t; });
  add((await DB.byField('tasks:','ownerEmail',CURRENT_USER.email)).filter(t=>t.scope==='individual'));
  for(const code of (CURRENT_USER.groups||[])){ await loadGroupCached(code); add(await DB.byField('tasks:','groupCode',code)); }
  REM_INDEX = fresh;
}
function remindsMe(t, iso){
  const me = CURRENT_USER.email;
  if(occRead(t, iso).done) return false;
  if(t.scope==='individual') return t.ownerEmail===me;
  if(t.status==='rejected') return false;
  if(t.assignedTo) return t.assignedTo===me;
  const g = GROUP_CACHE[t.groupCode];
  if(!g || !g.members.includes(me) || !memberExpected(g, me, iso)) return false;
  return !(occRead(t, iso).completions || {})[me];
}
function leadText(m){ return m>=1440 ? `${m/1440} día(s)` : m>=60 ? `${m/60} hora(s)` : `${m} minutos`; }
async function sendReminder(t, iso){
  playSound('notify');
  const text = `Recordatorio: "${t.title}" es en ${leadText(t.reminderMinutes)} (${fmtDateLong(iso)} a las ${t.time}).`;
  const via = t.notifyVia || ['email'];
  if(via.includes('push') || via.includes('phone')){
    if(pushSupported() && Notification.permission==='granted') await showPush({id:'rem_'+t.id+'_'+iso+'_'+t.reminderMinutes, text}, true);
    else toast(text, "warn");
  } else toast(text, "ok");
  if(via.includes('email')) sendRealEmail(CURRENT_USER.email, CURRENT_USER.name, 'Recordatorio — '+t.title, text, true).catch(()=>{});
}
async function checkReminders(){
  if(!CURRENT_USER) return;
  const now = Date.now(), done = remLoad(); let changed = false;
  const days = [toISODate(new Date(now)), toISODate(new Date(now+86400000))];
  for(const t of Object.values(REM_INDEX)){
    if(t.allDay){ if(handleAllDayRepeat(t, now, done)) changed = true; continue; }
    for(const iso of days){
      if(!occursOnDate(t, iso) || !remindsMe(t, iso)) continue;
      const ev = new Date(iso+'T'+t.time+':00').getTime();       // hora local del dispositivo
      const fire = ev - t.reminderMinutes*60000;
      if(now < fire || now > ev + 120000) continue;
      const key = t.id+'|'+iso+'|'+t.time+'|'+t.reminderMinutes; // incluye la hora: al editarla se vuelve a avisar
      if(done[key]) continue;
      done[key] = now; changed = true;
      sendReminder(t, iso);
    }
  }
  if(changed) remSave(done);
}
{ const _gt = getTasksForSpace; getTasksForSpace = async function(force){ const r = await _gt(force); indexForReminders(r); return r; }; }
setInterval(checkReminders, 30000);
setInterval(()=>{ if(CURRENT_USER && !document.hidden) warmReminderIndex().catch(()=>{}); }, 30*60000);

/* ==================== ALERTA DE TAREAS RETRASADAS ==================== */
let OVERDUE_LIST = [];
function computeOverdue(tasks, group){
  const today = toISODate(new Date()), out = [];
  const back = []; for(let i=1;i<=14;i++) back.push(toISODate(new Date(Date.now()-i*86400000)));
  (tasks||[]).forEach(t=>{
    if(t.scope==='group' && (t.status==='pending' || t.status==='rejected')) return;
    let days;
    if(t.repeat==='none') days = [t.date];
    else if(t.repeat==='span') days = [t.dueDate || t.date];
    else days = back;
    days.forEach(iso=>{ if(iso < today && occursOnDate(t, iso) && taskState(t, iso, group)==='overdue') out.push({t, iso}); });
  });
  const tk = o=> o.iso + (o.t.allDay ? '00:00' : (o.t.time||'23:59'));
  return out.sort((a,b)=>tk(a).localeCompare(tk(b))); // la más antigua primero
}
function updateOverdueAlert(tasks, group){
  OVERDUE_LIST = computeOverdue(tasks, group);
  const b = document.getElementById('btn-overdue'); if(!b) return;
  b.classList.toggle('hidden', !OVERDUE_LIST.length);
  document.getElementById('overdue-count').textContent = OVERDUE_LIST.length>99 ? '99+' : OVERDUE_LIST.length;
  b.title = OVERDUE_LIST.length + ' tarea(s) retrasada(s)';
}
function openOverdueModal(){
  const L = OVERDUE_LIST; if(!L.length) return;
  document.getElementById('overdue-summary').textContent = L.length===1
    ? 'Tienes 1 tarea retrasada de un día anterior.'
    : `Tienes ${L.length} tareas retrasadas de días anteriores. "Ver detalles" te lleva a la más antigua.`;
  const box = document.getElementById('overdue-list'); box.innerHTML = '';
  L.slice(0,8).forEach(o=>{
    const row = document.createElement('div'); row.className = 'overdue-row';
    row.innerHTML = `<i></i><div><b>${esc(o.t.title)}</b><span>${esc(fmtDateLong(o.iso))} · ${esc(lateText(o.t, o.iso))}</span></div>`;
    row.addEventListener('click', ()=>goToOverdue(o)); box.appendChild(row);
  });
  if(L.length>8){ const more = document.createElement('p'); more.className='hint'; more.textContent = `y ${L.length-8} más…`; box.appendChild(more); }
  openModal('modal-overdue');
}
async function goToOverdue(o){
  const [y,m] = o.iso.split('-').map(Number);
  SELECTED_DATE = o.iso; CAL_VIEW = new Date(y, m-1, 1);
  document.getElementById('task-list-filter').value = '';
  closeModal('modal-overdue');
  await renderCalendar(); await renderTaskListForSelectedDate();
  const el = document.querySelector(`[data-task-id="${o.t.id}"]`);
  if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'), 2200); }
}
document.getElementById('btn-overdue').addEventListener('click', openOverdueModal);
document.getElementById('btn-overdue-details').addEventListener('click', ()=>{ if(OVERDUE_LIST.length) goToOverdue(OVERDUE_LIST[0]); });

/* ==================== LIMPIEZA AUTOMÁTICA (ahorra espacio en Firebase) ====================
   Al entrar se borran de verdad las notificaciones de más de 30 días y los códigos vencidos. */
async function purgeOldNotifications(){
  if(!CURRENT_USER || !isOnline()) return;
  try{
    const raw = (await DB.get('notifs:'+CURRENT_USER.email)) || [];
    const kept = pruneNotifs(raw);
    if(kept.length !== raw.length) await DB.set('notifs:'+CURRENT_USER.email, kept);
    let dirty = false;
    ['resetExpires','deleteExpires'].forEach(k=>{
      if(CURRENT_USER[k] && Date.now() > CURRENT_USER[k]){
        delete CURRENT_USER[k]; delete CURRENT_USER[k==='resetExpires'?'resetCode':'deleteCodeHash']; dirty = true;
      }
    });
    if(dirty) await saveUser(CURRENT_USER);
  }catch(e){ console.warn('purga', e); }
}

/* ==================== CERRAR SESIÓN / ELIMINAR CUENTA ==================== */
async function codeHash(str, alg){ // el código NUNCA se guarda en claro
  if(alg!=='f'){
    try{ if(window.crypto && crypto.subtle){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)); return 's:'+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); } }catch(e){}
  }
  let h1=0xdeadbeef, h2=0x41c6ce57;
  for(let i=0;i<str.length;i++){ const c=str.charCodeAt(i); h1=Math.imul(h1^c,2654435761); h2=Math.imul(h2^c,1597334677); }
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return 'f:'+(4294967296*(2097151&h2)+(h1>>>0)).toString(36);
}
let DEL_FAILS = 0, DEL_LOCK = 0;
function sessionStep(n){ ['session-step-choice','session-step-verify','session-step-code'].forEach((id,i)=>document.getElementById(id).classList.toggle('hidden', i!==n)); }
function openSessionModal(){
  ['del-email','del-pass','del-code'].forEach(id=>document.getElementById(id).value='');
  ['del-error1','del-error2'].forEach(id=>document.getElementById(id).textContent='');
  sessionStep(0); openModal('modal-session');
}
document.getElementById('btn-logout').addEventListener('click', openSessionModal);
document.getElementById('btn-session-logout').addEventListener('click', async ()=>{ closeModal('modal-session'); await doLogout(); });
document.getElementById('btn-session-delete').addEventListener('click', ()=>{ sessionStep(1); });
document.getElementById('btn-del-back1').addEventListener('click', ()=>sessionStep(0));
document.getElementById('btn-del-cancel').addEventListener('click', ()=>{ closeModal('modal-session'); });
document.getElementById('btn-del-send').addEventListener('click', async ()=>{
  const err = document.getElementById('del-error1'); err.textContent = '';
  if(!needOnline()) return;
  if(Date.now() < DEL_LOCK){ err.textContent = 'Demasiados intentos. Espera un minuto.'; return; }
  const email = document.getElementById('del-email').value.trim().toLowerCase();
  const pass = document.getElementById('del-pass').value;
  const user = await loadUser(CURRENT_USER.email);
  if(!user || email!==CURRENT_USER.email || user.passwordHash!==simpleHash(pass)){
    if(++DEL_FAILS>=5){ DEL_LOCK = Date.now()+60000; DEL_FAILS = 0; }
    err.textContent = 'Correo o contraseña incorrectos.'; return;
  }
  DEL_FAILS = 0;
  const btn = document.getElementById('btn-del-send'); btn.disabled = true;
  const code = random6digits();
  user.deleteCodeHash = await codeHash(code+'|'+user.email+'|electrotask-del');
  user.deleteExpires = Date.now()+15*60*1000;
  await saveUser(user); CURRENT_USER.deleteCodeHash = user.deleteCodeHash; CURRENT_USER.deleteExpires = user.deleteExpires;
  const sent = await sendRealEmail(user.email, user.name, 'Código para eliminar tu cuenta — Electrotask',
    `Hola ${user.name}, tu código para ELIMINAR tu cuenta de Electrotask es ${code}. Vence en 15 minutos. Si no fuiste tú, no lo compartas e ignora este correo.`);
  btn.disabled = false;
  if(!sent){ err.textContent = 'No se pudo enviar el código. Revisa tu conexión e inténtalo de nuevo.'; return; }
  toast('Te enviamos un código a tu correo.', 'ok');
  sessionStep(2);
});
async function deleteAccountEverywhere(){
  const me = CURRENT_USER.email, name = CURRENT_USER.name;
  const user = (await loadUser(me)) || CURRENT_USER;
  // 1) Grupos
  for(const code of [...(user.groups||[])]){
    const g = await loadGroup(code); if(!g) continue;
    const others = g.members.filter(m=>m!==me);
    if(g.leaderEmail===me && others.length===0){            // era el único integrante: se elimina el grupo completo
      await deleteGroupCascade(code);
      for(const l of await DB.byField('lists:','groupCode',code)) await DB.del('lists:'+l.id);
      continue;
    }
    if(g.leaderEmail===me){                                   // traspasa el liderazgo (subLíder primero)
      const heir = (g.coLeaders||[]).find(e=>others.includes(e)) || others[0];
      g.leaderEmail = heir; g.coLeaders = (g.coLeaders||[]).filter(e=>e!==heir && e!==me);
    }
    g.members = others; g.coLeaders = (g.coLeaders||[]).filter(e=>e!==me);
    if(g.joined) delete g.joined[me];
    await saveGroup(g);
    await notifyLeaders(g, {type:'member_left', text:`${name} eliminó su cuenta y salió del grupo "${g.name}".`});
    for(const t of await DB.byField('tasks:','groupCode',code)){   // limpia sus datos dentro de las tareas del grupo
      if(t.assignedTo===me){ await DB.del('tasks:'+t.id); continue; }
      let ch = false;
      if(t.completions && t.completions[me]){ delete t.completions[me]; ch = true; }
      if(t.occ) Object.values(t.occ).forEach(o=>{ if(o.completions && o.completions[me]){ delete o.completions[me]; ch = true; } });
      if(t.createdBy===me){ t.createdBy = g.leaderEmail; ch = true; }
      if(t.ownerEmail===me){ t.ownerEmail = g.leaderEmail; ch = true; }
      if(ch) await DB.set('tasks:'+t.id, t);
    }
  }
  // 2) Datos individuales
  for(const t of await DB.byField('tasks:','ownerEmail',me)) if(t.scope==='individual') await DB.del('tasks:'+t.id);
  for(const l of await DB.byField('lists:','ownerEmail',me)) if(l.scope==='individual') await DB.del('lists:'+l.id);
  // 3) Documentos de la persona (el perfil va al final)
  await DB.del('notifs:'+me); await DB.del('notes:'+me); await DB.del('pending_invites:'+me); await DB.del('push:'+me);
  await DB.del('users:'+me);
  // 4) Limpieza local
  if(NOTIF_UNSUB){ try{ NOTIF_UNSUB(); }catch(e){} NOTIF_UNSUB = null; }
  try{ obSave(obLoad().filter(o=>o.user!==me)); }catch(e){}
  delete ALL_USERS_CACHE[me]; Object.keys(GROUP_CACHE).forEach(k=>delete GROUP_CACHE[k]);
  invalidateTasksCache(); LISTS_CACHE = {key:null, lists:null}; REM_INDEX = {};
  await clearSession(); CURRENT_USER = null;
}
document.getElementById('btn-del-confirm').addEventListener('click', async ()=>{
  const err = document.getElementById('del-error2'); err.textContent = '';
  if(!needOnline()) return;
  if(Date.now() < DEL_LOCK){ err.textContent = 'Demasiados intentos. Espera un minuto.'; return; }
  const code = document.getElementById('del-code').value.trim();
  const user = await loadUser(CURRENT_USER.email);
  if(!user || !user.deleteCodeHash || Date.now()>user.deleteExpires){ err.textContent = 'Código inválido o expirado. Pide uno nuevo.'; return; }
  const alg = user.deleteCodeHash.startsWith('s:') ? 's' : 'f';
  if(!/^\d{6}$/.test(code) || (await codeHash(code+'|'+user.email+'|electrotask-del', alg))!==user.deleteCodeHash){
    if(++DEL_FAILS>=5){ DEL_LOCK = Date.now()+60000; DEL_FAILS = 0; }
    err.textContent = 'El código no es correcto.'; return;
  }
  const btn = document.getElementById('btn-del-confirm'); btn.disabled = true; btn.textContent = 'Eliminando…';
  try{
    const mail = {to:user.email, name:user.name};
    await deleteAccountEverywhere();
    sendRealEmail(mail.to, mail.name, 'Tu cuenta de Electrotask fue eliminada', 'Tu cuenta y tus datos fueron eliminados de Electrotask. Si no fuiste tú, contacta al administrador.', true).catch(()=>{});
    closeModal('modal-session'); showScreen('screen-auth');
    toast('Tu cuenta fue eliminada por completo.', 'ok');
  }catch(e){
    console.error('eliminar cuenta', e); err.textContent = 'No se pudo completar la eliminación. Revisa tu conexión y vuelve a intentarlo.';
  }finally{ btn.disabled = false; btn.textContent = 'Eliminar cuenta'; }
});

/* ==================== ★ SONIDOS ★ (los archivos se configuran en window.APP_SOUNDS, en el <head>) ==================== */
const SND = {ctx:null, buf:{}, loading:{}, last:0};
const soundOn = ()=>{ try{ return localStorage.getItem('electrotask::sound')!=='0'; }catch(e){ return true; } };
function sndCtx(){
  if(!SND.ctx){ const C = window.AudioContext || window.webkitAudioContext; if(!C) return null; SND.ctx = new C(); }
  if(SND.ctx.state==='suspended') SND.ctx.resume().catch(()=>{});
  return SND.ctx;
}
function sndLoad(name){
  const url = (window.APP_SOUNDS||{})[name]; if(!url || typeof url!=='string') return Promise.resolve(null);
  if(SND.buf[name]) return Promise.resolve(SND.buf[name]);
  if(SND.loading[name]) return SND.loading[name];
  return SND.loading[name] = (async()=>{
    try{
      const ctx = sndCtx(); if(!ctx) return null;
      const ab = await (await fetch(url)).arrayBuffer();
      const buf = await new Promise((ok,ko)=>ctx.decodeAudioData(ab, ok, ko));
      return SND.buf[name] = buf;
    }catch(e){ console.warn('sonido', name, e); SND.loading[name] = null; return null; }
  })();
}
function playSound(name){
  try{
    const S = window.APP_SOUNDS; if(!S || !S.enabled || !S[name] || !soundOn()) return;
    const ctx = sndCtx(); if(!ctx) return;
    sndLoad(name).then(buf=>{
      if(!buf) return;
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = buf; g.gain.value = (S.volume==null ? .6 : S.volume) * ((S.vol && S.vol[name]!=null) ? S.vol[name] : 1);
      src.connect(g); g.connect(ctx.destination); src.start(0);
    });
  }catch(e){}
}
document.addEventListener('pointerdown', ()=>{ ['click','notify','check','done','create','delete','error'].forEach(sndLoad); }, {once:true});
document.addEventListener('click', e=>{
  const el = e.target.closest && e.target.closest('button, .btn, .nav-item, .cal-day, .task-check, .overdue-row, .role-card, [data-close]');
  if(!el || el.disabled) return;
  const t = Date.now(); if(t - SND.last < 60) return; SND.last = t;
  playSound('click');
}, true);
document.getElementById('sound-enabled').addEventListener('change', e=>{ try{ localStorage.setItem('electrotask::sound', e.target.checked ? '1' : '0'); }catch(_){} if(e.target.checked) playSound('click'); });

/* ==================== RECORDATORIOS: re-armado al editar + repetición en tareas de todo el día ==================== */
function remClearTask(id){ const o = remLoad(); Object.keys(o).forEach(k=>{ if(k.startsWith(id+'|')) delete o[k]; }); remSave(o); }
function rearmReminders(task){
  try{ remClearTask(task.id); indexForReminders([task]); setTimeout(checkReminders, 300); }catch(e){ console.warn('rearm', e); }
}
function hhmmToMin(v){ const [h,m] = String(v||'0:0').split(':').map(Number); return (h||0)*60 + (m||0); }
function handleAllDayRepeat(t, now, done){
  const iso = toISODate(new Date(now));
  if(!(t.repeatEvery>0) || !occursOnDate(t, iso) || !remindsMe(t, iso)) return false;
  const from = hhmmToMin(t.repeatFrom||'08:00'), to = hhmmToMin(t.repeatTo||'20:00');
  const nowMin = (now - new Date(iso+'T00:00:00').getTime())/60000;
  if(nowMin < from || nowMin > to) return false;
  const slot = from + Math.floor((nowMin-from)/t.repeatEvery)*t.repeatEvery; // franja actual
  const key = t.id+'|'+iso+'|r|'+slot;
  if(done[key]) return false;
  done[key] = now;
  const cada = t.repeatEvery>=60 ? (t.repeatEvery/60)+' h' : t.repeatEvery+' min';
  const text = `Recordatorio: "${t.title}" sigue pendiente hoy (aviso cada ${cada}).`;
  const via = t.notifyVia || ['email'];
  playSound('notify');
  if(via.includes('push') || via.includes('phone')){
    if(pushSupported() && Notification.permission==='granted') showPush({id:'rep_'+t.id+'_'+iso+'_'+slot, text}, true);
    else toast(text, 'warn');
  } else toast(text, 'ok');
  if(via.includes('email')) sendRealEmail(CURRENT_USER.email, CURRENT_USER.name, 'Recordatorio — '+t.title, text, true).catch(()=>{});
  return true;
}
let LAST_WARM = Date.now();
{ const _w = warmReminderIndex; warmReminderIndex = async function(){ LAST_WARM = Date.now(); return _w(); }; }
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && CURRENT_USER && Date.now()-LAST_WARM > 10*60000) warmReminderIndex().then(checkReminders).catch(()=>{}); });

/* ==================== NOTAS Y PENDIENTES ==================== */
let NOTES = [], NOTE_EDIT = null;
async function loadNotes(){ NOTES = (await DB.get('notes:'+CURRENT_USER.email)) || []; }
async function saveNotes(){ await DB.set('notes:'+CURRENT_USER.email, NOTES.slice(0,300)); }
function resetNoteForm(){
  NOTE_EDIT = null; document.getElementById('note-title').value = ''; document.getElementById('note-text').value = '';
  document.getElementById('btn-note-cancel').classList.add('hidden'); document.getElementById('btn-note-save').textContent = 'Guardar nota';
}
function renderNotes(){
  const box = document.getElementById('notes-list');
  const list = [...NOTES].sort((a,b)=> (a.done-b.done) || (b.updatedAt-a.updatedAt));
  box.innerHTML = list.length ? '' : '<div class="empty-state"><p>Aún no tienes notas. Escribe tu primer pendiente arriba.</p></div>';
  list.forEach(n=>{
    const el = document.createElement('div'); el.className = 'note-item'+(n.done?' done collapsed':'');
    el.innerHTML = `<input type="checkbox" ${n.done?'checked':''} title="Marcar como hecha">
      <div class="note-body"><div class="note-head"><b>${esc(n.title||'Sin título')}</b>${n.done?CHEV_SVG:''}</div><div class="note-more">${n.text?`<p>${esc(n.text)}</p>`:''}<small>${new Date(n.updatedAt).toLocaleString('es-ES')}</small></div></div>
      <div class="note-actions"><button class="btn btn-soft" data-a="edit">Editar</button><button class="btn btn-soft" data-a="del">Borrar</button></div>`;
    if(n.done) el.querySelector('.note-head').addEventListener('click', ()=>el.classList.toggle('collapsed')); // notas hechas: solo título + flecha
    el.querySelector('input').addEventListener('change', async e=>{ n.done = e.target.checked; n.updatedAt = Date.now(); await saveNotes(); if(n.done) playSound('check'); renderNotes(); });
    el.querySelector('[data-a=edit]').addEventListener('click', ()=>{
      NOTE_EDIT = n.id; document.getElementById('note-title').value = n.title||''; document.getElementById('note-text').value = n.text||'';
      document.getElementById('btn-note-cancel').classList.remove('hidden'); document.getElementById('btn-note-save').textContent = 'Actualizar nota';
      document.getElementById('note-title').focus();
    });
    el.querySelector('[data-a=del]').addEventListener('click', async ()=>{
      if(!confirm('¿Borrar esta nota?')) return;
      NOTES = NOTES.filter(x=>x.id!==n.id); await saveNotes(); playSound('delete'); if(NOTE_EDIT===n.id) resetNoteForm(); renderNotes();
    });
    box.appendChild(el);
  });
}
async function openNotes(){ if(typeof closeMobileSidebar==='function') closeMobileSidebar(); await loadNotes(); resetNoteForm(); renderNotes(); openModal('modal-notes'); }
document.getElementById('btn-notes').addEventListener('click', openNotes);
document.getElementById('btn-note-cancel').addEventListener('click', resetNoteForm);
document.getElementById('btn-note-save').addEventListener('click', async ()=>{
  const title = document.getElementById('note-title').value.trim(), text = document.getElementById('note-text').value.trim();
  if(!title && !text){ toast('Escribe un título o el texto de la nota.', 'warn'); return; }
  if(NOTE_EDIT){ const n = NOTES.find(x=>x.id===NOTE_EDIT); if(n){ n.title = title; n.text = text; n.updatedAt = Date.now(); } }
  else NOTES.unshift({id: uid('nt'), title, text, done:false, createdAt: Date.now(), updatedAt: Date.now()});
  await saveNotes(); playSound('create'); resetNoteForm(); renderNotes();
});

/* ==================== CRONOGRAMA (con descarga a Excel) ==================== */
const CRON_LABEL = {todo:'Por hacer', overdue:'Retrasada', done:'Hecha', approval:'Por aprobar', span:'En curso', rejected:'Rechazada'};
const CRON_REP = {none:'No se repite', daily:'Diaria', weekly:'Semanal', monthly:'Mensual', month_start:'Inicio de mes', month_end:'Fin de mes', span:'Varios días'};
const fmtShort = iso=> iso.split('-').reverse().join('/');
function weekStartISO(iso){ const d = new Date(iso+'T00:00:00'); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return toISODate(d); }
function weekLabel(ws){ const e = new Date(ws+'T00:00:00'); e.setDate(e.getDate()+6); return `Semana del ${fmtShort(ws)} al ${fmtShort(toISODate(e))}`; }
const cronKey = ()=> 'electrotask::cron_hidden::'+CURRENT_USER.email+'::'+currentSpaceKey();
function cronHidden(){ try{ return new Set(JSON.parse(localStorage.getItem(cronKey())||'[]')); }catch(e){ return new Set(); } }
function cronSaveHidden(set){ try{ localStorage.setItem(cronKey(), JSON.stringify([...set])); }catch(e){} }
async function buildCronRows(from, to){
  const group = CURRENT_SPACE.type==='group' ? await loadGroupCached(CURRENT_SPACE.groupCode) : null;
  const isLeader = isGroupLeader(group);
  const tasks = (await getTasksForSpace()).filter(t=>isTaskVisible(t, isLeader));
  const listName = Object.fromEntries((await getListsForSpace()).map(l=>[l.id, l.name]));
  await Promise.all([...new Set(tasks.map(t=>t.assignedTo).filter(Boolean))].map(findUserByEmail));
  const nm = em=> (ALL_USERS_CACHE[em]||{}).name || em;
  const rows = [];
  const add = (t, start, end)=>{
    const st = taskState(t, end, group);
    rows.push({ week: weekStartISO(start), name: t.title, stKey: st, state: CRON_LABEL[st], start, end,
      time: t.allDay ? 'Todo el día' : (t.time||''),
      who: (t.scope==='group' && !t.assignedTo) ? 'Todo el grupo' : nm(t.assignedTo || t.ownerEmail),
      list: t.listId ? (listName[t.listId]||'') : '', rep: CRON_REP[t.repeat]||'', desc: t.desc||'' });
  };
  for(const t of tasks){
    if(t.repeat==='none'){ if(t.date>=from && t.date<=to) add(t, t.date, t.date); }
    else if(t.repeat==='span'){ const end = t.dueDate||t.date; if(end>=from && t.date<=to) add(t, t.date, end); }
    else for(let d = new Date(from+'T00:00:00'); toISODate(d)<=to && rows.length<600; d.setDate(d.getDate()+1)){
      const iso = toISODate(d); if(occursOnDate(t, iso)) add(t, iso, iso);
    }
  }
  return rows.sort((a,b)=> (a.start+(a.time==='Todo el día'?'00:00':a.time)).localeCompare(b.start+(b.time==='Todo el día'?'00:00':b.time)));
}
async function renderCron(){
  const from = document.getElementById('cron-from').value, to = document.getElementById('cron-to').value;
  const wrap = document.getElementById('cron-wrap');
  if(!from || !to || from>to){ wrap.innerHTML = '<div class="empty-state"><p>Elige un rango de fechas válido.</p></div>'; return; }
  const hidden = cronHidden();
  const all = await buildCronRows(from, to);
  const rows = all.filter(r=>!hidden.has(r.week));
  const btnR = document.getElementById('btn-cron-restore');
  const nh = [...hidden].filter(w=>all.some(r=>r.week===w)).length;
  btnR.classList.toggle('hidden', !nh); btnR.textContent = `Restaurar semanas (${nh})`;
  if(!rows.length){ wrap.innerHTML = '<div class="empty-state"><p>No hay tareas en este rango.</p></div>'; return; }
  let html = '<table class="cron-table"><thead><tr><th>Actividad</th><th>Estado</th><th>Fecha inicio</th><th>Fecha fin</th><th>Hora</th><th>Responsable</th><th>Lista</th><th>Repetición</th></tr></thead><tbody>';
  let cur = null;
  rows.forEach(r=>{
    if(r.week!==cur){ cur = r.week; html += `<tr class="cron-week"><td colspan="8">${esc(weekLabel(r.week))}<button class="btn btn-soft" data-week="${r.week}">Quitar semana</button></td></tr>`; }
    html += `<tr><td>${esc(r.name)}</td><td><span class="cron-state"><i style="background:${STATE_COLOR[r.stKey]}"></i>${esc(r.state)}</span></td><td>${fmtShort(r.start)}</td><td>${fmtShort(r.end)}</td><td>${esc(r.time)}</td><td>${esc(r.who)}</td><td>${esc(r.list)}</td><td>${esc(r.rep)}</td></tr>`;
  });
  wrap.innerHTML = html + '</tbody></table>';
  wrap.querySelectorAll('[data-week]').forEach(b=>b.addEventListener('click', ()=>{ const h = cronHidden(); h.add(b.dataset.week); cronSaveHidden(h); renderCron(); }));
}
function cronDefaultRange(){
  const now = new Date();
  document.getElementById('cron-from').value = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  document.getElementById('cron-to').value = toISODate(new Date(now.getFullYear(), now.getMonth()+2, 0));
}
async function openCron(){
  if(typeof closeMobileSidebar==='function') closeMobileSidebar();
  cronDefaultRange();
  const g = CURRENT_SPACE.type==='group' ? await loadGroupCached(CURRENT_SPACE.groupCode) : null;
  document.getElementById('cron-space').textContent = 'Espacio: ' + (g ? g.name : 'Individual');
  await renderCron(); openModal('modal-cron');
}
function downloadBlob(blob, name){
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
async function downloadCron(){
  const from = document.getElementById('cron-from').value, to = document.getElementById('cron-to').value;
  if(!from || !to || from>to){ toast('Elige un rango de fechas válido.', 'warn'); return; }
  const hidden = cronHidden();
  const rows = (await buildCronRows(from, to)).filter(r=>!hidden.has(r.week));
  if(!rows.length){ toast('No hay tareas para exportar en este rango.', 'warn'); return; }
  const aoa = [['Semana','Actividad','Estado','Fecha inicio','Fecha fin','Hora','Responsable','Lista','Repetición','Descripción']]
    .concat(rows.map(r=>[weekLabel(r.week), r.name, r.state, fmtShort(r.start), fmtShort(r.end), r.time, r.who, r.list, r.rep, r.desc]));
  const g = CURRENT_SPACE.type==='group' ? GROUP_CACHE[CURRENT_SPACE.groupCode] : null;
  const base = 'Cronograma_' + (g ? g.name : 'Individual').replace(/[^\w\-]+/g,'_') + '_' + toISODate(new Date());
  try{
    if(!window.XLSX) await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{wch:34},{wch:32},{wch:14},{wch:13},{wch:13},{wch:12},{wch:22},{wch:16},{wch:14},{wch:40}];
    ws['!autofilter'] = {ref: 'A1:J'+aoa.length};
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
    XLSX.writeFile(wb, base + '.xlsx');
    toast('Cronograma descargado en Excel.', 'ok');
  }catch(e){ // sin conexión o sin la librería: CSV que Excel también abre
    console.warn('xlsx', e);
    const csv = '\ufeff' + aoa.map(r=>r.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(';')).join('\r\n');
    downloadBlob(new Blob([csv], {type:'text/csv;charset=utf-8'}), base + '.csv');
    toast('Sin conexión a la librería de Excel: se descargó un archivo CSV que Excel abre igual.', 'warn');
  }
}
document.getElementById('btn-cron').addEventListener('click', openCron);
document.getElementById('cron-from').addEventListener('change', renderCron);
document.getElementById('cron-to').addEventListener('change', renderCron);
document.getElementById('btn-cron-restore').addEventListener('click', ()=>{ cronSaveHidden(new Set()); renderCron(); });
document.getElementById('btn-cron-xlsx').addEventListener('click', downloadCron);

/* ==================== RENDERS SIN CARRERAS ====================
   En el celular llegan varios eventos casi a la vez (volver a la app, cambio de
   señal, toques dobles). Si dos renders corrían al mismo tiempo, ambos borraban y
   ambos dibujaban => calendario y tareas duplicados. Ahora cada render corre de a
   uno; si llega otro mientras corre, se repite UNA vez al final con datos frescos. */
function coalesce(fn){
  let running = null, again = false;
  return function(...a){
    if(running){ again = true; return running; }
    running = (async()=>{ try{ do{ again = false; await fn(...a); }while(again); } finally { running = null; } })();
    return running;
  };
}
renderView = coalesce(renderView);
renderCalendar = coalesce(renderCalendar);
renderTaskListForSelectedDate = coalesce(renderTaskListForSelectedDate);
renderApprovals = coalesce(renderApprovals);
renderSidebar = coalesce(renderSidebar);
refreshAssigneeOptions = coalesce(refreshAssigneeOptions);
refreshListOptions = coalesce(refreshListOptions);
refreshBell = coalesce(refreshBell);
renderListsManageList = coalesce(renderListsManageList);

/* ==================== SINCRONIZACIÓN LIGERA ==================== */
let LAST_SYNC = Date.now();
document.addEventListener('visibilitychange', async ()=>{
  if(document.hidden) return;
  dripKick();
  if(!CURRENT_USER || Date.now()-LAST_SYNC < 60000) return;
  if(!document.getElementById('screen-dashboard').classList.contains('active')) return;
  LAST_SYNC = Date.now();
  invalidateTasksCache(); LISTS_CACHE={key:null,lists:null}; Object.keys(GROUP_CACHE).forEach(k=>delete GROUP_CACHE[k]);
  await renderView();
});
