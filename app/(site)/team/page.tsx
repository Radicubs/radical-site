import { LinkArrow } from "@/components/ui/link-arrow";
import { textMetadata } from "@/lib/seo";
import Link from "@/components/ui/intent-link";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { TeamRosters } from "@/components/team/team-rosters";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getPageText, getSiteSettings, getTeamRosters } from "@/lib/cms";
import { rich } from "@/components/ui/rich-text";
import { plain, seasonLabel } from "@/lib/page-text";

export async function generateMetadata() {
  return textMetadata("/team", (await getPageText()).team);
}

export default async function TeamPage() {
  const [rosters, settings, { team: t }] = await Promise.all([getTeamRosters(), getSiteSettings(), getPageText()]);
  return <main><Navbar settings={settings}/><section className="page-hero"><div className="wrap"><AnimatedSection><p className="eyebrow">{t.eyebrow}</p><h1>{rich(t.title)}</h1><p className="section-copy">{t.copy}</p><div className="actions"><Link className="btn btn-light" href="/mentors">{t.mentorsButton} <LinkArrow direction="right" /></Link><a className="btn btn-dark" href={settings.applyUrl} target="_blank" rel="noreferrer">{plain(t.applyButton, { season: seasonLabel(settings.applicationSeason) })} <LinkArrow direction="right" /></a></div></AnimatedSection></div></section><section className="section team-roster-section"><div className="wrap"><TeamRosters rosters={rosters} seasonLabel={t.seasonLabel} emptyText={t.empty}/></div></section><Footer/></main>;
}
