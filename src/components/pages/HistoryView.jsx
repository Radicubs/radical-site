import React from 'react';
import { Award, Cpu } from 'lucide-react';

import SectionHeader from '../ui/SectionHeader.jsx';

const HistoryView = () => {
  const seasonsTimeline = [
    {
      year: '2026',
      game: 'Rebuilt',
      robot: 'Chimera',
      description: 'Data pending synchronization with team records.',
      awards: 'Creativity Award, Spirit Award',
    },
    {
      year: '2025',
      game: 'Reefscape',
      robot: 'Robot Name TBD',
      description: 'Data pending synchronization with team records.',
      awards: '',
    },
    {
      year: '2024',
      game: 'CRESCENDO',
      robot: 'Schrödinger',
      description: 'Data pending synchronization with team records.',
      awards: 'Regional Competitor',
    },
    {
      year: '2023',
      game: 'CHARGED UP',
      robot: 'Robot Name TBD',
      description: 'Data pending synchronization with team records.',
      awards: 'Judges Award',
    },
    {
      year: '2022',
      game: 'RAPID REACT',
      robot: 'Robot Name TBD',
      description: 'Data pending synchronization with team records.',
      awards: 'Gracious Professionalism Award',
    },
    {
      year: '2021',
      game: 'INFINITE RECHARGE',
      robot: 'Robot Name TBD',
      description: 'Data pending synchronization with team records.',
      awards: '',
    },
    {
      year: '2019',
      game: 'DESTINATION: DEEP SPACE',
      robot: 'Robot Name TBD',
      description: 'Data pending synchronization with team records.',
      awards: 'Highest Rookie Seed x2, Rookie Inspiration, Rookie All-Star',
    },
  ];

  return (
    <div className="w-full pt-24 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen pb-24 overflow-hidden">
      <SectionHeader title="Team History" subtitle="Our journey through the FIRST Robotics Competition." />

      <div className="max-w-4xl mx-auto relative timeline-container mt-16">
        {seasonsTimeline.map((item, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div
              key={i}
              className={`relative flex items-center justify-between md:justify-normal mb-16 fade-in-up w-full ${
                isLeft ? 'md:flex-row-reverse' : ''
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full bg-[#5ddb27] border-4 border-[#101215] -translate-x-1/2 z-10 shadow-[0_0_10px_#5ddb27]"></div>

              <div
                className={`w-[calc(100%-40px)] md:w-[calc(50%-40px)] ml-auto md:ml-0 ${
                  isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                }`}
              >
                <div className="bg-[#1b1d23] border border-[#2c303a] rounded-lg overflow-hidden card-hover">
                  <div className="w-full h-40 bg-[#2c303a] flex items-center justify-center relative group">
                    <Cpu size={48} className="text-[#101215] group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute bottom-3 right-3 text-xs font-mono text-[#101215] font-bold">ROBOT IMAGE</span>
                    <div className="absolute top-3 left-3 bg-[#101215]/80 backdrop-blur text-white px-3 py-1 rounded text-xs font-mono border border-[#5ddb27]/30">
                      {item.game}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono text-3xl font-bold text-[#5ddb27]">{item.year}</h3>
                      <div className="w-px h-6 bg-[#2c303a]"></div>
                      <span className="font-mono text-white text-lg">{item.robot}</span>
                    </div>

                    <p className="text-[#d3d3d3] text-sm mb-3">{item.description}</p>

                    {item.awards && (
                      <div className="mt-4 pt-3 border-t border-[#101215]">
                        <div className="text-[#a9a9a9] text-xs flex items-start gap-2">
                          <Award size={16} className="text-[#5ddb27] shrink-0 mt-0.5" />
                          <span>{item.awards}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
