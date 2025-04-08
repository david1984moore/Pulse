import { useState, useEffect } from 'react';
import EkgTrace from './ekg-trace';
import './ekg-animation.css';

interface AliceEcgProps {
  active: boolean;
  color?: string;
}

/**
 * Alice ECG animation component that uses the guaranteed reliable EkgTrace
 */
export default function AliceEcg({ active, color = "#FFFFFF" }: AliceEcgProps) {
  // Use a state to force remounting of the component
  const [key, setKey] = useState(0);
  
  // Reset the component completely on activation change
  useEffect(() => {
    if (active) {
      // Force remount by changing key
      setKey(prevKey => prevKey + 1);
    }
  }, [active]);
  
  // Scale the animation to fit in the header area
  const width = 100;
  const height = 28;
  
  // Mini version of the EKG path specifically for the header
  const ekgPath = `M 0,${height/2} 
    L 20,${height/2} 
    L 25,${height/2 - 2} 
    L 30,${height/2 + 2} 
    L 35,${height/2} 
    L 40,${height/2} 
    L 45,${height/2 - 8} 
    L 50,${height/2 + 10} 
    L 55,${height/2} 
    L 65,${height/2 - 3} 
    L 70,${height/2 + 3} 
    L 75,${height/2} 
    L 100,${height/2}`;
  
  return (
    <div 
      className="inline-flex items-center justify-center overflow-hidden ml-2"
      style={{ 
        position: 'relative',
        width: width,
        height: height,
      }}
    >
      {active && (
        <div 
          className="absolute inset-0 w-full h-full"
          key={`alice-ecg-${key}`} // Force remount on key change
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${width} ${height}`}
            className="transition-opacity duration-300"
          >
            {/* Shadow path with glow effect */}
            <path
              d={ekgPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 200,
                strokeDashoffset: 200,
                animation: 'ekg-dash 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                filter: 'blur(2px)'
              }}
            />
            
            {/* Main bright visible path */}
            <path
              d={ekgPath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 200,
                strokeDashoffset: 200,
                animation: 'ekg-dash 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
            
            {/* Glowing dot that follows the path */}
            <circle
              r={2.5}
              fill="white"
              style={{
                filter: 'drop-shadow(0 0 3px white)',
                animation: 'ekg-dot 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            >
              {/* Motion path animation for the dot */}
              <animateMotion
                dur="1.2s"
                repeatCount="1"
                keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1"
                keyPoints="0; 0.15; 0.35; 0.6; 0.85; 1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                path={ekgPath}
              />
            </circle>
          </svg>
        </div>
      )}
    </div>
  );
}