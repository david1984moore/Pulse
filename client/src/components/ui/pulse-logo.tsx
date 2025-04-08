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

  // Modernized text sizing for a more startup-like appearance
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
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
        <div className="relative inline-block">
          {/* Subtle text outline effect for depth */}
          <span 
            className={cn(
              "absolute pulse-text select-none text-transparent bg-clip-text bg-white/5 blur-[0.3px] transform scale-101 -translate-y-[0.5px] translate-x-[0.5px]", 
              textSizeClasses[size],
              textClassName
            )}
            aria-hidden="true"
          >
            <span>p</span><span>u</span><span>l</span><span>s</span><span>e</span>
          </span>

          {/* Main text with premium multi-directional gradient */}
          <span 
            className={cn(
              "pulse-text relative select-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/95 to-primary/85", 
              textSizeClasses[size],
              textClassName
            )}
          >
            <span>p</span><span>u</span><span>l</span><span>s</span><span>e</span>
          </span>
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
          className="w-full h-full text-white relative z-10 animate-subtle-pulse"
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