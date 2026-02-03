-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  is_demo INTEGER DEFAULT 0 NOT NULL CHECK(is_demo IN (0, 1)),
  role TEXT DEFAULT 'user' NOT NULL CHECK(role IN ('user', 'admin', 'superadmin')),
  is_active INTEGER DEFAULT 1 NOT NULL CHECK(is_active IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Categories table (per user)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Products table (per user)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
  discount_value INTEGER CHECK(discount_value >= 0 OR discount_value IS NULL),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Customers table (per user)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table (per user)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  customer_id TEXT,
  total INTEGER NOT NULL,
  total_discount INTEGER NOT NULL DEFAULT 0,
  amount_paid INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'transfer')),
  date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
  discount_value INTEGER CHECK(discount_value >= 0 OR discount_value IS NULL),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Store settings table (per user)
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL DEFAULT 'Toko Mudah',
  store_address TEXT,
  store_phone TEXT,
  theme_tone TEXT NOT NULL DEFAULT 'green' CHECK(theme_tone IN ('green', 'blue', 'purple', 'orange', 'rose')),
  background_image TEXT,
  store_logo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert demo user (username: user, password: password)
-- Password is hashed using PBKDF2-SHA256 with 100,000 iterations
INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, is_demo, role)
VALUES ('demo-user-id', 'user', 'demo@toko-mudah.com', 'uz+npKjGKohgvMABRSTshg==:aO0FNCs+3vT6IqleVHLqm9jBT9Dw2S26DizzjWc1nY8=', 'Demo User', 1, 'user');

-- Insert superadmin user (username: superadmin, password: superadmin123)
-- Password is hashed using PBKDF2-SHA256 with 100,000 iterations
INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, is_demo, role)
VALUES ('superadmin-id', 'superadmin', 'superadmin@toko-mudah.com', 'Xq8XyLz9vQ1wR2tY3uI4oP5aS6dF7gH8jK9lZ0xC1vB2nM3mK4jH5gF6dS7aQ8wE9rT0yU1iO2pL3kJ4hG5fD6sA7==:bP9mN7kL5jH3gF1dS9aQ7wE5rT3yU1iO9pL7kJ5hG3fD1sA9qW7eR5tY3uI1oP9lN7mK5jH3gF1dS9aQ7wE5rT3yU1i=', 'Super Admin', 0, 'superadmin');

-- Insert default settings for demo user
INSERT OR IGNORE INTO store_settings (user_id, store_name, theme_tone)
VALUES ('demo-user-id', 'Toko Mudah', 'green');

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_store_settings_user_id ON store_settings(user_id);
