export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_FEE = 49;

export const getShippingPrice = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;