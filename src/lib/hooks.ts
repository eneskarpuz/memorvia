import { useEffect, useState } from 'react';
import {
  limit as limitTo,
  onSnapshot,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';
import {
  answerRef,
  answersCol,
  ListItem,
  listsCol,
  Memory,
  memoriesCol,
  progressCol,
} from './firebase';

/** My own answers in this couple, keyed by question id. */
export function useMyAnswers(coupleId: string | null, uid: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!coupleId) {
      return;
    }
    return onSnapshot(
      query(answersCol(coupleId), where('uid', '==', uid)),
      snap => {
        const out: Record<string, string> = {};
        snap.docs.forEach(d => {
          out[d.data().qid] = d.data().answer;
        });
        setAnswers(out);
      },
      e => console.warn(e),
    );
  }, [coupleId, uid]);
  return answers;
}

/** Who has answered which question (readable by both, unlike the answers themselves). */
export function useProgress(coupleId: string | null) {
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  useEffect(() => {
    if (!coupleId) {
      return;
    }
    return onSnapshot(
      progressCol(coupleId),
      snap => {
        const out: Record<string, string[]> = {};
        snap.docs.forEach(d => {
          out[d.id] = d.data().uids ?? [];
        });
        setProgress(out);
      },
      e => console.warn(e),
    );
  }, [coupleId]);
  return progress;
}

/**
 * Partner's answer to a question. Security rules only allow reading it once
 * I've answered too, so we only subscribe when `enabled`.
 */
export function usePartnerAnswer(
  coupleId: string | null,
  qid: string,
  partnerId: string | null | undefined,
  enabled: boolean,
) {
  const [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => {
    setAnswer(null);
    if (!coupleId || !partnerId || !enabled) {
      return;
    }
    return onSnapshot(
      answerRef(coupleId, qid, partnerId),
      snap => setAnswer(snap.exists() ? snap.data()?.answer : null),
      () => setAnswer(null),
    );
  }, [coupleId, qid, partnerId, enabled]);
  return answer;
}

export function useMemories(coupleId: string | null, max?: number) {
  const [items, setItems] = useState<Memory[]>([]);
  useEffect(() => {
    if (!coupleId) {
      setItems([]);
      return;
    }
    const base = query(memoriesCol(coupleId), orderBy('createdAt', 'desc'));
    return onSnapshot(
      max ? query(base, limitTo(max)) : base,
      snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as Memory))),
      e => console.warn(e),
    );
  }, [coupleId, max]);
  return items;
}

export function useListItems(coupleId: string | null) {
  const [items, setItems] = useState<ListItem[]>([]);
  useEffect(() => {
    if (!coupleId) {
      setItems([]);
      return;
    }
    return onSnapshot(
      query(listsCol(coupleId), orderBy('createdAt', 'desc')),
      snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as ListItem))),
      e => console.warn(e),
    );
  }, [coupleId]);
  return items;
}
