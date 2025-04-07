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
  color = '#6366f1',
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

  // Create a more sophisticated EKG pattern with multiple peaks for a more realistic trace
  const midY = height/2;
  const ekgPath = `
    M 0,${midY}
    L ${width*0.1},${midY}
    L ${width*0.12},${midY-2}
    L ${width*0.14},${midY+2}
    L ${width*0.16},${midY-1}
    L ${width*0.18},${midY+1}
    L ${width*0.2},${midY}
    L ${width*0.25},${midY}
    L ${width*0.26},${midY-height*0.25}
    L ${width*0.28},${midY+height*0.1}
    L ${width*0.3},${midY}
    L ${width*0.32},${midY-height*0.7}
    L ${width*0.34},${midY+height*0.4}
    L ${width*0.36},${midY}
    L ${width*0.4},${midY}
    L ${width*0.45},${midY-3}
    L ${width*0.46},${midY+3}
    L ${width*0.47},${midY-2}
    L ${width*0.48},${midY+2}
    L ${width*0.5},${midY}
    L ${width*0.55},${midY}
    L ${width*0.57},${midY-2}
    L ${width*0.58},${midY+2}
    L ${width*0.6},${midY}
    L ${width*0.65},${midY-height*0.3}
    L ${width*0.67},${midY+height*0.18}
    L ${width*0.7},${midY}
    L ${width*0.8},${midY}
    L ${width*0.9},${midY}
    L ${width},${midY}
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
        marginTop: '2px',
        filter: 'drop-shadow(0 0 6px rgba(129, 140, 248, 0.5))'
      }}
      className="ekg-wrapper"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glowing background path for added effect */}
        <defs>
          <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.1)" />
          </linearGradient>
        </defs>
        
        {/* Background glow effect */}
        <path
          className="ekg-bg"
          d={ekgPath}
          fill="none"
          stroke="url(#ekgGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.5"
        />
        
        {/* Main EKG path */}
        <path
          className="ekg-path"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* First echo path for follow-through */}
        <path
          className="ekg-echo-1"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Second echo path for more follow-through */}
        <path
          className="ekg-echo-2"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Small particles that follow the main point */}
        <g className="ekg-particles">
          {[0.32, 0.34, 0.65, 0.67].map((pos, i) => (
            <circle
              key={i}
              className={`ekg-particle-${i + 1}`}
              cx={width * pos}
              cy={midY}
              r="1.5"
              fill="white"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}