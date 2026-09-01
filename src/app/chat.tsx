import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Chat Inbox' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Chat Inbox</Text>
        <Text style={styles.subtitle}>No conversations yet.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#191C1E' },
  subtitle: { fontSize: 14, color: '#5E6367', marginTop: 8 },
});
