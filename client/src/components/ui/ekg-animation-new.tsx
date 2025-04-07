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

  // Create a more complex and sexy EKG pattern with dramatic peaks and subtle details
  const midY = height/2;
  const ekgPath = `
    M 0,${midY}
    L ${width*0.08},${midY}
    L ${width*0.1},${midY-1}
    L ${width*0.11},${midY+1}
    L ${width*0.12},${midY-1}
    L ${width*0.13},${midY}
    
    L ${width*0.15},${midY}
    L ${width*0.17},${midY-height*0.15}
    L ${width*0.18},${midY+height*0.07}
    L ${width*0.19},${midY-height*0.05}
    L ${width*0.20},${midY}
    
    L ${width*0.25},${midY}
    L ${width*0.26},${midY-height*0.3}
    L ${width*0.28},${midY+height*0.15}
    L ${width*0.30},${midY}
    
    L ${width*0.32},${midY-height*0.1}
    L ${width*0.33},${midY-height*0.8}
    L ${width*0.34},${midY+height*0.5}
    L ${width*0.35},${midY-height*0.1}
    L ${width*0.36},${midY}
    
    L ${width*0.4},${midY}
    L ${width*0.43},${midY-height*0.1}
    L ${width*0.44},${midY-height*0.05}
    L ${width*0.46},${midY+height*0.08}
    L ${width*0.47},${midY-height*0.05}
    L ${width*0.48},${midY+height*0.05}
    L ${width*0.5},${midY}
    
    L ${width*0.55},${midY}
    L ${width*0.57},${midY-height*0.4}
    L ${width*0.59},${midY+height*0.2}
    L ${width*0.6},${midY}
    
    L ${width*0.65},${midY}
    L ${width*0.7},${midY-2}
    L ${width*0.75},${midY+2}
    L ${width*0.8},${midY-1}
    L ${width*0.85},${midY}
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
        filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.7))'
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
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
            <stop offset="50%" stopColor="rgba(14, 165, 233, 0.4)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
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