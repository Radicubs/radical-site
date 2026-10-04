import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getJourneySeasons } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Journey | Radicubs",
  description: "See how Radicubs has grown, one robot and one season at a time, since 2019."
};

export default async function JourneyPage() {
  const journeySeasons = await getJourneySeasons();

  return (
    <main>
      <Navbar />
      <section className="page-hero">
        <div className="wrap">
          <AnimatedSection>
            <h1 className="page-title">Our Journey</h1>
            <p className="section-copy">Every robot has a story. Here's ours, from our first season in 2019 to now.</p>
          </AnimatedSection>

          <div className="journey-list">
            {[...journeySeasons].reverse().map((season, index) => {
              const image = season.image;
              return (
              <AnimatedSection key={season.year} delay={(index % 4) * 0.05}>
                <div className="journey-item">
                  <div className="journey-year-dot">{season.year}</div>
                  <article className="journey-card" data-tilt-card>
                    <div className="journey-copy">
                      <p className="journey-season">FRC {season.year}</p>
                      <h2 className="journey-title">{season.game}</h2>
                      <p className="journey-summary">{season.summary}</p>
                      {season.awards.length > 0 && (
                        <p className="journey-awards"><strong>Awards:</strong> {season.awards.join(" · ")}</p>
                      )}
                      <a className="journey-source" href={season.tbaUrl} target="_blank" rel="noreferrer">
                        <span className="tba-mark" aria-hidden="true" />
                        View season on The Blue Alliance
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <div className={`journey-media${image ? " journey-media-photo" : ""}`}>
                      {image ? (
                        <img src={image} alt={`Radicubs ${season.year} robot`} loading="lazy" />
                      ) : (
                        <div className="journey-no-media"><div><strong>No robot photo for this season</strong><span>{season.imageNote}</span></div></div>
                      )}
                    </div>
                  </article>
                </div>
              </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
