import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { deleteListing, listListings, type ListingRecord } from '../services/listings';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 10;

export default function MyListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (nextPage: number, append = false) => {
    try {
      if (nextPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const result = await listListings({ page: nextPage, pageSize: PAGE_SIZE, status: 'active', sellerId: userData.user?.id });

      if (append) {
        setListings((current) => [...current, ...result.data]);
      } else {
        setListings(result.data);
      }

      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load your listings.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(1, false);
  }, [fetchListings]);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete listing', 'Are you sure you want to remove this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteListing(id);
            setListings((current) => current.filter((item) => item.id !== id));
            Alert.alert('Deleted', 'The listing has been removed.');
          } catch (deleteError) {
            Alert.alert('Delete failed', deleteError instanceof Error ? deleteError.message : 'Unable to delete this listing.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ListingRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>₹{Number(item.price).toLocaleString('en-IN')} · {item.model}</Text>
          <Text style={styles.meta}>{item.location_city}, {item.location_state}</Text>
        </View>
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <View style={styles.actionRow}>
        <AppButton label="Edit" variant="secondary" fullWidth={false} onPress={() => router.push({ pathname: '/sell', params: { listingId: item.id } })} style={styles.actionButton} />
        <AppButton label="Delete" variant="tertiary" fullWidth={false} onPress={() => handleDelete(item.id)} style={styles.actionButton} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'My Listings' }} />

      <View style={styles.header}>
        <Text style={styles.heading}>My Listings</Text>
        <AppButton label="New listing" fullWidth={false} onPress={() => router.push('/sell')} style={styles.newButton} />
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading your listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.loaderBox}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton label="Retry" fullWidth={false} onPress={() => fetchListings(1, false)} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>You have no listings yet.</Text>}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreWrap}>
                {loadingMore ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <AppButton label="Load more" fullWidth={false} onPress={() => fetchListings(page + 1, true)} style={styles.loadMoreButton} />
                )}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 8,
    paddingBottom: 12,
  },
  heading: { fontSize: 24, fontWeight: '800', color: colors.onSurface },
  newButton: { minWidth: 120 },
  listContent: { paddingHorizontal: spacing.containerMargin, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
  meta: { color: colors.onSurfaceVariant, marginTop: 4 },
  status: { fontSize: 11, textTransform: 'uppercase', fontWeight: '700', color: colors.primary },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionButton: { flex: 1 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loaderText: { marginTop: 12, color: colors.onSurfaceVariant },
  errorText: { color: colors.error, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryButton: { marginTop: 12 },
  emptyText: { textAlign: 'center', paddingVertical: 24, color: colors.onSurfaceVariant },
  loadMoreWrap: { paddingVertical: 12, alignItems: 'center' },
  loadMoreButton: { minWidth: 160 },
});
