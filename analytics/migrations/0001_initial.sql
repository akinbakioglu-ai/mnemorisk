CREATE TABLE IF NOT EXISTS page_views (
  view_id TEXT PRIMARY KEY,
  day_utc TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  visitor_key TEXT,
  page_path TEXT NOT NULL,
  country_code TEXT NOT NULL,
  referrer_domain TEXT NOT NULL,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  measurement_version TEXT NOT NULL DEFAULT 'engagement_v1'
);
CREATE INDEX IF NOT EXISTS idx_page_views_day ON page_views(day_utc);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_day ON page_views(day_utc, visitor_key);

CREATE TABLE IF NOT EXISTS daily_site (
  day_utc TEXT PRIMARY KEY,
  pageviews INTEGER NOT NULL,
  daily_unique_visitors INTEGER NOT NULL,
  total_active_seconds INTEGER NOT NULL,
  timed_pageviews INTEGER NOT NULL,
  computed_at TEXT NOT NULL,
  measurement_version TEXT NOT NULL DEFAULT 'engagement_v1'
);

-- Independent marginals prevent low-volume country x page x referrer
-- cross-tabs from becoming de facto individual records in archives.
CREATE TABLE IF NOT EXISTS daily_breakdown (
  day_utc TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK(dimension IN ('page', 'country', 'referrer')),
  dimension_value TEXT NOT NULL,
  pageviews INTEGER NOT NULL,
  daily_unique_visitors INTEGER NOT NULL,
  total_active_seconds INTEGER NOT NULL,
  timed_pageviews INTEGER NOT NULL,
  PRIMARY KEY(day_utc, dimension, dimension_value)
);
