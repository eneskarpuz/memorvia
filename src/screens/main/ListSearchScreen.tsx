import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, setDoc } from '@react-native-firebase/firestore';
import { Check, Plus, Search, X } from 'lucide-react-native';
import { EmptyState, Label, Segmented } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { categoryInfo } from '../../data/lists';
import { api, SearchResult } from '../../lib/api';
import { ListCategory, listsCol, serverTimestamp } from '../../lib/firebase';
import { useListItems } from '../../lib/hooks';
import { colors, fonts, radius, space } from '../../theme';

const ENDPOINT: Record<Exclude<ListCategory, 'todo'>, string> = {
  watch: '/search/movies',
  listen: '/search/music',
  visit: '/search/places',
};

const itemId = (category: ListCategory, externalId: string) =>
  `${category}_${externalId}`.replace(/[^A-Za-z0-9_-]/g, '_');

export default function ListSearchScreen({ navigation, route }: any) {
  const category: Exclude<ListCategory, 'todo'> = route.params.category;
  const info = categoryInfo(category);
  const insets = useSafeAreaInsets();
  const { uid, me, coupleId } = useCouple();
  const existing = useListItems(coupleId);
  const existingIds = useMemo(() => new Set(existing.map(i => i.id)), [existing]);

  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'song' | 'album'>('song');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term && category !== 'watch') {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: term });
        if (category === 'listen') {
          params.set('kind', kind);
        }
        const res = await api<{ results: SearchResult[] }>(`${ENDPOINT[category]}?${params}`);
        if (!cancelled) {
          setResults(res.results);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, kind, category]);

  const add = (r: SearchResult) => {
    if (!coupleId) {
      return;
    }
    const id = itemId(category, r.externalId);
    if (existingIds.has(id)) {
      return;
    }
    setDoc(doc(listsCol(coupleId), id), {
      category,
      title: r.title,
      subtitle: r.subtitle ?? '',
      image: r.image ?? null,
      externalId: r.externalId,
      meta: r.meta ?? {},
      done: false,
      addedBy: uid,
      addedByName: me.name,
      createdAt: serverTimestamp(),
    });
  };

  const placeholder =
    category === 'watch'
      ? 'Film veya dizi ara'
      : category === 'listen'
      ? kind === 'song'
        ? 'Şarkı veya sanatçı ara'
        : 'Albüm ara'
      : 'Mekân, şehir veya kafe ara';

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12 }]}>
      <View style={styles.topBar}>
        <Label>{info.title} listesine ekle</Label>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <X size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          style={styles.input}
          autoFocus
          returnKeyType="search"
          autoCorrect={false}
        />
        {loading ? <ActivityIndicator color={colors.muted} /> : null}
      </View>

      {category === 'listen' ? (
        <View style={{ paddingHorizontal: space.gutter, marginTop: 12 }}>
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: 'song', label: 'Şarkı' },
              { value: 'album', label: 'Albüm' },
            ]}
          />
        </View>
      ) : null}

      {category === 'watch' && !q.trim() ? (
        <Text style={styles.sectionLabel}>Bu hafta popüler</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={r => r.externalId}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title={error ? 'Arama başarısız' : q.trim() ? 'Sonuç yok' : 'Aramaya başla'}
              text={error ?? undefined}
            />
          ) : undefined
        }
        renderItem={({ item }) => {
          const added = existingIds.has(itemId(category, item.externalId));
          return (
            <Pressable style={styles.row} onPress={() => add(item)} disabled={added}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={[styles.thumb, category === 'watch' && styles.thumbPoster]}
                />
              ) : (
                <View
                  style={[
                    styles.thumb,
                    category === 'watch' && styles.thumbPoster,
                    { backgroundColor: colors.soft },
                  ]}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.sub} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={[styles.addBtn, added && { backgroundColor: colors.ink }]}>
                {added ? (
                  <Check size={16} color={colors.white} />
                ) : (
                  <Plus size={16} color={colors.ink} />
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    paddingHorizontal: space.gutter,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBox: {
    marginHorizontal: space.gutter,
    marginTop: 16,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  input: { flex: 1, ...fonts.body, fontSize: 16, color: colors.ink, height: '100%' },
  sectionLabel: {
    ...fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.muted,
    textTransform: 'uppercase',
    paddingHorizontal: space.gutter,
    marginTop: 20,
  },
  list: { padding: space.gutter, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 10,
    paddingRight: 14,
  },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  thumbPoster: { height: 84 },
  title: { ...fonts.bodySemi, fontSize: 15, color: colors.ink },
  sub: { ...fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
