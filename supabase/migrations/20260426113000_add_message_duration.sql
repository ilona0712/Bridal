alter table public.messages
  add column if not exists duration_ms integer default null;
