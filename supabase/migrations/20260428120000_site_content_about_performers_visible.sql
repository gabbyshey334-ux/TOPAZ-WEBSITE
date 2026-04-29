-- Public visibility for About page "Performers on Stage — Early Years" block (about_image_3).
-- 'true' = show photo and caption; 'false' = hide from public About page (asset remains in storage/DB).

INSERT INTO public.site_content (key, value, updated_at) VALUES
  ('about_performers_visible', 'true', now())
ON CONFLICT (key) DO NOTHING;
