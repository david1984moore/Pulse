
/**
 * EKG Animation with Dot-to-Line Effect
 * Animation starts as a dot and extends into a line with follow-through effect
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
      
      // Wait for the animation and follow-through to completely finish
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3400); // 1.7s for drawing + 1.6s for follow-through + 0.1s buffer
      
      return () => clearTimeout(timer);
    }
  }, [runAnimation, onComplete]);
  
  // Don't render anything if not animating
  if (!runAnimation) return null;
  
  // Simplified path definition for a cleaner EKG trace
  const ekgPathData = `
    M 0,${height/2}
    L ${width*0.2},${height/2}
    L ${width*0.3},${height/2}
    L ${width*0.4},${height/2}
    L ${width*0.45},${height/2-height*0.6}
    L ${width*0.5},${height/2+height*0.3}
    L ${width*0.55},${height/2}
    L ${width*0.7},${height/2}
    L ${width},${height/2}
  `;

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
        {/* Primary EKG trace line */}
        <path
          d={ekgPathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ekg-dot-to-line"
        />
        
        {/* Follow-through effect trace - same path but different animation */}
        <path
          d={ekgPathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ekg-follow-through"
        />
      </svg>
    </div>
  );
}
