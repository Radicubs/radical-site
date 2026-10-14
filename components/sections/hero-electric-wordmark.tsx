import { ThemedImage } from "@/components/ui/themed-image";
import "./hero-electric-wordmark.css";

export function HeroElectricWordmark() {
  return (
    <span className="hero-electric">
      <ThemedImage src="/radical-wordmark-white.svg" lightSrc="/radical-wordmark-black.svg" alt="" aria-hidden="true" />
    </span>
  );
}
