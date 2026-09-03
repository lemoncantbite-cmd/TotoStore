import { MaterialIcons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { Link, useRouter, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import BrandLabel from '../components/BrandLabel';
import { getFriendlyErrorMessage } from '../lib/errorMessages';
import { supabase } from '../lib/supabaseClient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
  scheme: 'totostore',
  path: 'auth/callback',
});

const termsHref = '/terms' as Href;
const privacyPolicyHref = '/privacy-policy' as Href;

export default function LoginScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  const signInWithGoogle = async () => {
    if (!acceptedLegal) {
      Alert.alert('Accept Terms and Privacy Policy', 'Please accept both documents before continuing.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert('Google sign-in failed', error.message);
        return;
      }

      if (!data.url) {
        Alert.alert('Google sign-in failed', 'Unable to start the Google sign-in flow.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return;
      }

      if (result.type !== 'success' || !result.url) {
        Alert.alert('Google sign-in failed', 'The sign-in session did not complete. Please try again.');
        return;
      }

      let params: Record<string, string | string[] | undefined>;
      let errorCode: string | null;
      try {
        const parsed = QueryParams.getQueryParams(result.url);
        params = parsed.params;
        errorCode = parsed.errorCode;
      } catch (parseError) {
        Alert.alert(
          'Google sign-in failed',
          'We could not read the response from Google. Please try again.',
        );
        return;
      }

      if (errorCode) {
        Alert.alert('Google sign-in failed', errorCode);
        return;
      }

      const accessToken = typeof params.access_token === 'string'
        ? params.access_token
        : Array.isArray(params.access_token)
          ? params.access_token[0] ?? null
          : null;
      const refreshToken = typeof params.refresh_token === 'string'
        ? params.refresh_token
        : Array.isArray(params.refresh_token)
          ? params.refresh_token[0] ?? null
          : null;

      if (!accessToken || !refreshToken) {
        Alert.alert(
          'Google sign-in failed',
          'Google did not return a valid session. Please try signing in again.',
        );
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        Alert.alert('Google sign-in failed', sessionError.message);
        return;
      }

      if (!sessionData.session) {
        Alert.alert('Google sign-in failed', 'Session could not be established. Please try again.');
        return;
      }

      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Google sign-in failed',
        getFriendlyErrorMessage(error, 'Unable to complete Google sign-in. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <MaterialIcons name="local-taxi" size={32} color={colors.accent} />
          </View>
          <BrandLabel style={styles.brand}>TotoStore</BrandLabel>
          <Text style={styles.tagline}>The fastest way to buy & sell auto-rickshaws.</Text>
        </View>

        <View style={styles.form}>
          <AppButton label={submitting ? 'Signing in...' : 'Continue with Google'} icon="g-mobiledata" onPress={signInWithGoogle} />
        </View>

        <View style={styles.legalRow}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedLegal }}
            onPress={() => setAcceptedLegal((current) => !current)}
            style={[styles.checkbox, acceptedLegal && styles.checkboxChecked]}
          >
            {acceptedLegal ? <MaterialIcons name="check" size={16} color={colors.onPrimary} /> : null}
          </Pressable>
          <Text style={styles.terms}>
            I agree to the <Link href={termsHref} style={styles.legalLink}>Terms of Service</Link> and <Link href={privacyPolicyHref} style={styles.legalLink}>Privacy Policy</Link>.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingTop: 64, paddingBottom: 40 },
  logoWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brand: { fontSize: 24, fontWeight: '800', color: colors.onSurface, marginBottom: 8 },
  tagline: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 40 },
  form: { paddingHorizontal: spacing.containerMargin, gap: 12 },
  legalRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: spacing.containerMargin, marginTop: 'auto', marginBottom: 24 },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 1 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  terms: { flex: 1, fontSize: 11, color: colors.onSurfaceVariant, lineHeight: 18 },
  legalLink: { color: colors.primary, fontWeight: '700' },
});
