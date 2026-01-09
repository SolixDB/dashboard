-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for Privy authentication - no reference to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  auth_provider TEXT DEFAULT 'privy',
  auth_provider_id TEXT NOT NULL UNIQUE, -- Privy user ID
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'x402', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT users_email_or_wallet CHECK (email IS NOT NULL OR wallet_address IS NOT NULL)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL, -- SHA-256 hash of actual key
  key_prefix TEXT NOT NULL DEFAULT 'slxdb_live_',
  key_suffix TEXT NOT NULL, -- last 4 chars for display
  name TEXT DEFAULT 'Default Key',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
  credits_used INTEGER DEFAULT 1,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly credits table
CREATE TABLE IF NOT EXISTS public.monthly_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  plan TEXT NOT NULL CHECK (plan IN ('free', 'x402', 'enterprise')),
  total_credits INTEGER NOT NULL,
  used_credits INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider_id ON public.users(auth_provider_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON public.api_keys(user_id, is_active) WHERE is_active = true;

-- Unique partial index: Only one active key per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_user_active_unique 
  ON public.api_keys(user_id) 
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON public.usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key_id ON public.usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_monthly_credits_user_month ON public.monthly_credits(user_id, month);

-- Row Level Security (RLS) Policies
-- Since we're using Privy, we'll use service role for all operations
-- RLS is enabled but policies allow service role access

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_credits ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (we're using service role key)
CREATE POLICY "Service role can manage users"
  ON public.users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage API keys"
  ON public.api_keys FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage usage logs"
  ON public.usage_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage monthly credits"
  ON public.monthly_credits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
