-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true);

-- Allow admins to upload thumbnails
CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update thumbnails
CREATE POLICY "Admins can update course thumbnails"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'course-thumbnails' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete thumbnails
CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'course-thumbnails' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow public read access to thumbnails
CREATE POLICY "Anyone can view course thumbnails"
ON storage.objects
FOR SELECT
USING (bucket_id = 'course-thumbnails');