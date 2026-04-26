drop policy if exists chatbot_sessions_privileged_delete on public.chatbot_sessions;

create policy chatbot_sessions_privileged_delete
  on public.chatbot_sessions
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = any (array['designer', 'admin'])
    )
  );
