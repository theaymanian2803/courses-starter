
-- Bundles table
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bundle-courses pivot table
CREATE TABLE public.bundle_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, course_id)
);

-- Upsell offers table
CREATE TABLE public.upsell_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  offer_type TEXT NOT NULL DEFAULT 'order_bump',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  yearly_price NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tier-courses pivot table (which courses each tier grants access to)
CREATE TABLE public.tier_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(tier_id, course_id)
);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User upsell purchases
CREATE TABLE public.upsell_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upsell_offer_id UUID NOT NULL REFERENCES public.upsell_offers(id),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_purchases ENABLE ROW LEVEL SECURITY;

-- Public read for bundles, tiers, upsells
CREATE POLICY "Anyone can view active bundles" ON public.bundles FOR SELECT USING (true);
CREATE POLICY "Anyone can view bundle courses" ON public.bundle_courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view active upsell offers" ON public.upsell_offers FOR SELECT USING (true);
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can view tier courses" ON public.tier_courses FOR SELECT USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert bundles" ON public.bundles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bundles" ON public.bundles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bundles" ON public.bundles FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert bundle courses" ON public.bundle_courses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bundle courses" ON public.bundle_courses FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert upsell offers" ON public.upsell_offers FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update upsell offers" ON public.upsell_offers FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete upsell offers" ON public.upsell_offers FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subscription tiers" ON public.subscription_tiers FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update subscription tiers" ON public.subscription_tiers FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscription tiers" ON public.subscription_tiers FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tier courses" ON public.tier_courses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tier courses" ON public.tier_courses FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- User subscriptions - users can view their own
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Upsell purchases - users can view/insert their own
CREATE POLICY "Users can view own upsell purchases" ON public.upsell_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upsell purchases" ON public.upsell_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
