import type { ImgHTMLAttributes } from "react";

type ThemedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  /** Variant shown in light mode; without one, `src` is used in both themes. */
  lightSrc?: string;
};

/**
 * Renders both variants and lets CSS (html[data-theme]) pick one, so the swap happens
 * inside the theme reveal with no flash and no hydration mismatch.
 */
export function ThemedImage({ src, lightSrc, className, alt = "", ...rest }: ThemedImageProps) {
  if (!lightSrc || lightSrc === src) return <img src={src} alt={alt} className={className} {...rest} />;
  const cls = (variant: string) => ["themed-img", `themed-img--${variant}`, className].filter(Boolean).join(" ");
  return (
    <>
      <img src={src} alt={alt} className={cls("dark")} {...rest} />
      <img src={lightSrc} alt="" aria-hidden="true" className={cls("light")} {...rest} />
    </>
  );
}
