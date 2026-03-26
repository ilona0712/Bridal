-- Read-only function so admins can fetch a customer's email from auth.users
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO authenticated;
