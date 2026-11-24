-- MNEMORISK analytics v2: selected optional research dimensions.
-- Region codes only; city names, precise locations and URL query strings are not stored.
ALTER TABLE page_views ADD COLUMN device_type TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE page_views ADD COLUMN browser_language TEXT NOT NULL DEFAULT 'und';
ALTER TABLE page_views ADD COLUMN content_language TEXT NOT NULL DEFAULT 'und';
ALTER TABLE page_views ADD COLUMN campaign_source TEXT NOT NULL DEFAULT 'none';
ALTER TABLE page_views ADD COLUMN campaign_medium TEXT NOT NULL DEFAULT 'none';
ALTER TABLE page_views ADD COLUMN campaign_name TEXT NOT NULL DEFAULT 'none';
ALTER TABLE page_views ADD COLUMN region_code TEXT NOT NULL DEFAULT 'ZZ';
ALTER TABLE page_views ADD COLUMN entry_page_path TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE page_views ADD COLUMN scroll_depth INTEGER NOT NULL DEFAULT 0;

-- Events are associated with a page view but cannot directly identify a person.
CREATE TABLE IF NOT EXISTS page_events (
  event_id TEXT PRIMARY KEY,
  view_id TEXT NOT NULL,
  day_utc TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('external', 'download', 'navigation')),
  target TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_page_events_day ON page_events(day_utc);
CREATE INDEX IF NOT EXISTS idx_page_events_view ON page_events(view_id);

CREATE TABLE IF NOT EXISTS daily_extra_breakdown (
  day_utc TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK(dimension IN ('device', 'browser_language', 'content_language', 'campaign_source', 'campaign_medium', 'campaign_name', 'region', 'scroll_band', 'entry_page')),
  dimension_value TEXT NOT NULL,
  pageviews INTEGER NOT NULL,
  total_active_seconds INTEGER NOT NULL,
  PRIMARY KEY (day_utc, dimension, dimension_value)
);

CREATE TABLE IF NOT EXISTS daily_events (
  day_utc TEXT NOT NULL,
  event_type TEXT NOT NULL,
  target TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  PRIMARY KEY(day_utc, event_type, target)
);
