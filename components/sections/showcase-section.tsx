import { LinkArrow } from "@/components/ui/link-arrow";
import Link from "@/components/ui/intent-link";
import { AnimatedSection } from "@/components/ui/animated-section";
import { PostCard } from "@/components/blog/post-card";
import type { BlogPost } from "@/data/blog";
import ScrollReveal from "@/components/ScrollReveal";
import type { PageText } from "@/lib/page-text";
export function ShowcaseSection({posts,text:t}:{posts:BlogPost[];text:PageText["home"]}){return <section id="home-updates" className="section"><div className="wrap"><AnimatedSection><div className="section-head-row"><div><p className="eyebrow">{t.updatesEyebrow}</p><ScrollReveal baseRotation={0} baseOpacity={0.3} enableBlur={false} blurStrength={0} containerClassName="rb-copy-reveal" textClassName="section-copy">{t.updatesCopy}</ScrollReveal></div><Link className="text-link" href="/blog">{t.updatesLink} <LinkArrow /></Link></div></AnimatedSection><div className="post-grid">{posts.slice(0,3).map((p,i)=><AnimatedSection key={p.slug} delay={i*.06}><PostCard post={p}/></AnimatedSection>)}</div></div></section>}
