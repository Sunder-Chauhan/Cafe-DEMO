
-- Add missing columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gst_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS grand_total numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

-- Update RLS: allow anon users to insert guest orders
DROP POLICY IF EXISTS "Create orders" ON public.orders;
CREATE POLICY "Create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (customer_id = auth.uid()) OR (customer_id IS NULL)
);

-- Allow anon to view their guest orders (they won't have auth.uid so this is limited)
DROP POLICY IF EXISTS "View orders" ON public.orders;
CREATE POLICY "View orders"
ON public.orders
FOR SELECT
USING (
  (customer_id = auth.uid()) OR (customer_id IS NULL AND is_guest = true) OR is_staff_or_admin(auth.uid()) OR is_kitchen_or_above(auth.uid())
);
