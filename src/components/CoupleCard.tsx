import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Avatar, Body, Card, Display, Label } from './ui';
import { Profile } from '../lib/firebase';
import { daysSince, formatDate } from '../lib/utils';
import { colors, fonts, radius } from '../theme';

export function CoupleCard({
  me,
  partner,
  startDate,
  onPressPair,
}: {
  me: Profile;
  partner: Profile | null;
  startDate?: string | null;
  onPressPair: () => void;
}) {
  const days = daysSince(startDate);

  if (!partner) {
    return (
      <Card onPress={onPressPair}>
        <View style={styles.row}>
          <View style={styles.avatars}>
            <Avatar name={me.name} photo={me.photo} size={52} />
            <View style={styles.overlap}>
              <Avatar placeholder size={52} ring />
            </View>
          </View>
          <View style={styles.pill}>
            <View style={styles.pulse} />
            <Text style={styles.pillText}>Eşleşme bekleniyor</Text>
          </View>
        </View>
        <Display size={24} style={styles.names}>
          {me.name} & ?
        </Display>
        <View style={styles.footer}>
          <Body muted style={{ flex: 1 }}>
            {me.pairCode
              ? `Kodun ${me.pairCode}. Partnerin girdiğinde burada görünecek.`
              : 'Partnerini davet et ya da kodunu gir.'}
          </Body>
          <ChevronRight size={20} color={colors.muted} />
        </View>
      </Card>
    );
  }

  return (
    <Card dark>
      <View style={styles.row}>
        <View style={styles.avatars}>
          <Avatar name={me.name} photo={me.photo} size={52} />
          <View style={styles.overlap}>
            <Avatar name={partner.name} photo={partner.photo} size={52} ring />
          </View>
        </View>
        {days !== null ? (
          <View style={styles.dayBadge}>
            <Text style={styles.dayNumber}>{days}</Text>
            <Text style={styles.dayLabel}>gün</Text>
          </View>
        ) : null}
      </View>
      <Display size={26} style={[styles.names, { color: colors.white }]}>
        {me.name} & {partner.name}
      </Display>
      <Label style={{ color: colors.faint }}>
        {startDate ? `${formatDate(startDate)} tarihinden beri` : 'Birlikte'}
      </Label>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatars: { flexDirection: 'row' },
  overlap: { marginLeft: -14, borderRadius: 40 },
  names: { marginTop: 18, marginBottom: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 30,
  },
  pulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.muted },
  pillText: { ...fonts.bodyMedium, fontSize: 12, color: colors.ink2 },
  dayBadge: { alignItems: 'flex-end' },
  dayNumber: { ...fonts.display, fontSize: 34, color: colors.white },
  dayLabel: { ...fonts.bodyMedium, fontSize: 12, color: colors.faint, marginTop: -2 },
});
