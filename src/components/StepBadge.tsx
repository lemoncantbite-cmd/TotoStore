import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function StepBadge({ steps, activeIndex = 0 }: { steps: string[]; activeIndex?: number }) {
  return (
    <View style={styles.row}>
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <View key={step} style={[styles.step, active && styles.activeStep]}>
            <Text style={[styles.stepText, active && styles.activeText]}>{index + 1}</Text>
            <Text style={[styles.label, active && styles.activeLabel]}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
  },
  activeStep: {
    backgroundColor: colors.accentSoft,
  },
  stepText: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  activeText: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  label: {
    marginLeft: 6,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.onSurface,
  },
});
