"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Hyperspeed = dynamic(() => import("@/components/Hyperspeed"), { ssr: false });

export function NotFoundScene() {
  const effectOptions = useMemo(
    () => ({
      distortion: "turbulentDistortion",
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 3,
      fov: 90,
      fovSpeedUp: 140,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 24,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5] as [number, number],
      lightStickHeight: [1.3, 1.7] as [number, number],
      movingAwaySpeed: [60, 80] as [number, number],
      movingCloserSpeed: [-120, -160] as [number, number],
      carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
      carLightsRadius: [0.05, 0.14] as [number, number],
      carWidthPercentage: [0.3, 0.5] as [number, number],
      carShiftX: [-0.8, 0.8] as [number, number],
      carFloorSeparation: [0, 5] as [number, number],
      colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0x1a2e1a,
        brokenLines: 0x1a2e1a,
        leftCars: [0x66ff55, 0x00c700, 0x2eff8a],
        rightCars: [0xe8fff0, 0xaaffb0, 0x77ff66],
        sticks: 0x66ff55
      }
    }),
    []
  );

  return (
    <div className="notfound-scene" aria-hidden="true">
      <Hyperspeed effectOptions={effectOptions} />
    </div>
  );
}
