import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: September 3, 2026</Text>
        <Text style={styles.heading}>Who we are</Text>
        <Text style={styles.body}>TotoStore is operated by Subodh Das, based in West Bengal, India. Privacy contact: support.totostore@gmail.com.</Text>
        <Text style={styles.heading}>Information we collect</Text>
        <Text style={styles.body}>We may process your email, phone number, authentication identifiers, full name, profile photo, biography, city, state, country, account timestamps, saved listings, and vehicle listing details such as title, description, price, condition, vehicle information, location, and photos.</Text>
        <Text style={styles.heading}>Permissions</Text>
        <Text style={styles.body}>The App requests access to photos/media for profile and vehicle images. Android also declares microphone access for the planned listing-video feature. The current configuration does not declare location, camera, contacts, calendar, biometric, or notification permissions.</Text>
        <Text style={styles.heading}>How information is used</Text>
        <Text style={styles.body}>We use information to authenticate accounts, operate the marketplace, display listings, save favorites, store photos, provide support, prevent abuse, fix errors, maintain security, and comply with law.</Text>
        <Text style={styles.heading}>Public and private information</Text>
        <Text style={styles.body}>Listings and listing photos are publicly viewable. Public seller information is limited to the name and avatar, while seller phone contact is available only through authenticated access. Email, biography, and personal location fields are intended to remain owner-only. Saved listings are private to the account that created them.</Text>
        <Text style={styles.heading}>Service providers</Text>
        <Text style={styles.body}>Supabase provides authentication, database, Edge Functions, and Storage. Profile images use the profile-photos bucket and listing images use the listing-photos bucket. Sentry receives diagnostic data such as crash reports, device information, and app errors. Session Replay and Feedback are enabled in the current configuration. Sentry uses a US ingestion endpoint.</Text>
        <Text style={styles.heading}>Retention and rights</Text>
        <Text style={styles.body}>We retain account, listing, saved-listing, and photo data until you delete your account. After a deletion request, we aim to permanently remove account data within 30 days, subject to backups, legal duties, disputes, and provider retention schedules. You may request access, correction, deletion, restriction, portability, or information about processing by emailing support.totostore@gmail.com.</Text>
        <Text style={styles.heading}>Account deletion</Text>
        <Text style={styles.body}>Use Settings &gt; Delete Account to request deletion of your authentication account, profile, listings, and associated photos.</Text>
        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.body}>Subodh Das{`\n`}support.totostore@gmail.com{`\n`}West Bengal, India</Text>
        <Text style={styles.note}>This document is a draft for legal review.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.containerMargin, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: colors.onSurface },
  updated: { marginTop: 6, fontSize: 12, color: colors.onSurfaceVariant },
  heading: { marginTop: 24, fontSize: 16, fontWeight: '800', color: colors.onSurface },
  body: { marginTop: 8, fontSize: 14, lineHeight: 21, color: colors.onSurfaceVariant },
  note: { marginTop: 32, fontSize: 12, fontStyle: 'italic', color: colors.onSurfaceVariant },
});
