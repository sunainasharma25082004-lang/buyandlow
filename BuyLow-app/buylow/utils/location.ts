import * as Location from 'expo-location';
import { Platform } from 'react-native';

export type GeocodedAddress = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

const buildAddressLine = (...parts: Array<string | null | undefined>) =>
  parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

async function reverseGeocodeWeb(lat: number, lon: number): Promise<GeocodedAddress> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Could not fetch address for your location');
  }

  const data = await response.json();
  const parts = data.address || {};

  const streetLine = buildAddressLine(
    parts.house_number,
    parts.road || parts.pedestrian,
    parts.neighbourhood || parts.suburb,
  );

  return {
    address: streetLine || String(data.display_name || '').split(',').slice(0, 3).join(', '),
    city: parts.city || parts.town || parts.village || parts.state_district || parts.county || '',
    postalCode: parts.postcode || '',
    country: parts.country || 'India',
  };
}

async function reverseGeocodeNative(lat: number, lon: number): Promise<GeocodedAddress> {
  const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
  const place = results[0];

  if (!place) {
    throw new Error('Could not read address from your location');
  }

  const streetLine = buildAddressLine(
    place.name,
    place.street,
    place.streetNumber,
    place.district,
  );

  return {
    address: streetLine || place.formattedAddress || '',
    city: place.city || place.subregion || place.region || '',
    postalCode: place.postalCode || '',
    country: place.country || 'India',
  };
}

function getWebPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not supported on this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        reject(new Error('Location permission denied. Please allow location access.'));
        return;
      }
      reject(new Error(error.message || 'Could not get your current location'));
    }, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000,
    });
  });
}

export async function fetchCurrentAddress(): Promise<GeocodedAddress> {
  if (Platform.OS === 'web') {
    const position = await getWebPosition();
    return reverseGeocodeWeb(position.coords.latitude, position.coords.longitude);
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is required to use your live address');
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('Please turn on location/GPS on your device');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return reverseGeocodeNative(position.coords.latitude, position.coords.longitude);
}