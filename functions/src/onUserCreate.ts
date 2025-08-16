import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const { uid, displayName, email } = user;
  await db.collection('users').doc(uid).set({
    displayName: displayName || '',
    email: email || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});
