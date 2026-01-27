-- Migration: Allow product_id to be NULL in transaction_items
-- This allows products to be deleted while keeping the transaction record (with product_id set to NULL)

-- 1. Create new table without NOT NULL constraint on product_id
CREATE TABLE transaction_items_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  product_id TEXT, -- Changed: Removed NOT NULL
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
  discount_value INTEGER CHECK(discount_value >= 0 OR discount_value IS NULL),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 2. Copy data from old table to new table
INSERT INTO transaction_items_new (id, transaction_id, product_id, product_name, quantity, price, discount_type, discount_value, created_at)
SELECT id, transaction_id, product_id, product_name, quantity, price, discount_type, discount_value, created_at FROM transaction_items;

-- 3. Drop old table
DROP TABLE transaction_items;

-- 4. Rename new table to original name
ALTER TABLE transaction_items_new RENAME TO transaction_items;

-- 5. Re-create index
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
