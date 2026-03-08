
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active instructors" ON public.instructors
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert instructors" ON public.instructors
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update instructors" ON public.instructors
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete instructors" ON public.instructors
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
