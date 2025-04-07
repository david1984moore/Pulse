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
      }, 3500); // Reduced animation duration

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [runAnimation, onComplete]);

  if (!runAnimation || !isVisible) return null;

  // Create a simplified, sleek EKG pattern with a clean trace
  const midY = height/2;
  const ekgPath = `
    M 0,${midY}
    L ${width*0.25},${midY}
    
    L ${width*0.35},${midY-height*0.1}
    L ${width*0.4},${midY-height*0.5}
    L ${width*0.45},${midY+height*0.2}
    L ${width*0.5},${midY}
    
    L ${width*0.65},${midY}
    
    L ${width*0.7},${midY-height*0.15}
    L ${width*0.75},${midY-height*0.05}
    L ${width*0.8},${midY}
    
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
        filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))'
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
          {[0.4, 0.7, 0.75].map((pos, i) => (
            <circle
              key={i}
              className={`ekg-particle-${i + 1}`}
              cx={width * pos}
              cy={pos === 0.4 ? midY-height*0.5 : (pos === 0.7 ? midY-height*0.15 : midY-height*0.05)}
              r="1"
              fill="white"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}