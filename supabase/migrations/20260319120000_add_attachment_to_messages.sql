alter table messages add column if not exists attachment_url text default null;
alter table messages add column if not exists attachment_type text default null;