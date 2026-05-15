import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Cpu, Users, Zap } from 'lucide-react';

import Card from '../ui/Card.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { fetchProjects } from '../../lib/strapiProjects.js';

const ProjectsView = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      const rows = await fetchProjects({ signal: controller.signal });
      setProjects(Array.isArray(rows) ? rows : []);
      setIsLoading(false);
    })();

    return () => controller.abort();
  }, []);

  const { ongoingProjects, pastProjects } = useMemo(() => {
    const ongoing = [];
    const past = [];

    for (const project of projects) {
      if (project?.timeline === 'Present') ongoing.push(project);
      else if (project?.timeline === 'Past') past.push(project);
    }

    return {
      ongoingProjects: ongoing,
      pastProjects: past,
    };
  }, [projects]);

  const pastIcons = [Cpu, BookOpen, Users, Zap];

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
            {isLoading && (
              <div className="text-center text-[#a9a9a9] font-mono text-sm col-span-full">Loading projects…</div>
            )}

            {!isLoading && ongoingProjects.length === 0 && (
              <div className="text-center text-[#a9a9a9] font-mono text-sm col-span-full">No ongoing projects yet.</div>
            )}

            {ongoingProjects.map((project, index) => {
              const href = project.buttonLink || 'mailto:radicubs@gmail.com';
              const buttonText = project.buttonText || 'Contact radicubs@gmail.com to get involved';

              return (
                <div
                  key={project.id ?? `${project.title}-${index}`}
                  className="bg-[#101215] rounded-lg p-8 border border-[#2c303a] card-hover flex flex-col"
                >
                  <div className="flex flex-col mb-6">
                    <h4 className="text-2xl font-mono text-white mb-2">{project.title}</h4>
                  </div>

                  <p className="text-[#d3d3d3] mb-6 whitespace-pre-line">{project.description}</p>

                  {project.button && (
                    <div className="mt-auto pt-6 border-t border-[#2c303a]">
                      <a
                        href={href}
                        className="inline-block w-full text-center font-mono font-bold bg-[#5ddb27] text-[#101215] py-3 rounded hover:bg-white transition-colors uppercase tracking-wider text-sm"
                      >
                        {buttonText}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 lg:px-24 mb-24 max-w-7xl mx-auto">
        <h3 className="text-3xl font-mono text-white mb-10 border-b border-[#2c303a] pb-4 inline-flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#2c303a] border border-[#5ddb27]"></span> Past Projects & Outreach
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading && (
            <div className="text-center text-[#a9a9a9] font-mono text-sm col-span-full">Loading projects…</div>
          )}

          {!isLoading && pastProjects.length === 0 && (
            <div className="text-center text-[#a9a9a9] font-mono text-sm col-span-full">No past projects yet.</div>
          )}

          {pastProjects.map((project, index) => {
            const Icon = pastIcons[index % pastIcons.length];
            return (
              <Card key={project.id ?? `${project.title}-${index}`}
              >
                <div className="text-[#5ddb27] mb-4">
                  <Icon size={32} />
                </div>
                <h4 className="text-xl font-mono text-white mb-3">{project.title}</h4>
                <p className="text-[#a9a9a9] mb-4">{project.description}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ProjectsView;
