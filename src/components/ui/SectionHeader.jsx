import React from 'react';

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-12 fade-in-up">
    <h2 className="text-3xl md:text-5xl font-mono font-bold text-white mb-4">
      <span className="text-[#5ddb27]">√</span> {title}
    </h2>
    {subtitle && <p className="text-[#a9a9a9] text-lg max-w-2xl">{subtitle}</p>}
  </div>
);

export default SectionHeader;
