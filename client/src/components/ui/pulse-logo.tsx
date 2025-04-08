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
  // Size mappings with slightly larger dimensions
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        {/* Subtle outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md transform scale-110" />
        
        {/* EKG Line in a circle with enhanced gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-purple-600 to-violet-700 shadow-lg flex items-center justify-center p-1.5">
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
        
        {/* Enhanced pulsing ring animation */}
        {animated && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-primary/30" />
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-white/20 delay-150" />
          </>
        )}
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600 tracking-tight drop-shadow-sm", 
          textSizeClasses[size],
          textClassName
        )}>
          pulse
        </span>
      )}
    </div>
  );
}

// Export an enhanced SVG version that can be used as an icon
export function PulseIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative rounded-full shadow-lg", className)}>
      {/* Subtle outer glow */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md transform scale-110" />
      
      {/* Icon container with enhanced gradient */}
      <div className="relative rounded-full bg-gradient-to-br from-primary via-purple-600 to-violet-700 p-1.5">
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
    </div>
  );
}