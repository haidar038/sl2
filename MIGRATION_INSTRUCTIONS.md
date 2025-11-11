# Manual Migration Instructions

## Permanent Delete Function Migration

The permanent delete feature requires a database function to be created. Follow these steps to apply the migration:

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/kxqaijpfogbxlmghjqin
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
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
```

5. Click **Run** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" message

### Option 2: Supabase CLI

If you have the Supabase CLI properly configured and linked:

```bash
cd "C:\Users\1\Documents\Web App Project\ShortLink\sl2"
supabase db push
```

### Verification

To verify the function was created successfully:

1. Go to SQL Editor
2. Run this query:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'permanent_delete_url';
```

You should see one row returned with `permanent_delete_url`.

## Migration File Location

The migration SQL file is located at:
`supabase/migrations/20251111000000_add_permanent_delete.sql`
