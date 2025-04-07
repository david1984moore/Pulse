/**
 * Super Simple EKG Animation
 * Uses a basic CSS animation that runs once and disappears
 */
import { useState, useEffect } from 'react';
import './ekg-animation.css';

interface EkgAnimationProps {
  runAnimation: boolean;
  onComplete?: () => void;
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#3b82f6',
  width = 160,
  height = 28
}: EkgAnimationProps) {
  // Key to force re-mount the component when animation restarts
  const [animationKey, setAnimationKey] = useState(0);
  
  // When runAnimation changes to true, restart the animation
  useEffect(() => {
    if (runAnimation) {
      // Increment key to force remount with fresh animation
      setAnimationKey(prev => prev + 1);
      
      // Wait for the animation to finish, then call onComplete
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [runAnimation, onComplete]);
  
  // Don't render anything if not animating
  if (!runAnimation) return null;
  
  return (
    <div
      key={animationKey}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
        marginTop: '2px'
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={`
            M 0,${height/2}
            L ${width*0.2},${height/2}
            Q ${width*0.25},${height/2-3} ${width*0.3},${height/2}
            L ${width*0.38},${height/2}
            L ${width*0.42},${height/2+3}
            L ${width*0.45},${height/2-height*0.6}
            L ${width*0.5},${height/2+height*0.2}
            L ${width*0.55},${height/2}
            Q ${width*0.65},${height/2-height*0.25} ${width*0.75},${height/2}
            L ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ekg-path"
        />
      </svg>
    </div>
  );
}