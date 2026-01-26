export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
}

// Helper to calculate discounted price
export function getDiscountedPrice(product: Product): number {
  if (!product.discountType || !product.discountValue) return product.price;
  
  if (product.discountType === 'percentage') {
    return Math.round(product.price * (1 - product.discountValue / 100));
  }
  return Math.max(0, product.price - product.discountValue);
}

export function getDiscountAmount(product: Product): number {
  return product.price - getDiscountedPrice(product);
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  customer?: Customer;
  total: number;
  totalDiscount: number;
  amountPaid: number;
  change: number;
  date: Date;
  paymentMethod: 'cash' | 'transfer';
}

export type ThemeTone = 'green' | 'blue' | 'purple' | 'orange' | 'rose';

export interface StoreSettings {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  themeTone: ThemeTone;
  backgroundImage?: string;
  storeLogo?: string;
}
