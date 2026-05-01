import React from 'react';
import { navigateTo } from '../lib/navigation.js';

const Footer = () => {
  return (
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
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-[#5ddb27]">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('projects')} className="hover:text-[#5ddb27]">
                Outreach
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('history')} className="hover:text-[#5ddb27]">
                History
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-mono mb-4">Connect</h4>
          <ul className="space-y-2 text-[#a9a9a9] text-sm">
            <li>
              <a href="mailto:radicubs@gmail.com" className="hover:text-[#5ddb27]">
                radicubs@gmail.com
              </a>
            </li>
            <li>
              <button onClick={() => navigateTo('sponsors')} className="hover:text-[#5ddb27]">
                Sponsor Us
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('join')} className="hover:text-[#5ddb27]">
                Join the Team
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-[#1b1d23] text-center text-[#a9a9a9] text-xs font-mono">
        © {new Date().getFullYear()} Radicubs Robotics. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
