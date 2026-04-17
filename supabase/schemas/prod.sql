


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone, country)
  VALUES (
    NEW.id,
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_chatbot_session_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_chatbot_session_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_dco_category_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  SELECT "category_id"
  INTO NEW."category_id"
  FROM "customization_options"
  WHERE "id" = NEW."option_id";

  IF NEW."category_id" IS NULL THEN
    RAISE EXCEPTION 'Invalid option_id: % (no matching customization_options row)', NEW."option_id";
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_dco_category_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_rentals_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_rentals_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_user_memory" (
    "user_id" "uuid" NOT NULL,
    "preferences_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "last_update" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_user_memory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attribute_values" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attribute_id" "uuid" NOT NULL,
    "value_key" character varying(80) NOT NULL,
    "label" character varying(120) NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."attribute_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attributes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" character varying(60) NOT NULL,
    "label" character varying(120) NOT NULL,
    "input_type" character varying(20) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "attributes_input_type_check" CHECK ((("input_type")::"text" = ANY ((ARRAY['single'::character varying, 'multi'::character varying])::"text"[])))
);


ALTER TABLE "public"."attributes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chatbot_designer_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "designer_id" "uuid",
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "notified_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    "joined_at" timestamp(0) without time zone,
    CONSTRAINT "chatbot_designer_requests_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying, 'joined'::character varying])::"text"[])))
);


ALTER TABLE "public"."chatbot_designer_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."chatbot_designer_requests" IS 'When accepted: set status=joined, populate chatbot_sessions.conversation_id, insert notifications row for customer.';



CREATE TABLE IF NOT EXISTS "public"."chatbot_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_key" character varying(80) NOT NULL,
    "order_index" smallint DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."chatbot_questions" OWNER TO "postgres";


COMMENT ON TABLE "public"."chatbot_questions" IS 'Ordered MCQ questions asked by the chatbot. Options come from customization_options filtered by category_id.';



CREATE TABLE IF NOT EXISTS "public"."chatbot_session_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "option_id" "uuid" NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."chatbot_session_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chatbot_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "conversation_id" "uuid",
    "dress_id" "uuid",
    "status" character varying(30) DEFAULT 'in_progress'::character varying NOT NULL,
    "request_summary" "text",
    "generated_prompt" "text",
    "image_url" "text",
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chatbot_sessions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['in_progress'::character varying, 'pending_review'::character varying, 'approved'::character varying, 'rejected'::character varying, 'image_requested'::character varying, 'image_generated'::character varying, 'completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."chatbot_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "season" character varying(255) NOT NULL,
    "year" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "designer_id" "uuid",
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_request_options" (
    "request_id" "uuid" NOT NULL,
    "option_id" "uuid" NOT NULL
);


ALTER TABLE "public"."custom_request_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "dress_id" "uuid",
    "status" character varying(255) DEFAULT 'submitted'::character varying NOT NULL,
    "notes" "text" NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "custom_requests_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['submitted'::character varying, 'in_review'::character varying, 'approved'::character varying, 'rejected'::character varying])::"text"[])))
);


ALTER TABLE "public"."custom_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customization_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL
);


ALTER TABLE "public"."customization_categories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."customization_categories"."name" IS 'Examples: neckline, sleeve_type, fabric, color, embroidery';



CREATE TABLE IF NOT EXISTS "public"."customization_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "image_url" "text",
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."customization_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dress_attribute_values" (
    "dress_id" "uuid" NOT NULL,
    "attribute_value_id" "uuid" NOT NULL
);


ALTER TABLE "public"."dress_attribute_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dress_collections" (
    "dress_id" "uuid" NOT NULL,
    "collection_id" "uuid" NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."dress_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dress_customization_options" (
    "dress_id" "uuid" NOT NULL,
    "option_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."dress_customization_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dress_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dress_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."dress_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "silhouette" character varying(255),
    "base_price" numeric(10,2),
    "is_customizable" boolean DEFAULT false,
    "status" character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "dresses_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::"text"[])))
);


ALTER TABLE "public"."dresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "kind" character varying(20) NOT NULL,
    "storage_path" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "duration_ms" integer,
    "size_bytes" bigint,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "message_attachments_kind_check" CHECK ((("kind")::"text" = 'voice'::"text"))
);


