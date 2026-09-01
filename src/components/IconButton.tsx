import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function IconButton({
  name,
  onPress,
  size = 22,
  tone = 'default',
  style,
}: {
  name: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  size?: number;
  tone?: 'default' | 'ghost' | 'dark';
  style?: any;
}) {
  const isGhost = tone === 'ghost';
  const isDark = tone === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        isGhost && styles.ghost,
        isDark && styles.dark,
        style,
      ]}
    >
      <MaterialIcons
        name={name}
        size={size}
        color={isDark ? colors.onPrimary : isGhost ? colors.onSurface : colors.onSurface}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dark: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
});
