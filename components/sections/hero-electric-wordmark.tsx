"use client";

import { useEffect, useState } from "react";
import ElectricLogo from "@/components/ElectricLogo";
import { ThemedImage } from "@/components/ui/themed-image";
import "./hero-electric-wordmark.css";

// The static wordmark sets the size and stays visible (readable, and the fallback without
// WebGL); the electric arcs are drawn on a larger canvas centred over it. ElectricLogo draws
// the logo at `scale` × its canvas, so a canvas of 1/scale the wordmark's size lines up exactly.
const SCALE = 0.55;

const PALETTE = {
  dark: { color: "#b8ffa3", glowColor: "#4fe32b" },
  light: { color: "#1f7f0d", glowColor: "#3fbf1c" },
};

export function HeroElectricWordmark() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <span className="hero-electric" style={{ "--electric-scale": SCALE } as React.CSSProperties}>
      <ThemedImage src="/radical-wordmark-white.svg" lightSrc="/radical-wordmark-black.svg" alt="" aria-hidden="true" />
      <span className="hero-electric-canvas" aria-hidden="true">
        <ElectricLogo
          src="/radical-wordmark-white.svg"
          scale={SCALE}
          theme={theme}
          color={PALETTE[theme].color}
          glowColor={PALETTE[theme].glowColor}
          intensity={0.65}
          glow={0.6}
          thickness={1.1}
          strands={2}
          crackle={0.9}
          speed={2}
          cursorIntensity={0.5}
          cursorRadius={140}
          clickPulse={false}
        />
      </span>
    </span>
  );
}