ALTER TABLE "public"."message_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_type" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    "is_audio" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    CONSTRAINT "messages_sender_type_check" CHECK ((("sender_type")::"text" = ANY ((ARRAY['customer'::character varying, 'designer'::character varying])::"text"[])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" character varying(255) NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "phone" character varying(255) NOT NULL,
    "country" character varying(255) NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "profile_image_url" "text",
    "dress_size" character varying,
    "date_of_birth" "date",
    CONSTRAINT "profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['guest'::character varying, 'customer'::character varying, 'designer'::character varying, 'admin'::character varying])::"text"[])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."id" IS 'FK -> auth.users.id (Supabase Auth)';



CREATE TABLE IF NOT EXISTS "public"."rentals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "dress_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "notes" "text",
    "status" character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    "created_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(0) without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rentals_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'confirmed'::character varying, 'rejected'::character varying, 'returned'::character varying])::"text"[])))
);


ALTER TABLE "public"."rentals" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_chatbot_session_prompt" AS
 SELECT "s"."id" AS "session_id",
    "s"."customer_id",
    "s"."status",
    "s"."dress_id",
    "string_agg"("co"."description", ', '::"text" ORDER BY "cq"."order_index") AS "assembled_prompt",
    "s"."generated_prompt" AS "saved_prompt",
    "s"."image_url"
   FROM ((("public"."chatbot_sessions" "s"
     JOIN "public"."chatbot_session_answers" "a" ON (("a"."session_id" = "s"."id")))
     JOIN "public"."chatbot_questions" "cq" ON (("cq"."id" = "a"."question_id")))
     JOIN "public"."customization_options" "co" ON (("co"."id" = "a"."option_id")))
  GROUP BY "s"."id", "s"."customer_id", "s"."status", "s"."dress_id", "s"."generated_prompt", "s"."image_url";


ALTER VIEW "public"."v_chatbot_session_prompt" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_chatbot_session_prompt" IS 'Assembles the image-generation prompt from all answers in a chatbot session.';



ALTER TABLE ONLY "public"."ai_user_memory"
    ADD CONSTRAINT "ai_user_memory_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."attribute_values"
    ADD CONSTRAINT "attribute_values_attribute_id_value_key_key" UNIQUE ("attribute_id", "value_key");



ALTER TABLE ONLY "public"."attribute_values"
    ADD CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attributes"
    ADD CONSTRAINT "attributes_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."attributes"
    ADD CONSTRAINT "attributes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chatbot_designer_requests"
    ADD CONSTRAINT "chatbot_designer_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chatbot_questions"
    ADD CONSTRAINT "chatbot_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chatbot_questions"
    ADD CONSTRAINT "chatbot_questions_question_key_key" UNIQUE ("question_key");



ALTER TABLE ONLY "public"."chatbot_session_answers"
    ADD CONSTRAINT "chatbot_session_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chatbot_session_answers"
    ADD CONSTRAINT "chatbot_session_answers_session_id_question_id_key" UNIQUE ("session_id", "question_id");



ALTER TABLE ONLY "public"."chatbot_sessions"
    ADD CONSTRAINT "chatbot_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_request_options"
    ADD CONSTRAINT "custom_request_options_pkey" PRIMARY KEY ("request_id", "option_id");



ALTER TABLE ONLY "public"."custom_requests"
    ADD CONSTRAINT "custom_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customization_categories"
    ADD CONSTRAINT "customization_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customization_options"
    ADD CONSTRAINT "customization_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dress_attribute_values"
    ADD CONSTRAINT "dress_attribute_values_pkey" PRIMARY KEY ("dress_id", "attribute_value_id");



ALTER TABLE ONLY "public"."dress_collections"
    ADD CONSTRAINT "dress_collections_pkey" PRIMARY KEY ("dress_id", "collection_id");



ALTER TABLE ONLY "public"."dress_customization_options"
    ADD CONSTRAINT "dress_customization_options_pkey" PRIMARY KEY ("dress_id", "option_id");



ALTER TABLE ONLY "public"."dress_images"
    ADD CONSTRAINT "dress_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dresses"
    ADD CONSTRAINT "dresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_attachments"
    ADD CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_chatbot_dreq_designer" ON "public"."chatbot_designer_requests" USING "btree" ("designer_id");



CREATE INDEX "idx_chatbot_dreq_session" ON "public"."chatbot_designer_requests" USING "btree" ("session_id");



CREATE INDEX "idx_chatbot_questions_order" ON "public"."chatbot_questions" USING "btree" ("order_index") WHERE ("is_active" = true);



CREATE INDEX "idx_chatbot_session_answers_session" ON "public"."chatbot_session_answers" USING "btree" ("session_id");



CREATE INDEX "idx_chatbot_sessions_customer" ON "public"."chatbot_sessions" USING "btree" ("customer_id");



CREATE INDEX "idx_chatbot_sessions_status" ON "public"."chatbot_sessions" USING "btree" ("status");



CREATE INDEX "idx_collections_season_year" ON "public"."collections" USING "btree" ("season", "year");



CREATE INDEX "idx_conversations_customer" ON "public"."conversations" USING "btree" ("customer_id");



CREATE INDEX "idx_conversations_designer" ON "public"."conversations" USING "btree" ("designer_id");



CREATE INDEX "idx_dav_value" ON "public"."dress_attribute_values" USING "btree" ("attribute_value_id");



CREATE INDEX "idx_dress_collections_collection_id" ON "public"."dress_collections" USING "btree" ("collection_id");



CREATE INDEX "idx_dress_collections_dress_id" ON "public"."dress_collections" USING "btree" ("dress_id");



CREATE INDEX "idx_message_attachments_message_id" ON "public"."message_attachments" USING "btree" ("message_id");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_rentals_customer" ON "public"."rentals" USING "btree" ("customer_id");



CREATE INDEX "idx_rentals_dress" ON "public"."rentals" USING "btree" ("dress_id");



CREATE INDEX "idx_rentals_status" ON "public"."rentals" USING "btree" ("status");



CREATE UNIQUE INDEX "uniq_default_per_dress_category" ON "public"."dress_customization_options" USING "btree" ("dress_id", "category_id") WHERE ("is_default" = true);



CREATE OR REPLACE TRIGGER "trg_chatbot_session_updated_at" BEFORE UPDATE ON "public"."chatbot_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."set_chatbot_session_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "trg_rentals_updated_at" BEFORE UPDATE ON "public"."rentals" FOR EACH ROW EXECUTE FUNCTION "public"."set_rentals_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_dco_category_id" BEFORE INSERT OR UPDATE OF "option_id" ON "public"."dress_customization_options" FOR EACH ROW EXECUTE FUNCTION "public"."set_dco_category_id"();



ALTER TABLE ONLY "public"."ai_user_memory"
    ADD CONSTRAINT "ai_user_memory_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attribute_values"
    ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chatbot_designer_requests"
    ADD CONSTRAINT "cdr_designer_id_foreign" FOREIGN KEY ("designer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chatbot_designer_requests"
    ADD CONSTRAINT "cdr_session_id_foreign" FOREIGN KEY ("session_id") REFERENCES "public"."chatbot_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chatbot_questions"
    ADD CONSTRAINT "chatbot_questions_category_id_foreign" FOREIGN KEY ("category_id") REFERENCES "public"."customization_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."chatbot_sessions"
    ADD CONSTRAINT "chatbot_sessions_conversation_id_foreign" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chatbot_sessions"
    ADD CONSTRAINT "chatbot_sessions_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chatbot_sessions"
    ADD CONSTRAINT "chatbot_sessions_dress_id_foreign" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_designer_id_foreign" FOREIGN KEY ("designer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chatbot_session_answers"
    ADD CONSTRAINT "csa_option_id_foreign" FOREIGN KEY ("option_id") REFERENCES "public"."customization_options"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."chatbot_session_answers"
    ADD CONSTRAINT "csa_question_id_foreign" FOREIGN KEY ("question_id") REFERENCES "public"."chatbot_questions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."chatbot_session_answers"
    ADD CONSTRAINT "csa_session_id_foreign" FOREIGN KEY ("session_id") REFERENCES "public"."chatbot_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_request_options"
    ADD CONSTRAINT "custom_request_options_option_id_foreign" FOREIGN KEY ("option_id") REFERENCES "public"."customization_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_request_options"
    ADD CONSTRAINT "custom_request_options_request_id_foreign" FOREIGN KEY ("request_id") REFERENCES "public"."custom_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_requests"
    ADD CONSTRAINT "custom_requests_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_requests"
    ADD CONSTRAINT "custom_requests_dress_id_foreign" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."customization_options"
    ADD CONSTRAINT "customization_options_category_id_foreign" FOREIGN KEY ("category_id") REFERENCES "public"."customization_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."dress_attribute_values"
    ADD CONSTRAINT "dress_attribute_values_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_values"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dress_attribute_values"
    ADD CONSTRAINT "dress_attribute_values_dress_id_fkey" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dress_collections"
    ADD CONSTRAINT "dress_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dress_collections"
    ADD CONSTRAINT "dress_collections_dress_id_fkey" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dress_customization_options"
    ADD CONSTRAINT "dress_customization_options_category_id_foreign" FOREIGN KEY ("category_id") REFERENCES "public"."customization_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."dress_customization_options"
    ADD CONSTRAINT "dress_customization_options_dress_id_foreign" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dress_customization_options"
    ADD CONSTRAINT "dress_customization_options_option_id_foreign" FOREIGN KEY ("option_id") REFERENCES "public"."customization_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dress_images"
    ADD CONSTRAINT "dress_images_dress_id_foreign" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_attachments"
    ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_foreign" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_dress_id_foreign" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_session_id_foreign" FOREIGN KEY ("session_id") REFERENCES "public"."chatbot_sessions"("id") ON DELETE SET NULL;



CREATE POLICY "Admin can delete collections" ON "public"."collections" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Admin can delete dress_collections" ON "public"."dress_collections" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can insert messages" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can read messages" ON "public"."messages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "ai_memory_self_all" ON "public"."ai_user_memory" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."ai_user_memory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attribute_values" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "attribute_values_privileged_delete" ON "public"."attribute_values" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "attribute_values_privileged_insert" ON "public"."attribute_values" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "attribute_values_privileged_update" ON "public"."attribute_values" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "attribute_values_public_select" ON "public"."attribute_values" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."attributes" "a"
  WHERE (("a"."id" = "attribute_values"."attribute_id") AND ("a"."is_active" = true)))));



