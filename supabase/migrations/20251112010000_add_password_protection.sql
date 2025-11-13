-- Add password protection columns to urls table
ALTER TABLE public.urls
ADD COLUMN password_hash TEXT,
ADD COLUMN require_password BOOLEAN DEFAULT FALSE;

-- Create index for password protected URLs
CREATE INDEX idx_urls_password ON public.urls(require_password) WHERE require_password = TRUE;

-- Function to verify URL password
CREATE OR REPLACE FUNCTION public.verify_url_password(p_slug TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_password_hash TEXT;
  v_require_password BOOLEAN;
BEGIN
  -- Get password hash and requirement
  SELECT password_hash, require_password
  INTO v_password_hash, v_require_password
  FROM public.urls
  WHERE slug = p_slug AND deleted_at IS NULL;

  -- If URL not found or doesn't require password
  IF NOT FOUND OR NOT v_require_password THEN
    RETURN TRUE;
  END IF;

  -- Verify password using crypt extension
  -- Note: For production, use a stronger hash like bcrypt
  -- For now, using SHA-256 for simplicity
  RETURN encode(digest(p_password, 'sha256'), 'hex') = v_password_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to set URL password
CREATE OR REPLACE FUNCTION public.set_url_password(p_url_id UUID, p_password TEXT)
RETURNS VOID AS $$
BEGIN
  -- Check if URL belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM public.urls
    WHERE id = p_url_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'URL not found or access denied';
  END IF;

  -- Update password
  IF p_password IS NULL OR p_password = '' THEN
    -- Remove password protection
    UPDATE public.urls
    SET password_hash = NULL,
        require_password = FALSE
    WHERE id = p_url_id;
  ELSE
    -- Set password protection
    UPDATE public.urls
    SET password_hash = encode(digest(p_password, 'sha256'), 'hex'),
        require_password = TRUE
    WHERE id = p_url_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comment for documentation
COMMENT ON COLUMN public.urls.password_hash IS 'SHA-256 hash of password for protected URLs';
COMMENT ON COLUMN public.urls.require_password IS 'Whether URL requires password to access';
