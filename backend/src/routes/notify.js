import { Router } from 'express';
import { HttpError } from '../errors.js';
import { db, pushToUser } from '../firebase.js';

const router = Router();
const QID_RE = /^[a-z]+_\d{1,3}$/;

// Called by the app right after the user answers a question; pings the partner.
router.post('/answer', async (req, res) => {
  const questionId = String(req.body?.questionId || '');
  if (!QID_RE.test(questionId)) throw new HttpError(400, 'Geçersiz soru');

  const me = await db.doc(`users/${req.uid}`).get();
  const coupleId = me.get('coupleId');
  const partnerId = me.get('partnerId');
  if (!coupleId || !partnerId) throw new HttpError(400, 'Eşleşme yok');

  // Only notify for a real, fresh answer so the endpoint can't be used to spam.
  const answer = await db.doc(`couples/${coupleId}/answers/${questionId}__${req.uid}`).get();
  const createdAt = answer.get('createdAt')?.toMillis?.() ?? 0;
  if (!answer.exists || Date.now() - createdAt > 2 * 60 * 1000) {
    throw new HttpError(400, 'Cevap bulunamadı');
  }

  const progress = await db.doc(`couples/${coupleId}/progress/${questionId}`).get();
  const partnerAnswered = (progress.get('uids') || []).includes(partnerId);

  await pushToUser(partnerId, {
    title: 'Memorvia',
    body: partnerAnswered
      ? `${me.get('name')} de cevapladı! Cevaplarınızı görmek için dokun.`
      : `${me.get('name')} bir soruyu cevapladı. Sen de cevapla, birbirinizin cevabını görün.`,
    data: { type: 'answer', questionId },
  });
  res.json({ ok: true });
});

export default router;
