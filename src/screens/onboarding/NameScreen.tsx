import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, fonts } from '../../theme';
import { OnboardingLayout } from './OnboardingLayout';

export default function NameScreen({ navigation }: any) {
  const { name, update } = useOnboarding();
  const valid = name.trim().length >= 2;
  return (
    <OnboardingLayout
      step={0}
      label="Hoş geldin"
      title="Sana nasıl hitap edelim?"
      ctaDisabled={!valid}
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OnbDate')}
    >
      <TextInput
        value={name}
        onChangeText={t => update({ name: t })}
        placeholder="Adın"
        placeholderTextColor={colors.faint}
        style={styles.input}
        autoFocus
        maxLength={30}
        returnKeyType="next"
        onSubmitEditing={() => valid && navigation.navigate('OnbDate')}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    ...fonts.display,
    fontSize: 28,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 12,
  },
});
