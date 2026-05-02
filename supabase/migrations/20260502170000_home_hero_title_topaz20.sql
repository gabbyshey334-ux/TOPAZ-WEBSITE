-- Align stored hero title with new default when it still matches the previous marketing line.
UPDATE public.site_content
SET value = 'TOPAZ 2.0', updated_at = now()
WHERE key = 'home_hero_title'
  AND btrim(value) = 'The Return of TOPAZ 2.0';
