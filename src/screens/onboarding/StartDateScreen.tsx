import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, fonts, radius } from '../../theme';
import { formatDate, fromISODate, toISODate } from '../../lib/utils';
import { OnboardingLayout } from './OnboardingLayout';

export default function StartDateScreen({ navigation }: any) {
  const { startDate, update } = useOnboarding();
  const [showAndroid, setShowAndroid] = useState(false);
  const value = fromISODate(startDate) ?? new Date();

  return (
    <OnboardingLayout
      step={1}
      label="İlişkiniz"
      title="Ne zamandan beri birliktesiniz?"
      ctaDisabled={!startDate}
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OnbQuiz', { index: 0 })}
    >
      <Pressable
        style={styles.dateBox}
        onPress={() => Platform.OS === 'android' && setShowAndroid(true)}
      >
        <Calendar size={20} color={colors.muted} />
        <Text style={[styles.dateText, !startDate && { color: colors.faint }]}>
          {startDate ? formatDate(startDate) : 'Tarih seç'}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            themeVariant="light"
            textColor={colors.ink}
            maximumDate={new Date()}
            locale="tr-TR"
            onChange={(_, d) => d && update({ startDate: toISODate(d) })}
          />
        </View>
      ) : null}

      {showAndroid ? (
        <DateTimePicker
          value={value}
          mode="date"
          maximumDate={new Date()}
          onChange={(e, d) => {
            setShowAndroid(false);
            if (e.type === 'set' && d) {
              update({ startDate: toISODate(d) });
            }
          }}
        />
      ) : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    height: 60,
  },
  dateText: { ...fonts.bodyMedium, fontSize: 17, color: colors.ink },
  iosPicker: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
