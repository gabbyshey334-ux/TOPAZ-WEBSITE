-- Nick: use "three decades" (replace any saved copy that still says "five decades").

UPDATE public.site_content
SET value = 'Over three decades of nurturing talent, building community, and creating unforgettable moments in theatrical arts.'
WHERE key = 'about_hero_subtitle'
  AND value IS NOT NULL
  AND value ILIKE '%five decades%';

UPDATE public.site_content
SET value = 'Over three decades of nurturing talent, building community, and creating unforgettable moments in theatrical arts.'
WHERE key = 'home_legacy_subheading'
  AND value IS NOT NULL
  AND value ILIKE '%five decades%';
