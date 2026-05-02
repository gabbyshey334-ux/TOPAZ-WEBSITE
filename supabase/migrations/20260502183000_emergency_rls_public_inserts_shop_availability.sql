-- Emergency RLS: anonymous site visitors use the `anon` role via the publishable key.
-- Permissive INSERT policies with WITH CHECK (true) allow registration, contact, and checkout-related inserts.
-- Also restores merchandise rows incorrectly marked unavailable (images still require admin upload when image_url is null).
--
-- Apply on project tklkexenzewscgdszlrq: Dashboard → SQL Editor → paste & run, OR
--   supabase login && supabase link --project-ref tklkexenzewscgdszlrq && supabase db push

-- ─── registrations ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public registration inserts" ON public.registrations;
DROP POLICY IF EXISTS "public_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "public_can_insert_registrations" ON public.registrations;

CREATE POLICY "public_can_insert_registrations"
ON public.registrations
FOR INSERT
TO public
WITH CHECK (true);

-- ─── contact_submissions ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public contact inserts" ON public.contact_submissions;
DROP POLICY IF EXISTS "public_insert_contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "public_can_insert_contact_submissions" ON public.contact_submissions;

CREATE POLICY "public_can_insert_contact_submissions"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- ─── orders (browser or future client inserts; service_role bypasses RLS) ───
DROP POLICY IF EXISTS "Allow public order inserts" ON public.orders;
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "public_can_insert_orders" ON public.orders;

CREATE POLICY "public_can_insert_orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);

-- ─── Shop: mark all products available (was showing "Out of Stock" sitewide) ──
UPDATE public.products
SET is_available = true
WHERE is_available = false;
