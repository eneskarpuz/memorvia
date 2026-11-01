import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { arrayUnion, writeBatch } from '@react-native-firebase/firestore';
import { ChevronLeft, ChevronRight, Lock, X } from 'lucide-react-native';
import { Avatar, Button, Display, Label, ProgressDashes } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { PACKS } from '../../data/questions';
import { api } from '../../lib/api';
import { answerRef, db, progressRef, serverTimestamp } from '../../lib/firebase';
import { useMyAnswers, usePartnerAnswer, useProgress } from '../../lib/hooks';
import { colors, fonts, radius, space } from '../../theme';

export default function PackScreen({ navigation, route }: any) {
  const pack = PACKS.find(p => p.id === route.params.packId)!;
  const insets = useSafeAreaInsets();
  const { uid, me, partner, coupleId } = useCouple();
  const mine = useMyAnswers(coupleId, uid);
  const progress = useProgress(coupleId);

  const firstOpen = useMemo(
    () => Math.max(0, pack.questions.findIndex(q => mine[q.id] === undefined)),
    // only on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [index, setIndex] = useState(firstOpen);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const q = pack.questions[index];
  const myAnswer = mine[q.id];
  const partnerAnswered = !!me.partnerId && !!progress[q.id]?.includes(me.partnerId);
  const partnerAnswer = usePartnerAnswer(
    coupleId,
    q.id,
    me.partnerId,
    myAnswer !== undefined && partnerAnswered,
  );

  const submit = async (answer: string) => {
    if (!coupleId || !answer.trim()) {
      return;
    }
    setSaving(true);
    try {
      const batch = writeBatch(db);
      batch.set(answerRef(coupleId, q.id, uid), {
        qid: q.id,
        uid,
        packId: pack.id,
        answer: answer.trim(),
        createdAt: serverTimestamp(),
      });
      batch.set(progressRef(coupleId, q.id), { uids: arrayUnion(uid) }, { merge: true });
      await batch.commit();
      setDraft('');
      api('/notify/answer', { method: 'POST', body: { questionId: q.id } }).catch(() => {});
    } finally {
      setSaving(false);
    }
  };

  const go = (d: number) => {
    setDraft('');
    setIndex(i => Math.min(pack.questions.length - 1, Math.max(0, i + d)));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <X size={24} color={colors.ink} />
        </Pressable>
        <ProgressDashes total={pack.questions.length} current={index} />
        <Text style={styles.counter}>
          {index + 1}/{pack.questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Label>{pack.title}</Label>
        <Display size={32} style={styles.question}>
          {q.text}
          {pack.type === 'choice' ? '?' : ''}
        </Display>

        {myAnswer === undefined ? (
          pack.type === 'choice' ? (
            <View style={styles.versus}>
              {q.options!.map((o, i) => (
                <React.Fragment key={o}>
                  {i > 0 ? <Text style={styles.vs}>ya da</Text> : null}
                  <Pressable
                    disabled={saving}
                    onPress={() => submit(o)}
                    style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
                  >
                    <Text style={styles.choiceText}>{o}</Text>
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Cevabını yaz…"
                placeholderTextColor={colors.faint}
                multiline
                maxLength={500}
                style={styles.input}
              />
              <Button
                title="Cevapla"
                onPress={() => submit(draft)}
                loading={saving}
                disabled={!draft.trim()}
                style={{ marginTop: 12 }}
              />
            </View>
          )
        ) : (
          <View style={{ gap: 12 }}>
            <AnswerBubble name="Sen" photo={me.photo} text={myAnswer} />
            {partnerAnswer !== null ? (
              <AnswerBubble name={partner?.name ?? ''} photo={partner?.photo} text={partnerAnswer} dark />
            ) : (
              <View style={styles.locked}>
                <Lock size={18} color={colors.muted} />
                <Text style={styles.lockedText}>
                  {partner?.name ?? 'Partnerin'} henüz cevaplamadı. Cevapladığında
                  burada görünecek.
                </Text>
              </View>
            )}
            {myAnswer !== undefined &&
            partnerAnswer !== null &&
            pack.type === 'choice' ? (
              <Text style={styles.match}>
                {myAnswer === partnerAnswer ? 'Aynı şeyi seçtiniz ✨' : 'Farklı seçtiniz — konuşma zamanı!'}
              </Text>
            ) : null}
          </View>
        )}

        {myAnswer === undefined && partnerAnswered ? (
          <Text style={styles.hint}>
            {partner?.name} bu soruyu cevapladı. Cevabını görmek için sen de cevapla.
          </Text>
        ) : null}
      </ScrollView>

      <View style={[styles.nav, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[styles.navBtn, index === 0 && { opacity: 0.3 }]}
          disabled={index === 0}
          onPress={() => go(-1)}
        >
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <Pressable
          style={[styles.navBtn, styles.navNext, index === pack.questions.length - 1 && { opacity: 0.3 }]}
          disabled={index === pack.questions.length - 1}
          onPress={() => go(1)}
        >
          <Text style={styles.navText}>Sonraki</Text>
          <ChevronRight size={20} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function AnswerBubble({
  name,
  photo,
  text,
  dark,
}: {
  name: string;
  photo?: string | null;
  text: string;
  dark?: boolean;
}) {
  return (
    <View style={[styles.bubble, dark && { backgroundColor: colors.ink }]}>
      <View style={styles.bubbleHead}>
        <Avatar name={name} photo={photo} size={26} />
        <Text style={[styles.bubbleName, dark && { color: colors.faint }]}>{name}</Text>
      </View>
      <Text style={[styles.bubbleText, dark && { color: colors.white }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    height: 32,
    paddingHorizontal: space.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: { ...fonts.bodyMedium, fontSize: 13, color: colors.muted },
  content: { padding: space.gutter, paddingTop: 28 },
  question: { marginTop: 10, marginBottom: 28 },
  versus: { gap: 10 },
  choice: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicePressed: { backgroundColor: colors.soft },
  choiceText: { ...fonts.displayMedium, fontSize: 22, color: colors.ink },
  vs: { textAlign: 'center', ...fonts.bodyMedium, fontSize: 12, color: colors.muted },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    paddingTop: 18,
    minHeight: 160,
    textAlignVertical: 'top',
    ...fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  bubble: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 10 },
  bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bubbleName: { ...fonts.bodyMedium, fontSize: 13, color: colors.muted },
  bubbleText: { ...fonts.display, fontSize: 20, lineHeight: 26, color: colors.ink },
  locked: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.faint,
    padding: 18,
  },
  lockedText: { flex: 1, ...fonts.body, fontSize: 14, color: colors.muted, lineHeight: 20 },
  match: { textAlign: 'center', ...fonts.bodyMedium, color: colors.ink2, marginTop: 6 },
  hint: { marginTop: 18, ...fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center' },
  nav: { flexDirection: 'row', gap: 10, paddingHorizontal: space.gutter, paddingTop: 8 },
  navBtn: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navNext: { flex: 1, width: undefined, backgroundColor: colors.black, flexDirection: 'row', gap: 4 },
  navText: { ...fonts.bodySemi, fontSize: 16, color: colors.white },
});
