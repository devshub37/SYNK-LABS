-- 1. Ensure the 'clipboard-uploads' bucket exists and is set to public,
--    with no project-level file size limit (Supabase's plan-level global cap still applies).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('clipboard-uploads', 'clipboard-uploads', true, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = NULL;

-- 2. Allow anonymous / public users to upload (INSERT) files to the bucket.
DROP POLICY IF EXISTS "Allow public uploads to clipboard-uploads" ON storage.objects;
CREATE POLICY "Allow public uploads to clipboard-uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'clipboard-uploads');

-- 3. Allow public users to download / view (SELECT) files from the bucket.
DROP POLICY IF EXISTS "Allow public downloads from clipboard-uploads" ON storage.objects;
CREATE POLICY "Allow public downloads from clipboard-uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clipboard-uploads');

-- 4. (Optional) Allow public users to delete or update files if needed.
DROP POLICY IF EXISTS "Allow public deletes from clipboard-uploads" ON storage.objects;
CREATE POLICY "Allow public deletes from clipboard-uploads"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'clipboard-uploads');
