import { ArrowDown } from "lucide-react";
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

  return href ? <a className={classes} href={href}>{content}</a> : <div className={classes}>{content}</div>;
}
