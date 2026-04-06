-- Fix front-end read failures for gallery/profile by enabling RLS and adding permissive policies

-- ===== Dresses and related lookups =====
ALTER TABLE public.dresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_collections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_attribute_values ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) may read gallery data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dresses' AND policyname = 'dresses_read_all'
  ) THEN
    CREATE POLICY dresses_read_all
      ON public.dresses FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dress_images' AND policyname = 'dress_images_read_all'
  ) THEN
    CREATE POLICY dress_images_read_all
      ON public.dress_images FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dress_collections' AND policyname = 'dress_collections_read_all'
  ) THEN
    CREATE POLICY dress_collections_read_all
      ON public.dress_collections FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'collections_read_all'
  ) THEN
    CREATE POLICY collections_read_all
      ON public.collections FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attributes' AND policyname = 'attributes_read_all'
  ) THEN
    CREATE POLICY attributes_read_all
      ON public.attributes FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attribute_values' AND policyname = 'attribute_values_read_all'
  ) THEN
    CREATE POLICY attribute_values_read_all
      ON public.attribute_values FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dress_attribute_values' AND policyname = 'dress_attribute_values_read_all'
  ) THEN
    CREATE POLICY dress_attribute_values_read_all
      ON public.dress_attribute_values FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END$$;

-- ===== Profiles (needed for profile page, header avatar, etc.) =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_self_select'
  ) THEN
    CREATE POLICY profiles_self_select
      ON public.profiles FOR SELECT
      TO authenticated
      USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_admin_select'
  ) THEN
    CREATE POLICY profiles_admin_select
      ON public.profiles FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_self_insert'
  ) THEN
    CREATE POLICY profiles_self_insert
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_self_update'
  ) THEN
    CREATE POLICY profiles_self_update
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END$$;
