import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search rickshaws, brands...',
  onFilterPress,
  onSubmitEditing,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        style={styles.input}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
      <Pressable style={styles.filter} onPress={onFilterPress}>
        <MaterialIcons name="tune" size={18} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: colors.onSurface,
    fontSize: 14,
  },
  filter: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
