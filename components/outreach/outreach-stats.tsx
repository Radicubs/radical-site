import { CountUp } from "@/components/ui/count-up";
import type { OutreachStat } from "@/lib/cms";

export function OutreachStats({ stats }: { stats: OutreachStat[] }) {
  return <dl className="outreach-stats">
    {stats.map((stat) => <div key={stat.label} className="outreach-cell">
      <dt>{stat.label}</dt>
      <dd><CountUp value={stat.value} suffix={stat.suffix} plain={stat.plain} /></dd>
    </div>)}
  </dl>;
}
