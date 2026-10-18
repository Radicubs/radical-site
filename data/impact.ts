// Offline fallback for the homepage "Our impact" numbers. The live numbers are edited
// in the CMS under Homepage → Impact numbers.
export type ImpactStat = { prefix?: string; value: number; suffix?: string; label: string; detail?: string };

export const impactStats: ImpactStat[] = [
  { value: 9, label: "Years as a team" },
  { value: 200, suffix: "+", label: "Unique members" },
  { prefix: "$", value: 1, suffix: "M+", label: "Economic impact" },
  { value: 12, label: "Awards" }
];
