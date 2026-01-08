import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 48, onClick }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`text-hydra-cyan ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path d="M12 12c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2z" />
      <path d="M12 22v-6" />
      <path d="M7 10c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v3c0 1.1-.9 2-2 2z" />
      <path d="M7 22v-8l2-4" />
      <path d="M17 10c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v3c0 1.1-.9 2-2 2z" />
      <path d="M17 22v-8l-2-4" />
      <path d="M5 22h14" />
    </svg>
  );
};