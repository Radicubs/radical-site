import { textMetadata } from "@/lib/seo";
import Link from "@/components/ui/intent-link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMentors, getPageText, getSiteSettings } from "@/lib/cms";
import { plain } from "@/lib/page-text";
import { TeamCard } from "@/components/team/team-card";

export async function generateMetadata() {
  return textMetadata("/mentors", (await getPageText()).mentors);
}

export default async function MentorsPage() {
  const [mentors, settings, { mentors: t }] = await Promise.all([getMentors(), getSiteSettings(), getPageText()]);
  return <main><Navbar settings={settings}/><section className="page-hero"><div className="wrap"><AnimatedSection><SectionHeading as="h1" eyebrow={t.eyebrow} title={plain(t.title)} body={t.copy}/><Link href="/team" className="mt-6 hover-arrow inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 hover:text-[#77ff66]"><ArrowLeft className="h-4 w-4"/>{t.back}</Link></AnimatedSection></div></section><section className="section team-roster-section"><div className="wrap"><div className="team-grid">{mentors.map((mentor,index)=><AnimatedSection key={mentor.name} delay={(index%10)*.025}><TeamCard member={mentor}/></AnimatedSection>)}</div></div></section><Footer/></main>;
}
