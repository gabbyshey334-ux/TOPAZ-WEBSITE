-- Shop orders: shipping address + phone; email optional for offline checkout.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.orders
  ALTER COLUMN customer_email DROP NOT NULL;
