import { View, type ViewProps } from 'react-native';

export function ThemedView({ style, ...props }: ViewProps & { type?: string }) {
  return <View style={style} {...props} />;
}
