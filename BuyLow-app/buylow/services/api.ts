import { API_URL, resolveMediaUrl } from '../config/api';
import type {
  CartItem,
  CategoriesResponse,
  Order,
  OrdersResponse,
  Product,
  ProductsResponse,
} from '../types/api';

export { resolveMediaUrl };

type ProductQuery = {
  keyword?: string;
  category?: string;
  sale?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
};

const buildQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data as T;
}

const getProductId = (product: CartItem['product']) =>
  typeof product === 'string' ? product : product._id;

export const getCategories = (homeOnly = false) =>
  request<CategoriesResponse>(`/categories${buildQuery({ home: homeOnly ? true : undefined })}`);

export const getProducts = (params: ProductQuery = {}) =>
  request<ProductsResponse>(`/products${buildQuery({
    keyword: params.keyword,
    category: params.category,
    sale: params.sale ? true : undefined,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
  })}`);

export const getProduct = async (id: string): Promise<Product> => {
  const data = await request<Product | { product: Product }>(`/products/${id}`);
  if (data && typeof data === 'object' && 'product' in data && data.product) {
    return data.product;
  }
  return data as Product;
};

export const getSaleProducts = (limit = 10) =>
  getProducts({ sale: true, limit, sort: 'Popular' });

// Auth
export const login = (data: { email: string; password: string }) =>
  request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const register = (data: { name: string; email: string; password: string }) =>
  request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const getProfile = (token: string) =>
  request<any>('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });

// Cart
export const syncCart = (cart: CartItem[], token: string) => {
  const formattedCart = cart.map((item) => ({
    product: getProductId(item.product),
    quantity: item.quantity,
    color: item.color,
  }));

  return request<CartItem[]>('/auth/cart', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ cart: formattedCart }),
  });
};

// Orders
export const createOrder = (orderData: Record<string, unknown>, token: string) =>
  request<any>('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(orderData),
  });

export const verifyPayment = (paymentData: Record<string, unknown>, token: string) =>
  request<any>('/orders/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(paymentData),
  });

export const getMyOrders = async (token: string): Promise<OrdersResponse> => {
  const data = await request<Order[] | OrdersResponse>('/orders/myorders', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (Array.isArray(data)) {
    return { success: true, orders: data };
  }

  return data as OrdersResponse;
};

export const formatINR = (amount: number) =>
  Number(amount).toLocaleString('en-IN');

export const getDiscountPercent = (price: number, oldPrice?: number | null) => {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

export const getOrderStatus = (order: Order) => {
  if (order.orderStatus) return order.orderStatus;
  if (order.isDelivered) return 'delivered';
  if (order.isPaid) return 'confirmed';
  return 'placed';
};

export const syncWishlist = (wishlist: string[], token: string) =>
  request<any>('/auth/wishlist', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ wishlist }),
  });