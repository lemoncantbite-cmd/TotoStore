import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import ListingCard from '../../components/ListingCard';
import SearchBar from '../../components/SearchBar';
import { getSavedListingIds, listListings, saveListing, unsaveListing, type ListingRecord } from '../../services/listings';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const PAGE_SIZE = 10;
export default function SearchScreen() {
  const router = useRouter();
  const { query: initialQuery, category: initialCategory } = useLocalSearchParams<{ query?: string; category?: string }>();
  const [query, setQuery] = useState(initialQuery ?? '');
  const [category, setCategory] = useState(initialCategory ?? '');
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  const [sortOrder, setSortOrder] = useState<'relevance' | 'price-low' | 'price-high'>('relevance');
  const [items, setItems] = useState<ListingRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async (nextPage: number) => {
    try {
      if (nextPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      const result = await listListings({
        page: nextPage,
        pageSize: PAGE_SIZE,
        status: 'active',
        search: query.trim() || undefined,
        category: category || undefined,
      });

      if (nextPage === 1) {
        setItems(result.data);
      } else {
        setItems((current) => [...current, ...result.data]);
      }

      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load listings.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

useEffect(() => {
  const loadListings = async () => {
    await fetchListings(1);
  };
  loadListings();
}, [query, category]);

  useEffect(() => {
    getSavedListingIds().then(setSavedIds).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setQuery('');
      };
    }, []),
  );

  const visibleListings = [...items].sort((first, second) => {
    if (sortOrder === 'price-low') return Number(first.price) - Number(second.price);
    if (sortOrder === 'price-high') return Number(second.price) - Number(first.price);
    return 0;
  });

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.includes(id);
    setSaved((s) => ({ ...s, [id]: !isSaved }));
    setSavedIds((current) => (isSaved ? current.filter((x) => x !== id) : [...current, id]));
    try {
      if (isSaved) {
        await unsaveListing(id);
      } else {
        await saveListing(id);
      }
    } catch (saveError) {
      setSaved((s) => ({ ...s, [id]: isSaved }));
      setSavedIds((current) => (isSaved ? [...current, id] : current.filter((x) => x !== id)));
    }
  };
  
  const cycleSort = () => {
    setSortOrder((current) => current === 'relevance' ? 'price-low' : current === 'price-low' ? 'price-high' : 'relevance');
  };
  const sortLabel = sortOrder === 'relevance' ? 'Relevance' : sortOrder === 'price-low' ? 'Price: Low to high' : 'Price: High to low';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SearchBar value={query} onChangeText={setQuery} onFilterPress={() => router.push('/filters')} />
      </View>

           <View style={styles.filterRow}>
        <Pressable
          style={styles.moreFilters}
          onPress={() => router.push({ pathname: '/filters', params: { query, category } })}
        >
          <MaterialIcons name="add" size={14} color={colors.onSurface} />
          <Text style={styles.moreFiltersText}>{category ? `Type: ${category}` : 'Filters'}</Text>
        </Pressable>
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>{visibleListings.length} {visibleListings.length === 1 ? 'Toto' : 'Totos'} Found</Text>
        <Pressable style={styles.sortBtn} onPress={cycleSort}>
          <Text style={styles.sortText}>Sort by: {sortLabel}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.onSurface} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.loaderBox}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton label="Retry" fullWidth={false} onPress={() => fetchListings(1)} />
        </View>
      ) : (
          <FlatList
          data={visibleListings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          nestedScrollEnabled
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialIcons name="search-off" size={48} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptyHint}>
                Try adjusting your search or filters to find what you are looking for.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const listingKey = item.id;
            const listingDisplay = {
              listingId: item.id,
              sellerId: item.seller_id,
              title: item.title,
              price: Number(item.price),
              model: item.model,
              type: 'passenger' as const,
              batteryCondition: item.battery_condition || 'good',
              registrationNumber: item.registration_number || '',
              yearOfPurchase: Number(item.year || 2024),
              condition: item.condition || 'used',
              description: item.description || '',
              photos: item.photos || [],
              location: {
                city: item.location_city || 'Unknown',
                state: item.location_state || 'Unknown',
                lat: 0,
                lng: 0,
              },
              status: item.status,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              id: item.id,
            };

            return (
              <ListingCard
                listing={listingDisplay}
                variant="list"
                saved={!!saved[listingKey]}
                onToggleSave={() => toggleSave(listingKey)}
                onPress={() => router.push(`/listing/${listingKey}`)}
              />
            );
          }}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreWrap}>
                {loadingMore ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <AppButton label="Load more" fullWidth={false} onPress={() => fetchListings(page + 1)} style={styles.loadMoreButton} />
                )}
              </View>
            ) : null
          }
          initialNumToRender={6}
          windowSize={7}
          removeClippedSubviews
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.containerMargin, paddingTop: 8 },
  filterRow: { paddingHorizontal: spacing.containerMargin, paddingVertical: 12, alignItems: 'center' },
  moreFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outline,
  },
  moreFiltersText: { fontSize: 12, fontWeight: '600', color: colors.onSurface, marginLeft: 4 },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    marginBottom: 8,
  },
  resultsCount: { fontSize: 13, fontWeight: '700', color: colors.onSurface },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { fontSize: 12, color: colors.onSurfaceVariant, marginRight: 2 },
  listContent: { paddingHorizontal: spacing.containerMargin, paddingBottom: 120 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptyHint: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  loaderText: { marginTop: 12, color: colors.onSurfaceVariant },
  errorText: { color: colors.error, fontWeight: '600', marginBottom: 12 },
  loadMoreWrap: { paddingVertical: 12, alignItems: 'center' },
  loadMoreButton: { minWidth: 150 },
});
