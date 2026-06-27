import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import HelpHeader from '../../../components/HelpHeader';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('profile.missingName'));
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 10) {
      Alert.alert(t('common.error'), t('profile.invalidPhone'));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: digits });
      Alert.alert(t('common.success'), t('profile.saved'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('profile.saveFailed');
      Alert.alert(t('common.error'), message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <HelpHeader title={t('profile.title')} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <HelpHeader title={t('profile.title')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <Text style={styles.hint}>{t('profile.updateHint')}</Text>
          </View>

          <Text style={styles.label}>{t('profile.name')}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.namePlaceholderShort')}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <Text style={styles.label}>{t('profile.email')}</Text>
          <View style={[styles.inputContainer, styles.inputDisabled]}>
            <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={[styles.input, styles.disabledText]}
              value={user.email}
              editable={false}
            />
            <Ionicons name="lock-closed" size={16} color={Colors.textLight} />
          </View>
          <Text style={styles.fieldHint}>{t('profile.emailLocked')}</Text>

          <Text style={styles.label}>{t('profile.phone')}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('profile.phonePlaceholder')}
              placeholderTextColor={Colors.textLight}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>{t('profile.saveChanges')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  hint: {
    fontSize: 14,
    color: Colors.textLight,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F1FB',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
  },
  disabledText: {
    color: Colors.textLight,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Shadows.medium,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});