import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radius } from '../theme';

export function Label({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.label, style]} />;
}

export function Display({
  style,
  size = 34,
  ...props
}: TextProps & { size?: number }) {
  return (
    <Text
      {...props}
      style={[
        styles.display,
        { fontSize: size, lineHeight: Math.round(size * 1.15) },
        style,
      ]}
    />
  );
}

export function Body({
  style,
  muted,
  ...props
}: TextProps & { muted?: boolean }) {
  return (
    <Text {...props} style={[styles.body, muted && styles.muted, style]} />
  );
}

/** Large statement text where the tail fades to grey (screenshot 3 style). */
export function Statement({
  strong,
  soft,
  size = 30,
  style,
}: {
  strong: string;
  soft?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Display size={size} style={style}>
      {strong}
      {soft ? <Text style={{ color: colors.faint }}> {soft}</Text> : null}
    </Display>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  icon,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'light';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}) {
  const fg = variant === 'primary' ? colors.white : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'light' && styles.buttonLight,
        (disabled || loading) && { opacity: 0.4 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonRow}>
          {icon}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Card({
  style,
  children,
  onPress,
  dark,
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onPress?: () => void;
  dark?: boolean;
}) {
  const s = [styles.card, dark && styles.cardDark, style];
  if (!onPress) {
    return <View style={s}>{children}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  );
}

export function Avatar({
  name,
  photo,
  size = 48,
  ring,
  placeholder,
}: {
  name?: string;
  photo?: string | null;
  size?: number;
  ring?: boolean;
  placeholder?: boolean;
}) {
  const base = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: ring ? 3 : 0,
    borderColor: colors.surface,
  };
  if (placeholder) {
    return (
      <View style={[base, styles.avatarPlaceholder]}>
        <Text style={[styles.avatarText, { color: colors.faint, fontSize: size * 0.4 }]}>
          ?
        </Text>
      </View>
    );
  }
  if (photo) {
    return <Image source={{ uri: photo }} style={[base, { backgroundColor: colors.soft }]} />;
  }
  return (
    <View style={[base, styles.avatarFallback]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
        {(name || '?').trim().charAt(0).toLocaleUpperCase('tr-TR')}
      </Text>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            {o.icon}
            <Text
              numberOfLines={1}
              style={[styles.segmentText, active && { color: colors.ink }]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Label>{title}</Label>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProgressDashes({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dashes}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dash,
            { backgroundColor: i <= current ? colors.ink : colors.line },
          ]}
        />
      ))}
    </View>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Body muted style={{ textAlign: 'center' }}>{text}</Body> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.ink2,
  },
  display: {
    ...fonts.display,
    color: colors.ink,
  },
  body: {
    ...fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  muted: { color: colors.muted },
  button: {
    height: 62,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonPrimary: { backgroundColor: colors.black },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonLight: { backgroundColor: colors.white },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { ...fonts.bodySemi, fontSize: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
  },
  cardDark: { backgroundColor: colors.ink },
  avatarFallback: {
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.faint,
  },
  avatarText: { ...fonts.displayMedium, color: colors.white },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.soft,
    borderRadius: radius.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: { ...fonts.bodyMedium, fontSize: 13, color: colors.muted },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionAction: { ...fonts.bodyMedium, fontSize: 13, color: colors.muted },
  dashes: { flexDirection: 'row', gap: 6 },
  dash: { width: 34, height: 3, borderRadius: 2 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 6 },
  emptyTitle: { ...fonts.displayMedium, fontSize: 20, color: colors.ink },
});
