
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "anyone can donate" ON public.donations;
CREATE POLICY "anyone can donate" ON public.donations FOR INSERT TO anon, authenticated
  WITH CHECK (amount > 0 AND currency IN ('UGX','USD','EUR','GBP') AND length(coalesce(reference,'')) BETWEEN 4 AND 64);
