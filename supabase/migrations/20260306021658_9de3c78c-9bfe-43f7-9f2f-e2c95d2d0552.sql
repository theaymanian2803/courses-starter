CREATE OR REPLACE FUNCTION public.increment_coupon_usage(_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE code = _code;
END;
$$;