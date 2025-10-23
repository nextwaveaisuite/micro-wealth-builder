-- ============================================
-- Micro Wealth Builder - Complete Supabase Setup
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_band TEXT NOT NULL DEFAULT 'balanced',
  contribution_amount NUMERIC NOT NULL DEFAULT 50,
  contribution_cadence TEXT NOT NULL DEFAULT 'weekly',
  buy_the_dip_enabled BOOLEAN DEFAULT true,
  buy_the_dip_extra NUMERIC DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 2. USER HOLDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  units NUMERIC NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- ============================================
-- 3. ORDER HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  orders JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  dip_extra NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 5. SYSTEM LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE POLICIES - USER SETTINGS
-- ============================================
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 8. CREATE POLICIES - USER HOLDINGS
-- ============================================
CREATE POLICY "Users can view own holdings" ON user_holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings" ON user_holdings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings" ON user_holdings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings" ON user_holdings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 9. CREATE POLICIES - ORDER HISTORY
-- ============================================
CREATE POLICY "Users can view own orders" ON order_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON order_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 10. CREATE POLICIES - ADMIN USERS
-- ============================================
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 11. CREATE POLICIES - SYSTEM LOGS
-- ============================================
CREATE POLICY "Admins can view logs" ON system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert logs" ON system_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 12. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_holdings_user_id ON user_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_user_id ON order_history(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON order_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- ============================================
-- 13. CREATE FUNCTIONS FOR AUTO-UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. CREATE TRIGGERS
-- ============================================
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_holdings_updated_at
    BEFORE UPDATE ON user_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 15. INSERT YOUR ADMIN ACCOUNT
-- ============================================
-- After you create your account in the app, run this:
-- Replace 'YOUR_USER_ID' with your actual user ID from Supabase Auth
-- Replace 'YOUR_EMAIL' with your admin email

-- INSERT INTO admin_users (user_id, email)
-- VALUES ('YOUR_USER_ID', 'YOUR_EMAIL');

-- Example:
-- INSERT INTO admin_users (user_id, email)
-- VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@example.com');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready for:
-- ✅ User accounts and authentication
-- ✅ Portfolio tracking
-- ✅ Order history
-- ✅ Admin console access
-- ✅ System logging
-- ✅ Row-level security
-- ============================================

