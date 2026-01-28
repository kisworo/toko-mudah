import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { Product, Category, Customer, CartItem, Transaction, getDiscountedPrice, getDiscountAmount } from '@/types';

// Convert API Product to local Product format
const convertApiProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  stock: p.stock,
  category: p.category,
  image: p.image,
  discountType: p.discount_type,
  discountValue: p.discount_value,
});

// Convert API Category to local Category format
const convertApiCategory = (c: any): Category => ({
  id: c.id,
  name: c.name,
  color: c.color,
});

// Convert API Customer to local Customer format
const convertApiCustomer = (c: any): Customer => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
});

// Convert API Transaction to local Transaction format
const convertApiTransaction = (t: any, cartItems?: CartItem[]): Transaction => {
  // Jika items tidak ada dari API tapi cartItems diberikan, gunakan cartItems
  const items = t.items && Array.isArray(t.items) && t.items.length > 0
    ? t.items.map((item: any) => ({
        id: item.product_id || item.id,
        name: item.product_name || item.name,
        price: item.price,
        quantity: item.quantity,
        stock: 0,
        category: '',
        discountType: item.discount_type,
        discountValue: item.discount_value,
      }))
    : (cartItems || []);

  return {
    id: t.id,
    items,
    customer: t.customer ? {
      id: t.customer.id,
      name: t.customer.name || 'Unknown',
      phone: t.customer.phone,
    } : undefined,
    total: t.total,
    totalDiscount: t.total_discount,
    amountPaid: t.amount_paid,
    change: t.change_amount,
    date: new Date(t.date),
    paymentMethod: t.payment_method,
  };
};

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial data - only if authenticated
  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated before fetching
      if (!api.isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const [productsData, categoriesData, customersData, transactionsData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getCustomers(),
          api.getTransactions(),
        ]);

        setProducts(productsData.map(convertApiProduct));
        setCategories(categoriesData.map(convertApiCategory));
        setCustomers(customersData.map(convertApiCustomer));
        setTransactions(transactionsData.map(t => convertApiTransaction(t)));
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Category management
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const result = await api.createCategory(category);
      const newCategory = convertApiCategory(result);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      console.error('Error adding category:', error.message);
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      const result = await api.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? convertApiCategory(result) : c));
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      throw error;
    }
  }, []);

  // Product management
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
      const apiProduct = {
        ...product,
        discount_type: product.discountType,
        discount_value: product.discountValue,
      };
      const result = await api.createProduct(apiProduct);
      setProducts(prev => [...prev, convertApiProduct(result)]);
    } catch (error: any) {
      console.error('Error adding product:', error.message);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const apiProduct = {
        ...updates,
        discount_type: updates.discountType,
        discount_value: updates.discountValue,
      };
      const result = await api.updateProduct(id, apiProduct);
      setProducts(prev => prev.map(p => p.id === id ? convertApiProduct(result) : p));
    } catch (error: any) {
      console.error('Error updating product:', error.message);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      throw error;
    }
  }, []);

  // Customer management
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    try {
      const result = await api.createCustomer(customer);
      const newCustomer = convertApiCustomer(result);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error: any) {
      console.error('Error adding customer:', error.message);
      throw error;
    }
  }, []);

  const findCustomers = useCallback(async (query: string) => {
    try {
      const results = await api.getCustomers(query);
      return results.map(convertApiCustomer);
    } catch (error: any) {
      console.error('Error finding customers:', error.message);
      return [];
    }
  }, []);

  // Cart management (local state)
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

  // Checkout - creates transaction via API
  const checkout = useCallback(async (
    customer?: Customer,
    paymentMethod: 'cash' | 'transfer' = 'cash',
    amountPaid?: number
  ) => {
    try {
      const total = getCartTotal();
      const totalDiscount = getCartTotalDiscount();

      const transactionData = await api.createTransaction({
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount_type: item.discountType,
          discount_value: item.discountValue,
        })),
        customerId: customer?.id,
        total,
        totalDiscount,
        amountPaid: amountPaid || total,
        change: (amountPaid || total) - total,
        paymentMethod,
        date: new Date().toISOString(),
      });

      // Pass cart sebagai fallback jika API tidak return items
      const newTransaction = convertApiTransaction(transactionData, cart);
      setTransactions(prev => [newTransaction, ...prev]);

      // Refresh products to get updated stock
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts.map(convertApiProduct));

      clearCart();
      return newTransaction;
    } catch (error: any) {
      console.error('Error during checkout:', error.message);
      throw error;
    }
  }, [cart, getCartTotal, getCartTotalDiscount, clearCart]);

  return {
    products,
    categories,
    customers,
    cart,
    transactions,
    loading,
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
