alter table public.messages
  alter column created_at type timestamptz using created_at at time zone 'UTC',
  alter column created_at set default now();

alter table public.conversations
  alter column created_at type timestamptz using created_at at time zone 'UTC',
  alter column created_at set default now();

alter table public.profiles
  alter column created_at type timestamptz using created_at at time zone 'UTC',
  alter column updated_at type timestamptz using updated_at at time zone 'UTC';

alter table public.collections
  alter column created_at type timestamptz using created_at at time zone 'UTC';

alter table public.dresses
  alter column created_at type timestamptz using created_at at time zone 'UTC';

alter table public.dress_images
  alter column created_at type timestamptz using created_at at time zone 'UTC';

alter table public.notifications
  alter column created_at type timestamptz using created_at at time zone 'UTC';