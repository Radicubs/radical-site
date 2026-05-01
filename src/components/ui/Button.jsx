import React from 'react';

const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseStyle =
    'font-mono font-bold px-6 py-3 rounded uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base';
  const variants = {
    primary: 'bg-[#5ddb27] text-[#101215] hover:bg-white border-2 border-transparent',
    outline:
      'border-2 border-[#5ddb27] text-[#5ddb27] hover:bg-[#5ddb27] hover:text-[#101215]',
    secondary:
      'bg-[#2c303a] text-white hover:bg-[#1b1d23] border-2 border-transparent hover:border-[#5ddb27]',
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
