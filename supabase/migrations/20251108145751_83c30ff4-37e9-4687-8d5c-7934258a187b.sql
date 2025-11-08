-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create URLs table
CREATE TABLE public.urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  expiry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on urls
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;

-- URLs policies
CREATE POLICY "Users can view own URLs"
  ON public.urls FOR SELECT
  USING (auth.uid() = owner_id OR (is_public = TRUE AND deleted_at IS NULL));

CREATE POLICY "Users can insert own URLs"
  ON public.urls FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own URLs"
  ON public.urls FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own URLs"
  ON public.urls FOR DELETE
  USING (auth.uid() = owner_id);

-- Create index for slug lookup (critical for performance)
CREATE INDEX idx_urls_slug ON public.urls(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_urls_owner ON public.urls(owner_id);
CREATE INDEX idx_urls_created ON public.urls(created_at DESC);

-- Create clicks table for analytics
CREATE TABLE public.clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id UUID NOT NULL REFERENCES public.urls(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT
);

-- Enable RLS on clicks
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Clicks policies
CREATE POLICY "Users can view clicks for own URLs"
  ON public.clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = clicks.url_id AND urls.owner_id = auth.uid()
    )
  );

-- Create index for analytics queries
CREATE INDEX idx_clicks_url_id ON public.clicks(url_id);
CREATE INDEX idx_clicks_created ON public.clicks(created_at DESC);

-- Create API keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '{"create": true, "read": true}'::jsonb,
  rate_limit INTEGER DEFAULT 100,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- API keys policies
CREATE POLICY "Users can view own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own API keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own API keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = owner_id);

-- Create index for API key lookup
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_owner ON public.api_keys(owner_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_urls_updated_at
  BEFORE UPDATE ON public.urls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to soft delete URL
CREATE OR REPLACE FUNCTION public.soft_delete_url(url_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.urls
  SET deleted_at = NOW()
  WHERE id = url_id AND owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to restore soft deleted URL
CREATE OR REPLACE FUNCTION public.restore_url(url_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.urls
  SET deleted_at = NULL
  WHERE id = url_id 
    AND owner_id = auth.uid()
    AND deleted_at IS NOT NULL
    AND deleted_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;