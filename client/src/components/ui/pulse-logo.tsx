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

  // Bold, impactful text sizing for a premium startup appearance
  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Enhanced Logo Circle with premium finish */}
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        {/* Outer glow effect - more pronounced for premium look */}
        <div className="absolute inset-0 rounded-full bg-primary/40 blur-lg transform scale-130"></div>
        
        {/* Subtle highlight edge for depth */}
        <div className="absolute inset-0 rounded-full bg-white/20 transform scale-105 backdrop-blur-sm"></div>
        
        {/* Main purple circle with gradient background for premium look */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/90 shadow-md flex items-center justify-center p-1.5">
          {/* Inner highlight for 3D effect */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-60 pointer-events-none"></div>
          
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-white relative z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle glow effect under the main path */}
            <path 
              d="M2,12 L6,12 L8,8 L10,17 L12,10 L14,14 L16,7 L18,12 L22,12" 
              fill="none" 
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Main path with better thickness for modern look */}
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
        <div className="relative">
          {/* Subtle backdrop blur for depth behind text */}
          <div className="absolute inset-0 blur-[2px] opacity-10 bg-primary/30 rounded-md transform scale-110" />
          
          {/* Main pulse text with enhanced premium gradient */}
          <span className={cn(
            "pulse-text relative text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-primary/90", 
            textSizeClasses[size],
            textClassName
          )}>
            pulse
          </span>
          
          {/* Subtle tech accent mark - small "datapoint" inspired element */}
          <div className="absolute bottom-1 right-0 transform translate-y-1 flex items-center gap-0.5">
            <span className="w-1 h-1 rounded-full bg-purple-600"></span>
            <span className="w-0.5 h-3 rounded-full bg-gradient-to-b from-purple-500 to-primary/60"></span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export a static icon version with enhanced premium look
export function PulseIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative rounded-full shadow-md", className)}>
      {/* Enhanced outer glow */}
      <div className="absolute inset-0 rounded-full bg-primary/40 blur-lg transform scale-130" />
      
      {/* Subtle highlight edge for depth */}
      <div className="absolute inset-0 rounded-full bg-white/20 transform scale-105 backdrop-blur-sm"></div>
      
      {/* Premium gradient background */}
      <div className="relative rounded-full bg-gradient-to-br from-primary to-primary/90 p-1.5">
        {/* Inner highlight for 3D effect */}
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-60 pointer-events-none"></div>
        
        <svg 
          viewBox="0 0 24 24" 
          className="w-full h-full text-white relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle glow effect under the main path */}
          <path 
            d="M2,12 L6,12 L8,8 L10,17 L12,10 L14,14 L16,7 L18,12 L22,12" 
            fill="none" 
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Main path with better thickness for modern look */}
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