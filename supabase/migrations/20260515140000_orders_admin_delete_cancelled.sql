-- Let authenticated admins remove cancelled shop orders from the dashboard.
-- Matches the pattern used for site_content (public.is_admin()).

DROP POLICY IF EXISTS "orders_admin_delete_cancelled" ON public.orders;
CREATE POLICY "orders_admin_delete_cancelled"
ON public.orders
FOR DELETE
TO authenticated
USING (is_admin() AND lower(trim(status)) = 'cancelled');
