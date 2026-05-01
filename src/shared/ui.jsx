import React from 'react';

// --- STYLES & FONTS INJECTION ---
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
    
    :root {
      --c-bg-main: #101215;
      --c-bg-sec: #1b1d23;
      --c-bg-card: #2c303a;
      --c-accent: #5ddb27;
      --c-white: #ffffff;
      --c-gray-lt: #d3d3d3;
      --c-gray-dk: #a9a9a9;
    }

    body {
      background-color: var(--c-bg-main);
      color: var(--c-gray-lt);
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    h1, h2, h3, h4, h5, h6, .font-mono {
      font-family: 'Space Mono', monospace;
    }
    
    .text-accent { color: var(--c-accent); }
    .bg-accent { background-color: var(--c-accent); }
    .border-accent { border-color: var(--c-accent); }
    
    .fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
      transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
      to { opacity: 1; transform: translateY(0); }
    }
    
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px -10px rgba(93, 219, 39, 0.1);
      border-color: rgba(93, 219, 39, 0.4);
    }
    
    /* Vertical Timeline styling */
    .timeline-container::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 20px;
      width: 2px;
      background: #2c303a;
    }
    @media (min-width: 768px) {
      .timeline-container::before { left: 50%; transform: translateX(-50%); }
    }
  `}</style>
);

// --- SHARED UI COMPONENTS ---

const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseStyle = "font-mono font-bold px-6 py-3 rounded uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base";
  const variants = {
    primary: "bg-[#5ddb27] text-[#101215] hover:bg-white border-2 border-transparent",
    outline: "border-2 border-[#5ddb27] text-[#5ddb27] hover:bg-[#5ddb27] hover:text-[#101215]",
    secondary: "bg-[#2c303a] text-white hover:bg-[#1b1d23] border-2 border-transparent hover:border-[#5ddb27]"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-12 fade-in-up">
    <h2 className="text-3xl md:text-5xl font-mono font-bold text-white mb-4">
      <span className="text-[#5ddb27]">√</span> {title}
    </h2>
    {subtitle && <p className="text-[#a9a9a9] text-lg max-w-2xl">{subtitle}</p>}
  </div>
);

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-[#2c303a] border border-[#1b1d23] rounded-lg p-6 card-hover ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export { FontStyles, Button, SectionHeader, Card };
