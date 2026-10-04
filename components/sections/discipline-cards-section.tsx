"use client";

import Link from "@/components/ui/intent-link";
import FlipCard from "@/components/FlipCard";
import type { DisciplineCard } from "@/lib/cms";
import "./discipline-cards.css";

const pad = (n: number) => String(n).padStart(2, "0");

function FlipIcon() {
  return <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M13 5.5A5.5 5.5 0 1 0 13.5 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M13.6 2.2v3.6H10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Hint({ back }: { back?: boolean }) {
  return (
    <span className="disc-hint" aria-hidden="true">
      <span className="disc-hint-pointer">{back ? "Click to flip back" : "Click to reveal"}</span>
      <span className="disc-hint-touch">{back ? "Tap to flip back" : "Tap to reveal"}</span>
    </span>
  );
}

export function DisciplineCardsSection({ disciplines }: { disciplines: DisciplineCard[] }) {
  return <section id="explore-disciplines" className="section home-disciplines"><div className="wrap disc-wrap">
    <div className="section-head-row disc-head">
      <h2>Find where you <em>fit in.</em></h2>
      <Link className="home-disciplines-link" href="/team">Meet the team <span aria-hidden="true">↗</span></Link>
    </div>
    <ul className="disc-grid">{disciplines.map(({ key, title, copy, tags, alt, image }, i) => {
      const index = `${pad(i + 1)} / ${pad(disciplines.length)}`;
      return <li key={key}>
        <FlipCard
          className="disc-card"
          ariaLabel={`${title}: flip for details`}
          radius={4}
          background="var(--disc-back-bg)"
          color="var(--disc-ink)"
          shadow={false}
          tiltMax={8}
          hoverScale={1.02}
          dragDistance={260}
          glare={false}
          front={<div className="disc-face">
            <span className="disc-ticks" aria-hidden="true" />
            <header className="disc-head-row"><span className="disc-index">{pad(i + 1)}</span><h3>{title}</h3><span className="disc-flip"><FlipIcon /></span></header>
            <div className="disc-photo">{image && <img src={image.src} srcSet={image.srcSet} sizes="(max-width: 760px) 50vw, 25vw" alt={alt} loading="lazy" decoding="async" draggable={false} />}</div>
            <Hint />
          </div>}
          back={<div className="disc-face disc-face--back" data-index={pad(i + 1)}>
            <span className="disc-ticks" aria-hidden="true" />
            <header className="disc-head-row"><span className="disc-index">{index}</span><span className="disc-flip"><FlipIcon /></span></header>
            <h3>{title}</h3>
            <p>{copy}</p>
            <ul className="disc-skills">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            <Hint back />
          </div>}
        />
      </li>;
    })}</ul>
  </div></section>;
}
