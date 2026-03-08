
-- Create lesson_comments table
CREATE TABLE public.lesson_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments on lessons
CREATE POLICY "Authenticated users can view lesson comments"
  ON public.lesson_comments FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON public.lesson_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.lesson_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.lesson_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.lesson_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_lesson_comments_updated_at
  BEFORE UPDATE ON public.lesson_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
