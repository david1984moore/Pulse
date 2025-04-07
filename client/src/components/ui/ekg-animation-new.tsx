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
  color = '#0db4c7',
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

  // Create a sleek, modern EKG pattern with a clean line and sophisticated rhythm
  const midY = height/2;
  const ekgPath = `
    M 0,${midY}
    L ${width*0.12},${midY}
    
    L ${width*0.15},${midY}
    L ${width*0.17},${midY-height*0.08}
    L ${width*0.18},${midY+height*0.04}
    L ${width*0.21},${midY}
    
    L ${width*0.24},${midY}
    L ${width*0.28},${midY}
    
    L ${width*0.32},${midY-height*0.05}
    L ${width*0.33},${midY-height*0.7}
    L ${width*0.34},${midY+height*0.3}
    L ${width*0.36},${midY}
    
    L ${width*0.42},${midY}
    L ${width*0.45},${midY}
    
    L ${width*0.5},${midY}
    L ${width*0.55},${midY}
    
    L ${width*0.60},${midY-height*0.1}
    L ${width*0.62},${midY-height*0.3}
    L ${width*0.64},${midY}
    
    L ${width*0.7},${midY}
    L ${width*0.78},${midY}
    
    L ${width*0.82},${midY}
    L ${width*0.84},${midY-height*0.15}
    L ${width*0.86},${midY+height*0.07}
    L ${width*0.88},${midY}
    
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
        filter: 'drop-shadow(0 0 6px rgba(13, 180, 199, 0.6))'
      }}
      className="ekg-wrapper"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        
        {/* Main EKG path - clean line */}
        <path
          className="ekg-path"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* First echo path - enhanced follow-through */}
        <path
          className="ekg-echo-1"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Second echo path - more distant follow-through */}
        <path
          className="ekg-echo-2"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Third echo path - furthest follow-through */}
        <path
          className="ekg-echo-3"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.3 }}
        />
        
        {/* Subtle particles at key points of the EKG trace */}
        <g className="ekg-particles">
          {[0.33, 0.62, 0.84].map((pos, i) => (
            <circle
              key={i}
              className={`ekg-particle-${i + 1}`}
              cx={width * pos}
              cy={midY}
              r="1.2"
              fill="white"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}