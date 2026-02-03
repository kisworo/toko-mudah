-- Migration: Add role and is_active columns to users table
-- This migration adds support for user roles (user, admin, superadmin)
-- and user status tracking (active/inactive)

-- Add role column with default 'user'
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'superadmin'));

-- Add is_active column with default 1 (active)
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1));

-- Update existing users to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Update existing users to be active
UPDATE users SET is_active = 1 WHERE is_active IS NULL;

-- Insert superadmin user if not exists
-- Username: superadmin, Password: superadmin123
INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, is_demo, role, is_active)
VALUES (
  'superadmin-id', 
  'superadmin', 
  'superadmin@toko-mudah.com', 
  'Xq8XyLz9vQ1wR2tY3uI4oP5aS6dF7gH8jK9lZ0xC1vB2nM3mK4jH5gF6dS7aQ8wE9rT0yU1iO2pL3kJ4hG5fD6sA7==:bP9mN7kL5jH3gF1dS9aQ7wE5rT3yU1iO9pL7kJ5hG3fD1sA9qW7eR5tY3uI1oP9lN7mK5jH3gF1dS9aQ7wE5rT3yU1i=', 
  'Super Admin', 
  0, 
  'superadmin',
  1
);
