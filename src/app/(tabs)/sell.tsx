import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import Chip from '../../components/Chip';
import IconButton from '../../components/IconButton';
import TextField from '../../components/TextField';
import { uploadImage } from '../../lib/storageUpload';
import { supabase } from '../../lib/supabaseClient';
import { addListingPhotos, createListing, getListingById, updateListing, type BatteryCondition, type ListingCondition } from '../../services/listings';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';


const REG_NUMBER_PATTERN = /^[A-Za-z0-9]{4,11}$/;
const TYPES = ['passenger', 'cargo', 'mini'];
const BATTERY_CONDITIONS: BatteryCondition[] = ['excellent', 'good', 'average', 'needs replacement'];
const CONDITIONS: ListingCondition[] = ['new', 'used'];
const MAX_PHOTOS = 5;
const MAX_VIDEOS = 2;
const MAX_VIDEO_DURATION_MS = 60 * 1000;

export default function SellScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ listingId?: string }>();
  const listingId = params.listingId ? String(params.listingId) : undefined;
  const isEditing = Boolean(listingId);

  const [title, setTitle] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [yearOfPurchase, setYearOfPurchase] = useState('');
  const [batteryCondition, setBatteryCondition] = useState<BatteryCondition>('good');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [condition, setCondition] = useState<ListingCondition>('used');
  const [type, setType] = useState<'passenger' | 'cargo' | 'mini'>('passenger');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [videos, setVideos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!isEditing || !listingId) return;

    let cancelled = false;

    const loadListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getListingById(listingId);

        if (cancelled) return;

        setTitle(data.title || '');
        setModel(data.model || '');
        setPrice(String(data.price || ''));
        setYearOfPurchase(String(data.year || new Date().getFullYear()));
        setType(data.category as 'passenger' | 'cargo' | 'mini');
        setBatteryCondition(data.battery_condition || 'good');
        setRegistrationNumber(data.registration_number || '');
        setCondition(data.condition || 'used');
        setDescription(data.description || '');
        setCity(data.location_city || '');
        setState(data.location_state || '');
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load listing.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadListing();
    return () => {
      cancelled = true;
    };
  }, [isEditing, listingId]);

  const validateRegistrationNumber = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setRegistrationError(null);
      return false;
    }
    if (!REG_NUMBER_PATTERN.test(trimmed)) {
      setRegistrationError('Invalid format. Use 4-11 letters/numbers only (e.g. WB37AB1234).');
      return false;
    }
    setRegistrationError(null);
    return true;
  };

  const pickPhotos = async () => {
    const remainingSlots = MAX_PHOTOS - photos.length;

    if (remainingSlots <= 0) {
      Alert.alert('Photo limit reached', `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotos((current) => [...current, ...result.assets].slice(0, MAX_PHOTOS));
    }
  };

  const uploadPhoto = async (photoUri: string, userId: string, currentListingId: string) => {
  const url = await uploadImage(photoUri, 'listing-photos', userId, currentListingId);
  return url;
  };

  const pickVideos = async () => {
    if (videos.length >= MAX_VIDEOS) {
      Alert.alert('Video limit reached', `You can add up to ${MAX_VIDEOS} videos.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo and video access to add listing videos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_VIDEOS - videos.length,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const acceptedVideos = result.assets.filter((asset) => (asset.duration ?? 0) <= MAX_VIDEO_DURATION_MS);
      if (acceptedVideos.length !== result.assets.length) {
        Alert.alert('Video too long', 'Each listing video must be 1 minute or shorter.');
      }
      setVideos((current) => [...current, ...acceptedVideos].slice(0, MAX_VIDEOS));
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const trimmedTitle = title.trim();
    const trimmedModel = model.trim();
    const trimmedRegistration = registrationNumber.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();

    if (!trimmedTitle || !trimmedModel || !price.trim() || !trimmedRegistration || !trimmedCity || !trimmedState) {
      Alert.alert('Missing details', 'Please fill in the required listing information.');
      return;
    }
    
    if (!validateRegistrationNumber(trimmedRegistration)) {
      Alert.alert('Invalid registration number', 'Please enter a valid registration number (4-11 letters/numbers).');
      return;
    }

    if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      Alert.alert('Invalid title', 'Title must be between 3 and 100 characters.');
      return;
    }

    if (description.trim().length > 1000) {
      Alert.alert('Description too long', 'Description must be under 1000 characters.');
      return;
    }
    const numericPrice = Number(price);
    const numericYear = Number(yearOfPurchase);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid price', 'Price must be a valid positive number.');
      return;
    }

    if (Number.isNaN(numericYear) || numericYear < 1990 || numericYear > new Date().getFullYear() + 1) {
      Alert.alert('Invalid year', 'Please enter a valid year for the vehicle.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userError || !userId) {
        throw new Error('You must be logged in to publish a listing.');
      }

      const payload = {
        title: trimmedTitle,
        description: description.trim(),
        price: numericPrice,
        model: trimmedModel,
        category: type,
        year: numericYear,
        battery_condition: batteryCondition,
        registration_number: trimmedRegistration.toUpperCase(),
        location_city: trimmedCity,
        location_state: trimmedState.toUpperCase(),
        location_country: 'India',
        condition,
        photo_urls: [],
      };

      let currentListingId = listingId;
      if (isEditing && listingId) {
        await updateListing(listingId, payload);
        Alert.alert('Listing updated', 'Your listing has been updated successfully.');
      } else {
        const createdListing = await createListing(payload);
        currentListingId = createdListing.id;
      }

      if (currentListingId) {
        const photoUrls: string[] = [];
        for (const photo of photos) {
          const uploadedUrl = await uploadPhoto(photo.uri, userId, currentListingId);
          if (uploadedUrl) photoUrls.push(uploadedUrl);
        }
        await addListingPhotos(currentListingId, photoUrls);
      }

      if (!isEditing) {
        Alert.alert('Listing created', 'Your listing is now live.');
      }

      router.replace('/my-listings');
    } catch (submitError) {
      console.log('SUBMIT ERROR:', JSON.stringify(submitError, null, 2));
      setError(submitError instanceof Error ? submitError.message : 'Unable to save the listing right now.');
      Alert.alert('Save failed', submitError instanceof Error ? submitError.message : 'Unable to save the listing right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centeredText}>{isEditing ? 'Loading listing...' : 'Preparing form...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.locationText}>TotoStore</Text>
        </View>
        <IconButton name="notifications" onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{isEditing ? 'Update your vehicle listing' : 'List your vehicle'}</Text>
        <Text style={styles.sectionHint}>Fill in the vehicle details and publish instantly.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextField label="Title" placeholder="e.g. Bajaj RE Compact 4S" value={title} onChangeText={setTitle} />
        <TextField label="Model" placeholder="e.g. Bajaj RE Compact" value={model} onChangeText={setModel} />
        <TextField label="Price (INR)" placeholder="240000" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <Text style={styles.fieldLabel}>Vehicle type</Text>
        <View style={styles.wrapRow}>
          {TYPES.map((option) => (
            <Chip key={option} label={option} active={type === option} onPress={() => setType(option as 'passenger' | 'cargo' | 'mini')} />
          ))}
        </View>

        <TextField label="Year" placeholder="2023" value={yearOfPurchase} onChangeText={setYearOfPurchase} keyboardType="numeric" />

        <Text style={styles.fieldLabel}>Battery condition</Text>
        <View style={styles.wrapRow}>
          {BATTERY_CONDITIONS.map((option) => (
            <Chip key={option} label={option} active={batteryCondition === option} onPress={() => setBatteryCondition(option)} />
          ))}
        </View>

        <TextField
          label="Registration number"
          placeholder="e.g. WB37AB1234 or DGP123"
          value={registrationNumber}
          onChangeText={(text) => {
            setRegistrationNumber(text);
            validateRegistrationNumber(text);
          }}
          autoCapitalize="characters"
          maxLength={11}
        />
        {registrationError ? <Text style={styles.errorText}>{registrationError}</Text> : null}

        <Text style={styles.fieldLabel}>Condition</Text>
        <View style={styles.wrapRow}>
          {CONDITIONS.map((option) => (
            <Chip key={option} label={option} active={condition === option} onPress={() => setCondition(option)} />
          ))}
        </View>

        <TextField label="City" placeholder="New Delhi" value={city} onChangeText={setCity} />
        <TextField label="State" placeholder="DL" value={state} onChangeText={setState} maxLength={5} />
        <TextField
          label="Description"
          placeholder="Describe the vehicle condition, battery health, and ownership history"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.mediaHeader}>
          <View>
            <Text style={styles.fieldLabel}>Photos and videos</Text>
            <Text style={styles.mediaHint}>Optional · up to 5 photos and 2 videos</Text>
          </View>
          <MaterialIcons name="photo-library" size={22} color={colors.onSurfaceVariant} />
        </View>

        <View style={styles.mediaActions}>
          <AppButton label={`Photos ${photos.length}/${MAX_PHOTOS}`} icon="add-photo-alternate" variant="secondary" onPress={pickPhotos} fullWidth={false} style={styles.mediaButton} />
          <AppButton
          label="Videos (Coming Soon)"
          icon="videocam"
          variant="secondary"
          onPress={() => Alert.alert('Coming Soon', 'Video uploads will be available soon!')}
          fullWidth={false}
          style={[styles.mediaButton, { opacity: 0.5 }]}
          />
        </View>

        <View style={styles.mediaGrid}>
          {photos.map((photo, index) => (
            <View key={photo.uri} style={styles.mediaItem}>
              <Image source={{ uri: photo.uri }} style={styles.mediaPreview} />
              <Pressable style={styles.removeButton} onPress={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                <MaterialIcons name="close" size={14} color={colors.onPrimary} />
              </Pressable>
            </View>
          ))}
          {videos.map((video, index) => (
            <View key={video.uri} style={styles.mediaItem}>
              <Image source={{ uri: video.uri }} style={styles.mediaPreview} />
              <View style={styles.videoBadge}>
                <MaterialIcons name="play-arrow" size={16} color={colors.onPrimary} />
              </View>
              <Pressable style={styles.removeButton} onPress={() => setVideos((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                <MaterialIcons name="close" size={14} color={colors.onPrimary} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={submitting ? (isEditing ? 'Updating...' : 'Publishing...') : isEditing ? 'Update Listing' : 'Publish Listing'}
          icon="arrow-forward"
          onPress={handleSubmit}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centeredText: { marginTop: 12, color: colors.onSurfaceVariant, fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 15, fontWeight: '700', color: colors.onSurface, marginLeft: 4 },
  scroll: { paddingHorizontal: spacing.containerMargin, paddingBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.onSurface, marginBottom: 6, marginTop: 8 },
  sectionHint: { fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 14, lineHeight: 17 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurface, marginBottom: 8, marginTop: 14 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mediaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  mediaHint: { fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 10 },
  mediaActions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  mediaButton: { flex: 1, paddingHorizontal: 10 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  mediaItem: { width: 82, height: 82, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surfaceContainer },
  mediaPreview: { width: '100%', height: '100%' },
  removeButton: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 27, 29, 0.8)' },
  videoBadge: { position: 'absolute', left: 5, bottom: 5, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 27, 29, 0.8)' },
  errorText: { color: colors.error, fontWeight: '600', marginBottom: 12 },
footer: {
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: 14,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
});