"use client";

import { useEffect, useState, type ReactNode } from "react";
import DriftWall, { type DriftWallItem } from "@/components/DriftWall";
import { HeroElectricWordmark } from "@/components/sections/hero-electric-wordmark";
import { PixelArrowButton } from "@/components/ui/pixel-arrow-button";
import { glideTo } from "@/components/ui/glide-to";
import type { GalleryPhoto, SiteSettings } from "@/lib/cms";

// No stand-in photo: while the gallery streams in (or if it's empty) the wall stays blank.
export function HeroPhotoWall({ photos }: { photos: GalleryPhoto[] }) {
  // The page is cached, so the server's order repeats between visitors. Shuffle after
  // mount instead; rendering nothing until then keeps hydration from showing one order
  // and swapping to another.
  const [shuffled, setShuffled] = useState<GalleryPhoto[] | null>(null);
  useEffect(() => {
    const copy = [...photos];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setShuffled(copy);
  }, [photos]);

  if (!shuffled?.length) return null;
  const items: DriftWallItem[] = shuffled.map((photo) => ({ image: photo.src, srcSet: photo.srcSet, title: photo.alt }));

  return <DriftWall className="home-hero-wall-in" items={items} decorative responsive columns={7} tileWidth={245} tileHeight={178} gap={15} radius={12} tilt={1} turn={0} perspective={850} depth={200} scale={1.05} curve={700} speed={12} variance={0.22} parallax={0.45} lift={70} dim={1} fade={0.08} overlayColor="transparent" />;
}

// Take over from Lenis's anchor handling, which measures the target only once.
function scrollToUpdates(event: React.MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById("home-updates");
  if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  event.nativeEvent.stopPropagation();
  glideTo(target);
}

export function HeroSection({ settings, photos = [], wall }: { settings: SiteSettings; photos?: GalleryPhoto[]; wall?: ReactNode }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-wall">
        {wall ?? <HeroPhotoWall photos={photos} />}
      </div>
      <div className="home-hero-content">
        <h1 id="home-title"><span className="sr-only">Radicubs — FRC Team 7503 in Frisco, Texas</span><HeroElectricWordmark /></h1>
        <p className="home-hero-description">We build robots, compete, and figure things out together in Frisco, Texas.</p>
        <div className="home-hero-actions">
          <PixelArrowButton href={settings.applyUrl} external>Join the team</PixelArrowButton>
          <PixelArrowButton href="#home-updates" variant="secondary" direction="down" onClick={scrollToUpdates}>Scroll to explore</PixelArrowButton>
        </div>
      </div>
    </section>
  );
}
