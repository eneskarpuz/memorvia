import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Button, Display } from '../../components/ui';
import { colors, space } from '../../theme';

export default function WelcomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.center}>
        <Display size={44} style={styles.text}>
          Memorvia
        </Display>
        <Body muted style={[styles.text, styles.desc]}>
          Birlikte geçen her an, tek bir yerde.
        </Body>
      </View>
      <Button title="Başla" onPress={() => navigation.navigate('OnbName')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.gutter },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { textAlign: 'center' },
  desc: { marginTop: 10, fontSize: 17 },
});
