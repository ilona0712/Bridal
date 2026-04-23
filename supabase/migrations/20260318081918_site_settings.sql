CREATE TABLE IF NOT EXISTS "site_settings" (
  "key"        VARCHAR(100) NOT NULL PRIMARY KEY,
  "value"      TEXT         NOT NULL,
  "label"      VARCHAR(200) NOT NULL,
  "updated_at" TIMESTAMP    NOT NULL DEFAULT now()
);

ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read"
ON "site_settings" FOR SELECT TO anon, authenticated
USING (TRUE);

CREATE POLICY "site_settings_admin_write"
ON "site_settings" FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

INSERT INTO "site_settings" ("key", "value", "label") VALUES
  ('logo_text',      'Maria Badari',           'Logo Text'),
  ('logo_tagline',   'Your Dream Gown Awaits',  'Logo Tagline'),
  ('hero_image_url', 'https://images.unsplash.com/photo-1761671613669-3b17b4a71bb9?auto=format&fit=crop&w=1080&q=80', 'Hero Image URL'),
  ('hero_title',     'Find Your Perfect Dress', 'Hero Title'),
  ('hero_subtitle',  'Chat with our intelligent consultant to design and customize your dream wedding dress.', 'Hero Subtitle'),
  ('hero_cta_text',  'Start Consultation',      'Hero CTA Button')
ON CONFLICT ("key") DO NOTHING;
