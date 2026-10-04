import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "robot_assets" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_model_id_media_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_background_id_media_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_approach_id_media_id_fk" FOREIGN KEY ("approach_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_morph_source_id_media_id_fk" FOREIGN KEY ("morph_source_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "robot_assets" ADD CONSTRAINT "robot_assets_morph_environment_id_media_id_fk" FOREIGN KEY ("morph_environment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "robot_assets_model_idx" ON "robot_assets" USING btree ("model_id");
  CREATE INDEX "robot_assets_background_idx" ON "robot_assets" USING btree ("background_id");
  CREATE INDEX "robot_assets_poster_idx" ON "robot_assets" USING btree ("poster_id");
  CREATE INDEX "robot_assets_approach_idx" ON "robot_assets" USING btree ("approach_id");
  CREATE INDEX "robot_assets_morph_source_idx" ON "robot_assets" USING btree ("morph_source_id");
  CREATE INDEX "robot_assets_morph_environment_idx" ON "robot_assets" USING btree ("morph_environment_id");`)
}
