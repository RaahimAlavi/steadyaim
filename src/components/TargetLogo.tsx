import React from 'react';

interface TargetLogoProps {
  className?: string;
  size?: number;
}

export const TargetLogo: React.FC<TargetLogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer subtle boundary ring */}
      <circle cx="16" cy="16" r="13" stroke="#252d40" strokeWidth="1.5" />
      {/* Precision Reticle Ring */}
      <circle cx="16" cy="16" r="8" stroke="#00f5d4" strokeWidth="1.75" />
      {/* Cardinal Alignment Ticks */}
      <line x1="16" y1="2" x2="16" y2="6.5" stroke="#00f5d4" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="16" y1="25.5" x2="16" y2="30" stroke="#00f5d4" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="2" y1="16" x2="6.5" y2="16" stroke="#00f5d4" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="25.5" y1="16" x2="30" y2="16" stroke="#00f5d4" strokeWidth="1.75" strokeLinecap="round" />
      {/* Center Precision Target Point */}
      <circle cx="16" cy="16" r="2.2" fill="#ff4655" />
    </svg>
  );
};
