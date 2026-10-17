import { absoluteUrl, pageMetadata, serializeJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "@/components/ui/intent-link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { getBlogPost, getSiteSettings } from "@/lib/cms";

// Each post is rendered on its first visit and then cached like the other pages.
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const metadata = pageMetadata(`/blog/${encodeURIComponent(post.slug)}`, {
    title: `${post.title} | Radicubs FRC 7503`,
    description: post.excerpt || `Read ${post.title}, an update from Radicubs FRC Team 7503 in Frisco, Texas.`,
    image: post.cover
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [absoluteUrl("/")]
    }
  };
}

export default async function BlogPostPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [post,settings]=await Promise.all([getBlogPost(slug),getSiteSettings()]);if(!post)notFound();return <main><Navbar settings={settings}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": absoluteUrl(`/blog/${encodeURIComponent(post.slug)}#article`),
  mainEntityOfPage: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
  headline: post.title,
  description: post.excerpt,
  image: post.cover ? [absoluteUrl(post.cover)] : undefined,
  datePublished: post.publishedAt || (post.date && !Number.isNaN(Date.parse(post.date)) ? new Date(post.date).toISOString().slice(0, 10) : undefined),
  dateModified: post.updatedAt,
  inLanguage: "en-US",
  author: { "@type": "Organization", name: settings.name, url: absoluteUrl("/") },
  publisher: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: settings.name, url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/android-chrome-512x512.png") } }
}) }} /><article className="px-6 pb-12 pt-16"><div className="mx-auto max-w-4xl"><Link href="/blog" className="hover-arrow inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-[#77ff66]"><ArrowLeft className="h-4 w-4"/>Back to blog</Link><header className="mt-10"><p className="type-meta text-xs font-medium uppercase tracking-[.16em] text-[#77ff66]"><time dateTime={post.publishedAt}>{post.date}</time></p><h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-.02em] text-white sm:text-6xl">{post.title}</h1><p className="mt-5 text-lg leading-8 text-zinc-300">{post.excerpt}</p></header>{post.cover&&<div className="mt-10 overflow-hidden rounded-[38px] border border-white/10 bg-[rgba(16,22,18,.84)] shadow-[0_24px_80px_rgba(0,0,0,.18)]"><img src={post.cover} alt={`${post.title} cover`} className="max-h-[620px] w-full object-cover" loading="lazy" decoding="async"/></div>}<div className="prose-radicubs mt-12">{post.sections?.map((section,sectionIndex)=><section key={`${section.heading}-${sectionIndex}`} className="mb-10">{section.heading&&section.heading!=="Update"&&<h2>{section.heading}</h2>}{section.blocks&&section.blocks.length>0?section.blocks.map((block,blockIndex)=>block.kind==="text"?<p key={blockIndex} style={block.indent ? { paddingInlineStart: `${block.indent * 2}em` } : undefined}>{block.text}</p>:block.kind==="code"?<pre key={blockIndex} className="blog-code"><code>{block.code}</code></pre>:block.kind==="list"?(block.ordered?<ol key={blockIndex} className="blog-list">{block.items.map((item,i)=><li key={i}>{item}</li>)}</ol>:<ul key={blockIndex} className="blog-list">{block.items.map((item,i)=><li key={i}>{item}</li>)}</ul>):<img key={blockIndex} className="blog-figure" src={block.src} srcSet={block.srcSet} sizes="(max-width: 900px) 100vw, 860px" alt={block.alt} loading="lazy" decoding="async"/>):<>{section.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}{section.images&&section.images.length>0&&<div className="blog-figures">{section.images.map((image)=><img key={image.src} src={image.src} alt={image.alt} loading="lazy" decoding="async"/>)}</div>}</>}</section>)}</div>{post.sourceUrl&&<a href={post.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 hover:border-[#00c700]">Watch video <ArrowUpRight className="h-4 w-4"/></a>}</div></article><Footer/></main>}
