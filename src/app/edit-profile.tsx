import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import TextField from '../components/TextField';
import { supabase } from '../lib/supabaseClient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function EditProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;
        setUserId(user.id);
        setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '');

        const { data: profile } = await supabase
          .from('users')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle();
        setPhone(profile?.phone ?? '');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (saving || !userId) return;
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    setSaving(true);
    try {
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });
      if (metaError) throw metaError;

      const { error: profileError } = await supabase
        .from('users')
        .update({ phone: trimmedPhone })
        .eq('id', userId);
      if (profileError) throw profileError;

      Alert.alert('Profile updated', 'Your changes have been saved.');
      router.back();
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.hint}>Update your name and phone number.</Text>

        <TextField label="Full Name" placeholder="Your name" value={fullName} onChangeText={setFullName} />
        <TextField label="Phone Number" placeholder="9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton label={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.containerMargin, paddingTop: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.onSurface, marginBottom: 4 },
  hint: { fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 20 },
  footer: {
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
});