-- Allow multiple staff emails for admin RLS (not only topaz2.0@yahoo.com).
-- Ensures events table has INSERT/UPDATE/DELETE policies for admins.

CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_emails IS
  'Staff emails allowed to manage admin content (events, site_content, etc.).';

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Legacy + table lookup (SECURITY DEFINER reads admin_emails without RLS recursion issues).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    lower(trim(auth.jwt() ->> 'email')) IN (
      SELECT lower(trim(email)) FROM public.admin_emails
      UNION
      SELECT lower(trim(e)) FROM (VALUES ('topaz2.0@yahoo.com')) AS t(e)
    ),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

INSERT INTO public.admin_emails (email)
VALUES ('topaz2.0@yahoo.com')
ON CONFLICT (email) DO NOTHING;

-- Admins manage the allowlist; reads use is_admin() (function is SECURITY DEFINER).
DROP POLICY IF EXISTS admin_emails_select_admin ON public.admin_emails;
CREATE POLICY admin_emails_select_admin
  ON public.admin_emails
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS admin_emails_insert_admin ON public.admin_emails;
CREATE POLICY admin_emails_insert_admin
  ON public.admin_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_emails_delete_admin ON public.admin_emails;
CREATE POLICY admin_emails_delete_admin
  ON public.admin_emails
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Events: public read, admin write (create/update/delete).
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_select_public ON public.events;
DROP POLICY IF EXISTS events_select_all ON public.events;
DROP POLICY IF EXISTS "Public can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;

CREATE POLICY events_select_public
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS events_insert_admin ON public.events;
DROP POLICY IF EXISTS events_update_admin ON public.events;
DROP POLICY IF EXISTS events_delete_admin ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

CREATE POLICY events_insert_admin
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY events_update_admin
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY events_delete_admin
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
