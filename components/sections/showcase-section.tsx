import Link from "next/link";
import { AnimatedSection } from "@/components/ui/animated-section";
import { PostCard } from "@/components/blog/post-card";
import { blogPosts } from "@/data/blog";
export function ShowcaseSection(){return <section className="section"><div className="wrap"><AnimatedSection><div className="section-head-row"><div><p className="eyebrow">Latest updates</p><h2>Inside the build season.</h2><p className="section-copy">Follow the weekly progress of REBUILT™ 2026 across mechanical, CAD, programming, business, and media.</p></div><Link className="text-link" href="/blog">All blog posts ↗</Link></div></AnimatedSection><div className="post-grid">{blogPosts.slice(0,3).map((p,i)=><AnimatedSection key={p.slug} delay={i*.06}><PostCard post={p}/></AnimatedSection>)}</div></div></section>}
