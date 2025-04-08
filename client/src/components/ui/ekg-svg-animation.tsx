import React, { useEffect, useState } from 'react';
import './ekg-animation.css';

interface EkgSvgAnimationProps {
  active: boolean;
  width?: number;
  height?: number;
  lineColor?: string;
  strokeWidth?: number;
}

export default function EkgSvgAnimation({
  active,
  width = 800,
  height = 150,
  lineColor = "#FFFFFF",
  strokeWidth = 3
}: EkgSvgAnimationProps) {
  const [key, setKey] = useState(0); // Used to force re-render and restart animation
  
  // Reset the animation completely when active state changes
  useEffect(() => {
    // Using a very short timeout to ensure complete clean restart
    const timer = setTimeout(() => {
      // This increments the key which forces React to remount the component
      // Each increment creates a fresh instance of the SVG with new animations
      setKey(prevKey => prevKey + 1);
    }, 50);
    
    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div 
      className="ekg-svg-animation" 
      key={key}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      <svg 
        width="100%" 
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ECG Path with animation */}
        {/* Shadow path for glow effect */}
        <path
          d={`M 0,${height/2} 
              L 100,${height/2} 
              L 120,${height/2 - 5} 
              L 140,${height/2 + 5} 
              L 160,${height/2} 
              L 180,${height/2} 
              L 200,${height/2} 
              L 220,${height/2 - 40} 
              L 240,${height/2 + 50} 
              L 260,${height/2} 
              L 280,${height/2} 
              L 300,${height/2 - 10} 
              L 320,${height/2 + 10} 
              L 340,${height/2} 
              L 800,${height/2}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'ekg-dash 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            filter: 'blur(8px)'
          }}
        />
        
        {/* Main visible path */}
        <path
          d={`M 0,${height/2} 
              L 100,${height/2} 
              L 120,${height/2 - 5} 
              L 140,${height/2 + 5} 
              L 160,${height/2} 
              L 180,${height/2} 
              L 200,${height/2} 
              L 220,${height/2 - 40} 
              L 240,${height/2 + 50} 
              L 260,${height/2} 
              L 280,${height/2} 
              L 300,${height/2 - 10} 
              L 320,${height/2 + 10} 
              L 340,${height/2} 
              L 800,${height/2}`}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'ekg-dash 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}
        />
        
        {/* Glowing dot that follows the path */}
        <circle
          r={6}
          fill="white"
          style={{
            filter: 'drop-shadow(0 0 8px white)',
            animation: 'ekg-dot 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}
        >
          {/* Motion path animation for the dot */}
          <animateMotion
            dur="3.5s"
            repeatCount="1"
            keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1"
            keyPoints="0; 0.15; 0.35; 0.6; 0.85; 1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            path={`M 0,${height/2} 
                  L 100,${height/2} 
                  L 120,${height/2 - 5} 
                  L 140,${height/2 + 5} 
                  L 160,${height/2} 
                  L 180,${height/2} 
                  L 200,${height/2} 
                  L 220,${height/2 - 40} 
                  L 240,${height/2 + 50} 
                  L 260,${height/2} 
                  L 280,${height/2} 
                  L 300,${height/2 - 10} 
                  L 320,${height/2 + 10} 
                  L 340,${height/2} 
                  L 800,${height/2}`}
          />
        </circle>
      </svg>
    </div>
  );
}