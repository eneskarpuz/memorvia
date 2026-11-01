import React, { useState } from 'react';
import {
  Image,
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
import { addDoc } from '@react-native-firebase/firestore';
import { Camera, X } from 'lucide-react-native';
import { Button, Display, Label, Segmented } from '../../components/ui';
import { useCouple } from '../../context/AppContext';
import { memoriesCol, serverTimestamp } from '../../lib/firebase';
import { pickPhoto, toISODate } from '../../lib/utils';
import { colors, fonts, radius, space } from '../../theme';

export default function MemoryEditorScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { uid, me, coupleId } = useCouple();
  const [type, setType] = useState<'memory' | 'journal'>(route.params?.type ?? 'memory');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!coupleId) {
      return;
    }
    setSaving(true);
    try {
      await addDoc(memoriesCol(coupleId), {
        type,
        title: title.trim(),
        text: text.trim(),
        date: toISODate(new Date()),
        photo: type === 'memory' ? photo : null,
        authorUid: uid,
        authorName: me.name,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Label>Yeni kayıt</Label>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <X size={24} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: 'memory', label: 'Anı' },
            { value: 'journal', label: 'Günlük' },
          ]}
        />
        <Display size={28} style={{ marginTop: 24, marginBottom: 16 }}>
          {type === 'memory' ? 'Bu anıyı kaydet' : 'Bugün nasıldı?'}
        </Display>

        {type === 'memory' ? (
          <Pressable
            style={styles.photoBox}
            onPress={async () => setPhoto((await pickPhoto(900)) ?? photo)}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <>
                <Camera size={24} color={colors.muted} />
                <Text style={styles.photoText}>Fotoğraf ekle</Text>
              </>
            )}
          </Pressable>
        ) : null}

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Başlık (isteğe bağlı)"
          placeholderTextColor={colors.faint}
          style={styles.title}
          maxLength={80}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={type === 'memory' ? 'Ne oldu, nasıl hissettiniz?' : 'Yaz…'}
          placeholderTextColor={colors.faint}
          multiline
          maxLength={2000}
          style={styles.body}
        />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="Kaydet" onPress={save} loading={saving} disabled={!text.trim()} />
      </View>
    </KeyboardAvoidingView>
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
  content: { padding: space.gutter },
  photoBox: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photo: { width: '100%', height: '100%' },
  photoText: { ...fonts.bodyMedium, color: colors.muted },
  title: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 54,
    ...fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 12,
  },
  body: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    minHeight: 160,
    textAlignVertical: 'top',
    ...fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  footer: { paddingHorizontal: space.gutter, paddingTop: 8 },
});
