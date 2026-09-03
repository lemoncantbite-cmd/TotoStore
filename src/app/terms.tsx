import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Terms of Service' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Last updated: September 3, 2026</Text>
        <Text style={styles.heading}>Acceptance and eligibility</Text>
        <Text style={styles.body}>By using TotoStore, you agree to these Terms. You must be at least 18 years old and legally able to agree to them.</Text>
        <Text style={styles.heading}>Marketplace</Text>
        <Text style={styles.body}>TotoStore is a marketplace for auto-rickshaw listings. TotoStore is not the seller, buyer, broker, inspector, manufacturer, financier, insurer, or guarantor of any vehicle or transaction. Users are responsible for their own negotiations, inspections, payments, registration, taxes, delivery, and disputes.</Text>
        <Text style={styles.heading}>Listings and conduct</Text>
        <Text style={styles.body}>Only post accurate listings that you are legally allowed to advertise. Do not post stolen, unsafe, fraudulent, unlawful, abusive, infringing, or misleading content. Do not misuse another user&apos;s personal information, spam users, upload malware, or bypass security controls.</Text>
        <Text style={styles.heading}>User content</Text>
        <Text style={styles.body}>You retain ownership of your listing text, photos, and media. You grant TotoStore permission to host, display, format, and distribute that content as needed to operate and secure the App. Listings and listing photos may be publicly visible.</Text>
        <Text style={styles.heading}>Disclaimer and termination</Text>
        <Text style={styles.body}>The App is provided as available. TotoStore does not guarantee listing accuracy, vehicle condition, ownership, title, safety, availability, or transaction completion. We may remove content or suspend accounts for safety, legal, or Terms violations. You can delete your account through Settings.</Text>
        <Text style={styles.heading}>Governing law</Text>
        <Text style={styles.body}>These Terms are governed by the laws of India, with courts in West Bengal, India having jurisdiction, subject to rights that cannot legally be waived.</Text>
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
