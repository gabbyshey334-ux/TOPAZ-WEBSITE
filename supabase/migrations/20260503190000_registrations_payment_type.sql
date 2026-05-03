ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'individual';
