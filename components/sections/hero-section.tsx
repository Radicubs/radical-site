"use client";

import { motion } from "framer-motion";
import { site } from "@/data/site";
import ParticleText from "@/components/ui/particle-text";

// Single source of truth for the animated word's size: the box it renders
// into is derived from this, so bumping the font size alone is enough --
// no second CSS edit required to keep the box from clipping or shrinking it
// back down (that mismatch was the recurring bug the last several rounds).
const CHARACTER_FONT_SIZE = 57.5;
const CHARACTER_BOX_WIDTH = CHARACTER_FONT_SIZE * 5.6;
const CHARACTER_BOX_HEIGHT = CHARACTER_FONT_SIZE * 1.12;

export function HeroSection() {
  return (
    <section className="hero">
      <div className="grid-bg" />
      <div className="wrap hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65 }}
        >
          <div className="pill"><span className="dot" />Independent FIRST Robotics Competition team</div>
          <h1>
            We build robots.
            <span className="hero-build-line">
              <span className="green">We build</span>
              <span
                className="hero-particle-word"
                style={{ width: CHARACTER_BOX_WIDTH, height: CHARACTER_BOX_HEIGHT }}
              >
                <ParticleText
                  text="character."
                  trigger="mount"
                  color="#66ff55"
                  highlightColor="#ffffff"
                  fontWeight={900}
                  fontSize={CHARACTER_FONT_SIZE}
                  particleSize={2.4}
                  density={0.5}
                  scatter={70}
                  gatherDuration={1400}
                  stagger={300}
                  pointerRepel={36}
                  repelRadius={85}
                  idleDrift={0.5}
                />
              </span>
            </span>
          </h1>
          <p className="lead">{site.description}</p>
          <div className="actions">
            <a className="btn btn-dark" href={site.applyUrl} target="_blank" rel="noreferrer">Apply for 2026–2027 →</a>
            <a className="btn btn-light" href={site.donateUrl} target="_blank" rel="noreferrer">Support the team</a>
          </div>
          <div className="badges">
            <span className="badge">Student-led</span>
            <span className="badge">501(c)(3) nonprofit</span>
            <span className="badge">FRC Team 7503</span>
            <span className="badge">Frisco, TX</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: .97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .8, delay: .1 }}
        >
          <div className="robot-card" data-tilt-card>
            <img src={site.robotImage} alt="Radicubs robot from the 2026 season" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
