import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Button, Display, Label, ProgressDashes } from '../../components/ui';
import { colors, fonts, space } from '../../theme';

export const ONBOARDING_STEPS = 4;

export function OnboardingLayout({
  step,
  label,
  title,
  children,
  cta = 'Devam',
  ctaDisabled,
  ctaLoading,
  onNext,
  onBack,
  onSkip,
}: {
  step: number;
  label: string;
  title: string;
  children?: React.ReactNode;
  cta?: string;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12}>
              <ChevronLeft size={22} color={colors.ink} />
            </Pressable>
          ) : null}
          <ProgressDashes total={ONBOARDING_STEPS} current={step} />
        </View>
        {onSkip ? (
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text style={styles.skip}>ATLA</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Label>{label}</Label>
        <Display style={styles.title}>{title}</Display>
        {children}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title={cta}
          onPress={onNext}
          disabled={ctaDisabled}
          loading={ctaLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter,
    height: 32,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skip: { ...fonts.bodyMedium, fontSize: 13, letterSpacing: 0.8, color: colors.ink },
  content: { padding: space.gutter, paddingTop: 28 },
  title: { marginTop: 10, marginBottom: 28 },
  footer: { paddingHorizontal: space.gutter, paddingTop: 8 },
});
