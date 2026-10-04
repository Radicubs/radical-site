import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"cover_id" integer,
  	"excerpt" varchar,
  	"content" jsonb,
  	"youtube_video" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_youtube_video" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"year" numeric,
  	"show_on_homepage" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "albums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "journey_seasons_awards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"award" varchar NOT NULL
  );
  
  CREATE TABLE "journey_seasons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"game" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"record" varchar NOT NULL,
  	"district_rank" varchar,
  	"photo_id" integer,
  	"photo_note" varchar,
  	"tba_url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "outreach_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"year" numeric NOT NULL,
  	"place" varchar NOT NULL,
  	"link" varchar,
  	"photo_id" integer,
  	"show_whole_image" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"season" numeric NOT NULL,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mentors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"website" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"page_logo_id" integer,
  	"wide_logo_id" integer,
  	"light_logo_id" integer,
  	"light_wide_logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_posts_id" integer,
  	"albums_id" integer,
  	"journey_seasons_id" integer,
  	"outreach_events_id" integer,
  	"team_members_id" integer,
  	"mentors_id" integer,
  	"sponsors_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_disciplines_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_disciplines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"copy" varchar NOT NULL,
  	"photo_id" integer
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"season_video_id" integer,
  	"season_video_mobile_id" integer,
  	"season_poster_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "outreach_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric NOT NULL,
  	"suffix" varchar,
  	"label" varchar NOT NULL,
  	"plain" boolean
  );
  
  CREATE TABLE "outreach_page_programs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"copy" varchar NOT NULL,
  	"where" varchar NOT NULL
  );
  
  CREATE TABLE "outreach_page_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "outreach_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_video_id" integer,
  	"hero_poster_id" integer,
  	"intro_photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "robot_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"model_id" integer,
  	"background_id" integer,
  	"poster_id" integer,
  	"approach_id" integer,
  	"morph_source_id" integer,
  	"morph_environment_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_individual_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"team_number" varchar,
  	"location" varchar,
  	"description" varchar NOT NULL,
  	"nonprofit" varchar,
  	"apply_url" varchar NOT NULL,
  	"application_season" numeric,
  	"email" varchar,
  	"donate_url" varchar,
  	"instagram" varchar,
  	"linkedin" varchar,
  	"tiktok" varchar,
  	"tba" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journey_seasons_awards" ADD CONSTRAINT "journey_seasons_awards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journey_seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journey_seasons" ADD CONSTRAINT "journey_seasons_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "outreach_events" ADD CONSTRAINT "outreach_events_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentors" ADD CONSTRAINT "mentors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_page_logo_id_media_id_fk" FOREIGN KEY ("page_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_wide_logo_id_media_id_fk" FOREIGN KEY ("wide_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_light_logo_id_media_id_fk" FOREIGN KEY ("light_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_light_wide_logo_id_media_id_fk" FOREIGN KEY ("light_wide_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journey_seasons_fk" FOREIGN KEY ("journey_seasons_id") REFERENCES "public"."journey_seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_outreach_events_fk" FOREIGN KEY ("outreach_events_id") REFERENCES "public"."outreach_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mentors_fk" FOREIGN KEY ("mentors_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_disciplines_tags" ADD CONSTRAINT "home_page_disciplines_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_disciplines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_disciplines" ADD CONSTRAINT "home_page_disciplines_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_disciplines" ADD CONSTRAINT "home_page_disciplines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_season_video_id_media_id_fk" FOREIGN KEY ("season_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_season_video_mobile_id_media_id_fk" FOREIGN KEY ("season_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_season_poster_id_media_id_fk" FOREIGN KEY ("season_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "outreach_page_stats" ADD CONSTRAINT "outreach_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."outreach_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "outreach_page_programs" ADD CONSTRAINT "outreach_page_programs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."outreach_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "outreach_page_partners" ADD CONSTRAINT "outreach_page_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."outreach_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "outreach_page" ADD CONSTRAINT "outreach_page_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "outreach_page" ADD CONSTRAINT "outreach_page_hero_poster_id_media_id_fk" FOREIGN KEY ("hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "outreach_page" ADD CONSTRAINT "outreach_page_intro_photo_id_media_id_fk" FOREIGN KEY ("intro_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_model_id_media_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_background_id_media_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_approach_id_media_id_fk" FOREIGN KEY ("approach_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_morph_source_id_media_id_fk" FOREIGN KEY ("morph_source_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_morph_environment_id_media_id_fk" FOREIGN KEY ("morph_environment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_individual_sponsors" ADD CONSTRAINT "site_settings_individual_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "blog_posts_cover_idx" ON "blog_posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
  CREATE INDEX "_blog_posts_v_parent_idx" ON "_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_version_version_cover_idx" ON "_blog_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX "_blog_posts_v_version_version_updated_at_idx" ON "_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
  CREATE INDEX "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
  CREATE INDEX "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums_rels_order_idx" ON "albums_rels" USING btree ("order");
  CREATE INDEX "albums_rels_parent_idx" ON "albums_rels" USING btree ("parent_id");
  CREATE INDEX "albums_rels_path_idx" ON "albums_rels" USING btree ("path");
  CREATE INDEX "albums_rels_media_id_idx" ON "albums_rels" USING btree ("media_id");
  CREATE INDEX "journey_seasons_awards_order_idx" ON "journey_seasons_awards" USING btree ("_order");
  CREATE INDEX "journey_seasons_awards_parent_id_idx" ON "journey_seasons_awards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "journey_seasons_year_idx" ON "journey_seasons" USING btree ("year");
  CREATE INDEX "journey_seasons_photo_idx" ON "journey_seasons" USING btree ("photo_id");
  CREATE INDEX "journey_seasons_updated_at_idx" ON "journey_seasons" USING btree ("updated_at");
  CREATE INDEX "journey_seasons_created_at_idx" ON "journey_seasons" USING btree ("created_at");
  CREATE INDEX "outreach_events__order_idx" ON "outreach_events" USING btree ("_order");
  CREATE INDEX "outreach_events_photo_idx" ON "outreach_events" USING btree ("photo_id");
  CREATE INDEX "outreach_events_updated_at_idx" ON "outreach_events" USING btree ("updated_at");
  CREATE INDEX "outreach_events_created_at_idx" ON "outreach_events" USING btree ("created_at");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "mentors__order_idx" ON "mentors" USING btree ("_order");
  CREATE INDEX "mentors_photo_idx" ON "mentors" USING btree ("photo_id");
  CREATE INDEX "mentors_updated_at_idx" ON "mentors" USING btree ("updated_at");
  CREATE INDEX "mentors_created_at_idx" ON "mentors" USING btree ("created_at");
  CREATE INDEX "sponsors__order_idx" ON "sponsors" USING btree ("_order");
  CREATE INDEX "sponsors_logo_idx" ON "sponsors" USING btree ("logo_id");
  CREATE INDEX "sponsors_page_logo_idx" ON "sponsors" USING btree ("page_logo_id");
  CREATE INDEX "sponsors_wide_logo_idx" ON "sponsors" USING btree ("wide_logo_id");
  CREATE INDEX "sponsors_light_logo_idx" ON "sponsors" USING btree ("light_logo_id");
  CREATE INDEX "sponsors_light_wide_logo_idx" ON "sponsors" USING btree ("light_wide_logo_id");
  CREATE INDEX "sponsors_updated_at_idx" ON "sponsors" USING btree ("updated_at");
  CREATE INDEX "sponsors_created_at_idx" ON "sponsors" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_journey_seasons_id_idx" ON "payload_locked_documents_rels" USING btree ("journey_seasons_id");
  CREATE INDEX "payload_locked_documents_rels_outreach_events_id_idx" ON "payload_locked_documents_rels" USING btree ("outreach_events_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_mentors_id_idx" ON "payload_locked_documents_rels" USING btree ("mentors_id");
  CREATE INDEX "payload_locked_documents_rels_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_disciplines_tags_order_idx" ON "home_page_disciplines_tags" USING btree ("_order");
  CREATE INDEX "home_page_disciplines_tags_parent_id_idx" ON "home_page_disciplines_tags" USING btree ("_parent_id");
  CREATE INDEX "home_page_disciplines_order_idx" ON "home_page_disciplines" USING btree ("_order");
  CREATE INDEX "home_page_disciplines_parent_id_idx" ON "home_page_disciplines" USING btree ("_parent_id");
  CREATE INDEX "home_page_disciplines_photo_idx" ON "home_page_disciplines" USING btree ("photo_id");
  CREATE INDEX "home_page_season_video_idx" ON "home_page" USING btree ("season_video_id");
  CREATE INDEX "home_page_season_video_mobile_idx" ON "home_page" USING btree ("season_video_mobile_id");
  CREATE INDEX "home_page_season_poster_idx" ON "home_page" USING btree ("season_poster_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_media_id_idx" ON "home_page_rels" USING btree ("media_id");
  CREATE INDEX "outreach_page_stats_order_idx" ON "outreach_page_stats" USING btree ("_order");
  CREATE INDEX "outreach_page_stats_parent_id_idx" ON "outreach_page_stats" USING btree ("_parent_id");
  CREATE INDEX "outreach_page_programs_order_idx" ON "outreach_page_programs" USING btree ("_order");
  CREATE INDEX "outreach_page_programs_parent_id_idx" ON "outreach_page_programs" USING btree ("_parent_id");
  CREATE INDEX "outreach_page_partners_order_idx" ON "outreach_page_partners" USING btree ("_order");
  CREATE INDEX "outreach_page_partners_parent_id_idx" ON "outreach_page_partners" USING btree ("_parent_id");
  CREATE INDEX "outreach_page_hero_video_idx" ON "outreach_page" USING btree ("hero_video_id");
  CREATE INDEX "outreach_page_hero_poster_idx" ON "outreach_page" USING btree ("hero_poster_id");
  CREATE INDEX "outreach_page_intro_photo_idx" ON "outreach_page" USING btree ("intro_photo_id");
  CREATE INDEX "robot_assets_model_idx" ON "robot_assets" USING btree ("model_id");
  CREATE INDEX "robot_assets_background_idx" ON "robot_assets" USING btree ("background_id");
  CREATE INDEX "robot_assets_poster_idx" ON "robot_assets" USING btree ("poster_id");
  CREATE INDEX "robot_assets_approach_idx" ON "robot_assets" USING btree ("approach_id");
  CREATE INDEX "robot_assets_morph_source_idx" ON "robot_assets" USING btree ("morph_source_id");
  CREATE INDEX "robot_assets_morph_environment_idx" ON "robot_assets" USING btree ("morph_environment_id");
  CREATE INDEX "site_settings_individual_sponsors_order_idx" ON "site_settings_individual_sponsors" USING btree ("_order");
  CREATE INDEX "site_settings_individual_sponsors_parent_id_idx" ON "site_settings_individual_sponsors" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "_blog_posts_v" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "albums_rels" CASCADE;
  DROP TABLE "journey_seasons_awards" CASCADE;
  DROP TABLE "journey_seasons" CASCADE;
  DROP TABLE "outreach_events" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "mentors" CASCADE;
  DROP TABLE "sponsors" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_disciplines_tags" CASCADE;
  DROP TABLE "home_page_disciplines" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "outreach_page_stats" CASCADE;
  DROP TABLE "outreach_page_programs" CASCADE;
  DROP TABLE "outreach_page_partners" CASCADE;
  DROP TABLE "outreach_page" CASCADE;
  DROP TABLE "robot_assets" CASCADE;
  DROP TABLE "site_settings_individual_sponsors" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum__blog_posts_v_version_status";
  DROP TYPE "public"."enum_users_role";`)
}
