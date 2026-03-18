CREATE TABLE IF NOT EXISTS public.favorite_dresses (
  user_id uuid NOT NULL,
  dress_id uuid NOT NULL,
  created_at timestamp(0) without time zone DEFAULT now() NOT NULL,

  CONSTRAINT favorite_dresses_pkey PRIMARY KEY (user_id, dress_id),
  CONSTRAINT favorite_dresses_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT favorite_dresses_dress_id_fkey
    FOREIGN KEY (dress_id) REFERENCES public.dresses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_favorite_dresses_user_id
  ON public.favorite_dresses(user_id);

CREATE INDEX IF NOT EXISTS idx_favorite_dresses_dress_id
  ON public.favorite_dresses(dress_id);

ALTER TABLE public.favorite_dresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
ON public.favorite_dresses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own favorites"
ON public.favorite_dresses
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
ON public.favorite_dresses
FOR DELETE
TO authenticated
USING (user_id = auth.uid());