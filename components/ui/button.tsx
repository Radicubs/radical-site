import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonStyles(variant: ButtonProps["variant"] = "primary") {
  if (variant === "secondary") {
    return "inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-[#00c700]/35 hover:bg-white/10";
  }
  if (variant === "ghost") {
    return "inline-flex items-center justify-center rounded-full border border-white/14 bg-transparent px-5 py-3 text-sm font-bold text-zinc-300 transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-[#00c700]/35 hover:text-white";
  }
  return "inline-flex items-center justify-center rounded-full border border-[#00c700]/25 bg-[#66ff55] px-5 py-3 text-sm font-bold text-[#081009] shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:bg-[#7cff6d] hover:text-[#081009]";
}

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonStyles(variant), className)} {...props} />;
}
