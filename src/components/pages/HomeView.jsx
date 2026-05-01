import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { navigateTo } from '../../lib/navigation.js';
import { blogPosts, sponsorLogos } from '../../lib/api.js';

const HomeView = () => {
  const navigate = navigateTo;

  const currentYear = new Date().getFullYear();
  const seasons = currentYear - 2019 + 1;

  const flatAwards = [
    { year: 2026, event: 'Farmersville', name: 'Creativity Award' },
    { year: 2026, event: 'Fort Worth', name: 'Spirit Award' },
    { year: 2023, event: 'Fort Worth', name: 'Judges Award' },
    { year: 2022, event: 'Irving', name: 'Gracious Professionalism Award' },
    { year: 2020, event: 'Plano', name: 'Entrepreneurship Award' },
    { year: 2019, event: 'Plano', name: 'Highest Rookie Seed' },
    { year: 2019, event: 'Greenville', name: 'Highest Rookie Seed' },
    { year: 2019, event: 'Plano', name: 'Rookie Inspiration' },
    { year: 2019, event: 'Greenville', name: 'Rookie All-Star' },
  ];

  return (
    <div className="w-full bg-[#101215]">
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1b1d23] to-transparent opacity-50 z-0 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl fade-in-up">
          <div className="inline-block border border-[#5ddb27] text-[#5ddb27] font-mono px-3 py-1 text-sm mb-6 rounded-full">
            FRC TEAM 7503 // FRISCO, TX
          </div>
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-white mb-6 leading-tight uppercase">
            RADICUBS <br /> <span className="text-[#5ddb27]">ROBOTICS</span>.
          </h1>
          <p className="text-xl text-[#d3d3d3] mb-10 max-w-2xl leading-relaxed">
            We are a student-led, 501(c)(3) nonprofit robotics organization redefining STEM access,
            innovation, and community impact across North Texas.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('join')}>
              Join The Team <ArrowRight size={18} />
            </Button>
            <Button variant="outline" onClick={() => navigate('sponsors')}>
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#1b1d23] border-y border-[#2c303a]">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Founded', value: '2019' },
            { label: 'Team Number', value: '7503' },
            { label: 'Active Seasons', value: seasons },
            { label: 'Awards Won', value: '8+' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-[#a9a9a9] text-sm uppercase tracking-wider font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#101215] border-b border-[#2c303a]">
        <div className="max-w-7xl mx-auto text-center fade-in-up">
          <h3 className="text-3xl font-mono font-bold text-white mb-12 uppercase tracking-wide">
            Powered By Our Sponsors
          </h3>

          {sponsorLogos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {' '}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 max-w-5xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-[#1b1d23] border border-[#2c303a] rounded flex items-center justify-center text-[#d3d3d3] font-mono font-bold text-sm tracking-wider"
                >
                  SPONSOR LOGO
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#1b1d23]">
        <SectionHeader
          title="Trophy Case"
          subtitle="A legacy of engineering excellence, spirit, and community outreach."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
          <div className="space-y-4">
            {flatAwards.map((award, i) => (
              <div
                key={i}
                className="flex items-start md:items-center gap-4 border-b border-[#2c303a] pb-4 text-left"
              >
                <span className="text-[#5ddb27] font-mono text-xl md:text-2xl font-bold w-16 shrink-0">
                  {award.year}
                </span>
                <span className="text-[#a9a9a9] font-mono text-sm uppercase tracking-wider w-32 shrink-0 hidden md:block">
                  {award.event}
                </span>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-white font-medium text-lg w-full">
                  <span className="text-[#a9a9a9] font-mono text-xs uppercase tracking-wider md:hidden">
                    {award.event}
                  </span>
                  <span className="flex items-center gap-2">
                    <Award size={16} className="text-[#5ddb27] hidden md:block" />
                    {award.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#101215] border border-[#2c303a] rounded-xl aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1b1d23] to-transparent opacity-60 z-10"></div>
            <ImageIcon
              size={64}
              className="text-[#2c303a] mb-4 z-20 group-hover:scale-110 transition-transform duration-500"
            />
            <span className="text-[#a9a9a9] font-mono font-bold z-20 tracking-widest text-sm bg-[#101215]/80 px-4 py-2 rounded">
              TEAM AWARD PLACEHOLDER
            </span>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#101215] border-t border-[#2c303a]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Ongoing Projects"
            subtitle="Making a direct impact in our community through continuous outreach and initiatives."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="flex flex-col text-left !p-0 overflow-hidden !bg-[#1b1d23]">
              <div className="h-40 bg-[#2c303a] flex items-center justify-center border-b border-[#101215]">
                <span className="text-[#101215] font-mono font-bold tracking-widest text-xs">
                  PROJECT IMAGE
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-mono text-white mb-3">Central Elementary Supply Drive</h3>
                <p className="text-[#a9a9a9] text-sm mb-4 flex-grow">
                  Incentivizing community giving through a unique "1 supply = 1 volunteer hour" exchange model to maximize local impact.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col text-left !p-0 overflow-hidden !bg-[#1b1d23]">
              <div className="h-40 bg-[#2c303a] flex items-center justify-center border-b border-[#101215]">
                <span className="text-[#101215] font-mono font-bold tracking-widest text-xs">
                  PROJECT IMAGE
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-mono text-white mb-3">Community Robot Showcases</h3>
                <p className="text-[#a9a9a9] text-sm mb-4 flex-grow">
                  Bringing interactive robotics demos to local events like Colorpalooza and Touch-A-Truck to blend education with engagement.
                </p>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button onClick={() => navigate('projects')} className="mx-auto">
              See All Projects <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#1b1d23] border-t border-[#2c303a]">
        <div className="flex justify-between items-end mb-12 fade-in-up max-w-7xl mx-auto">
          <SectionHeader title="Latest Updates" subtitle="Direct from the Radicubs blog." />
          <button
            onClick={() => navigate('blog')}
            className="text-[#5ddb27] font-mono hover:underline mb-4 flex items-center gap-2 shrink-0"
          >
            View All Posts <ArrowRight size={16} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {blogPosts.length === 0 ? (
            <div className="border border-dashed border-[#2c303a] rounded-lg p-12 text-center bg-[#101215]">
              <BookOpen size={48} className="mx-auto text-[#2c303a] mb-4" />
              <h3 className="text-xl font-mono text-white mb-2">Blog posts coming soon.</h3>
              <p className="text-[#a9a9a9]">We are currently syncing our latest updates from radicubs.com.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <Card
                  key={post.id}
                  onClick={() => navigate('blogPost', { postId: post.id })}
                  className="flex flex-col h-full !p-0 overflow-hidden cursor-pointer !bg-[#101215]"
                >
                  <div className="w-full h-48 bg-[#2c303a] relative flex items-center justify-center border-b border-[#1b1d23]">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#1b1d23] font-mono font-bold tracking-widest text-xs">
                        BLOG IMAGE
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-[#a9a9a9] font-mono text-xs mb-3">
                      <Calendar size={14} />
                      {post.date}
                    </div>
                    <h3 className="text-xl font-mono font-bold text-white mb-3">{post.title}</h3>
                    <p className="text-[#d3d3d3] text-sm mb-6 flex-grow">{post.description}</p>
                    <div className="text-[#5ddb27] font-mono text-sm flex items-center gap-2 mt-auto">
                      Read Article <ChevronRight size={16} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
