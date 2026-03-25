-- Allow admins to read any customer's favorites
DO $$ BEGIN
  CREATE POLICY "Admins can read all favorites"
  ON public.favorite_dresses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow admins to read any customer's profile (only applies if RLS is enabled on profiles)
DO $$ BEGIN
  CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
