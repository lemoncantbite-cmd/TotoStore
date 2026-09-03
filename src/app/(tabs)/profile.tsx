import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import BrandLabel from '../../components/BrandLabel';
import IconButton from '../../components/IconButton';
import ProfileMenuItem from '../../components/ProfileMenuItem';
import { getFriendlyErrorMessage } from '../../lib/errorMessages';
import { deleteImage, uploadImage } from '../../lib/storageUpload';
import { supabase } from '../../lib/supabaseClient';
import { listListings } from '../../services/listings';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [listingCount, setListingCount] = useState(0);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          setLoadError(null);
          const { data, error: userErr } = await supabase.auth.getUser();
          if (userErr || !data.user) throw userErr ?? new Error('No user found');
          const user = data.user;
          setUserId(user.id);
          setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '');
          const listingsResult = await listListings({ sellerId: user.id, status: 'active' });
          setListingCount(listingsResult.count);

          const { data: profile, error: profileErr } = await supabase
            .from('users')
            .select('avatar_url, phone')
            .eq('id', user.id)
            .maybeSingle();
          if (profileErr) throw profileErr;
          setAvatarUrl(profile?.avatar_url ?? null);
          setPhone(profile?.phone ?? '');
        } catch (error) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load profile.');
        }
      };
      loadProfile();
    }, [])
  );

  const updateProfilePhoto = async () => {
    if (!userId || busy) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    setBusy(true);
    try {
      const asset = result.assets[0];
      const uploadedUrl = await uploadImage(asset.uri, 'profile-photos', userId);
      const bustedUrl = `${uploadedUrl}?v=${Date.now()}`;

      const { error: profileError } = await supabase
        .from('users')
        .update({ avatar_url: bustedUrl })
        .eq('id', userId);
      if (profileError) throw profileError;
      setAvatarUrl(bustedUrl);
    } catch (error) {
      Alert.alert('Upload failed', getFriendlyErrorMessage(error, 'Unable to update your photo.'));
    } finally {
      setBusy(false);
    }
  };

  const deleteProfilePhoto = async () => {
    if (!userId || busy || !avatarUrl) return;
    setBusy(true);
    try {
      // Update DB first — if this fails, storage file is untouched, no orphaned reference.
      const { error: profileError } = await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
      if (profileError) throw profileError;

      setAvatarUrl(null);

      // Storage cleanup after DB is already consistent. Filename must match
      // exactly what uploadImage() generates for profile-photos: `${userId}.jpg`.
      const { success, error: storageError } = await deleteImage('profile-photos', `${userId}.jpg`);
      if (!success) {
        console.warn('Profile photo removed from profile but storage cleanup failed:', storageError);
      }
    } catch (error) {
      Alert.alert('Delete failed', getFriendlyErrorMessage(error, 'Unable to delete your photo.'));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout failed', error.message);
      return;
    }

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loadError ? <Text style={{ color: colors.error, marginBottom: 12 }}>{loadError}</Text> : null}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconButton name="menu" tone="ghost" onPress={() => {}} />
            <BrandLabel style={styles.brand}>TotoStore</BrandLabel>
          </View>
          <IconButton name="notifications" tone="ghost" onPress={() => {}} />
        </View>

        <View style={styles.profileCard}>
          <Pressable style={styles.avatar} onPress={updateProfilePhoto} disabled={busy}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarInitials}>RK</Text>}
          </Pressable>
          <View style={styles.photoActions}>
            <Pressable onPress={updateProfilePhoto} disabled={busy}>
              <Text style={styles.photoAction}>{busy ? 'Saving...' : avatarUrl ? 'Change photo' : 'Add photo'}</Text>
            </Pressable>
            {avatarUrl ? <Pressable onPress={deleteProfilePhoto} disabled={busy}><Text style={styles.deleteAction}>Delete</Text></Pressable> : null}
          </View>
          <Text style={styles.name}>{fullName || 'Your Name'}</Text>
          <View style={styles.phoneRow}>
            <MaterialIcons name="call" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.phone}>{phone || 'No phone number'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>New Seller</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{listingCount}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>
          </View>

         <AppButton label="Edit Profile" variant="tertiary" onPress={() => router.push('/edit-profile')} style={{ marginTop: 16 }} />
        </View>

        <View style={styles.menu}>
          <ProfileMenuItem icon="list-alt" title="My Listings" subtitle="Manage your vehicles for sale" onPress={() => router.push('/my-listings')} />
          <ProfileMenuItem icon="favorite" title="Saved" subtitle="Rickshaws you've bookmarked" onPress={() => router.push('/saved')} />
          <ProfileMenuItem icon="chat" title="Chat Inbox" subtitle="Messages with buyers & sellers" onPress={() => Alert.alert('Coming Soon', 'Chat inbox will be available soon!')} />
          <ProfileMenuItem icon="settings" title="Settings" subtitle="Account, privacy, and notifications" onPress={() => router.push('/settings')} />
          <ProfileMenuItem icon="help" title="Help & Support" subtitle="FAQs and customer service" onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available soon!')} />
          <ProfileMenuItem icon="logout" title="Log Out" subtitle="Sign out of your current session" danger onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.containerMargin },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  brand: { fontSize: 17, fontWeight: '700', color: colors.onSurface, marginLeft: 4 },
  profileCard: { alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingTop: 12, paddingBottom: 20 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: { fontSize: 26, fontWeight: '800', color: colors.accent },
  avatarImage: { width: '100%', height: '100%', borderRadius: 42 },
  photoActions: { flexDirection: 'row', gap: 16, marginTop: -4, marginBottom: 8 },
  photoAction: { fontSize: 13, fontWeight: '700', color: colors.primary },
  deleteAction: { fontSize: 13, fontWeight: '700', color: colors.error },
  name: { fontSize: 20, fontWeight: '800', color: colors.onSurface, marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  phone: { fontSize: 13, color: colors.onSurfaceVariant, marginLeft: 4 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    paddingVertical: 14,
    width: '100%',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: colors.outlineVariant },
  statNumber: { fontSize: 16, fontWeight: '800', color: colors.onSurface },
  statLabel: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4 },
  menu: { paddingHorizontal: spacing.containerMargin, marginTop: 8 },
});
