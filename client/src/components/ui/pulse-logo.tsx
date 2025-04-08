import React from 'react';
import { cn } from '@/lib/utils';

interface PulseLogoProps {
  className?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
}

export function PulseLogo({ 
  className, 
  textClassName, 
  size = 'md', 
  showText = true,
  animated = true
}: PulseLogoProps) {
  // Size mappings
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        {/* EKG Line in a circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-600 shadow-md flex items-center justify-center p-1.5">
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2,12 L6,12 L8,8 L10,17 L12,10 L14,14 L16,7 L18,12 L22,12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={animated ? "pulse-line" : ""}
            />
          </svg>
        </div>
        
        {/* Subtle pulsing ring animation */}
        {animated && (
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-primary/20" />
        )}
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600 tracking-tight", 
          textSizeClasses[size],
          textClassName
        )}>
          pulse
        </span>
      )}
    </div>
  );
}

// Export a simple SVG version that can be used as an icon
export function PulseIcon({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-full bg-gradient-to-r from-primary to-purple-600 p-1.5", className)}>
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M2,12 L6,12 L8,8 L10,17 L12,10 L14,14 L16,7 L18,12 L22,12" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="pulse-line"
        />
      </svg>
    </div>
  );
}