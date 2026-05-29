import React, { useEffect, useState } from 'react';
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
import { fetchLatestAwards } from '../../lib/strapiAwards.js';
import { fetchSponsors } from '../../lib/strapiSponsors.js';
import { fetchHomepage } from '../../lib/strapiHomepage.js';
import { fetchProjects } from '../../lib/strapiProjects.js';
import { fetchLatestBlogPosts } from '../../lib/strapiBlogPosts.js';

const pickProjectPreview = (rawDescription) => {
  if (typeof rawDescription !== 'string') return '';
  const trimmed = rawDescription.trim();
  if (!trimmed) return '';

  // Use the first paragraph to keep homepage cards concise.
  const firstParagraph = trimmed.split(/\n\s*\n/)[0]?.trim();
  return firstParagraph || trimmed;
};

const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const HomeView = () => {
  const navigate = navigateTo;

  const currentYear = new Date().getFullYear();
  const fallbackSeasons = currentYear - 2019 + 1;

  const [awards, setAwards] = useState([]);
  const [awardsLoading, setAwardsLoading] = useState(true);

  const [sponsors, setSponsors] = useState([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  const [teamPhotoUrl, setTeamPhotoUrl] = useState(null);
  const [homepageDescription, setHomepageDescription] = useState(
    'We are a student-led, 501(c)(3) nonprofit robotics organization redefining STEM access, innovation, and community impact across North Texas.'
  );

  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [ongoingProjectsLoading, setOngoingProjectsLoading] = useState(true);

  const [blogPosts, setBlogPosts] = useState([]);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);

  const [homepageStats, setHomepageStats] = useState({
    foundingYear: '2019',
    teamNumber: '7503',
    activeSeasons: fallbackSeasons,
    totalAwards: '8+',
  });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setAwardsLoading(true);
      const latest = await fetchLatestAwards({ limit: 8, signal: controller.signal });
      setAwards(latest);
      setAwardsLoading(false);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setBlogPostsLoading(true);
      const rows = await fetchLatestBlogPosts({ limit: 4, signal: controller.signal });
      setBlogPosts(rows);
      setBlogPostsLoading(false);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setOngoingProjectsLoading(true);
      const rows = await fetchProjects({ signal: controller.signal });
      const present = Array.isArray(rows) ? rows.filter((p) => p?.timeline === 'Present') : [];
      setOngoingProjects(present.slice(0, 2));
      setOngoingProjectsLoading(false);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const homepage = await fetchHomepage({ signal: controller.signal });
      if (!homepage) return;

      setTeamPhotoUrl(homepage.teamPhotoUrl ?? null);

      if (typeof homepage.description === 'string' && homepage.description.trim().length > 0) {
        setHomepageDescription(homepage.description.trim());
      }

      setHomepageStats((prev) => ({
        ...prev,
        foundingYear:
          homepage.foundingYear != null ? String(homepage.foundingYear) : prev.foundingYear,
        teamNumber: homepage.teamNumber != null ? String(homepage.teamNumber) : prev.teamNumber,
        activeSeasons:
          homepage.activeSeasons != null ? homepage.activeSeasons : prev.activeSeasons,
        totalAwards:
          homepage.totalAwards != null ? String(homepage.totalAwards) : prev.totalAwards,
      }));
    })();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setSponsorsLoading(true);
      const rows = await fetchSponsors({ signal: controller.signal });
      setSponsors(rows);
      setSponsorsLoading(false);
    })();

    return () => {
      controller.abort();
    };
  }, []);

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
            {homepageDescription}
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
            { label: 'Founded', value: homepageStats.foundingYear },
            { label: 'Team Number', value: homepageStats.teamNumber },
            { label: 'Active Seasons', value: homepageStats.activeSeasons },
            { label: 'Awards Won', value: homepageStats.totalAwards },
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

          {!sponsorsLoading && sponsors.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8 transition-all duration-500 max-w-5xl mx-auto">
              {sponsors.map((sponsor, i) => {
                const content = (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name || 'Sponsor logo'}
                    className="h-16 md:h-20 w-auto object-contain"
                    loading="lazy"
                  />
                );

                const wrapperClass = "basis-1/2 md:basis-1/4 flex items-center justify-center";

                if (sponsor.website) {
                  return (
                    <a
                      key={i}
                      href={sponsor.website}
                      target="_blank"
                      rel="noreferrer"
                      className={wrapperClass}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={i} className={wrapperClass}>
                    {content}
                  </div>
                );
              })}
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
          <div className="space-y-4 overflow-y-auto lg:max-h-[420px] lg:pr-2">
            {awardsLoading ? (
              <div className="text-[#a9a9a9] font-mono text-sm">Loading awards…</div>
            ) : awards.length === 0 ? (
              <div className="text-[#a9a9a9] font-mono text-sm">
                No awards found yet. (Check Strapi publishing + permissions.)
              </div>
            ) : (
              awards.map((award, i) => (
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
              ))
            )}
          </div>

          <div className="bg-[#101215] border border-[#2c303a] rounded-xl aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
            {teamPhotoUrl ? (
              <>
                <img
                  src={teamPhotoUrl}
                  alt="Team photo"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1b1d23] to-transparent opacity-60 z-10"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1b1d23] to-transparent opacity-60 z-10"></div>
                <ImageIcon
                  size={64}
                  className="text-[#2c303a] mb-4 z-20 group-hover:scale-110 transition-transform duration-500"
                />
                <span className="text-[#a9a9a9] font-mono font-bold z-20 tracking-widest text-sm bg-[#101215]/80 px-4 py-2 rounded">
                  TEAM AWARD PLACEHOLDER
                </span>
              </>
            )}
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
            {ongoingProjectsLoading ? (
              <div className="text-[#a9a9a9] font-mono text-sm col-span-full">Loading projects…</div>
            ) : ongoingProjects.length === 0 ? (
              <div className="text-[#a9a9a9] font-mono text-sm col-span-full">No ongoing projects yet.</div>
            ) : (
              ongoingProjects.map((project, i) => (
                <Card
                  key={project.id ?? `${project.title}-${i}`}
                  className="flex flex-col text-left !p-0 overflow-hidden !bg-[#1b1d23]"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-mono text-white mb-3">{project.title}</h3>
                    <p className="text-[#a9a9a9] text-sm mb-4 flex-grow whitespace-pre-line">
                      {pickProjectPreview(project.description)}
                    </p>
                  </div>
                </Card>
              ))
            )}
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
          {blogPostsLoading ? (
            <div className="text-[#a9a9a9] font-mono text-sm">Loading posts…</div>
          ) : blogPosts.length === 0 ? (
            <div className="border border-dashed border-[#2c303a] rounded-lg p-12 text-center bg-[#101215]">
              <BookOpen size={48} className="mx-auto text-[#2c303a] mb-4" />
              <h3 className="text-xl font-mono text-white mb-2">Blog posts coming soon.</h3>
              <p className="text-[#a9a9a9]">We are currently syncing our latest updates from radicubs.com.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogPosts.slice(0, 4).map((post) => (
                <Card
                  key={post.slug ?? post.id}
                  onClick={() => navigate('blogPost', { slug: post.slug })}
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
                      {formatDate(post.date)}
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
