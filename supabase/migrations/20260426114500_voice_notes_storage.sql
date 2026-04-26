insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload voice notes"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'voice-notes');

create policy "Anyone can read voice notes"
on storage.objects
for select
to public
using (bucket_id = 'voice-notes');
