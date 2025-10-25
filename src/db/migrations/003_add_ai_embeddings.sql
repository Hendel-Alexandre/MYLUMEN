-- Add AI embeddings table for context-aware responses

CREATE TABLE IF NOT EXISTS lumen_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK(content_type IN ('invoice', 'quote', 'client', 'receipt', 'contract')),
  content_id INTEGER NOT NULL,
  content_text TEXT NOT NULL,
  embedding_vector TEXT, -- JSON array of floats
  metadata TEXT, -- JSON object with additional context
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_personality_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  tone TEXT NOT NULL DEFAULT 'friendly' CHECK(tone IN ('formal', 'friendly', 'analytical')),
  verbosity INTEGER NOT NULL DEFAULT 5 CHECK(verbosity BETWEEN 1 AND 10),
  focus_areas TEXT, -- JSON array of focus areas
  custom_instructions TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_embeddings_user ON lumen_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_type ON lumen_embeddings(content_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_content ON lumen_embeddings(content_id);
