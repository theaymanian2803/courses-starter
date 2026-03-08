
ALTER TABLE public.lesson_comments
ADD COLUMN parent_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE DEFAULT NULL;

CREATE INDEX idx_lesson_comments_parent_id ON public.lesson_comments(parent_id);
