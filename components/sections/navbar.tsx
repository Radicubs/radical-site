"use client";
import Link from "@/components/ui/intent-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { site } from "@/data/site";
import type { SiteSettings } from "@/lib/cms";
import GlassSurface from "@/components/GlassSurface";
import { GlowButton } from "@/components/ui/glow-button";
import { DonateLink } from "@/components/ui/donate-link";
import { RollText } from "@/components/ui/roll-text";
import { lenisRef } from "@/components/ui/lenis-singleton";
import "./navbar.css";

const menuGroups = [
  { id: "team", label: "Team", links: [
    { label: "Students", href: "/team", note: "Get to know the people behind the robot" },
    { label: "Mentors", href: "/mentors", note: "Meet the people who help us learn" }
  ] },
  { id: "about", label: "About us", links: [
    { label: "Journey", href: "/journey", note: "Our seasons, from 2019 to now" },
    { label: "Outreach", href: "/outreach", note: "See where we take the robot" }
  ] }
];

const primaryLinks = [
  { label: "Gallery", href: "/gallery" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Blog", href: "/blog" }
];

// Radius of the inverted corners where the bar meets the top edge; mirrored in navbar.css.
const EAR = 22;

// Full-screen mobile drawer: the desktop dropdown groups, then everything else.
const mobileSections = [
  ...menuGroups.map((g)=>({ label: g.label, links: g.links })),
  { label: "Explore", links: [...primaryLinks, { label: "Contact", href: "/contact" }] }
];

export function Navbar({settings}:{settings?:SiteSettings}){
  const pathname=usePathname();
  const [menuOpen,setMenuOpen]=useState(false);
  const [openMenu,setOpenMenu]=useState<string|null>(null);
  const [mounted,setMounted]=useState(false);
  const toggleRef=useRef<HTMLButtonElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const wasOpen=useRef(false);
  const donateUrl=settings?.donateUrl ?? site.donateUrl;

  // Already on the home page: glide back to the top instead of jumping there.
  const scrollHomeToTop=(e:React.MouseEvent<HTMLAnchorElement>)=>{
    if(pathname!=="/" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button!==0) return;
    e.preventDefault();
    setMenuOpen(false);
    const lenis=lenisRef.current;
    if(lenis) lenis.scrollTo(0,{duration:1.4,easing:(t:number)=>(t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2)});
    else window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  };

  const isActive=(href:string)=>pathname===href || pathname.startsWith(`${href}/`);

  useEffect(()=>{ setMenuOpen(false); setOpenMenu(null); },[pathname]);
  useEffect(()=>{ setMounted(true); },[]);

  // While the drawer is open the page underneath must not scroll, and focus
  // moves into the drawer and back to the toggle when it closes.
  useEffect(()=>{
    if(!menuOpen){
      if(wasOpen.current) toggleRef.current?.focus({preventScroll:true});
      wasOpen.current=false;
      return;
    }
    wasOpen.current=true;
    const lenis=lenisRef.current;
    const root=document.documentElement;
    const saved=[root.style.overflow,document.body.style.overflow];
    lenis?.stop();
    root.style.overflow="hidden";
    document.body.style.overflow="hidden";
    const focusTimer=setTimeout(()=>closeRef.current?.focus({preventScroll:true}),60);
    const onResize=()=>{ if(window.innerWidth>1024) setMenuOpen(false); };
    window.addEventListener("resize",onResize);
    return ()=>{ clearTimeout(focusTimer); window.removeEventListener("resize",onResize); [root.style.overflow,document.body.style.overflow]=saved; lenis?.start(); };
  },[menuOpen]);

  useEffect(()=>{
    if(!openMenu && !menuOpen) return;
    const onKey=(e:KeyboardEvent)=>{ if(e.key==="Escape"){ setOpenMenu(null); setMenuOpen(false); } };
    const onPointer=(e:PointerEvent)=>{ if(!(e.target as Element).closest?.(".rnav-dropdown")) setOpenMenu(null); };
    document.addEventListener("keydown",onKey);
    document.addEventListener("pointerdown",onPointer);
    return ()=>{ document.removeEventListener("keydown",onKey); document.removeEventListener("pointerdown",onPointer); };
  },[openMenu,menuOpen]);

  return <header className="rnav" data-open={menuOpen||undefined}>
    <div className="rnav-card">
      <GlassSurface className="rnav-glass" width="100%" height="100%" notch={EAR} borderRadius={26} backgroundOpacity={0.32} saturation={1.5} brightness={55} blur={10} distortionScale={-160} />
      <div className="rnav-bar">
        <nav className="rnav-links" aria-label="Main navigation">
          {menuGroups.map((g)=>{
            const open=openMenu===g.id;
            return <div key={g.id} className="rnav-dropdown" data-open={open||undefined} onMouseEnter={()=>setOpenMenu(g.id)} onMouseLeave={()=>setOpenMenu(null)}>
              <button type="button" className="rnav-link" data-active={g.links.some((l)=>isActive(l.href))||undefined} aria-expanded={open} aria-controls={`rnav-${g.id}-menu`} onClick={(e)=>setOpenMenu(e.detail===0&&open?null:g.id)}>
                {g.label} <ChevronDown size={15} strokeWidth={2} aria-hidden="true" />
              </button>
              <div id={`rnav-${g.id}-menu`} className="rnav-menu">
                {g.links.map((l)=><Link key={l.href} href={l.href} aria-current={isActive(l.href)?"page":undefined}>
                  <strong>{l.label}</strong><span>{l.note}</span>
                </Link>)}
              </div>
            </div>;
          })}
          {primaryLinks.map((l)=><Link key={l.href} href={l.href} className="rnav-link" data-active={isActive(l.href)||undefined} aria-current={isActive(l.href)?"page":undefined}>{l.label}</Link>)}
        </nav>

        <Link className="rnav-logo" href="/" aria-label="Radicubs home" onClick={scrollHomeToTop}>
          <img src="/radical-wordmark-green.svg" alt="Radicubs" />
        </Link>

        <div className="rnav-actions">
          <DonateLink className="rnav-link rnav-secondary" href={donateUrl}><RollText text="Donate" /></DonateLink>
          <GlowButton className="rnav-cta" href="/contact">Get involved</GlowButton>
          <button ref={toggleRef} type="button" className="rnav-toggle" onClick={()=>setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="rnav-mobile">
            <Menu size={20}/>
          </button>
        </div>
      </div>

    </div>

    {mounted&&createPortal(<div id="rnav-mobile" className="rnav-drawer" data-open={menuOpen||undefined} role="dialog" aria-modal="true" aria-label="Site menu" inert={!menuOpen}>
      <span className="rnav-drawer-sweep" aria-hidden="true" />
      <div className="rnav-drawer-panel">
        <div className="rnav-drawer-head">
          <Link className="rnav-drawer-logo" href="/" aria-label="Radicubs home" onClick={(e)=>{ scrollHomeToTop(e); setMenuOpen(false); }}>
            <img src="/radical-wordmark-green.svg" alt="Radicubs" />
          </Link>
          <button ref={closeRef} type="button" className="rnav-toggle rnav-drawer-close" onClick={()=>setMenuOpen(false)} aria-label="Close menu">
            <X size={20}/>
          </button>
        </div>

        <nav className="rnav-drawer-nav" aria-label="Mobile navigation">
          {(()=>{ let i=0; return mobileSections.map((section)=><div key={section.label} className="rnav-drawer-section">
            <p className="rnav-drawer-label" style={{"--i":i++} as React.CSSProperties}>{section.label}</p>
            {section.links.map((l)=>{ const n=i++; return <Link key={l.href} href={l.href} className="rnav-drawer-link" style={{"--i":n} as React.CSSProperties} data-active={isActive(l.href)||undefined} aria-current={isActive(l.href)?"page":undefined} onClick={()=>setMenuOpen(false)}>
              <span className="rnav-drawer-text">{l.label}</span>
              <ArrowUpRight className="rnav-drawer-arrow" size={22} strokeWidth={1.75} aria-hidden="true" />
            </Link>; })}
          </div>); })()}
        </nav>

        <div className="rnav-drawer-foot" style={{"--i":mobileSections.reduce((n,s)=>n+s.links.length+1,0)} as React.CSSProperties}>
          <DonateLink className="rnav-drawer-secondary" href={donateUrl} after={<> <ArrowUpRight size={16} aria-hidden="true" /></>}>Donate</DonateLink>
          <GlowButton className="rnav-cta" href="/contact">Get involved</GlowButton>
        </div>
      </div>
    </div>,document.body)}
  </header>;
}
