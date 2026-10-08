import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team_members_memberships" ADD COLUMN "photo_id" integer;
  ALTER TABLE "team_members" ADD COLUMN "identity_key" varchar;
  ALTER TABLE "team_members" ADD COLUMN "merged_profiles" jsonb;
  ALTER TABLE "team_members_memberships" ADD CONSTRAINT "team_members_memberships_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "team_members_memberships_photo_idx" ON "team_members_memberships" USING btree ("photo_id");
  CREATE UNIQUE INDEX "team_members_identity_key_idx" ON "team_members" USING btree ("identity_key");

  -- Freeze each legacy season's photo before combining recurring profiles.
  UPDATE team_members_memberships a SET photo_id = m.photo_id FROM team_members m WHERE m.id = a._parent_id;
  CREATE TEMP TABLE _team_profile_map ON COMMIT DROP AS
    SELECT id, lower(btrim(regexp_replace(name, '[[:space:]]+', ' ', 'g'))) AS identity_key,
      first_value(id) OVER (
        PARTITION BY lower(btrim(regexp_replace(name, '[[:space:]]+', ' ', 'g')))
        ORDER BY season DESC NULLS LAST, updated_at DESC, id DESC
      ) AS canonical_id
    FROM team_members;

  -- Keep complete source records privately so merging is reversible before edits.
  UPDATE team_members canonical SET merged_profiles = jsonb_build_object(
    'profiles', (SELECT jsonb_agg(to_jsonb(m) ORDER BY m.id) FROM team_members m JOIN _team_profile_map map ON map.id = m.id WHERE map.canonical_id = canonical.id),
    'memberships', (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.id) FROM team_members_memberships a JOIN _team_profile_map map ON map.id = a._parent_id WHERE map.canonical_id = canonical.id)
  ) WHERE canonical.id IN (SELECT canonical_id FROM _team_profile_map GROUP BY canonical_id HAVING count(*) > 1);

  -- If the import repeated a person in the same season, keep the latest entry
  -- with a photo. Every source entry is still present in the private archive.
  WITH ranked AS (
    SELECT a.id, row_number() OVER (
      PARTITION BY map.canonical_id, a.season_id
      ORDER BY (a.photo_id IS NOT NULL) DESC, m.updated_at DESC, m.id DESC, a.id
    ) AS position
    FROM team_members_memberships a JOIN _team_profile_map map ON map.id = a._parent_id JOIN team_members m ON m.id = map.id
  ) DELETE FROM team_members_memberships WHERE id IN (SELECT id FROM ranked WHERE position > 1);
  UPDATE team_members_memberships a SET _parent_id = map.canonical_id FROM _team_profile_map map WHERE map.id = a._parent_id;
  WITH ordered AS (
    SELECT a.id, row_number() OVER (PARTITION BY a._parent_id ORDER BY s.year DESC, a.id) AS position
    FROM team_members_memberships a JOIN team_seasons s ON s.id = a.season_id
  ) UPDATE team_members_memberships a SET _order = ordered.position FROM ordered WHERE ordered.id = a.id;
  DELETE FROM team_members m USING _team_profile_map map WHERE m.id = map.id AND map.id <> map.canonical_id;
  UPDATE team_members m SET
    name = btrim(regexp_replace(m.name, '[[:space:]]+', ' ', 'g')),
    identity_key = map.identity_key,
    photo_id = (SELECT a.photo_id FROM team_members_memberships a JOIN team_seasons s ON s.id = a.season_id WHERE a._parent_id = m.id AND a.photo_id IS NOT NULL ORDER BY s.year DESC LIMIT 1)
    FROM _team_profile_map map WHERE map.id = m.id;
  UPDATE team_members m SET merged_profiles = merged_profiles || jsonb_build_object(
    'mergedProfile', to_jsonb(m) - 'merged_profiles',
    'mergedMemberships', (SELECT jsonb_agg(to_jsonb(a) ORDER BY a._order) FROM team_members_memberships a WHERE a._parent_id = m.id)
  ) WHERE merged_profiles IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- Refuse to discard edits made after consolidation, or independent season photos.
   DO $$ BEGIN
     IF EXISTS (SELECT 1 FROM team_members m WHERE merged_profiles IS NOT NULL AND (
       (to_jsonb(m) - 'merged_profiles') IS DISTINCT FROM merged_profiles->'mergedProfile'
       OR (SELECT jsonb_agg(to_jsonb(a) ORDER BY a._order) FROM team_members_memberships a WHERE a._parent_id = m.id) IS DISTINCT FROM merged_profiles->'mergedMemberships'
     )) THEN RAISE EXCEPTION 'Cannot automatically restore merged profiles after they have been edited; original records are preserved in merged_profiles'; END IF;
     IF EXISTS (SELECT 1 FROM team_members_memberships a JOIN team_members m ON m.id = a._parent_id WHERE m.merged_profiles IS NULL AND a.photo_id IS DISTINCT FROM m.photo_id)
       THEN RAISE EXCEPTION 'Cannot remove season photos that differ from the default profile photo'; END IF;
   END $$;
   CREATE TEMP TABLE _team_profile_restore ON COMMIT DROP AS SELECT merged_profiles AS backup FROM team_members WHERE merged_profiles IS NOT NULL;
   DELETE FROM team_members WHERE merged_profiles IS NOT NULL;
   INSERT INTO team_members SELECT (jsonb_populate_record(NULL::team_members, profile)).*
     FROM _team_profile_restore CROSS JOIN LATERAL jsonb_array_elements(backup->'profiles') profile;
   INSERT INTO team_members_memberships SELECT (jsonb_populate_record(NULL::team_members_memberships, assignment)).*
     FROM _team_profile_restore CROSS JOIN LATERAL jsonb_array_elements(backup->'memberships') assignment;
   ALTER TABLE "team_members_memberships" DROP CONSTRAINT "team_members_memberships_photo_id_media_id_fk";
  
  DROP INDEX "team_members_memberships_photo_idx";
  DROP INDEX "team_members_identity_key_idx";
  ALTER TABLE "team_members_memberships" DROP COLUMN "photo_id";
  ALTER TABLE "team_members" DROP COLUMN "identity_key";
  ALTER TABLE "team_members" DROP COLUMN "merged_profiles";`)
}
