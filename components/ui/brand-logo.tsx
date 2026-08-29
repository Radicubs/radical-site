import { cn } from "@/lib/utils";
import { site } from "@/data/site";

type BrandLogoProps = { className?: string; compact?: boolean };

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="Radicubs">
      <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-[12px] bg-[#0f1611] shadow-[0_8px_24px_rgba(0,0,0,.24)] ring-1 ring-white/10">
        <img src={site.markImage} alt="" className="h-full w-full object-cover" />
      </span>
      {!compact && <span className="text-xl font-semibold tracking-[-0.025em] text-white">radicubs</span>}
    </span>
  );
}
