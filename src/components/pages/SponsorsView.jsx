import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { sponsorLogos } from '../../lib/api.js';

const SponsorsView = () => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="w-full pt-24 bg-[#101215] min-h-screen relative">
      <section className="px-6 md:px-16 lg:px-24 max-w-5xl mx-auto text-center mb-16 fade-in-up">
        <h2 className="text-4xl md:text-6xl font-mono font-bold text-white mb-6">
          Fuel The <span className="text-[#5ddb27]">Innovation</span>
        </h2>
        <p className="text-xl text-[#d3d3d3] leading-relaxed mb-10">
          Radicubs is entirely funded by corporate sponsors, grants, and community donations. By partnering with us, you aren't just funding a robot—you are investing in the next generation of engineers, leaders, and innovators in North Texas.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button onClick={() => setShowToast(true)}>Download Sponsorship</Button>
          <Button variant="outline" onClick={() => (window.location.href = 'mailto:radicubs@gmail.com')}>
            Contact Us Directly
          </Button>
          <Button variant="secondary" className="border border-[#5ddb27] hover:border-[#5ddb27]">
            Donate
          </Button>
        </div>
      </section>

      <section className="py-16 bg-[#1b1d23] border-y border-[#2c303a] mb-24">
        <div className="container mx-auto px-6">
          <h3 className="text-center font-mono text-[#a9a9a9] uppercase tracking-widest mb-12">
            Trusted By Industry Leaders
          </h3>

          {sponsorLogos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {' '}
            </div>
          ) : (
            <div className="text-center border border-dashed border-[#2c303a] rounded py-12 font-mono text-[#a9a9a9] text-sm">
              Sponsor Logos Syncing...
            </div>
          )}
        </div>
      </section>

      <section className="px-6 md:px-16 lg:px-24 max-w-6xl mx-auto mb-24">
        <div className="mb-24">
          <h3 className="text-3xl font-mono text-white mb-10 text-center">Ways to Support</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="!bg-[#1b1d23] !border-[#2c303a] !p-8 text-left flex flex-col">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Donation Matching</h4>
              <p className="text-[#d3d3d3] text-sm leading-relaxed">Encourage companies to match employee donations</p>
            </Card>
            <Card className="!bg-[#1b1d23] !border-[#2c303a] !p-8 text-left flex flex-col">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Sponsorship</h4>
              <p className="text-[#d3d3d3] text-sm leading-relaxed">Financial support in exchange for visibility and partnership</p>
            </Card>
            <Card className="!bg-[#1b1d23] !border-[#2c303a] !p-8 text-left flex flex-col">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Direct Donation</h4>
              <p className="text-[#d3d3d3] text-sm leading-relaxed">One-time or recurring financial contributions</p>
            </Card>
            <Card className="!bg-[#1b1d23] !border-[#2c303a] !p-8 text-left flex flex-col">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Workspace & Tools</h4>
              <p className="text-[#d3d3d3] text-sm leading-relaxed">Providing workspace, tools, or equipment to support team operations</p>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-mono text-white mb-10 text-center">Sponsorship Benefits</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1b1d23] border border-[#2c303a] p-8 rounded-lg">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Brand Visibility</h4>
              <ul className="space-y-2 text-[#d3d3d3] text-sm">
                <li>• Logo on our robot, team uniforms, and website</li>
                <li>• Recognition at competitions and community events</li>
                <li>• Mentions in press releases and social media</li>
              </ul>
            </div>
            <div className="bg-[#1b1d23] border border-[#2c303a] p-8 rounded-lg">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Community Impact</h4>
              <ul className="space-y-2 text-[#d3d3d3] text-sm">
                <li>• Support STEM education in our community</li>
                <li>• Help develop future engineers and innovators</li>
                <li>• Contribute to workforce development</li>
              </ul>
            </div>
            <div className="bg-[#1b1d23] border border-[#2c303a] p-8 rounded-lg">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Team Engagement</h4>
              <ul className="space-y-2 text-[#d3d3d3] text-sm">
                <li>• Opportunities for team demonstrations at your facility</li>
                <li>• Mentorship and internship connections</li>
                <li>• Invitations to team events and competitions</li>
              </ul>
            </div>
            <div className="bg-[#1b1d23] border border-[#2c303a] p-8 rounded-lg">
              <h4 className="font-mono text-xl text-[#5ddb27] mb-4">Tax Benefits</h4>
              <ul className="space-y-2 text-[#d3d3d3] text-sm">
                <li>• Tax-deductible contributions</li>
                <li>• Documentation for corporate social responsibility initiatives</li>
                <li>• Annual impact reports for your records</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-[#2c303a] pt-16">
          <Card>
            <div className="text-4xl font-mono text-white mb-2">2,500+</div>
            <div className="text-[#5ddb27] font-mono text-sm uppercase mb-4">Annual Reach</div>
            <p className="text-[#a9a9a9] text-sm">Your brand visible at massive community events, libraries, and schools.</p>
          </Card>
          <Card>
            <div className="text-4xl font-mono text-white mb-2">501(c)(3)</div>
            <div className="text-[#5ddb27] font-mono text-sm uppercase mb-4">Tax Deductible</div>
            <p className="text-[#a9a9a9] text-sm">All sponsorships and donations are fully tax-deductible contributions.</p>
          </Card>
          <Card>
            <div className="text-4xl font-mono text-white mb-2">100%</div>
            <div className="text-[#5ddb27] font-mono text-sm uppercase mb-4">Student Impact</div>
            <p className="text-[#a9a9a9] text-sm">Funds go directly to parts, competition fees, and community outreach.</p>
          </Card>
        </div>
      </section>

      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 fade-in-up">
          <div className="bg-[#1b1d23] border border-[#2c303a] border-l-4 border-l-[#5ddb27] rounded-lg shadow-2xl p-6 max-w-sm flex flex-col gap-2 relative">
            <button
              onClick={() => setShowToast(false)}
              className="absolute top-3 right-3 text-[#a9a9a9] hover:text-white transition-colors text-lg leading-none"
              aria-label="Close pop-up"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-[#5ddb27] font-mono font-bold mb-2">
              <FileText size={18} />
              <span>Sponsorship Packet</span>
            </div>
            <p className="text-[#d3d3d3] text-sm leading-relaxed">
              Contact{' '}
              <a
                href="mailto:radicubs@gmail.com"
                className="text-white hover:text-[#5ddb27] underline transition-colors"
              >
                radicubs@gmail.com
              </a>{' '}
              to get the packet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorsView;
