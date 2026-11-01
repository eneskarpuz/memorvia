import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Avatar, Card, Display, Label, Statement } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { STARTER_QUESTIONS } from '../../data/questions';
import { colors, fonts, space } from '../../theme';

export default function StarterAnswersScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { me, partner } = useCouple();
  const sameCount = partner
    ? STARTER_QUESTIONS.filter(
        q => me.starter?.[q.id] && me.starter?.[q.id] === partner.starter?.[q.id],
      ).length
    : 0;

  // Always land on Home — this screen can be opened from the paired screen,
  // which isn't in the back stack.
  const close = () => navigation.navigate('Tabs', { screen: 'Home' });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={close} hitSlop={12}>
          <X size={24} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Label>Başlangıç soruları</Label>
        {partner ? (
          <Statement
            size={30}
            style={styles.title}
            strong={`${sameCount}/${STARTER_QUESTIONS.length} soruda aynı cevabı verdiniz.`}
            soft="İşte ilk gün birbiriniz hakkında söyledikleriniz."
          />
        ) : (
          <Statement
            size={30}
            style={styles.title}
            strong="Senin cevapların."
            soft="Partnerin eşleştiğinde onun cevapları da burada görünecek."
          />
        )}

        {STARTER_QUESTIONS.map(q => (
          <Card key={q.id} style={styles.card}>
            <Label style={{ color: colors.muted }}>{q.label}</Label>
            <Display size={22} style={styles.q}>
              {q.title}
            </Display>
            <AnswerLine name={me.name} photo={me.photo} answer={me.starter?.[q.id]} />
            {partner ? (
              <AnswerLine name={partner.name} photo={partner.photo} answer={partner.starter?.[q.id]} />
            ) : null}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

function AnswerLine({
  name,
  photo,
  answer,
}: {
  name: string;
  photo?: string | null;
  answer?: string;
}) {
  return (
    <View style={styles.line}>
      <Avatar name={name} photo={photo} size={30} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={[styles.answer, !answer && { color: colors.faint }]}>
          {answer ?? 'Cevaplanmadı'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: { height: 32, paddingHorizontal: space.gutter, justifyContent: 'center' },
  content: { padding: space.gutter, paddingTop: 24 },
  title: { marginTop: 10, marginBottom: 24 },
  card: { marginBottom: 12, gap: 12 },
  q: { marginTop: -4 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { ...fonts.body, fontSize: 12, color: colors.muted },
  answer: { ...fonts.bodySemi, fontSize: 16, color: colors.ink },
});
