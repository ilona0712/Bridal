create policy "Authenticated users can upload chat images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'chat-images');

create policy "Anyone can read chat images"
on storage.objects
for select
to public
using (bucket_id = 'chat-images');