import React from 'react';
import { BookOpen, Cpu, ExternalLink, Users, Zap } from 'lucide-react';

import Card from '../ui/Card.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';

const ProjectsView = () => {
  return (
    <div className="w-full pt-24 bg-[#101215]">
      <section className="px-6 md:px-16 lg:px-24 mb-16 max-w-7xl mx-auto">
        <SectionHeader
          title="Projects & Impact"
          subtitle="Impacting 2,500+ people annually through outreach, mentorship, and advocacy."
        />
      </section>

      <section className="bg-[#1b1d23] py-20 px-6 md:px-16 lg:px-24 mb-16 border-y border-[#2c303a]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-mono text-white mb-10 border-b border-[#2c303a] pb-4 inline-flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#5ddb27]"></span> Ongoing Projects
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-[#101215] rounded-lg p-8 border border-[#2c303a] card-hover flex flex-col">
              <div className="flex flex-col mb-6">
                <h4 className="text-2xl font-mono text-white mb-2">Central Elementary School Supply Drive</h4>
                <span className="text-[#5ddb27] font-mono text-sm uppercase tracking-widest">Community Initiative</span>
              </div>
              <p className="text-[#d3d3d3] mb-6">
                We organized a specific supply drive benefitting Central Elementary, incentivizing community giving through a unique "1 supply = 1 volunteer hour" exchange model to maximize local impact.
              </p>
              <h5 className="font-mono text-white mb-3 text-sm">Target Supplies Collected:</h5>
              <ul className="grid grid-cols-2 gap-2 text-[#a9a9a9] text-sm mb-8">
                <li>• Colored pencils</li>
                <li>• Notebooks</li>
                <li>• Dry erase markers</li>
                <li>• Spiral notebooks</li>
                <li>• Washable markers</li>
              </ul>

              <div className="mt-auto pt-6 border-t border-[#2c303a]">
                <a
                  href="mailto:radicubs@gmail.com"
                  className="inline-block w-full text-center font-mono font-bold bg-[#5ddb27] text-[#101215] py-3 rounded hover:bg-white transition-colors uppercase tracking-wider text-sm"
                >
                  Contact radicubs@gmail.com to get involved
                </a>
              </div>
            </div>

            <div className="bg-[#101215] rounded-lg p-8 border border-[#2c303a] card-hover flex flex-col">
              <h4 className="text-2xl font-mono text-white mb-4">Robot Showcases</h4>
              <p className="text-[#d3d3d3] mb-6">
                We bring our competition robots to community events like Colorpalooza, Touch-A-Truck, and Twin Creeks. These interactive demos blend education with engagement.
              </p>
              <div className="bg-[#2c303a] p-6 rounded mt-auto border border-[#1b1d23]">
                <p className="text-sm text-[#a9a9a9] mb-3">Want us at your next event?</p>
                <a href="mailto:radicubs@gmail.com" className="text-[#5ddb27] font-mono hover:underline flex items-center gap-2">
                  Email Event Coordinator <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 lg:px-24 mb-24 max-w-7xl mx-auto">
        <h3 className="text-3xl font-mono text-white mb-10 border-b border-[#2c303a] pb-4 inline-flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#2c303a] border border-[#5ddb27]"></span> Past Projects & Outreach
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <div className="text-[#5ddb27] mb-4">
              <Cpu size={32} />
            </div>
            <h4 className="text-xl font-mono text-white mb-3">Techie Factory Camps</h4>
            <p className="text-[#a9a9a9] mb-4">
              We host dedicated STEM camps at the Techie Factory, directly teaching over 30+ young students the fundamentals of programming, electronics, and robotics design.
            </p>
          </Card>
          <Card>
            <div className="text-[#5ddb27] mb-4">
              <BookOpen size={32} />
            </div>
            <h4 className="text-xl font-mono text-white mb-3">Frisco Library Workshops</h4>
            <p className="text-[#a9a9a9] mb-4">
              Our recurring community events at the Frisco Library attract approximately 200 attendees each, bringing interactive robot demos and engineering concepts to the general public.
            </p>
          </Card>
          <Card>
            <div className="text-[#5ddb27] mb-4">
              <Users size={32} />
            </div>
            <h4 className="text-xl font-mono text-white mb-3">FIRST Mentorship</h4>
            <p className="text-[#a9a9a9] mb-4">
              We actively mentor FRC 8816 Coyotronics and several FLL teams. We provide workshops on programming, safety, and business, sharing our resources to elevate the entire region.
            </p>
          </Card>
          <Card>
            <div className="text-[#5ddb27] mb-4">
              <Zap size={32} />
            </div>
            <h4 className="text-xl font-mono text-white mb-3">WiRE & FIRST Ladies</h4>
            <p className="text-[#a9a9a9] mb-4">
              Through Women in Robotics Engineering (WiRE) workshops and FIRST Ladies initiatives, we actively dismantle barriers for young girls entering STEM fields.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ProjectsView;
