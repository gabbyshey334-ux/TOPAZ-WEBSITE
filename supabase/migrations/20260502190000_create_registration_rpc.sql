-- Public registration uses anon key + insert().select('id'), which requires SELECT RLS on the new row.
-- Anon has no SELECT policy on registrations, so PostgREST fails after INSERT. This RPC runs as
-- definer, inserts, and returns id without exposing other rows to anon.

CREATE OR REPLACE FUNCTION public.create_registration(p_row jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_merged jsonb;
  new_id uuid;
BEGIN
  IF p_row IS NULL OR p_row = '{}'::jsonb THEN
    RAISE EXCEPTION 'invalid payload';
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

REVOKE ALL ON FUNCTION public.create_registration(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_registration(jsonb) TO anon, authenticated;
