-- Create site_settings table to store global configurations
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial Google Analytics ID if it doesn't exist
INSERT INTO site_settings (key, value)
VALUES ('google_analytics_id', 'G-T72QRJLWJC')
ON CONFLICT (key) DO NOTHING;
