import { textMetadata } from "@/lib/seo";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { PostCard } from "@/components/blog/post-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getBlogPosts, getPageText, getSiteSettings } from "@/lib/cms";
import { rich } from "@/components/ui/rich-text";

export async function generateMetadata() {
  return textMetadata("/blog", (await getPageText()).blog);
}

export default async function BlogPage() {
  const [posts, settings, { blog: t }] = await Promise.all([getBlogPosts(), getSiteSettings(), getPageText()]);
  return <main><Navbar settings={settings}/><section className="page-hero"><div className="wrap"><AnimatedSection><h1>{rich(t.title)}</h1><p className="section-copy">{t.copy}</p></AnimatedSection></div></section><section className="section blog-index"><div className="wrap"><div className="blog-grid">{posts.map((post,index)=><AnimatedSection key={post.slug} delay={(index%9)*.025}><PostCard post={post}/></AnimatedSection>)}</div></div></section><Footer/></main>;
}
