import { MaterialIcons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { supabase } from '../lib/supabaseClient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
  scheme: 'totostore',
  path: 'auth/callback',
});

export default function LoginScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const signInWithGoogle = async () => {
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
      if (result.type !== 'success') return;

      const { params, errorCode } = QueryParams.getQueryParams(result.url);
      if (errorCode) throw new Error(errorCode);

      const { access_token: accessToken, refresh_token: refreshToken } = params;
      if (!accessToken || !refreshToken) {
        throw new Error('Google did not return a valid session.');
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;
      if (sessionData.session) router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Google sign-in failed',
        error instanceof Error ? error.message : 'Unable to complete Google sign-in. Please try again.',
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
          <Text style={styles.brand}>TotoStore</Text>
          <Text style={styles.tagline}>The fastest way to buy & sell auto-rickshaws.</Text>
        </View>

        <View style={styles.form}>
          <AppButton label={submitting ? 'Signing in...' : 'Continue with Google'} icon="g-mobiledata" onPress={signInWithGoogle} />
        </View>

        <Text style={styles.terms}>By continuing, you agree to our Terms & Privacy Policy.</Text>
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
  terms: { fontSize: 11, color: colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 40, marginTop: 'auto', marginBottom: 24 },
});
