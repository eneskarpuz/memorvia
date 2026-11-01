import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { auth } from './firebase.js';
import accountRoutes from './routes/account.js';
import pairRoutes from './routes/pair.js';
import notifyRoutes from './routes/notify.js';
import searchRoutes from './routes/search.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Every route below requires a valid Firebase ID token from the app.
app.use(async (req, res, next) => {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ error: 'Yetkisiz' });
  try {
    const decoded = await auth.verifyIdToken(match[1]);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Oturum geçersiz' });
  }
});

// Per-user limit. Memory store is per serverless instance; swap for a Redis
// store (e.g. Upstash) if you need a strict global limit.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    keyGenerator: req => req.uid,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Çok fazla istek, biraz bekle' },
  }),
);

app.use('/account', accountRoutes);
app.use('/pair', pairRoutes);
app.use('/notify', notifyRoutes);
app.use('/search', searchRoutes);

app.use((req, res) => res.status(404).json({ error: 'Bulunamadı' }));

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Sunucu hatası' : err.message });
});

export default app;
