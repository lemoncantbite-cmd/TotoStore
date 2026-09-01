-- 001_create_totostore_schema.sql
-- TotoStore schema for users, listings, photos, and saved/favorites.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.listing_condition AS ENUM (
  'new',
  'used',
  'excellent',
  'good',
  'fair',
  'needs replacement'
);

CREATE TYPE public.listing_status AS ENUM (
  'draft',
  'active',
  'sold',
  'archived'
);

CREATE TYPE public.fuel_type AS ENUM (
  'petrol',
  'diesel',
  'cng',
  'electric',
  'hybrid'
);

CREATE TYPE public.transmission_type AS ENUM (
  'manual',
  'automatic',
  'semi_automatic'
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category <> ''),
  condition public.listing_condition NOT NULL DEFAULT 'good',
  status public.listing_status NOT NULL DEFAULT 'active',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  brand TEXT,
  model TEXT,
  year INTEGER CHECK (year BETWEEN 1990 AND 2100),
  mileage_km INTEGER CHECK (mileage_km >= 0),
  fuel_type public.fuel_type,
  transmission public.transmission_type,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, avatar_url, city, state, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    COALESCE(NEW.raw_user_meta_data->>'country', 'India')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_city_state ON public.users(city, state);

CREATE INDEX IF NOT EXISTS idx_listings_seller_id_created_at
  ON public.listings(seller_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_status_created_at
  ON public.listings(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_category_status
  ON public.listings(category, status);

CREATE INDEX IF NOT EXISTS idx_listings_city_state
  ON public.listings(city, state);

CREATE INDEX IF NOT EXISTS idx_listings_price
  ON public.listings(price);

CREATE INDEX IF NOT EXISTS idx_photos_listing_id_primary
  ON public.photos(listing_id, is_primary DESC, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id_listing_id
  ON public.saved_listings(user_id, listing_id);
