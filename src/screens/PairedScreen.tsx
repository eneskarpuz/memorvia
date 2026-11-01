import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setDoc } from '@react-native-firebase/firestore';
import { X } from 'lucide-react-native';
import { Avatar, Button, Label, Statement } from '../components/ui';
import { useApp } from '../context/AppContext';
import { userRef } from '../lib/firebase';
import { colors, space } from '../theme';

/** Full-screen "you're paired" moment, shown once to both partners. */
export default function PairedScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { uid, profile, partner } = useApp();

  const markSeen = () => {
    if (uid) {
      setDoc(userRef(uid), { pairCelebrated: true }, { merge: true }).catch(e =>
        console.warn('pairCelebrated', e),
      );
    }
  };

  const openAnswers = () => {
    markSeen();
    navigation.replace('StarterAnswers');
  };

  const goHome = () => {
    markSeen();
    navigation.navigate('Tabs', { screen: 'Home' });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <Pressable style={styles.close} onPress={goHome} hitSlop={12}>
        <X size={24} color={colors.ink} />
      </Pressable>

      <Pressable style={styles.body} onPress={openAnswers}>
        <View style={styles.avatars}>
          <Avatar name={profile?.name} photo={profile?.photo} size={88} />
          <View style={{ marginLeft: -22 }}>
            <Avatar name={partner?.name} photo={partner?.photo} size={88} ring />
          </View>
        </View>
        <Label style={{ marginBottom: 12 }}>Eşleştiniz</Label>
        <Statement
          size={38}
          strong={`${partner?.name ?? ''} ile eşleştiniz.`}
          soft="Başlangıç sorularına verdiğiniz cevapları görmek için dokunun."
        />
      </Pressable>

      <Button title="Cevapları gör" onPress={openAnswers} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: space.gutter },
  close: { alignSelf: 'flex-end', height: 32, justifyContent: 'center' },
  body: { flex: 1, justifyContent: 'center' },
  avatars: { flexDirection: 'row', marginBottom: 32 },
});
