export const DELIVERY_CONFIG = {
  city: 'Zirakpur',
  allowedCities: ['zirakpur'],
  allowedPincodes: ['140603', '140604'],
  errorMessage: 'Sorry, we currently deliver only in Zirakpur (PIN codes 140603, 140604).',
};

/**
 * Validates if the given city and postal code are allowed for delivery in Zirakpur.
 * @param city - The city name
 * @param postalCode - The 6-digit postal code
 * @returns true if delivery is allowed, false otherwise
 */
export const isDeliveryAllowed = (city?: string, postalCode?: string): boolean => {
  const normCity = String(city || '').trim().toLowerCase();
  const normPin = String(postalCode || '').trim().replace(/\s+/g, '');

  if (!normCity && !normPin) return false;

  const cityMatches = DELIVERY_CONFIG.allowedCities.includes(normCity);
  const pinMatches = DELIVERY_CONFIG.allowedPincodes.includes(normPin);

  if (normCity && normPin) {
    return cityMatches && pinMatches;
  }

  return cityMatches || pinMatches;
};

export const validateDeliveryLocation = (city?: string, postalCode?: string) => {
  if (!isDeliveryAllowed(city, postalCode)) {
    return {
      allowed: false,
      message: DELIVERY_CONFIG.errorMessage,
    };
  }
  return { allowed: true };
};
