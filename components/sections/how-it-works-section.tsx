import type { Award } from "@/data/awards";
import { rich } from "@/components/ui/rich-text";
import { plain, type PageText } from "@/lib/page-text";
import "./awards-ledger.css";

const shortGame = (game: string) => game.replace(/^Destination:\s*/i, "");

const cleanName = (name: string) => name.replace(/\s+sponsored by.*$/i, "");

/** Awards grouped by season, newest first, keeping the source order within a season. */
function bySeason(awards: Award[]) {
  const seasons = new Map<number, Award[]>();
  for (const award of awards) seasons.set(award.year, [...(seasons.get(award.year) ?? []), award]);
  return [...seasons.entries()].sort(([a], [b]) => b - a);
}

// Header shows the season's FRC game (the outlined year already shows the year).
export function HowItWorksSection({ awards, games, text: t }: { awards: Award[]; games: Record<number, string>; text: PageText["home"] }) {
  const gameFor = (year: number) => games[year];
  const seasons = bySeason(awards);
  const firstYear = Math.min(...awards.map((award) => award.year));

  return <section className="section awards-section"><div className="wrap">
    <div className="section-head-row awards-head">
      <h2>{rich(t.awardsTitle)}</h2>
      <p className="section-copy">{t.awardsCopy}</p>
    </div>

    <div className="awards-ledger">
      <div className="awards-cell awards-total">
        <span className="awards-total-number">{awards.length}</span>
        <span className="awards-total-label">{plain(t.awardsTotal, { year: firstYear })}<br />{t.awardsTeam}</span>
      </div>

      {seasons.map(([year, list]) => <section className="awards-cell awards-season" key={year} data-year={year} data-count={list.length} aria-label={`${year} season awards`}>
        <header>
          <span className="awards-game" title={gameFor(year) ? `${gameFor(year)} (${year})` : undefined}>{gameFor(year) ? shortGame(gameFor(year)!) : year}</span>
          <span className="awards-season-count">{list.length} {list.length === 1 ? "award" : "awards"}</span>
        </header>
        <ul>{list.map((award) => <li key={`${award.name}-${award.event}`}>
          <a href={award.href} target="_blank" rel="noopener noreferrer" aria-label={`${cleanName(award.name)}, ${award.year}, ${award.event}. View on The Blue Alliance`}>
            <span className="awards-marker" aria-hidden="true" />
            <span className="awards-name">{cleanName(award.name)}</span>
            <span className="awards-leader" aria-hidden="true" />
            <span className="awards-event">{award.event}</span>
          </a>
        </li>)}</ul>
      </section>)}
    </div>
  </div></section>;
}
