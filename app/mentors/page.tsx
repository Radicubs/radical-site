import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Mentors | Radicubs" };
const mentors = [
  { name: "Rich Wisneski", role: "Lead Mentor", image: "/mentors/image_2023_12_16_205608008_05b3c49a6b.png" },
  { name: "Susanna Fukumoto", role: "Lead Mentor" },
  { name: "Girish Sharma", role: "Mechanical Engineering Mentor" },
  { name: "Joel Fukumoto", role: "Mechanical Engineering Mentor" },
  { name: "Johnsy Varghese", role: "Mechanical Engineering Mentor" }
];
export default function MentorsPage(){return <main><Navbar/><section className="px-6 pb-12 pt-20"><div className="mx-auto max-w-7xl"><AnimatedSection><SectionHeading eyebrow="Guidance" title="Mentors" body="Adults who contribute technical expertise, administrative support, and experience while keeping the program student-led."/><Link href="/team" className="mt-6 hover-arrow inline-flex items-center gap-2 text-sm font-black text-zinc-200 hover:text-[#77ff66]"><ArrowLeft className="h-4 w-4"/>View team members</Link></AnimatedSection><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{mentors.map((m,i)=><AnimatedSection key={m.name} delay={i*.05}><div data-tilt-card className="hover-lift flex items-center gap-5 rounded-[30px] border border-white/10 bg-[rgba(16,22,18,.82)] p-5 shadow-[0_20px_70px_rgba(0,0,0,.18)]">{m.image?<img src={m.image} alt={m.name} className="h-20 w-20 rounded-2xl object-cover" loading="lazy" decoding="async"/>:<div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#66ff55] text-[#081009]"><UserRound className="h-7 w-7"/></div>}<div><h2 className="font-black text-white">{m.name}</h2><p className="mt-1 text-sm font-bold text-[#77ff66]">{m.role}</p></div></div></AnimatedSection>)}</div></div></section><Footer/></main>}
