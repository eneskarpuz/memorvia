import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  serverTimestamp,
} from '@react-native-firebase/firestore';

export const auth = getAuth();
export const db = getFirestore();
export { serverTimestamp };

export type Profile = {
  name: string;
  photo?: string | null;
  startDate?: string | null; // YYYY-MM-DD
  starter?: Record<string, string>;
  coupleId?: string | null;
  partnerId?: string | null;
  pairCode?: string | null;
  onboarded?: boolean;
  pairCelebrated?: boolean;
};

export type Couple = {
  members: string[];
  startDate?: string | null;
};

export type ListCategory = 'watch' | 'listen' | 'visit' | 'todo';

export type ListItem = {
  id: string;
  category: ListCategory;
  title: string;
  subtitle?: string;
  image?: string | null;
  externalId?: string | null;
  meta?: Record<string, any>;
  done: boolean;
  addedBy: string;
  addedByName: string;
  createdAt?: any;
};

export type Memory = {
  id: string;
  type: 'memory' | 'journal';
  title?: string;
  text: string;
  date: string;
  photo?: string | null;
  authorUid: string;
  authorName: string;
  createdAt?: any;
};

export const userRef = (uid: string) => doc(db, 'users', uid);
export const deviceRef = (uid: string) => doc(db, 'users', uid, 'private', 'device');
export const coupleRef = (cid: string) => doc(db, 'couples', cid);
export const pairCodeRef = (code: string) => doc(db, 'pairCodes', code);
export const answersCol = (cid: string) => collection(db, 'couples', cid, 'answers');
export const answerRef = (cid: string, qid: string, uid: string) =>
  doc(db, 'couples', cid, 'answers', `${qid}__${uid}`);
export const progressCol = (cid: string) => collection(db, 'couples', cid, 'progress');
export const progressRef = (cid: string, qid: string) =>
  doc(db, 'couples', cid, 'progress', qid);
export const memoriesCol = (cid: string) => collection(db, 'couples', cid, 'memories');
export const listsCol = (cid: string) => collection(db, 'couples', cid, 'lists');
