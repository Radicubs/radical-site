import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ArrowRight, Award, Users, Code, Zap, 
  MapPin, Calendar, Heart, Globe, Target, Cpu, 
  ChevronDown, BookOpen, ExternalLink, FileText, CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

import { FontStyles, Button } from './shared/ui.jsx';

import { HomeView } from './views/HomeView.jsx';
import { GalleryView } from './views/GalleryView.jsx';
import { BlogView } from './views/BlogView.jsx';
import { BlogPostView } from './views/BlogPostView.jsx';
import { AboutView } from './views/AboutView.jsx';
import { HistoryView } from './views/HistoryView.jsx';
import { ProjectsView } from './views/ProjectsView.jsx';
import { TeamJoinView } from './views/TeamJoinView.jsx';
import { SponsorsView } from './views/SponsorsView.jsx';


// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'history', label: 'History' },
    { id: 'projects', label: 'Impact' },
    { id: 'team', label: 'Team' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'blog', label: 'Blog' },
    { id: 'sponsors', label: 'Sponsors' },
  ];

  const handleNav = (id, params = {}) => {
    setCurrentView(id);
    if(params.postId) setSelectedPostId(params.postId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView navigate={handleNav} />;
      case 'about': return <AboutView navigate={handleNav} />;
      case 'history': return <HistoryView />;
      case 'projects': return <ProjectsView />;
      case 'team': 
      case 'join': return <TeamJoinView />;
      case 'gallery': return <GalleryView />;
      case 'blog': return <BlogView navigate={handleNav} />;
      case 'blogPost': return <BlogPostView navigate={handleNav} postId={selectedPostId} />;
      case 'sponsors': return <SponsorsView />;
      default: return <HomeView navigate={handleNav} />;
    }
  };

  return (
    <>
      <FontStyles />
      <div className="min-h-screen flex flex-col bg-[#101215]">
        
        {/* NAVBAR */}
        <nav className={`fixed w-full z-50 transition-all duration-300 bg-[#101215] ${isScrolled ? 'border-b border-[#2c303a] py-4 shadow-lg' : 'py-6 border-b border-transparent'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleNav('home')}
            >
              <span className="text-[#5ddb27] font-mono text-2xl font-bold group-hover:scale-110 transition-transform">√</span>
              <span className="text-white font-mono text-xl tracking-widest font-bold">RADICUBS</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`font-mono text-sm tracking-wider hover:text-[#5ddb27] transition-colors ${['blogPost', link.id].includes(currentView) && link.id === 'blog' ? 'text-[#5ddb27]' : currentView === link.id ? 'text-[#5ddb27]' : 'text-[#d3d3d3]'}`}
                >
                  {link.label}
                </button>
              ))}
              <Button onClick={() => handleNav('join')} className="!py-2 !px-4 text-sm">Join Us</Button>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <ChevronDown className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-[#1b1d23] border-b border-[#2c303a] flex flex-col p-4 shadow-xl">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`py-3 font-mono text-left px-4 ${currentView === link.id || (currentView === 'blogPost' && link.id === 'blog') ? 'text-[#5ddb27] bg-[#2c303a]/50' : 'text-[#d3d3d3]'}`}
                >
                  {link.label}
                </button>
              ))}
              <div className="p-4">
                <Button className="w-full" onClick={() => handleNav('join')}>Join Us</Button>
              </div>
            </div>
          )}
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-grow bg-[#101215]">
          {renderView()}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#101215] border-t border-[#2c303a] py-12">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#5ddb27] font-mono text-xl font-bold">√</span>
                <span className="text-white font-mono text-lg tracking-widest font-bold">RADICUBS 7503</span>
              </div>
              <p className="text-[#a9a9a9] text-sm max-w-sm mb-6">
                A 501(c)(3) nonprofit robotics organization based in Frisco, Texas. Engineering the radical future.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-mono mb-4">Explore</h4>
              <ul className="space-y-2 text-[#a9a9a9] text-sm">
                <li><button onClick={() => handleNav('about')} className="hover:text-[#5ddb27]">About Us</button></li>
                <li><button onClick={() => handleNav('projects')} className="hover:text-[#5ddb27]">Outreach</button></li>
                <li><button onClick={() => handleNav('history')} className="hover:text-[#5ddb27]">History</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-mono mb-4">Connect</h4>
              <ul className="space-y-2 text-[#a9a9a9] text-sm">
                <li><a href="mailto:radicubs@gmail.com" className="hover:text-[#5ddb27]">radicubs@gmail.com</a></li>
                <li><button onClick={() => handleNav('sponsors')} className="hover:text-[#5ddb27]">Sponsor Us</button></li>
                <li><button onClick={() => handleNav('join')} className="hover:text-[#5ddb27]">Join the Team</button></li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto px-6 mt-12 pt-8 border-t border-[#1b1d23] text-center text-[#a9a9a9] text-xs font-mono">
            © {new Date().getFullYear()} Radicubs Robotics. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}