"use client";

import { useEffect, useState } from "react";
import TechText from "@/components/TechText";
import "./footer-tech-text.css";

// TechText draws on a canvas, so theme colours are passed in rather than read from CSS.
const PALETTE = {
  dark: { color: "#e9efe6", accent: "#66ff55" },
  light: { color: "#18231a", accent: "#1f7f0d" },
};

export function FooterTechText() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const { color, accent } = PALETTE[theme];
  return (
    <div className="footer-tech-text" aria-label="FRC Team 7503" role="img">
      <TechText
        text="FRC 7503"
        fontFamily='"IBM Plex Mono", ui-monospace, monospace'
        fontWeight={600}
        fontSize={220}
        letterSpacing={-0.02}
        color={color}
        accentColor={accent}
        reach={220}
        specks={12}
      />
    </div>
  );
}
