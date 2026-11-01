import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

export function OptionList({
  options,
  value,
  onSelect,
  disabled,
}: {
  options: string[];
  value?: string | null;
  onSelect: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.list}>
      {options.map(o => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            disabled={disabled}
            onPress={() => onSelect(o)}
            style={({ pressed }) => [
              styles.option,
              active && styles.optionActive,
              pressed && !active && { backgroundColor: colors.soft },
            ]}
          >
            <Text style={[styles.text, active && { color: colors.white }]}>{o}</Text>
            {active ? <Check size={18} color={colors.white} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  option: {
    minHeight: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionActive: { backgroundColor: colors.ink },
  text: { ...fonts.bodyMedium, fontSize: 16, color: colors.ink, flex: 1 },
});
