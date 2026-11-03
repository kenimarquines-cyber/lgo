// Cloud Function OPCIONAL: envía el push (FCM) cuando se guarda una notificación nueva,
// incluso con la app cerrada. Requiere plan Blaze de Firebase.
//   1) firebase init functions   (Node 18+)   2) pega este archivo como functions/index.js
//   3) firebase deploy --only functions
//   4) En el HTML pon tu clave Web Push en FCM_VAPID_KEY.
const {onDocumentWritten} = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const COL = 'electrotask_store';

exports.pushOnNotification = onDocumentWritten({document: COL + '/{docId}', region: 'us-east1'}, async (event)=>{
  const docId = event.params.docId;
  if(!docId.startsWith('notifs:')) return;
  const before = (event.data.before.exists && event.data.before.data().value) || [];
  const after  = (event.data.after.exists  && event.data.after.data().value)  || [];
  const known = new Set(before.map(n=>n.id));
  const fresh = after.filter(n=>!known.has(n.id) && !n.read);
  if(!fresh.length) return;
  const email = docId.slice('notifs:'.length);
  const tokDoc = await admin.firestore().collection(COL).doc('push:' + email).get();
  const tokens = (tokDoc.exists && tokDoc.data().value && tokDoc.data().value.tokens) || [];
  if(!tokens.length) return;
  for(const n of fresh.slice(0,3)){
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {title: 'Electrotask', body: n.text},
      webpush: {notification: {tag: n.id}, fcmOptions: {}}
    });
  }
});

// ---- LIMPIEZA DIARIA (opcional): borra notificaciones de más de 30 días de TODOS los usuarios,
// incluso de quienes llevan meses sin abrir la app. Mismo plan Blaze; cuesta centavos al mes.
const {onSchedule} = require('firebase-functions/v2/scheduler');
exports.pruneOldNotifications = onSchedule({schedule: 'every 24 hours', timeZone: 'America/Bogota', region: 'us-east1'}, async ()=>{
  const db = admin.firestore(), limit = Date.now() - 30*24*60*60*1000;
  const snap = await db.collection(COL).where('key', '>=', 'notifs:').where('key', '<', 'notifs:\uf8ff').get();
  let batch = db.batch(), n = 0;
  for(const d of snap.docs){
    const list = d.data().value || [];
    const keep = list.filter(x=>!x.createdAt || x.createdAt >= limit);
    if(keep.length !== list.length){ batch.update(d.ref, {value: keep}); if(++n % 400 === 0){ await batch.commit(); batch = db.batch(); } }
  }
  await batch.commit();
});
