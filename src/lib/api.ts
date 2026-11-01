import { getIdToken } from '@react-native-firebase/auth';
import { API_BASE_URL } from '../config';
import { auth } from './firebase';

export async function api<T = any>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Oturum bulunamadı');
  }
  const token = await getIdToken(user);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Bir şeyler ters gitti');
  }
  return json as T;
}

export type SearchResult = {
  externalId: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  meta?: Record<string, any>;
};
