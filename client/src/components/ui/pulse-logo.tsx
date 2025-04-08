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
  animated = false
}: PulseLogoProps) {
  // Clean, minimal sizing for Y-Combinator aesthetic
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8'
  };

  // Modern, minimal text sizing
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Simple, clean icon */}
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        <div className="w-full h-full rounded-md bg-primary flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-white p-1.5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {/* Simple, clean text */}
      {showText && (
        <span className={cn(
          "font-sans font-medium text-primary", 
          textSizeClasses[size],
          textClassName
        )}>
          pulse
        </span>
      )}
    </div>
  );
}

// Export a standalone icon version
export function PulseIcon({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md bg-primary", className)}>
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full text-white p-1.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}