
CREATE TABLE public.landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sections" ON public.landing_page_sections FOR SELECT USING (true);
CREATE POLICY "Admins can update sections" ON public.landing_page_sections FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert sections" ON public.landing_page_sections FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.landing_page_sections (section_key, title, sort_order) VALUES
  ('hero', 'Hero Section', 0),
  ('featured_courses', 'Featured Courses', 1),
  ('instructors', 'Instructors', 2),
  ('testimonials', 'Testimonials', 3),
  ('pricing', 'Pricing', 4),
  ('subscription_pricing', 'Subscription Pricing', 5);
