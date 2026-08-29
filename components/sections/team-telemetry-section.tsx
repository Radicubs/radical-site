"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { journeySeasons } from "@/data/journey";
import { ComposedChart } from "@/components/charts/composed-chart";
import { SeriesBar } from "@/components/charts/series-bar";
import { Line } from "@/components/charts/line";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { ChartTooltip } from "@/components/charts/tooltip";

const matchData = journeySeasons.flatMap((season) => {
  const match = season.record.match(/(\d+)[–-](\d+)/);
  if (!match) return [];
  const wins = Number(match[1]);
  const losses = Number(match[2]);
  return [{ date: new Date(season.year, 0, 1), year: String(season.year), wins, losses, matches: wins + losses }];
});

const awardData = journeySeasons.map((season) => ({
  year: String(season.year),
  awards: season.awards.length
}));

export function TeamTelemetrySection({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "telemetry telemetry-compact" : "section telemetry"}>
      <div className="wrap">
        <AnimatedSection>
          <div className="section-head-row telemetry-heading">
            <div>
              <p className="eyebrow">Team telemetry</p>
              <p className="section-copy">Official results and awards from Team 7503’s competition history.</p>
            </div>
            <div className="telemetry-source">SOURCE / THE BLUE ALLIANCE</div>
          </div>
        </AnimatedSection>
        <div className="telemetry-grid">
          <AnimatedSection>
            <article className="telemetry-panel" data-tilt-card>
              <div className="telemetry-panel-head">
                <div><span>01</span><h3>Official match record</h3></div>
                <div className="chart-key"><i className="key-wins" />Wins <i className="key-losses" />Losses <i className="key-total" />Matches</div>
              </div>
              <ComposedChart data={matchData} xDataKey="date" aspectRatio="16 / 8" margin={{ top: 22, right: 18, bottom: 26, left: 34 }} maxBarSize={22} barGap={3}>
                <Grid stroke="rgba(255,255,255,.09)" strokeDasharray="2,5" />
                <SeriesBar dataKey="wins" fill="#66ff55" radius={2} />
                <SeriesBar dataKey="losses" fill="#3b443e" radius={2} />
                <Line dataKey="matches" stroke="#eef5ef" strokeWidth={1.5} showMarkers fadeEdges={false} />
                <YAxis numTicks={4} />
                <ChartTooltip showDatePill={false} rows={(point) => [
                  { label: "Wins", value: Number(point.wins), color: "#66ff55" },
                  { label: "Losses", value: Number(point.losses), color: "#667069" },
                  { label: "Matches", value: Number(point.matches), color: "#eef5ef" }
                ]} />
              </ComposedChart>
              <div className="telemetry-years">{matchData.map((item) => <span key={item.year}>{item.year}</span>)}</div>
            </article>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <article className="telemetry-panel" data-tilt-card>
              <div className="telemetry-panel-head">
                <div><span>02</span><h3>Awards by season</h3></div>
                <strong>12 TOTAL</strong>
              </div>
              <BarChart data={awardData} xDataKey="year" aspectRatio="16 / 8" margin={{ top: 22, right: 18, bottom: 36, left: 34 }} barGap={0.34}>
                <Grid stroke="rgba(255,255,255,.09)" strokeDasharray="2,5" />
                <Bar dataKey="awards" fill="#66ff55" lineCap={2} minBarHeight={2} />
                <BarXAxis showAllLabels />
                <YAxis numTicks={4} />
                <ChartTooltip showDatePill={false} rows={(point) => [
                  { label: "Awards", value: Number(point.awards), color: "#66ff55" }
                ]} />
              </BarChart>
            </article>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
