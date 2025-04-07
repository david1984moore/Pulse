import { useState, useEffect, useRef } from 'react';
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
  const [animationKey, setAnimationKey] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (runAnimation) {
      setIsVisible(false);

      setTimeout(() => {
        setAnimationKey(prev => prev + 1);
        setIsVisible(true);
      }, 50);

      // Wait for the animation and follow-through to completely finish
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 6000); // Total animation duration

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [runAnimation, onComplete]);

  if (!runAnimation || !isVisible) return null;

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
        {/* Main EKG path */}
        <path
          className="ekg-path"
          d={`
            M 0,${height/2}
            L ${width*0.2},${height/2}
            L ${width*0.25},${height/2-1}
            L ${width*0.3},${height/2+1}
            L ${width*0.35},${height/2}
            L ${width*0.4},${height/2}
            L ${width*0.45},${height/2-height*0.6}
            L ${width*0.5},${height/2+height*0.3}
            L ${width*0.55},${height/2}
            L ${width*0.7},${height/2}
            L ${width*0.85},${height/2}
            L ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* First echo path for follow-through */}
        <path
          className="ekg-echo-1"
          d={`
            M 0,${height/2}
            L ${width*0.2},${height/2}
            L ${width*0.25},${height/2-1}
            L ${width*0.3},${height/2+1}
            L ${width*0.35},${height/2}
            L ${width*0.4},${height/2}
            L ${width*0.45},${height/2-height*0.6}
            L ${width*0.5},${height/2+height*0.3}
            L ${width*0.55},${height/2}
            L ${width*0.7},${height/2}
            L ${width*0.85},${height/2}
            L ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Second echo path for more follow-through */}
        <path
          className="ekg-echo-2"
          d={`
            M 0,${height/2}
            L ${width*0.2},${height/2}
            L ${width*0.25},${height/2-1}
            L ${width*0.3},${height/2+1}
            L ${width*0.35},${height/2}
            L ${width*0.4},${height/2}
            L ${width*0.45},${height/2-height*0.6}
            L ${width*0.5},${height/2+height*0.3}
            L ${width*0.55},${height/2}
            L ${width*0.7},${height/2}
            L ${width*0.85},${height/2}
            L ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}