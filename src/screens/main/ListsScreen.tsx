import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDoc, deleteDoc, doc, updateDoc } from '@react-native-firebase/firestore';
import { Check, MapPin, Plus, Star } from 'lucide-react-native';
import { Display, EmptyState, Label, Segmented } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { categoryInfo, LIST_CATEGORIES } from '../../data/lists';
import { db, ListCategory, ListItem, listsCol, serverTimestamp } from '../../lib/firebase';
import { useListItems } from '../../lib/hooks';
import { colors, fonts, radius, space } from '../../theme';

type Filter = 'open' | 'done';

export default function ListsScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { uid, me, partner, coupleId } = useCouple();
  const all = useListItems(coupleId);
  const [category, setCategory] = useState<ListCategory>(route.params?.category ?? 'watch');
  const [filter, setFilter] = useState<Filter>('open');
  const [todo, setTodo] = useState('');
  const paired = !!coupleId && !!partner;

  useEffect(() => {
    if (route.params?.category) {
      setCategory(route.params.category);
    }
  }, [route.params?.category]);

  const info = categoryInfo(category);
  const inCategory = all.filter(i => i.category === category);
  const items = inCategory.filter(i => (filter === 'done' ? i.done : !i.done));
  const doneCount = inCategory.filter(i => i.done).length;

  const ref = (id: string) => doc(db, 'couples', coupleId!, 'lists', id);
  const toggle = (i: ListItem) => updateDoc(ref(i.id), { done: !i.done });
  const remove = (i: ListItem) =>
    Alert.alert('Listeden çıkarılsın mı?', i.title, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkar', style: 'destructive', onPress: () => deleteDoc(ref(i.id)) },
    ]);

  const addTodo = async () => {
    const title = todo.trim();
    if (!title || !coupleId) {
      return;
    }
    setTodo('');
    await addDoc(listsCol(coupleId), {
      category: 'todo',
      title,
      done: false,
      addedBy: uid,
      addedByName: me.name,
      createdAt: serverTimestamp(),
    });
  };

  const onAdd = () =>
    paired
      ? navigation.navigate('ListSearch', { category })
      : navigation.navigate('Pair', { mode: 'inapp' });

  const renderItem = ({ item }: { item: ListItem }) => {
    const props = { item, onPress: () => toggle(item), onLongPress: () => remove(item) };
    switch (category) {
      case 'watch':
        return <PosterItem {...props} />;
      case 'listen':
        return <TrackItem {...props} />;
      case 'visit':
        return <PlaceItem {...props} />;
      default:
        return <TodoItem {...props} />;
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <View>
          <Label>Listeler</Label>
          <Display size={32} style={{ marginTop: 6 }}>
            {info.title}
          </Display>
        </View>
        {category !== 'todo' ? (
          <Pressable style={styles.fab} onPress={onAdd}>
            <Plus size={22} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controls}>
        <Segmented<ListCategory>
          value={category}
          onChange={setCategory}
          options={LIST_CATEGORIES.map(c => ({
            value: c.value,
            label: c.label,
            icon: <c.Icon size={14} color={c.value === category ? colors.ink : colors.muted} />,
          }))}
        />
        <View style={styles.filters}>
          {(['open', 'done'] as Filter[]).map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f && { color: colors.white }]}>
                {f === 'open'
                  ? `Sırada · ${inCategory.length - doneCount}`
                  : `${info.doneLabel} · ${doneCount}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {category === 'todo' && filter === 'open' && paired ? (
        <View style={styles.todoInputRow}>
          <TextInput
            value={todo}
            onChangeText={setTodo}
            placeholder="Birlikte yapılacak bir şey ekle…"
            placeholderTextColor={colors.faint}
            style={styles.todoInput}
            onSubmitEditing={addTodo}
            returnKeyType="done"
            maxLength={120}
          />
          <Pressable style={styles.todoAdd} onPress={addTodo}>
            <Plus size={20} color={colors.white} />
          </Pressable>
        </View>
      ) : null}

      <FlatList
        key={category === 'watch' ? 'grid' : 'list'}
        data={items}
        keyExtractor={i => i.id}
        numColumns={category === 'watch' ? 3 : 1}
        columnWrapperStyle={category === 'watch' ? { gap: 12 } : undefined}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title={filter === 'open' ? 'Liste boş' : 'Henüz tamamlanan yok'}
            text={
              filter === 'open'
                ? `Birlikte ${info.verb} şeyleri ekleyin. Tamamlananları işaretlemek için dokunun.`
                : 'Bir öğeye dokunarak tamamlandı olarak işaretleyebilirsiniz.'
            }
          />
        }
      />
    </View>
  );
}

type ItemProps = { item: ListItem; onPress: () => void; onLongPress: () => void };

function DoneBadge({ done }: { done: boolean }) {
  return (
    <View style={[styles.check, done && styles.checkDone]}>
      {done ? <Check size={14} color={colors.white} /> : null}
    </View>
  );
}

function PosterItem({ item, onPress, onLongPress }: ItemProps) {
  const { width } = useWindowDimensions();
  const w = (width - space.gutter * 2 - 24) / 3;
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={{ width: w }}>
      <View>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.posterImg} />
        ) : (
          <View style={[styles.posterImg, { backgroundColor: colors.soft }]} />
        )}
        <View style={styles.posterCheck}>
          <DoneBadge done={item.done} />
        </View>
      </View>
      <Text style={styles.posterTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.sub} numberOfLines={1}>
        {item.subtitle}
      </Text>
    </Pressable>
  );
}

function TrackItem({ item, onPress, onLongPress }: ItemProps) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.row}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.artwork} />
      ) : (
        <View style={[styles.artwork, { backgroundColor: colors.soft }]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <DoneBadge done={item.done} />
    </Pressable>
  );
}

function PlaceItem({ item, onPress, onLongPress }: ItemProps) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.place}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.placeImg} />
      ) : (
        <View style={[styles.placeImg, styles.placeNoImg]}>
          <MapPin size={26} color={colors.faint} />
        </View>
      )}
      <View style={styles.placeBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.subtitle}
          </Text>
          {item.meta?.rating ? (
            <View style={styles.rating}>
              <Star size={12} color={colors.ink} fill={colors.ink} />
              <Text style={styles.ratingText}>{item.meta.rating}</Text>
              {item.meta.type ? <Text style={styles.sub}> · {item.meta.type}</Text> : null}
            </View>
          ) : null}
        </View>
        <DoneBadge done={item.done} />
      </View>
    </Pressable>
  );
}

function TodoItem({ item, onPress, onLongPress }: ItemProps) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.todo}>
      <DoneBadge done={item.done} />
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rowTitle, item.done && { textDecorationLine: 'line-through', color: colors.muted }]}
        >
          {item.title}
        </Text>
        <Text style={styles.sub}>{item.addedByName}</Text>
      </View>
    </Pressable>
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
  controls: { paddingHorizontal: space.gutter, marginTop: 20, gap: 12 },
  filters: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { ...fonts.bodyMedium, fontSize: 12, color: colors.ink2 },
  list: { padding: space.gutter, gap: 12, paddingBottom: 40 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.faint,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.ink, borderColor: colors.ink },
  posterImg: { width: '100%', aspectRatio: 2 / 3, borderRadius: 12 },
  posterCheck: { position: 'absolute', top: 6, right: 6 },
  posterTitle: { ...fonts.bodySemi, fontSize: 13, color: colors.ink, marginTop: 6 },
  sub: { ...fonts.body, fontSize: 12, color: colors.muted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 10,
    paddingRight: 16,
  },
  artwork: { width: 56, height: 56, borderRadius: 8 },
  rowTitle: { ...fonts.bodySemi, fontSize: 15, color: colors.ink },
  place: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  placeImg: { width: '100%', height: 150 },
  placeNoImg: { backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  placeBody: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { ...fonts.bodySemi, fontSize: 12, color: colors.ink },
  todoInputRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: space.gutter,
    marginTop: 16,
  },
  todoInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 50,
    ...fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  todoAdd: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
  },
});
