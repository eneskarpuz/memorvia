import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PackCard } from '../../components/PackCard';
import { packStats } from '../../components/PackRow';
import { Body, Display, Label } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { PACKS, STARTER_QUESTIONS } from '../../data/questions';
import { useMyAnswers, useProgress } from '../../lib/hooks';
import { colors, space } from '../../theme';

export default function QuestionsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { uid, me, partner, coupleId } = useCouple();
  const mine = useMyAnswers(coupleId, uid);
  const progress = useProgress(coupleId);
  const paired = !!coupleId && !!partner;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Label>Sorular</Label>
      <Display size={32} style={styles.title}>
        Birbirinizi keşfedin
      </Display>
      <Body muted style={{ marginBottom: 24 }}>
        Cevabını verdiğinde partnerinin cevabı açılır. İkiniz de cevaplamadan
        kimse göremez.
      </Body>

      <View style={{ gap: 12 }}>
        <PackCard
          style={styles.full}
          kicker="Başlangıç"
          title="Başlangıç Soruları"
          subtitle="İlk gün verdiğiniz cevaplar"
          answered={STARTER_QUESTIONS.filter(q => me.starter?.[q.id]).length}
          total={STARTER_QUESTIONS.length}
          onPress={() => navigation.navigate('StarterAnswers')}
        />
        {PACKS.map((p, i) => {
          const s = packStats(p, mine, progress, me.partnerId);
          return (
            <PackCard
              key={p.id}
              style={styles.full}
              dark={i === 0}
              kicker={p.type === 'text' ? 'Yazılı' : 'Çoktan seçmeli'}
              title={p.title}
              subtitle={p.subtitle}
              answered={s.answered}
              total={p.questions.length}
              badge={s.waiting ? `${s.waiting} yeni` : null}
              onPress={() =>
                paired
                  ? navigation.navigate('Pack', { packId: p.id })
                  : navigation.navigate('Pair', { mode: 'inapp' })
              }
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.gutter, paddingBottom: 32 },
  title: { marginTop: 6, marginBottom: 8 },
  full: { width: '100%', height: 200 },
});
