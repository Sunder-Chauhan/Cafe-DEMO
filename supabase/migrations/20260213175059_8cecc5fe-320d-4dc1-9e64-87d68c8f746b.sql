
-- Allow guest orders (customer_id can be null)
DROP POLICY IF EXISTS "Create orders" ON public.orders;
CREATE POLICY "Create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (customer_id = auth.uid()) OR (customer_id IS NULL)
);

-- Allow guest order items insertion
DROP POLICY IF EXISTS "Create order items" ON public.order_items;
CREATE POLICY "Create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
  )
);

-- Allow anon to view own guest order items
DROP POLICY IF EXISTS "View order items" ON public.order_items;
CREATE POLICY "View order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid() OR is_staff_or_admin(auth.uid()) OR is_kitchen_or_above(auth.uid()))
  )
);
