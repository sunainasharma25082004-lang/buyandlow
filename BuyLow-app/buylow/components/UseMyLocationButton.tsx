import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchCurrentAddress, type GeocodedAddress } from '../utils/location';

type Props = {
  onResolved: (address: GeocodedAddress) => void;
  label?: string;
  compact?: boolean;
  style?: ViewStyle;
};

export default function UseMyLocationButton({
  onResolved,
  label = 'Use My Live Location',
  compact = false,
  style,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const resolved = await fetchCurrentAddress();
      if (!resolved.address && !resolved.city) {
        throw new Error('Address not found for this location. Try again or enter manually.');
      }
      onResolved(resolved);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not get your location';
      Alert.alert('Location Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[compact ? styles.compactBtn : styles.btn, style]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Ionicons name="locate" size={compact ? 16 : 18} color={Colors.primary} />
      )}
      <Text style={compact ? styles.compactText : styles.text}>
        {loading ? 'Getting location...' : label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lightBlue,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.lightBlue,
  },
  text: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  compactText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});