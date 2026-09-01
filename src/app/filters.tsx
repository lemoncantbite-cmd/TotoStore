import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const TYPES = ['passenger', 'cargo', 'mini'];

export default function FiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; query?: string }>();
  const [category, setCategory] = useState(params.category ?? '');

  const applyFilters = () => {
    router.push({
      pathname: '/search',
      params: { query: params.query ?? '', category },
    });
  };

  const clearFilters = () => {
    setCategory('');
    router.push({ pathname: '/search', params: { query: params.query ?? '' } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Filters</Text>

        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.row}>
          {TYPES.map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, category === option && styles.chipActive]}
              onPress={() => setCategory(category === option ? '' : option)}
            >
              <Text style={[styles.chipText, category === option && styles.chipTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </Pressable>

        <Pressable style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#5E6367', marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8DBDD',
  },
  chipActive: { backgroundColor: '#1A1C1E', borderColor: '#1A1C1E' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#1A1C1E' },
  chipTextActive: { color: '#FFFFFF' },
  applyButton: {
    backgroundColor: '#1A1C1E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  applyButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  clearButton: { alignItems: 'center', marginTop: 14 },
  clearButtonText: { color: '#5E6367', fontWeight: '600', fontSize: 13 },
});