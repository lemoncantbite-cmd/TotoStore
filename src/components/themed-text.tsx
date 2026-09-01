import { Text, type TextProps } from 'react-native';

export function ThemedText({
  style,
  type = 'default',
  ...props
}: TextProps & { type?: 'default' | 'small' | 'subtitle' | 'title' | 'link' | 'linkPrimary' | 'code' | 'smallBold' }) {
  return <Text style={style} {...props} />;
}
