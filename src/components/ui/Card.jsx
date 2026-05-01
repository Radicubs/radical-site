import React from 'react';

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[#2c303a] border border-[#1b1d23] rounded-lg p-6 card-hover ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export default Card;
