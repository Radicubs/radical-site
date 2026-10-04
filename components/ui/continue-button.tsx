import type { ReactNode } from "react";
import Link from "@/components/ui/intent-link";
import "./continue-button.css";

type ContinueButtonProps = { children?: ReactNode; hint?: boolean } & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

/**
 * Flat "key" button: it sits on a darker ledge and presses down into it when
 * clicked, and the arrow swaps on hover. As a button in a flow it shows a ↵ hint,
 * since Enter does the same thing; with `href` it's a plain link.
 */
export function ContinueButton({ href, onClick, children = "Continue", hint = !href }: ContinueButtonProps) {
  const content = (
    <>
      <span className="key-btn-face">
        <span>{children}</span>
        <span className="key-btn-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" /></svg>
          <svg viewBox="0 0 16 16"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" /></svg>
        </span>
      </span>
      {hint && <kbd className="key-btn-hint" aria-hidden="true">↵ Enter</kbd>}
    </>
  );
  return href === undefined
    ? <button type="button" className="key-btn" onClick={onClick}>{content}</button>
    : <Link className="key-btn" href={href}>{content}</Link>;
}
