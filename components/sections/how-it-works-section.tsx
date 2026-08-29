import { AnimatedSection } from "@/components/ui/animated-section";
import type { Award } from "@/data/awards";

export function HowItWorksSection({ awards }: { awards: Award[] }) {
  return (
    <section className="section awards-section">
      <div className="wrap">
        <AnimatedSection>
          <p className="eyebrow">Awards</p>
          <p className="section-copy">From rookie honors to creativity, sustainability, team spirit, and gracious professionalism.</p>
        </AnimatedSection>

        <div className="award-ledger" role="region" aria-label="Awards archive" tabIndex={0}>
          <div className="award-ledger-head" aria-hidden="true">
            <span>No.</span><span>Year</span><span>Award</span><span>Event</span><span>Link</span>
          </div>
          {awards.map((award, index) => (
            <AnimatedSection className="award-row" key={`${award.year}-${award.name}-${award.event}`} delay={(index % 6) * 0.025}>
              <a className="award" href={award.href} target="_blank" rel="noreferrer">
                <span className="award-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="award-year">{award.year}</span>
                <span className="award-title">
                  <span className="award-image"><img src={award.image} alt="" loading="lazy" decoding="async" /></span>
                  <span className="award-name">{award.name}</span>
                </span>
                <span className="award-event">{award.event}</span>
                <span className="award-arrow" aria-hidden="true">↗</span>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
