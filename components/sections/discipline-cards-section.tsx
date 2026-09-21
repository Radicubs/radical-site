"use client";

import { useRef, useState } from "react";
import { Circle, Code, Cog, Megaphone, Ruler } from "lucide-react";
import CardSwap, { Card } from "@/components/CardSwap";
import RippleDistortion from "@/components/RippleDistortion";
import type { DisciplineImages } from "@/lib/cms";

const disciplines = [
  { key: "mechanical", title: "Mechanical", Icon: Cog, copy: "Design, machine and assemble the drivetrain, superstructure and every mechanism on the robot." },
  { key: "cad", title: "CAD & Design", Icon: Ruler, copy: "Model the whole machine in CAD and validate fits and tolerances before a single chip is cut." },
  { key: "programming", title: "Programming", Icon: Code, copy: "Autonomous routines, vision targeting, odometry and the controls our drivers trust in match." },
  { key: "business", title: "Business", Icon: Circle, copy: "Fundraising, sponsor relations and the operations that keep a student-led 501(c)(3) running." },
  { key: "media", title: "Media", Icon: Megaphone, copy: "Photo, video, design and the brand that carries the team on and off the field." }
] as const;

export function DisciplineCardsSection({ images }: { images: DisciplineImages }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const current = disciplines[active] ?? disciplines[0];

  return (
    <section id="explore-disciplines" className="section discipline-deck-section">
      <div ref={pinRef} className="discipline-deck-pin">
        <div className="discipline-deck-grid">
          <div className="discipline-deck-copy">
            <p className="discipline-deck-eyebrow">Explore disciplines</p>
            <h2 className="discipline-deck-title">{current.title}</h2>
            <p className="discipline-deck-lead">{current.copy}</p>
            <div className="discipline-deck-progress" aria-hidden="true">
              {disciplines.map((d, i) => (
                <span key={d.key} className={`discipline-deck-dot${i === active ? " is-active" : ""}`} />
              ))}
            </div>
            <p className="discipline-deck-count">
              {String(active + 1).padStart(2, "0")} / {String(disciplines.length).padStart(2, "0")}
            </p>
          </div>

          <div className="discipline-deck-stage">
            <CardSwap
              className="is-centered"
              width={520}
              height={400}
              cardDistance={44}
              verticalDistance={40}
              skewAmount={6}
              easing="linear"
              scrollDriven
              pinRef={pinRef}
              stepHeight={0.38}
              onActiveChange={setActive}
            >
              {disciplines.map(({ key, title, Icon }) => {
                const image = images[key];
                return (
                  <Card key={key} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div className="discipline-deck-card-head">
                      <Icon size={13} aria-hidden="true" />
                      <span>{title}</span>
                    </div>
                    <div className="discipline-deck-card-body">
                      {image && <RippleDistortion src={image} quality="medium" grayscale={false} />}
                    </div>
                  </Card>
                );
              })}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
