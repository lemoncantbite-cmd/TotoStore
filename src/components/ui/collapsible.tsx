import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export function Collapsible({ title, children }: { title: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ borderRadius: 12, backgroundColor: '#F3F4F6', padding: 12 }}>
      <Pressable onPress={() => setOpen((v) => !v)}>
        <Text style={{ fontWeight: '700', color: '#191C1E' }}>{title}</Text>
      </Pressable>
      {open && <View style={{ marginTop: 8 }}>{children}</View>}
    </View>
  );
}