ALTER TABLE "public"."attributes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "attributes_privileged_delete" ON "public"."attributes" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "attributes_privileged_insert" ON "public"."attributes" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "attributes_privileged_update" ON "public"."attributes" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "attributes_public_select" ON "public"."attributes" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "chatbot_answers_customer_all" ON "public"."chatbot_session_answers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."chatbot_sessions" "s"
  WHERE (("s"."id" = "chatbot_session_answers"."session_id") AND ("s"."customer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."chatbot_sessions" "s"
  WHERE (("s"."id" = "chatbot_session_answers"."session_id") AND ("s"."customer_id" = "auth"."uid"())))));



CREATE POLICY "chatbot_answers_privileged_select" ON "public"."chatbot_session_answers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



ALTER TABLE "public"."chatbot_designer_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chatbot_dreq_customer_insert" ON "public"."chatbot_designer_requests" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."chatbot_sessions" "s"
  WHERE (("s"."id" = "chatbot_designer_requests"."session_id") AND ("s"."customer_id" = "auth"."uid"())))));



CREATE POLICY "chatbot_dreq_customer_select" ON "public"."chatbot_designer_requests" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."chatbot_sessions" "s"
  WHERE (("s"."id" = "chatbot_designer_requests"."session_id") AND ("s"."customer_id" = "auth"."uid"())))));



