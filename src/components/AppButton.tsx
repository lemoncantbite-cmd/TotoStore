import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  fullWidth = true,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: keyof typeof MaterialIcons.glyphMap;
  fullWidth?: boolean;
  style?: any;
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        !isPrimary && !isSecondary && styles.tertiary,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.label, isSecondary && styles.labelSecondary, !isPrimary && !isSecondary && styles.labelTertiary]}>
          {label}
        </Text>
        {icon ? (
          <MaterialIcons
            name={icon}
            size={16}
            color={isPrimary ? colors.onPrimary : isSecondary ? colors.onSurface : colors.onSurface}
            style={{ marginLeft: 8 }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.accentSoft,
  },
  tertiary: {
    backgroundColor: colors.surfaceContainer,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  labelSecondary: {
    color: colors.onSurface,
  },
  labelTertiary: {
    color: colors.onSurface,
  },
});
