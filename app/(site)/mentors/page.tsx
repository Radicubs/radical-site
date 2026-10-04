import type { Metadata } from "next";
import Link from "@/components/ui/intent-link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMentors, getSiteSettings } from "@/lib/cms";
import { TeamCard } from "@/components/team/team-card";

export const metadata: Metadata = { title: "Mentors | Radicubs" };

export default async function MentorsPage() {
  const [mentors, settings] = await Promise.all([getMentors(), getSiteSettings()]);
  return <main><Navbar settings={settings}/><section className="page-hero"><div className="wrap"><AnimatedSection><SectionHeading eyebrow="Guidance" title="Mentors" body="Our mentors share their experience, ask good questions, and help us work through the tough parts. We're grateful to have them in our corner."/><Link href="/team" className="mt-6 hover-arrow inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 hover:text-[#77ff66]"><ArrowLeft className="h-4 w-4"/>Meet the students</Link></AnimatedSection></div></section><section className="section team-roster-section"><div className="wrap"><div className="team-grid">{mentors.map((mentor,index)=><AnimatedSection key={mentor.name} delay={(index%10)*.025}><TeamCard member={mentor}/></AnimatedSection>)}</div></div></section><Footer/></main>;
}
