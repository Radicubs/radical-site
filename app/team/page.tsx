import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { TeamRosters } from "@/components/team/team-rosters";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getSiteSettings, getTeamRosters } from "@/lib/cms";

export const metadata: Metadata = { title: "Team | Radicubs" };

export default async function TeamPage() {
  const [rosters, settings] = await Promise.all([getTeamRosters(), getSiteSettings()]);
  return <main><Navbar settings={settings}/><section className="page-hero"><div className="wrap"><AnimatedSection><p className="eyebrow">FRC Team 7503</p><h1>Meet the Team</h1><div className="actions"><Link className="btn btn-light" href="/mentors">View mentors →</Link><a className="btn btn-dark" href={settings.applyUrl} target="_blank" rel="noreferrer">Apply for {settings.applicationSeason}–{settings.applicationSeason + 1} →</a></div></AnimatedSection></div></section><section className="section team-roster-section"><div className="wrap"><TeamRosters rosters={rosters}/></div></section><Footer/></main>;
}
