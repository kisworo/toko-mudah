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
}
