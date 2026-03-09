-- Add logo and favicon URL columns to site_settings
ALTER TABLE public.site_settings
ADD COLUMN logo_url text,
ADD COLUMN favicon_url text;