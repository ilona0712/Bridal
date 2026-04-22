create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now(),
  unique (token)
);

create index if not exists idx_push_tokens_user_id
  on public.push_tokens(user_id);

alter table public.push_tokens enable row level security;

create policy "push_tokens_self_select"
  on public.push_tokens for select
  to authenticated
  using (user_id = auth.uid());

create policy "push_tokens_self_insert"
  on public.push_tokens for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "push_tokens_self_update"
  on public.push_tokens for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "push_tokens_self_delete"
  on public.push_tokens for delete
  to authenticated
  using (user_id = auth.uid());

create policy "push_tokens_privileged_select"
  on public.push_tokens for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = any (array['admin'::varchar, 'designer'::varchar])
    )
  );

create or replace function public.set_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_push_tokens_updated_at on public.push_tokens;
create trigger trg_push_tokens_updated_at
before update on public.push_tokens
for each row
execute function public.set_push_tokens_updated_at();
