import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

interface InvertedChatIconProps extends SvgIconProps {
  isActive?: boolean;
}

const InvertedChatIcon: React.FC<InvertedChatIconProps> = ({ isActive = false, ...props }) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1976d2" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Modern chat bubble with gradient and glow */}
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"
        fill={isActive ? "url(#activeGradient)" : "url(#chatGradient)"}
        filter="url(#glow)"
      />
      
      {/* Tail with gradient */}
      <path
        d="M16 20l2-2v2h-2z"
        fill={isActive ? "url(#activeGradient)" : "url(#chatGradient)"}
        filter="url(#glow)"
      />
      
      {/* Inner chat bubble for depth */}
      <path
        d="M18 4H6c-0.6 0-1 .4-1 1v10c0 0.6.4 1 1 1h11l3 3V5c0-0.6-0.4-1-1-1z"
        fill={isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}
      />
      
      {/* Chat dots for modern look */}
      <circle cx="8" cy="9" r="1" fill={isActive ? "#ffffff" : "rgba(255,255,255,0.8)"} />
      <circle cx="12" cy="9" r="1" fill={isActive ? "#ffffff" : "rgba(255,255,255,0.8)"} />
      <circle cx="16" cy="9" r="1" fill={isActive ? "#ffffff" : "rgba(255,255,255,0.8)"} />
    </SvgIcon>
  );
};

export default InvertedChatIcon;
