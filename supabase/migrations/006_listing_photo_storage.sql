-- Listing photo objects use {seller_id}/{listing_id}/{filename} inside this bucket.
DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing photos" ON storage.objects;

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Sellers can upload listing photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'listing-photos'
    AND array_length(string_to_array(name, '/'), 1) = 3
    AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.listings
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
    SELECT 1 FROM public.listings
    WHERE id::text = split_part(name, '/', 2)
      AND seller_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'listing-photos'
    AND array_length(string_to_array(name, '/'), 1) = 3
    AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.listings
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
    SELECT 1 FROM public.listings
    WHERE id::text = split_part(name, '/', 2)
      AND seller_id = auth.uid()
  )
);