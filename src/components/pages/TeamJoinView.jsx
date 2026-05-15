import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Cpu, Globe, Heart, Users } from 'lucide-react';

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { fetchTeamPage } from '../../lib/strapiTeamPage.js';
import { fetchRosters } from '../../lib/strapiRosters.js';

const TeamJoinView = () => {
  const [rosters, setRosters] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  const [applicationOpen, setApplicationOpen] = useState(true);
  const [applicationLink, setApplicationLink] = useState(null);
  const [teamPageDescription, setTeamPageDescription] = useState(
    'Meet the students driving the future. No prior experience required. Just a willingness to learn, work hard, and be radical.'
  );

  const rosterYears = rosters.map((r) => r.year);
  const displayedMembers = rosters.find((r) => r.year === selectedYear)?.members ?? [];

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const [teamPage, fetchedRosters] = await Promise.all([
        fetchTeamPage({ signal: controller.signal }),
        fetchRosters({ signal: controller.signal }),
      ]);

      if (Array.isArray(fetchedRosters) && fetchedRosters.length > 0) {
        setRosters(fetchedRosters);

        setSelectedYear((prev) => {
          if (prev && fetchedRosters.some((r) => r.year === prev)) return prev;
          return fetchedRosters[0].year;
        });
      }

      if (!teamPage) return;

      if (typeof teamPage.description === 'string' && teamPage.description.trim().length > 0) {
        setTeamPageDescription(teamPage.description.trim());
      }

      if (typeof teamPage.applicationOpen === 'boolean') {
        setApplicationOpen(teamPage.applicationOpen);
      }

      if (typeof teamPage.applicationLink === 'string' && teamPage.applicationLink.trim().length > 0) {
        setApplicationLink(teamPage.applicationLink.trim());
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full pt-24 bg-[#101215] min-h-screen pb-24">
      <section className="px-6 md:px-16 lg:px-24 mb-16 max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-white mb-4">
            <span className="text-[#5ddb27]">√</span> The Radicubs
          </h2>
          <p className="text-[#d3d3d3] text-lg leading-relaxed max-w-2xl">
            {teamPageDescription}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 lg:px-24 mb-24 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className={`${applicationOpen ? 'lg:w-2/3' : 'w-full'} flex flex-col justify-start text-left`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center !p-8">
                <Cpu className="text-[#5ddb27] mx-auto mb-4" size={32} />
                <h4 className="text-white font-mono mb-2">Hands-on Experience</h4>
              </Card>
              <Card className="text-center !p-8">
                <Globe className="text-[#5ddb27] mx-auto mb-4" size={32} />
                <h4 className="text-white font-mono mb-2">Community Impact</h4>
              </Card>
              <Card className="text-center !p-8">
                <Heart className="text-[#5ddb27] mx-auto mb-4" size={32} />
                <h4 className="text-white font-mono mb-2">A Team That Feels Like Family</h4>
              </Card>
            </div>

            {applicationOpen && (
              <div className="max-w-2xl">
                <h3 className="text-2xl font-mono text-white mb-6 border-b border-[#2c303a] pb-4">
                  Application Tips
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 text-[#d3d3d3] bg-[#101215] p-4 rounded border border-[#2c303a]">
                    <CheckCircle2 size={24} className="text-[#5ddb27] shrink-0" />
                    <span className="leading-relaxed">Be authentic and show passion.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#d3d3d3] bg-[#101215] p-4 rounded border border-[#2c303a]">
                    <CheckCircle2 size={24} className="text-[#5ddb27] shrink-0" />
                    <span className="leading-relaxed">Highlight teamwork and initiative.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#d3d3d3] bg-[#101215] p-4 rounded border border-[#2c303a]">
                    <CheckCircle2 size={24} className="text-[#5ddb27] shrink-0" />
                    <span className="leading-relaxed">Demonstrate interest in STEM or learning.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {applicationOpen && (
            <div className="lg:w-1/3">
              <div className="bg-[#1b1d23] border border-[#2c303a] rounded-lg p-8 relative h-full flex flex-col">
                <h3 className="text-2xl font-mono text-white mb-8 border-b border-[#2c303a] pb-4">
                  Application Timeline
                </h3>

                <div className="space-y-8 flex-grow relative before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-[#2c303a] z-10 mb-8">
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-[#5ddb27] border-4 border-[#1b1d23] shrink-0 mt-1"></div>
                    <div>
                      <h4 className="text-white font-mono font-bold text-lg">May 1st</h4>
                      <p className="text-[#a9a9a9] text-sm mt-1">Applications Open</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-[#2c303a] border-4 border-[#1b1d23] shrink-0 mt-1"></div>
                    <div>
                      <h4 className="text-white font-mono font-bold text-lg">Interviews</h4>
                      <p className="text-[#a9a9a9] text-sm mt-1">Chat regarding goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-[#2c303a] border-4 border-[#1b1d23] shrink-0 mt-1"></div>
                    <div>
                      <h4 className="text-white font-mono font-bold text-lg">Summer</h4>
                      <p className="text-[#a9a9a9] text-sm mt-1">Team Onboarding</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-[#2c303a]">
                  <Button
                    className="w-full"
                    onClick={() => {
                      const href = applicationLink || 'mailto:radicubs@gmail.com';
                      window.open(href, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 md:px-16 lg:px-24 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-[#2c303a] pb-6">
          <h3 className="text-3xl font-mono text-white mb-4 sm:mb-0 text-center sm:text-left">
            Team Roster
          </h3>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-[#1b1d23] border border-[#5ddb27] text-white font-mono py-2 pl-4 pr-10 rounded outline-none focus:ring-2 focus:ring-[#5ddb27]/50 cursor-pointer"
            >
              {rosterYears.length === 0 && (
                <option value="" disabled>
                  Select Season
                </option>
              )}
              {rosterYears.map((year) => (
                <option key={year} value={year}>
                  {year} Season
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ddb27] pointer-events-none"
            />
          </div>
        </div>

        <div className="w-full">
          <div key={selectedYear} className="fade-in-up">
            {displayedMembers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedMembers.map((member, i) => (
                  <div
                    key={i}
                    className="bg-[#1b1d23] border border-[#2c303a] rounded p-4 text-center card-hover flex flex-col items-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#2c303a] mb-4 border-2 border-[#101215] overflow-hidden flex items-center justify-center text-[#a9a9a9] text-xs font-mono relative">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <>
                          <Users size={32} className="opacity-20 absolute" />
                          <span className="z-10 relative">NO PHOTO</span>
                        </>
                      )}
                    </div>
                    <h4 className="text-white font-mono font-bold text-sm mb-1">{member.name}</h4>
                    <p className="text-[#5ddb27] text-xs font-mono">{member.role}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#2c303a] rounded-lg py-12 text-center text-[#a9a9a9] font-mono w-full">
                <Users size={48} className="mx-auto mb-4 text-[#2c303a]" />
                <p>Roster data for {selectedYear || 'this season'} is syncing with radicubs.com.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamJoinView;
