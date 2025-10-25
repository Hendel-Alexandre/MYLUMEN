-- Add onboarding progress tracking

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT, -- JSON array of completed step ids
  personal_info_completed INTEGER NOT NULL DEFAULT 0,
  business_info_completed INTEGER NOT NULL DEFAULT 0,
  branding_completed INTEGER NOT NULL DEFAULT 0,
  first_client_added INTEGER NOT NULL DEFAULT 0,
  first_invoice_created INTEGER NOT NULL DEFAULT 0,
  setup_complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, item_key)
);

CREATE INDEX IF NOT EXISTS idx_checklist_user ON checklist_items(user_id);
