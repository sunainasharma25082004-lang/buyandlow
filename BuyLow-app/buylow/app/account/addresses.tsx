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
import { Colors, Shadows } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import HelpHeader from '../../components/HelpHeader';
import LocationSelectCard from '../../components/LocationSelectCard';
import type { GeocodedAddress } from '../../utils/location';
import type { SavedAddress } from '../../types/api';



const emptyForm = (): SavedAddress => ({
  label: 'Home',
  address: '',
  city: '',
  postalCode: '',
  country: 'India',
  phone: '',
  isDefault: false,
});

export default function AddressesScreen() {
  const router = useRouter();
  const { user, loading, saveAddresses } = useAuth();
  const { t } = useLanguage();
  const LABELS = [t('addresses.labelHome'), t('addresses.labelWork'), t('addresses.labelOther')];
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SavedAddress>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [locationPreview, setLocationPreview] = useState<GeocodedAddress | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    setAddresses(user?.addresses || []);
  }, [user?.addresses]);

  const fillFormFromLocation = (loc: GeocodedAddress) => {
    setLocationSelected(true);
    setLocationPreview(loc);
    setForm((prev) => ({
      ...prev,
      address: loc.address || prev.address,
      city: loc.city || prev.city,
      postalCode: loc.postalCode || prev.postalCode,
      country: loc.country || prev.country,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setLocationSelected(false);
    setLocationPreview(null);
    setForm({
      ...emptyForm(),
      label: t('addresses.labelHome'),
      isDefault: addresses.length === 0,
      phone: user?.phone || '',
    });
    setShowForm(true);
  };

  const openEditForm = (addr: SavedAddress) => {
    setEditingId(addr._id || null);
    setLocationSelected(false);
    setLocationPreview(null);
    setForm({ ...addr });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setLocationSelected(false);
    setLocationPreview(null);
    setForm(emptyForm());
  };

  const persistAddresses = async (next: SavedAddress[]) => {
    setSaving(true);
    try {
      const saved = await saveAddresses(next);
      setAddresses(saved);
      return saved;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('addresses.saveFailed');
      Alert.alert(t('common.error'), message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveForm = async () => {
    const digits = form.phone.replace(/\D/g, '');
    if (!form.address.trim() || !form.city.trim() || !form.postalCode.trim()) {
      Alert.alert(t('common.error'), t('addresses.missingDetails'));
      return;
    }
    if (digits.length < 10) {
      Alert.alert(t('common.error'), t('profile.invalidPhone'));
      return;
    }

    const entry: SavedAddress = {
      ...form,
      address: form.address.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      phone: digits,
      country: form.country || 'India',
    };

    let next = [...addresses];

    if (editingId) {
      next = next.map((item) => (item._id === editingId ? { ...entry, _id: editingId } : item));
    } else {
      next.push({ ...entry, _id: `local_${Date.now()}` });
    }

    if (entry.isDefault) {
      next = next.map((item) => ({
        ...item,
        isDefault: item._id === (editingId || next[next.length - 1]._id),
      }));
    } else if (!next.some((item) => item.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }

    try {
      await persistAddresses(next);
      closeForm();
      Alert.alert(t('common.success'), editingId ? t('addresses.addressUpdated') : t('addresses.addressAdded'));
    } catch {
      // error shown in persistAddresses
    }
  };

  const handleDelete = (addr: SavedAddress) => {
    Alert.alert(t('addresses.deleteTitle'), t('addresses.removeConfirm', { label: addr.label }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          let next = addresses.filter((item) => item._id !== addr._id);
          if (addr.isDefault && next.length > 0) {
            next = next.map((item, index) => ({ ...item, isDefault: index === 0 }));
          }
          try {
            await persistAddresses(next);
          } catch {
            // handled
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (addr: SavedAddress) => {
    const next = addresses.map((item) => ({
      ...item,
      isDefault: item._id === addr._id,
    }));
    try {
      await persistAddresses(next);
    } catch {
      // handled
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <HelpHeader title={t('addresses.title')} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <HelpHeader title={t('addresses.title')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!showForm && (
            <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
              <Ionicons name="add-circle" size={22} color={Colors.white} />
              <Text style={styles.addButtonText}>{t('addresses.addNew')}</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingId ? t('addresses.editAddress') : t('addresses.newAddress')}</Text>

              <Text style={styles.chooseHint}>{t('addresses.chooseLocationHint')}</Text>
              <LocationSelectCard
                compact
                selected={locationSelected}
                preview={locationPreview}
                onSelect={fillFormFromLocation}
              />

              <Text style={styles.label}>{t('addresses.label')}</Text>
              <View style={styles.labelRow}>
                {LABELS.map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.labelChip, form.label === label && styles.labelChipActive]}
                    onPress={() => setForm({ ...form, label })}
                  >
                    <Text style={[styles.labelChipText, form.label === label && styles.labelChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t('checkout.fullAddress')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={form.address}
                  onChangeText={(v) => setForm({ ...form, address: v })}
                  placeholder={t('checkout.addressPlaceholder')}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>{t('checkout.city')}</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={form.city}
                      onChangeText={(v) => setForm({ ...form, city: v })}
                      placeholder={t('checkout.cityPlaceholder')}
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>{t('checkout.pinCode')}</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={form.postalCode}
                      onChangeText={(v) => setForm({ ...form, postalCode: v })}
                      placeholder="110001"
                      keyboardType="numeric"
                      maxLength={6}
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.label}>{t('common.phone')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(v) => setForm({ ...form, phone: v })}
                  placeholder={t('checkout.phonePlaceholder')}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <TouchableOpacity
                style={styles.defaultToggle}
                onPress={() => setForm({ ...form, isDefault: !form.isDefault })}
              >
                <Ionicons
                  name={form.isDefault ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={Colors.primary}
                />
                <Text style={styles.defaultToggleText}>{t('addresses.setDefaultDelivery')}</Text>
              </TouchableOpacity>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                  <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveForm} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>{t('addresses.saveAddress')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {addresses.length === 0 && !showForm ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>{t('addresses.noAddresses')}</Text>
              <Text style={styles.emptyDesc}>{t('addresses.emptyDesc')}</Text>
            </View>
          ) : (
            addresses.map((addr) => (
              <View key={addr._id || addr.address} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressLabelRow}>
                    <Ionicons name="location" size={18} color={Colors.primary} />
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>{t('common.default')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity onPress={() => openEditForm(addr)} hitSlop={8}>
                      <Ionicons name="create-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(addr)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addressText}>{addr.address}</Text>
                <Text style={styles.addressMeta}>
                  {addr.city}, {addr.postalCode} · {addr.country}
                </Text>
                <Text style={styles.addressMeta}>+91 {addr.phone}</Text>
                {!addr.isDefault && (
                  <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(addr)}>
                    <Text style={styles.setDefaultText}>{t('addresses.setDefault')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
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
    padding: 16,
    paddingBottom: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    ...Shadows.medium,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  chooseHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 17,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  labelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  labelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labelChipActive: {
    backgroundColor: Colors.lightBlue,
    borderColor: Colors.primary,
  },
  labelChipText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
  },
  labelChipTextActive: {
    color: Colors.primary,
  },
  inputContainer: {
    backgroundColor: '#E8F1FB',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  defaultToggleText: {
    fontSize: 14,
    color: Colors.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  defaultBadge: {
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 14,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  addressMeta: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  setDefaultBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});