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
  showText = true, // Default to showing text as requested
  animated = true
}: PulseLogoProps) {
  // Size mappings with larger dimensions for more visibility
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        {/* Enhanced outer glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg transform scale-125" />
        
        {/* Additional glow ring */}
        <div className="absolute inset-0 rounded-full bg-white/20 blur-md transform scale-115" />
        
        {/* EKG Line in a circle with a consistent gradient - fixed color transition issues */}
        <div className="absolute inset-0 rounded-full bg-primary shadow-xl flex items-center justify-center p-1.5">
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2,12 L6,12 L8,8 L10,17 L12,10 L14,14 L16,7 L18,12 L22,12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={animated ? "pulse-line" : ""}
            />
          </svg>
        </div>
        
        {/* Enhanced pulsing ring animations - fixed to use consistent colors */}
        {animated && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-primary/40" />
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-white/30 delay-150" />
          </>
        )}
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary tracking-tight drop-shadow-md", 
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
    <div className={cn("relative rounded-full shadow-xl", className)}>
      {/* Enhanced outer glow */}
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg transform scale-125" />
      
      {/* Additional glow ring */}
      <div className="absolute inset-0 rounded-full bg-white/20 blur-md transform scale-115" />
      
      {/* Icon container with consistent color */}
      <div className="relative rounded-full bg-primary p-1.5">
        <svg 
          viewBox="0 0 24 24" 
          className="w-full h-full text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M2,12 L6,12 L8,8 L10,17 L12,10 L14,14 L16,7 L18,12 L22,12" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="pulse-line"
          />
        </svg>
      </div>
    </div>
  );
}