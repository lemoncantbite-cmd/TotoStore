import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors } from '../theme/colors';

export default function BrandLabel(props: TextProps) {
  return <Text {...props} style={[styles.brand, props.style]}>TotoStore</Text>;
}

const styles = StyleSheet.create({
  brand: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.onSurface,
  },
});
