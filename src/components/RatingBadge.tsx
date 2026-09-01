import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RatingBadge({ rating = '4.8' }: { rating?: string }) {
  return (
    <View style={styles.badge}>
      <MaterialIcons name="star" size={14} color={colors.onAccent} />
      <Text style={styles.text}>{rating}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.onAccent,
  },
});
