export interface User {
  email: string;
  full_name: string;
  role: "user" | "merchant" | "admin";
}

export interface UserCreate extends User {
  password: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  password?: string;
}

// Auth types
export interface Token {
  access_token: string;
  token_type: string;
}

// Merchant types
export interface Merchant {
  _id: string;
  business_name: string;
  business_description?: string;
  contact_email: string;
  contact_phone?: string;
  user_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MerchantCreate {
  business_name: string;
  business_description?: string;
  contact_email: string;
  contact_phone?: string;
}

export interface MerchantUpdate {
  business_name?: string;
  business_description?: string;
  contact_email?: string;
  contact_phone?: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
}

export interface CategoryTree extends Category {
  subcategories: CategoryTree[];
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  stock_quantity: number;
  images: string[];
  merchant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  related_products?: Product[];
  average_rating?: number;
  review_count?: number;
}

export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  category_id: string;
  stock_quantity?: number;
  images?: string[];
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  stock_quantity?: number;
  images?: string[];
  is_active?: boolean;
}

// Order types
export interface OrderItemBase {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

export interface OrderCreate {
  items: OrderItemBase[];
  total_amount: number;
  shipping_address: string;
  contact_phone: string;
}

export interface Order {
  _id: string;
  items: OrderItemBase[];
  total_amount: number;
  shipping_address: string;
  contact_phone: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  merchant_name: string;
}

export interface OrderUpdate {
  status?: string;
  shipping_address?: string;
  contact_phone?: string;
}

// Cart types (client-side only)
export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
