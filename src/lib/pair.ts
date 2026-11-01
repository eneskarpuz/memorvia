import { getDoc, setDoc, updateDoc } from '@react-native-firebase/firestore';
import { api } from './api';
import { pairCodeRef, serverTimestamp, userRef } from './firebase';
import { randomCode } from './utils';

/** Returns the user's pair code, creating a unique one if needed. */
export async function ensurePairCode(uid: string, existing?: string | null) {
  if (existing) {
    const snap = await getDoc(pairCodeRef(existing));
    if (snap.exists()) {
      return existing;
    }
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      // Rules only allow *creating* a code doc, so a collision with someone
      // else's code is rejected and we retry with a new one.
      await setDoc(pairCodeRef(code), { ownerUid: uid, createdAt: serverTimestamp() });
      await updateDoc(userRef(uid), { pairCode: code });
      return code;
    } catch {
      // collision or transient error — try another code
    }
  }
  throw new Error('Eşleşme kodu oluşturulamadı');
}

export function joinWithCode(code: string) {
  return api<{ coupleId: string; partnerName: string }>('/pair/join', {
    method: 'POST',
    body: { code: code.trim().toUpperCase() },
  });
}

export function leaveCouple() {
  return api('/pair/leave', { method: 'POST' });
}

export function deleteAccount() {
  return api('/account/delete', { method: 'POST' });
}
