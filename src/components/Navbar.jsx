import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from './ui/Button.jsx';
import { navigateTo } from '../lib/navigation.js';

const Navbar = ({ currentPath = '/' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { id: 'home', label: 'Home', path: '/' },
      { id: 'about', label: 'About', path: '/about' },
      { id: 'history', label: 'History', path: '/history' },
      { id: 'projects', label: 'Impact', path: '/projects' },
      { id: 'team', label: 'Team', path: '/team' },
      { id: 'gallery', label: 'Gallery', path: '/gallery' },
      { id: 'blog', label: 'Blog', path: '/blog' },
      { id: 'sponsors', label: 'Sponsors', path: '/sponsors' },
    ],
    []
  );

  const isActive = (id) => {
    if (id === 'home') return currentPath === '/';
    if (id === 'blog') return currentPath === '/blog' || currentPath.startsWith('/blog/');
    const link = navLinks.find((l) => l.id === id);
    return link ? currentPath === link.path : false;
  };

  const handleNav = (id) => {
    setMobileMenuOpen(false);
    navigateTo(id);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 bg-[#101215] ${
        isScrolled ? 'border-b border-[#2c303a] py-4 shadow-lg' : 'py-6 border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNav('home')}>
          <span className="text-[#5ddb27] font-mono text-2xl font-bold group-hover:scale-110 transition-transform">
            √
          </span>
          <span className="text-white font-mono text-xl tracking-widest font-bold">RADICUBS</span>
        </div>

        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`font-mono text-sm tracking-wider hover:text-[#5ddb27] transition-colors ${
                isActive(link.id) ? 'text-[#5ddb27]' : 'text-[#d3d3d3]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <Button onClick={() => handleNav('join')} className="!py-2 !px-4 text-sm">
            Join Us
          </Button>
        </div>

        <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <ChevronDown className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#1b1d23] border-b border-[#2c303a] flex flex-col p-4 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`py-3 font-mono text-left px-4 ${
                isActive(link.id) ? 'text-[#5ddb27] bg-[#2c303a]/50' : 'text-[#d3d3d3]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="p-4">
            <Button className="w-full" onClick={() => handleNav('join')}>
              Join Us
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
