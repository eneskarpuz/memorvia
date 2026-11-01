import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { CoupleCard } from '../../components/CoupleCard';
import { ActivityRow, MemoryTile } from '../../components/ItemRows';
import { PackRow } from '../../components/PackRow';
import { Card, Display, Label, SectionHeader } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { LIST_CATEGORIES } from '../../data/lists';
import { STARTER_QUESTIONS } from '../../data/questions';
import { useListItems, useMemories, useMyAnswers, useProgress } from '../../lib/hooks';
import { colors, fonts, radius, space } from '../../theme';

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { uid, me, partner, couple, coupleId } = useCouple();
  const mine = useMyAnswers(coupleId, uid);
  const progress = useProgress(coupleId);
  const memories = useMemories(coupleId, 5);
  const lists = useListItems(coupleId);

  const paired = !!coupleId && !!partner;
  const openPair = () => navigation.navigate('Pair', { mode: 'inapp' });
  const requirePair = (fn: () => void) => (paired ? fn() : openPair());
  const starterAnswered = STARTER_QUESTIONS.filter(q => me.starter?.[q.id]).length;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
    >
      <View style={styles.header}>
        <Label>Memorvia</Label>
        <Display size={32} style={{ marginTop: 6 }}>
          Merhaba, {me.name}
        </Display>
      </View>

      <View style={styles.section}>
        <CoupleCard
          me={me}
          partner={paired ? partner : null}
          startDate={couple?.startDate ?? me.startDate}
          onPressPair={openPair}
        />
      </View>

      <View style={[styles.section, { paddingHorizontal: 0 }]}>
        <View style={{ paddingHorizontal: space.gutter }}>
          <SectionHeader
            title="Soru paketleri"
            action="Tümü"
            onAction={() => navigation.navigate('Questions')}
          />
        </View>
        <PackRow
          mine={mine}
          progress={progress}
          partnerId={me.partnerId}
          starterAnswered={starterAnswered}
          onOpenStarter={() => navigation.navigate('StarterAnswers')}
          onOpenPack={id => requirePair(() => navigation.navigate('Pack', { packId: id }))}
        />
      </View>

      <View style={[styles.section, { paddingHorizontal: 0 }]}>
        <View style={{ paddingHorizontal: space.gutter }}>
          <SectionHeader
            title="Anılar & Günlük"
            action="Tümü"
            onAction={() => navigation.navigate('Memories')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          <Pressable
            style={styles.addTile}
            onPress={() => requirePair(() => navigation.navigate('MemoryEditor', { type: 'memory' }))}
          >
            <View style={styles.addCircle}>
              <Plus size={22} color={colors.white} />
            </View>
            <Text style={styles.addText}>Anı ekle</Text>
          </Pressable>
          {memories.map(m => (
            <MemoryTile key={m.id} item={m} onPress={() => navigation.navigate('Memories')} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Listeler"
          action="Tümü"
          onAction={() => navigation.navigate('Lists')}
        />
        <View style={styles.grid}>
          {LIST_CATEGORIES.map(c => {
            const items = lists.filter(i => i.category === c.value);
            const open = items.filter(i => !i.done).length;
            return (
              <Pressable
                key={c.value}
                style={styles.tile}
                onPress={() => navigation.navigate('Lists', { category: c.value })}
              >
                <c.Icon size={20} color={colors.ink} />
                <Text style={styles.tileCount}>{open}</Text>
                <Text style={styles.tileLabel}>{c.title}</Text>
              </Pressable>
            );
          })}
        </View>

        {lists.length ? (
          <Card style={{ marginTop: 12, paddingVertical: 10 }}>
            <Label style={{ color: colors.muted, marginTop: 6, marginBottom: 4 }}>
              Son güncellemeler
            </Label>
            {lists.slice(0, 4).map(i => (
              <ActivityRow key={i.id} item={i} myUid={uid} />
            ))}
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.gutter, marginBottom: 20 },
  section: { paddingHorizontal: space.gutter, marginBottom: 28 },
  hRow: { paddingHorizontal: space.gutter, gap: 12 },
  addTile: {
    width: 120,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.faint,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 190,
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { ...fonts.bodyMedium, fontSize: 13, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  tileCount: {
    ...fonts.display,
    fontSize: 30,
    color: colors.ink,
    marginTop: 14,
  },
  tileLabel: { ...fonts.bodyMedium, fontSize: 13, color: colors.muted },
});
