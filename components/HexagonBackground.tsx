"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import "./HexagonBackground.css";

export type HexagonBackgroundProps = React.ComponentProps<"div"> & {
  hexagonProps?: React.ComponentProps<"div">;
  hexagonSize?: number;
  hexagonMargin?: number;
  mouseInteraction?: boolean;
};

export function HexagonBackground({
  className,
  children,
  hexagonProps,
  style,
  hexagonSize = 76,
  hexagonMargin = 2,
  mouseInteraction = true,
  ...props
}: HexagonBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pointerFrame = React.useRef(0);
  const [activeHexagon, setActiveHexagon] = React.useState<string | null>(null);
  const [gridDimensions, setGridDimensions] = React.useState({ rows: 0, columns: 0 });

  const hexagonWidth = hexagonSize;
  const hexagonHeight = hexagonSize * 1.1;
  const rowSpacing = hexagonSize * 0.8;
  const columnSpacing = hexagonWidth + hexagonMargin;
  const computedMarginTop = -36 - 0.275 * (hexagonSize - 100) + hexagonMargin;
  const oddRowMarginLeft = -(hexagonSize / 2) - 10;
  const evenRowMarginLeft = hexagonMargin / 2 - 10;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateGridDimensions = () => {
      const rect = container.getBoundingClientRect();
      setGridDimensions({
        rows: Math.ceil(rect.height / rowSpacing) + 1,
        columns: Math.ceil(rect.width / hexagonWidth) + 2
      });
    };

    updateGridDimensions();
    const observer = new ResizeObserver(updateGridDimensions);
    observer.observe(container);
    return () => observer.disconnect();
  }, [hexagonWidth, rowSpacing]);

  React.useEffect(() => {
    if (!mouseInteraction) return;

    const handlePointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(pointerFrame.current);
      pointerFrame.current = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
          setActiveHexagon(null);
          return;
        }

        const row = Math.max(0, Math.min(gridDimensions.rows - 1, Math.round(y / rowSpacing)));
        const rowOffset = (row + 1) % 2 === 0 ? evenRowMarginLeft : oddRowMarginLeft;
        const column = Math.max(
          0,
          Math.min(gridDimensions.columns - 1, Math.round((x - rowOffset - hexagonWidth / 2) / columnSpacing))
        );
        setActiveHexagon(`${row}-${column}`);
      });
    };

    const clearPointer = () => setActiveHexagon(null);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", clearPointer);
    return () => {
      cancelAnimationFrame(pointerFrame.current);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", clearPointer);
    };
  }, [
    columnSpacing,
    evenRowMarginLeft,
    gridDimensions.columns,
    gridDimensions.rows,
    hexagonWidth,
    mouseInteraction,
    oddRowMarginLeft,
    rowSpacing
  ]);

  return (
    <div
      ref={containerRef}
      data-slot="hexagon-background"
      className={cn("hexagon-background", className)}
      style={{ "--hexagon-margin": `${hexagonMargin}px`, ...style } as React.CSSProperties}
      {...props}
    >
      <div className="hexagon-background__grid">
        {Array.from({ length: gridDimensions.rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="hexagon-background__row"
            style={{
              marginTop: computedMarginTop,
              marginLeft: (rowIndex + 1) % 2 === 0 ? evenRowMarginLeft : oddRowMarginLeft
            }}
          >
            {Array.from({ length: gridDimensions.columns }).map((_, columnIndex) => {
              const key = `${rowIndex}-${columnIndex}`;
              return (
                <div
                  key={key}
                  {...hexagonProps}
                  className={cn(
                    "hexagon-background__cell",
                    activeHexagon === key && "is-active",
                    hexagonProps?.className
                  )}
                  style={{
                    width: hexagonWidth,
                    height: hexagonHeight,
                    marginLeft: hexagonMargin,
                    ...hexagonProps?.style
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
