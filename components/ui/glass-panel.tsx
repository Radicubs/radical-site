import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-white/10 bg-[rgba(16,22,18,.82)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
        className
      )}
      {...props}
    />
  );
}
