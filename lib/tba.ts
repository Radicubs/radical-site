import "server-only";
import { awards as fallbackAwards, type Award as SiteAward } from "@/data/awards";

type TbaAward = { name: string; event_key: string; year: number };
type TbaEvent = { key: string; name: string; short_name: string | null; city: string | null; year: number };

const awardArtwork: Array<[RegExp, string]> = [
  [/creativity/i, "/awards/creativity.svg"],
  [/team spirit/i, "/awards/team-spirit.svg"],
  [/sustainability/i, "/awards/sustainability.svg"],
  [/judges/i, "/awards/judges.svg"],
  [/gracious professionalism/i, "/awards/gracious-professionalism.svg"],
  [/entrepreneurship/i, "/awards/entrepreneurship.svg"],
  [/rookie all.star/i, "/awards/rookie-all-star.svg"],
  [/highest rookie seed/i, "/awards/highest-rookie-seed.svg"],
  [/rookie inspiration/i, "/awards/rookie-inspiration.svg"]
];

async function tbaFetch<T>(endpoint: string): Promise<T | null> {
  const key = process.env.TBA_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch(`https://www.thebluealliance.com/api/v3/${endpoint}`, {
      headers: { "X-TBA-Auth-Key": key },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 }
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function getAwards(): Promise<SiteAward[]> {
  const [awards, events] = await Promise.all([
    tbaFetch<TbaAward[]>("team/frc7503/awards"),
    tbaFetch<TbaEvent[]>("team/frc7503/events")
  ]);
  if (!awards?.length || !events?.length) return fallbackAwards;
  const eventsByKey = new Map(events.map((event) => [event.key, event]));
  return awards
    .map((award) => {
      const event = eventsByKey.get(award.event_key);
      return {
        year: award.year,
        name: award.name,
        event: event?.city || event?.short_name || event?.name || award.event_key,
        href: `https://www.thebluealliance.com/event/${award.event_key}`,
        image: awardArtwork.find(([pattern]) => pattern.test(award.name))?.[1] || "/awards/frc-judged-trophy.jpg"
      };
    })
    .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
}
