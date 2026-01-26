-- Migration: Add user_id to all tables for multi-user support
-- This migration adds user isolation for all data

-- Add user_id to categories (updated_at already exists)
ALTER TABLE categories ADD COLUMN user_id TEXT;

-- Add user_id to products (updated_at already exists)
ALTER TABLE products ADD COLUMN user_id TEXT;

-- Add user_id to customers (updated_at already exists)
ALTER TABLE customers ADD COLUMN user_id TEXT;

-- Add user_id to transactions
ALTER TABLE transactions ADD COLUMN user_id TEXT;

-- Recreate store_settings as per-user table
-- First backup existing settings
CREATE TABLE IF NOT EXISTS store_settings_backup AS SELECT * FROM store_settings;

-- Drop old table
DROP TABLE store_settings;

-- Create new per-user settings table
CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL DEFAULT 'Toko Mudah',
  store_address TEXT,
  store_phone TEXT,
  theme_tone TEXT NOT NULL DEFAULT 'green' CHECK(theme_tone IN ('green', 'blue', 'purple', 'orange', 'rose')),
  background_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate existing settings to demo user
INSERT INTO store_settings (user_id, store_name, store_address, store_phone, theme_tone, background_image)
SELECT 'demo-user-id', store_name, store_address, store_phone, theme_tone, background_image
FROM store_settings_backup
WHERE store_settings_backup.id = 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_settings_user_id ON store_settings(user_id);

-- Assign existing data to demo user
UPDATE categories SET user_id = 'demo-user-id' WHERE user_id IS NULL;
UPDATE products SET user_id = 'demo-user-id' WHERE user_id IS NULL;
UPDATE customers SET user_id = 'demo-user-id' WHERE user_id IS NULL;
UPDATE transactions SET user_id = 'demo-user-id' WHERE user_id IS NULL;
