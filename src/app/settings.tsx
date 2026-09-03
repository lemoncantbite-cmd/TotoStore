import { MaterialIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';
import { getFriendlyErrorMessage } from '../lib/errorMessages';
import { supabase } from '../lib/supabaseClient';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export default function SettingsScreen() {
  const router = useRouter();
  const termsHref = '/terms' as Href;
  const privacyPolicyHref = '/privacy-policy' as Href;
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete your account, listings, and photos. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

const handleDeleteAccount = async () => {
  setDeleting(true);
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new Error('You must be logged in to delete your account.');
    }

    const { data, error } = await supabase.functions.invoke('delete-account', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error) throw error;
    if (data?.success !== true) {
      throw new Error(data?.error || 'Account deletion could not be confirmed. Please try again.');
    }

    await supabase.auth.signOut();
    Alert.alert('Account deleted', 'Your account has been permanently deleted.');
    router.replace('/');
  } catch (error) {
    Alert.alert('Something went wrong', getFriendlyErrorMessage(error, 'Please try again.'));
  } finally {
    setDeleting(false);
  }
};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <IconButton name="arrow-back" tone="ghost" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Account</Text>

        <Text style={styles.sectionLabel}>Legal</Text>
        <View style={styles.legalLinks}>
          <Pressable onPress={() => router.push(termsHref)}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </Pressable>
          <Pressable onPress={() => router.push(privacyPolicyHref)}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>

        <Pressable style={styles.dangerRow} onPress={confirmDeleteAccount} disabled={deleting}>
          <MaterialIcons name="delete-forever" size={20} color={colors.error} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.dangerTitle}>{deleting ? 'Deleting...' : 'Delete Account'}</Text>
            <Text style={styles.dangerSubtitle}>Permanently delete your account and all your data</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
  scroll: { paddingHorizontal: spacing.containerMargin, paddingTop: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, marginBottom: 8, textTransform: 'uppercase' },
  legalLinks: { gap: 14, marginBottom: 24 },
  legalLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    padding: 14,
  },
  dangerTitle: { fontSize: 14, fontWeight: '700', color: colors.error, marginBottom: 2 },
  dangerSubtitle: { fontSize: 12, color: colors.onSurfaceVariant },
});
