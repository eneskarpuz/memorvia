import { Router } from 'express';
import { auth, db, FieldValue } from '../firebase.js';

const router = Router();

// Deletes the caller's account: unpairs, removes their profile + pair code,
// then deletes the Firebase Auth user. Shared memories/lists stay with the couple.
router.post('/delete', async (req, res) => {
  const uid = req.uid;
  const meRef = db.doc(`users/${uid}`);

  await db.runTransaction(async tx => {
    const me = await tx.get(meRef);
    if (!me.exists) return;
    const partnerId = me.get('partnerId');
    const coupleId = me.get('coupleId');
    const pairCode = me.get('pairCode');

    if (partnerId) {
      const partnerRef = db.doc(`users/${partnerId}`);
      const partner = await tx.get(partnerRef);
      if (partner.exists && partner.get('partnerId') === uid) {
        tx.update(partnerRef, { coupleId: null, partnerId: null });
      }
    }
    if (coupleId) {
      tx.update(db.doc(`couples/${coupleId}`), {
        members: [],
        formerMembers: FieldValue.arrayUnion(uid),
        endedAt: FieldValue.serverTimestamp(),
      });
    }
    if (pairCode) tx.delete(db.doc(`pairCodes/${pairCode}`));
    tx.delete(db.doc(`users/${uid}/private/device`));
    tx.delete(meRef);
  });

  await auth.deleteUser(uid).catch(e => {
    if (e.code !== 'auth/user-not-found') throw e;
  });
  res.json({ ok: true });
});

export default router;
