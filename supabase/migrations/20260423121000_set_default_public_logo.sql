update public.site_settings
set value = '/maria_badari_logo.svg',
    updated_at = now()
where key = 'logo_image_url'
  and coalesce(nullif(trim(value), ''), '') = '';
