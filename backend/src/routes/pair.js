import { Router } from 'express';
import { HttpError } from '../errors.js';
import { db, FieldValue, pushToUser } from '../firebase.js';

const router = Router();
const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;

router.post('/join', async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!CODE_RE.test(code)) throw new HttpError(400, 'Geçersiz kod');
  const uid = req.uid;

  const result = await db.runTransaction(async tx => {
    const codeRef = db.doc(`pairCodes/${code}`);
    const codeSnap = await tx.get(codeRef);
    if (!codeSnap.exists) throw new HttpError(404, 'Kod bulunamadı');

    const ownerUid = codeSnap.get('ownerUid');
    if (ownerUid === uid) throw new HttpError(400, 'Kendi kodunu giremezsin');

    const ownerRef = db.doc(`users/${ownerUid}`);
    const meRef = db.doc(`users/${uid}`);
    const [owner, me] = await Promise.all([tx.get(ownerRef), tx.get(meRef)]);
    if (!owner.exists || !me.exists) throw new HttpError(404, 'Kullanıcı bulunamadı');
    if (owner.get('coupleId')) throw new HttpError(409, 'Bu kod artık geçerli değil');
    if (me.get('coupleId')) throw new HttpError(409, 'Zaten eşleşmişsin');

    const coupleRef = db.collection('couples').doc();
    tx.set(coupleRef, {
      members: [ownerUid, uid],
      startDate: owner.get('startDate') || me.get('startDate') || null,
      createdAt: FieldValue.serverTimestamp(),
    });
    const pairedFields = { coupleId: coupleRef.id, pairCelebrated: false, onboarded: true, pairCode: null };
    tx.update(ownerRef, { ...pairedFields, partnerId: uid });
    tx.update(meRef, { ...pairedFields, partnerId: ownerUid });
    tx.delete(codeRef);
    const myCode = me.get('pairCode');
    if (myCode && myCode !== code) tx.delete(db.doc(`pairCodes/${myCode}`));

    return { coupleId: coupleRef.id, ownerUid, myName: me.get('name'), ownerName: owner.get('name') };
  });

  await pushToUser(result.ownerUid, {
    title: 'Eşleştiniz 💞',
    body: `${result.myName} ile eşleştiniz! Cevapları görmek için dokun.`,
    data: { type: 'paired' },
  });

  res.json({ coupleId: result.coupleId, partnerName: result.ownerName });
});

router.post('/leave', async (req, res) => {
  const uid = req.uid;
  await db.runTransaction(async tx => {
    const meRef = db.doc(`users/${uid}`);
    const me = await tx.get(meRef);
    const partnerId = me.get('partnerId');
    if (!partnerId) throw new HttpError(400, 'Eşleşme yok');
    const partnerRef = db.doc(`users/${partnerId}`);
    const partner = await tx.get(partnerRef);
    const cleared = { coupleId: null, partnerId: null };
    tx.update(meRef, cleared);
    if (partner.exists && partner.get('partnerId') === uid) tx.update(partnerRef, cleared);
    // Revoke access to the shared data (rules check `members`).
    const coupleId = me.get('coupleId');
    if (coupleId) {
      tx.update(db.doc(`couples/${coupleId}`), {
        members: [],
        formerMembers: [uid, partnerId],
        endedAt: FieldValue.serverTimestamp(),
      });
    }
  });
  res.json({ ok: true });
});

export default router;
