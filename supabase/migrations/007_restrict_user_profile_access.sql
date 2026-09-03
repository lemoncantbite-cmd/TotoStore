-- Keep sensitive profile fields owner-only while exposing a minimal public seller profile.
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

DROP VIEW IF EXISTS public.public_seller_info;

CREATE VIEW public.public_seller_info AS
SELECT
  id,
  full_name,
  avatar_url,
  phone
FROM public.users;

REVOKE ALL ON public.public_seller_info FROM PUBLIC, anon;
GRANT SELECT ON public.public_seller_info TO authenticated;
