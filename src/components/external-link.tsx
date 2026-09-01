import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

export function ExternalLink({ href, children, asChild }: { href: string; children: ReactNode; asChild?: boolean }) {
  if (asChild && typeof children === 'object') {
    return <Pressable onPress={() => undefined}>{children as any}</Pressable>;
  }

  return <Pressable onPress={() => undefined}>{children}</Pressable>;
}
