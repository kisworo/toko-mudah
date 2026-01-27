const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
}

export interface Transaction {
  id: string;
  customer?: Customer;
  total: number;
  total_discount: number;
  amount_paid: number;
  change_amount: number;
  payment_method: 'cash' | 'transfer';
  date: string;
  items: TransactionItem[];
}

export interface StoreSettings {
  store_name: string;
  store_address?: string;
  store_phone?: string;
  theme_tone: 'green' | 'blue' | 'purple' | 'orange' | 'rose';
  background_image?: string;
  store_logo?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_demo?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options?: RequestInit, publicEndpoint = false): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Add Authorization header if token exists and not a public endpoint
    if (!publicEndpoint) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' })) as any;
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true); // Public endpoint
  }

  async register(data: {
    email: string;
    password: string;
    businessName?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Public endpoint
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Categories
  getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteCategory(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products');
  }

  createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers
  getCustomers(query?: string): Promise<Customer[]> {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request<Customer[]>(`/api/customers${params}`);
  }

  createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
    return this.request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transactions
  getTransactions(startDate?: string, endDate?: string): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<Transaction[]>(`/api/transactions${queryString}`);
  }

  createTransaction(data: {
    items: TransactionItem[];
    customerId?: string;
    total: number;
    totalDiscount: number;
    amountPaid: number;
    change: number;
    paymentMethod: 'cash' | 'transfer';
    date: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  getSettings(): Promise<StoreSettings> {
    return this.request<StoreSettings>('/api/settings');
  }

  updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    return this.request<StoreSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
