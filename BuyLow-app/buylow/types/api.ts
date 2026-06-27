export type Category = {
  _id: string;
  name: string;
  title?: string;
  image: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  showOnHome?: boolean;
  productCount?: number;
  displayName?: string;
};

export type Product = {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  rating?: number;
  reviews?: number;
  image: string;
  images?: string[];
  badge?: string | null;
  category: string;
  brand?: string;
  description?: string;
};

export type SavedAddress = {
  _id?: string;
  label: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export type PaymentPreference = 'razorpay' | 'cod';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  phone?: string;
  addresses?: SavedAddress[];
  paymentPreference?: PaymentPreference;
  cart?: CartItem[];
  wishlist?: Product[] | string[];
};

export type CartItem = {
  product: Product | string; // Can be populated or just ID
  quantity: number;
  color?: string;
  _id?: string;
};

export type Order = {
  _id: string;
  user: string | User;
  orderItems: {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
    _id?: string;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: string;
  expectedDeliveryDate?: string;
  deliveryNote?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  _id: string;
  user: string | User;
  product: string;
  rating: number;
  comment: string;
  images?: string[];
  userName: string;
  createdAt: string;
};

export type AppBanner = {
  _id: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  route: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type AppBannersResponse = {
  success: boolean;
  banners: AppBanner[];
};

export type CategoriesResponse = {
  success: boolean;
  categories: Category[];
};

export type ProductsResponse = {
  success: boolean;
  products: Product[];
  page: number;
  pages: number;
  total: number;
};

export type AuthResponse = {
  success: boolean;
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  cart: CartItem[];
  message?: string;
};

export type ProductDetailResponse = {
  success: boolean;
  product: Product;
};

export type OrderResponse = {
  success: boolean;
  order: Order;
  razorpayOrderId?: string;
  amount?: number;
  key_id?: string;
};

export type OrdersResponse = {
  success: boolean;
  orders: Order[];
};