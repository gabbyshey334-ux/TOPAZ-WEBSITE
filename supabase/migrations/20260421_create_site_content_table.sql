-- site_content: simple key/value store for editable homepage content (hero images, video).
-- Public can SELECT everything; only admins (is_admin()) can INSERT/UPDATE/DELETE.

CREATE TABLE IF NOT EXISTS public.site_content (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at fresh on writes. `SET search_path = ''` pins the path to
-- satisfy the `function_search_path_mutable` advisor.
CREATE OR REPLACE FUNCTION public.set_site_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_content_updated_at ON public.site_content;
CREATE TRIGGER trg_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.set_site_content_updated_at();

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public SELECT (homepage needs to read these on every visit, including anon)
DROP POLICY IF EXISTS site_content_select_public ON public.site_content;
CREATE POLICY site_content_select_public
  ON public.site_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only writes (INSERT / UPDATE / DELETE)
DROP POLICY IF EXISTS site_content_all_admin ON public.site_content;
CREATE POLICY site_content_all_admin
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed the 4 hero images and 1 hero video with the current hardcoded values.
-- Using INSERT ... ON CONFLICT DO NOTHING so this is safe to re-run.
INSERT INTO public.site_content (key, value) VALUES
  ('hero_image_1',   '/images/homepage/boy-tuxedo-trophy.png'),
  ('hero_image_2',   '/images/homepage/duo-trophy.png'),
  ('hero_image_3',   '/images/homepage/group-dancers-trophy.png'),
  ('hero_image_4',   '/images/homepage/newspaper-1975.png'),
  ('hero_video_url', 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4')
ON CONFLICT (key) DO NOTHING;
