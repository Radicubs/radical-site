import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Globe, Heart, Target, Users } from 'lucide-react';

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { navigateTo } from '../../lib/navigation.js';
import { fetchAboutPage } from '../../lib/strapiAboutPage.js';

const AboutView = () => {
  const navigate = navigateTo;
  const [originHeading, setOriginHeading] = useState('Our Origin');
  const [originSubheading, setOriginSubheading] = useState(
    'From a restricted school club to a boundless community force.'
  );
  const [originBlocks, setOriginBlocks] = useState([
    {
      type: 'paragraph',
      text: 'In 2019, high school students Caitlin Fukumoto and Sahil Jain recognized a critical gap in Frisco, Texas: a severe lack of accessible STEM opportunities. What started as an ambitious idea at Reedy High School quickly met administrative roadblocks.',
    },
    {
      type: 'quote',
      text: "We didn't just want to build robots. We wanted to build a team where anyone, regardless of their background or zip code, could learn to innovate.",
    },
    {
      type: 'paragraph',
      text: 'Instead of conceding, the founders pivoted. They broke away from the school district restrictions, establishing Radicubs as an independent 501(c)(3) nonprofit organization. Today, we stand as a multi-school, community-driven FRC team, empowering students across the entire region.',
    },
  ]);
  const [missionHeading, setMissionHeading] = useState('Our Mission');
  const [missionStatement, setMissionStatement] = useState(
    'To expand access to STEM and entrepreneurship through a rigorously student-led structure. We believe that true leadership is developed not just by writing code or machining parts, but by running an organization, mentoring peers, and giving back to the community.'
  );
  const [missionCards, setMissionCards] = useState([
    { title: 'Student-Led', icon: 'Target' },
    { title: 'Community Focussed', icon: 'Globe' },
  ]);
  const [diversityHeading, setDiversityHeading] = useState('Diversity & Inclusion');
  const [diversityCards, setDiversityCards] = useState([
    {
      title: '15+ Languages Spoken',
      description:
        'Our members represent a global perspective, with a majority being first or second-generation immigrants.',
      icon: 'Globe',
    },
    {
      title: 'LGBTQIA+ Inclusive',
      description:
        'A safe, welcoming environment where authenticity is celebrated alongside engineering.',
      icon: 'Heart',
    },
    {
      title: 'FIRST Ladies Certified',
      description:
        'Active partners in promoting and sustaining female participation in STEM fields.',
      icon: 'Users',
    },
  ]);

  const iconMap = useMemo(
    () => ({
      Target,
      Globe,
      Heart,
      Users,
    }),
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const aboutPage = await fetchAboutPage({ signal: controller.signal });
      if (!aboutPage) return;

      if (typeof aboutPage.originHeading === 'string' && aboutPage.originHeading.trim().length > 0) {
        setOriginHeading(aboutPage.originHeading.trim());
      }

      if (
        typeof aboutPage.originSubheading === 'string' &&
        aboutPage.originSubheading.trim().length > 0
      ) {
        setOriginSubheading(aboutPage.originSubheading.trim());
      }

      if (Array.isArray(aboutPage.originBlocks) && aboutPage.originBlocks.length > 0) {
        setOriginBlocks(aboutPage.originBlocks);
      }

      if (
        typeof aboutPage.missionHeading === 'string' &&
        aboutPage.missionHeading.trim().length > 0
      ) {
        setMissionHeading(aboutPage.missionHeading.trim());
      }

      if (
        typeof aboutPage.missionStatement === 'string' &&
        aboutPage.missionStatement.trim().length > 0
      ) {
        setMissionStatement(aboutPage.missionStatement.trim());
      }

      if (Array.isArray(aboutPage.missionCards) && aboutPage.missionCards.length > 0) {
        setMissionCards(aboutPage.missionCards);
      }

      if (
        typeof aboutPage.diversityHeading === 'string' &&
        aboutPage.diversityHeading.trim().length > 0
      ) {
        setDiversityHeading(aboutPage.diversityHeading.trim());
      }

      if (Array.isArray(aboutPage.diversityCards) && aboutPage.diversityCards.length > 0) {
        setDiversityCards(aboutPage.diversityCards);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full pt-24 bg-[#101215] min-h-screen">
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title={originHeading} subtitle={originSubheading} />
          <div className="space-y-6 text-lg text-[#d3d3d3] leading-relaxed">
            {originBlocks.map((block, i) =>
              block.type === 'quote' ? (
                <div key={i} className="border-l-4 border-[#5ddb27] pl-6 my-8 py-2">
                  <p className="text-white italic text-xl">"{block.text}"</p>
                </div>
              ) : (
                <p key={i}>{block.text}</p>
              )
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-mono text-white mb-6 flex items-center gap-2">
              <span className="text-[#5ddb27]">√</span> {missionHeading}
            </h3>
            <p className="text-[#d3d3d3] mb-8 leading-relaxed">
              {missionStatement}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {missionCards.map((card, i) => {
                const Icon = iconMap[card.icon] ?? Target;
                return (
                  <Card key={i} className="!p-4 text-center border-[#2c303a] bg-[#1b1d23]">
                    <Icon className="mx-auto text-[#5ddb27] mb-2" />
                    <h4 className="text-white font-mono text-sm">{card.title}</h4>
                  </Card>
                );
              })}
            </div>

            <Button onClick={() => navigate('projects')} className="w-full sm:w-auto mt-4">
              See Our Projects <ArrowRight size={18} />
            </Button>
          </div>

          <div>
            <h3 className="text-3xl font-mono text-white mb-6 flex items-center gap-2">
              <span className="text-[#5ddb27]">√</span> {diversityHeading}
            </h3>
            <div className="space-y-4">
              {diversityCards.map((card, i) => {
                const Icon = iconMap[card.icon] ?? Globe;
                return (
                  <Card key={i} className="flex items-center gap-4 border-[#2c303a] bg-[#1b1d23]">
                    <Icon className="text-[#5ddb27] shrink-0" size={32} />
                    <div>
                      <h4 className="text-white font-mono font-bold">{card.title}</h4>
                      <p className="text-[#a9a9a9] text-sm">{card.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutView;
