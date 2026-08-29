"use client";

import { useState } from "react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { TeamCard } from "@/components/team/team-card";
import type { TeamRoster } from "@/lib/cms";

export function TeamRosters({ rosters }: { rosters: TeamRoster[] }) {
  const [year, setYear] = useState(rosters[0]?.year);
  const active = rosters.find((roster) => roster.year === year) ?? rosters[0];
  if (!active) return null;

  return (
    <>
      {rosters.length > 1 && (
        <div className="team-season-bar">
          <label htmlFor="team-season">Season</label>
          <div className="team-season-select">
            <select id="team-season" value={active.year} onChange={(event) => setYear(Number(event.target.value))}>
              {rosters.map((roster) => (
                <option key={roster.year} value={roster.year}>
                  {roster.year} – {roster.year + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className="team-grid">
        {active.members.map((member, index) => (
          <AnimatedSection key={`${active.year}-${member.name}`} delay={(index % 10) * 0.025}>
            <TeamCard member={member} />
          </AnimatedSection>
        ))}
      </div>
    </>
  );
}
