"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, FocusEvent, MouseEvent, TouchEvent } from "react";

// next/link, but a page is fetched when the visitor shows intent (hover, focus,
// touch) rather than whenever its link scrolls into view. Hover and touch land
// a few hundred ms before the click, so navigation still feels instant, while a
// visit no longer downloads every page the header, footer and cards link to.
export default function Link({ prefetch, onMouseEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "";
  const warm = () => {
    if (prefetch !== false && href.startsWith("/")) router.prefetch(href);
  };

  return (
    <NextLink
      {...props}
      prefetch={false}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => { warm(); onMouseEnter?.(event); }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => { warm(); onFocus?.(event); }}
      onTouchStart={(event: TouchEvent<HTMLAnchorElement>) => { warm(); onTouchStart?.(event); }}
    />
  );
}
