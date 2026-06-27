import { API_URL, isTunnelApi, resolveMediaUrl } from '../config/api';
import type {
  AppBanner,
  AppBannersResponse,
  CartItem,
  CategoriesResponse,
  Order,
  OrdersResponse,
  PaymentPreference,
  Product,
  ProductsResponse,
  SavedAddress,
  User,
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

const REQUEST_TIMEOUT_MS = 12000;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (isTunnelApi()) {
    headers['Bypass-Tunnel-Reminder'] = 'true';
  }

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    throw new Error(
      isTimeout
        ? `Server timeout (${API_URL}). Backend chal raha hai? npm run start:tunnel dubara try karo.`
        : `Cannot connect to ${API_URL}. Backend running hona chahiye.`,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await response.text();
  let data: { message?: string } = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      response.ok
        ? 'Invalid response from server'
        : `Request failed: ${response.status}`,
    );
  }

  if (!response.ok) {
    if (response.status === 503 && isTunnelApi()) {
      throw new Error(
        `API tunnel band ho gaya (${API_URL}). Terminal mein "npm run start:tunnel" chalao, ya same WiFi pe "npm run start:phone".`,
      );
    }
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data as T;
}

const getProductId = (product: CartItem['product']) =>
  typeof product === 'string' ? product : product._id;

export const getAppBanners = () =>
  request<AppBannersResponse>('/app/banners');

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

export const getRelatedProducts = async (category: string, excludeId: string, limit = 8) => {
  const res = await getProducts({ category, limit: limit + 4, sort: 'Popular' });
  return (res.products || []).filter((p) => p._id !== excludeId).slice(0, limit);
};

// Auth
export const login = (data: { email: string; password: string }) =>
  request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const register = (data: { name: string; email: string; password: string }) =>
  request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const getProfile = (token: string) =>
  request<User>('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });

export const updateProfile = (
  data: { name?: string; phone?: string; paymentPreference?: PaymentPreference },
  token: string,
) =>
  request<User>('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const updateAddresses = (addresses: SavedAddress[], token: string) =>
  request<{ success: boolean; addresses: SavedAddress[] }>('/auth/addresses', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ addresses }),
  });

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

export const getProductReviews = (productId: string, token?: string | null) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return request<any>(`/products/${productId}/reviews`, { headers });
};

export const addProductReview = (
  productId: string,
  rating: number,
  comment: string,
  token: string,
  images: string[] = [],
) =>
  request<any>(`/products/${productId}/reviews`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment, images }),
  });

export type CallbackRequestPayload = {
  name: string;
  email?: string;
  phone: string;
  preferredTime?: string;
  note?: string;
};

export type ChatSupportPayload = {
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  chatSummary: string;
};

export const submitCallbackRequest = (
  data: CallbackRequestPayload & { chatSummary?: string; source?: string },
  token?: string | null,
) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return request<{ success: boolean; request: Record<string, unknown> }>('/support/callback', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

export const submitChatSupportRequest = (
  data: ChatSupportPayload,
  token?: string | null,
) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return request<{ success: boolean; request: Record<string, unknown> }>('/support/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

export const uploadReviewImage = async (uri: string, token: string): Promise<string> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'review.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  const uploadHeaders: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (isTunnelApi()) uploadHeaders['Bypass-Tunnel-Reminder'] = 'true';

  const response = await fetch(`${API_URL}/upload/review`, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData,
  });

  const raw = await response.text();
  let data: { success?: boolean; url?: string; message?: string } = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Invalid upload response');
  }

  if (!response.ok || !data.url) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data.url;
};