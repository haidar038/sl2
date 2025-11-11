-- Function to track URL clicks
-- This function runs with SECURITY DEFINER to bypass RLS and allow anonymous click tracking
CREATE OR REPLACE FUNCTION public.track_click(
  p_url_id UUID,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_device TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Increment click count on the URL
  UPDATE public.urls
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_url_id;

  -- Insert click record
  INSERT INTO public.clicks (
    url_id,
    ip_hash,
    user_agent,
    referrer,
    country,
    city,
    device,
    browser,
    os
  ) VALUES (
    p_url_id,
    p_ip_hash,
    p_user_agent,
    p_referrer,
    p_country,
    p_city,
    p_device,
    p_browser,
    p_os
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.track_click(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
