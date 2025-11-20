-- ============================================================================
-- STORAGE BUCKET RLS POLICIES
-- DNA::}{::lang Multi-User Platform
-- Bucket: user-content
-- ============================================================================

-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload own content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Public images are viewable by anyone
CREATE POLICY "Public images are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-content');

-- Policy 3: Users can update their own files
CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own files
CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this after creating policies to verify they were created:
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- Expected output: 4 policies (upload, view, update, delete)
