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
  animated = false // Default to static as requested
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
      {/* Static Logo Circle */}
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg transform scale-125" />
        
        {/* Purple circle background */}
        <div className="absolute inset-0 rounded-full bg-primary shadow-md flex items-center justify-center p-1.5">
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
            />
          </svg>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/80 tracking-tight", 
            textSizeClasses[size],
            textClassName
          )}>
            pulse
          </span>
          {/* Add a subtle line under the text */}
          <div className="h-0.5 w-3/4 bg-gradient-to-r from-primary/80 to-transparent rounded-full mt-0.5"></div>
        </div>
      )}
    </div>
  );
}

// Export a static icon version
export function PulseIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative rounded-full shadow-md", className)}>
      {/* Subtle glow */}
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg transform scale-125" />
      
      {/* Purple circle with white EKG line */}
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
          />
        </svg>
      </div>
    </div>
  );
}