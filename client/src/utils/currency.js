/** Indian Rupee formatting & shop thresholds */
export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_FEE = 49;

export function formatINR(amount, { decimals = 2 } = {}) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatINRPlain(amount, { decimals = 2 } = {}) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}