import React, { useEffect, useRef } from 'react';
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
  animated = true // Default to animated now for that cool factor
}: PulseLogoProps) {
  const pathRef = useRef<SVGPathElement>(null);
  
  // Elegant sizing for Y-Combinator aesthetic
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  // Futuristic text sizing - optimal proportions
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  // Subtle animation for the heartbeat effect when animated is true
  useEffect(() => {
    if (animated && pathRef.current) {
      const animate = () => {
        const path = pathRef.current;
        if (!path) return;
        
        // Recreate the animation if user navigates away and back
        const keyframes = [
          { strokeDashoffset: 60 },
          { strokeDashoffset: 0 },
        ];
        
        const timing = {
          duration: 1500,
          iterations: 1,
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)'
        };
        
        path.style.strokeDasharray = '60';
        const animation = path.animate(keyframes, timing);
        
        animation.onfinish = () => {
          // Subtle heartbeat pulse at the end that repeats
          const pulseKeyframes = [
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
          ];
          
          const pulseTiming = {
            duration: 800,
            iterations: 1,
            easing: 'ease-in-out'
          };
          
          const iconContainer = path.closest('div')?.parentElement;
          if (iconContainer) {
            iconContainer.animate(pulseKeyframes, pulseTiming);
          }
        };
      };
      
      // Run animation once on mount
      animate();
      
      // Set up interval for subtle pulse animation
      const interval = setInterval(() => {
        const iconContainer = pathRef.current?.closest('div')?.parentElement;
        if (iconContainer) {
          const pulseKeyframes = [
            { transform: 'scale(1)' },
            { transform: 'scale(1.02)' },
            { transform: 'scale(1)' }
          ];
          
          const pulseTiming = {
            duration: 2000,
            iterations: 1,
            easing: 'ease-in-out'
          };
          
          iconContainer.animate(pulseKeyframes, pulseTiming);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [animated]);

  return (
    <div className={cn('flex items-center gap-3.5', className)}>
      {/* Elegant icon with subtle shadow */}
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        <div className="w-full h-full rounded-md bg-primary shadow-sm flex items-center justify-center relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          
          {/* Very subtle inner border for depth */}
          <div className="absolute inset-0 border border-white/10 rounded-md"></div>
          
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-white p-1.5 relative z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background path for a subtle effect */}
            <path 
              d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12" 
              fill="none" 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="absolute"
            />
            
            {/* Main path with animation */}
            <path 
              ref={pathRef}
              d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="relative z-10"
            />
          </svg>
        </div>
      </div>
      
      {/* Clean futuristic text treatment */}
      {showText && (
        <div className="relative">
          <span className={cn(
            "pulse-text font-sans relative", 
            textSizeClasses[size],
            textClassName
          )}>
            pulse
          </span>
          {/* Futuristic accent elements */}
          <div className="absolute -right-1.5 top-0 w-1.5 h-1.5 bg-primary rounded-sm"></div>
          <div className="absolute right-0 -bottom-1 w-5 h-[2px] bg-primary/30"></div>
        </div>
      )}
    </div>
  );
}

// Export a standalone icon version
export function PulseIcon({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md bg-primary shadow-sm relative overflow-hidden", className)}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      
      {/* Very subtle inner border for depth */}
      <div className="absolute inset-0 border border-white/10 rounded-md"></div>
      
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full text-white p-1.5 relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background path for a subtle effect */}
        <path 
          d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12" 
          fill="none" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="absolute"
        />
        
        {/* Main path */}
        <path 
          d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="relative z-10"
        />
      </svg>
    </div>
  );
}