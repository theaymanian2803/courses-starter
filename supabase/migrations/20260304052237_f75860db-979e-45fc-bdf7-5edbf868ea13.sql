
-- Create coupons table
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  is_active boolean NOT NULL DEFAULT true,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can view active coupons (needed for validation)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (true);

-- Admins can manage coupons
CREATE POLICY "Admins can insert coupons"
ON public.coupons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update coupons"
ON public.coupons
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coupons"
ON public.coupons
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
