import { launchImageLibrary } from 'react-native-image-picker';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomCode(length = 6) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export function toISODate(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISODate(s?: string | null) {
  if (!s) {
    return null;
  }
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(s?: string | null) {
  const d = fromISODate(s);
  return d
    ? d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
}

export function daysSince(s?: string | null) {
  const d = fromISODate(s);
  if (!d) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - d.getTime()) / 86400000));
}

/** Picks a small, compressed photo and returns it as a data URI (stored directly in Firestore). */
export async function pickPhoto(maxSize = 480): Promise<string | null> {
  const res = await launchImageLibrary({
    mediaType: 'photo',
    includeBase64: true,
    maxWidth: maxSize,
    maxHeight: maxSize,
    quality: 0.6,
    selectionLimit: 1,
  });
  const asset = res.assets?.[0];
  if (!asset?.base64) {
    return null;
  }
  return `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
}
