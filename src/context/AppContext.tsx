import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
} from '@react-native-firebase/auth';
import { onSnapshot } from '@react-native-firebase/firestore';
import { auth, Couple, coupleRef, Profile, userRef } from '../lib/firebase';
import { registerForPush } from '../lib/notifications';

type AppState = {
  ready: boolean;
  uid: string | null;
  profile: Profile | null;
  partner: Profile | null;
  couple: Couple | null;
};

const AppContext = createContext<AppState>({
  ready: false,
  uid: null,
  profile: null,
  partner: null,
  couple: null,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, user => {
        if (user) {
          setUid(user.uid);
        } else {
          // Signed out (e.g. account deleted): reset and start fresh.
          setUid(null);
          setProfile(null);
          setProfileLoaded(false);
          signInAnonymously(auth).catch(e => console.warn('Giriş başarısız', e));
        }
      }),
    [],
  );

  useEffect(() => {
    if (!uid) {
      return;
    }
    return onSnapshot(
      userRef(uid),
      snap => {
        setProfile(snap.exists() ? (snap.data() as Profile) : null);
        setProfileLoaded(true);
      },
      e => {
        console.warn(e);
        setProfileLoaded(true);
      },
    );
  }, [uid]);

  const onboarded = !!profile?.onboarded;
  useEffect(() => {
    if (!uid || !onboarded) {
      return;
    }
    let unsub = () => {};
    registerForPush(uid).then(u => (unsub = u));
    return () => unsub();
  }, [uid, onboarded]);

  const partnerId = profile?.partnerId;
  useEffect(() => {
    if (!partnerId) {
      setPartner(null);
      return;
    }
    return onSnapshot(
      userRef(partnerId),
      snap => setPartner(snap.exists() ? (snap.data() as Profile) : null),
      () => setPartner(null),
    );
  }, [partnerId]);

  const coupleId = profile?.coupleId;
  useEffect(() => {
    if (!coupleId) {
      setCouple(null);
      return;
    }
    return onSnapshot(
      coupleRef(coupleId),
      snap => setCouple(snap.exists() ? (snap.data() as Couple) : null),
      () => setCouple(null),
    );
  }, [coupleId]);

  return (
    <AppContext.Provider
      value={{ ready: !!uid && profileLoaded, uid, profile, partner, couple }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

/** Convenience for screens that only render once the user is paired. */
export function useCouple() {
  const { uid, profile, partner, couple } = useApp();
  return {
    uid: uid!,
    me: profile!,
    partner,
    couple,
    coupleId: profile?.coupleId ?? null,
  };
}
