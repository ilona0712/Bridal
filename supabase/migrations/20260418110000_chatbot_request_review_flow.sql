alter table public.chatbot_sessions
  add column if not exists request_summary text;

alter table public.chatbot_sessions
  drop constraint if exists chatbot_sessions_status_check;

alter table public.chatbot_sessions
  add constraint chatbot_sessions_status_check
  check (
    status = any (
      array[
        'in_progress'::varchar,
        'pending_review'::varchar,
        'approved'::varchar,
        'rejected'::varchar,
        'image_requested'::varchar,
        'image_generated'::varchar,
        'completed'::varchar
      ]::text[]
    )
  );

drop policy if exists chatbot_sessions_privileged_update on public.chatbot_sessions;

create policy chatbot_sessions_privileged_update
  on public.chatbot_sessions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = any (array['designer', 'admin'])
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = any (array['designer', 'admin'])
    )
  );
