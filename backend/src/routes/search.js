import { Router } from 'express';
import { HttpError } from '../errors.js';

const router = Router();

// Small in-memory cache (per serverless instance) to save API quota.
const cache = new Map();
const TTL = 10 * 60 * 1000;
async function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fn();
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expires: Date.now() + TTL });
  return value;
}

function readQuery(req, { required = true } = {}) {
  const q = String(req.query.q || '').trim();
  if (q.length > 100) throw new HttpError(400, 'Arama çok uzun');
  if (required && !q) throw new HttpError(400, 'Arama boş');
  return q;
}

async function fetchJson(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    console.error('upstream', url.split('?')[0], res.status, await res.text().catch(() => ''));
    throw new HttpError(502, 'Arama servisi yanıt vermedi');
  }
  return res.json();
}

// --- TMDB: movies & series ---------------------------------------------------
router.get('/movies', async (req, res) => {
  const q = readQuery(req, { required: false });
  const path = q
    ? `/search/multi?query=${encodeURIComponent(q)}&language=tr-TR&include_adult=false&page=1`
    : '/trending/all/week?language=tr-TR';

  const results = await cached(`tmdb:${path}`, async () => {
    const data = await fetchJson(`https://api.themoviedb.org/3${path}`, {
      headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
    });
    return data.results
      .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 20)
      .map(r => {
        const year = (r.release_date || r.first_air_date || '').slice(0, 4);
        return {
          externalId: `tmdb-${r.media_type}-${r.id}`,
          title: r.title || r.name,
          subtitle: [year, r.media_type === 'tv' ? 'Dizi' : 'Film'].filter(Boolean).join(' · '),
          image: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
          meta: {
            rating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : null,
            overview: (r.overview || '').slice(0, 300),
          },
        };
      });
  });
  res.json({ results });
});

// --- iTunes Search: songs & albums (no key needed) ---------------------------
router.get('/music', async (req, res) => {
  const q = readQuery(req);
  const kind = req.query.kind === 'album' ? 'album' : 'song';
  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(q)}` +
    `&media=music&entity=${kind}&limit=25&country=TR`;

  const results = await cached(`itunes:${url}`, async () => {
    const data = await fetchJson(url);
    return data.results.map(r => ({
      externalId: `itunes-${kind}-${kind === 'song' ? r.trackId : r.collectionId}`,
      title: kind === 'song' ? r.trackName : r.collectionName,
      subtitle: kind === 'song' ? `${r.artistName} · ${r.collectionName ?? ''}` : r.artistName,
      image: r.artworkUrl100?.replace('100x100bb', '300x300bb') ?? null,
      meta: {
        url: r.trackViewUrl || r.collectionViewUrl || null,
        previewUrl: r.previewUrl || null,
      },
    }));
  });
  res.json({ results });
});

// --- Google Places (New): places to go ---------------------------------------
router.get('/places', async (req, res) => {
  const q = readQuery(req);
  const key = process.env.GOOGLE_PLACES_KEY;

  const results = await cached(`places:${q.toLowerCase()}`, async () => {
    const data = await fetchJson('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.rating,' +
          'places.primaryTypeDisplayName,places.photos,places.googleMapsUri',
      },
      body: JSON.stringify({ textQuery: q, languageCode: 'tr', maxResultCount: 10 }),
    });

    const places = data.places || [];
    // Resolve a key-free photo URL so the API key never reaches the app.
    const photos = await Promise.all(
      places.map(async p => {
        const name = p.photos?.[0]?.name;
        if (!name) return null;
        try {
          const photo = await fetchJson(
            `https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&skipHttpRedirect=true&key=${key}`,
          );
          return photo.photoUri || null;
        } catch {
          return null;
        }
      }),
    );

    return places.map((p, i) => ({
      externalId: `place-${p.id}`,
      title: p.displayName?.text ?? '',
      subtitle: p.formattedAddress ?? '',
      image: photos[i],
      meta: {
        rating: p.rating ?? null,
        type: p.primaryTypeDisplayName?.text ?? null,
        mapsUrl: p.googleMapsUri ?? null,
      },
    }));
  });
  res.json({ results });
});

export default router;
