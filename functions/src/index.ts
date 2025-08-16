import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { onUserCreate } from './onUserCreate';

admin.initializeApp();
const db = admin.firestore();

export const createTodo = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Utente non autenticato');
  }
  const uid = context.auth.uid;
  const { name, description = '', dueDate = null, progress = 0, completed = false, parentId = null, assignees = [] } = data || {};
  if (!name || typeof name !== 'string') throw new functions.https.HttpsError('invalid-argument', 'Campo `name` obbligatorio');

  const finalAssignees: string[] = Array.isArray(assignees) ? Array.from(new Set([uid, ...assignees.filter((a: any) => typeof a === 'string')])) : [uid];

  const payload = {
    name: name.trim(),
    description: typeof description === 'string' ? description : '',
    dueDate: dueDate || null,
    progress: typeof progress === 'number' ? progress : 0,
    completed: !!completed,
    parentId: parentId || null,
    ownerId: uid,
    assignees: finalAssignees,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as any;

  const ref = await db.collection('todos').add(payload);
  const snap = await ref.get();
  return { id: ref.id, ...(snap.data() as any) };
});

export const updateTodo = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Utente non autenticato');
  const uid = context.auth.uid;
  const { id, updates } = data || {};
  if (!id || typeof id !== 'string') throw new functions.https.HttpsError('invalid-argument', 'id mancante');
  if (!updates || typeof updates !== 'object') throw new functions.https.HttpsError('invalid-argument', 'updates mancanti');

  const docRef = db.collection('todos').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Documento non trovato');
  const current = snap.data() as any;

  // Owner può aggiornare tutto. Assignees solo completed/progress
  const isOwner = current.ownerId === uid;
  const isAssignee = (current.assignees || []).includes(uid);

  if (!isOwner && !isAssignee) throw new functions.https.HttpsError('permission-denied', 'Permesso negato');

  const allowedForAssignee = ['completed', 'progress', 'completedAt', 'updatedAt'];
  const sanitized = { ...updates } as any;

  if (!isOwner) {
    // mantieni solo i campi consentiti
    Object.keys(sanitized).forEach(k => {
      if (!allowedForAssignee.includes(k)) delete sanitized[k];
    });
  } else if (Array.isArray(sanitized.assignees)) {
    // Sanitizza assignees e assicura che l'owner sia incluso
    const arr = Array.from(new Set(sanitized.assignees.filter((a: any) => typeof a === 'string')));
    if (!arr.includes(uid)) arr.unshift(uid);
    sanitized.assignees = arr;
  }

  sanitized.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await docRef.update(sanitized);
  const updated = await docRef.get();
  return { id, ...(updated.data() as any) };
});

export const deleteTodo = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Utente non autenticato');
  const uid = context.auth.uid;
  const { id } = data || {};
  if (!id || typeof id !== 'string') throw new functions.https.HttpsError('invalid-argument', 'id mancante');

  const docRef = db.collection('todos').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Documento non trovato');
  const current = snap.data() as any;
  if (current.ownerId !== uid) throw new functions.https.HttpsError('permission-denied', 'Solo il proprietario può eliminare');

  await docRef.delete();
  return { success: true };
});

export { onUserCreate };
