import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const auth = getAuth();
export const db = getFirestore();
export const messaging = getMessaging();
export { FieldValue };

/** Sends a push to a user's registered device. Silently skips users without a token. */
export async function pushToUser(uid, { title, body, data = {} }) {
  const deviceRef = db.doc(`users/${uid}/private/device`);
  const device = await deviceRef.get();
  const token = device.get('fcmToken');
  if (!token) return;
  try {
    await messaging.send({
      token,
      notification: { title, body },
      data,
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' },
    });
  } catch (e) {
    if (e.code === 'messaging/registration-token-not-registered') {
      await deviceRef.update({ fcmToken: FieldValue.delete() });
    } else {
      console.error('push failed', e.code || e);
    }
  }
}
