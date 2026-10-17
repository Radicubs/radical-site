export const teamGlowOptions = [
  { label: "Automatic (match the role)", value: "auto" },
  { label: "No icon", value: "none" },
  { label: "Programming", value: "code" },
  { label: "Mechanical", value: "mechanical" },
  { label: "CAD", value: "cad" },
  { label: "Business", value: "business" },
  { label: "Media", value: "media" }
] as const;

export type TeamGlowIcon = typeof teamGlowOptions[number]["value"];

const roleIcons: Array<{ match: RegExp; icon: string }> = [
  { match: /program|software|code/i, icon: "code" },
  { match: /mechanical/i, icon: "mechanical" },
  { match: /\bcad\b/i, icon: "cad" },
  { match: /business/i, icon: "business" },
  { match: /media/i, icon: "media" }
];

export function teamGlowIcon(selection: TeamGlowIcon | null | undefined, role: string): string | undefined {
  if (selection === "none") return undefined;
  const icon = selection && selection !== "auto" ? selection : roleIcons.find(entry => entry.match.test(role))?.icon;
  return icon ? `/team/icons/${icon}.webp` : undefined;
}