CREATE POLICY "chatbot_dreq_privileged_all" ON "public"."chatbot_designer_requests" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



ALTER TABLE "public"."chatbot_questions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chatbot_questions_privileged_write" ON "public"."chatbot_questions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "chatbot_questions_public_select" ON "public"."chatbot_questions" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



ALTER TABLE "public"."chatbot_session_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chatbot_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chatbot_sessions_customer_insert" ON "public"."chatbot_sessions" FOR INSERT TO "authenticated" WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "chatbot_sessions_customer_select" ON "public"."chatbot_sessions" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "chatbot_sessions_customer_update" ON "public"."chatbot_sessions" FOR UPDATE TO "authenticated" USING (("customer_id" = "auth"."uid"())) WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "chatbot_sessions_privileged_select" ON "public"."chatbot_sessions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "chatbot_sessions_privileged_update" ON "public"."chatbot_sessions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "collections_privileged_delete" ON "public"."collections" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "collections_privileged_insert" ON "public"."collections" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "collections_privileged_select_all" ON "public"."collections" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "collections_privileged_update" ON "public"."collections" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "collections_public_read" ON "public"."collections" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "collections_public_select" ON "public"."collections" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_customer_insert" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "conversations_customer_select" ON "public"."conversations" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "conversations_privileged_all" ON "public"."conversations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



