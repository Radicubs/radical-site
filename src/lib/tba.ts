const TEAM_KEY = "frc7503";

export interface AwardRecipient {
  team_key: string | null;
  awardee: string | null;
}

export interface Award {
  name: string;
  award_type: number;
  event_key: string;
  recipient_list: AwardRecipient[];
  year: number;
}

/**
 * Fetches data from The Blue Alliance API
 * @param endpoint - The endpoint to fetch from
 * @returns
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  if (endpoint.startsWith("/")) {
    endpoint = endpoint.slice(1);
  }

  const res = await fetch(`https://www.thebluealliance.com/api/v3/${endpoint}`, {
    headers: {
      "X-TBA-Auth-Key": import.meta.env.TBA_API_KEY
    }
  });

  if (!res.ok) {
    throw new Error(`The Blue Alliance API request failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

export interface TeamEvent {
  key: string;
  name: string;
  short_name: string | null;
  city: string | null;
  state_prov: string | null;
  year: number;
}

/**
 * Gets all of the team's events, keyed by event key
 * @returns
 */
export async function getEventsByKey(): Promise<Record<string, TeamEvent>> {
  const events = await fetchApi<TeamEvent[]>(`team/${TEAM_KEY}/events`);
  return Object.fromEntries(events.map(event => [event.key, event]));
}

/**
 * Gets all of the team's awards across all years, grouped by year
 * @returns
 */
export async function getAwardsByYear(): Promise<Partial<Record<number, Award[]>>> {
  const awards = await fetchApi<Award[]>(`team/${TEAM_KEY}/awards`);
  return Object.groupBy(awards, (award) => award.year);
}
