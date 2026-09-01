import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import { getListingById, type ListingRecord } from '../../services/listings';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<ListingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Listing not found.');
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getListingById(id);
        setListing(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleWhatsAppContact = () => {
    if (!listing?.seller?.phone) return;
    const phone = listing.seller.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title}`);
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Loading listing' }} />
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centeredText}>Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Listing' }} />
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{error || 'Listing not found.'}</Text>
          <AppButton label="Go back" fullWidth={false} onPress={() => router.back()} style={styles.backButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: listing.title || 'Listing details' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>₹{Number(listing.price).toLocaleString('en-IN')}</Text>
        <Text style={styles.meta}>{listing.model} · {listing.year || 'N/A'}</Text>
        <Text style={styles.meta}>{listing.location_city}, {listing.location_state}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Battery condition</Text>
          <Text style={styles.infoValue}>{listing.battery_condition || 'N/A'}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Registration number</Text>
          <Text style={styles.infoValue}>{listing.registration_number || 'N/A'}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Condition</Text>
          <Text style={styles.infoValue}>{listing.condition || 'N/A'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>

        <Text style={styles.sectionTitle}>Seller</Text>
        <Text style={styles.sellerName}>{listing.seller?.full_name || 'Seller'}</Text>

        <View style={styles.contactWrap}>
          {listing.seller?.phone ? (
            <AppButton label="Contact on WhatsApp" icon="chat" onPress={handleWhatsAppContact} />
          ) : (
            <Text style={styles.noContactText}>Contact info unavailable</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centeredText: { marginTop: 12, color: colors.onSurfaceVariant },
  errorText: { color: colors.error, textAlign: 'center', fontWeight: '600' },
  backButton: { marginTop: 16 },
  container: { padding: spacing.containerMargin, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.onSurface },
  price: { marginTop: 8, fontSize: 22, fontWeight: '700', color: colors.primary },
  meta: { marginTop: 8, fontSize: 14, color: colors.onSurfaceVariant },
  infoBox: { marginTop: 18, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  infoLabel: { fontSize: 12, color: colors.onSurfaceVariant, fontWeight: '700' },
  infoValue: { marginTop: 6, fontSize: 15, color: colors.onSurface, fontWeight: '600' },
  sectionTitle: { marginTop: 24, fontSize: 16, fontWeight: '800', color: colors.onSurface },
  description: { marginTop: 8, color: colors.onSurfaceVariant, lineHeight: 22 },
  sellerName: { marginTop: 8, fontSize: 15, fontWeight: '600', color: colors.onSurface },
  contactWrap: { marginTop: 16 },
  noContactText: { fontSize: 14, color: colors.onSurfaceVariant, fontStyle: 'italic' },
});
