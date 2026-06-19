const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const validateRegisterInput = ({ name, email, password }) => {
  if (!name || String(name).trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return 'A valid email address is required';
  }
  if (!password || String(password).length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const validateLoginInput = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return 'A valid email address is required';
  }
  if (!password) {
    return 'Password is required';
  }
  return null;
};

export const validateShippingAddress = (address) => {
  if (!address) return 'Shipping address is required';
  const { address: street, city, postalCode, country, phone } = address;
  if (!street?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim() || !phone?.trim()) {
    return 'All shipping fields are required';
  }
  if (!/^\d{6,15}$/.test(String(phone).replace(/[\s\-+]/g, ''))) {
    return 'A valid phone number is required';
  }
  return null;
};

export const validateOrderItems = (orderItems) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return 'Order must contain at least one item';
  }
  for (const item of orderItems) {
    if (!item.name || item.price == null || !item.quantity || item.quantity < 1) {
      return 'Each order item must have name, price, and quantity';
    }
    if (Number(item.price) < 0) {
      return 'Invalid item price';
    }
  }
  return null;
};

export const clampPagination = (page, limit, maxLimit = 50) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(Math.max(1, Number(limit) || 8), maxLimit);
  return { page: safePage, limit: safeLimit };
};