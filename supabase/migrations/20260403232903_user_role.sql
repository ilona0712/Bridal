create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone, country, profile_image_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'role', 'customer'),
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          '',
          '',
          new.raw_user_meta_data->>'profile_image_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

  UPDATE public.profiles AS p
SET role = u.raw_user_meta_data->>'role',
    updated_at = now()
FROM auth.users AS u
WHERE p.id = u.id
  AND u.raw_user_meta_data ? 'role'
  AND (p.role IS NULL OR p.role <> u.raw_user_meta_data->>'role');

-- (Optional) clear the metadata to prevent future drift
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE raw_user_meta_data ? 'role';
