import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { fetchCurrentAddress, type GeocodedAddress } from '../utils/location';
import { useLanguage } from '../context/LanguageContext';

export const CURRENT_LOCATION_ID = 'current-location';

type Props = {
  selected?: boolean;
  onSelect: (location: GeocodedAddress) => void;
  preview?: Pick<GeocodedAddress, 'address' | 'city' | 'postalCode'> | null;
  compact?: boolean;
};

export default function LocationSelectCard({
  selected = false,
  onSelect,
  preview,
  compact = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handlePress = async () => {
    setLoading(true);
    try {
      const resolved = await fetchCurrentAddress();
      if (!resolved.address && !resolved.city) {
        throw new Error(t('addresses.addressNotFound'));
      }
      onSelect(resolved);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('addresses.couldNotGetLocation');
      Alert.alert(t('addresses.locationFailed'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        compact ? styles.chip : styles.card,
        selected && styles.active,
        loading && styles.loading,
      ]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact]}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="navigate" size={compact ? 18 : 22} color={Colors.primary} />
        )}
      </View>

      <View style={[styles.textWrap, compact && styles.textWrapCompact]}>
        <Text style={styles.title}>{t('location.currentLocation')}</Text>
        <Text style={styles.subtitle}>
          {loading ? t('location.detecting') : t('addresses.selectLiveLocation')}
        </Text>
        {preview && (preview.address || preview.city) ? (
          <Text style={styles.preview} numberOfLines={2}>
            {preview.address || preview.city}
            {preview.postalCode ? ` · ${preview.postalCode}` : ''}
          </Text>
        ) : null}
      </View>

      {selected && !loading ? (
        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    minHeight: 118,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    ...Shadows.small,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  active: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBlue,
  },
  loading: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapCompact: {
    marginBottom: 0,
  },
  textWrap: {
    flex: 1,
  },
  textWrapCompact: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 3,
    lineHeight: 15,
  },
  preview: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 15,
  },
});