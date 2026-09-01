import { MaterialIcons } from '@expo/vector-icons';

import { useState } from 'react';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import type { Listing } from '../types/listing';
import { Alert, Dimensions, FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';


export default function ListingCard({
  listing,
  variant = 'list',
  saved = false,
  onPress,
  onToggleSave,
}: {
  listing: Listing;
  variant?: 'list' | 'grid';
  saved?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width - 32);
  const isGrid = variant === 'grid';
  const tagLabel = listing.tag ?? (listing.condition === 'new' ? 'New' : 'Used');
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(listing.price);
  const locationText = `${listing.location.city}, ${listing.location.state}`;
  const year = listing.yearOfPurchase;
  const km = listing.kmRun ?? 0;
  const fuelText = listing.type === 'passenger' ? 'Passenger' : listing.type === 'cargo' ? 'Cargo' : 'Mini';

  return (
    <View style={[styles.card, isGrid && styles.gridCard]}>
            <View
        style={[styles.image, isGrid && styles.gridImage]}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
             {(() => {
          const sortedPhotos = listing.photos.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          return sortedPhotos.length > 0 ? (
            <>
              <Image
                source={{ uri: sortedPhotos[activeIndex]?.url }}
                style={StyleSheet.absoluteFill}
              />
              {sortedPhotos.length > 1 ? (
                <>
                  {activeIndex > 0 ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setActiveIndex((i) => i - 1);
                      }}
                      style={styles.arrowLeft}
                      hitSlop={8}
                    >
                      <MaterialIcons name="chevron-left" size={22} color="#fff" />
                    </Pressable>
                  ) : null}
                  {activeIndex < sortedPhotos.length - 1 ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setActiveIndex((i) => i + 1);
                      }}
                      style={styles.arrowRight}
                      hitSlop={8}
                    >
                      <MaterialIcons name="chevron-right" size={22} color="#fff" />
                    </Pressable>
                  ) : null}
                  <View style={styles.dotsRow}>
                    {sortedPhotos.map((_, index) => (
                      <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : null;
        })()}

        <View style={[styles.tag, tagLabel === 'New' ? styles.tagNew : styles.tagUsed]}>
          <Text style={[styles.tagText, tagLabel === 'New' && styles.tagTextLight]}>{tagLabel}</Text>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleSave?.();
          }}
          style={styles.saveButton}
          hitSlop={8}
      >
          <MaterialIcons
            name={saved ? 'favorite' : 'favorite-border'}
            size={18}
            color={saved ? colors.error : colors.onSurface}
          />
        </Pressable>
               {listing.photos.length === 0 ? (
          <View style={styles.vehicleWrap}>
            <MaterialIcons name="electric-rickshaw" size={isGrid ? 30 : 38} color="#C4C7C7" />
          </View>
        ) : null}
      </View>

      <Pressable onPress={onPress} style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="calendar-today" size={12} color={colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{year}</Text>
          <MaterialIcons name="speed" size={12} color={colors.onSurfaceVariant} style={{ marginLeft: 8 }} />
          <Text style={styles.metaText}>{km === 0 ? '0 km' : `${km.toLocaleString('en-IN')} km`}</Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialIcons name={fuelText === 'Passenger' ? 'local-gas-station' : 'bolt'} size={12} color={colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{fuelText}</Text>
          <MaterialIcons name="location-on" size={12} color={colors.onSurfaceVariant} style={{ marginLeft: 8 }} />
          <Text style={styles.metaText}>{locationText}</Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            openWhatsApp((listing as any).sellerPhone, `Hi, maine aapki listing "${listing.title}" dekhi thi.`);
          }}
          style={styles.whatsappBtn}
          hitSlop={8}
        >
          <MaterialIcons name="chat" size={16} color="#fff" />
          <Text style={styles.whatsappText}>WhatsApp</Text>
        </Pressable>
      </Pressable>
    </View>
  );
}
const openWhatsApp = (phoneNumber: string | null | undefined, message: string) => {
  if (!phoneNumber) {
    Alert.alert('Not available', 'Seller ne abhi phone number add nahi kiya hain');
    return;
  }
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Error', 'WhatsApp nahi khul paya');
  });
};

const styles = StyleSheet.create({
  card: {
   
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  gridCard: {
    width: '48%',
  },
  image: {
    height: 170,
    backgroundColor: '#E8ECEF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: { width: 340, height: 170, resizeMode: 'cover' },
  photoFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridImage: {
    height: 150,
  },
    dotsRow: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
    arrowLeft: {
    position: 'absolute',
    left: 6,
    top: '50%',
    marginTop: -14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowRight: {
    position: 'absolute',
    right: 6,
    top: '50%',
    marginTop: -14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagNew: { backgroundColor: '#E7F7C9' },
  tagUsed: { backgroundColor: '#E9ECFF' },
  tagText: { fontSize: 10, fontWeight: '700', color: colors.onSurface },
  tagTextLight: { color: '#1B3C26' },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleWrap: {
    backgroundColor: '#EFF2F3',
    borderRadius: 18,
    padding: 10,
  },
  body: { padding: 12 },
  title: { fontSize: 15, color: colors.onSurface, fontWeight: '700' },
  price: { marginTop: 4, fontSize: 18, color: colors.onSurface, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  metaText: { color: colors.onSurfaceVariant, fontSize: 11 },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  whatsappText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});