ALTER TABLE "public"."custom_request_options" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "custom_request_options_customer_all" ON "public"."custom_request_options" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_requests" "cr"
  WHERE (("cr"."id" = "custom_request_options"."request_id") AND ("cr"."customer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."custom_requests" "cr"
  WHERE (("cr"."id" = "custom_request_options"."request_id") AND ("cr"."customer_id" = "auth"."uid"())))));



ALTER TABLE "public"."custom_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "custom_requests_customer_insert" ON "public"."custom_requests" FOR INSERT TO "authenticated" WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "custom_requests_customer_select" ON "public"."custom_requests" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "custom_requests_privileged_all" ON "public"."custom_requests" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



ALTER TABLE "public"."customization_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customization_categories_public_select" ON "public"."customization_categories" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."customization_options" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customization_options_privileged_write" ON "public"."customization_options" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "customization_options_public_select" ON "public"."customization_options" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "customization_privileged_write" ON "public"."customization_categories" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



ALTER TABLE "public"."dress_attribute_values" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dress_attribute_values_privileged_delete" ON "public"."dress_attribute_values" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_attribute_values_privileged_insert" ON "public"."dress_attribute_values" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_attribute_values_public_select" ON "public"."dress_attribute_values" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."dresses" "d"
  WHERE (("d"."id" = "dress_attribute_values"."dress_id") AND (("d"."status")::"text" = 'published'::"text")))));



ALTER TABLE "public"."dress_collections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dress_collections_privileged_all" ON "public"."dress_collections" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_collections_public_select" ON "public"."dress_collections" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM ("public"."dresses" "d"
     JOIN "public"."collections" "c" ON (("c"."id" = "dress_collections"."collection_id")))
  WHERE (("d"."id" = "dress_collections"."dress_id") AND (("d"."status")::"text" = 'published'::"text") AND ("c"."is_active" = true)))));



ALTER TABLE "public"."dress_customization_options" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dress_customization_options_privileged_write" ON "public"."dress_customization_options" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_customization_options_public_select" ON "public"."dress_customization_options" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."dress_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dress_images_privileged_delete" ON "public"."dress_images" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_images_privileged_select_all" ON "public"."dress_images" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_images_privileged_update" ON "public"."dress_images" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dress_images_public_select" ON "public"."dress_images" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."dresses" "d"
  WHERE (("d"."id" = "dress_images"."dress_id") AND (("d"."status")::"text" = 'published'::"text")))));



CREATE POLICY "dress_images_temp_insert" ON "public"."dress_images" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



ALTER TABLE "public"."dresses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dresses_privileged_delete" ON "public"."dresses" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dresses_privileged_select_all" ON "public"."dresses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dresses_privileged_update" ON "public"."dresses" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "dresses_public_select" ON "public"."dresses" FOR SELECT TO "authenticated", "anon" USING ((("status")::"text" = 'published'::"text"));



CREATE POLICY "dresses_temp_insert" ON "public"."dresses" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



ALTER TABLE "public"."message_attachments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "message_attachments_participant_delete" ON "public"."message_attachments" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_attachments"."message_id") AND (("c"."customer_id" = "auth"."uid"()) OR ("c"."designer_id" = "auth"."uid"()))))));



CREATE POLICY "message_attachments_participant_insert" ON "public"."message_attachments" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_attachments"."message_id") AND (("c"."customer_id" = "auth"."uid"()) OR ("c"."designer_id" = "auth"."uid"()))))));



CREATE POLICY "message_attachments_participant_select" ON "public"."message_attachments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_attachments"."message_id") AND (("c"."customer_id" = "auth"."uid"()) OR ("c"."designer_id" = "auth"."uid"()))))));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_participant_insert" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("c"."customer_id" = "auth"."uid"()) OR ("c"."designer_id" = "auth"."uid"()))))));



