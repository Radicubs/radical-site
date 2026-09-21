'use client';

import dynamic from 'next/dynamic';

const GridScan = dynamic(() => import('@/components/GridScan').then(module => module.GridScan), { ssr: false });

export function InteractiveBackground() {
  return (
    <div className="site-interactive-background" aria-hidden="true">
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
        interactionTarget="window"
      />
      <div className="site-background-vignette" />
    </div>
  );
}
