import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { PostCard } from "@/components/blog/post-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getBlogPosts, getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = { title: "Blog | Radicubs" };

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([getBlogPosts(), getSiteSettings()]);
  return <main><Navbar settings={settings}/><section className="page-hero"><div className="wrap"><AnimatedSection><p className="eyebrow">Radiblog</p><h1>Updates from Team 7503</h1><p className="section-copy">Build-season notes, robot progress, competition highlights, STEM stories, and outreach from the Radicubs.</p></AnimatedSection></div></section><section className="section"><div className="wrap"><div className="blog-grid">{posts.map((post,index)=><AnimatedSection key={post.slug} delay={(index%9)*.025}><PostCard post={post}/></AnimatedSection>)}</div></div></section><Footer/></main>;
}
