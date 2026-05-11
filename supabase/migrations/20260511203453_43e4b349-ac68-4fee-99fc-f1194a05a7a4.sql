CREATE TABLE public.course_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  module_id UUID,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_comments_course ON public.course_comments(course_id);
CREATE INDEX idx_course_comments_module ON public.course_comments(module_id);
CREATE INDEX idx_course_comments_parent ON public.course_comments(parent_id);

ALTER TABLE public.course_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view course comments"
  ON public.course_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own course comments"
  ON public.course_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course comments"
  ON public.course_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course comments"
  ON public.course_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any course comment"
  ON public.course_comments FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_course_comments_updated_at
  BEFORE UPDATE ON public.course_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();