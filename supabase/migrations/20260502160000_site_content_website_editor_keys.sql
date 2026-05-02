-- Optional seed rows for website editor text keys (defaults also exist in app code).
-- ON CONFLICT DO NOTHING preserves existing admin edits.
INSERT INTO public.site_content (key, value, updated_at)
SELECT k, v, now()
FROM (
  VALUES
    ('footer_tagline', ''),
    ('footer_address', ''),
    ('footer_copyright', ''),
    ('footer_est_line', ''),
    ('footer_social_facebook_url', ''),
    ('footer_social_twitter_url', ''),
    ('footer_social_instagram_url', ''),
    ('footer_social_tiktok_url', ''),
    ('contact_faq_json', ''),
    ('registration_faq_json', '')
) AS t(k, v)
ON CONFLICT (key) DO NOTHING;
