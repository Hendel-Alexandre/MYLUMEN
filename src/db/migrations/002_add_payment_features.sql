-- Add multi-currency and discount code tables

CREATE TABLE IF NOT EXISTS discount_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  min_amount REAL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_widgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  success_url TEXT,
  cancel_url TEXT,
  embed_code TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(base_currency, target_currency)
);

-- Add discount_code_id to invoices
ALTER TABLE invoices ADD COLUMN discount_code_id INTEGER REFERENCES discount_codes(id);
ALTER TABLE invoices ADD COLUMN discount_amount REAL DEFAULT 0;

-- Add currency exchange tracking
ALTER TABLE invoices ADD COLUMN exchange_rate REAL DEFAULT 1.0;
ALTER TABLE invoices ADD COLUMN original_currency TEXT;

CREATE INDEX IF NOT EXISTS idx_discount_codes_user ON discount_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_payment_widgets_user ON payment_widgets(user_id);
