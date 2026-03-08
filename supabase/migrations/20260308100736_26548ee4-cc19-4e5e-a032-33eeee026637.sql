
ALTER TABLE public.hero_settings
ADD COLUMN overlay_image_url text DEFAULT NULL,
ADD COLUMN overlay_inset integer DEFAULT 0;
