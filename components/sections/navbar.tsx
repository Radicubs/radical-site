"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation, site } from "@/data/site";

export function Navbar(){
  const [open,setOpen]=useState(false);
  const pathname=usePathname();

  const isActive=(href:string)=>{
    if(href==="/") return pathname==="/";
    if(href==="/team") return pathname==="/team" || pathname.startsWith("/team/") || pathname==="/mentors" || pathname.startsWith("/mentors/");
    return pathname===href || pathname.startsWith(`${href}/`);
  };

  return <header className="site-header">
    <div className="nav-shell">
      <Link className="brand" href="/">
        <span className="brand-mark"><img src={site.markImage} alt=""/></span>
        <span className="brand-word">radicubs</span>
        <span className="brand-meta">FRC Team 7503 · Frisco, TX</span>
      </Link>
      <nav className="desktop-nav">{navigation.map(n=>{
        const active=isActive(n.href);
        return <Link key={n.href} href={n.href} className={active?"nav-active":undefined} aria-current={active?"page":undefined}>{n.label}</Link>;
      })}</nav>
      <div className="nav-ctas"><a className="btn btn-light" href={site.donateUrl} target="_blank" rel="noreferrer">Donate</a><a className="btn btn-dark" href={site.applyUrl} target="_blank" rel="noreferrer">Apply</a></div>
      <button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X size={20}/>:<Menu size={20}/>}</button>
    </div>
    {open&&<div className="mobile-nav">{navigation.map(n=>{
      const active=isActive(n.href);
      return <Link key={n.href} href={n.href} className={active?"nav-active":undefined} aria-current={active?"page":undefined} onClick={()=>setOpen(false)}>{n.label}</Link>;
    })}</div>}
  </header>
}
