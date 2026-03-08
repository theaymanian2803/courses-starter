
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_url text DEFAULT '',
  instagram_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  youtube_url text DEFAULT '',
  github_url text DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Admins can update social links" ON public.social_links FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert social links" ON public.social_links FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed a default row
INSERT INTO public.social_links (twitter_url, instagram_url, linkedin_url, youtube_url, github_url)
VALUES ('https://twitter.com', 'https://instagram.com', 'https://linkedin.com', 'https://youtube.com', 'https://github.com');
