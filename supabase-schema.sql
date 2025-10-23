-- Wealth Builder Phase 2 - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trialing', 'active', 'past_due', 'canceled', 'paused')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own record (but not subscription fields)
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 2. USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  risk_band TEXT DEFAULT 'balanced' CHECK (risk_band IN ('conservative', 'balanced', 'growth')),
  cadence TEXT DEFAULT 'weekly' CHECK (cadence IN ('weekly', 'fortnightly', 'monthly')),
  contribution_amount NUMERIC(10, 2) DEFAULT 50.00,
  btd_toggle BOOLEAN DEFAULT false,
  autopilot_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 3. USER HOLDINGS TABLE (CSV import storage)
-- ============================================================================
CREATE TABLE public.user_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  units NUMERIC(15, 6) NOT NULL,
  cost_base NUMERIC(10, 2) NOT NULL,
  provider TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_holdings_user_id ON public.user_holdings(user_id);
CREATE INDEX idx_holdings_ticker ON public.user_holdings(ticker);

ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own holdings" ON public.user_holdings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 4. GUARDRAIL EVENTS TABLE (Loss Guard & Radar history)
-- ============================================================================
CREATE TABLE public.guardrail_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('loss_guard_brake', 'loss_guard_floor', 'loss_guard_cap', 'radar_tilt', 'radar_cap')),
  trigger_reason TEXT NOT NULL,
  amount NUMERIC(10, 2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guardrail_user_id ON public.guardrail_events(user_id);
CREATE INDEX idx_guardrail_created_at ON public.guardrail_events(created_at DESC);

ALTER TABLE public.guardrail_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guardrail events" ON public.guardrail_events
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert events (from serverless functions)
CREATE POLICY "Service can insert guardrail events" ON public.guardrail_events
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 5. TELEMETRY EVENTS TABLE (anonymous usage tracking)
-- ============================================================================
CREATE TABLE public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- nullable for anonymous events
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_event_type ON public.telemetry_events(event_type);
CREATE INDEX idx_telemetry_created_at ON public.telemetry_events(created_at DESC);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert telemetry (from serverless functions)
CREATE POLICY "Service can insert telemetry" ON public.telemetry_events
  FOR INSERT WITH CHECK (true);

-- Admins can read all telemetry (handled in admin console with service key)

-- ============================================================================
-- 6. CONFIG TABLE (admin-editable policies with versioning)
-- ============================================================================
CREATE TABLE public.config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Insert default config values
INSERT INTO public.config (key, value, updated_by) VALUES
  ('safety_floor_pct', '30', 'system'),
  ('growth_cap_pct', '7', 'system'),
  ('weekly_brake_pct', '-5', 'system'),
  ('radar_max_actions_per_week', '2', 'system'),
  ('radar_max_monthly_cap', '80', 'system'),
  ('min_trade_size', '50', 'system');

-- No RLS - only accessible via admin console with service key

-- ============================================================================
-- 7. QUOTE CACHE TABLE (optional - for caching live quotes)
-- ============================================================================
CREATE TABLE public.quote_cache (
  ticker TEXT PRIMARY KEY,
  price NUMERIC(10, 2) NOT NULL,
  change_pct NUMERIC(5, 2),
  volume BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_cache_updated_at ON public.quote_cache(updated_at DESC);

-- No RLS - public read access, service role writes

-- ============================================================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_holdings_updated_at BEFORE UPDATE ON public.user_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON public.config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for common queries
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- To verify setup, run:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

