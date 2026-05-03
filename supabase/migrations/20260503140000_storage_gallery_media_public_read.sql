-- Public site loads image URLs from site_content (Supabase Storage public URLs).
-- Admin previews often work while logged in; anonymous visitors need SELECT on objects.
-- Without this, <img> requests return 403 and TextSection falls back to bundled /about/*.jpg.

UPDATE storage.buckets
SET public = true
WHERE id = 'gallery-media';

DROP POLICY IF EXISTS "gallery_media_public_read" ON storage.objects;
CREATE POLICY "gallery_media_public_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'gallery-media');
