-- ============================================================
-- Bride Me Up – Initial Schema Migration
-- Generated: 2026-03-13
-- Place this file in: supabase/migrations/
-- ============================================================


-- ============================================================
-- PROFILES (must come first – referenced by almost everything)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID         PRIMARY KEY,  -- references auth.users(id)
  role               VARCHAR(255) NOT NULL,
  full_name          VARCHAR(255) NOT NULL,
  phone              VARCHAR(255) NOT NULL,
  country            VARCHAR(255) NOT NULL,
  profile_image_url  TEXT,
  dress_size         VARCHAR,
  date_of_birth      DATE,
  created_at         TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP             DEFAULT now()
);


-- ============================================================
-- COLLECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS collections (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  season      VARCHAR(255) NOT NULL,
  year        INTEGER      NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  created_by  UUID         NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMP    NOT NULL DEFAULT now()
);


-- ============================================================
-- DRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS dresses (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  silhouette       VARCHAR(255) NOT NULL,
  base_price       NUMERIC      NOT NULL,
  is_customizable  BOOLEAN      NOT NULL DEFAULT false,
  status           VARCHAR(255) NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMP    NOT NULL DEFAULT now()
);


-- ============================================================
-- DRESS IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS dress_images (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  dress_id    UUID      NOT NULL REFERENCES dresses(id),
  image_url   TEXT      NOT NULL,
  is_primary  BOOLEAN   NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);


-- ============================================================
-- DRESS COLLECTIONS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS dress_collections (
  dress_id      UUID      NOT NULL REFERENCES dresses(id),
  collection_id UUID      NOT NULL REFERENCES collections(id),
  created_at    TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (dress_id, collection_id)
);


-- ============================================================
-- ATTRIBUTES & VALUES
-- ============================================================
CREATE TABLE IF NOT EXISTS attributes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(60) NOT NULL UNIQUE,
  label       VARCHAR(120) NOT NULL,
  input_type  VARCHAR(20) NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attribute_values (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID        NOT NULL REFERENCES attributes(id),
  value_key    VARCHAR(80) NOT NULL,
  label        VARCHAR(120) NOT NULL,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMP   NOT NULL DEFAULT now(),
  UNIQUE (attribute_id, value_key)
);

-- Dress ↔ Attribute Values (junction)
CREATE TABLE IF NOT EXISTS dress_attribute_values (
  dress_id           UUID NOT NULL REFERENCES dresses(id),
  attribute_value_id UUID NOT NULL REFERENCES attribute_values(id),
  PRIMARY KEY (dress_id, attribute_value_id)
);


-- ============================================================
-- CUSTOMIZATION CATEGORIES & OPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS customization_categories (
  id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customization_options (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID         NOT NULL REFERENCES customization_categories(id),
  name        VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  image_url   TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT true
);

-- Dress ↔ Customization Options (junction)
CREATE TABLE IF NOT EXISTS dress_customization_options (
  dress_id    UUID    NOT NULL REFERENCES dresses(id),
  option_id   UUID    NOT NULL REFERENCES customization_options(id),
  category_id UUID    NOT NULL REFERENCES customization_categories(id),
  is_default  BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (dress_id, option_id)
);


-- ============================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID      NOT NULL REFERENCES profiles(id),
  designer_id UUID               REFERENCES profiles(id),
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID         NOT NULL REFERENCES conversations(id),
  sender_type     VARCHAR(255) NOT NULL,
  content         TEXT         NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_attachments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID        NOT NULL REFERENCES messages(id),
  kind         VARCHAR(20) NOT NULL,
  storage_path TEXT        NOT NULL,
  mime_type    TEXT        NOT NULL,
  duration_ms  INTEGER,
  size_bytes   BIGINT,
  created_at   TIMESTAMP   NOT NULL DEFAULT now()
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES profiles(id),
  type       VARCHAR(255) NOT NULL,
  message    TEXT         NOT NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMP    NOT NULL DEFAULT now()
);


-- ============================================================
-- CHATBOT
-- ============================================================
CREATE TABLE IF NOT EXISTS customization_categories_chatbot AS
  SELECT * FROM customization_categories WHERE false; -- placeholder comment

-- chatbot_questions references customization_categories
CREATE TABLE IF NOT EXISTS chatbot_questions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID        NOT NULL REFERENCES customization_categories(id),
  question_text TEXT        NOT NULL,
  question_key  VARCHAR(80) NOT NULL UNIQUE,
  order_index   SMALLINT    NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID        NOT NULL REFERENCES profiles(id),
  conversation_id  UUID                 REFERENCES conversations(id),
  dress_id         UUID                 REFERENCES dresses(id),
  status           VARCHAR(30) NOT NULL DEFAULT 'in_progress',
  generated_prompt TEXT,
  image_url        TEXT,
  created_at       TIMESTAMP   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_session_answers (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID      NOT NULL REFERENCES chatbot_sessions(id),
  question_id UUID      NOT NULL REFERENCES chatbot_questions(id),
  option_id   UUID      NOT NULL REFERENCES customization_options(id),
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id)
);

CREATE TABLE IF NOT EXISTS chatbot_designer_requests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES chatbot_sessions(id),
  designer_id UUID                 REFERENCES profiles(id),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  notified_at TIMESTAMP   NOT NULL DEFAULT now(),
  joined_at   TIMESTAMP
);


-- ============================================================
-- RENTALS
-- ============================================================
CREATE TABLE IF NOT EXISTS rentals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES profiles(id),
  dress_id    UUID        NOT NULL REFERENCES dresses(id),
  session_id  UUID                 REFERENCES chatbot_sessions(id),
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  notes       TEXT,
  status      VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT now()
);


-- ============================================================
-- CUSTOM REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_requests (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID         NOT NULL REFERENCES profiles(id),
  dress_id    UUID                  REFERENCES dresses(id),
  status      VARCHAR(255) NOT NULL DEFAULT 'submitted',
  notes       TEXT         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_request_options (
  request_id UUID NOT NULL REFERENCES custom_requests(id),
  option_id  UUID NOT NULL REFERENCES customization_options(id),
  PRIMARY KEY (request_id, option_id)
);


-- ============================================================
-- AI USER MEMORY
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_user_memory (
  user_id          UUID      PRIMARY KEY REFERENCES profiles(id),
  preferences_json JSONB     NOT NULL DEFAULT '{}',
  last_update      TIMESTAMP NOT NULL DEFAULT now()
);