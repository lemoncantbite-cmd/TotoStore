import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import Chip from '../../components/Chip';
import IconButton from '../../components/IconButton';
import ListingCard from '../../components/ListingCard';
import SearchBar from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import { getSavedListingIds, listListings, saveListing, unsaveListing, type ListingRecord } from '../../services/listings';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';


const CATEGORIES = ['All Listings', 'New Arrivals', 'Used', 'Electric', 'Commercial'];

export default function HomeScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('All Listings');
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listListings({ page: 1, pageSize: 10, status: 'active' });
      console.log('LISTINGS DATA:', JSON.stringify(result.data, null, 2));
      setListings(result.data);
      
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchListings();
      getSavedListingIds().then(setSavedIds).catch(() => {});
    }, []),
  );

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.brand}>Rickshaw Market</Text>
          </View>
          <IconButton name="notifications" onPress={() => {}} />
        </View>

        <View style={styles.searchWrap}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push({ pathname: '/search', params: { query: searchQuery } })}
            onFilterPress={() => router.push('/filters')}
          />
        </View>

        

        <View style={styles.section}>
          <SectionHeader title="Featured Autos" actionLabel="View all" onActionPress={() => router.push('/search')} />
          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Loading listings...</Text>
            </View>
          ) : error ? (
            <View style={styles.loaderBox}>
              <Text style={styles.errorText}>{error}</Text>
              <AppButton label="Retry" fullWidth={false} onPress={fetchListings} />
            </View>
          ) : listings.length === 0 ? (
            <View style={styles.loaderBox}>
              <Text style={styles.emptyText}>No listings yet.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {listings.map((listing) => {
                const listingKey = listing.id;
                const listingDisplay = {
                  listingId: listing.id,
                  sellerId: listing.seller_id,
                  sellerPhone: listing.seller?.phone || null,
                  title: listing.title,
                  price: Number(listing.price),
                  model: listing.model,
                  type: 'passenger' as const,
                  batteryCondition: listing.battery_condition || 'good',
                  registrationNumber: listing.registration_number || '',
                  yearOfPurchase: Number(listing.year || 2024),
                  condition: listing.condition || 'used',
                  description: listing.description || '',
                  photos: listing.photos || [],
                  location: {
                    city: listing.location_city || 'Unknown',
                    state: listing.location_state || 'Unknown',
                    lat: 0,
                    lng: 0,
                  },
                  status: listing.status,
                  createdAt: listing.created_at,
                  updatedAt: listing.updated_at,
                  id: listing.id,
                };

                return (
                  <ListingCard
                    key={listingKey}
                    listing={listingDisplay}
                    variant="list"
                    saved={!!saved[listingKey]}
                    onToggleSave={() => toggleSave(listingKey)}
                    onPress={() => router.push(`/listing/${listingKey}`)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 8,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  brand: { fontSize: 20, fontWeight: '800', color: colors.onSurface, marginLeft: 4 },
  searchWrap: { paddingHorizontal: spacing.containerMargin, marginTop: 16 },
  chipRow: { paddingHorizontal: spacing.containerMargin, paddingVertical: 16 },
  section: { paddingHorizontal: spacing.containerMargin, marginTop: 8 },
  loaderBox: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  loaderText: { marginTop: 12, color: colors.onSurfaceVariant },
  errorText: { color: colors.error, fontWeight: '600', marginBottom: 12 },
  emptyText: { color: colors.onSurfaceVariant, fontSize: 14 },
});
