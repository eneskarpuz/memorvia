import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,   Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from '@react-native-firebase/auth';
import { updateDoc } from '@react-native-firebase/firestore';
import { Camera, ChevronRight } from 'lucide-react-native';
import { Avatar, Body, Card, Label } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { auth, userRef } from '../../lib/firebase';
import { deleteAccount, leaveCouple } from '../../lib/pair';
import { daysSince, formatDate, pickPhoto } from '../../lib/utils';
import { colors, fonts, radius, space } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { uid, me, partner, couple, coupleId } = useCouple();
  const [name, setName] = useState(me.name);
  const [deleting, setDeleting] = useState(false);
  const startDate = couple?.startDate ?? me.startDate;

  const changePhoto = async () => {
    const photo = await pickPhoto();
    if (photo) {
      await updateDoc(userRef(uid), { photo });
    }
  };

  const saveName = () => {
    const n = name.trim();
    if (n.length >= 2 && n !== me.name) {
      updateDoc(userRef(uid), { name: n });
    } else {
      setName(me.name);
    }
  };

  const unpair = () =>
    Alert.alert(
      'Eşleşme kaldırılsın mı?',
      'Ortak sorulara, anılara ve listelere erişiminiz kapanır.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => leaveCouple().catch(e => Alert.alert('Hata', e.message)),
        },
      ],
    );

  const removeAccount = () =>
    Alert.alert(
      'Hesabın silinsin mi?',
      'Profilin ve eşleşmen silinir, uygulama baştan başlar. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabı sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              await signOut(auth); // AppContext signs in a fresh user → onboarding
            } catch (e: any) {
              setDeleting(false);
              Alert.alert('Hesap silinemedi', e.message, [
                { text: 'Tamam', style: 'cancel' },
                {
                  text: 'Yalnızca bu cihazda sıfırla',
                  style: 'destructive',
                  onPress: () => signOut(auth),
                },
              ]);
            }
          },
        },
      ],
    );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Label>Profil</Label>

      <View style={styles.hero}>
        <Pressable onPress={changePhoto}>
          <Avatar name={me.name} photo={me.photo} size={96} />
          <View style={styles.cam}>
            <Camera size={14} color={colors.white} />
          </View>
        </Pressable>
        <TextInput
          value={name}
          onChangeText={setName}
          onEndEditing={saveName}
          style={styles.name}
          maxLength={30}
        />
      </View>

      <Card style={styles.card}>
        <Row label="Partner" value={partner?.name ?? 'Eşleşme bekleniyor'} />
        <Row label="Başlangıç" value={formatDate(startDate) || '—'} />
        <Row label="Birlikte" value={startDate ? `${daysSince(startDate)} gün` : '—'} last />
      </Card>

      <Card style={styles.card}>
        <Pressable style={styles.link} onPress={() => navigation.navigate('StarterAnswers')}>
          <Text style={styles.linkText}>Başlangıç cevapları</Text>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
        {!coupleId ? (
          <Pressable
            style={[styles.link, styles.linkBorder]}
            onPress={() => navigation.navigate('Pair', { mode: 'inapp' })}
          >
            <Text style={styles.linkText}>Partnerinle eşleş</Text>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </Card>

      {coupleId ? (
        <Pressable onPress={unpair} style={{ marginTop: 24 }}>
          <Text style={styles.danger}>Eşleşmeyi kaldır</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={removeAccount} disabled={deleting} style={styles.deleteBtn}>
        {deleting ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <Text style={styles.danger}>Hesabı sil</Text>
        )}
      </Pressable>

      <Body muted style={styles.footer}>
        Memorvia · v0.1
      </Body>
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.gutter, paddingBottom: 40 },
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 28 },
  cam: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 14,
    ...fonts.display,
    fontSize: 30,
    color: colors.ink,
    textAlign: 'center',
    minWidth: 120,
  },
  card: { paddingVertical: 4, marginBottom: 12, borderRadius: radius.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { ...fonts.body, fontSize: 15, color: colors.muted },
  rowValue: { ...fonts.bodyMedium, fontSize: 15, color: colors.ink },
  link: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  linkBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  linkText: { ...fonts.bodyMedium, fontSize: 15, color: colors.ink },
  danger: { ...fonts.bodySemi, fontSize: 16, color: colors.danger, textAlign: 'center' },
  deleteBtn: {
    marginTop: 16,
    height: 58,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 12 },
});
