'use client';

import dynamic from 'next/dynamic';
import { HexagonBackground } from '@/components/HexagonBackground';

const GridScan = dynamic(() => import('@/components/GridScan').then(module => module.GridScan), { ssr: false });
const Galaxy = dynamic(() => import('@/components/Galaxy'), { ssr: false });

// Keep both implementations available while Galaxy is being evaluated.
// Change this one value back to "grid-scan" for an immediate rollback.
const ACTIVE_BACKGROUND: 'hexagon' | 'galaxy' | 'grid-scan' = 'grid-scan';

function PreviousGridScanBackground() {
  return (
    <GridScan
      lineThickness={1}
      linesColor="#273128"
      gridScale={0.12}
      lineStyle="solid"
      scanColor="#66ff55"
      scanOpacity={0.22}
      scanDuration={5.8}
      scanDelay={1.8}
      scanSoftness={2.2}
      scanGlow={0.45}
      enablePost={false}
      interactionTarget="none"
    />
  );
}

function GalaxyBackground() {
  return (
    <Galaxy
      focal={[0.5, 0.42]}
      rotation={[1, 0]}
      starSpeed={0.32}
      density={0.9}
      hueShift={96}
      speed={0.42}
      glowIntensity={0.34}
      saturation={0.68}
      twinkleIntensity={0.3}
      rotationSpeed={0.025}
      mouseInteraction
      interactionTarget="window"
      mouseRepulsion
      repulsionStrength={1.4}
      transparent
    />
  );
}

function AnimateUiHexagonBackground() {
  return <HexagonBackground hexagonSize={78} hexagonMargin={2} mouseInteraction />;
}

export function InteractiveBackground() {
  return (
    <div className={`site-interactive-background site-interactive-background--${ACTIVE_BACKGROUND}`} aria-hidden="true">
      {ACTIVE_BACKGROUND === 'hexagon' ? (
        <AnimateUiHexagonBackground />
      ) : ACTIVE_BACKGROUND === 'galaxy' ? (
        <GalaxyBackground />
      ) : (
        <PreviousGridScanBackground />
      )}
      <div className="site-background-vignette" />
    </div>
  );
}
