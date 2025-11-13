-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, name)
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Users can view own tags"
  ON public.tags FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own tags"
  ON public.tags FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING (auth.uid() = owner_id);

-- Create index for tags lookup
CREATE INDEX idx_tags_owner ON public.tags(owner_id);
CREATE INDEX idx_tags_name ON public.tags(owner_id, name);

-- Create url_tags junction table for many-to-many relationship
CREATE TABLE public.url_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id UUID NOT NULL REFERENCES public.urls(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(url_id, tag_id)
);

-- Enable RLS on url_tags
ALTER TABLE public.url_tags ENABLE ROW LEVEL SECURITY;

-- url_tags policies
CREATE POLICY "Users can view tags for own URLs"
  ON public.url_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_tags.url_id AND urls.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tags for own URLs"
  ON public.url_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_tags.url_id AND urls.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from own URLs"
  ON public.url_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_tags.url_id AND urls.owner_id = auth.uid()
    )
  );

-- Create indexes for url_tags lookup
CREATE INDEX idx_url_tags_url ON public.url_tags(url_id);
CREATE INDEX idx_url_tags_tag ON public.url_tags(tag_id);

-- Trigger for updated_at on tags
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get tags for a URL
CREATE OR REPLACE FUNCTION public.get_url_tags(p_url_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.color
  FROM public.tags t
  INNER JOIN public.url_tags ut ON t.id = ut.tag_id
  WHERE ut.url_id = p_url_id
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to assign tag to URL
CREATE OR REPLACE FUNCTION public.assign_tag_to_url(p_url_id UUID, p_tag_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if URL belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM public.urls
    WHERE id = p_url_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'URL not found or access denied';
  END IF;

  -- Check if tag belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM public.tags
    WHERE id = p_tag_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Tag not found or access denied';
  END IF;

  -- Insert if not exists
  INSERT INTO public.url_tags (url_id, tag_id)
  VALUES (p_url_id, p_tag_id)
  ON CONFLICT (url_id, tag_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to remove tag from URL
CREATE OR REPLACE FUNCTION public.remove_tag_from_url(p_url_id UUID, p_tag_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.url_tags
  WHERE url_id = p_url_id
    AND tag_id = p_tag_id
    AND EXISTS (
      SELECT 1 FROM public.urls
      WHERE id = p_url_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comment for documentation
COMMENT ON TABLE public.tags IS 'User-defined tags for organizing URLs';
COMMENT ON TABLE public.url_tags IS 'Junction table linking URLs to tags (many-to-many)';
