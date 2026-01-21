import { useState, useCallback } from 'react';
import { Product, CartItem, Transaction, Customer, Category, getDiscountedPrice, getDiscountAmount } from '@/types';

// Demo categories
const initialCategories: Category[] = [
  { id: '1', name: 'Makanan', color: '#22c55e' },
  { id: '2', name: 'Minuman', color: '#3b82f6' },
  { id: '3', name: 'Snack', color: '#f59e0b' },
  { id: '4', name: 'Lainnya', color: '#6b7280' },
];

// Demo products
const initialProducts: Product[] = [
  { id: '1', name: 'Kopi Hitam', price: 5000, stock: 100, category: 'Minuman' },
  { id: '2', name: 'Kopi Susu', price: 8000, stock: 50, category: 'Minuman', discountType: 'percentage', discountValue: 10 },
  { id: '3', name: 'Es Teh Manis', price: 4000, stock: 80, category: 'Minuman' },
  { id: '4', name: 'Nasi Goreng', price: 15000, stock: 30, category: 'Makanan', discountType: 'fixed', discountValue: 2000 },
  { id: '5', name: 'Mie Goreng', price: 12000, stock: 25, category: 'Makanan' },
  { id: '6', name: 'Roti Bakar', price: 10000, stock: 20, category: 'Makanan' },
  { id: '7', name: 'Gorengan', price: 2000, stock: 50, category: 'Snack' },
  { id: '8', name: 'Keripik', price: 5000, stock: 40, category: 'Snack', discountType: 'percentage', discountValue: 20 },
];

// Demo customers
const initialCustomers: Customer[] = [
  { id: '1', name: 'Budi Santoso', phone: '081234567890' },
  { id: '2', name: 'Siti Rahayu', phone: '082345678901' },
  { id: '3', name: 'Ahmad Wijaya', phone: '083456789012' },
];

export function useStore() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Category management
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  }, []);

  const findCustomers = useCallback((query: string) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query)
    );
  }, [customers]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (getDiscountedPrice(item) * item.quantity), 0);
  }, [cart]);

  const getCartTotalDiscount = useCallback(() => {
    return cart.reduce((total, item) => total + (getDiscountAmount(item) * item.quantity), 0);
  }, [cart]);

  const checkout = useCallback((
    customer?: Customer, 
    paymentMethod: 'cash' | 'transfer' = 'cash',
    amountPaid?: number
  ) => {
    const total = getCartTotal();
    const totalDiscount = getCartTotalDiscount();
    const transaction: Transaction = {
      id: Date.now().toString(),
      items: [...cart],
      customer,
      total,
      totalDiscount,
      amountPaid: amountPaid || total,
      change: (amountPaid || total) - total,
      date: new Date(),
      paymentMethod,
    };
    setTransactions(prev => [transaction, ...prev]);
    
    // Update stock
    cart.forEach(item => {
      updateProduct(item.id, { stock: item.stock - item.quantity });
    });
    
    clearCart();
    return transaction;
  }, [cart, getCartTotal, getCartTotalDiscount, updateProduct, clearCart]);

  return {
    products,
    categories,
    customers,
    cart,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addCustomer,
    findCustomers,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartTotalDiscount,
    checkout,
  };
}
