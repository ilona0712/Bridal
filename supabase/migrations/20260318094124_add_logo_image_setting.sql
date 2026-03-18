INSERT INTO "site_settings" ("key", "value", "label") VALUES
  ('logo_image_url', '', 'Logo Image URL')
ON CONFLICT ("key") DO NOTHING;