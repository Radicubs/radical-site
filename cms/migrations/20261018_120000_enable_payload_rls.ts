import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// These tables are accessed through Payload's server-side database connection.
// Supabase Auth does not require Data API access to Payload's users or content.
// No policies means anon/authenticated cannot read or mutate rows through that API.
// Do not FORCE RLS: Payload's table owner / BYPASSRLS role must retain access.
const tables = [
  '_blog_posts_v',
  'albums',
  'albums_rels',
  'blog_posts',
  'home_page',
  'home_page_disciplines',
  'home_page_disciplines_tags',
  'home_page_impact',
  'home_page_rels',
  'journey_seasons',
  'journey_seasons_awards',
  'media',
  'mentors',
  'outreach_events',
  'outreach_page',
  'outreach_page_partners',
  'outreach_page_programs',
  'outreach_page_stats',
  'payload_kv',
  'payload_locked_documents',
  'payload_locked_documents_rels',
  'payload_migrations',
  'payload_preferences',
  'payload_preferences_rels',
  'site_settings',
  'site_settings_individual_sponsors',
  'sponsors',
  'team_members',
  'team_members_memberships',
  'team_roles',
  'team_seasons',
  'users',
  'users_sessions',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of tables) {
    await db.execute(sql`ALTER TABLE ${sql.identifier('public')}.${sql.identifier(table)} ENABLE ROW LEVEL SECURITY`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Explicit rollback restores the prior state, including its Data API exposure.
  for (const table of tables) {
    await db.execute(sql`ALTER TABLE ${sql.identifier('public')}.${sql.identifier(table)} DISABLE ROW LEVEL SECURITY`)
  }
}
