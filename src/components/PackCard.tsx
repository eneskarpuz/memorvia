import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Card, Display, Label } from './ui';
import { colors, fonts } from '../theme';

export function PackCard({
  kicker,
  title,
  subtitle,
  answered,
  total,
  dark,
  badge,
  onPress,
  style,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  answered: number;
  total: number;
  dark?: boolean;
  badge?: string | null;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = dark ? colors.white : colors.ink;
  const sub = dark ? colors.faint : colors.muted;
  return (
    <Card dark={dark} onPress={onPress} style={[styles.card, style]}>
      <View style={styles.top}>
        <Label style={{ color: sub }}>{kicker}</Label>
        {badge ? (
          <View style={[styles.badge, dark && { backgroundColor: '#2A2A2A' }]}>
            <Text style={[styles.badgeText, { color: fg }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1 }} />
      <Display size={24} style={{ color: fg }}>
        {title}
      </Display>
      <Text style={[styles.subtitle, { color: sub }]}>{subtitle}</Text>
      <View style={[styles.track, dark && { backgroundColor: '#2F2F2F' }]}>
        <View
          style={[
            styles.fill,
            { width: `${total ? (answered / total) * 100 : 0}%`, backgroundColor: fg },
          ]}
        />
      </View>
      <Text style={[styles.count, { color: sub }]}>
        {answered}/{total} cevaplandı
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: 236, height: 220 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { ...fonts.bodyMedium, fontSize: 11 },
  subtitle: { ...fonts.body, fontSize: 13, marginTop: 4, marginBottom: 14 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.soft, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  count: { ...fonts.bodyMedium, fontSize: 12, marginTop: 8 },
});
