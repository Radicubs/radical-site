/** Keep migrations on a session connection; share backend sessions for web requests. */
export function databaseConnectionString(
  databaseUrl: string,
  { migration = false, migrationUrl }: { migration?: boolean; migrationUrl?: string } = {}
) {
  if (migration) return migrationUrl?.trim() || databaseUrl;

  try {
    const url = new URL(databaseUrl);
    // Supabase's shared pooler uses the same host and credentials for both modes.
    // Session mode reserves one backend connection per serverless client, which
    // exhausts small projects even when each instance has a small pg pool.
    if (url.hostname.endsWith(".pooler.supabase.com") && url.port === "5432") {
      url.port = "6543";
      return url.toString();
    }
  } catch {
    // Leave invalid connection strings to the database driver's validation.
  }
  return databaseUrl;
}
