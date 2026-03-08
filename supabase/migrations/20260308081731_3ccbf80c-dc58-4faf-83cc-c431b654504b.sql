
CREATE TABLE public.hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 text NOT NULL DEFAULT 'Master the',
  heading_highlight text NOT NULL DEFAULT 'MERN Stack',
  heading_line3 text NOT NULL DEFAULT 'From Beginning to End',
  subheading text NOT NULL DEFAULT 'Build production-ready fullstack applications with MongoDB, Express, React, and Node.js. Learn from real-world projects and land your dream job.',
  badge_text text NOT NULL DEFAULT 'New: Updated for 2025',
  cta_primary_text text NOT NULL DEFAULT 'Get Started Now',
  cta_secondary_text text NOT NULL DEFAULT 'Preview Curriculum',
  stat1_value text NOT NULL DEFAULT '100+',
  stat1_label text NOT NULL DEFAULT 'Video Lessons',
  stat2_value text NOT NULL DEFAULT '5,000+',
  stat2_label text NOT NULL DEFAULT 'Students',
  stat3_value text NOT NULL DEFAULT '8',
  stat3_label text NOT NULL DEFAULT 'Modules',
  stat4_value text NOT NULL DEFAULT '50+',
  stat4_label text NOT NULL DEFAULT 'Hours Content',
  background_image_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read hero settings (public landing page)
CREATE POLICY "Anyone can view hero settings" ON public.hero_settings
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can update hero settings" ON public.hero_settings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert hero settings" ON public.hero_settings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default row
INSERT INTO public.hero_settings (id) VALUES (gen_random_uuid());
