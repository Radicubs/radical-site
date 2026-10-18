import type { ImpactStat } from "@/data/impact";
import { CountUp } from "@/components/ui/count-up";
import { rich } from "@/components/ui/rich-text";
import type { PageText } from "@/lib/page-text";
import "./awards-ledger.css";

// Shares the awards ledger's heading and corner-marked cells.
export function ImpactSection({ stats, text: t }: { stats: ImpactStat[]; text: PageText["home"] }) {
  if (!stats.length) return null;
  return <section className="section awards-section impact-section"><div className="wrap">
    <div className="section-head-row awards-head">
      <h2>{rich(t.impactTitle)}</h2>
      <p className="section-copy">{t.impactCopy}</p>
    </div>

    <dl className="awards-ledger impact-grid">
      {stats.map((stat) => <div className="awards-cell impact-cell" key={`${stat.label}-${stat.value}`}>
        <dd className="impact-number"><CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} /></dd>
        <dt className="impact-label">{stat.label}{stat.detail && <span>{stat.detail}</span>}</dt>
      </div>)}
    </dl>
  </div></section>;
}
