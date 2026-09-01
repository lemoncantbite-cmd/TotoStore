-- 002_rls_policies.sql
-- Row Level Security for public listings and private user-owned data in TotoStore.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- users: public can read profiles, users can manage only own row
CREATE POLICY "Users can view all profiles"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON public.users
FOR DELETE
USING (auth.uid() = id);

-- listings: public read, only seller can mutate
CREATE POLICY "Listings are publicly readable"
ON public.listings
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own listings"
ON public.listings
FOR INSERT
WITH CHECK (
  auth.uid() = seller_id
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own listings"
ON public.listings
FOR UPDATE
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings"
ON public.listings
FOR DELETE
USING (auth.uid() = seller_id);

-- photos: public read, only owner-seller can manage
CREATE POLICY "Photos are publicly readable"
ON public.photos
FOR SELECT
USING (true);

CREATE POLICY "Seller can add photos to own listing"
ON public.photos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.seller_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Seller can update photos on own listing"
ON public.photos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.seller_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.seller_id = auth.uid()
  )
);

CREATE POLICY "Seller can delete photos from own listing"
ON public.photos
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.seller_id = auth.uid()
  )
);

-- saved_listings: private per-user favorites, only owner can read/manage
CREATE POLICY "Users can view own saved listings"
ON public.saved_listings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
ON public.saved_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved listings"
ON public.saved_listings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own saved listings"
ON public.saved_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: enforce lowercase user email if your app needs it
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (lower(email));
