import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_team_members_glow_icon" AS ENUM('auto', 'none', 'code', 'mechanical', 'cad', 'business', 'media');
  ALTER TABLE "team_members" ADD COLUMN "glow_icon" "enum_team_members_glow_icon" DEFAULT 'auto';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team_members" DROP COLUMN "glow_icon";
  DROP TYPE "public"."enum_team_members_glow_icon";`)
}
