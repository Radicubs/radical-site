import Link from "next/link";
import { AnimatedSection } from "@/components/ui/animated-section";
import { PostCard } from "@/components/blog/post-card";
import type { BlogPost } from "@/data/blog";
import ScrollReveal from "@/components/ScrollReveal";
export function ShowcaseSection({posts}:{posts:BlogPost[]}){return <section className="section"><div className="wrap"><AnimatedSection><div className="section-head-row"><div><p className="eyebrow">Latest updates</p><ScrollReveal baseRotation={0} baseOpacity={0.3} enableBlur={false} blurStrength={0} containerClassName="rb-copy-reveal" textClassName="section-copy">Follow the weekly progress across mechanical, CAD, programming, business, and media.</ScrollReveal></div><Link className="text-link" href="/blog">All blog posts ↗</Link></div></AnimatedSection><div className="post-grid">{posts.slice(0,3).map((p,i)=><AnimatedSection key={p.slug} delay={i*.06}><PostCard post={p}/></AnimatedSection>)}</div></div></section>}
