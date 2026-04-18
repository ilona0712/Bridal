alter table public.chatbot_sessions
  add column if not exists generation_error text,
  add column if not exists generated_at timestamp;

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
        'generation_failed'::varchar,
        'completed'::varchar
      ]::text[]
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'generated-previews',
  'generated-previews',
  true,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Anyone can read generated previews" on storage.objects;

create policy "Anyone can read generated previews"
on storage.objects
for select
to public
using (bucket_id = 'generated-previews');
