import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../components/ListingCard';
import { getSavedListings, unsaveListing, type SavedListing } from '../services/listings';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function SavedScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSavedListings();
      setListings(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load saved listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved]),
  );

  const handleUnsave = async (listingId: string) => {
    try {
      await unsaveListing(listingId);
      setListings((current) => current.filter((item) => item.id !== listingId));
    } catch (unsaveError) {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Saved' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Saved Rickshaws</Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : listings.length === 0 ? (
          <Text style={styles.subtitle}>No saved listings yet.</Text>
        ) : (
          <View style={{ gap: 12, marginTop: 16 }}>
            {listings.map((listing) => {
              const listingDisplay = {
                listingId: listing.id,
                sellerId: listing.seller_id,
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
                  key={listing.id}
                  listing={listingDisplay}
                  variant="list"
                  saved
                  onToggleSave={() => handleUnsave(listing.id)}
                  onPress={() => router.push(`/listing/${listing.id}`)}
                />
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.containerMargin },
  title: { fontSize: 28, fontWeight: '800', color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 8 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: colors.error, fontWeight: '600' },
});