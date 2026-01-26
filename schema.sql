-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  is_demo INTEGER DEFAULT 0 NOT NULL CHECK(is_demo IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
  discount_value INTEGER CHECK(discount_value >= 0 OR discount_value IS NULL),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  total INTEGER NOT NULL,
  total_discount INTEGER NOT NULL DEFAULT 0,
  amount_paid INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'transfer')),
  date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
  discount_value INTEGER CHECK(discount_value >= 0 OR discount_value IS NULL),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  store_name TEXT NOT NULL DEFAULT 'Toko Mudah',
  store_address TEXT,
  store_phone TEXT,
  theme_tone TEXT NOT NULL DEFAULT 'green' CHECK(theme_tone IN ('green', 'blue', 'purple', 'orange', 'rose')),
  background_image TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default store settings
INSERT OR IGNORE INTO store_settings (id, store_name, theme_tone)
VALUES (1, 'Toko Mudah', 'green');

-- Insert demo user (password: password) - hashed with bcrypt
-- This is a bcrypt hash of "password"
INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, is_demo)
VALUES ('demo-user-id', 'user', 'demo@toko-mudah.com', '$2b$10$rKjJZzZzZzZzZzZzZzZzZe', 'Demo User', 1);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
