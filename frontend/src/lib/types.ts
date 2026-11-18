export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
  parent?: Category;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description?: string;
  description?: string;
  price: number | string;
  discount_price?: number | string | null;
  effective_price: number;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  rating: number | string;
  reviews_count: number;
  category?: Category;
  images: ProductImage[];
  primary_image?: ProductImage;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discount_price?: number | null;
  effective_price: number;
  stock: number;
  image?: string;
  quantity: number;
  total_price: number;
}

export interface Cart {
  id: number;
  session_id?: string;
  items: CartItem[];
  items_count: number;
  subtotal: number;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number | string;
  min_order_amount: number | string;
  usage_limit?: number | null;
  used_count: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  unit_price: number | string;
  quantity: number;
  total_price: number | string;
  product?: {
    id: number;
    primary_image?: { image_url: string };
  };
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number | string;
  discount_amount: number | string;
  coupon_code?: string | null;
  shipping_cost: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active?: boolean;
  is_super_admin?: boolean;
  roles?: Record<string, string>;
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_system: boolean;
  users_count?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string;
  description?: string;
}

export interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  total_customers: number;
  low_stock_count: number;
  total_revenue: number;
  total_orders: number;
}

export interface SalesChartItem {
  date: string;
  label: string;
  revenue: number;
  orders_count: number;
}

