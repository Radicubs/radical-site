import React from 'react';
import { ArrowRight, Globe, Heart, Target, Users } from 'lucide-react';

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { navigateTo } from '../../lib/navigation.js';

const AboutView = () => {
  const navigate = navigateTo;

  return (
    <div className="w-full pt-24 bg-[#101215] min-h-screen">
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title="Our Origin" subtitle="From a restricted school club to a boundless community force." />
          <div className="space-y-6 text-lg text-[#d3d3d3] leading-relaxed">
            <p>
              In 2019, high school students Caitlin Fukumoto and Sahil Jain recognized a critical gap in
              Frisco, Texas: a severe lack of accessible STEM opportunities. What started as an ambitious
              idea at Reedy High School quickly met administrative roadblocks.
            </p>
            <div className="border-l-4 border-[#5ddb27] pl-6 my-8 py-2">
              <p className="text-white italic text-xl">
                "We didn't just want to build robots. We wanted to build a team where anyone, regardless
                of their background or zip code, could learn to innovate."
              </p>
            </div>
            <p>
              Instead of conceding, the founders pivoted. They broke away from the school district
              restrictions, establishing Radicubs as an independent 501(c)(3) nonprofit organization.
              Today, we stand as a multi-school, community-driven FRC team, empowering students across the
              entire region.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-mono text-white mb-6 flex items-center gap-2">
              <span className="text-[#5ddb27]">√</span> Our Mission
            </h3>
            <p className="text-[#d3d3d3] mb-8 leading-relaxed">
              To expand access to STEM and entrepreneurship through a rigorously student-led structure. We
              believe that true leadership is developed not just by writing code or machining parts, but by
              running an organization, mentoring peers, and giving back to the community.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="!p-4 text-center border-[#2c303a] bg-[#1b1d23]">
                <Target className="mx-auto text-[#5ddb27] mb-2" />
                <h4 className="text-white font-mono text-sm">Student-Led</h4>
              </Card>
              <Card className="!p-4 text-center border-[#2c303a] bg-[#1b1d23]">
                <Globe className="mx-auto text-[#5ddb27] mb-2" />
                <h4 className="text-white font-mono text-sm">Community Focussed</h4>
              </Card>
            </div>

            <Button onClick={() => navigate('projects')} className="w-full sm:w-auto mt-4">
              See Our Projects <ArrowRight size={18} />
            </Button>
          </div>

          <div>
            <h3 className="text-3xl font-mono text-white mb-6 flex items-center gap-2">
              <span className="text-[#5ddb27]">√</span> Diversity & Inclusion
            </h3>
            <div className="space-y-4">
              <Card className="flex items-center gap-4 border-[#2c303a] bg-[#1b1d23]">
                <Globe className="text-[#5ddb27] shrink-0" size={32} />
                <div>
                  <h4 className="text-white font-mono font-bold">15+ Languages Spoken</h4>
                  <p className="text-[#a9a9a9] text-sm">
                    Our members represent a global perspective, with a majority being first or
                    second-generation immigrants.
                  </p>
                </div>
              </Card>
              <Card className="flex items-center gap-4 border-[#2c303a] bg-[#1b1d23]">
                <Heart className="text-[#5ddb27] shrink-0" size={32} />
                <div>
                  <h4 className="text-white font-mono font-bold">LGBTQIA+ Inclusive</h4>
                  <p className="text-[#a9a9a9] text-sm">
                    A safe, welcoming environment where authenticity is celebrated alongside engineering.
                  </p>
                </div>
              </Card>
              <Card className="flex items-center gap-4 border-[#2c303a] bg-[#1b1d23]">
                <Users className="text-[#5ddb27] shrink-0" size={32} />
                <div>
                  <h4 className="text-white font-mono font-bold">FIRST Ladies Certified</h4>
                  <p className="text-[#a9a9a9] text-sm">
                    Active partners in promoting and sustaining female participation in STEM fields.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutView;
