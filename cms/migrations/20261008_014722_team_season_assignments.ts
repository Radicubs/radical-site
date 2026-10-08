import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "team_members_memberships" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season_id" integer NOT NULL,
  	"role_id" integer NOT NULL
  );
  
  CREATE TABLE "team_roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_seasons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "team_members" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "team_members" ALTER COLUMN "season" DROP NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_roles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_seasons_id" integer;
  ALTER TABLE "team_members_memberships" ADD CONSTRAINT "team_members_memberships_season_id_team_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."team_seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_memberships" ADD CONSTRAINT "team_members_memberships_role_id_team_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."team_roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_memberships" ADD CONSTRAINT "team_members_memberships_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "team_members_memberships_order_idx" ON "team_members_memberships" USING btree ("_order");
  CREATE INDEX "team_members_memberships_parent_id_idx" ON "team_members_memberships" USING btree ("_parent_id");
  CREATE INDEX "team_members_memberships_season_idx" ON "team_members_memberships" USING btree ("season_id");
  CREATE INDEX "team_members_memberships_role_idx" ON "team_members_memberships" USING btree ("role_id");
  CREATE UNIQUE INDEX "team_roles_name_idx" ON "team_roles" USING btree ("name");
  CREATE INDEX "team_roles_updated_at_idx" ON "team_roles" USING btree ("updated_at");
  CREATE INDEX "team_roles_created_at_idx" ON "team_roles" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_seasons_year_idx" ON "team_seasons" USING btree ("year");
  CREATE INDEX "team_seasons_updated_at_idx" ON "team_seasons" USING btree ("updated_at");
  CREATE INDEX "team_seasons_created_at_idx" ON "team_seasons" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_roles_fk" FOREIGN KEY ("team_roles_id") REFERENCES "public"."team_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_seasons_fk" FOREIGN KEY ("team_seasons_id") REFERENCES "public"."team_seasons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_team_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("team_roles_id");
  CREATE INDEX "payload_locked_documents_rels_team_seasons_id_idx" ON "payload_locked_documents_rels" USING btree ("team_seasons_id");

  -- Keep existing people and photo IDs intact while converting their assignments.
  INSERT INTO "team_roles" ("name") SELECT DISTINCT "role" FROM "team_members" WHERE "role" IS NOT NULL;
  INSERT INTO "team_seasons" ("year", "title")
    SELECT DISTINCT "season", "season"::text || '–' || ("season" + 1)::text
    FROM "team_members" WHERE "season" IS NOT NULL;
  INSERT INTO "team_members_memberships" ("_order", "_parent_id", "id", "season_id", "role_id")
    SELECT 1, m.id, 'legacy-' || m.id::text, s.id, r.id
    FROM "team_members" m JOIN "team_seasons" s ON s.year = m.season JOIN "team_roles" r ON r.name = m.role;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- A rollback to one season per person cannot preserve multi-season profiles.
   -- Stop rather than silently discarding assignments created with the new editor.
   DO $$ BEGIN
     IF EXISTS (SELECT 1 FROM "team_members_memberships" GROUP BY "_parent_id" HAVING count(*) > 1)
       THEN RAISE EXCEPTION 'Cannot roll back people with multiple season assignments';
     END IF;
     IF EXISTS (SELECT 1 FROM "team_members" m WHERE (m.role IS NULL OR m.season IS NULL) AND NOT EXISTS (SELECT 1 FROM "team_members_memberships" a WHERE a._parent_id = m.id))
       THEN RAISE EXCEPTION 'Cannot roll back unassigned people to the old required season/role fields';
     END IF;
   END $$;
   UPDATE "team_members" m SET "role" = r.name, "season" = s.year
     FROM "team_members_memberships" a JOIN "team_roles" r ON r.id = a.role_id JOIN "team_seasons" s ON s.id = a.season_id
     WHERE a._parent_id = m.id;
   ALTER TABLE "team_members_memberships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_seasons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_roles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_seasons_fk";
  
  DROP INDEX "payload_locked_documents_rels_team_roles_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_seasons_id_idx";
  ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "team_members" ALTER COLUMN "season" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_roles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_seasons_id";
  DROP TABLE "team_members_memberships" CASCADE;
  DROP TABLE "team_roles" CASCADE;
  DROP TABLE "team_seasons" CASCADE;`)
}
