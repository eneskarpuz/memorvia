import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setDoc } from '@react-native-firebase/firestore';
import { Share2, X } from 'lucide-react-native';
import { Body, Button, Card, Display, Label } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useOnboarding } from '../context/OnboardingContext';
import { serverTimestamp, userRef } from '../lib/firebase';
import { ensurePairCode, joinWithCode } from '../lib/pair';
import { colors, fonts, radius, space } from '../theme';

export default function PairScreen({ navigation, route }: any) {
  const inApp = route.params?.mode === 'inapp';
  const insets = useSafeAreaInsets();
  const { uid, profile } = useApp();
  const draft = useOnboarding();
  const [code, setCode] = useState<string | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        if (!inApp) {
          await setDoc(
            userRef(uid),
            {
              name: draft.name.trim(),
              startDate: draft.startDate,
              starter: draft.starter,
              onboarded: false,
              createdAt: serverTimestamp(),
            },
            { merge: true },
          );
        }
        const c = await ensurePairCode(uid, profile?.pairCode);
        if (!cancelled) {
          setCode(c);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Partner joined with our code while we're on this screen.
  useEffect(() => {
    if (inApp && profile?.coupleId) {
      navigation.goBack();
    }
  }, [inApp, profile?.coupleId, navigation]);

  const finish = async () => {
    if (inApp) {
      navigation.goBack();
      return;
    }
    if (!uid) {
      return;
    }
    setError(null);
    try {
      // Write the whole draft (not just the flag) so this works even if the
      // initial profile write hasn't landed yet.
      await setDoc(
        userRef(uid),
        {
          name: draft.name.trim(),
          startDate: draft.startDate,
          starter: draft.starter,
          onboarded: true,
        },
        { merge: true },
      );
    } catch (e: any) {
      setError(`Devam edilemedi: ${e.message}`);
    }
  };

  const share = async () => {
    if (!code) {
      return;
    }
    const res = await Share.share({
      message: `Memorvia'da benimle eşleş 💞 Eşleşme kodum: ${code}`,
    });
    if (res.action === Share.sharedAction && !inApp) {
      finish();
    }
  };

  const join = async () => {
    setError(null);
    setJoining(true);
    try {
      await joinWithCode(partnerCode);
      // The backend marks both users as paired + onboarded; listeners take it from here.
      if (inApp) {
        navigation.goBack();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        {inApp ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <X size={24} color={colors.ink} />
          </Pressable>
        ) : (
          <View />
        )}
        {!inApp ? (
          <Pressable onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>ŞİMDİLİK GEÇ</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Label>Eşleşme</Label>
        <Display style={styles.title}>Partnerinle bağlan</Display>
        <Body muted>
          Kodunu partnerine gönder ya da onun kodunu gir. Eşleştiğinizde
          ikinize de haber vereceğiz.
        </Body>

        <Card style={styles.codeCard}>
          <Label style={styles.cardLabel}>Senin kodun</Label>
          {code ? (
            <Text style={styles.code} selectable>
              {code}
            </Text>
          ) : (
            <ActivityIndicator style={{ marginVertical: 22 }} color={colors.ink} />
          )}
          <Button
            title="Kodu paylaş"
            onPress={share}
            disabled={!code}
            icon={<Share2 size={18} color={colors.white} />}
          />
        </Card>

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.or}>veya</Text>
          <View style={styles.line} />
        </View>

        <Card>
          <Label style={styles.cardLabel}>Partnerinin kodu</Label>
          <TextInput
            value={partnerCode}
            onChangeText={t => setPartnerCode(t.toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor={colors.faint}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            style={styles.input}
          />
          <Button
            title="Eşleş"
            variant="secondary"
            onPress={join}
            loading={joining}
            disabled={partnerCode.trim().length !== 6}
          />
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    height: 32,
    paddingHorizontal: space.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: { ...fonts.bodyMedium, fontSize: 13, letterSpacing: 0.8, color: colors.ink },
  content: { padding: space.gutter, paddingTop: 28 },
  title: { marginTop: 10, marginBottom: 10 },
  cardLabel: { color: colors.muted },
  codeCard: { marginTop: 28, gap: 4 },
  code: {
    ...fonts.displayMedium,
    fontSize: 44,
    letterSpacing: 8,
    color: colors.ink,
    marginVertical: 14,
  },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  or: { ...fonts.body, color: colors.muted, fontSize: 13 },
  input: {
    ...fonts.displayMedium,
    fontSize: 26,
    letterSpacing: 6,
    color: colors.ink,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    height: 60,
    marginTop: 10,
    marginBottom: 14,
  },
  error: {
    marginTop: 16,
    ...fonts.bodyMedium,
    color: colors.danger,
    textAlign: 'center',
  },
});
