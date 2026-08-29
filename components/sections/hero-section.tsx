"use client";

import { motion } from "framer-motion";
import { HeroGallery } from "@/components/HeroGallery";
import type { GalleryAlbum, SiteSettings } from "@/lib/cms";

export function HeroSection({ settings, gallery }: { settings: SiteSettings; gallery: GalleryAlbum }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65 }}
        >
          <p className="hero-kicker">FRC TEAM 7503 / FRISCO, TEXAS / EST. 2019</p>
          <h1 className="sr-only">Radicubs Robotics</h1>
          <img className="hero-wordmark" src="/radicubs-wordmark-green.png" alt="Radicubs" />
          <p className="lead">{settings.description}</p>
          <div className="actions">
            <a className="btn btn-dark" href={settings.applyUrl} target="_blank" rel="noreferrer">Apply for {settings.applicationSeason}–{settings.applicationSeason + 1} →</a>
            <a className="btn btn-light" href={settings.donateUrl} target="_blank" rel="noreferrer">Support the team</a>
          </div>
          <p className="hero-footnote">STUDENT-LED · 501(C)(3) NONPROFIT</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: .97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .8, delay: .1 }}
        >
          <HeroGallery album={gallery} />
        </motion.div>
      </div>
    </section>
  );
}
