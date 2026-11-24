CREATE TABLE IF NOT EXISTS report_deliveries (
  report_key TEXT PRIMARY KEY,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('weekly','monthly')),
  status TEXT NOT NULL CHECK(status IN ('sending','sent','error')),
  created_at TEXT NOT NULL,
  sent_at TEXT,
  email_message_id TEXT,
  error_code TEXT
);
CREATE INDEX IF NOT EXISTS idx_report_deliveries_status ON report_deliveries(status);
