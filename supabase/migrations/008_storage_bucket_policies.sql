-- Storage access rules for public marketplace/profile images.
-- Objects remain publicly readable, but only the owning authenticated user can write them.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-photos', 'profile-photos', true),
  ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can update listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can delete listing photos" ON storage.objects;

CREATE POLICY "Public can read profile photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "Public can read listing photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'listing-photos');

CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND name = auth.uid()::text || '.jpg'
);

CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND name = auth.uid()::text || '.jpg'
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND name = auth.uid()::text || '.jpg'
);

CREATE POLICY "Users can delete own profile photo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND name = auth.uid()::text || '.jpg'
);

CREATE POLICY "Sellers can upload listing photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'listing-photos'
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id::text = split_part(name, '/', 2)
      AND seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update listing photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'listing-photos'
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id::text = split_part(name, '/', 2)
      AND seller_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'listing-photos'
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id::text = split_part(name, '/', 2)
      AND seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can delete listing photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'listing-photos'
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id::text = split_part(name, '/', 2)
      AND seller_id = auth.uid()
  )
);
