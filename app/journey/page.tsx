import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { journeySeasons } from "@/data/journey";

export const metadata: Metadata = {
  title: "Journey | Radicubs",
  description: "Follow Radicubs FRC Team 7503 from its 2019 rookie season through today."
};

export default function JourneyPage() {
  return (
    <main>
      <Navbar />
      <section className="page-hero">
        <div className="wrap">
          <AnimatedSection>
            <p className="eyebrow">2019 → 2026</p>
            <h1 className="page-title">Our Journey</h1>
            <p className="section-copy">Season by season, see how Team 7503 has grown from a rookie team in 2019 to repeated district-championship appearances and a broader student-led program.</p>
          </AnimatedSection>

          <div className="journey-list">
            {[...journeySeasons].reverse().map((season, index) => (
              <AnimatedSection key={season.year} delay={(index % 4) * 0.05}>
                <div className="journey-item">
                  <div className="journey-year-dot">{season.year}</div>
                  <article className="journey-card" data-tilt-card>
                    <div className="journey-copy">
                      <p className="journey-season">FRC {season.year}</p>
                      <h2 className="journey-title">{season.game}</h2>
                      <p className="journey-summary">{season.summary}</p>
                      <div className="journey-stats">
                        <span className="journey-stat">{season.record}</span>
                        {season.districtRank && <span className="journey-stat">{season.districtRank}</span>}
                      </div>
                      {season.awards.length > 0 && (
                        <p className="journey-awards"><strong>Awards:</strong> {season.awards.join(" · ")}</p>
                      )}
                      <a className="journey-source" href={season.tbaUrl} target="_blank" rel="noreferrer">
                        <span className="tba-mark" aria-hidden="true" />
                        View season on The Blue Alliance
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <div className={`journey-media${season.image ? " journey-media-photo" : ""}`}>
                      {season.image ? (
                        <img src={season.image} alt={`Radicubs FRC Team 7503 robot, ${season.year} season`} loading="lazy" decoding="async" />
                      ) : (
                        <div className="journey-no-media"><div><strong>No TBA robot photo available</strong><span>{season.imageNote}</span></div></div>
                      )}
                    </div>
                  </article>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
