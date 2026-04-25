INSERT INTO public.site_settings ("key", "value", "label")
VALUES (
  'image_generation_model',
  'gpt-image-1.5',
  'Image Generation Model'
)
ON CONFLICT ("key") DO NOTHING;
