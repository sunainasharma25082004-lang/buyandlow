export const DELIVERY_CONFIG = {
  city: 'Zirakpur',
  allowedCities: ['zirakpur'],
  allowedPincodes: ['140603', '140604'],
  errorMessage: 'Sorry, we currently deliver only in Zirakpur (PIN codes 140603, 140604).',
};

/**
 * Validates if the given city and postal code are allowed for delivery in Zirakpur.
 * @param {string} city - The city name
 * @param {string} postalCode - The 6-digit postal code
 * @returns {boolean} - true if delivery is allowed, false otherwise
 */
export const isDeliveryAllowed = (city, postalCode) => {
  const normCity = String(city || '').trim().toLowerCase();
  const normPin = String(postalCode || '').trim().replace(/\s+/g, '');

  if (!normCity && !normPin) return false;

  const cityMatches = DELIVERY_CONFIG.allowedCities.includes(normCity);
  const pinMatches = DELIVERY_CONFIG.allowedPincodes.includes(normPin);

  // If both city and pin are provided, both must be valid Zirakpur locations
  if (normCity && normPin) {
    return cityMatches && pinMatches;
  }

  // If only one is provided
  return cityMatches || pinMatches;
};

export const validateDeliveryLocation = (city, postalCode) => {
  if (!isDeliveryAllowed(city, postalCode)) {
    return {
      allowed: false,
      message: DELIVERY_CONFIG.errorMessage,
    };
  }
  return { allowed: true };
};
