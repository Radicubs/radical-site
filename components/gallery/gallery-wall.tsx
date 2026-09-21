"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DriftWall, { type DriftWallItem } from "@/components/DriftWall";
import "./gallery-wall.css";

export function GalleryWall({ items }: { items: DriftWallItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, openIndex]);

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <DriftWall
        items={items}
        columns={8}
        tileWidth={180}
        perspective={2600}
        dim={0.85}
        overlayColor="rgba(6,0,16,0.5)"
        onItemClick={(_item, index) => setOpenIndex(index)}
      />

      <AnimatePresence>
        {active && (
          <motion.div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={active.title || "Photo viewer"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="gallery-lightbox-backdrop" type="button" onClick={close} aria-label="Close full-screen photo" />
            <button className="gallery-lightbox-close" type="button" onClick={close} autoFocus aria-label="Close full-screen photo"><X size={22} /></button>
            <div className="gallery-lightbox-stage">
              <img src={active.image} alt={active.title || ""} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
