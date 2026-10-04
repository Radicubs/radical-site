"use client";

import DriftWall, { type DriftWallItem } from "@/components/DriftWall";
import { HeroElectricWordmark } from "@/components/sections/hero-electric-wordmark";
import { PixelArrowButton } from "@/components/ui/pixel-arrow-button";
import type { GalleryPhoto, SiteSettings } from "@/lib/cms";

const localMoments = [{ image: "/radicubs-2026-hero.webp", title: "Radicubs robot on the competition field" }];

export function HeroSection({ settings, photos }: { settings: SiteSettings; photos: GalleryPhoto[] }) {
  const items: DriftWallItem[] = photos.length
    ? photos.map((photo) => ({ image: photo.src, srcSet: photo.srcSet, title: photo.alt }))
    : localMoments;

  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-wall">
        <DriftWall items={items} decorative columns={7} tileWidth={245} tileHeight={178} gap={15} radius={12} tilt={1} turn={0} perspective={850} depth={200} scale={1.05} curve={700} speed={12} variance={0.22} parallax={0.45} lift={70} dim={1} fade={0.08} overlayColor="transparent" />
      </div>
      <div className="home-hero-content">
        <h1 id="home-title"><span className="sr-only">Radicubs</span><HeroElectricWordmark /></h1>
        <p className="home-hero-description">We build robots, compete, and figure things out together in Frisco, Texas.</p>
        <div className="home-hero-actions">
          <PixelArrowButton href={settings.applyUrl} external>Join the team</PixelArrowButton>
          <PixelArrowButton href="#explore-disciplines" variant="secondary" direction="down">Explore what we do</PixelArrowButton>
        </div>
      </div>
    </section>
  );
}
