import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const ChloeIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="chloeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1976d2" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
      </defs>
      
      {/* Outer D shape - thick blue outline */}
      <path
        d="M4 4 L4 20 L16 20 Q20 20 20 16 L20 8 Q20 4 16 4 L4 4 Z"
        fill="none"
        stroke="url(#chloeGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Inner chat bubble with blue fill */}
      <path
        d="M8 8 L14 8 Q16 8 16 10 L16 12 Q16 14 14 14 L10 14 L8 16 L8 14 Q8 12 8 10 Q8 8 10 8 Z"
        fill="url(#chloeGradient)"
        opacity="0.8"
      />
      
      {/* Chat bubble tail */}
      <path
        d="M8 16 L6 18 L8 18 Z"
        fill="url(#chloeGradient)"
        opacity="0.8"
      />
      
      {/* Subtle sparkle for AI touch */}
      <circle cx="18" cy="6" r="1" fill="url(#chloeGradient)" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    </SvgIcon>
  );
};

export default ChloeIcon;
