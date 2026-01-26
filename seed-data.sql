-- Seed categories
INSERT OR IGNORE INTO categories (id, name, color) VALUES
  ('1', 'Makanan', '#22c55e'),
  ('2', 'Minuman', '#3b82f6'),
  ('3', 'Snack', '#f59e0b'),
  ('4', 'Lainnya', '#6b7280');

-- Seed products
INSERT OR IGNORE INTO products (id, name, price, stock, category, discount_type, discount_value) VALUES
  ('1', 'Kopi Hitam', 5000, 100, 'Minuman', NULL, NULL),
  ('2', 'Kopi Susu', 8000, 50, 'Minuman', 'percentage', 10),
  ('3', 'Es Teh Manis', 4000, 80, 'Minuman', NULL, NULL),
  ('4', 'Nasi Goreng', 15000, 30, 'Makanan', 'fixed', 2000),
  ('5', 'Mie Goreng', 12000, 25, 'Makanan', NULL, NULL),
  ('6', 'Roti Bakar', 10000, 20, 'Makanan', NULL, NULL),
  ('7', 'Gorengan', 2000, 50, 'Snack', NULL, NULL),
  ('8', 'Keripik', 5000, 40, 'Snack', 'percentage', 20);

-- Seed customers
INSERT OR IGNORE INTO customers (id, name, phone) VALUES
  ('1', 'Budi Santoso', '081234567890'),
  ('2', 'Siti Rahayu', '082345678901'),
  ('3', 'Ahmad Wijaya', '083456789012');
