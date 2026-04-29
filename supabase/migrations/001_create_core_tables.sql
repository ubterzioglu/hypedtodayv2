CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  linkedin_url TEXT UNIQUE,
  avatar_url TEXT,
  interests TEXT[] DEFAULT '{}',
  trust_score SMALLINT NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  credits INTEGER NOT NULL DEFAULT 20,
  daily_limit INTEGER NOT NULL DEFAULT 20,
  tasks_today INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  banned_at TIMESTAMPTZ,
  banned_reason TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'linkedin' CHECK (platform IN ('linkedin','x','instagram','youtube','tiktok','reddit')),
  post_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','cancelled')),
  targeting JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  pacing TEXT NOT NULL DEFAULT 'linear' CHECK (pacing IN ('linear','burst','smart')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private','invite_only')),
  total_cost INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like','comment','repost','follow','connection_request','profile_visit')),
  target_count INTEGER NOT NULL CHECK (target_count > 0),
  current_count INTEGER NOT NULL DEFAULT 0,
  cost_per_action INTEGER NOT NULL CHECK (cost_per_action > 0),
  reward_per_action INTEGER NOT NULL CHECK (reward_per_action > 0),
  constraints JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','revoked')),
  verification_score REAL DEFAULT 0,
  verification_source TEXT DEFAULT 'heuristic' CHECK (verification_source IN ('heuristic','extension','manual')),
  dwell_time_ms INTEGER,
  click_through BOOLEAN DEFAULT FALSE,
  return_latency_ms INTEGER,
  extension_events JSONB DEFAULT '[]',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','spend','adjust','refund')),
  reason TEXT NOT NULL,
  ref_type TEXT CHECK (ref_type IN ('completion','campaign','admin','system')),
  ref_id UUID,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'linkedin',
  action TEXT NOT NULL,
  post_url TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'extension' CHECK (event_type IN ('extension','heuristic','manual')),
  payload JSONB DEFAULT '{}',
  nonce TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE abuse_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('velocity_spike','multi_account','device_cluster','suspicious_pattern','manual')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed')),
  meta JSONB DEFAULT '{}',
  flagged_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
