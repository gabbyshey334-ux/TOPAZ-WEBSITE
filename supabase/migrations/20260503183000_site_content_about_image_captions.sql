-- Optional captions for About page photo slots (editable in admin Content tab).
INSERT INTO public.site_content (key, value, updated_at)
VALUES
  ('about_image_1_caption', 'About Us', now()),
  ('about_image_2_caption', 'Continuing the Dream', now()),
  ('about_image_3_caption', 'Bob and Pat — TOPAZ Founders', now())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();
