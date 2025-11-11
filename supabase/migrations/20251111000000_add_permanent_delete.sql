-- Function to permanently delete a soft-deleted URL
-- This will hard delete the URL and all associated clicks from the database
-- Only works on URLs that are already soft-deleted (deleted_at IS NOT NULL)
CREATE OR REPLACE FUNCTION public.permanent_delete_url(url_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Verify the URL belongs to the user and is soft-deleted
  IF NOT EXISTS (
    SELECT 1 FROM public.urls
    WHERE id = url_id
      AND owner_id = auth.uid()
      AND deleted_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'URL not found or not soft-deleted';
  END IF;

  -- Permanently delete the URL (CASCADE will handle clicks)
  DELETE FROM public.urls
  WHERE id = url_id AND owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
