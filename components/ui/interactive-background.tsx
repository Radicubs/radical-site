'use client';

import DotGrid from '@/components/ui/dot-grid';

export function InteractiveBackground() {
  return (
    <div className="site-interactive-background" aria-hidden="true">
      <DotGrid
        dotSize={2.8}
        gap={26}
        baseColor="#4a504c"
        activeColor="#72ff63"
        proximity={185}
        speedTrigger={125}
        shockRadius={225}
        shockStrength={0.28}
        maxSpeed={3200}
        resistance={760}
        returnDuration={1.3}
      />
      <div className="site-background-vignette" />
    </div>
  );
}
