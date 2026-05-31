-- Per-event card image on the public Events page (Admin → Events upload).
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.events.image_url IS
  'Public URL for this event card on the Events page. Falls back to site_content schedule_event_card_image when null.';
