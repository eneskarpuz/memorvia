import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BookHeart, NotebookPen } from 'lucide-react-native';
import { categoryInfo } from '../data/lists';
import { ListItem, Memory } from '../lib/firebase';
import { formatDate } from '../lib/utils';
import { colors, fonts, radius } from '../theme';

export function MemoryTile({ item, onPress }: { item: Memory; onPress?: () => void }) {
  const Icon = item.type === 'journal' ? NotebookPen : BookHeart;
  return (
    <Pressable onPress={onPress} style={styles.memory}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.memoryPhoto} />
      ) : (
        <View style={[styles.memoryPhoto, styles.memoryNoPhoto]}>
          <Icon size={22} color={colors.faint} />
        </View>
      )}
      <View style={styles.memoryBody}>
        <Text style={styles.kicker}>
          {item.type === 'journal' ? 'GÜNLÜK' : 'ANI'} · {formatDate(item.date)}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || item.text}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.authorName}
        </Text>
      </View>
    </Pressable>
  );
}

export function ActivityRow({ item, myUid }: { item: ListItem; myUid: string }) {
  const info = categoryInfo(item.category);
  const who = item.addedBy === myUid ? 'Sen' : item.addedByName;
  return (
    <View style={styles.activity}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.activityImg} />
      ) : (
        <View style={[styles.activityImg, styles.activityIcon]}>
          <info.Icon size={18} color={colors.ink} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.done
            ? `${info.doneLabel} ✓`
            : `${who} ${info.verb} listesine ekledi`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  memory: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  memoryPhoto: { width: '100%', height: 120 },
  memoryNoPhoto: { backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  memoryBody: { padding: 14, gap: 3 },
  kicker: { ...fonts.bodyMedium, fontSize: 10, letterSpacing: 0.6, color: colors.muted },
  title: { ...fonts.bodySemi, fontSize: 15, color: colors.ink },
  sub: { ...fonts.body, fontSize: 13, color: colors.muted },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  activityImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.soft },
  activityIcon: { alignItems: 'center', justifyContent: 'center' },
});
