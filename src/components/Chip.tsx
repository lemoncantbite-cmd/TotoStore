import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Chip({
  label,
  active = false,
  onPress,
  onRemove,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {onRemove ? (
        <View style={styles.removeWrap}>
          <MaterialIcons name="close" size={12} color={active ? colors.onAccent : colors.onSurface} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  active: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },
  labelActive: {
    color: colors.onPrimary,
  },
  removeWrap: {
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
