import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PackCard } from './PackCard';
import { PACKS, QuestionPack, STARTER_QUESTIONS } from '../data/questions';
import { space } from '../theme';

export function packStats(
  pack: QuestionPack,
  mine: Record<string, string>,
  progress: Record<string, string[]>,
  partnerId?: string | null,
) {
  let answered = 0;
  let waiting = 0;
  for (const q of pack.questions) {
    if (mine[q.id] !== undefined) {
      answered++;
    } else if (partnerId && progress[q.id]?.includes(partnerId)) {
      waiting++;
    }
  }
  return { answered, waiting };
}

export function PackRow({
  mine,
  progress,
  partnerId,
  starterAnswered,
  onOpenStarter,
  onOpenPack,
}: {
  mine: Record<string, string>;
  progress: Record<string, string[]>;
  partnerId?: string | null;
  starterAnswered: number;
  onOpenStarter: () => void;
  onOpenPack: (packId: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      snapToInterval={248}
    >
      <PackCard
        kicker="Başlangıç"
        title="Başlangıç Soruları"
        subtitle="İlk gün verdiğiniz cevaplar"
        answered={starterAnswered}
        total={STARTER_QUESTIONS.length}
        onPress={onOpenStarter}
      />
      {PACKS.map((p, i) => {
        const s = packStats(p, mine, progress, partnerId);
        return (
          <PackCard
            key={p.id}
            kicker={p.type === 'text' ? 'Yazılı' : 'Çoktan seçmeli'}
            title={p.title}
            subtitle={p.subtitle}
            answered={s.answered}
            total={p.questions.length}
            badge={s.waiting ? `${s.waiting} yeni` : null}
            dark={i === 0}
            onPress={() => onOpenPack(p.id)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: space.gutter, gap: 12 },
});
