import { AnimatedSection } from "@/components/ui/animated-section";
import type { DisciplineImages } from "@/lib/cms";

const features = [
  { key: "mechanical", title: "Mechanical" },
  { key: "cad", title: "CAD & Design" },
  { key: "programming", title: "Programming" },
  { key: "business", title: "Business" },
  { key: "media", title: "Media" }
] as const;

export function FeatureSection({ images }: { images: DisciplineImages }) {
  return (
    <section className="section discipline-section">
      <div className="discipline-wrap">
        <AnimatedSection>
          <p className="eyebrow discipline-eyebrow">Explore disciplines</p>
          <div className="discipline-menu" aria-label="Team disciplines">
            {features.map(({ key, title }, index) => {
              const image = images[key];
              return <div className="discipline-menu-item" key={title}>
                <div className="discipline-menu-row">
                  <h3>{title}</h3>
                </div>
                <div className="discipline-flow" aria-hidden="true">
                  <div className={`discipline-flow-track discipline-flow-track-${index % 2 ? "reverse" : "forward"}`}>
                    {Array.from({ length: 9 }, (_, repeat) => (
                      <span className="discipline-flow-unit" key={repeat}>
                        <b>{title}</b>
                        {image && <img src={image} alt="" loading="lazy" decoding="async" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>;
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
