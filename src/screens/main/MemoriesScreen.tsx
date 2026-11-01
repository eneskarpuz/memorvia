import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteDoc, doc } from '@react-native-firebase/firestore';
import { BookHeart, NotebookPen, Plus } from 'lucide-react-native';
import { Avatar, Display, EmptyState, Label, Segmented } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { db, Memory } from '../../lib/firebase';
import { useMemories } from '../../lib/hooks';
import { formatDate } from '../../lib/utils';
import { colors, fonts, radius, space } from '../../theme';

type Tab = 'memory' | 'journal';

export default function MemoriesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { uid, me, partner, coupleId } = useCouple();
  const all = useMemories(coupleId);
  const [tab, setTab] = useState<Tab>('memory');
  const items = all.filter(m => m.type === tab);
  const paired = !!coupleId && !!partner;

  const remove = (m: Memory) => {
    if (m.authorUid !== uid || !coupleId) {
      return;
    }
    Alert.alert('Silinsin mi?', 'Bu kayıt ikiniz için de silinecek.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => deleteDoc(doc(db, 'couples', coupleId, 'memories', m.id)),
      },
    ]);
  };

  const add = () =>
    paired
      ? navigation.navigate('MemoryEditor', { type: tab })
      : navigation.navigate('Pair', { mode: 'inapp' });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <View>
          <Label>Anılar</Label>
          <Display size={32} style={{ marginTop: 6 }}>
            Hikâyeniz
          </Display>
        </View>
        <Pressable style={styles.fab} onPress={add}>
          <Plus size={22} color={colors.white} />
        </Pressable>
      </View>
      <View style={styles.segment}>
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'memory', label: 'Anılar' },
            { value: 'journal', label: 'Günlük' },
          ]}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={tab === 'memory' ? 'Henüz anı yok' : 'Günlük boş'}
            text={
              tab === 'memory'
                ? 'Birlikte yaşadığınız güzel anları fotoğrafıyla kaydedin.'
                : 'Bugün nasıl geçti? Kısa notlar bırakın, birbirinizi okuyun.'
            }
          />
        }
        renderItem={({ item }) => {
          const author = item.authorUid === uid ? me : partner;
          return tab === 'memory' ? (
            <Pressable onLongPress={() => remove(item)} style={styles.memory}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.noPhoto]}>
                  <BookHeart size={28} color={colors.faint} />
                </View>
              )}
              <View style={styles.memoryBody}>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
                {item.title ? <Display size={22}>{item.title}</Display> : null}
                <Text style={styles.text}>{item.text}</Text>
                <View style={styles.byline}>
                  <Avatar name={item.authorName} photo={author?.photo} size={22} />
                  <Text style={styles.by}>{item.authorName}</Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <Pressable onLongPress={() => remove(item)} style={styles.journal}>
              <View style={styles.journalHead}>
                <Avatar name={item.authorName} photo={author?.photo} size={30} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.by}>{item.authorName}</Text>
                  <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
                <NotebookPen size={16} color={colors.faint} />
              </View>
              {item.title ? <Text style={styles.journalTitle}>{item.title}</Text> : null}
              <Text style={styles.text}>{item.text}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: space.gutter,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: { paddingHorizontal: space.gutter, marginTop: 20, marginBottom: 8 },
  list: { padding: space.gutter, gap: 14, paddingBottom: 40 },
  memory: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 4 / 3 },
  noPhoto: { aspectRatio: 3, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  memoryBody: { padding: 18, gap: 6 },
  date: { ...fonts.bodyMedium, fontSize: 12, color: colors.muted },
  text: { ...fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink2 },
  byline: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  by: { ...fonts.bodySemi, fontSize: 13, color: colors.ink },
  journal: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 10 },
  journalHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  journalTitle: { ...fonts.displayMedium, fontSize: 18, color: colors.ink },
});
