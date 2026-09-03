import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';



export default function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  prefix,
  maxLength,
  autoCapitalize,
  style,
  icon,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  prefix?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <View style={styles.labelRow}>
          {icon ? <MaterialIcons name={icon} size={14} color={colors.onSurfaceVariant} style={styles.labelIcon} /> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}
      <View style={styles.inputRow}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        {icon ? <MaterialIcons name={icon} size={18} color={colors.onSurfaceVariant} style={styles.icon} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
  },
  labelIcon: {
    marginRight: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  prefix: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.onSurface,
    fontSize: 14,
  },
});
