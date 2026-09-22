"use client";

import { ArrowDown } from "lucide-react";
import { lenisRef } from "@/components/ui/lenis-singleton";
import "./scroll-to-explore.css";

type ScrollToExploreProps = {
  href?: string;
  className?: string;
};

export function ScrollToExplore({ href, className = "" }: ScrollToExploreProps) {
  const content = (
    <>
      <span>Scroll to explore</span>
      <span className="scroll-to-explore__icon" aria-hidden="true">
        <ArrowDown size={19} strokeWidth={1.7} />
      </span>
    </>
  );
  const classes = `scroll-to-explore${className ? ` ${className}` : ""}`;

  if (!href) return <div className={classes}>{content}</div>;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    event.preventDefault();
    lenis.scrollTo(href, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 3) });
  };

  return (
    <a className={classes} href={href} onClick={handleClick}>
      {content}
    </a>
  );
}
