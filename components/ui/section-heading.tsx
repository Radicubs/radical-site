import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, body, className, as: Heading = "h2" }: { as?: "h1" | "h2"; eyebrow?: string; title: string; body?: string; className?: string }) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && <p className="type-meta mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#77ff66]">{eyebrow}</p>}
      <Heading className="type-display text-balance text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">{title}</Heading>
      {body && <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">{body}</p>}
    </div>
  );
}