CREATE POLICY "messages_participant_select" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("c"."customer_id" = "auth"."uid"()) OR ("c"."designer_id" = "auth"."uid"()))))));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_privileged_insert" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "notifications_self_select" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "notifications_self_update" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_self_insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_self_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_self_update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."rentals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rentals_customer_insert" ON "public"."rentals" FOR INSERT TO "authenticated" WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "rentals_customer_select" ON "public"."rentals" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "rentals_privileged_all" ON "public"."rentals" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['designer'::character varying, 'admin'::character varying])::"text"[]))))));



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_chatbot_session_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_chatbot_session_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_chatbot_session_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_dco_category_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_dco_category_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_dco_category_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_rentals_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_rentals_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_rentals_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."ai_user_memory" TO "anon";
GRANT ALL ON TABLE "public"."ai_user_memory" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_user_memory" TO "service_role";



GRANT ALL ON TABLE "public"."attribute_values" TO "anon";
GRANT ALL ON TABLE "public"."attribute_values" TO "authenticated";
GRANT ALL ON TABLE "public"."attribute_values" TO "service_role";



GRANT ALL ON TABLE "public"."attributes" TO "anon";
GRANT ALL ON TABLE "public"."attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."attributes" TO "service_role";



GRANT ALL ON TABLE "public"."chatbot_designer_requests" TO "anon";
GRANT ALL ON TABLE "public"."chatbot_designer_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."chatbot_designer_requests" TO "service_role";



GRANT ALL ON TABLE "public"."chatbot_questions" TO "anon";
GRANT ALL ON TABLE "public"."chatbot_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."chatbot_questions" TO "service_role";



GRANT ALL ON TABLE "public"."chatbot_session_answers" TO "anon";
GRANT ALL ON TABLE "public"."chatbot_session_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."chatbot_session_answers" TO "service_role";



GRANT ALL ON TABLE "public"."chatbot_sessions" TO "anon";
GRANT ALL ON TABLE "public"."chatbot_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."chatbot_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."custom_request_options" TO "anon";
GRANT ALL ON TABLE "public"."custom_request_options" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_request_options" TO "service_role";



GRANT ALL ON TABLE "public"."custom_requests" TO "anon";
GRANT ALL ON TABLE "public"."custom_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_requests" TO "service_role";



GRANT ALL ON TABLE "public"."customization_categories" TO "anon";
GRANT ALL ON TABLE "public"."customization_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."customization_categories" TO "service_role";



GRANT ALL ON TABLE "public"."customization_options" TO "anon";
GRANT ALL ON TABLE "public"."customization_options" TO "authenticated";
GRANT ALL ON TABLE "public"."customization_options" TO "service_role";



GRANT ALL ON TABLE "public"."dress_attribute_values" TO "anon";
GRANT ALL ON TABLE "public"."dress_attribute_values" TO "authenticated";
GRANT ALL ON TABLE "public"."dress_attribute_values" TO "service_role";



GRANT ALL ON TABLE "public"."dress_collections" TO "anon";
GRANT ALL ON TABLE "public"."dress_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."dress_collections" TO "service_role";



GRANT ALL ON TABLE "public"."dress_customization_options" TO "anon";
GRANT ALL ON TABLE "public"."dress_customization_options" TO "authenticated";
GRANT ALL ON TABLE "public"."dress_customization_options" TO "service_role";



GRANT ALL ON TABLE "public"."dress_images" TO "anon";
GRANT ALL ON TABLE "public"."dress_images" TO "authenticated";
GRANT ALL ON TABLE "public"."dress_images" TO "service_role";



GRANT ALL ON TABLE "public"."dresses" TO "anon";
GRANT ALL ON TABLE "public"."dresses" TO "authenticated";
GRANT ALL ON TABLE "public"."dresses" TO "service_role";



GRANT ALL ON TABLE "public"."message_attachments" TO "anon";
GRANT ALL ON TABLE "public"."message_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."message_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."rentals" TO "anon";
GRANT ALL ON TABLE "public"."rentals" TO "authenticated";
GRANT ALL ON TABLE "public"."rentals" TO "service_role";



GRANT ALL ON TABLE "public"."v_chatbot_session_prompt" TO "anon";
GRANT ALL ON TABLE "public"."v_chatbot_session_prompt" TO "authenticated";
GRANT ALL ON TABLE "public"."v_chatbot_session_prompt" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";




