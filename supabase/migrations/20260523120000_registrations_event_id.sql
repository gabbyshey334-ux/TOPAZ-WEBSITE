-- Tie each registration to a website event so admin can filter by competition.

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS registrations_event_id_idx ON public.registrations (event_id);

COMMENT ON COLUMN public.registrations.event_id IS
  'Website event this registration belongs to (usually the active event at submit time).';

-- Backfill: assign by registration created_at within each event's open/close window.
UPDATE public.registrations r
SET event_id = e.id
FROM public.events e
WHERE r.event_id IS NULL
  AND e.registration_open_date IS NOT NULL
  AND e.registration_close_date IS NOT NULL
  AND r.created_at::date >= e.registration_open_date
  AND r.created_at::date <= e.registration_close_date;

-- Remaining rows → currently active event, else most recent event by date.
UPDATE public.registrations r
SET event_id = (
  SELECT id FROM public.events
  WHERE is_active = true
  ORDER BY date ASC
  LIMIT 1
)
WHERE r.event_id IS NULL;

UPDATE public.registrations r
SET event_id = (SELECT id FROM public.events ORDER BY date DESC LIMIT 1)
WHERE r.event_id IS NULL;

-- create_registration: default event_id to active event when omitted.
CREATE OR REPLACE FUNCTION public.create_registration(p_row jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_merged jsonb;
  v_event_id uuid;
  new_id uuid;
BEGIN
  IF p_row IS NULL OR p_row = '{}'::jsonb THEN
    RAISE EXCEPTION 'invalid payload';
  END IF;

  v_event_id := NULLIF(trim(p_row->>'event_id'), '')::uuid;
  IF v_event_id IS NULL THEN
    SELECT id INTO v_event_id
    FROM public.events
    WHERE is_active = true
    ORDER BY date ASC
    LIMIT 1;
  END IF;

  v_merged := p_row
    - 'id'
    - 'created_at'
    - 'scoring_app_contestant_id'
    - 'scoring_app_synced_at'
    - 'scoring_app_sync_error'
    - 'confirmation_email_sent_at'
    - 'confirmation_email_error';

  v_merged := v_merged || jsonb_build_object(
    'id', gen_random_uuid(),
    'created_at', now(),
    'event_id', v_event_id,
    'disclaimer_accepted', true,
    'status', 'pending',
    'scoring_app_sync_status', 'pending',
    'scoring_app_contestant_id', null,
    'scoring_app_synced_at', null,
    'scoring_app_sync_error', null,
    'confirmation_email_sent_at', null,
    'confirmation_email_error', null,
    'participants_json', coalesce(v_merged->'participants_json', '[]'::jsonb),
    'music_delivery_method', coalesce(v_merged->>'music_delivery_method', 'usb'),
    'group_link_code', coalesce(v_merged->>'group_link_code', ''),
    'contestant_count', coalesce((v_merged->>'contestant_count')::int, 1),
    'total_fee', coalesce((v_merged->>'total_fee')::numeric, 0)
  );

  INSERT INTO public.registrations
  SELECT (jsonb_populate_record(NULL::public.registrations, v_merged)).*
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
